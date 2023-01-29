export class UpCalendar {
    calWrapper;
    calEl;
    eventsEl;
    headerEl;
    prevMonthBtn;
    nextMonthBnt;
    selectDateBtn;
    config = {
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        firstDayOfWeek: 'Sunday',
        locale: 'en-US',
        date: {},
        monthOffset: '0',
        activeDay: null,
        useLocalStorage: true,
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

        this.drawEventsView();
    }

    drawMonthView(isInit = true) {
        const { year, month } = this.config.date;
        const firstDayOfMonth = new Date(year, month, 1);
        const goesNextMonth = +this.config.monthOffset >= 0;

        // setting one container for all months
        let monthsWrapperEl;
        if (isInit) {
            monthsWrapperEl = this.createTag('div', { classList: ['up-cal__months-wrapper'] });
        } else {
            monthsWrapperEl = this.calEl.querySelector('.up-cal__months-wrapper');
        }

        monthsWrapperEl.innerHTML = '';

        const monthElClassList = isInit
            ? ['up-cal__month-item']
            : [
                  'up-cal__month-item',
                  'up-cal__month-item_new',
                  goesNextMonth ? 'up-cal__month-item_new-top' : 'up-cal__month-item_new-bottom',
              ];
        const monthEl = this.createTag('div', { classList: monthElClassList });

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
            // dayEl.addEventListener('click', (ev) => console.log(ev, dayEl))
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
        if (goesNextMonth) {
            monthsWrapperEl.insertAdjacentElement('beforeEnd', monthEl);
        } else {
            monthsWrapperEl.insertAdjacentElement('afterBegin', monthEl);
        }

        this.calEl.appendChild(monthsWrapperEl);
        this.initEventsHandler();
    }

    drawEventsView() {
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

    drawMonthBtn(isInitial = true) {
        const { year, month } = this.config.date;
        const nextDate = new Date(year, month + 1, 0);
        let monthName = nextDate.toLocaleDateString(this.config.locale, {
            month: 'long',
        });
        // some locales provide us month name in lowercase
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        if (isInitial) {
            this.selectDateBtn = this.createTag('button', {
                content: `${monthName} ${year}`,
                classList: ['up-cal__date-month-year'],
            });
            this.selectDateBtn.type = 'button';

            this.headerEl.appendChild(this.selectDateBtn);
        } else {
            this.selectDateBtn.innerText = `${monthName} ${year}`;
        }
    }

    drawMonthNavigationControls() {
        this.prevMonthBtn = this.createTag('button', {
            isHTML: true,
            content: '&#8592;',
            classList: ['up-cal__month-prev'],
        });
        this.prevMonthBtn.type = 'button';

        this.nextMonthBnt = this.createTag('button', {
            isHTML: true,
            content: '&#8594;',
            classList: ['up-cal__month-next'],
        });
        this.nextMonthBnt.type = 'button';

        const monthNavigationButtons = this.createTag('div', { classList: ['up-cal__month-navigation'] });
        monthNavigationButtons.appendChild(this.prevMonthBtn);
        monthNavigationButtons.appendChild(this.nextMonthBnt);

        this.headerEl.appendChild(monthNavigationButtons);
    }

    // TODO: re-write this code somehow
    initMonthControls() {
        this.prevMonthBtn.addEventListener('click', () => this.goPrevMonth());
        this.nextMonthBnt.addEventListener('click', () => this.goNextMonth());
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
        this.drawMonthBtn(false);
        this.drawMonthView(false);
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

            this.drawEventsView();

            // mark clicked day
            console.log('ADD EVENT HERE!', selectedDate);
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
            this.drawEventsView();
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

        if (this.isDateToday({ year, month, date })) {
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
}
