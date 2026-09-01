import Review from "../models/Review.js";

export const getMyReviewStats = async (
  req,
  res,
  next
) => {
  try {
    const reviews = await Review.find({
      mechanic: req.user.id,
    })
      .populate("customer", "name")
      .populate(
        "booking",
        "bookingId amount"
      )
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce(
        (sum, review) =>
          sum + review.rating,
        0
      );

      averageRating =
        totalRating / totalReviews;
    }

    res.status(200).json({
      success: true,

      stats: {
        averageRating: Number(
          averageRating.toFixed(1)
        ),
        totalReviews,
      },

      reviews,
    });
  } catch (error) {
    next(error);
  }
};