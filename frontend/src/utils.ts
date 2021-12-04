import numeral from 'numeral'
import { format } from 'date-fns'

import { HistoricalData, Timeframe } from "./types";


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

export const currencyFormatter = (n: number) => {
    return numeral(n).format('$0,0.00')
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

export const formatDate = (date: Date, timeframe: Timeframe) => {
    if(timeframe === '3M') {
        return format(date, 'PP')
    } else {
        return format(date, 'PPpp')
    }
}