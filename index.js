// NOTES
// January 1st - Sunday. Which is "0" index in USA and "6" index in UA

const state = {
    monthOffset: 0,
    activeDay: null
}

let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

initCalendar()


function initCalendar() {
    const config = {
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        firstDayOfWeek: 'Sunday', // TODO use and improve this
        locale: getUserLocale(),
        date: {}
    }

    // get calendar element
    const calWrapper = document.getElementById('up-calendar');
    // clear calendar
    calWrapper.innerHTML = '';

    // add calendar container
    const calEl = document.createElement('div');
    calEl.classList.add('cal-el__calendar');
    calWrapper.appendChild(calEl);

    // add event container
    const eventEl = document.createElement('div');
    eventEl.classList.add('up-cal__event', 'up-event');
    eventEl.id = "up-event";
    calWrapper.appendChild(eventEl);

    // for a styles purposes
    calEl.classList.add('up-cal');

    const now = new Date();
    if (state.monthOffset !== 0) {
        now.setMonth(new Date().getMonth() + state.monthOffset);
    }
    config.date.day = now.getDay();
    config.date.date = now.getDate();
    config.date.month = now.getMonth();
    config.date.year = now.getFullYear();

    // draw month view by default
    drawMonthView(calEl, config);

    drawEventsView();
}


function drawMonthView(calEl, config) {
    const { year, month, day, date } = config.date;
    const firstDayOfMonth = new Date(year, month, 1);

    // draw navigation controls
    drawCalendarNavigation(calEl, config);
    initCalendarControls()

    // draw weekdays
    drawWeekdays(calEl, config);

    const dateString = firstDayOfMonth.toLocaleDateString( config.locale,{
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    })

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offsetDays = config.weekdays.indexOf(dateString.split(', ')[0])


    // render previous month
    const lastDayOfLastMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth.getDay(); i > 0; i--) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('up-cal__day-offset');
        dayEl.innerText = `${lastDayOfLastMonth - i + 1}`;
        calEl.appendChild(dayEl);
    }

    // render current month
    for (let i = 1; i <= daysInMonth; i ++) {
        const dayEl = document.createElement('button')
        dayEl.type = "button";
        dayEl.classList.add('up-cal__day');
        dayEl.dataset.date = `${year}-${month}-${i - offsetDays}`;

        // mark current date
        const now = new Date();
        if (dayEl.dataset.date === `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`) {
            markDayAsToday(dayEl);
        }

        dayEl.innerText = (i).toString();
        // dayEl.addEventListener('click', (ev) => console.log(ev, dayEl))
        calEl.appendChild(dayEl);
        markAsContainingEvent(dayEl);

    }

    // render next month
    const lastDayOfMonth = new Date(year, month, daysInMonth).getDay();
    for (let i = lastDayOfMonth; i < 6; i++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('up-cal__day-offset');
        dayEl.innerText = `${i - lastDayOfMonth + 1}`;
        calEl.appendChild(dayEl);
    }

    initEventsHandler(calEl)
}

function drawWeekdays(calEl, config) {
    const weekDays = config.weekdays;
    const weekdaysEl = document.createElement('ul');
    weekdaysEl.classList.add('up-cal__weekdays');
    for (let i = 0; i < weekDays.length; i++) {
        const weekDayEl = document.createElement('li')
        weekDayEl.classList.add('up-cal__weekday');
        weekDayEl.innerText = weekDays[i].substring(0, 3);
        weekdaysEl.appendChild(weekDayEl);
    }
    calEl.appendChild(weekdaysEl);
}


function drawCalendarNavigation(calEl, config) {
    const { year, month } = config.date;
    let monthName = new Date(year, month + 1, 0).toLocaleDateString(config.locale, {
        month: 'long'
    });

    // some locales provide us month name in lowercase
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)

    const headerEl = document.createElement('header');
    headerEl.classList.add('up-cal__header');

    const dateNavEl = document.createElement('button')
    dateNavEl.type = "button";
    dateNavEl.classList.add('up-cal__date-month-year')
    dateNavEl.innerText = `${monthName} ${year}`;

    const monthPrevBtn = document.createElement('button');
    monthPrevBtn.type = "button";
    monthPrevBtn.innerHTML = "&#8592;";
    monthPrevBtn.classList.add('up-cal__month-prev');
    monthPrevBtn.id = 'up-cal-prev';

    const monthNextBtn = document.createElement('button');
    monthNextBtn.type = "button";
    monthNextBtn.innerHTML = "&#8594;";
    monthNextBtn.classList.add('up-cal__month-next');
    monthNextBtn.id = 'up-cal-next';

    const monthNavigationButtons = document.createElement('div');
    monthNavigationButtons.classList.add('up-cal__month-navigation')
    monthNavigationButtons.appendChild(monthPrevBtn);
    monthNavigationButtons.appendChild(monthNextBtn);

    headerEl.appendChild(dateNavEl);
    headerEl.appendChild(monthNavigationButtons);
    calEl.appendChild(headerEl);
}


