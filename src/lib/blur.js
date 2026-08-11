const TOLERANCE = 1.5 / 255
const SMOOTH_RADIUS = 2

function blurAxis(source, target, { width, height, radius }) {
  const span = radius * 2 + 1
  for (let row = 0; row < height; row++) {
    const offset = row * width
    let sum = source[offset] * radius
    for (let column = 0; column <= radius; column++) {
      sum += source[offset + Math.min(column, width - 1)]
    }
    for (let column = 0; column < width; column++) {
      target[column * height + row] = sum / span
      sum -= source[offset + Math.max(column - radius, 0)]
      sum += source[offset + Math.min(column + radius + 1, width - 1)]
    }
  }
}

function boxBlur({ values, width, height }, radius) {
  if (radius < 1) return
  const transposed = new Float32Array(values.length)
  blurAxis(values, transposed, { width, height, radius })
  blurAxis(transposed, values, { width: height, height: width, radius })
}

export function smoothBands(field, radius) {
  const original = field.values.slice()
  boxBlur(field, radius)
  for (let i = 0; i < field.values.length; i++) {
    field.values[i] = Math.min(
      Math.max(field.values[i], original[i] - TOLERANCE),
      original[i] + TOLERANCE,
    )
  }
  boxBlur(field, SMOOTH_RADIUS)
}
