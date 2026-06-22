const StatusBadge = ({ status }) => {
  const colors = {
    paid: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", icon: "✓" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: "⏳" },
    overdue: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: "!" },
    draft: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", icon: "✎" },
  };

  const c = colors[status?.toLowerCase()] || colors.draft;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span>{c.icon}</span>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;
