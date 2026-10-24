const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const WEEKDAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

const ANCHOR = new Date(2026, 9, 23);
const ANCHOR_J = { y: 1405, m: 8, d: 1 };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isJalaliLeap(year: number) {
  const r = ((year + 2346) % 128) % 33;
  return r === 1 || r === 5 || r === 9 || r === 13 || r === 17 || r === 22 || r === 26 || r === 30;
}

function jalaliMonthLength(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeap(year) ? 30 : 29;
}

function addJalaliDays(start: { y: number; m: number; d: number }, days: number) {
  let { y, m, d } = start;
  let left = days;
  if (left >= 0) {
    while (left > 0) {
      const room = jalaliMonthLength(y, m) - d;
      if (left <= room) {
        d += left;
        left = 0;
      } else {
        left -= room + 1;
        d = 1;
        m += 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
      }
    }
  } else {
    while (left < 0) {
      if (d + left >= 1) {
        d += left;
        left = 0;
      } else {
        left += d;
        m -= 1;
        if (m < 1) {
          m = 12;
          y -= 1;
        }
        d = jalaliMonthLength(y, m);
      }
    }
  }
  return { y, m, d };
}

export function toJalali(date: Date) {
  const diff = Math.round(
    (startOfDay(date).getTime() - startOfDay(ANCHOR).getTime()) / 86400000
  );
  return addJalaliDays(ANCHOR_J, diff);
}

export function formatJalali(date: Date) {
  const { y, m, d } = toJalali(date);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function isoDate(date: Date) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

export function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return next;
}

export function todayIso() {
  return isoDate(new Date());
}
