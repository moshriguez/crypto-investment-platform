import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { grey } from '@mui/material/colors'
import { scaleLinear, scaleTime } from '@visx/scale'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'

import Axis from './Axis'
import { findMinPrice, findMaxPrice } from '../utils'
import { HistoricalData } from '../types'

interface MainGraphProps {
    data: HistoricalData[]
    width: number
    height: number
    margin: { top: number, right: number, bottom: number, left: number }
    hideAxis?: boolean
    border?: boolean
}

const MainGraph: React.FC<MainGraphProps> = ({border, children, data, width, height, margin, hideAxis}) => {

    // accessors
    const getDate = (d: HistoricalData) => d.date
    const getPrice = (d: HistoricalData) => d.price
    
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
                <Group left={margin.left} top={margin.top}>
                    <LinePath 
                        data={data}
                        x={(d) => dateScale(getDate(d)) || 0}
                        y={(d) => priceScale(getPrice(d)) || 0}
                        strokeWidth={1.25}
                        stroke={'#000'}
                    />
                    {!hideAxis && (
                        <Axis 
                            xScale={dateScale}
                            yScale={priceScale}
                            width={width}
                            yMax={yMax}
                            margin={margin}
                        />
                    )}
                    {children}
                </Group>
            </svg>
        </Box>
    )
}

export default MainGraph