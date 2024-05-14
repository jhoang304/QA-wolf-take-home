// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const fs = require('fs-extra');

async function saveHackerNewsArticles() {
  let articles = [];
  const url = 'https://news.ycombinator.com/';

  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News
  try {
    await page.goto(url);
  } catch (error) {
    console.log('Error launching browser:', error.message);
    await browser.close();
    return;
  }

  // Wait for articles to load
  try {
    await page.waitForSelector('tr.athing', { timeout: 5000 });
  } catch (error) {
    console.log("Error while waiting for articles to load: ", error.message);
    await browser.close();
    return;
  }

  // Retrieve top 10 articles
  try {
    articles = await retrieveArticles(page);
  } catch (error) {
    console.log('Error during page evaluation:', error.message);
    await browser.close();
    return;
  }

  // Save articles to CSV
  try {
    await saveArticlesToCSV(articles);
  } catch (error) {
    console.log('Error saving articles to CSV: ', error.message);
    await browser.close();
    return;
  }

  await browser.close();
  return articles;
}


/*
  Function to retrieve the top 10 articles from the Hacker News page.
  Parameters:
    page: The Playwright page object to evaluate.
  Returns: An array of objects, each containing the title and URL of an article.
*/
async function retrieveArticles(page) {
    return await page.evaluate(() => {
      const extractedArticles = [];
      const rows = Array.from(document.querySelectorAll('tr.athing'));
      // Extract the title and URL from each row.
      for (let row of rows) {
        const titleElement = row.querySelector('span.titleline a');
        const title = titleElement?.innerText ?? undefined;
        const url = titleElement?.href ?? undefined;
        extractedArticles.push({
          title,
          url
        });

        // Only save the first 10 articles.
        if (extractedArticles.length >= 10) {
          break;
        }
      }
      return extractedArticles;
    });
}

/*
  Function to save the articles to a CSV file.
  Parameters:
    articles: An array of objects, each containing the title and URL of an article.
  Returns: None
*/
async function saveArticlesToCSV(articles) {
  const header = 'Title,URL\n';
  // The entire string is enclosed in quotes to ensure it's seen as one CSV field.
  const format = (title, url) => `"${title.replace(/"/g, '""')}","${url}"`;
  const csvContent = articles
    .map(article => {
      let { title, url } = article;
      return format(title, url);
    })
    .join('\n');
  // Checking to make sure there are articles in the array before saving to CSV.
  try {
    if (csvContent) {
      // Creates a new file named 'articles.csv' with the header and content.
      await fs.outputFile('articles.csv', header + csvContent);
      console.log(`${articles.length} articles saved to CSV.`);
    } else {
      console.log('No articles were captured.');
    }
  } catch (error) {
    console.log('Error saving articles to CSV:', error.message);
  }
}


(async () => {
  await saveHackerNewsArticles();
})();

module.exports = { saveHackerNewsArticles };
