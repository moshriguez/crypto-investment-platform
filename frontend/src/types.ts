export interface Pair {
    id: string
    base_currency: string
    quote_currency: string
    base_min_size: string
    base_max_size: string
    quote_increment: string
    base_increment: string
    display_name: string
    min_market_funds: string
    max_market_funds: string
    margin_enabled: boolean
    fx_stablecoin: boolean
    max_slippage_percentage: string
    post_only: boolean
    limit_only: boolean
    cancel_only: boolean
    trading_disabled: boolean
    status: string
    status_message: string
    auction_mode: boolean
}

export interface Digest {
    best_ask: string
    best_bid: string
    high_24h: string
    last_size: string
    low_24h: string
    open_24h: string
    price: string
    product_id: string
    sequence: number
    side: string
    time: string
    trade_id: number
    type: string
    volume_24h: string
    volume_30d: string
}

export type Candle = number[]

export type Timeframe = '1D' | '7D' | '1M' | '3M'

export interface HistoricalData {
    date: Date
    price: number
}

export interface User {
    name: string
    email: string
    password: string
    watchList: string[]
    _id: string
}
