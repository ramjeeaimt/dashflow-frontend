/**
 * Helper to get the current date string in IST (Asia/Kolkata)
 * format: YYYY-MM-DD
 */
export const getISTDateString = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

/**
 * Helper to check if a record date matches IST Today
 */
export const isISTToday = (recordDate) => {
  if (!recordDate) return false;
  const today = getISTDateString();
  const target = getISTDateString(new Date(recordDate));
  return today === target;
};

/**
 * Format time string (HH:mm:ss or HH:mm) to 12-hour format (h:mm AM/PM)
 */
export const formatTime12h = (timeString) => {
  if (!timeString || timeString === '--') return '--';
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (e) {
    return timeString;
  }
};
