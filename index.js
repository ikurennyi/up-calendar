// NOTES
// January 1st - Sunday. Which is "0" index in USA and "6" index in UA

const state = {
    monthOffset: 0,
    activeDay: null
}

const events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

initCalendar()




function initCalendar() {
    const config = {
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        firstDayOfWeek: 'Sunday', // TODO use and improve this
        locale: getUserLocale(),
        date: {}
    }
    // get calendar element
    const calEl = document.getElementById('up-calendar');
    calEl.innerHTML = '';

    // for a styles purposes
    calEl.classList.add('up-cal');

    const now = new Date();
    if (state.monthOffset !== 0) {
        now.setMonth(new Date().getMonth() + state.monthOffset);
    }
    const day = now.getDay();
    const date = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    config.date.day = day;
    config.date.date = date;
    config.date.month = month;
    config.date.year = year;

    // draw month view by default
    drawMonthView(calEl, config);
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
        dayEl.dataset.date = `${year}${month}${i - offsetDays}`;

        // mark current date
        const now = new Date();
        if (dayEl.dataset.date === `${now.getFullYear()}${now.getMonth()}${now.getDate()}`) {
            dayEl.classList.add('up-cal__day-current');
        }

        dayEl.innerText = (i).toString();
        // dayEl.addEventListener('click', (ev) => console.log(ev, dayEl))
        calEl.appendChild(dayEl);
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
    for (let i = 0; i < weekDays.length; i++) {
        const weekDayEl = document.createElement('div')
        weekDayEl.classList.add('up-cal__weekday');
        weekDayEl.innerText = weekDays[i].substring(0, 3);
        calEl.appendChild(weekDayEl);
    }
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
    dateNavEl.classList.add('up-cal__date-info')
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


// get user locale from browser
function getUserLocale() {
    // TODO: remove next line
    return "en-US";
    return navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language; // 👉️ "en-US"
}

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

        dayBtn.classList.add('up-cal__day-active');

        // const obj

        // events.push()

        // mark clicked day
        console.log('ADD EVENT HERE!', selectedDate);
    })
}


// format datetime
// const now = new Date();
// console.log('*** now: ', now)

// const formattedDate = new Intl.DateTimeFormat(getUserLocale()).format(now);
// console.log('FormattedDate: ', formattedDate)

// const weekInfo = new Intl.Locale(userLocale).weekInfo
// console.log('*** weekInfo: ', weekInfo)
// console.log('*** weekInfo: ', new Intl.Locale("en-US").weekInfo)
