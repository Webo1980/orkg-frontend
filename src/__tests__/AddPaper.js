import ROUTES from 'constants/routes';
import CONSTANTS from 'constants/test';

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

describe('Add paper', () => {
    test('enter doi', async () => {
        await page.goto(site + ROUTES.ADD_PAPER.GENERAL_DATA);
        await page.waitForSelector('[data-testid="paperDoi"]');
        await page.click('[data-testid="paperDoi"]');
        await page.type('[data-testid="paperDoi"]', 'https://doi.org/10.1016/j.future.2013.01.010');
    }, 1600000);

    test('lookup doi', async () => {
        await page.click('[data-testid="handleLookup"]');
        await page.waitForSelector('[data-testid="lookupResult"]');
    }, 1600000);

    test('go to next step', async () => {
        await page.click('[data-testid="nextStep"]');
    }, 1600000);
});

// This function occurs after the result of each tests, it closes the browser
afterAll(() => {
    browser.close();
});
