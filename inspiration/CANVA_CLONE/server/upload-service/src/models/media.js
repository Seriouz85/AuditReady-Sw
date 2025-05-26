const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  userId: String,
  name: String,
  cloudinaryId: String,
  url: String,
  mimeType: String,
  size: Number,
  width: Number,
  height: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);
module.exports = Media;
