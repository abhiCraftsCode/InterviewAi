import React, { useState } from "react";
import axios from "axios";
import Icon from "../components/Icons.jsx";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, selectPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 250,
      description: "Great for focused practice and skill improvement.",
      features: [
        "250 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 1000,
      description: "Best value for serious job preparation.",
      features: [
        "1000 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Preprocessing",
      ],
      badge: "Best Value",
    },
  ];
  const handlePayment = async (plan) => {
    try {
      if (plan.id === "free" || plan.price === "₹0") {
        alert("You are already on Free plan.");
        return;
      }
      setLoadingPlan(plan.id);
      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;
      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan.id,
          amount,
          credits: plan.credits,
        },
        { withCredentials: true },
      );
      console.log(result.data);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "InterviewAi",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,
        handler: async function (response) {
          console.log(response);
          const verification = await axios.post(
            ServerUrl + "/api/payment/verify",
            {
              //confusion on whether to use generalised case and expose razorpay-casing or pass directly
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
            { withCredentials: true },
          );
          dispatch(setUserData(verification.data.user));
          alert("Payment successful. Credits added!");
          navigate("/");
        },
        theme: { color: "#10b981" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoadingPlan(null);
    } catch (error) {
      console.error("Payment error.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-gradient-to-br min-h-screen from-gray-50 to-emerald-100 py-16 px-6">
      <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
        <button
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
          onClick={() => navigate("/")}
        >
          <Icon name="leftArrow" className="text-gray-600" />
        </button>
        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((p, i) => {
          const isSelected = selectedPlan === p.id;
          return (
            <motion.div
              key={p.id}
              whileHover={!p.default && { scale: 1.03 }}
              onClick={() => !p.default && selectPlan(p.id)}
              className={`relative rounded-3xl p-8 transition-all duration-300 border bg-white
                ${isSelected ? "border-emerald-600 shadow-2xl" : "border-gray-200 shadow-md"}
                ${p.default ? "cursor-default" : "cursor-pointer"}`}
            >
              {p.badge && (
                <div
                  className="absolute top-6 right-6 bg-emerald-500 text-white
              text-xs px-4 py-1 rounded-full shadow"
                >
                  {p.badge}
                </div>
              )}
              {p.default && (
                <div
                  className="absolute top-6 right-6 bg-gray-200 text-gray-700
              text-xs px-3 py-1 rounded-full"
                >
                  Default
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800">{p.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">
                  {p.price}
                </span>
                <p className="text-gray-500 mt-1">{p.credits} Credits</p>
              </div>
              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                {p.description}
              </p>
              <div className="mt-6 space-y-3 text-left">
                {p.features.map((f, ind) => (
                  <div key={ind} className="flex items-center gap-3">
                    <Icon name={"check"} className="text-emerald-500 text-sm" />
                    <span className="text-gray-700 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              {/**making pricing page buy button at10:33*/}
              {!p.default && (
                <button
                  disabled={loadingPlan === p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) selectPlan(p.id);
                    else handlePayment(p);
                  }}
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition
                    ${
                      isSelected
                        ? "bg-emerald-600 text-white hover:opacity-90"
                        : "bg-gray-200 text-gray-700 hover:bg-emerald-100"
                    }`}
                >
                  {loadingPlan === p.id
                    ? "Processing..."
                    : isSelected
                      ? "Proceed to Pay"
                      : "Select Plan"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;
