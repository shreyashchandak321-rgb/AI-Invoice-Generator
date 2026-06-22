const KpiCard = ({ title, value, icon, trend }) => {
  const gradients = {
    revenue: "from-emerald-500 to-teal-600",
    invoices: "from-blue-500 to-indigo-600",
    pending: "from-amber-500 to-orange-600",
    clients: "from-purple-500 to-pink-600",
  };

  const icons = {
    revenue: "$",
    invoices: "📄",
    pending: "⏳",
    clients: "👥",
    default: "📊",
  };

  const gradient = gradients[icon] || gradients.revenue;
  const emoji = icons[icon] || icons.default;

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.startsWith("+") ? "text-green-200" : "text-red-200"}`}>
              {trend} from last month
            </p>
          )}
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
    </div>
  );
};

export default KpiCard;
