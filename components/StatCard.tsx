
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => (
    <div className={`bg-white rounded-lg p-5 border-l-4 ${color} shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-600">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className="text-3xl bg-slate-100 p-3 rounded-full">
                {icon}
            </div>
        </div>
    </div>
);

export default StatCard;
