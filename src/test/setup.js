// Vitest setup for React testing
// Polyfill for URL.createObjectURL (used by some components)
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:test'
}

// Suppress console warnings during tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.('ReactDOM.render')) return
  originalWarn.apply(console, args)
}
