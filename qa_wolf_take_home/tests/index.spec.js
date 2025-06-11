const { test, expect } = require('@playwright/test');
const { saveHackerNewsArticles } = require('../index');
const fs = require('fs-extra');

test('should fetch exactly 10 articles', async () => {
    const articles = await saveHackerNewsArticles();
    expect(articles.length).toBe(10);
});

test('should fetch articles with title, url, points, author, and comments', async () => {
    const articles = await saveHackerNewsArticles();
    articles.forEach(article => {
        expect(article.title).toBeDefined();
        expect(article.url).toBeDefined();
        expect(article.points).toBeDefined();
        expect(article.author).toBeDefined();
        expect(article.comments).toBeDefined();
    });
});

test('should save articles to CSV', async () => {
    await saveHackerNewsArticles();
    const fileExists = await fs.pathExists('articles.csv');
    expect(fileExists).toBe(true);
    await fs.remove('articles.csv');
});

test('should fetch the specified number of articles', async () => {
    const numArticles = 5;
    const articles = await saveHackerNewsArticles(numArticles);
    expect(articles.length).toBe(numArticles);
});

test('should not save articles to CSV if no articles are fetched', async () => {
    await fs.remove('articles.csv');
    const articles = await saveHackerNewsArticles(0);
    const fileExists = await fs.pathExists('articles.csv');
    expect(articles.length).toBe(0);
    expect(fileExists).toBe(false);
});


