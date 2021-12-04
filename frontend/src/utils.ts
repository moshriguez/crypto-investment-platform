import numeral from 'numeral'
import { format } from 'date-fns'

import { Candle, HistoricalData, Timeframe } from "./types";

const url = 'https://api.pro.coinbase.com'

// Calculation Helpers
export const findMinPrice = (arr: HistoricalData[]) => {
    let min = Infinity
    arr.forEach(e => {
        if (e.price < min) {
            min = e.price
        }
    })
    return min
}

export const findMaxPrice = (arr: HistoricalData[]) => {
    let max = -Infinity
    arr.forEach(e => {
        if (e.price > max) {
            max = e.price
        }
    })
    return max
}

export const calcStartDate = (now: Date, timeframe: Timeframe) => {
    const timeMapper = {
        '1D': 1000 * 60 * 60 * 24,
        '7D': 1000 * 60 * 60 * 24 * 7,
        '1M': 1000 * 60 * 60 * 24 * 30,
        '3M': 1000 * 60 * 60 * 24 * 30 * 3
    }
    const temp = now.valueOf() - timeMapper[timeframe]
    return new Date(temp)
}

export const calcPercentChange = (openPrice: string | number, currentPrice: string | number) => {
    if(typeof openPrice === 'string') {
        openPrice = parseFloat(openPrice)
    }
    if(typeof currentPrice === 'string') {
        currentPrice = parseFloat(currentPrice)
    }
    const rawPercent = (currentPrice - openPrice) /  openPrice
    return numeral(rawPercent).format('0.00%')
}

// Formatters
export const currencyFormatter = (n: number) => {
    return numeral(n).format('$0,0.00')
}

export const formatDate = (date: Date, timeframe: Timeframe) => {
    if(timeframe === '3M') {
        return format(date, 'PP')
    } else {
        return format(date, 'PPpp')
    }
}

// API calls
export const fetchCryptoName = async (pair: string, setCryptoName: (arg: string)=>void ) => {
    const currCode = pair.split('-')[0]
    const res = await fetch(`${url}/currencies/${currCode}`)
    const data = await res.json()
    setCryptoName(data.name)
  }

export const fetchHistoricalData = async (pair: string, setHistoricalData: (arr: HistoricalData[]) => void, timeframe: Timeframe = '1D', setPercentChange?: (arg: string) => void) => {
    let granularity = {
      '1D': 300,
      '7D': 3600,
      '1M': 21600,
      '3M': 86400,
      '1Y': 86400
    }
    let now = new Date()
    let startDate = calcStartDate(now, timeframe)
    const res = await fetch(`${url}/products/${pair}/candles?granularity=${granularity[timeframe]}&start=${startDate.toISOString()}&end=${now.toISOString()}`)
    // Candle schema: [timestamp, price_low, price_high, price_open, price_close]
    //! Candle array arranged from end to start
    const data: Candle[] = await res.json()
    if(setPercentChange) {
        setPercentChange(calcPercentChange(data[data.length - 1][3] , data[0][4]))
    }
    // console.log(data)
    const formattedData: HistoricalData[] = data.map(c => {
      return {
        date: new Date(c[0] * 1000),
        price: c[4]
      }
    })
    setHistoricalData(formattedData)
  }

