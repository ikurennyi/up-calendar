import makeAnim, { makeCleanup } from './make-anim.js';

export class UpCalendar {
    calWrapper;
    calEl;
    eventsEl;
    headerEl;
    prevMonthBtn;
    nextMonthBnt;
    selectDateBtn;

    // select year/month
    selectMonthViewEl;
    selectMonthViewHeaderEl;
    yearBtnsList;
    monthBtnsList;

    config = {
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        firstDayOfWeek: 'Sunday',
        locale: 'en-US',
        date: {},
        dateToSelect: {},
        monthOffset: '0',
        activeDay: null,
        useLocalStorage: true,
        init: false,
    };

    constructor(selector, config) {
        this.calWrapper = document.querySelector(selector);
        this.config = { ...this.config, ...config };

        if (this.config.useLocalStorage) {
            this.events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
        } else {
            this.events = [];
        }
    }

    initCalendar() {
        // clear calendar wrapper
        this.calWrapper.innerHTML = '';
        this.calWrapper.classList.add('up-calendar');

        // add calendar container
        this.calEl = this.createTag('div', { classList: ['cal-el__calendar', 'up-cal'] });
        this.calWrapper.appendChild(this.calEl);

        // add event container
        this.eventsEl = this.createTag('div', { classList: ['up-cal__event', 'up-event'] });
        this.calWrapper.appendChild(this.eventsEl);

        // set current date in config
        const now = new Date();
        this.updateDateInConfig({
            year: now.getFullYear(),
            month: now.getMonth(),
        });

        // draw navigation controls
        this.drawCalendarNavigation();
        this.initMonthControls();

        // draw weekdays
        this.drawWeekdays();

        // draw month view by default
        this.drawMonthView();

        this.drawEventView();
        this.config.init = true;
    }

    drawMonthView() {
        const { year, month } = this.config.date;
        const firstDayOfMonth = new Date(year, month, 1);
        const goesNextMonth = +this.config.monthOffset >= 0;

        // setting one container for all months
        let monthsWrapperEl;
        if (!this.config.init) {
            monthsWrapperEl = this.createTag('div', { classList: ['up-cal__months-wrapper'] });
        } else {
            monthsWrapperEl = this.calEl.querySelector('.up-cal__months-wrapper');
        }

        const monthEl = this.createTag('div', { classList: ['up-cal__month-item'] });

        // render previous month
        const lastDayOfLastMonth = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth.getDay(); i > 0; i--) {
            const dayEl = this.createTag('div', {
                content: `${lastDayOfLastMonth - i + 1}`,
                classList: ['up-cal__day-offset'],
            });
            monthEl.appendChild(dayEl);
        }

        // render current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = this.createTag('button', { classList: ['up-cal__day'] });
            dayEl.type = 'button';
            dayEl.dataset.date = `${year}-${month}-${i}`;

            // mark current date
            if (this.isDateToday({ year, month, day: i })) {
                this.markDayAsToday(dayEl);
            }

