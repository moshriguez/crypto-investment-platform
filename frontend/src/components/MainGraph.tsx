import React, { useCallback, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { scaleLinear, scaleTime } from "@visx/scale";
import { Bar, Line, LinePath } from "@visx/shape";
import { Group } from "@visx/group";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector, extent } from "d3-array";

import Axis from "./Axis";
import {
  currencyFormatter,
  findMinPrice,
  findMaxPrice,
  formatDate,
} from "../utils";
import { HistoricalData, Timeframe } from "../types";

interface MainGraphProps {
  data: HistoricalData[];
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideAxis?: boolean;
  withoutTooltip?: boolean;
  border?: boolean;
  timeframe?: Timeframe;
}

const MainGraph: React.FC<MainGraphProps> = ({
  border,
  children,
  data,
  width,
  height,
  margin,
  hideAxis,
  timeframe,
  withoutTooltip,
}) => {
  const { showTooltip, hideTooltip, tooltipData, tooltipTop, tooltipLeft } =
    useTooltip<HistoricalData>();

  // accessors
  const getDate = (d: HistoricalData) => d.date;
  const getPrice = (d: HistoricalData) => d.price;
  const bisectDate = bisector<HistoricalData, Date>((d, x) => {
    if (x > d.date) {
      return 1;
    } else if (d.date > x) {
      return -1;
    } else {
      return 0;
    }
  }).left;

  // Max size for Graph
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(height - margin.top - margin.bottom, 0);

  // Scaling
  const dateScale = useMemo(() => {
    return scaleTime({
      range: [0, xMax],
      domain: extent(data, getDate) as [Date, Date],
    });
  }, [xMax, data]);
  const priceScale = useMemo(() => {
    return scaleLinear({
      range: [yMax + margin.top, margin.top],
      domain: [findMinPrice(data), findMaxPrice(data)],
      nice: true,
    });
  }, [margin.top, yMax, data]);

  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: priceScale(getPrice(d)),
      });
    },
    [showTooltip, priceScale, dateScale, data, margin.left]
  );

  return (
    <Box
      sx={
        border
          ? {
              border: 1,
              borderColor: grey[400],
              display: "flex",
              justifyContent: "center",
            }
          : null
      }
    >
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <LinePath
            data={data}
            x={(d) => dateScale(getDate(d)) || 0}
            y={(d) => priceScale(getPrice(d)) || 0}
            strokeWidth={1.25}
            stroke={"#000"}
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
        </Group>
        {!withoutTooltip && (
          <>
            <Bar
              x={margin.left}
              y={margin.top * 2}
              width={xMax}
              height={yMax}
              fill="transparent"
              rx={14}
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
            />
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft, y: margin.top * 2 }}
                  to={{ x: tooltipLeft, y: yMax + margin.top * 2 }}
                  stroke="#000"
                  strokeWidth={2}
                  opacity={0.5}
                  pointerEvents="none"
                  strokeDasharray="5,5"
                />
                <circle
                  cx={tooltipLeft}
                  cy={tooltipTop ? tooltipTop + 1 + margin.top : undefined}
                  r={4}
                  fill="black"
                  fillOpacity={0.1}
                  stroke="black"
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <circle
                  cx={tooltipLeft}
                  cy={tooltipTop ? tooltipTop + margin.top : undefined}
                  r={4}
                  fill={grey[500]}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            )}
          </>
        )}
      </svg>
      {!withoutTooltip && tooltipData && (
        <Box sx={{ position: "relative" }}>
          <TooltipWithBounds
            key={Math.random()}
            applyPositionStyle
            top={tooltipTop ? tooltipTop - yMax - margin.top * 2 : undefined}
            left={tooltipLeft ? tooltipLeft + 12 : undefined}
            style={defaultStyles}
          >
            <Typography>{`Price: ${currencyFormatter(
              getPrice(tooltipData)
            )}`}</Typography>
            <Typography>
              {timeframe ? formatDate(getDate(tooltipData), timeframe) : null}
            </Typography>
          </TooltipWithBounds>
        </Box>
      )}
    </Box>
  );
};

export default MainGraph;
