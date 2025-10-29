
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: {
        value: number;
        label: string;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, trend }) => (
    <div className={`stat-card bg-white rounded-lg p-6 border-l-4 ${color} shadow-sm`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                {trend && (
                    <p className={`text-xs font-medium mt-2 ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.value > 0 ? '↗' : '↘'} {Math.abs(trend.value)}% {trend.label}
                    </p>
                )}
            </div>
            <div className="text-3xl opacity-80">
                {icon}
            </div>
        </div>
    </div>
);

export default StatCard;
