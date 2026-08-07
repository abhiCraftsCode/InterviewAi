import React, { useState } from "react";
import Icon from "../components/Icons.jsx";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, selectPlan] = useState("free");
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
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition
                    ${
                      isSelected
                        ? "bg-emerald-600 text-white hover:opacity-90"
                        : "bg-gray-200 text-gray-700 hover:bg-emerald-100"
                    }`}
                >
                  {isSelected ? "Proceed to Pay" : "Select Plan"}
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
