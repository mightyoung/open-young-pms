import React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

const COLORS = {
  accent: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899',
  grid: 'rgba(255,255,255,0.05)',
  text: 'rgba(255,255,255,0.6)',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a1a22',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '8px 12px',
      }}>
        <p style={{ color: '#fff', margin: 0, fontWeight: 500 }}>{label}</p>
        <p style={{ color: COLORS.accent, margin: 0, fontSize: 14 }}>
          {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export const AreaChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.3} />
          <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        tick={{ fill: COLORS.text, fontSize: 11 }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: COLORS.text, fontSize: 11 }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Area
        type="monotone"
        dataKey="value"
        stroke={COLORS.accent}
        strokeWidth={2}
        fill="url(#areaGrad)"
      />
    </AreaChart>
  </ResponsiveContainer>
)

export const BarChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        tick={{ fill: COLORS.text, fontSize: 11 }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: COLORS.text, fontSize: 11 }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar
        dataKey="tasks"
        fill={COLORS.accent}
        radius={[6, 6, 0, 0]}
        opacity={0.85}
      />
    </BarChart>
  </ResponsiveContainer>
)

export const DonutChartComponent = ({ data }) => (
  <div style={{ position: 'relative', width: '100%', height: 200 }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
        {data.reduce((acc, curr) => acc + curr.value, 0)}
      </div>
      <div style={{ fontSize: 12, color: COLORS.text }}>总任务</div>
    </div>
  </div>
)
