"use client"

import { useMemo } from "react"
import { scaleLinear, scalePoint, line, curveMonotoneX, max } from "d3"
import { motion } from "framer-motion"

interface LineChartProps {
  data: { label: string; value: number }[]
  className?: string
  height?: number
  color?: string
}

export default function RosenLineChart({ data, className = "", height = 280, color = "#02F5D4" }: LineChartProps) {
  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const width = 600
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const xScale = useMemo(() => {
    return scalePoint<string>()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.5)
  }, [data, innerWidth])

  const yScale = useMemo(() => {
    return scaleLinear()
      .domain([0, (max(data, (d) => d.value) || 0) * 1.1])
      .nice()
      .range([innerHeight, 0])
  }, [data, innerHeight])

  const lineGenerator = useMemo(() => {
    return line<{ label: string; value: number }>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScale(d.value))
      .curve(curveMonotoneX)
  }, [xScale, yScale])

  const pathD = useMemo(() => lineGenerator(data) || "", [lineGenerator, data])

  // Area generator for gradient fill
  const areaD = useMemo(() => {
    const areaGen = line<{ label: string; value: number }>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScale(d.value))
      .curve(curveMonotoneX)
    return areaGen(data) || ""
  }, [xScale, yScale, data])

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid */}
          {yScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line x1={0} x2={innerWidth} stroke="rgba(255,255,255,0.08)" strokeDasharray="4,4" strokeWidth={0.5} />
            </g>
          ))}

          {/* Area fill */}
          {areaD && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              d={`${areaD} L ${innerWidth} ${innerHeight} L 0 ${innerHeight} Z`}
              fill="url(#lineAreaGrad)"
            />
          )}

          {/* Line */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {data.map((d, i) => (
            <motion.circle
              key={d.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
              cx={xScale(d.label) || 0}
              cy={yScale(d.value)}
              r={4}
              fill="#050505"
              stroke={color}
              strokeWidth={2}
            />
          ))}

          {/* X labels */}
          {data.map((d) => (
            <text
              key={`x-${d.label}`}
              x={xScale(d.label) || 0}
              y={innerHeight + 20}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize={10}
              fontFamily="var(--font-outfit), sans-serif"
            >
              {d.label}
            </text>
          ))}

          {/* Y labels */}
          {yScale.ticks(5).map((tick) => (
            <text
              key={`y-${tick}`}
              x={-10}
              y={yScale(tick)}
              dy="0.32em"
              textAnchor="end"
              fill="rgba(255,255,255,0.4)"
              fontSize={10}
              fontFamily="var(--font-outfit), sans-serif"
            >
              {tick}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}
