
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesDataPoint } from '../types';

interface ChartCardProps {
    data: TimeSeriesDataPoint[];
}

const ChartCard: React.FC<ChartCardProps> = ({ data }) => {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 h-80 flex flex-col">
            <h3 className="text-lg font-bold font-orbitron text-cyan-400 mb-4">System Performance</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5, right: 30, left: 0, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#38bdf8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'QPS', angle: -90, position: 'insideLeft', fill: '#38bdf8' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#f472b6" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'CPU %', angle: -90, position: 'insideRight', fill: '#f472b6' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                borderColor: '#334155',
                                color: '#e2e8f0'
                            }}
                            labelStyle={{ color: '#cbd5e1' }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Line yAxisId="left" type="monotone" dataKey="qps" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 8 }} name="Queries/Sec" />
                        <Line yAxisId="right" type="monotone" dataKey="cpu" stroke="#f472b6" strokeWidth={2} dot={false} name="CPU Usage (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartCard;
