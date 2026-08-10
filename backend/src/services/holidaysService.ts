import Holidays from 'date-holidays';

const hd = new Holidays('IN');

const FESTIVAL_MAP: Record<number, { date: string; name: string }[]> = {
  2024: [
    { date: '2024-01-15', name: 'Makar Sankranti' },
    { date: '2024-02-14', name: 'Vasant Panchami' },
    { date: '2024-03-08', name: 'Maha Shivaratri' },
    { date: '2024-03-25', name: 'Holi' },
    { date: '2024-04-09', name: 'Gudi Padwa' },
    { date: '2024-04-11', name: 'Eid ul-Fitr' },
    { date: '2024-04-17', name: 'Ram Navami' },
    { date: '2024-05-01', name: 'Maharashtra Day' },
    { date: '2024-06-17', name: 'Bakrid / Eid al-Adha' },
    { date: '2024-07-17', name: 'Muharram' },
    { date: '2024-08-19', name: 'Raksha Bandhan' },
    { date: '2024-08-26', name: 'Janmashtami' },
    { date: '2024-09-07', name: 'Ganesh Chaturthi' },
    { date: '2024-10-12', name: 'Dussehra' },
    { date: '2024-10-31', name: 'Diwali (Start)' },
    { date: '2024-11-01', name: 'Diwali' },
    { date: '2024-11-03', name: 'Bhai Dooj' },
  ],
  2025: [
    { date: '2025-01-14', name: 'Makar Sankranti' },
    { date: '2025-02-02', name: 'Vasant Panchami' },
    { date: '2025-02-26', name: 'Maha Shivaratri' },
    { date: '2025-03-14', name: 'Holi' },
    { date: '2025-03-30', name: 'Gudi Padwa' },
    { date: '2025-03-31', name: 'Eid ul-Fitr' },
    { date: '2025-04-06', name: 'Ram Navami' },
    { date: '2025-05-01', name: 'Maharashtra Day' },
    { date: '2025-06-07', name: 'Bakrid / Eid al-Adha' },
    { date: '2025-07-06', name: 'Muharram' },
    { date: '2025-08-09', name: 'Raksha Bandhan' },
    { date: '2025-08-15', name: 'Janmashtami' },
    { date: '2025-08-27', name: 'Ganesh Chaturthi' },
    { date: '2025-10-02', name: 'Dussehra' },
    { date: '2025-10-20', name: 'Diwali' },
    { date: '2025-10-22', name: 'Bhai Dooj' },
  ],
  2026: [
    { date: '2026-01-14', name: 'Makar Sankranti' },
    { date: '2026-01-23', name: 'Vasant Panchami' },
    { date: '2026-02-15', name: 'Maha Shivaratri' },
    { date: '2026-03-03', name: 'Holi' },
    { date: '2026-03-19', name: 'Gudi Padwa' },
    { date: '2026-03-20', name: 'Eid ul-Fitr' },
    { date: '2026-03-26', name: 'Ram Navami' },
    { date: '2026-05-01', name: 'Maharashtra Day' },
    { date: '2026-05-27', name: 'Bakrid / Eid al-Adha' },
    { date: '2026-06-26', name: 'Muharram' },
    { date: '2026-08-28', name: 'Raksha Bandhan' },
    { date: '2026-09-04', name: 'Janmashtami' },
    { date: '2026-09-14', name: 'Ganesh Chaturthi' },
    { date: '2026-10-19', name: 'Dussehra' },
    { date: '2026-11-08', name: 'Diwali' },
    { date: '2026-11-10', name: 'Bhai Dooj' },
  ]
};

export interface HolidayEntry {
  id: string;
  date: number;
  month: number;
  year: number;
  name: string;
  fullDateStr: string; // YYYY-MM-DD
}

export const getHolidaysForYear = (year: number): HolidayEntry[] => {
  const systemHolidays = hd.getHolidays(year);
  
  const entries: HolidayEntry[] = [];
  const addedDates = new Set<string>();

  const addEntry = (dateStr: string, name: string) => {
    const dStr = dateStr.substring(0, 10);
    const key = `${dStr}-${name}`;
    if (addedDates.has(key)) return;

    const [y, m, d] = dStr.split('-').map(Number);
    if (y !== year) return;

    entries.push({
      id: `hol-${key}`,
      date: d,
      month: m - 1,
      year: y,
      name: name,
      fullDateStr: dStr
    });
    addedDates.add(key);
  };

  if (systemHolidays) {
    systemHolidays.forEach(h => {
      addEntry(h.date, h.name);
    });
  }

  if (FESTIVAL_MAP[year]) {
    FESTIVAL_MAP[year].forEach(f => {
      addEntry(f.date, f.name);
    });
  }

  return entries;
};
