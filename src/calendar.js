// NOTE:
// calendar written only for locale 'en-US'.
// January 1st - Sunday. Which is "0" index in USA and "6" index in UA



export class UpCalendar {
    calWrapper;
    calEl;
    config = {
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        firstDayOfWeek: 'Sunday',
        locale: 'en-US',
        date: {},
        monthOffset: 0,
        activeDay: null,
        useLocalStorage: true
    }

    // events;

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
        // clear calendar
        this.calWrapper.innerHTML = '';
        this.calWrapper.classList.add('up-calendar');

        // add calendar container
        this.calEl = this.createTag("div", { classList: ["cal-el__calendar"] });
        this.calWrapper.appendChild(this.calEl);

        // add event container
        const eventEl = this.createTag("div", { classList: ["up-cal__event", "up-event"] });
        eventEl.id = "up-event";
        this.calWrapper.appendChild(eventEl);

        // for a styles purposes
        this.calEl.classList.add('up-cal');

        const now = new Date();
        if (this.config.monthOffset !== 0) {
            now.setMonth(new Date().getMonth() + this.config.monthOffset);
        }
        this.config.date.day = now.getDay();
        this.config.date.date = now.getDate();
        this.config.date.month = now.getMonth();
        this.config.date.year = now.getFullYear();

        // draw month view by default
        this.drawMonthView();

