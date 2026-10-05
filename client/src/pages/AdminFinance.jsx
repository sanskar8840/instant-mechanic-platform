import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminFinance() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingBookingId, setPayingBookingId] = useState("");

  const loadFinance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admin/finance/summary?year=${year}`
      );

      setFinanceData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load financial analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, [year]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleMarkPayoutPaid = async (bookingId) => {
    const confirmed = window.confirm(
      "Mark this mechanic payout as paid?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setPayingBookingId(bookingId);

      await api.patch(
        `/admin/finance/bookings/${bookingId}/payout-paid`
      );

      await loadFinance();

      alert("Mechanic payout marked as paid");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update mechanic payout"
      );
    } finally {
      setPayingBookingId("");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString("en-IN");
  };

  const summary = financeData?.summary || {};
  const monthlyData = financeData?.monthlyData || [];
  const mechanicBreakdown =
    financeData?.mechanicBreakdown || [];
  const recentTransactions =
    financeData?.recentTransactions || [];
  const awaitingPayments =
    financeData?.awaitingPayments || [];

  const yearOptions = Array.from(
    { length: 5 },
    (_, index) => currentYear - index
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-slate-700 bg-slate-950">
              <img
                src="/logo.svg"
                alt="Instant Mechanic Logo"
                className="h-10 w-10 object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Instant{" "}
                <span className="text-blue-400">
                  Mechanic
                </span>
              </h1>

              <p className="text-xs text-slate-400 sm:text-sm">
                Financial Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <p className="font-medium text-emerald-400">
              Finance Center
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Financial Analytics
            </h2>

            <p className="mt-2 max-w-2xl text-slate-400">
              Revenue, mechanic earnings, platform profit,
              customer payments and mechanic settlements.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Financial Year
            </label>

            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-white outline-none focus:border-emerald-500"
            >
              {yearOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading financial analytics...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <FinanceCard
                  icon={
                    <Wrench className="text-blue-400" />
                  }
                  label="Completed Services"
                  value={summary.completedServices || 0}
                />

                <FinanceCard
                  icon={
                    <CheckCircle2 className="text-emerald-400" />
                  }
                  label="Paid Services"
                  value={summary.paidServices || 0}
                />

                <FinanceCard
                  icon={
                    <Clock3 className="text-amber-400" />
                  }
                  label="Awaiting Payments"
                  value={
                    summary.awaitingPaymentServices || 0
                  }
                />

                <FinanceCard
                  icon={
                    <CreditCard className="text-rose-400" />
                  }
                  label="Outstanding Customer Payment"
                  value={formatCurrency(
                    summary.awaitingPaymentAmount
                  )}
                />
              </div>
            </section>

            <section className="mt-8">
              <h3 className="mb-5 text-2xl font-bold">
                Revenue Overview
              </h3>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <FinanceCard
                  icon={
                    <IndianRupee className="text-emerald-400" />
                  }
                  label="Customer Revenue"
                  value={formatCurrency(
                    summary.totalRevenue
                  )}
                />

                <FinanceCard
                  icon={
                    <Users className="text-purple-400" />
                  }
                  label="Mechanic Earnings"
                  value={formatCurrency(
                    summary.totalMechanicEarnings
                  )}
                />

                <FinanceCard
                  icon={
                    <WalletCards className="text-cyan-400" />
                  }
                  label="Paid to Mechanics"
                  value={formatCurrency(
                    summary.totalPaidToMechanics
                  )}
                />

                <FinanceCard
                  icon={
                    <Clock3 className="text-orange-400" />
                  }
                  label="Pending Mechanic Payout"
                  value={formatCurrency(
                    summary.totalPendingMechanicPayout
                  )}
                />

                <FinanceCard
                  icon={
                    <TrendingUp className="text-blue-400" />
                  }
                  label="Platform Gross Profit"
                  value={formatCurrency(
                    summary.platformGrossProfit
                  )}
                />

                <FinanceCard
                  icon={
                    <CreditCard className="text-amber-400" />
                  }
                  label="Gateway Fees"
                  value={formatCurrency(
                    summary.paymentGatewayFees
                  )}
                />

                <FinanceCard
                  icon={
                    <TrendingUp className="text-emerald-400" />
                  }
                  label="Platform Net Profit"
                  value={formatCurrency(
                    summary.platformNetProfit
                  )}
                />

                <FinanceCard
                  icon={
                    <CheckCircle2 className="text-violet-400" />
                  }
                  label="Settled Payouts"
                  value={summary.paidPayoutCount || 0}
                />
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold">
                  Monthly Revenue & Profit
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Financial performance for {year}.
                </p>
              </div>

              <div className="h-[360px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#10b981"
                    />
                    <Bar
                      dataKey="netProfit"
                      name="Net Profit"
                      fill="#3b82f6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h3 className="text-2xl font-bold">
                  Mechanic Financial Breakdown
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Earnings and settlement status for each
                  mechanic.
                </p>
              </div>

              {mechanicBreakdown.length === 0 ? (
                <EmptyState text="No mechanic financial data found." />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="min-w-full bg-slate-900 text-sm">
                    <thead className="bg-slate-800/70 text-left text-slate-300">
                      <tr>
                        <th className="px-5 py-4">
                          Mechanic
                        </th>
                        <th className="px-5 py-4">
                          Paid Services
                        </th>
                        <th className="px-5 py-4">
                          Revenue
                        </th>
                        <th className="px-5 py-4">
                          Earnings
                        </th>
                        <th className="px-5 py-4">
                          Paid
                        </th>
                        <th className="px-5 py-4">
                          Pending
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {mechanicBreakdown.map(
                        (mechanic) => (
                          <tr
                            key={mechanic.mechanicId}
                            className="border-t border-slate-800"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold">
                                {mechanic.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {mechanic.email}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              {
                                mechanic.completedPaidServices
                              }
                            </td>

                            <td className="px-5 py-4">
                              {formatCurrency(
                                mechanic.customerRevenue
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {formatCurrency(
                                mechanic.totalEarnings
                              )}
                            </td>

                            <td className="px-5 py-4 text-emerald-400">
                              {formatCurrency(
                                mechanic.paidAmount
                              )}
                            </td>

                            <td className="px-5 py-4 text-amber-400">
                              {formatCurrency(
                                mechanic.pendingAmount
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h3 className="text-2xl font-bold">
                  Recent Paid Transactions
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Successful customer payments and mechanic
                  payout status.
                </p>
              </div>

              {recentTransactions.length === 0 ? (
                <EmptyState text="No paid transactions found." />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="min-w-full bg-slate-900 text-sm">
                    <thead className="bg-slate-800/70 text-left text-slate-300">
                      <tr>
                        <th className="px-5 py-4">
                          Booking
                        </th>
                        <th className="px-5 py-4">
                          Mechanic
                        </th>
                        <th className="px-5 py-4">
                          Customer Paid
                        </th>
                        <th className="px-5 py-4">
                          Mechanic Earning
                        </th>
                        <th className="px-5 py-4">
                          Net Profit
                        </th>
                        <th className="px-5 py-4">
                          Payout
                        </th>
                        <th className="px-5 py-4">
                          Date
                        </th>
                        <th className="px-5 py-4">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentTransactions.map(
                        (transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-t border-slate-800"
                          >
                            <td className="px-5 py-4 font-semibold">
                              {transaction.bookingId}
                            </td>

                            <td className="px-5 py-4">
                              {transaction.mechanic?.name ||
                                "-"}
                            </td>

                            <td className="px-5 py-4">
                              {formatCurrency(
                                transaction.customerPaid
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {formatCurrency(
                                transaction.mechanicEarning
                              )}
                            </td>

                            <td className="px-5 py-4 text-emerald-400">
                              {formatCurrency(
                                transaction.platformNetProfit
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  transaction.payoutStatus ===
                                  "Paid"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-amber-500/10 text-amber-400"
                                }`}
                              >
                                {
                                  transaction.payoutStatus
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4 text-slate-400">
                              {formatDate(
                                transaction.paidAt
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {transaction.payoutStatus !==
                              "Paid" ? (
                                <button
                                  onClick={() =>
                                    handleMarkPayoutPaid(
                                      transaction.id
                                    )
                                  }
                                  disabled={
                                    payingBookingId ===
                                    transaction.id
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold transition hover:bg-emerald-500 disabled:opacity-60"
                                >
                                  {payingBookingId ===
                                  transaction.id
                                    ? "Updating..."
                                    : "Mark Paid"}
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  Settled
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h3 className="text-2xl font-bold">
                  Awaiting Customer Payments
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Completed services whose customer payment is
                  still pending or failed.
                </p>
              </div>

              {awaitingPayments.length === 0 ? (
                <EmptyState text="No outstanding customer payments." />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {awaitingPayments.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-amber-500/20 bg-slate-900 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Booking
                          </p>

                          <h4 className="mt-1 font-bold">
                            {booking.bookingId}
                          </h4>
                        </div>

                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                          {booking.paymentStatus}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            Mechanic
                          </p>
                          <p className="font-semibold">
                            {booking.mechanic?.name ||
                              "Not available"}
                          </p>
                        </div>

                        <p className="text-xl font-bold text-amber-400">
                          {formatCurrency(
                            booking.amount
                          )}
                        </p>
                      </div>

                      <p className="mt-4 text-xs text-slate-500">
                        Completed:{" "}
                        {formatDate(
                          booking.completedAt
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function FinanceCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      {icon}

      <p className="mt-5 text-sm text-slate-400">
        {label}
      </p>

      <h3 className="mt-2 text-2xl font-bold">
        {value}
      </h3>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
      {text}
    </div>
  );
}
