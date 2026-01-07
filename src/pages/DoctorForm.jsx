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
    collegeUid: "",          // ✅ RENAMED
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

    if (!user) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      await setDoc(doc(db, "doctors", user.uid), {
        /* 🔐 AUTH IDENTITY */
        authUid: user.uid,

        /* 🏫 REGISTRATION NUMBER */
        collegeUid: form.collegeUid,

        /* 📋 FORM DATA */
        name: form.name,
        phone: form.phone,
        aadhaar: form.aadhaar,
        specialization: form.specialization,
        college: form.college,
        passoutYear: form.passoutYear,
        experience: form.experience,
        homeAddress: form.homeAddress,
        clinicAddress: form.clinicAddress,

        /* SYSTEM */
        email: user.email,
        role: "doctor",
        status: "waiting",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

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
          <Input label="Full Name" name="name" onChange={handleChange} required />

          <Input label="Email Address" value={user?.email} disabled />

          <Input
            label="Mobile Number"
            name="phone"
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                handleChange({ target: { name: "phone", value } });
              }
            }}
            required
          />

          <Input
            label="Aadhaar Number"
            name="aadhaar"
            maxLength={12}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 12) {
                handleChange({ target: { name: "aadhaar", value } });
              }
            }}
            required
          />

          {/* 🔥 RENAMED FIELD */}
          <Input
            label="Medical Registration / College UID"
            name="collegeUid"
            onChange={handleChange}
            required
          />

          <Input
            label="Specialization"
            name="specialization"
            onChange={handleChange}
            required
          />

          <Input
            label="College Name with Address"
            name="college"
            onChange={handleChange}
            required
          />

          <Input
            label="Year of Passout"
            name="passoutYear"
            maxLength={4}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 4) {
                handleChange({ target: { name: "passoutYear", value } });
              }
            }}
            required
          />

          <Input
            label="Years of Experience"
            name="experience"
            type="number"
            min="0"
            step="0.5"
            onChange={handleChange}
            required
          />

          <Textarea label="Home Address" name="homeAddress" onChange={handleChange} required />
          <Textarea label="Clinic / Hospital Address" name="clinicAddress" onChange={handleChange} required />

          <Checkbox
            checked={acceptDeclaration}
            onChange={setAcceptDeclaration}
            text="I declare that all information provided is true."
          />

          <Checkbox
            checked={acceptPrivacy}
            onChange={setAcceptPrivacy}
            text="I agree to Privacy Policy and Terms & Conditions."
          />

          <button
            type="submit"
            disabled={loading || !acceptDeclaration || !acceptPrivacy}
            className={`md:col-span-2 py-3 rounded-lg font-semibold ${
              loading ? "bg-gray-300" : "bg-purple-600 text-white"
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
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input {...props} className="w-full px-4 py-3 border rounded-lg" />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <textarea {...props} rows="3" className="w-full px-4 py-3 border rounded-lg" />
    </div>
  );
}

function Checkbox({ checked, onChange, text }) {
  return (
    <div className="md:col-span-2 flex gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label className="text-sm">{text}</label>
    </div>
  );
}

export default DoctorForm;
