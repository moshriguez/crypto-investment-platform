import React from 'react'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis'
import { HistoricalData } from '../types'

interface LineGraphProps {
    data: HistoricalData[]
    xScale: AxisScale<number>
    yScale: AxisScale<number>
    width: number
    yMax: number
    margin: { top: number, right: number, bottom: number, left: number }
    hideBottomAxis?: boolean
    hideLeftAxis?: boolean
    stroke: string
    CurrencyTickFormat?: (d: any) => any
}

const LineGraph: React.FC<LineGraphProps> = ({data, xScale, yScale, width, yMax, margin, hideBottomAxis, hideLeftAxis, stroke, CurrencyTickFormat}) => {

    // accessors
    const getDate = (d: HistoricalData) => d.date
    const getPrice = (d: HistoricalData) => d.price

    return (
        <Group left={margin.left} top={margin.top}>
            <LinePath<HistoricalData> 
                data={data}
                x={(d) => xScale(getDate(d)) || 0}
                y={(d) => yScale(getPrice(d)) || 0}
                strokeWidth={1.25}
                stroke={stroke}
            />
            {!hideBottomAxis && (
                <AxisBottom
                    top={yMax + margin.top}
                    scale={xScale}
                    numTicks={width > 520 ? 10 : 5}
                    stroke={'#000'}
                    tickStroke={'#000'}
                    tickLabelProps={() => {
                        return {
                            textAnchor: "middle" as const,
                            fontFamily: "Roboto",
                            fontSize: 10,
                            fill: '#000'
                        }}}
                />
            )}
            {!hideLeftAxis && (
                <AxisLeft
                    scale={yScale}
                    numTicks={5}
                    stroke={'#000'}
                    tickStroke={'#000'}
                    tickLabelProps={() => {
                        return {
                            dx: "-0.25em",
                            dy: "0.25em",
                            fontFamily: "Roboto",
                            fontSize: 10,
                            textAnchor: "end" as const,
                            fill: '#000',
                        }}}
                />
            )}
        </Group>
    )
}

export default LineGraph