        this.drawEventsView();
    }

    drawMonthView() {
        const { year, month } = this.config.date;
        const firstDayOfMonth = new Date(year, month, 1);

        // draw navigation controls
        this.drawCalendarNavigation();
        this.initMonthControls()

        // draw weekdays
        this.drawWeekdays();

        const dateString = firstDayOfMonth.toLocaleDateString( this.config.locale,{
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        })

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const offsetDays = this.config.weekdays.indexOf(dateString.split(', ')[0])


        // render previous month
        const lastDayOfLastMonth = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth.getDay(); i > 0; i--) {
            const dayEl = this.createTag("div", { content: `${lastDayOfLastMonth - i + 1}`, classList: ["up-cal__day-offset"] });
            this.calEl.appendChild(dayEl);
        }

        // render current month
        for (let i = 1; i <= daysInMonth; i ++) {
            const dayEl = this.createTag("button", { classList: ["up-cal__day"] })
            dayEl.type = "button";
            dayEl.dataset.date = `${year}-${month}-${i - offsetDays}`;

            // mark current date
            const now = new Date();
            if (dayEl.dataset.date === `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`) {
                this.markDayAsToday(dayEl);
            }

            dayEl.innerText = (i).toString();
            // dayEl.addEventListener('click', (ev) => console.log(ev, dayEl))
            this.calEl.appendChild(dayEl);
            this.markAsContainingEvent(dayEl);

        }

        // render next month
        const lastDayOfMonth = new Date(year, month, daysInMonth).getDay();
        for (let i = lastDayOfMonth; i < 6; i++) {
            const dayEl = this.createTag("div", { content: `${i - lastDayOfMonth + 1}`, classList: ["up-cal__day-offset"] });
            this.calEl.appendChild(dayEl);
        }

        this.initEventsHandler()
    }

    drawEventsView() {
        const eventsEl = this.calWrapper.querySelector('#up-event');
        eventsEl.innerHTML = "";

        const selectedDayHasEvent = this.hasEvent(this.config.activeDay);
        const dateEl = this.createTag("h6", { content: this.getDateByDateStr(this.config.activeDay) })
        eventsEl.appendChild(dateEl);

        if (selectedDayHasEvent) {
            const eventTextEl = this.createTag("div");
            eventTextEl.appendChild(this.prepareEventText("h2", this.config.activeDay));
            eventsEl.appendChild(eventTextEl);
            this.addEventForm(eventsEl);
        } else {
            const noItemsEl = this.createTag("div", { isHTML: true, content: "<i>This day is free!</i>", classList: ["up-event_center"] });
            // noItemsEl.classList.add()
            eventsEl.appendChild(noItemsEl);
            this.addEventForm(eventsEl);
        }
    }

    drawCalendarNavigation() {
        const { year, month } = this.config.date;
        let monthName = new Date(year, month + 1, 0).toLocaleDateString(this.config.locale, {
            month: 'long'
        });

        // some locales provide us month name in lowercase
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)

        const headerEl = this.createTag('header', {classList: ["up-cal__header"] });

        const dateNavEl = this.createTag('button', { content: `${monthName} ${year}`, classList: ["up-cal__date-month-year"] })
        dateNavEl.type = "button";

        const monthPrevBtn = this.createTag('button', {isHTML: true, content: "&#8592;", classList: ["up-cal__month-prev"] });
        monthPrevBtn.type = "button";
        monthPrevBtn.id = 'up-cal-prev';

        const monthNextBtn = this.createTag("button", { isHTML: true, content: "&#8594;", classList: ["up-cal__month-next"] });
        monthNextBtn.type = "button";
        monthNextBtn.id = 'up-cal-next';

        const monthNavigationButtons = this.createTag("div", { classList: ["up-cal__month-navigation"] });
        monthNavigationButtons.appendChild(monthPrevBtn);
        monthNavigationButtons.appendChild(monthNextBtn);

        headerEl.appendChild(dateNavEl);
        headerEl.appendChild(monthNavigationButtons);
        this.calEl.appendChild(headerEl);
    }

    initMonthControls() {
        const prevMonthButton = document.getElementById('up-cal-prev');
        const nextMonthButton = document.getElementById('up-cal-next');

        prevMonthButton.addEventListener('click', () => {
            this.config.monthOffset--;
            this.initCalendar();
        })
        nextMonthButton.addEventListener('click', () => {
            this.config.monthOffset++;
            this.initCalendar();
        })
    }

    drawWeekdays() {
        const weekDays = this.config.weekdays;
        const weekdaysEl = this.createTag("ul");
        weekdaysEl.classList.add('up-cal__weekdays');
        for (let i = 0; i < weekDays.length; i++) {
            const weekDayEl = this.createTag("li", { content: weekDays[i].substring(0, 3) })
            weekDayEl.classList.add('up-cal__weekday');
            weekdaysEl.appendChild(weekDayEl);
        }
        this.calEl.appendChild(weekdaysEl);
    }

    markAsContainingEvent(dayEl) {
        const date = dayEl.dataset.date;
        if (this.events.filter(ev => ev.date === date)[0]) {
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
        this.calEl.addEventListener('click', e => {
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
        })
    }

    markDayAsActive(dayBtn) {
        this.clearClassListFromDays('up-cal__day-active');
        dayBtn.classList.add('up-cal__day-active');
    }

    clearClassListFromDays(className) {
        this.calEl
            .querySelectorAll('.up-cal__day')
            .forEach(el => el.classList.remove(className));
    }

    addEventForm(eventsEl) {
        const formEl = this.createTag("form");
        const inputEl = this.createTag("input");
        inputEl.placeholder = 'Add something to this day...'
        formEl.appendChild(inputEl);

        const submitBtn = this.createTag("button", { content: "Add event" });
        submitBtn.type = "submit";
        formEl.appendChild(submitBtn);
        eventsEl.appendChild(formEl);

        inputEl.focus();

        formEl.addEventListener('submit', e => {
            e.preventDefault();
            if (inputEl.value.trim().length === 0) {
                return;
            }
            const event = { date: this.config.activeDay, title: inputEl.value };
            this.addItemToStorage(event);
            this.drawEventsView()
        })
    }

    addItemToStorage(event) {
        const existingEv = this.events.filter(ev => ev.date === event.date)[0];
        if (existingEv) {
            existingEv.title = event.title;
        } else {
            this.events.push(event);
            const el = this.getDayElByDate(event.date);
            this.markAsContainingEvent(el)
        }
        this.config.useLocalStorage && localStorage.setItem('events', JSON.stringify(this.events));
    }

    getDayElByDate(dateStr) {
        return this.calEl.querySelector('[data-date="' + dateStr + '"]')
    }

    hasEvent(dateStr) {
        return !!this.getEventByDate(dateStr);
    }

    getEventByDate(dateStr) {
        return this.events.filter(ev => ev.date === dateStr)[0];
    }

    getDateByDateStr(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const isCurrentDate =
            +year === this.config.date.year &&
            +month === this.config.date.month &&
            +day === this.config.date.date;
        if (isCurrentDate) {
            return 'Today';
        }
        const date = new Date(year, month, day);
        return date.toLocaleDateString(this.config.locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    prepareEventText(tag, dateStr) {
        const content = this.getEventByDate(dateStr).title;
        return this.createTag(tag, { content });
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
