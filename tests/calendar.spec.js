// @ts-check
const { test, expect } = require('@playwright/test');

test('get start page', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/index.html');
    await expect(page).toHaveTitle(/Calendar Widget/);
});

test.describe('Base calendar view', () => {
    let today;
    test.beforeEach(async ({ page }) => {
        await page.goto('http://127.0.0.1:5500/index.html');
        today = new Date();
    });

    test('has current month and year', async ({ page }) => {
        const monthStr = today.toLocaleDateString('en-US', { month: 'long' });
        const year = today.getFullYear();
        const monthSelectBtn = page.locator('.up-cal__date-month-year');
        await expect(monthSelectBtn).toHaveText(`${monthStr} ${year}`);
    });

    test('has months navitaion buttons', async ({ page }) => {
        const prevMonthBtn = page.locator('.up-cal__month-prev');
        const nextMonthBtn = page.locator('.up-cal__month-next');
        await expect(prevMonthBtn).toBeVisible();
        await expect(nextMonthBtn).toBeVisible();
        // TODO: check it
        const nextMonthBtn1 = page.locator('.up-cal__month-next1');
        // await expect(nextMonthBtn1).toBeVisible();
    });

    test('has weekdays', async ({ page }) => {
        const weekdaysEl = await page.$('.up-cal__weekdays');
        expect(await weekdaysEl?.$$eval('.up-cal__weekday', (nodes) => nodes.map((n) => n.innerText))).toEqual([
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
        ]);
    });

    test('has current month dates', async ({ page }) => {
        const currentMonthDates = [];
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let i = 0; i < daysInMonth; i++) {
            currentMonthDates.push(i + 1 + '');
        }
        const currentMonth = await page.$('.up-cal__month-item');
        expect(await currentMonth?.$$eval('.up-cal__day', (nodes) => nodes.map((n) => n.innerText))).toEqual(
            currentMonthDates
        );
    });

    test('has highlighted today', async ({ page }) => {
        const today = page.locator('.up-cal__day-current');
        await expect(today).toHaveClass(/up-cal__day-active/);
    });

    test('has selected today', async ({ page }) => {
        const todayEl = page.locator('.up-cal__day-current');
        await expect(todayEl).toHaveText(today.getDate() + '');
    });

    test('has ability to select date', async ({ page }) => {
        const newDate = today.getDate() !== 15 ? 15 : 14;
        const dateStr = `${today.getFullYear()}-${today.getMonth()}-${newDate}`;
        const someDayAtCalendar = await page.locator('[data-date="' + dateStr + '"]');
        someDayAtCalendar.click();
        await expect(someDayAtCalendar).toHaveClass(/up-cal__day-active/);
    });

    test('has ability to change month to next', async ({ page }) => {
        let newDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newDate.setMonth(newDate.getMonth() + 1);
        const monthStr = newDate.toLocaleDateString('en-US', { month: 'long' });
        const year = newDate.getFullYear();
        await page.locator('.up-cal__month-next').click();
        const monthSelectBtn = await page.locator('.up-cal__date-month-year').last();
        await expect(monthSelectBtn).toHaveText(`${monthStr} ${year}`);
    });

    test('has ability to change month to previous', async ({ page }) => {
        let newDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newDate.setMonth(newDate.getMonth() - 1);
        const monthStr = newDate.toLocaleDateString('en-US', { month: 'long' });
        const year = newDate.getFullYear();
        await page.locator('.up-cal__month-prev').click();
        const monthSelectBtn = await page.locator('.up-cal__date-month-year').first();
        await expect(monthSelectBtn).toHaveText(`${monthStr} ${year}`);
    });

    test('has ability open dialog for change year and month', async ({ page }) => {
        const todayEl = page.locator('.up-cal__date-month-year');
        await todayEl.click();
        const currentYear = page.locator('.up-cal__select-years button').getByText(today.getFullYear());
        await expect(page.getByText('Select year')).toBeVisible();
    });
});
