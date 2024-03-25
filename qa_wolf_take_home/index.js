// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const fs = require('fs-extra'); // for file system operations

async function saveHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto('https://news.ycombinator.com');

  // Adding a delay to ensure all elements are loaded in order
  await page.waitForTimeout(5000);

  // Make sure to wait for the '.athing' elements to be loaded.
  await page.waitForSelector('span.titleline a');

  const articles = await page.evaluate(() => {
    // Select the first 10 'tr.athing' elements
    const rows = Array.from(document.querySelectorAll('tr.athing')).slice(0, 10);
    return rows.map(row => {
      // Within each 'tr', the title is in 'span.titleline a'
      const titleElement = row.querySelector('span.titleline a');
      const title = titleElement ? titleElement.innerText : 'No Title';
      const url = titleElement ? titleElement.href : 'No URL';
      return { title, url };
    });
  });

  // Log articles for debugging
  console.log(articles);

  if (articles.length > 0) {
    await saveArticlesToCSV(articles);
    console.log('Articles saved to CSV.');
  } else {
    console.log('No articles were captured.');
  }

  await browser.close();
}

async function saveArticlesToCSV(articles) {
  const header = 'Title, URL\n';
  const csvContent = articles
    .map((article, index) => {
      // Concatenate the rank with a period, a space, and the title, escaping quotes in the title.
      // The entire string is enclosed in quotes to ensure it's seen as one CSV field.
      const titleWithRank = `"${index + 1}. ${article.title.replace(/"/g, '""')}"`;
      // Enclose the URL in quotes.
      const url = `"${article.url}"`;
      // Return the concatenated string without a comma after the rank.
      return `${titleWithRank}, ${url}`;
    })
    .join('\n');
  await fs.outputFile('articles.csv', header + csvContent);
}

(async () => {
  await saveHackerNewsArticles();
})();
