const { test, expect } = require('@playwright/test');
const { saveHackerNewsArticles } = require('../index');
const fs = require('fs-extra');

test('should fetch exactly 10 articles', async ({ page }) => {
    // console.log('Test started...');
    // await page.goto('https://news.ycombinator.com/');
    const articles = await saveHackerNewsArticles();
    await expect(articles.length).toBe(10);
    // console.log('Test finished.');
});

// function createPage() {
//     const { chromium } = require("playwright");
//     return chromium.launch().then(browser => browser.newPage());
// }

// test('navigate to hacker news', async ({ page }) => {
//   await page.goto('https://news.ycombinator.com/');
//   const name = await page.innerText('.navbar__title');
//   expect(name).toBe('Hacker News');
// });
