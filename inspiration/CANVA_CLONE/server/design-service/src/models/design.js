const mongoose = require("mongoose");

const DesignSchema = new mongoose.Schema({
  userId: String,
  name: String,
  canvasData: String,
  width: Number,
  height: Number,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Design = mongoose.models.Design || mongoose.model("Design", DesignSchema);
module.exports = Design;
