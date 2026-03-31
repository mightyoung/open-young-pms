const COUNTER_KEY = 'pms_issue_counter'

export function generateIssueNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  let counter = 1
  try {
    const stored = localStorage.getItem(COUNTER_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    if (parsed && parsed.date === `${year}${month}${day}`) {
      counter = parsed.count + 1
    }
    localStorage.setItem(
      COUNTER_KEY,
      JSON.stringify({ date: `${year}${month}${day}`, count: counter })
    )
  } catch {}

  const seq = String(counter).padStart(4, '0')
  return `ISS-${year}${month}${day}-${seq}`
}

export function getTodayCount() {
  const now = new Date()
  const today = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  try {
    const stored = localStorage.getItem(COUNTER_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    if (parsed && parsed.date === today) return parsed.count
  } catch {}
  return 0
}
