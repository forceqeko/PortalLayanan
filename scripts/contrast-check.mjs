function lum(hex) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const l1 = lum(a)
  const l2 = lum(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

const pairs = [
  ['#11181C', '#F8F7F4', 4.5, 'Light primary text on canvas'],
  ['#3F4D54', '#F8F7F4', 4.5, 'Light secondary text on canvas'],
  ['#11181C', '#FFFFFF', 4.5, 'Light primary text on card'],
  ['#3F4D54', '#FFFFFF', 4.5, 'Light secondary text on card'],
  ['#11181C', '#EFECE6', 4.5, 'Light primary text on muted surface'],
  ['#3F4D54', '#EFECE6', 4.5, 'Light secondary text on muted surface'],
  ['#FFFFFF', '#0F2D34', 4.5, 'White text on Brand Teal'],
  ['#E2ECEF', '#0F2D34', 4.5, 'Muted light text on Brand Teal'],
  ['#F5B841', '#0F2D34', 4.5, 'Brand Gold on Brand Teal'],
  ['#0F2D34', '#F5B841', 4.5, 'Brand Teal text on Brand Gold button'],
  ['#FFFFFF', '#4A2324', 4.5, 'White text on Brand Maroon'],
  ['#6E4800', '#FFF8E7', 4.5, 'Amber alert text on light amber bg'],
  ['#F3F5F6', '#0A191E', 4.5, 'Dark primary text on dark canvas'],
  ['#B8C7CE', '#0A191E', 4.5, 'Dark secondary text on dark canvas'],
  ['#F3F5F6', '#0F252C', 4.5, 'Dark primary text on dark card'],
  ['#B8C7CE', '#0F252C', 4.5, 'Dark secondary text on dark card'],
  ['#5C676C', '#F8F7F4', 3.0, 'Light interactive border on canvas (>=3:1)'],
  ['#62838F', '#0A191E', 3.0, 'Dark interactive border on dark canvas (>=3:1)'],
  ['#FFFFFF', '#0C356A', 4.5, 'Card 1 (PTK Online) white text on Ocean Blue'],
  ['#FFFFFF', '#0E2654', 4.5, 'Card 2 (QDI) white text on Deep Indigo'],
  ['#FFFFFF', '#083D4B', 4.5, 'Card 3 (Informasi) white text on Coastal Teal'],
  ['#FFFFFF', '#0B473E', 4.5, 'Card 4 (WhatsApp) white text on Emerald Green'],
  ['#0F172A', '#FFFFFF', 4.5, 'Location pill dark slate text on white pill'],
]

let failed = false
for (const [fg, bg, min, label] of pairs) {
  const r = ratio(fg, bg)
  const pass = r >= min
  if (!pass) failed = true
  console.log(
    `${pass ? 'PASS' : 'FAIL'} | ${r.toFixed(2)}:1 (min ${min}:1) | ${fg} on ${bg} | ${label}`,
  )
}

if (failed) {
  process.exit(1)
}

