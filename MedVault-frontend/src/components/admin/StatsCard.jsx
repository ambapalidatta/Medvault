import Icon from "./Icon.jsx";

export default function StatsCard({ title, value, icon, color }) {
    const colorSchemes = {
        indigo: { icon: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-l-indigo-500' },
        teal: { icon: 'text-teal-500', bg: 'bg-teal-50', border: 'border-l-teal-500' },
        blue: { icon: 'text-blue-500', bg: 'bg-blue-50', border: 'border-l-blue-500' },
        rose: { icon: 'text-rose-500', bg: 'bg-rose-50', border: 'border-l-rose-500' },
        purple: { icon: 'text-purple-500', bg: 'bg-purple-50', border: 'border-l-purple-500' },
        amber: { icon: 'text-amber-500', bg: 'bg-amber-50', border: 'border-l-amber-500' },
        emerald: { icon: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
    };

    const scheme = colorSchemes[color] || colorSchemes.blue;

    return (
        <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-slate-100 border-l-4 ${scheme.border}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-2 whitespace-nowrap">{title}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${scheme.bg}`}>
                    <Icon name={icon} size={24} className={scheme.icon} />
                </div>
            </div>
        </div>
    );
}
