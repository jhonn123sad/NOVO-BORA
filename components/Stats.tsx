import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { ChartDataPoint } from '../types';
import { TOTAL_POSSIBLE_POINTS } from '../constants';

interface StatsProps {
  currentPoints: number;
  history: ChartDataPoint[];
}

const ProgressRing: React.FC<{ points: number; max: number }> = ({ points, max }) => {
  const radius = 45; 
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (points / max) * circumference;
  
  const percentage = Math.round((points / max) * 100);

  // Determine color based on progress
  let progressColor = "#6366f1"; // Indigo default
  if (percentage >= 100) progressColor = "#10b981"; // Emerald
  else if (percentage >= 50) progressColor = "#f59e0b"; // Amber

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="relative flex items-center justify-center">
          <svg
            height={radius * 2.8}
            width={radius * 2.8}
            className="transform -rotate-90"
          >
            <circle
              stroke="#1e293b"
              strokeWidth={stroke}
              fill="transparent"
              r={normalizedRadius}
              cx={radius * 1.4}
              cy={radius * 1.4}
            />
            <circle
              stroke={progressColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius * 1.4}
              cy={radius * 1.4}
            />
          </svg>
          <div className="absolute flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <span className="text-3xl font-black text-white drop-shadow-sm">{points}</span>
            <span className="text-sm font-medium text-slate-400">/ {max}</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-base font-semibold text-slate-200">Pontos do Dia</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{percentage}% Concluído</p>
        </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-slate-400 text-xs mb-1 font-mono">{label}</p>
        <p className="text-indigo-400 font-bold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {payload[0].value} Pontos
        </p>
      </div>
    );
  }
  return null;
};

const Stats: React.FC<StatsProps> = ({ currentPoints, history }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
      {/* Daily Progress */}
      <div className="lg:col-span-1 min-h-[250px]">
        <ProgressRing points={currentPoints} max={TOTAL_POSSIBLE_POINTS} />
      </div>

      {/* History Chart */}
      <div className="lg:col-span-3 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 flex flex-col shadow-lg min-h-[250px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-200 text-lg font-bold flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
            Histórico 30 Dias
          </h3>
          <div className="text-xs font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
            TEMPO REAL
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const [y, m, d] = val.split('-');
                  return `${d}/${m}`;
                }}
                minTickGap={30}
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                tickLine={false}
                axisLine={false}
                domain={[0, TOTAL_POSSIBLE_POINTS]} 
                ticks={[0, 3, 6, 9, 13]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="points" 
                stroke="#818cf8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPoints)" 
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default Stats;