function drawMonthsSelectView() {}
function drawYearSelectView() {}


function initCalendarControls() {
    const prevMonthButton = document.getElementById('up-cal-prev');
    const nextMonthButton = document.getElementById('up-cal-next');

    prevMonthButton.addEventListener('click', () => {
        state.monthOffset--;
        initCalendar();
    })
    nextMonthButton.addEventListener('click', () => {
        state.monthOffset++;
        initCalendar();
    })
}

function initEventsHandler(calEl) {
    calEl.addEventListener('click', e => {
        if (!e.target.classList.contains('up-cal__day')) {
            return;
        }

        const dayBtn = e.target;
        const selectedDate = dayBtn.dataset.date;
        state.activeDay = selectedDate;

        markDayAsActive(dayBtn);

        drawEventsView();

        // mark clicked day
        console.log('ADD EVENT HERE!', selectedDate);
    })
}


function drawEventsView() {
    const eventsEl = document.getElementById('up-event');
    eventsEl.innerHTML = "";

    const selectedDayHasEvent = hasEvent(state.activeDay);
    const dateEl = document.createElement('h6')
    dateEl.innerText = getDateByDateStr(state.activeDay);
    eventsEl.appendChild(dateEl);

    if (selectedDayHasEvent) {
        const eventTextEl = document.createElement('div');
        eventTextEl.appendChild(prepareEventText('h2', state.activeDay));
        eventsEl.appendChild(eventTextEl);
        addEventForm(eventsEl);
    } else {
        const noItemsEl = document.createElement('div');
        noItemsEl.classList.add()
        noItemsEl.innerHTML = '<i>This day is free!</i>';
        eventsEl.classList.add('up-event_center');
        eventsEl.appendChild(noItemsEl);
        addEventForm(eventsEl);
    }
}


// Helpers

function getUserLocale() {
    // TODO: remove next line
    return "en-US";
    return navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language; // 👉️ "en-US"
}

function markDayAsToday(dayEl) {
    const date = dayEl.dataset.date;
    dayEl.classList.add('up-cal__day-active');
    dayEl.classList.add('up-cal__day-current');
    state.activeDay = date;
}

function markDayAsActive(dayBtn) {
    clearClassListFromDays('up-cal__day-active');
    dayBtn.classList.add('up-cal__day-active');
}

function clearClassListFromDays(className) {
    const calEl = document.getElementById('up-calendar');
    calEl.querySelectorAll('.up-cal__day').forEach(el => el.classList.remove(className));
}

function markAsContainingEvent(dayEl) {
    const date = dayEl.dataset.date;
    if (events.filter(ev => ev.date === date)[0]) {
        dayEl.classList.add('up-cal__day-marked');
    }
}

function getEventByDate(dateStr) {
    return events.filter(ev => ev.date === dateStr)[0];
}

function hasEvent(dateStr) {
    return !!getEventByDate(dateStr);
}

// get calendar day by date
function getDayElByDate(dateStr) {
    return document
        .getElementById('up-calendar')
        .querySelector('[data-date="' + dateStr + '"]')
}


function addEventForm(eventsEl) {
    const formEl = document.createElement('form');

    const inputEl = document.createElement('input');
    inputEl.placeholder = 'Add something to this day...'
    formEl.appendChild(inputEl);

    const submitBtn = document.createElement('button');
    submitBtn.type = "submit";
    submitBtn.innerText = "Add event";
    formEl.appendChild(submitBtn);
    eventsEl.appendChild(formEl);

    inputEl.focus();

    formEl.addEventListener('submit', e => {
        e.preventDefault();
        const event = { date: state.activeDay, title: inputEl.value };
        addItemToStorage(event);
        drawEventsView()
    })
}

function addItemToStorage(event) {
    const existingEv = events.filter(ev => ev.date === event.date)[0];
    if (existingEv) {
        existingEv.title = event.title;
    } else {
        events.push(event);
        const el = getDayElByDate(event.date);
        markAsContainingEvent(el)
    }
    localStorage.setItem('events', JSON.stringify(events));
}

function deleteItemFromStorage(event) {
    console.log('*** event to delete: ', event)
}

function prepareEventText(tag, dateStr) {
    const text = getEventByDate(dateStr).title;
    const tagEl = document.createElement(tag);
    tagEl.innerText = text;
    return tagEl;
}


function getDateByDateStr(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const now = new Date();
    const isCurrentDate = year == now.getFullYear() && month == now.getMonth() && day == now.getDate();
    if (isCurrentDate) {
        return 'Today';
    }
    const date = new Date(year, month, day);
    return date.toLocaleDateString(getUserLocale(), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
