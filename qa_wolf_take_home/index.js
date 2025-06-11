// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const fs = require('fs-extra');
const prompt = require('prompt-sync')();

async function saveHackerNewsArticles(numArticles = 10) {
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

  // Retrieve top N articles
  try {
    articles = await retrieveArticles(page, numArticles);
  } catch (error) {
    console.log('Error during page evaluation:', error.message);
    await browser.close();
    return;
  }

  // Save articles to CSV
  try {
    await saveArticlesToCSV(articles);
  } catch (error) {
    console.log('Error saving articles to CSV:', error.message);
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
  Returns: An array of objects, each containing the title, URL, points, author, and number of comments of an article.
*/
async function retrieveArticles(page, numArticles) {
  const extractedArticles = [];

  while (extractedArticles.length < numArticles) {
    const newArticles = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr.athing'));
      const articles = [];
      for (let row of rows) {
        const titleElement = row.querySelector('span.titleline a');
        const title = titleElement?.innerText ?? undefined;
        const url = titleElement?.href ?? undefined;

        const subtext = row.nextElementSibling.querySelector('.subtext');
        const points = subtext.querySelector('.score')?.innerText.trim() ?? '0 points';
        const author = subtext.querySelector('.hnuser')?.innerText.trim() ?? 'unknown';

        const commentsElement = subtext.querySelectorAll('a[href*="item?id="]');
        let comments = commentsElement.length >= 2 ? commentsElement[1].innerText.trim() : '0 comments';
        if (comments.toLowerCase() === 'discuss') {
          comments = '0 comments';
        }

        articles.push({
          title,
          url,
          points,
          author,
          comments
        });
      }
      return articles;
    });

    extractedArticles.push(...newArticles);

    if (extractedArticles.length < numArticles) {
      const moreLink = await page.$('a.morelink');
      if (moreLink) {
        await moreLink.click();
        await page.waitForTimeout(2000); // Wait for the next page to load
      } else {
        break; // No more pages to load
      }
    }
  }

  return extractedArticles.slice(0, numArticles);
}


/*
  Function to save the articles to a CSV file.
  Parameters:
    articles: An array of objects, each containing the title, URL, points, author, and number of comments of an article.
  Returns: None
*/
async function saveArticlesToCSV(articles) {
  const header = 'Title,URL,Points,Author,Number of Comments\n';

  // Formats the article data into a CSV string
  const format = (title, url, points, author, comments) => {
    comments = comments.replace(/&nbsp;/g, ' ').replace(/comments/gi, '').replace(/comment/gi, '').trim();
    points = points.replace(/ points/gi, '').trim();
    return `"${title.replace(/"/g, '""')}","${url.replace(/"/g, '""')}","${points}","${author.replace(/"/g, '""')}","${comments.replace(/"/g, '""')}"`;
  };

  const csvContent = articles
    .map(article => {
      let { title, url, points, author, comments } = article;
      return format(title, url, points, author, comments);
    })
    .join('\n');

  try {
    if (csvContent) {
      await fs.outputFile('articles.csv', header + csvContent + '\n');
      console.log(`${articles.length} articles saved to CSV.`);
    } else {
      console.log('No articles were captured.');
    }
  } catch (error) {
    console.log('Error saving articles to CSV:', error.message);
  }
}

if (require.main === module) {
  (async () => {
    const numArticles = parseInt(prompt('Enter the number of articles to save (default is 10): '), 10) || 10;
    await saveHackerNewsArticles(numArticles);
  })();
}

module.exports = { saveHackerNewsArticles };
