import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

export default function BookingTrendChart({ data }) {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: 4,
            height: 400,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)'
        }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, color: '#1e293b' }}>Booking Trends</Typography>
            <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                            cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                        />
                        <Bar
                            dataKey="value"
                            fill="url(#colorBookings)"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
