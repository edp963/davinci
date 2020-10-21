import { round } from 'node_modules/echarts/lib/util/number'
class DoubleY {
  private initExtent = [0, 0]
  private originalExtent = []
  private splitNumber = 5
  constructor(extent, number) {
    this.originalExtent = extent
    this.splitNumber = number
  }

  private formatInterval (val: number) {
    if (val === 0) {
      return 0
    }
    let exponent = Math.floor(Math.log(val) / Math.LN10)
    if (val / Math.pow(10, exponent) >= 10) {
      exponent++
    }
    const exp10 = Math.pow(10, exponent)
    const f = val / exp10
    val = f * exp10
    return exponent >= -20 ? +this.formatDecimal(val, 2) : val
  }

  private formatDecimal (num, decimal) {
    num = num.toString()
    const index = num.indexOf('.')
    if (index !== -1) {
      num = num.substring(0, decimal + index + 1)
    } else {
      num = num.substring(0)
    }
    return parseFloat(num).toFixed(decimal)
  }

  private calculateInterval () {
    const extent = this.initExtent
    const [minExtent, maxExtent] = extent
    let differ = maxExtent - minExtent
    if (!isFinite(differ)) {
      return
    }
    if (differ < 0) {
      differ = -differ
      extent.reverse()
    }
    differ = extent[1] - extent[0]
    return this.formatInterval(differ / this.splitNumber)
  }

  public computeExtendInterval () {
    let [min, max] = this.originalExtent
    if (min > 0 && max > 0) {
      min = 0
    }
    if (min < 0 && max < 0) {
      max = 0
    }
    this.initExtent = [min, max]
    let [minExtent, maxExtent] = this.initExtent
    if (minExtent === maxExtent) {
      if (minExtent !== 0) {
        const expandSize = minExtent
        maxExtent += expandSize / 2
        minExtent -= expandSize / 2
      } else {
        maxExtent = 1
      }
    }
    const span = maxExtent - minExtent
    if (!isFinite(span)) {
      minExtent = 0
      maxExtent = 1
    }
    const interval = this.calculateInterval()
    minExtent = round((Math.floor(minExtent / interval)) * interval)
    const maxNumber = Number.isInteger(maxExtent / interval) ? (maxExtent / interval) + 1 : (maxExtent / interval)
    maxExtent = round((Math.ceil((maxNumber))) * interval)
    const extent = [minExtent, maxExtent]
    return {
      extent,
      interval
    }
  }
}

export default DoubleY
