export const StatCard = ({ icon: Icon, title, value, subtitle, color = 'lime' }) => {
    const colorClasses = {
        lime: 'bg-lime-400/20 text-lime-400',
        green: 'bg-green-600/20 text-green-400',
        purple: 'bg-purple-600/20 text-purple-400',
        orange: 'bg-orange-600/20 text-orange-400',
        blue: 'bg-blue-600/20 text-blue-400'
    };

    return (
        <div className="bg-navy-900 p-6 rounded-lg border border-navy-800">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
            <p className="text-sm text-gray-400">{title}</p>
            {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
            )}
        </div>
    );
};
