const { chromium } = require('playwright');

let browser;

async function getBrowser() {
    if (!browser) {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browser;
}

const scrapeTESDA = async (lastName, firstName, certFirstFour, certLastFour) => {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.tesda.gov.ph/Rwac/Rwac2017', { timeout: 60000 });
    await page.waitForSelector('iframe');

    const iframeElement = await page.locator('iframe');
    const frame = await iframeElement.contentFrame();

    if (!frame) {
        await context.close();
        return { success: false, data: null, error: 'No iframe found' };
    }

    // Fill form
    await frame.getByRole('textbox', { name: 'Last Name' }).fill(lastName);
    await frame.getByRole('textbox', { name: 'First Name' }).fill(firstName);
    await frame.getByRole('textbox', { name: 'First Four of Certificate' }).fill(certFirstFour);
    await frame.getByRole('textbox', { name: 'Last Four of Certificate' }).fill(certLastFour);
    await frame.getByRole('button', { name: 'Search' }).click();

    // Wait until result table or "No Data Found" appears
    await frame.waitForSelector('table tr, text=No Data Found', { timeout: 15000 });

    if (await frame.locator('text=No Data Found').isVisible().catch(() => false)) {
        await context.close();
        return { success: true, data: null };
    }

    // Extract rows
    const rows = await frame.locator('table tr').all();
    const results = [];
    for (let i = 1; i < rows.length; i++) {
        const cells = await rows[i].locator('td').allTextContents();
        results.push(cells.map(cell => cell.trim()));
    }

    await context.close();
    return { success: true, data: results };
};

module.exports = scrapeTESDA;
