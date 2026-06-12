"use client"

import { useMemo } from "react"
import { pie, arc } from "d3"
import { motion } from "framer-motion"

interface PieChartProps {
  data: { label: string; value: number; color?: string }[]
  className?: string
  height?: number
}

export default function RosenPieChart({ data, className = "", height = 260 }: PieChartProps) {
  const width = 320
  const radius = Math.min(width, height) / 2 - 20

  const pieGenerator = useMemo(() => {
    return pie<{ label: string; value: number }>()
      .value((d) => d.value)
      .sort(null)
  }, [])

  const arcGenerator = useMemo(() => {
    return arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius)
      .cornerRadius(4)
  }, [radius])

  const arcs = useMemo(() => pieGenerator(data), [pieGenerator, data])

  const defaultColors = ["#02F5D4", "#2272FF", "#FF6B6B", "#FFE66D", "#A78BFA"]

  return (
    <div className={`w-full overflow-hidden flex items-center justify-center ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-w-[320px]" preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${width / 2},${height / 2})`}>
          {arcs.map((d, i) => {
            const color = data[i].color || defaultColors[i % defaultColors.length]
            return (
              <motion.path
                key={d.data.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                d={arcGenerator(d) || undefined}
                fill={color}
                stroke="#050505"
                strokeWidth={2}
              />
            )
          })}
          {/* Center text */}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={14}
            fontWeight={700}
            fontFamily="var(--font-space-grotesk), sans-serif"
          >
            {data.reduce((sum, d) => sum + d.value, 0)}
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 ml-4">
        {data.map((d, i) => {
          const color = d.color || defaultColors[i % defaultColors.length]
          return (
            <div key={d.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-xs text-white/60 font-sans">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
