const { test, expect } = require('@playwright/test');

test.describe('Month select view', () => {
    let today;

    test.beforeEach(async ({ page }) => {
        today = new Date();
        await page.goto('http://127.0.0.1:5500/index.html');
        const todayEl = await page.locator('.up-cal__date-month-year');
        await todayEl.click();
    });

    test('has highlighted current year by default', async ({ page }) => {
        const currentYear = page.locator('.up-cal__select-years button').getByText(today.getFullYear());
        await expect(currentYear).toHaveClass('up-cal_active');
    });

    test('has contain select year buttons', async ({ page }) => {
        const prevMonthsBtn = await page.locator('.up-select__header .up-cal__month-prev');
        await expect(prevMonthsBtn).toBeVisible();
        const nextMonthsBtn = await page.locator('.up-select__header .up-cal__month-next');
        await expect(nextMonthsBtn).toBeVisible();
    });

    test('has change the list of years by clicking on years navigation buttons', async ({ page }) => {
        const currentYear = today.getFullYear();
        const newSetFirstYear = currentYear + 5 + '';
        const nextMonthsBtn = await page.locator('.up-select__header .up-cal__month-next');
        await nextMonthsBtn.click();
        const yearsContainer = await page.locator('.up-cal__select-years ul');
        const firstMonthText = await yearsContainer.last().locator('button').first().innerText();
        expect(firstMonthText).toEqual(newSetFirstYear);
    });

    // click on year
    test('has show months select when user click on target year', async ({ page }) => {
        const nextYear = today.getFullYear() + 1;
        const nextYearBtn = await page.getByText(nextYear);
        await nextYearBtn.click();
        await expect(page.getByText('Select month')).toBeVisible();
        await expect(page.getByText('Jan', { exact: true })).toBeVisible();
    });

    test('has navigate to month view when user choose year and month', async ({ page }) => {
        const nextSetYear = today.getFullYear() + 5;
        const nextMonthsBtn = await page.locator('.up-select__header .up-cal__month-next');
        await nextMonthsBtn.click();
        const nextYearBtn = await page.getByText(nextSetYear);
        await nextYearBtn.click();
        const firstMonthBtn = await page.getByText('Jan', { exact: true });
        await firstMonthBtn.click();
        await expect(firstMonthBtn).not.toBeVisible();
    });

    test('has show new year and month to user', async ({ page }) => {
        const nextYear = today.getFullYear() + 1;
        const nextYearBtn = await page.getByText(nextYear);
        await nextYearBtn.click();
        const firstMonthBtn = await page.getByText('Jan', { exact: true });
        await firstMonthBtn.click();
        const selectYearMonthBtnText = await page.locator('.up-cal__date-month-year').last().innerText();
        await expect(selectYearMonthBtnText).toEqual(`January ${nextYear}`);
    });
});
