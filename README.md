
# Home-assignment to the role Front-end Developer at Upwork

## Calendar
[Link to repository](https://github.com/ekurennyy/up-calendar)

[Demo](https://ekurennyy.github.io/up-calendar/)

### How To Run:
* Open `index.html` file in any server like "liver-server" in VSCode or with "Open in Browser" feature from WebStorm...

* For run tests, use following commands:
```
npm i
npm run test
```

### Some calendar's abilities:
* Usable from keyboard.
* There is no backend for storing data, but as far as we have a small text messages - user can use `localStorage` by providing flag `useLocalStorage` in corresponding config for calendar instance (enabled by default). Or he can lost his data after page refresh.

## Notes:
* Calendar written only for locale `en-US`.
* Why it's in pure JavaScript: I'm not familiar with React and Vue (now). But use Angular here for me is just like use escalator to go up 2 steps. So I'd like to remember how it is in 2023: write code without JS frameworks, Typescript and Webpack/Parcel/Vite 🤷‍♂️
* This work took around 12 hours for me. FYI.

### TODOs for the future:
* There is still a lot of possibilities to improve in code base and we can make it more user-friendly probably.
* Use browser's information like locale, the beginning of week day (Monday/Sunday) and prepare some another adaptations by using `Intl` abilities.
* Add "dark" theme to calendar.
* ... I have a lot of moment (for myself mostly) that I'll improve in free time. But not today.
