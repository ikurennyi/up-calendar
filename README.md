
# Home-assignment to the role Front-end Developer at Upwork

## Calendar

### How To:
* Open `index.html` file in any server like "liver-server" in VSCode or with "Open in Browser" feature from WebStorm.

### Main calendar's abilities:
* Calendar is showing month view by default.
* Current date should be highlighted.
* User can click on any date for show it's event. There could be only 1 event per day.
* User can add event by click on any date and write short text into the form field and submit form.
* User can use `localStorage` by providing flag `useLocalStorage` in corresponding config for calendar instance or lost his data after page refresh.


## Notes:
* Calendar written only for locale 'en-US'.
* Reason to use pure JavaScript: I'm not familiar with React and Vue now. But use Angular here for me is just like use escalator to go up 2 steps. So I'd like to remember how it is in 2023: write code without JS frameworks, Typescript and Webpack/Parcel/Vite 🤷‍♂️
* You can find some user friendly keyboard navigations.
* I didn't add the "backend" 'cause messages by default are small and I store it in `localStorage` instead.


### TODOs for the future:
* Use browser's information like locale, the beginning of week day (Monday/Sunday) and prepare some another adaptations by using `Intl` abilities.
* Add "dark" theme to calendar.

[//]: # (* January 1st - Sunday. Which is "0" index in USA and "6" index in UA)
