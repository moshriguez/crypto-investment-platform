import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { scaleLinear, scaleTime } from '@visx/scale'

import LineGraph from "./LineGraph"
import { findMinPrice, findMaxPrice } from '../utils'
import { HistoricalData } from '../types'
import { grey } from '@mui/material/colors'

interface MainGraphProps {
    data: HistoricalData[]
    width: number
    height: number
    margin: { top: number, right: number, bottom: number, left: number }
    hideBottomAxis?: boolean
    hideLeftAxis?: boolean
    border?: boolean
}

const MainGraph: React.FC<MainGraphProps> = ({border, data, width, height, margin, hideBottomAxis, hideLeftAxis}) => {

    // Max size for Graph
    const xMax = Math.max(width - margin.left - margin.right, 0)
    const yMax = Math.max(height - margin.top - margin.bottom, 0)
    // Scaling
    const dateScale = useMemo(() => {
        return scaleTime({
            range: [0, xMax],
            domain: [data[data.length -1]?.date, data[0]?.date]
        })
    }, [xMax, data])
    const priceScale = useMemo(() => {
        return scaleLinear({
            range: [yMax + margin.top, margin.top],
            domain: [findMinPrice(data), findMaxPrice(data)],
            nice: true
        })
    }, [margin.top, yMax, data])

    return (
        <Box sx={border ? { border: 1, borderColor: grey[400], display: 'flex', justifyContent: 'center'} : null}>
            <svg width={width} height={height}>
                <LineGraph 
                    data={data}
                    width={width}
                    margin={margin}
                    yMax={yMax}
                    xScale={dateScale}
                    yScale={priceScale}
                    stroke={'#000'}
                    hideBottomAxis={hideBottomAxis}
                    hideLeftAxis={hideLeftAxis}
                />
            </svg>
        </Box>
    )
}

export default MainGraph