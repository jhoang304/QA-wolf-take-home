// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const fs = require('fs-extra'); // for file system operations

async function saveHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();



  // ========================MY CODE=================================================================================================================
  // Add a try/catch block to handle any errors that occur when launching the browser.
  try {
    // go to Hacker News
    await page.goto('https://news.ycombinator.com');
  } catch (error) {
    await browser.close();
    console.log('Error launching browser:', error.message);
    return;
  }

  // Make sure to wait for the 'tr.athing' elements to be loaded.
  await page.waitForSelector('tr.athing');

  const articles = await page.evaluate(() => {
    const extractedArticles = [];
    const rows = Array.from(document.querySelectorAll('tr.athing'));
    for (let row of rows) {
      // Extract the title and URL from each row.
      const titleElement = row.querySelector('span.titleline a');
      const title = titleElement?.innerText ?? 'No Title';
      const url = titleElement?.href ?? 'No URL';
      // If the title and URL are not 'No Title' and 'No URL', add them to the array.
      if (title !== 'No Title' && url !== 'No URL') {
        extractedArticles.push({
          title,
          url
        });
      }
      // Only save the first 10 articles.
      if (extractedArticles.length >= 10) {
        break;
      }
    }
    return extractedArticles;
  });

  await saveArticlesToCSV(articles);

  await browser.close();
}

// Function to save the articles to a CSV file.
async function saveArticlesToCSV(articles) {
  const header = 'Title,URL\n';
  const csvContent = articles
    .map(article => {
      let { title, url } = article;
      // The entire string is enclosed in quotes to ensure it's seen as one CSV field.
      return `"${title.replace(/"/g, '""')}","${url}"`;
    })
    .join('\n');
  // Checking to make sure there are articles in the array before saving to CSV.
  try {
    if (csvContent) {
      console.log(`${articles.length} articles saved to CSV.`);
      // Creates a new file named 'articles.csv' with the header and content.
      await fs.outputFile('articles.csv', header + csvContent);
    } else {
      console.log('No articles were captured.');
    }
  } catch (error) {
    console.log('Error saving articles to CSV:', error.message);
  }
}
// ========================MY CODE=================================================================================================================

(async () => {
  await saveHackerNewsArticles();
})();
