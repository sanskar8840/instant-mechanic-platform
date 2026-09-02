import Booking from "../models/Booking.js";

const roundMoney = (value) => {
  return (
    Math.round(
      (Number(value || 0) +
        Number.EPSILON) *
        100
    ) / 100
  );
};

const getFinanceDefaults = () => {
  const mechanicSharePercent =
    Number(
      process.env
        .MECHANIC_SHARE_PERCENT ||
        80
    );

  const paymentGatewayFeePercent =
    Number(
      process.env
        .PAYMENT_GATEWAY_FEE_PERCENT ||
        0
    );

  return {
    mechanicSharePercent,
    paymentGatewayFeePercent,
  };
};

const getBookingFinance = (
  booking
) => {
  const {
    mechanicSharePercent:
      defaultMechanicShare,

    paymentGatewayFeePercent,
  } = getFinanceDefaults();

  const amount = roundMoney(
    booking.amount || 0
  );

  const mechanicSharePercent =
    booking.mechanicSharePercent ??
    defaultMechanicShare;

  const mechanicEarning =
    booking.mechanicEarning ??
    roundMoney(
      amount *
        (mechanicSharePercent /
          100)
    );

  const platformGrossProfit =
    booking.platformGrossProfit ??
    roundMoney(
      amount - mechanicEarning
    );

  const paymentGatewayFee =
    booking.paymentGatewayFee ??
    roundMoney(
      amount *
        (paymentGatewayFeePercent /
          100)
    );

  const platformNetProfit =
    booking.platformNetProfit ??
    roundMoney(
      platformGrossProfit -
        paymentGatewayFee
    );

  const mechanicPaidAmount =
    roundMoney(
      booking.mechanicPaidAmount ||
        0
    );

  const payoutStatus =
    booking.mechanicPayoutStatus ||
    "Pending";

  return {
    amount,
    mechanicSharePercent,
    mechanicEarning,
    platformGrossProfit,
    paymentGatewayFee,
    platformNetProfit,
    mechanicPaidAmount,
    payoutStatus,
  };
};

const getYearRange = (year) => {
  const startDate = new Date(
    Date.UTC(
      year,
      0,
      1,
      0,
      0,
      0
    )
  );

  const endDate = new Date(
    Date.UTC(
      year + 1,
      0,
      1,
      0,
      0,
      0
    )
  );

  return {
    startDate,
    endDate,
  };
};

