import { round } from 'echarts/lib/util/number'
import { decodeMetricName } from 'containers/Widget/components/util'

type numType = number | string
let _boundaryCheckingState = true

export function getMetricsMinAndMax(metrics, data, stack) {
  const metricsSource = metrics.map((metrics) =>
    ['min', 'max'].map((item) => {
      return { fn: item, data: metrics }
    })
  )
  return metricsSource.flat().map((item) => {
    if (stack) {
      return item.data.reduce(
        (num, m) =>
          num +
          Math[item.fn](
            ...data.map((d) => d[`${m.agg}(${decodeMetricName(m.name)})`])
          ),
        0
      )
    } else {
      return Math[item.fn](
        ...item.data.map((m) =>
          Math[item.fn](
            ...data.map((d) => d[`${m.agg}(${decodeMetricName(m.name)})`])
          )
        )
      )
    }
  })
}

export function getDoubleYExtendInterval(initExtent, splitNumber) {
  let [minExtent, maxExtent] = initExtent

  if (minExtent > 0 && maxExtent > 0) {
    minExtent = 0
  }
  if (minExtent < 0 && maxExtent < 0) {
    maxExtent = 0
  }
  if (minExtent === maxExtent) {
    if (minExtent !== 0) {
      const expandSize = minExtent
      maxExtent += expandSize / 2
      minExtent -= expandSize / 2
    } else {
      maxExtent = 1
    }
  }
  let differ = maxExtent - minExtent
  if (!isFinite(differ)) {
    minExtent = 0
    maxExtent = 1
    differ = maxExtent - minExtent
  }

  if (!isFinite(differ)) {
    return
  }
  let interval = differ / splitNumber
  if (interval === 0) {
    return 0
  }
  let exponent = Math.floor(Math.log(interval) / Math.LN10)
  if (interval / Math.pow(10, exponent) >= 10) {
    exponent++
  }
  const exp10 = Math.pow(10, exponent)
  const f = interval / exp10

  let nf
  if (f < 1.5) {
    nf = 1
  } else if (f < 2.5) {
    nf = 2
  } else if (f < 4) {
    nf = 3
  } else if (f < 7) {
    nf = 5
  } else {
    nf = 10
  }
  interval = nf * exp10
  interval = exponent >= -20 ? +interval.toFixed(exponent < 0 ? -exponent : 0) : interval
  minExtent = round(Math.floor(minExtent / interval) * interval)
  maxExtent = round(Math.ceil(maxExtent / interval) * interval)
  return { minExtent, maxExtent, interval }
}

export function strip(num: numType, precision = 12): number {
  return +parseFloat(Number(num).toPrecision(precision))
}

export function digitLength(num: numType): number {
  const eSplit = num.toString().split(/[eE]/)
  const len = (eSplit[0].split('.')[1] || '').length - +(eSplit[1] || 0)
  return len > 0 ? len : 0
}

export function float2Fixed(num: numType): number {
  if (num.toString().indexOf('e') === -1) {
    return Number(num.toString().replace('.', ''))
  }
  const dLen = digitLength(num)
  return dLen > 0 ? strip(Number(num) * Math.pow(10, dLen)) : Number(num)
}

export function checkBoundary(num: number) {
  if (_boundaryCheckingState) {
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      console.warn(
        `${num} is beyond boundary when transfer to integer, the results may not be accurate`
      )
    }
  }
}

export function times(
  num1: numType,
  num2: numType,
  ...others: numType[]
): number {
  if (others.length > 0) {
    return times(times(num1, num2), others[0], ...others.slice(1))
  }

  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)
  const baseNum = digitLength(num1) + digitLength(num2)
  const leftValue = num1Changed * num2Changed
  checkBoundary(leftValue)
  return leftValue / Math.pow(10, baseNum)
}

export function divide(
  num1: numType,
  num2: numType,
  ...others: numType[]
): number {
  if (others.length > 0) {
    return divide(divide(num1, num2), others[0], ...others.slice(1))
  }
  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)
  checkBoundary(num1Changed)
  checkBoundary(num2Changed)
  return times(
    strip(num1Changed / num2Changed),
    strip(Math.pow(10, digitLength(num2) - digitLength(num1)))
  )
}

export function getMetricsExtendMinAndMax(
  metrics,
  secondaryMetrics,
  data,
  stack,
  splitNumber
) {
  const [leftMin, leftMax, rightMin, rightMax] = getMetricsMinAndMax(
    [metrics, secondaryMetrics],
    data,
    stack
  )

  const [leftExtentMin, leftExtentMax, leftInterval] = Object.values(
    getDoubleYExtendInterval([leftMin, leftMax], splitNumber)
  )

  const [rightExtentMin, rightExtentMax, rightInterval] = Object.values(
    getDoubleYExtendInterval([rightMin, rightMax], splitNumber)
  )

  let maxCount
  let minCount
  const [
    leftMaxPartCount,
    rightMaxPartCount,
    leftMinPartCount,
    rightMinPartCount
  ] = [
    divide(leftExtentMax, leftInterval),
    divide(rightExtentMax, rightInterval),
    divide(leftExtentMin, leftInterval),
    divide(rightExtentMin, rightInterval)
  ]
  if (leftExtentMin > 0 && rightExtentMin > 0) {
    maxCount = Math.max(leftMaxPartCount, rightMaxPartCount)
    minCount = Math.max(leftMinPartCount, rightMinPartCount)
  } else if (leftExtentMax < 0 && rightExtentMax < 0) {
    maxCount = Math.min(leftMaxPartCount, rightMaxPartCount)
    minCount = Math.min(leftMinPartCount, rightMinPartCount)
  } else {
    maxCount = Math.max(leftMaxPartCount, rightMaxPartCount)
    minCount = Math.min(leftMinPartCount, rightMinPartCount)
  }
  return {
    leftY: [
      times(minCount, leftInterval),
      times(maxCount, leftInterval),
      leftInterval
    ],
    rightY: [
      times(minCount, rightInterval),
      times(maxCount, rightInterval),
      rightInterval
    ]
  }
}
