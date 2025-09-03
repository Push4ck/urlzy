// server/models/ClickEvent.js
const mongoose = require("mongoose");

const ClickEventSchema = new mongoose.Schema(
  {
    urlId: { type: mongoose.Schema.Types.ObjectId, ref: "Url", index: true },
    ts: { type: Date, default: Date.now, index: true },
    ip: String,
    userAgent: String,
    referrer: String,
  },
  { timestamps: false }
);

// Optional TTL for raw events beyond retention (e.g., 90 days)
// ClickEventSchema.index({ ts: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

module.exports = mongoose.model("ClickEvent", ClickEventSchema);
