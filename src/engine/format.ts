const UNITS = ['', 'K', 'M', 'B', 'T'] as const

/** How large numbers are written: 1.2K (short) or 1.2E3 (scientific). A player setting. */
let numberStyle: 'short' | 'scientific' = 'short'

export function setNumberStyle(style: 'short' | 'scientific'): void {
  numberStyle = style
}

/**
 * Formats a number for display: 999, 1.2K, 3.4M, 5.6B (design doc Section 4), or 1.2E3 style if
 * the player prefers. Values under 1,000 are shown as whole numbers.
 */
export function formatNumber(value: number, style = numberStyle): string {
  if (!Number.isFinite(value)) return '0'
  const sign = value < 0 ? '-' : ''
  let n = Math.abs(value)
  if (n < 1000) return sign + Math.floor(n).toString()

  if (style === 'scientific') {
    let exponent = Math.floor(Math.log10(n))
    let mantissa = Math.floor((n / 10 ** exponent) * 10) / 10
    if (mantissa >= 10) {
      mantissa = 1
      exponent++
    }
    const text = Number.isInteger(mantissa) ? mantissa.toString() : mantissa.toFixed(1)
    return `${sign}${text}E${exponent}`
  }

  let unit = 0
  while (n >= 1000 && unit < UNITS.length - 1) {
    n /= 1000
    unit++
  }
  // 999.96K would round to "1000.0K"; show it as "1M" instead.
  let rounded = Math.floor(n * 10) / 10
  if (rounded >= 1000 && unit < UNITS.length - 1) {
    rounded = 1
    unit++
  }
  const text = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1)
  return sign + text + UNITS[unit]
}

/**
 * Formats a duration as its two largest units: "45s", "3m 5s", "2h 15m", "1d 4h".
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const parts: [number, string][] = [
    [Math.floor(totalSeconds / 86400), 'd'],
    [Math.floor((totalSeconds % 86400) / 3600), 'h'],
    [Math.floor((totalSeconds % 3600) / 60), 'm'],
    [totalSeconds % 60, 's'],
  ]
  const first = parts.findIndex(([amount]) => amount > 0)
  if (first === -1) return '0s'
  return parts
    .slice(first, first + 2)
    .filter(([amount]) => amount > 0)
    .map(([amount, unit]) => `${amount}${unit}`)
    .join(' ')
}
