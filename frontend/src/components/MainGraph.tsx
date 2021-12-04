import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { grey } from '@mui/material/colors'
import { scaleLinear, scaleTime } from '@visx/scale'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { AxisLeft, AxisBottom } from '@visx/axis'
import numeral from 'numeral'


import { findMinPrice, findMaxPrice } from '../utils'
import { HistoricalData } from '../types'

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
                    {!hideBottomAxis && (
                        <AxisBottom 
                            top={yMax + margin.top}
                            scale={dateScale}
                            numTicks={width > 500 ? 10 : 5}
                            stroke={'#000'}
                            tickStroke={'#000'}
                            tickLabelProps={() => {
                                return {
                                    textAnchor: 'middle',
                                    fontFamily: 'Roboto',
                                    fontSize: 10,
                                    fill: '#000'
                                }}}
                        />
                    )}
                    {!hideLeftAxis && (
                        <AxisLeft 
                            scale={priceScale}
                            numTicks={5}
                            stroke={'#000'}
                            tickStroke={'#000'}
                            tickLabelProps={() => {
                                return {
                                    dx: '-0.25em',
                                    dy: '0.25em',
                                    fontFamily: 'Roboto',
                                    fontSize: 10,
                                    textAnchor: 'end',
                                    fill: '#000'
                                }}}
                            tickFormat={(n) => {
                                return numeral(n).format(n <= 100 ? '$0.00' : '$0,0')
                            }}
                        />
                    )}
                </Group>
            </svg>
        </Box>
    )
}

export default MainGraph