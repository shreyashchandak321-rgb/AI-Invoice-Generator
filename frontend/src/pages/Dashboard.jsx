import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dashboardStyles as s, kpiCardStyles as k } from "../assets/dummyStyles";
import { FaFileInvoiceDollar, FaIndianRupeeSign, FaClock } from "react-icons/fa6";
import { API_BASE } from "../config";

const kpiCards = [
  {
    label: "TOTAL INVOICES",
    icon: FaFileInvoiceDollar,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trend: "8.5%",
    trendUp: true,
    subtitle: "Active invoices",
    getValue: (invoices) => invoices.length,
  },
  {
    label: "TOTAL PAID",
    icon: FaIndianRupeeSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    trend: "12.2%",
    trendUp: true,
    subtitle: "Received amount (INR)",
    getValue: (invoices) => {
      const total = invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
      return `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    },
  },
  {
    label: "TOTAL UNPAID",
    icon: FaClock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    trend: "3.1%",
    trendUp: false,
    subtitle: "Outstanding balance (INR)",
    getValue: (invoices) => {
      const total = invoices
        .filter((i) => i.status !== "paid")
        .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
      return `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    },
  },
];

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = await window.__clerk?.session?.getToken();
        const res = await fetch(`${API_BASE}/api/invoices`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success) setInvoices(data.data);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const paidRate = invoices.length ? Math.round((paidCount / invoices.length) * 100) : 0;
  const avgInvoice = invoices.length
    ? invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0) / invoices.length
    : 0;

  return (
    <div className={s.pageContainer}>
      {/* Page Header */}
      <div className={s.headerContainer}>
        <h1 className={s.headerTitle}>Dashboard Overview</h1>
        <p className={s.headerSubtitle}>
          Track your invoicing performance and business insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className={s.kpiGrid}>
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const value = card.getValue(invoices);
          return (
            <div key={i} className={k.cardContainer}>
              <div className={k.animatedBackground} />
              <div className={k.cornerAccent} />
              <div className={k.content}>
                <div className={k.iconTrendContainer}>
                  <div className={`${k.iconContainer} ${card.iconBg}`}>
                    <Icon className={k.icon} size={20} style={{ color: card.iconColor === "text-blue-600" ? "#2563eb" : card.iconColor === "text-green-600" ? "#16a34a" : "#f97316" }} />
                  </div>
                  <span
                    className={`${k.trendBadge} ${
                      card.trendUp ? k.trendBadgePositive : k.trendBadgeNegative
                    }`}
                  >
                    <span>{card.trendUp ? "↗" : "↘"}</span>
                    {card.trend}
                  </span>
                </div>
                <div className={k.textContent}>
                  <p className={k.title}>{card.label}</p>
                  <h3 className={k.value}>{value}</h3>
                  <p className={k.hint}>
                    <span className={k.hintIcon}>⊙</span>
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className={s.quickStatsCard}>
          <h3 className={s.quickStatsTitle}>Quick Stats</h3>
          <div className="space-y-4 mt-4">
            <div className={s.quickStatsRow}>
              <span className={s.quickStatsLabel}>Paid Rate</span>
              <span className={s.quickStatsValue}>{paidRate}%</span>
            </div>
            <div className={s.quickStatsRow}>
              <span className={s.quickStatsLabel}>Avg. Invoice</span>
              <span className={s.quickStatsValue}>
                ₹{avgInvoice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={s.quickStatsRow}>
              <span className={s.quickStatsLabel}>Collection Eff.</span>
              <span className={s.quickStatsValue}>{paidRate}%</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-blue-500/20">
            <h4 className="text-sm font-medium text-blue-100 mb-3">
              Quick Actions
            </h4>
            <div className={s.quickActionsContainer}>
              <Link
                to="/create-invoice"
                className={`${s.quickActionButton} ${s.quickActionBlue}`}
              >
                <div className={`${s.quickActionIconContainer} ${s.quickActionIconBlue}`}>
                  <FaFileInvoiceDollar size={16} />
                </div>
                <span className={s.quickActionText}>New Invoice</span>
              </Link>
              <Link
                to="/business-profile"
                className={`${s.quickActionButton} ${s.quickActionGray}`}
              >
                <div className={`${s.quickActionIconContainer} ${s.quickActionIconGray}`}>
                  <FaIndianRupeeSign size={16} />
                </div>
                <span className={s.quickActionText}>Business Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Invoices
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Latest 5 invoices from your account
                </p>
              </div>
              <Link
                to="/invoices"
                className="mt-3 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                View All <span>→</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400">
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FaFileInvoiceDollar className="text-gray-300" size={28} />
              </div>
              <p className="text-gray-500 font-medium">No invoices yet</p>
              <Link
                to="/create-invoice"
                className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Create your first invoice →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      CLIENT & ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      AMOUNT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      DUE DATE
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr
                      key={inv._id}
                      className="hover:bg-gray-50/50 transition-colors duration-150 group cursor-pointer"
                      onClick={() => navigate(`/invoices/${inv._id}/preview`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium group-hover:scale-110 transition-transform duration-200">
                            {(inv.clientName || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {inv.clientName || "—"}
                            </div>
                            <div className="text-sm text-gray-500">
                              INV-
                              {inv.invoiceNumber || inv._id?.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₹
                        {(inv.totalAmount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === "paid"
                              ? "bg-green-50 text-green-700"
                              : inv.status === "pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {inv.status?.charAt(0).toUpperCase() +
                            inv.status?.slice(1) || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/${inv._id}/preview`);
                          }}
                        >
                          View <span>→</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
