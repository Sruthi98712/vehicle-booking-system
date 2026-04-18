import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function VehiclePerformanceChart({ data }) {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: 4,
            height: 400,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)'
        }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, color: '#1e293b' }}>Vehicle Distribution</Typography>
            <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {data && data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
