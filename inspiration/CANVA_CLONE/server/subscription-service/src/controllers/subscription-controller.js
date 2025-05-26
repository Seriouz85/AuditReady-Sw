const Subscription = require("../models/subscription");

exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      subscription = new Subscription({ userId });
    }

    return res.status(200).json({
      success: true,
      data: {
        isPremium: subscription.isPremium,
        premiumSince: subscription.premiumSince,
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};
