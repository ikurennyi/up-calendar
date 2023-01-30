import UpCalendar from './calendar.js';

const cal = new UpCalendar('#up-calendar');
cal.initCalendar();

//
// Examples of working with UpCalendar
//
// Bulk update
// const newEvents = [
//     { date: new Date(2023, 0, 11), title: 'First msg. Jan 12, 2023' },
//     { date: new Date(2023, 0, 30), title: 'Second msg. Jan 30, 2023' },
//     { date: new Date(2023, 1, 2), title: 'Third msg. Feb 2, 2023' },
// ];
// cal.loadData(newEvents);
//
// GET message by date
// cal.getByDate(new Date(2023, 0, 29));
//
// POST message to date
// cal.newByDate(new Date(2023, 0, 21), 'Hello at 19th of January, 2023');
//
// PUT message
// cal.updateAt(new Date(2023, 0, 21), 'Just an upadte');
//
// DELETE message
// cal.deleteAtDate(new Date(2023, 0, 21));
//
