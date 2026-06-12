"use client"

import { useMemo } from "react"
import { scaleLinear, scaleBand, max } from "d3"
import { motion } from "framer-motion"

interface BarChartProps {
  data: { label: string; value: number; color?: string; value2?: number; color2?: string }[]
  className?: string
  height?: number
}

export default function RosenBarChart({ data, className = "", height = 280 }: BarChartProps) {
  const margin = { top: 20, right: 20, bottom: 40, left: 60 }
  const width = 600
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const xScale = useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.3)
  }, [data, innerWidth])

  const yScale = useMemo(() => {
    const maxVal = max(data, (d) => Math.max(d.value, d.value2 || 0)) || 0
    return scaleLinear()
      .domain([0, maxVal])
      .nice()
      .range([innerHeight, 0])
  }, [data, innerHeight])

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {yScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line
                x1={0}
                x2={innerWidth}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4,4"
                strokeWidth={0.5}
              />
            </g>
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const bandWidth = xScale.bandwidth()
            const xBase = xScale(d.label) || 0
            const hasTwo = d.value2 !== undefined
            const w1 = hasTwo ? bandWidth * 0.4 : bandWidth * 0.8
            const w2 = hasTwo ? bandWidth * 0.4 : 0
            const x1 = hasTwo ? xBase + bandWidth * 0.05 : xBase + bandWidth * 0.1
            const x2 = xBase + bandWidth * 0.55

            const bar1Height = innerHeight - yScale(d.value)
            const bar1Y = yScale(d.value)
            const color1 = d.color || (i % 2 === 0 ? "#02F5D4" : "#2272FF")

            return (
              <motion.g
                key={d.label}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                style={{ originY: innerHeight }}
              >
                <defs>
                  <linearGradient id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color1} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={color1} stopOpacity={0.4} />
                  </linearGradient>
                  {hasTwo && d.color2 && (
                    <linearGradient id={`barGrad2-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={d.color2} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={d.color2} stopOpacity={0.4} />
                    </linearGradient>
                  )}
                </defs>
                <rect
                  x={x1}
                  y={bar1Y}
                  width={w1}
                  height={bar1Height}
                  fill={`url(#barGrad-${i})`}
                  rx={4}
                  ry={4}
                />
                {hasTwo && d.value2 !== undefined && d.color2 && (
                  <rect
                    x={x2}
                    y={yScale(d.value2)}
                    width={w2}
                    height={innerHeight - yScale(d.value2)}
                    fill={`url(#barGrad2-${i})`}
                    rx={4}
                    ry={4}
                  />
                )}
              </motion.g>
            )
          })}

          {/* X Axis */}
          {data.map((d) => (
            <text
              key={`x-${d.label}`}
              x={(xScale(d.label) || 0) + xScale.bandwidth() / 2}
              y={innerHeight + 20}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize={10}
              fontFamily="var(--font-outfit), sans-serif"
            >
              {d.label}
            </text>
          ))}

          {/* Y Axis labels */}
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
      {data.some((d) => d.value2 !== undefined) && (
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: data[0]?.color || "#02F5D4" }} />
            <span className="text-xs text-slate-400">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: data[0]?.color2 || "#FF6B6B" }} />
            <span className="text-xs text-slate-400">Gastos</span>
          </div>
        </div>
      )}
    </div>
  )
}
