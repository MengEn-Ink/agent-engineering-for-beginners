export const reviewTimeZone = 'Asia/Shanghai'

export function reviewDateInTimeZone(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: reviewTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function isReviewOverdue(reviewBy, now = new Date()) {
  return reviewBy < reviewDateInTimeZone(now)
}

