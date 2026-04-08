export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Bharat ke tyohar aur khaas dino ki list (Format: "Month-Date")
export const HOLIDAYS = {
  // January
  "1-1": "New Year's Day",
  "1-14": "Makar Sankranti",
  "1-26": "Republic Day",
  // February
  "2-14": "Valentine's Day",
  // March
  "3-8": "Maha Shivaratri / Women's Day",
  "3-25": "Holi", 
  "3-29": "Good Friday",
  // April
  "4-11": "Eid al-Fitr",
  "4-14": "Ambedkar Jayanti",
  "4-17": "Ram Navami",
  // May
  "5-1": "Labour Day",
  "5-23": "Buddha Purnima",
  // August
  "8-15": "Independence Day",
  "8-19": "Raksha Bandhan",
  "8-26": "Janmashtami",
  // September
  "9-7": "Ganesh Chaturthi",
  // October
  "10-2": "Gandhi Jayanti",
  "10-12": "Dussehra",
  "10-31": "Diwali",
  // November
  "11-15": "Guru Nanak Jayanti",
  // December
  "12-25": "Christmas Day"
};

/**
 * Check karta hai ki kya aaj koi chutti hai?
 * month + 1 isliye kyunki JavaScript mein months 0 se shuru hote hain
 */
export function getHoliday(day, month) {
  return HOLIDAYS[`${month + 1}-${day}`] || null;
}

/**
 * Pata lagata hai ki us mahine mein total kitne din hain (28, 30, ya 31)
 * Date(year, month + 1, 0) ka matlab hai agle mahine ki "0" tarikh, 
 * jo ki purane mahine ka aakhri din hota hai.
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Mahine ki pehli tarikh ko kaunsa din (Sunday, Monday...) tha?
 * Ye calendar grid banane mein kaam aata hai.
 */
export function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Do dates ko compare karta hai ki kya wo dono ek hi din ki hain?
 */
export function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getDate() === d2.getDate();
}

/**
 * Check karta hai ki kya koi date 'Start' aur 'End' range ke beech mein aati hai.
 */
export function isInRange(date, start, end) {
  if (!start || !end || !date) return false;
  // Agar user ne ulta select kar liya ho (pehle baad wali date), toh use seedha kar lo
  const s = start < end ? start : end;
  const e = start < end ? end : start;
  return date > s && date < e;
}

/**
 * Date ko ek unique string mein badalta hai (Example: "2025-3-15")
 * Iska use hum events ko object mein store karne ke liye "Key" ki tarah karte hain.
 */
export function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}