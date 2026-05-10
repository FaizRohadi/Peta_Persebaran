/**
 * Utility: Parse & evaluate "Jam Buka" strings
 * Format: "Monday: 7:00 AM - 10:00 PM | Tuesday: ..."
 *         "Monday: Open 24 hours | ..."
 */

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const DAYS_SHORT_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_SHORT_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

/** Convert "7:00 AM" → minutes since midnight */
function toMinutes(h, m, ampm) {
  let hh = parseInt(h), mm = parseInt(m);
  const ap = ampm.toUpperCase();
  if (ap === 'PM' && hh !== 12) hh += 12;
  if (ap === 'AM' && hh === 12) hh = 0;
  return hh * 60 + mm;
}

/** Parse one day's value → { is24, openMin, closeMin, raw } */
function parseDayValue(val) {
  val = val.trim();
  if (/open 24/i.test(val)) {
    return { is24: true, openMin: 0, closeMin: 1440, raw: val };
  }
  const m = val.match(/(\d+):(\d+)\s*(AM|PM)\s*[-–]\s*(\d+):(\d+)\s*(AM|PM)/i);
  if (m) {
    const openMin  = toMinutes(m[1], m[2], m[3]);
    let   closeMin = toMinutes(m[4], m[5], m[6]);
    if (closeMin <= openMin) closeMin += 1440; // past midnight
    return { is24: false, openMin, closeMin, raw: val };
  }
  return null;
}

/** Parse full "Jam Buka" string → array of { day, ...parseDayValue } */
export function parseHours(jamBuka) {
  if (!jamBuka) return [];
  return jamBuka.split('|').map(part => {
    part = part.trim();
    const colon = part.indexOf(':');
    if (colon < 0) return null;
    const day = part.slice(0, colon).trim();
    const val = part.slice(colon + 1).trim();
    const parsed = parseDayValue(val);
    return parsed ? { day, ...parsed } : null;
  }).filter(Boolean);
}

/** Get today's parsed hours */
function getTodayEntry(jamBuka) {
  const today = DAYS[new Date().getDay()];
  const entries = parseHours(jamBuka);
  return entries.find(e => e.day === today) || null;
}

/** Is this store open right now? */
export function isOpenNow(jamBuka) {
  const entry = getTodayEntry(jamBuka);
  if (!entry) return null; // unknown
  if (entry.is24) return true;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= entry.openMin && nowMin < entry.closeMin;
}

/** Is this store open 24h ALL week? */
export function isAlways24h(jamBuka) {
  const entries = parseHours(jamBuka);
  return entries.length > 0 && entries.every(e => e.is24);
}

/** Get display string for today, e.g. "07:00 – 22:00" or "Buka 24 Jam" */
export function getTodayDisplay(jamBuka, lang = 'id') {
  const entry = getTodayEntry(jamBuka);
  if (!entry) return lang === 'id' ? 'Tidak ada info' : 'No info';
  if (entry.is24) return lang === 'id' ? '🕐 Buka 24 Jam' : '🕐 Open 24 Hours';
  const fmt = m => `${String(Math.floor(m / 60) % 24).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;
  return `${fmt(entry.openMin)} – ${fmt(entry.closeMin % 1440)}`;
}

/** Full weekly schedule as array of { dayLabel, display, isToday } */
export function getWeekSchedule(jamBuka, lang = 'id') {
  const entries = parseHours(jamBuka);
  const todayIdx = new Date().getDay();
  const fmt = m => `${String(Math.floor(m / 60) % 24).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;
  const shortDays = lang === 'id' ? DAYS_SHORT_ID : DAYS_SHORT_EN;

  return DAYS.map((day, i) => {
    const entry = entries.find(e => e.day === day);
    let display = lang === 'id' ? 'Tidak ada info' : 'No info';
    if (entry) {
      display = entry.is24
        ? (lang === 'id' ? '24 Jam' : '24 Hours')
        : `${fmt(entry.openMin)}–${fmt(entry.closeMin % 1440)}`;
    }
    return {
      dayLabel: shortDays[i],
      display,
      is24: entry?.is24 || false,
      isToday: i === todayIdx,
    };
  });
}

/** Classify store for filter */
export function getHoursCategory(jamBuka) {
  if (!jamBuka) return 'unknown';
  if (isAlways24h(jamBuka)) return '24h';
  return 'limited';
}
