import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts"

import { cn } from "@/lib/utils"
import React from "react"

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showGridLines?: boolean
  startEndOnly?: boolean
  layout?: "vertical" | "horizontal"
  className?: string
}

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value: number) => `${value}`,
  showLegend = true,
  showGridLines = true,
  startEndOnly = false,
  layout = "vertical",
  className,
}: ChartProps) {
  const chartId = React.useId();

  return (
    <ResponsiveContainer width="100%" height="100%" className={cn(className)}>
      <RechartsBarChart data={data} layout={layout}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey={index}
          type="category"
          tickLine={true}
          axisLine={true}
          interval="preserveStartEnd"
          tick={{ fontSize: 12 }}
        />
        <YAxis tickLine={true} axisLine={true} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => valueFormatter(value)}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: "12px" }}
          />
        )}
        {categories.map((category, i) => (
          <Bar
            key={`${chartId}-bar-${category}-${i}`}
            dataKey={category}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function AreaChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value: number) => `${value}`,
  showLegend = false,
  showGridLines = false,
  startEndOnly = true,
  className,
}: ChartProps) {
  const chartId = React.useId();

  return (
    <ResponsiveContainer width="100%" height="100%" className={cn(className)}>
      <RechartsAreaChart data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey={index}
          type="category"
          tickLine={true}
          axisLine={true}
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={true}
          axisLine={true}
          tick={{ fontSize: 12 }}
          tickFormatter={valueFormatter}
          domain={['auto', 'auto']}
          allowDecimals={true}
          scale="linear"
        />
        <Tooltip
          formatter={valueFormatter}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            padding: "8px",
          }}
        />
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: "12px" }}
          />
        )}
        {categories.map((category, i) => (
          <Area
            key={`${chartId}-area-${category}-${i}`}
            type="monotone"
            dataKey={category}
            fill={colors[i % colors.length]}
            stroke={colors[i % colors.length]}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({
  data,
  index,
  category,
  colors,
  valueFormatter = (value: number) => `${value}`,
  showLegend = false,
  className,
}: {
  data: any[]
  index: string
  category: string
  colors: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  className?: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={cn(className)}>
      <PieChart>
        <Pie
          data={data}
          nameKey={index}
          dataKey={category}
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            textAlign: "left",
            minWidth: "200px",
            whiteSpace: "pre-line",
            lineHeight: "1.5",
            color: "#ffffff !important"
          }}
          wrapperStyle={{
            outline: "none",
            zIndex: 1000,
            width: "auto",
            maxWidth: "80%"
          }}
          labelStyle={{
            color: "#ffffff !important"
          }}
          itemStyle={{
            color: "#ffffff !important"
          }}
          allowEscapeViewBox={{ x: false, y: false }}
        />
        {showLegend && (
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            wrapperStyle={{ fontSize: "12px", paddingLeft: "24px" }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
