const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  userId: String,
  isPremium: {
    type: Boolean,
    default: false,
  },
  paymentId: String,
  premiumSince: Date,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SubscriptionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