            dayEl.innerText = i.toString();
            monthEl.appendChild(dayEl);
            this.markAsContainingEvent(dayEl);
        }

        // render next month
        const lastDayOfMonth = new Date(year, month, daysInMonth).getDay();
        for (let i = lastDayOfMonth; i < 6; i++) {
            const dayEl = this.createTag('div', {
                content: `${i - lastDayOfMonth + 1}`,
                classList: ['up-cal__day-offset'],
            });
            monthEl.appendChild(dayEl);
        }

        // append/prepend month view depending on the desired direction (prev/next)
        if (!this.config.init) {
            monthsWrapperEl.insertAdjacentElement('beforeEnd', monthEl);
        } else {
            const old = monthsWrapperEl.querySelector('.up-cal__month-item');
            const direction = goesNextMonth ? 'up' : 'down';
            const place = goesNextMonth ? 'beforeend' : 'afterbegin';
            makeAnim({ newEl: monthEl, old, place, direction });
        }

        this.calEl.appendChild(monthsWrapperEl);
        this.initEventsHandler();
    }

    drawEventView() {
        this.eventsEl.innerHTML = '';

        const selectedDayHasEvent = this.hasEvent(this.config.activeDay);
        const dateEl = this.createTag('h6', { content: this.getDateByDateStr(this.config.activeDay) });
        this.eventsEl.appendChild(dateEl);

        if (selectedDayHasEvent) {
            const eventTextEl = this.createTag('div');
            eventTextEl.appendChild(this.prepareEventText('h2', this.config.activeDay));
            this.eventsEl.appendChild(eventTextEl);
            this.addEventForm();
        } else {
            const noItemsEl = this.createTag('div', {
                isHTML: true,
                content: '<i>This day is free!</i>',
                classList: ['up-event_center'],
            });
            this.eventsEl.appendChild(noItemsEl);
            this.addEventForm();
        }
    }

    drawCalendarNavigation() {
        this.headerEl = this.createTag('header', { classList: ['up-cal__header'] });
        this.calEl.appendChild(this.headerEl);
        this.drawMonthBtn();
        this.drawMonthNavigationControls();
    }

    drawMonthBtn() {
        const { year, month } = this.config.date;
        const nextDate = new Date(year, month + 1, 0);

        let monthName = nextDate.toLocaleDateString(this.config.locale, {
            month: 'long',
        });
        // some locales provide us month name in lowercase
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        if (!this.config.init) {
            this.selectDateBtn = this.createTag('button', {
                content: `${monthName} ${year}`,
                classList: ['up-cal__date-month-year'],
            });
            this.selectDateBtn.type = 'button';

            this.headerEl.appendChild(this.selectDateBtn);
        } else {
            // create new button
            const btn = this.createTag('button', {
                content: `${monthName} ${year}`,
                classList: ['up-cal__date-month-year'],
            });
            this.selectDateBtn.type = 'button';

            // animate new button
            const direction = this.config.monthOffset > 0 ? 'up' : 'down';
            makeAnim({
                newEl: btn,
                old: this.selectDateBtn,
                place: 'afterend',
                direction,
            }).then(() => (this.selectDateBtn = btn));
        }
    }

    drawMonthNavigationControls() {
        this.prevMonthBtn = this.createTag('button', {
            isHTML: true,
            content: '&#8592;',
            classList: ['up-cal__month-prev', 'up-cal__btn-head'],
        });
        this.prevMonthBtn.type = 'button';

        this.nextMonthBnt = this.createTag('button', {
            isHTML: true,
            content: '&#8594;',
            classList: ['up-cal__month-next', 'up-cal__btn-head'],
        });
        this.nextMonthBnt.type = 'button';

        const monthNavigationButtons = this.createTag('div', { classList: ['up-cal__month-navigation'] });
        monthNavigationButtons.appendChild(this.prevMonthBtn);
        monthNavigationButtons.appendChild(this.nextMonthBnt);

        this.headerEl.appendChild(monthNavigationButtons);
    }

    initMonthControls() {
        this.headerEl.addEventListener('click', (e) => {
            const targetClassList = e.target.classList;
            if (targetClassList.contains('up-cal__month-next')) {
                this.goNextMonth();
            } else if (targetClassList.contains('up-cal__month-prev')) {
                this.goPrevMonth();
            } else if (targetClassList.contains('up-cal__date-month-year')) {
                this.showSelectMonthView();
            }
        });
    }

    goPrevMonth() {
        const { year, month } = this.config.date;
        const now = new Date(year, month, 1);
        this.config.monthOffset = '-1';
        now.setMonth(now.getMonth() - 1);
        this.updateDateInConfig({
            year: now.getFullYear(),
            month: now.getMonth(),
        });
        this.redrawMonth();
    }

    goNextMonth() {
        const { year, month } = this.config.date;
        const now = new Date(year, month, 1);
        now.setMonth(now.getMonth() + 1);
        this.config.monthOffset = '1';
        this.updateDateInConfig({
            year: now.getFullYear(),
            month: now.getMonth(),
        });
        this.redrawMonth();
    }

    redrawMonth() {
        this.drawMonthBtn();
        this.drawMonthView();
    }

    showSelectMonthView() {
        // seting up desired date
        this.config.dateToSelect.year = this.config.date.year;
        this.config.dateToSelect.month = this.config.date.month;

        // make a wrapper
        this.selectMonthViewEl = this.createTag('div', { classList: ['up-cal__select'] });
        // header
        this.setSelectMonthHeader();
        // year view (by default)
        this.showSelectMonthAtYear();

        // append all content to wrapper
        this.calEl.appendChild(this.selectMonthViewEl);
    }

    setSelectMonthHeader(titleFor = 'year') {
        if (titleFor === 'year') {
            this.createSelectMonthHeaderForYear();
        } else {
            // TODO: animation
            this.selectMonthViewHeaderEl.style.justifyContent = 'center';
            const header = this.selectMonthViewHeaderEl.querySelector('h4');
            const buttons = this.selectMonthViewHeaderEl.querySelectorAll('button');
            header.innerText = 'Select month';
            buttons.forEach((b) => b.remove());
        }
    }

    createSelectMonthHeaderForYear() {
        this.selectMonthViewHeaderEl = this.createTag('header', {
            classList: ['up-select__header'],
            isHTML: true,
            content: `<h4>Select year</h4>`,
        });

        // show previous 12 years
        const prevYearBtn = this.createTag('button', {
            isHTML: true,
            content: '&#8592;',
            classList: ['up-cal__month-prev', 'up-cal__btn-head'],
        });
        prevYearBtn.addEventListener('click', () => this.showSelectMonthAtYear('prev'));

        // show next 12 years
        const nextYearBtn = this.createTag('button', {
            isHTML: true,
            content: '&#8594;',
            classList: ['up-cal__month-next', 'up-cal__btn-head'],
        });
        nextYearBtn.addEventListener('click', () => this.showSelectMonthAtYear('next'));

        // add the navigation buttons
        this.selectMonthViewHeaderEl.insertAdjacentElement('afterBegin', prevYearBtn);
        this.selectMonthViewHeaderEl.insertAdjacentElement('beforeEnd', nextYearBtn);

        // show prepared header
        this.selectMonthViewEl.appendChild(this.selectMonthViewHeaderEl);
    }

    showSelectMonthAtYear(direction = undefined) {
        const monthCountAtView = 12;
        this.yearBtnsList ||= this.createTag('ul', { classList: ['up-cal__select-years'] });

        let yearToStart;
        switch (direction) {
            case 'next':
                yearToStart = +this.yearBtnsList.querySelector('button')?.value + 7 + monthCountAtView;
                break;
            case 'prev':
                yearToStart = +this.yearBtnsList.querySelector('button')?.value - 5;
                break;
            default:
                yearToStart = this.config.date.year;
                break;
        }

        const startYearAtTheView = yearToStart - 7;
        this.yearBtnsList.innerHTML = '';
        for (let i = 0; i < monthCountAtView; i++) {
            const btnLi = this.createTag('li');
            const btnClass = startYearAtTheView + i === this.config.date.year && 'up-cal_active';
            const yearBtn = this.createTag('button', { content: startYearAtTheView + i, classList: [btnClass] });
            yearBtn.type = 'button';
            yearBtn.value = startYearAtTheView + i;
            yearBtn.addEventListener('click', (e) => this.showSelectMonthAtMonth(startYearAtTheView + i));
            btnLi.appendChild(yearBtn);
            this.yearBtnsList.appendChild(btnLi);
        }

        this.selectMonthViewEl.appendChild(this.yearBtnsList);

        this._focusButtonOnRender(this.yearBtnsList);
    }

    showSelectMonthAtMonth(year) {
        const now = new Date();
        this.config.dateToSelect.year = year;

        this.setSelectMonthHeader('month');

        this.monthBtnsList = this.createTag('ul', { classList: ['up-cal__select-months'] });
        // mark active month and year if compares
        for (let i = 0; i < this.config.months.length; i++) {
            const monthNameEl = this.createTag('li');
            const btnClass =
                this.config.dateToSelect.year == now.getFullYear() && i === now.getMonth() && 'up-cal_active';
            const monthBtn = this.createTag('button', { content: this.config.months[i], classList: [btnClass] });
            monthBtn.value = i;
            monthBtn.addEventListener('click', () => this.selectMonth(i));
            monthNameEl.appendChild(monthBtn);
            this.monthBtnsList.appendChild(monthNameEl);
        }

        const selectDateEl = this.calEl.querySelector('.up-cal__select');
        selectDateEl.querySelector('.up-cal__select-years').remove();
        selectDateEl.appendChild(this.monthBtnsList);

        this._focusButtonOnRender(this.monthBtnsList);
    }

    selectMonth(month) {
        this.config.dateToSelect.month = month;
        this.config.date.year = this.config.dateToSelect.year;
        this.config.date.month = this.config.dateToSelect.month;
        // hide selectMonth (toggle)
        this.selectMonthViewEl.remove();
        // change month toggle button contnet and render selected month
        this.redrawMonth();
    }

    drawWeekdays() {
        const weekDays = this.config.weekdays;
        const weekdaysEl = this.createTag('ul');
        weekdaysEl.classList.add('up-cal__weekdays');
        for (let i = 0; i < weekDays.length; i++) {
            const weekDayEl = this.createTag('li', { content: weekDays[i].substring(0, 3) });
            weekDayEl.classList.add('up-cal__weekday');
            weekdaysEl.appendChild(weekDayEl);
        }
        this.calEl.appendChild(weekdaysEl);
    }

    markAsContainingEvent(dayEl) {
        const date = dayEl.dataset.date;
        if (this.events.filter((ev) => ev.date === date)[0]) {
            dayEl.classList.add('up-cal__day-marked');
        }
    }

    markDayAsToday(dayEl) {
        const date = dayEl.dataset.date;
        dayEl.classList.add('up-cal__day-active');
        dayEl.classList.add('up-cal__day-current');
        this.config.activeDay = date;
    }

    initEventsHandler() {
        this.calEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('up-cal__day')) {
                return;
            }

            const dayBtn = e.target;
            const selectedDate = dayBtn.dataset.date;
            this.config.activeDay = selectedDate;

            this.markDayAsActive(dayBtn);

            this.drawEventView();
        });
    }

    markDayAsActive(dayBtn) {
        this.clearClassListFromDays('up-cal__day-active');
        dayBtn.classList.add('up-cal__day-active');
    }

    clearClassListFromDays(className) {
        this.calEl.querySelectorAll('.up-cal__day').forEach((el) => el.classList.remove(className));
    }

    addEventForm() {
        const formEl = this.createTag('form');
        const inputEl = this.createTag('input');
        inputEl.placeholder = 'Add something to this day...';
        formEl.appendChild(inputEl);

        const submitBtn = this.createTag('button', { content: 'Add event' });
        submitBtn.type = 'submit';
        formEl.appendChild(submitBtn);
        this.eventsEl.appendChild(formEl);

        inputEl.focus();

        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            if (inputEl.value.trim().length === 0) {
                return;
            }
            const event = { date: this.config.activeDay, title: inputEl.value };
            this.addItemToStorage(event);
            this.drawEventView();
        });
    }

    addItemToStorage(event) {
        const existingEv = this.events.filter((ev) => ev.date === event.date)[0];
        if (existingEv) {
            existingEv.title = event.title;
        } else {
            this.events.push(event);
            const el = this.getDayElByDate(event.date);
            this.markAsContainingEvent(el);
        }
        this.config.useLocalStorage && localStorage.setItem('events', JSON.stringify(this.events));
    }

    getDayElByDate(dateStr) {
        return this.calEl.querySelector('[data-date="' + dateStr + '"]');
    }

    hasEvent(dateStr) {
        return !!this.getEventByDate(dateStr);
    }

    getEventByDate(dateStr) {
        return this.events.filter((ev) => ev.date === dateStr)[0];
    }

    getDateByDateStr(dateStr) {
        const [year, month, date] = dateStr.split('-');
        if (this.isDateToday({ year, month, day: date })) {
            return 'Today';
        }
        const newDate = new Date(year, month, date);
        return newDate.toLocaleDateString(this.config.locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    isDateToday({ year, month, day }) {
        const now = new Date();
        return +year === now.getFullYear() && +month === now.getMonth() && +day === now.getDate();
    }

    prepareEventText(tag, dateStr) {
        const content = this.getEventByDate(dateStr).title;
        return this.createTag(tag, { content });
    }

    updateDateInConfig(newDate) {
        this.config.date = {
            ...this.config.date,
            ...newDate,
        };
    }

    createTag(tag, { isHTML = false, content = '', classList = [] } = {}) {
        const htmlEl = document.createElement(tag);
        classList && htmlEl.classList.add(...classList);
        if (isHTML) {
            htmlEl.innerHTML = content;
        } else {
            htmlEl.innerText = content;
        }
        return htmlEl;
    }

    _focusButtonOnRender(htmlEl) {
        setTimeout(() => {
            htmlEl.querySelector('button').focus();
        }, 0);
    }
}
