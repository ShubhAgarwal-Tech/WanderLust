const crypto = require("crypto");

function hasRazorpayKeys() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getRazorpayInstance() {
  if (!hasRazorpayKeys()) return null;
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function createRazorpayOrder({ amountInr, receipt, notes = {} }) {
  const razorpay = getRazorpayInstance();
  if (!razorpay) return null;

  return razorpay.orders.create({
    amount: Math.round(amountInr * 100),
    currency: "INR",
    receipt,
    notes,
  });
}

function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

function calcBookingTotals(pricePerNight, nights) {
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + serviceFee;
  return { subtotal, serviceFee, totalAmount };
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

module.exports = {
  hasRazorpayKeys,
  createRazorpayOrder,
  verifyRazorpaySignature,
  calcBookingTotals,
  nightsBetween,
};
