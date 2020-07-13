import ROUTES from 'constants/routes';
import CONSTANTS from 'constants/test';

import { reverse } from 'named-urls';

const faker = require('faker');
const puppeteer = require('puppeteer');

let browser;
let page;
const site = CONSTANTS.SITE;

beforeAll(async () => {
    // launch browser
    browser = await puppeteer.launch({
        headless: false // headless mode set to false so browser opens up with visual feedback
        //slowMo: 250, // how slow actions should be
    });
    // creates a new page in the opened browser
    page = await browser.newPage();
});

describe('Search', () => {
    test('enter search query in site header', async () => {
        await page.goto(site + ROUTES.HOME);
        await page.waitForSelector('[data-testid="headerSearchInput"]');
        await page.click('[data-testid="headerSearchInput"]');
        await page.type('[data-testid="headerSearchInput"]', faker.lorem.word());
        await page.click('[data-testid="headerSearchSubmit"]');
        await page.waitForSelector('[data-testid="searchResults"]');
    }, 1600000);

    test('goto search page with query in url', async () => {
        const searchQuery = faker.lorem.word();
        await page.goto(site + reverse(ROUTES.SEARCH, { searchTerm: searchQuery }));
        const input = await page.$eval('[data-testid="searchQuery"]', e => e.value);
        await expect(input).toMatch(searchQuery);
    }, 1600000);

    test('select first filter', async () => {
        await page.click('[data-testid="searchFilters"]');
    }, 1600000);
});

// This function occurs after the result of each tests, it closes the browser
afterAll(() => {
    browser.close();
});
