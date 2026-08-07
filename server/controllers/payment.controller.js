import razorpay from "../services/razorpay.service.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    console.log("ordering...");
    const { planId, amount, credits } = req.body;
    console.log(req.body);
    if (!amount || !credits)
      return res.status(400).json({ message: "Invalid plan data." });
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    console.log(options);
    const order = await razorpay.orders.create(options);
    await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
    });
    console.log("order placed.");
    console.log(order);
    return res.status(200).json(order);
  } catch (error) {
    console.log("2.", error);
    return res
      .status(500)
      .json({ message: "Failed to create razorpay order. " + error });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    console.log("verifying payment....");
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expectedSignature !== razorpaySignature)
      return res.status(403).json({ message: "Invalid Payment Signature." });
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment)
      return res.status(404).json({ message: "Payment not found." });
    if (payment.status === "paid")
      return res.status(400).json({ message: "Payment already processed." });
    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();
    //update user account
    console.log("updating user....");
    const user = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { credits: payment.credits } },
      { new: true },
    );
    console.log("verification successful.");
    return res.status(200).json({
      success: true,
      message: "Payment verified and credits added.",
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed payment verification. " + error });
  }
};
