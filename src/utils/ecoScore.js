const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const normalizeCo2 = (value) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
}

const ECO_LEVEL_FALLBACK = {
  low: 86,
  medium: 64,
  high: 42,
  unknown: 55,
}

export const ECO_LEVEL_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  unknown: 'Unknown',
}

export const buildEcoInsights = ({ flight = {}, routeAverageCo2, minCo2 } = {}) => {
  const ecoLevel = (flight.ecolevel || 'unknown').toLowerCase()
  const co2Value = normalizeCo2(flight.co2kg)
  const routeAverage = normalizeCo2(routeAverageCo2)
  const routeBest = normalizeCo2(minCo2)
  const stopsPenalty = typeof flight.stops === 'number' ? flight.stops * 5 : 0

  const co2DeltaPercent = co2Value !== null && routeAverage !== null
    ? ((co2Value - routeAverage) / routeAverage) * 100
    : null

  const scoreFromCo2 = co2DeltaPercent !== null
    ? 72 - Math.max(-24, Math.min(34, co2DeltaPercent)) - stopsPenalty
    : null

  const ecoScore = clamp(
    Math.round(scoreFromCo2 ?? ECO_LEVEL_FALLBACK[ecoLevel] ?? 55),
    20,
    98,
  )

  const roundedDelta = co2DeltaPercent === null ? null : Math.round(Math.abs(co2DeltaPercent))

  const ecoComparisonText = co2Value === null
    ? 'CO2 estimate unavailable for this option'
    : routeAverage === null
      ? 'Route baseline unavailable'
      : Math.abs(co2DeltaPercent) < 2
        ? 'About the same CO2 as route average'
        : co2DeltaPercent < 0
          ? `${roundedDelta}% less CO2 than route average`
          : `${roundedDelta}% more CO2 than route average`

  const ecoContextText = routeAverage !== null
    ? `Compared with ${routeAverage.toFixed(1)} kg route average`
    : 'Compared within this search'

  const isBestEco = co2Value !== null && routeBest !== null && Math.abs(co2Value - routeBest) < 0.05

  return {
    ecoLevel,
    ecoScore,
    co2Value,
    routeAverage,
    routeBest,
    co2DeltaPercent,
    roundedDelta,
    ecoComparisonText,
    ecoContextText,
    isBestEco,
  }
}

export const getEcoScoreValue = (params) => buildEcoInsights(params).ecoScore
