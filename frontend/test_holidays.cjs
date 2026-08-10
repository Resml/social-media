const Holidays = require('date-holidays');
const hd = new Holidays('IN');
const h2025 = hd.getHolidays(2025);
console.log(h2025.map(h => `${h.date.substring(0,10)} - ${h.name}`).join('\n'));
