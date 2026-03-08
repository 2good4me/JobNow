/**
 * Format a date as relative time (e.g., "5 minutes ago", "2 hours ago")
 */
export function getRelativeTimeString(dateStrOrObj: any): string {
  if (!dateStrOrObj) return '';

  let timestamp: number;

  // Handle Firestore Timestamp objects
  if (typeof dateStrOrObj === 'object' && 'toDate' in dateStrOrObj) {
    timestamp = dateStrOrObj.toDate().getTime();
  } else if (typeof dateStrOrObj === 'object' && 'seconds' in dateStrOrObj) {
    timestamp = dateStrOrObj.seconds * 1000;
  } else {
    timestamp = new Date(dateStrOrObj).getTime();
  }

  const now = Date.now();
  const diffInMilliseconds = now - timestamp;

  if (diffInMilliseconds < 0) {
    // Future date
    const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
    const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
    if (diffInMinutes > -60) return rtf.format(diffInMinutes, 'minute');
    const diffInHours = Math.round(diffInMinutes / 60);
    if (diffInHours > -24) return rtf.format(diffInHours, 'hour');
    return rtf.format(Math.round(diffInHours / 24), 'day');
  }

  // Past date
  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
  const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));

  if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');
  const diffInHours = Math.round(diffInMinutes / 60);
  if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');
  const diffInDays = Math.round(diffInHours / 24);
  if (diffInDays < 30) return rtf.format(-diffInDays, 'day');
  const diffInMonths = Math.round(diffInDays / 30);
  if (diffInMonths < 12) return rtf.format(-diffInMonths, 'month');
  return rtf.format(-Math.round(diffInMonths / 12), 'year');
}
