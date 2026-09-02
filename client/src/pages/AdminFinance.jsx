import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  IndianRupee,
  TrendingUp,
  Wallet,
  Wrench,
  CalendarDays,
  BarChart3,
  UserRound,
  Mail,
  CheckCircle2,
  Clock3,
  BadgeCheck,
  ReceiptIndianRupee,
  CircleDollarSign,
} from "lucide-react";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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

  const [selectedYear, setSelectedYear] =
    useState(currentYear);

  const [finance, setFinance] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedMechanicId,
    setSelectedMechanicId,
  ] = useState("");

  const [payingId, setPayingId] =
    useState("");

  const years = useMemo(() => {
    return Array.from(
      { length: 5 },
      (_, index) =>
        currentYear - index
    );
  }, [currentYear]);

  const loadFinance = async (year) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admin/finance/summary?year=${year}`
      );

      setFinance(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load financial analytics"
      );

      setFinance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance(selectedYear);
  }, [selectedYear]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(value || 0)
    );
  };

  const formatCompactCurrency = (
    value
  ) => {
    const number =
      Number(value || 0);

    if (number >= 10000000) {
      return `₹${(
        number / 10000000
      ).toFixed(1)}Cr`;
    }

    if (number >= 100000) {
      return `₹${(
        number / 100000
      ).toFixed(1)}L`;
    }

    if (number >= 1000) {
      return `₹${(
        number / 1000
      ).toFixed(1)}K`;
    }

    return `₹${number}`;
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleString(
      "en-IN"
    );
  };

  const summary =
    finance?.summary || {};

  const monthlyData =
    finance?.monthlyData || [];

  const mechanicBreakdown =
    finance?.mechanicBreakdown ||
    [];

  const recentTransactions =
    finance?.recentTransactions ||
    [];

  const filteredMechanics =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      return [
        ...mechanicBreakdown,
      ]
        .filter(
          (mechanic) => {
            if (!term) {
              return true;
            }

            return (
              mechanic.name
                ?.toLowerCase()
                .includes(
                  term
                ) ||
              mechanic.email
                ?.toLowerCase()
                .includes(
                  term
                )
            );
          }
        )
        .sort(
          (a, b) => {
            const aPending =
              Number(
                a.pendingAmount ||
                  0
              );

            const bPending =
              Number(
                b.pendingAmount ||
                  0
              );

            if (
              aPending > 0 &&
              bPending <= 0
            ) {
              return -1;
            }

            if (
              bPending > 0 &&
              aPending <= 0
            ) {
              return 1;
            }

            return (
              bPending -
              aPending
            );
          }
        );
    }, [
      mechanicBreakdown,
      searchTerm,
    ]);

  const selectedMechanic =
    mechanicBreakdown.find(
      (mechanic) =>
        mechanic.mechanicId ===
        selectedMechanicId
    );

  const mechanicTransactions =
    selectedMechanic
      ? recentTransactions.filter(
          (transaction) =>
            transaction.mechanic
              ?.id ===
            selectedMechanic.mechanicId
        )
      : [];

  const pendingMechanicsCount =
    mechanicBreakdown.filter(
      (mechanic) =>
        Number(
          mechanic.pendingAmount ||
            0
        ) > 0
    ).length;

  const settledMechanicsCount =
    mechanicBreakdown.filter(
      (mechanic) =>
        Number(
          mechanic.pendingAmount ||
            0
        ) <= 0
    ).length;

  const handleMarkPaid =
    async (transaction) => {
      if (
        !transaction?.id
      ) {
        return;
      }

      const mechanicName =
        transaction.mechanic
          ?.name ||
        "mechanic";

      const confirmed =
        window.confirm(
          `Mark ${formatCurrency(
            transaction.mechanicEarning
          )} payout to ${mechanicName} as paid?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setPayingId(
          transaction.id
        );

        const response =
          await api.patch(
            `/admin/finance/bookings/${transaction.id}/payout-paid`
          );

        await loadFinance(
          selectedYear
        );

        alert(
          response.data
            ?.message ||
            "Payout marked as paid"
        );
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update payout"
        );
      } finally {
        setPayingId("");
      }
    };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              Instant Mechanic
            </h1>

            <p className="text-sm text-slate-400">
              Financial Analytics
            </p>
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
              onClick={
                handleLogout
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft
                size={18}
              />
              Back to Admin
              Dashboard
            </button>

            <p className="font-medium text-emerald-400">
              Finance Center
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Financial
              Analytics
            </h2>

            <p className="mt-2 max-w-2xl text-slate-400">
              Monitor platform
              revenue, profit,
              mechanic earnings
              and payout
              settlements from
              one place.
            </p>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <CalendarDays
                size={16}
              />
              Financial Year
            </label>

            <select
              value={
                selectedYear
              }
              onChange={(e) =>
                setSelectedYear(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold outline-none focus:border-emerald-500"
            >
              {years.map(
                (year) => (
                  <option
                    key={
                      year
                    }
                    value={
                      year
                    }
                  >
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <IndianRupee className="text-blue-400" />

              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                Revenue
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Customer Revenue
            </p>

            <p className="mt-2 text-2xl font-bold">
              {loading
                ? "..."
                : formatCurrency(
                    summary.totalRevenue
                  )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Successful service
              payments
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="text-emerald-400" />

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                Profit
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Platform Net Profit
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {loading
                ? "..."
                : formatCurrency(
                    summary.platformNetProfit
                  )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              After mechanic
              share and gateway
              fee
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <Wrench className="text-purple-400" />

              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                Mechanics
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Mechanic Earnings
            </p>

            <p className="mt-2 text-2xl font-bold">
              {loading
                ? "..."
                : formatCurrency(
                    summary.totalMechanicEarnings
                  )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Total mechanic
              earnings
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <Wallet className="text-amber-400" />

              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                Pending
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Pending Payout
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-400">
              {loading
                ? "..."
                : formatCurrency(
                    summary.totalPendingMechanicPayout
                  )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Amount payable to
              mechanics
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Paid to Mechanics
                </p>

                <p className="mt-2 text-xl font-bold text-emerald-400">
                  {formatCurrency(
                    summary.totalPaidToMechanics
                  )}
                </p>
              </div>

              <BadgeCheck className="text-emerald-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Gross Profit
                </p>

                <p className="mt-2 text-xl font-bold">
                  {formatCurrency(
                    summary.platformGrossProfit
                  )}
                </p>
              </div>

              <CircleDollarSign className="text-blue-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Gateway Fees
                </p>

                <p className="mt-2 text-xl font-bold text-rose-400">
                  {formatCurrency(
                    summary.paymentGatewayFees
                  )}
                </p>
              </div>

              <ReceiptIndianRupee className="text-rose-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Paid Services
                </p>

                <p className="mt-2 text-xl font-bold">
                  {summary.paidBookings ||
                    0}
                </p>
              </div>

              <CheckCircle2 className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* Professional Chart */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-5 border-b border-slate-800 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                <BarChart3
                  size={22}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Revenue &
                  Profit Trend
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Monthly financial
                  performance for{" "}
                  {selectedYear}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2">
                <p className="text-xs text-slate-500">
                  Annual Revenue
                </p>

                <p className="mt-1 font-bold text-blue-400">
                  {formatCurrency(
                    summary.totalRevenue
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2">
                <p className="text-xs text-slate-500">
                  Annual Profit
                </p>

                <p className="mt-1 font-bold text-emerald-400">
                  {formatCurrency(
                    summary.platformNetProfit
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            {loading ? (
              <div className="grid h-[360px] place-items-center text-slate-400">
                Loading financial
                chart...
              </div>
            ) : (
              <div className="h-[380px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <ComposedChart
                    data={
                      monthlyData
                    }
                    margin={{
                      top: 10,
                      right: 15,
                      bottom: 5,
                      left: 5,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={
                            0.35
                          }
                        />

                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={
                            0
                          }
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#1e293b"
                      vertical={
                        false
                      }
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 12,
                      }}
                      axisLine={{
                        stroke:
                          "#334155",
                      }}
                      tickLine={
                        false
                      }
                    />

                    <YAxis
                      tickFormatter={
                        formatCompactCurrency
                      }
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 12,
                      }}
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
                      width={65}
                    />

                    <Tooltip
                      cursor={{
                        stroke:
                          "#475569",
                        strokeDasharray:
                          "4 4",
                      }}
                      contentStyle={{
                        backgroundColor:
                          "#0f172a",
                        border:
                          "1px solid #334155",
                        borderRadius:
                          "12px",
                        color:
                          "#ffffff",
                      }}
                      labelStyle={{
                        color:
                          "#ffffff",
                        fontWeight:
                          700,
                        marginBottom:
                          "8px",
                      }}
                      formatter={(
                        value,
                        name
                      ) => {
                        if (
                          name ===
                          "Paid Services"
                        ) {
                          return [
                            value,
                            name,
                          ];
                        }

                        return [
                          formatCurrency(
                            value
                          ),
                          name,
                        ];
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        paddingTop:
                          "20px",
                        fontSize:
                          "13px",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />

                    <Line
                      type="monotone"
                      dataKey="netProfit"
                      name="Net Profit"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill:
                          "#10b981",
                        strokeWidth:
                          0,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />

                    <Bar
                      dataKey="bookings"
                      name="Paid Services"
                      fill="#8b5cf6"
                      barSize={12}
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 grid gap-3 border-t border-slate-800 pt-5 text-sm text-slate-400 md:grid-cols-3">
              <div>
                <span className="font-semibold text-blue-400">
                  Revenue
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  Customer payments
                  received
                </p>
              </div>

              <div>
                <span className="font-semibold text-emerald-400">
                  Net Profit
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  Platform earnings
                  after mechanic share
                </p>
              </div>

              <div>
                <span className="font-semibold text-purple-400">
                  Paid Services
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  Successful paid
                  bookings each month
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mechanic Profiles */}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <UserRound className="text-purple-400" />

                <h3 className="text-2xl font-bold">
                  Mechanic
                  Profiles
                </h3>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Pending payouts are
                automatically
                prioritized.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-400">
                {
                  pendingMechanicsCount
                }{" "}
                Pending
              </div>

              <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-400">
                {
                  settledMechanicsCount
                }{" "}
                Settled
              </div>
            </div>
          </div>

          <div className="relative mb-6 max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={
                searchTerm
              }
              onChange={(e) =>
                setSearchTerm(
                  e.target
                    .value
                )
              }
              placeholder="Search mechanic by name or email..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
            />
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading mechanics...
            </div>
          ) : filteredMechanics.length ===
            0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              No mechanics
              found.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredMechanics.map(
                (mechanic) => {
                  const hasPending =
                    Number(
                      mechanic.pendingAmount ||
                        0
                    ) > 0;

                  return (
                    <article
                      key={
                        mechanic.mechanicId
                      }
                      className={`rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${
                        hasPending
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-slate-800 bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-purple-500/10 text-purple-400">
                          <UserRound
                            size={23}
                          />
                        </div>

                        {hasPending ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                            <Clock3
                              size={
                                14
                              }
                            />
                            Payment
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                            <CheckCircle2
                              size={
                                14
                              }
                            />
                            Settled
                          </span>
                        )}
                      </div>

                      <h4 className="mt-5 text-xl font-bold">
                        {
                          mechanic.name
                        }
                      </h4>

                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <Mail
                          size={15}
                        />
                        {
                          mechanic.email
                        }
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Services
                          </p>

                          <p className="mt-1 font-bold">
                            {
                              mechanic.completedPaidServices
                            }
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Total
                            Earned
                          </p>

                          <p className="mt-1 font-bold">
                            {formatCurrency(
                              mechanic.totalEarnings
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Paid
                          </p>

                          <p className="mt-1 font-bold text-emerald-400">
                            {formatCurrency(
                              mechanic.paidAmount
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-3">
                          <p className="text-xs text-slate-500">
                            Pending
                          </p>

                          <p className="mt-1 font-bold text-amber-400">
                            {formatCurrency(
                              mechanic.pendingAmount
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedMechanicId(
                            mechanic.mechanicId
                          )
                        }
                        className="mt-5 w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold transition hover:bg-purple-500"
                      >
                        View Financial
                        Profile
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* Selected Mechanic */}

        {selectedMechanic && (
          <section className="mt-10 rounded-2xl border border-purple-500/30 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-400">
                  Mechanic
                  Financial Profile
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {
                    selectedMechanic.name
                  }
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {
                    selectedMechanic.email
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedMechanicId(
                    ""
                  )
                }
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Close Profile
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Customer Revenue
                </p>

                <p className="mt-2 text-lg font-bold text-blue-400">
                  {formatCurrency(
                    selectedMechanic.customerRevenue
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Total Earnings
                </p>

                <p className="mt-2 text-lg font-bold">
                  {formatCurrency(
                    selectedMechanic.totalEarnings
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Paid
                </p>

                <p className="mt-2 text-lg font-bold text-emerald-400">
                  {formatCurrency(
                    selectedMechanic.paidAmount
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-lg font-bold text-amber-400">
                  {formatCurrency(
                    selectedMechanic.pendingAmount
                  )}
                </p>
              </div>
            </div>

            <h4 className="mt-8 text-lg font-bold">
              Payment
              Transactions
            </h4>

            <div className="mt-4 space-y-3">
              {mechanicTransactions.length ===
              0 ? (
                <p className="rounded-xl bg-slate-950 p-5 text-sm text-slate-400">
                  No transactions
                  available for this
                  mechanic.
                </p>
              ) : (
                mechanicTransactions.map(
                  (
                    transaction
                  ) => (
                    <div
                      key={
                        transaction.id
                      }
                      className="flex flex-col gap-4 rounded-xl bg-slate-950 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="text-xs text-slate-500">
                          Booking
                        </p>

                        <p className="font-semibold">
                          {
                            transaction.bookingId
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            transaction.paidAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Customer
                          Paid
                        </p>

                        <p className="font-bold text-blue-400">
                          {formatCurrency(
                            transaction.customerPaid
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Mechanic
                          Earned
                        </p>

                        <p className="font-bold">
                          {formatCurrency(
                            transaction.mechanicEarning
                          )}
                        </p>
                      </div>

                      <div>
                        {transaction.payoutStatus ===
                        "Pending" ? (
                          <button
                            onClick={() =>
                              handleMarkPaid(
                                transaction
                              )
                            }
                            disabled={
                              payingId ===
                              transaction.id
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold transition hover:bg-emerald-500 disabled:opacity-60"
                          >
                            <BadgeCheck
                              size={
                                17
                              }
                            />

                            {payingId ===
                            transaction.id
                              ? "Updating..."
                              : "Mark as Paid"}
                          </button>
                        ) : (
                          <div>
                            <p className="font-semibold text-emerald-400">
                              Paid
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                transaction.mechanicPaidAt
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}