import React from 'react'
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis'
import numeral from 'numeral'

interface AxisProps {
    xScale: AxisScale<number>
    yScale: AxisScale<number>
    width: number
    yMax: number
    margin: { top: number, right: number, bottom: number, left: number }
}
const Axis: React.FC<AxisProps> = ({ xScale, yScale, yMax, width, margin }) => {
    return (
        <>
           <AxisBottom 
                top={yMax + margin.top}
                scale={xScale}
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
            <AxisLeft 
                scale={yScale}
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

        </>
    )
}

export default Axis
