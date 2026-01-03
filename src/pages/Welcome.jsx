import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      
      {/* 🔵 Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-300 rounded-full blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-300 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-300 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* 🌟 HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Smart Healthcare <br />
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Management Platform
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          A unified digital ecosystem that empowers patients to manage
          registrations, appointments, prescriptions, and medical expenses —
          all from one intelligent dashboard.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all duration-300 shadow-xl hover:scale-105"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 rounded-xl border border-purple-300 text-purple-700 font-semibold hover:bg-purple-50 transition-all duration-300"
          >
            Login
          </button>
        </div>
      </section>

      {/* 🧩 FEATURES */}
      <section className="relative z-10 bg-white/70 backdrop-blur-lg py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-14">
            What Our Platform Offers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600 text-2xl">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔄 HOW IT WORKS */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-14">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {steps.map((step, i) => (
              <div key={i} className="p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {i + 1}
                </div>
                <p className="font-medium text-gray-700">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 FINAL CTA */}
      <section className="relative z-10 bg-white py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Experience Smarter Healthcare Today
        </h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Join thousands of users moving towards a simpler, smarter,
          and more transparent healthcare experience.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="px-12 py-5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all duration-300 shadow-xl hover:scale-105"
        >
          Register as Patient
        </button>
      </section>
    </div>
  );
}

export default Welcome;

/* 🧠 Data */
const features = [
  {
    icon: "🧾",
    title: "Patient Registration",
    desc: "Secure digital onboarding with complete personal and medical details.",
  },
  {
    icon: "📊",
    title: "Smart Dashboard",
    desc: "Real-time insights into appointments, health records, and activity.",
  },
  {
    icon: "📅",
    title: "Appointment Booking",
    desc: "Book and manage doctor appointments with ease.",
  },
  {
    icon: "💊",
    title: "Digital Prescriptions",
    desc: "Access prescriptions and medical history anytime, anywhere.",
  },
  {
    icon: "💳",
    title: "Medical Billing",
    desc: "Track expenses, payments, and insurance records transparently.",
  },
  {
    icon: "🔐",
    title: "Secure & Private",
    desc: "Enterprise-grade security powered by Firebase.",
  },
];

const steps = [
  "Create an account",
  "Complete patient registration",
  "Book appointments",
  "Manage records & billing",
];
