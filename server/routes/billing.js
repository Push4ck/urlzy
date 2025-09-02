const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Simple auth guard
const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// POST /api/billing/checkout - returns a mock checkout URL
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !["free", "premium", "enterprise"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // In a real app, create a Checkout Session with Stripe or similar
    const mockCheckoutUrl = `https://example.com/checkout?plan=${encodeURIComponent(
      plan
    )}`;

    return res.json({
      success: true,
      data: {
        checkoutUrl: mockCheckoutUrl,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// POST /api/billing/razorpay/order - Create Razorpay order
router.post("/razorpay/order", requireAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return res
        .status(500)
        .json({ success: false, message: "Razorpay keys missing" });
    }

    const amountByPlan = {
      free: 0,
      premium: 999, // INR 9.99 => 999 paise
      enterprise: 0, // custom handled offline
    };
    const amount = amountByPlan[plan];
    if (amount === undefined) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const instance = new Razorpay({ key_id, key_secret });
    const order = await instance.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { plan },
    });

    return res.json({ success: true, data: { order } });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/billing/razorpay/verify - Verify payment signature
router.post("/razorpay/verify", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing params" });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");
    const isValid = expectedSignature === razorpay_signature;
    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
    // TODO: mark user as premium in DB
    return res.json({ success: true, message: "Payment verified" });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
