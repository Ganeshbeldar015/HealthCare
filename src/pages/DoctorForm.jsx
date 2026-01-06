import React, { useState } from "react";
import { auth, db } from "../utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function DoctorForm() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [acceptDeclaration, setAcceptDeclaration] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    aadhaar: "",
    uid: "",
    college: "",
    passoutYear: "",
    experience: "",
    specialization: "",
    homeAddress: "",
    clinicAddress: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptDeclaration || !acceptPrivacy) {
      alert("You must accept the declaration and privacy policy.");
      return;
    }

    setLoading(true);

    try {
      await setDoc(doc(db, "doctors", user.uid), {
        ...form,
        email: user.email,
        role: "doctor",
        status: "waiting",
        createdAt: serverTimestamp(),
      });

      // ✅ Redirect to waiting page
      navigate("/doctor-waiting");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Doctor Registration
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Full Name */}
          <Input
            label="Full Name"
            name="name"
            onChange={handleChange}
            required
          />

          {/* Email */}
          <Input
            label="Email Address"
            value={user?.email}
            disabled
          />

          {/* Mobile */}
          <Input
            label="Mobile Number"
            name="phone"
            placeholder="10-digit mobile number"
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                handleChange({ target: { name: "phone", value } });
              }
            }}
            required
          />

          {/* Aadhaar */}
          <Input
            label="Aadhaar Number"
            name="aadhaar"
            placeholder="12-digit Aadhaar"
            maxLength={12}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 12) {
                handleChange({ target: { name: "aadhaar", value } });
              }
            }}
            required
          />

          {/* UID */}
          <Input
            label="Medical UID / Registration ID"
            name="uid"
            onChange={handleChange}
            required
          />

          {/* Specialization */}
          <Input
            label="Specialization"
            name="specialization"
            onChange={handleChange}
            required
          />

          {/* College */}
          <Input
            label="College Name with Address"
            name="college"
            onChange={handleChange}
            required
          />

          {/* Passout Year */}
          <Input
            label="Year of Passout"
            name="passoutYear"
            maxLength={4}
            placeholder="YYYY"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 4) {
                handleChange({ target: { name: "passoutYear", value } });
              }
            }}
            required
          />

          {/* Experience */}
          <Input
            label="Years of Experience"
            name="experience"
            type="number"
            min="0"
            step="0.5"
            onChange={handleChange}
            required
          />

          {/* Home Address */}
          <Textarea
            label="Home Address"
            name="homeAddress"
            onChange={handleChange}
            required
          />

          {/* Clinic Address */}
          <Textarea
            label="Clinic / Hospital Address"
            name="clinicAddress"
            onChange={handleChange}
            required
          />

          {/* Declaration */}
          <Checkbox
            checked={acceptDeclaration}
            onChange={setAcceptDeclaration}
            text="I declare that all information provided is true and accurate."
          />

          {/* Privacy */}
          <Checkbox
            checked={acceptPrivacy}
            onChange={setAcceptPrivacy}
            text={
              <>
                I agree to the{" "}
                <span className="text-purple-600 underline cursor-pointer">
                  Privacy Policy
                </span>{" "}
                and{" "}
                <span className="text-purple-600 underline cursor-pointer">
                  Terms & Conditions
                </span>.
              </>
            }
          />

          <button
            type="submit"
            disabled={loading || !acceptDeclaration || !acceptPrivacy}
            className={`md:col-span-2 py-3 rounded-lg font-semibold transition ${
              loading || !acceptDeclaration || !acceptPrivacy
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===== Reusable Components ===== */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        rows="3"
        {...props}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}

function Checkbox({ checked, onChange, text }) {
  return (
    <div className="md:col-span-2 flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded"
      />
      <label className="text-sm text-gray-700">{text}</label>
    </div>
  );
}

export default DoctorForm;