export const getAdminFinanceSummary =
  async (
    req,
    res,
    next
  ) => {
    try {
      const currentYear =
        new Date().getFullYear();

      const requestedYear =
        Number(
          req.query.year ||
            currentYear
        );

      if (
        !Number.isInteger(
          requestedYear
        ) ||
        requestedYear < 2000 ||
        requestedYear > 2100
      ) {
        res.status(400);

        throw new Error(
          "Invalid year"
        );
      }

      const {
        startDate,
        endDate,
      } = getYearRange(
        requestedYear
      );

      /*
      |--------------------------------------------------------------------------
      | Completed Services
      |--------------------------------------------------------------------------
      |
      | New bookings:
      | completedAt is used.
      |
      | Old bookings:
      | completedAt did not exist, so updatedAt is used as a fallback.
      |
      */

      const completedBookings =
        await Booking.find({
          status: "Completed",

          $or: [
            {
              completedAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },

            {
              completedAt: null,

              updatedAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          ],
        })
          .populate(
            "mechanic",
            "name email"
          )
          .select(
            `
            bookingId
            amount
            status
            completedAt
            updatedAt
            paymentStatus
            paidAt
            mechanic
            mechanicSharePercent
            mechanicEarning
            platformGrossProfit
            paymentGatewayFee
            platformNetProfit
            mechanicPayoutStatus
            mechanicPaidAmount
            mechanicPaidAt
            `
          )
          .sort({
            completedAt: -1,
            updatedAt: -1,
          });

      /*
      |--------------------------------------------------------------------------
      | Paid Services
      |--------------------------------------------------------------------------
      |
      | Revenue and profit are counted only after a successful payment.
      |
      */

      const paidBookings =
        await Booking.find({
          paymentStatus: "Paid",

          paidAt: {
            $gte: startDate,
            $lt: endDate,
          },
        })
          .populate(
            "mechanic",
            "name email"
          )
          .select(
            `
            bookingId
            amount
            paidAt
            mechanic
            mechanicSharePercent
            mechanicEarning
            platformGrossProfit
            paymentGatewayFee
            platformNetProfit
            mechanicPayoutStatus
            mechanicPaidAmount
            mechanicPaidAt
            `
          )
          .sort({
            paidAt: -1,
          });

      /*
      |--------------------------------------------------------------------------
      | Awaiting Customer Payment
      |--------------------------------------------------------------------------
      */

      const awaitingPaymentBookings =
        completedBookings.filter(
          (booking) =>
            booking.paymentStatus ===
              "Pending" ||
            booking.paymentStatus ===
              "Failed"
        );

      const awaitingPaymentAmount =
        awaitingPaymentBookings.reduce(
          (total, booking) =>
            total +
            Number(
              booking.amount || 0
            ),
          0
        );

      const monthlyData =
        Array.from(
          {
            length: 12,
          },

          (_, index) => ({
            monthNumber:
              index + 1,

            month: new Date(
              2000,
              index,
              1
            ).toLocaleString(
              "en-US",
              {
                month: "short",
              }
            ),

            revenue: 0,

            mechanicEarnings: 0,

            grossProfit: 0,

            gatewayFees: 0,

            netProfit: 0,

            bookings: 0,
          })
        );

      const mechanicMap =
        new Map();

      let totalRevenue = 0;

      let totalMechanicEarnings =
        0;

      let totalGrossProfit = 0;

      let totalGatewayFees = 0;

      let totalNetProfit = 0;

      let totalPaidToMechanics =
        0;

      let totalPendingMechanicPayout =
        0;

      let paidPayoutCount = 0;

      let pendingPayoutCount = 0;

      for (
        const booking of paidBookings
      ) {
        const finance =
          getBookingFinance(
            booking
          );

        totalRevenue +=
          finance.amount;

        totalMechanicEarnings +=
          finance.mechanicEarning;

        totalGrossProfit +=
          finance.platformGrossProfit;

        totalGatewayFees +=
          finance.paymentGatewayFee;

        totalNetProfit +=
          finance.platformNetProfit;

        totalPaidToMechanics +=
          finance.mechanicPaidAmount;

        const pendingAmount =
          roundMoney(
            Math.max(
              0,

              finance.mechanicEarning -
                finance.mechanicPaidAmount
            )
          );

        if (
          finance.payoutStatus ===
          "Paid"
        ) {
          paidPayoutCount += 1;
        } else {
          pendingPayoutCount +=
            1;

          totalPendingMechanicPayout +=
            pendingAmount;
        }

        if (booking.paidAt) {
          const monthIndex =
            new Date(
              booking.paidAt
            ).getUTCMonth();

          monthlyData[
            monthIndex
          ].revenue +=
            finance.amount;

          monthlyData[
            monthIndex
          ].mechanicEarnings +=
            finance.mechanicEarning;

          monthlyData[
            monthIndex
          ].grossProfit +=
            finance.platformGrossProfit;

          monthlyData[
            monthIndex
          ].gatewayFees +=
            finance.paymentGatewayFee;

          monthlyData[
            monthIndex
          ].netProfit +=
            finance.platformNetProfit;

          monthlyData[
            monthIndex
          ].bookings += 1;
        }

        if (booking.mechanic) {
          const mechanicId =
            booking.mechanic._id.toString();

          if (
            !mechanicMap.has(
              mechanicId
            )
          ) {
            mechanicMap.set(
              mechanicId,
              {
                mechanicId,

                name:
                  booking.mechanic
                    .name,

                email:
                  booking.mechanic
                    .email,

                completedPaidServices: 0,

                customerRevenue: 0,

                totalEarnings: 0,

                paidAmount: 0,

                pendingAmount: 0,
              }
            );
          }

          const mechanic =
            mechanicMap.get(
              mechanicId
            );

          mechanic.completedPaidServices +=
            1;

          mechanic.customerRevenue +=
            finance.amount;

          mechanic.totalEarnings +=
            finance.mechanicEarning;

          mechanic.paidAmount +=
            finance.mechanicPaidAmount;

          mechanic.pendingAmount +=
            pendingAmount;
        }
      }

      const roundedMonthlyData =
        monthlyData.map(
          (item) => ({
            ...item,

            revenue:
              roundMoney(
                item.revenue
              ),

            mechanicEarnings:
              roundMoney(
                item.mechanicEarnings
              ),

            grossProfit:
              roundMoney(
                item.grossProfit
              ),

            gatewayFees:
              roundMoney(
                item.gatewayFees
              ),

            netProfit:
              roundMoney(
                item.netProfit
              ),
          })
        );

      const mechanicBreakdown =
        Array.from(
          mechanicMap.values()
        )
          .map(
            (mechanic) => ({
              ...mechanic,

              customerRevenue:
                roundMoney(
                  mechanic.customerRevenue
                ),

              totalEarnings:
                roundMoney(
                  mechanic.totalEarnings
                ),

              paidAmount:
                roundMoney(
                  mechanic.paidAmount
                ),

              pendingAmount:
                roundMoney(
                  mechanic.pendingAmount
                ),
            })
          )
          .sort(
            (a, b) =>
              b.pendingAmount -
                a.pendingAmount ||
              b.totalEarnings -
                a.totalEarnings
          );

      const recentTransactions =
        paidBookings
          .slice(0, 20)
          .map(
            (booking) => {
              const finance =
                getBookingFinance(
                  booking
                );

              return {
                id:
                  booking._id.toString(),

                bookingId:
                  booking.bookingId,

                paidAt:
                  booking.paidAt,

                mechanic:
                  booking.mechanic
                    ? {
                        id:
                          booking.mechanic._id.toString(),

                        name:
                          booking.mechanic.name,

                        email:
                          booking.mechanic.email,
                      }
                    : null,

                customerPaid:
                  roundMoney(
                    finance.amount
                  ),

                mechanicEarning:
                  roundMoney(
                    finance.mechanicEarning
                  ),

                platformGrossProfit:
                  roundMoney(
                    finance.platformGrossProfit
                  ),

                gatewayFee:
                  roundMoney(
                    finance.paymentGatewayFee
                  ),

                platformNetProfit:
                  roundMoney(
                    finance.platformNetProfit
                  ),

                mechanicPaidAmount:
                  roundMoney(
                    finance.mechanicPaidAmount
                  ),

                payoutStatus:
                  finance.payoutStatus,

                mechanicPaidAt:
                  booking.mechanicPaidAt ||
                  null,
              };
            }
          );

      const awaitingPayments =
        awaitingPaymentBookings.map(
          (booking) => ({
            id:
              booking._id.toString(),

            bookingId:
              booking.bookingId,

            amount:
              roundMoney(
                booking.amount
              ),

            paymentStatus:
              booking.paymentStatus,

            completedAt:
              booking.completedAt ||
              booking.updatedAt,

            mechanic:
              booking.mechanic
                ? {
                    id:
                      booking.mechanic._id.toString(),

                    name:
                      booking.mechanic.name,

                    email:
                      booking.mechanic.email,
                  }
                : null,
          })
        );

      res.status(200).json({
        success: true,

        year:
          requestedYear,

        summary: {
          /*
          |--------------------------------
          | Service Payment Overview
          |--------------------------------
          */

          completedServices:
            completedBookings.length,

          paidServices:
            paidBookings.length,

          awaitingPaymentServices:
            awaitingPaymentBookings.length,

          awaitingPaymentAmount:
            roundMoney(
              awaitingPaymentAmount
            ),

          /*
          |--------------------------------
          | Revenue
          |--------------------------------
          */

          totalRevenue:
            roundMoney(
              totalRevenue
            ),

          totalMechanicEarnings:
            roundMoney(
              totalMechanicEarnings
            ),

          totalPaidToMechanics:
            roundMoney(
              totalPaidToMechanics
            ),

          totalPendingMechanicPayout:
            roundMoney(
              totalPendingMechanicPayout
            ),

          platformGrossProfit:
            roundMoney(
              totalGrossProfit
            ),

          paymentGatewayFees:
            roundMoney(
              totalGatewayFees
            ),

          platformNetProfit:
            roundMoney(
              totalNetProfit
            ),

          /*
          | Legacy frontend compatibility
          */

          paidBookings:
            paidBookings.length,

          paidPayoutCount,

          pendingPayoutCount,
        },

        monthlyData:
          roundedMonthlyData,

        mechanicBreakdown,

        recentTransactions,

        awaitingPayments,
      });
    } catch (error) {
      next(error);
    }
  };

export const markMechanicPayoutPaid =
  async (
    req,
    res,
    next
  ) => {
    try {
      const booking =
        await Booking.findById(
          req.params.bookingId
        ).populate(
          "mechanic",
          "name email"
        );

      if (!booking) {
        res.status(404);

        throw new Error(
          "Booking not found"
        );
      }

      if (
        booking.paymentStatus !==
        "Paid"
      ) {
        res.status(400);

        throw new Error(
          "Mechanic payout can only be processed for a paid booking"
        );
      }

      if (!booking.mechanic) {
        res.status(400);

        throw new Error(
          "No mechanic assigned to this booking"
        );
      }

      if (
        booking.mechanicPayoutStatus ===
        "Paid"
      ) {
        return res
          .status(200)
          .json({
            success: true,

            message:
              "Mechanic payout already marked as paid",

            payout: {
              bookingId:
                booking.bookingId,

              mechanic:
                booking.mechanic,

              mechanicPaidAmount:
                roundMoney(
                  booking.mechanicPaidAmount
                ),

              payoutStatus:
                booking.mechanicPayoutStatus,

              mechanicPaidAt:
                booking.mechanicPaidAt,
            },
          });
      }

      const {
        mechanicSharePercent:
          defaultMechanicShare,

        paymentGatewayFeePercent,
      } =
        getFinanceDefaults();

      const amount =
        roundMoney(
          booking.amount
        );

      const mechanicSharePercent =
        booking.mechanicSharePercent ??
        defaultMechanicShare;

      const mechanicEarning =
        booking.mechanicEarning ??
        roundMoney(
          amount *
            (mechanicSharePercent /
              100)
        );

      const platformGrossProfit =
        booking.platformGrossProfit ??
        roundMoney(
          amount -
            mechanicEarning
        );

      const paymentGatewayFee =
        booking.paymentGatewayFee ??
        roundMoney(
          amount *
            (paymentGatewayFeePercent /
              100)
        );

      const platformNetProfit =
        booking.platformNetProfit ??
        roundMoney(
          platformGrossProfit -
            paymentGatewayFee
        );

      booking.mechanicSharePercent =
        mechanicSharePercent;

      booking.mechanicEarning =
        mechanicEarning;

      booking.platformGrossProfit =
        platformGrossProfit;

      booking.paymentGatewayFee =
        paymentGatewayFee;

      booking.platformNetProfit =
        platformNetProfit;

      booking.mechanicPaidAmount =
        mechanicEarning;

      booking.mechanicPayoutStatus =
        "Paid";

      booking.mechanicPaidAt =
        new Date();

      await booking.save();

      res.status(200).json({
        success: true,

        message:
          "Mechanic payout marked as paid successfully",

        payout: {
          bookingId:
            booking.bookingId,

          mechanic: {
            id:
              booking.mechanic._id.toString(),

            name:
              booking.mechanic.name,

            email:
              booking.mechanic.email,
          },

          mechanicEarning:
            roundMoney(
              mechanicEarning
            ),

          mechanicPaidAmount:
            roundMoney(
              booking.mechanicPaidAmount
            ),

          payoutStatus:
            booking.mechanicPayoutStatus,

          mechanicPaidAt:
            booking.mechanicPaidAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };