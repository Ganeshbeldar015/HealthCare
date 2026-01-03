import React, { useState } from "react";
import { auth, db } from "../utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function DoctorForm() {
  const user = auth.currentUser;
  const navigate = useNavigate();

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
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, "doctors", user.uid), {
        ...form,
        email: user.email,
        role: "doctor",
        status: "waiting",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-purple-600 mb-3">
            Registration Submitted 🎉
          </h2>
          <p className="text-gray-600">
            Your doctor profile is under admin verification.
            <br />
            You’ll be able to access your dashboard once approved.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Doctor Registration</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <input name="name" placeholder="Full Name" onChange={handleChange} required />
          <input value={user?.email} disabled className="bg-gray-100" />

          <input name="phone" placeholder="Mobile Number" onChange={handleChange} required />
          <input name="aadhaar" placeholder="Aadhaar Number" onChange={handleChange} required />

          <input name="uid" placeholder="Medical UID / Registration ID" onChange={handleChange} required />
          <input name="specialization" placeholder="Specialization" onChange={handleChange} required />

          <input name="college" placeholder="College Name" onChange={handleChange} required />
          <input name="passoutYear" placeholder="Year of Passout" onChange={handleChange} required />

          <input name="experience" placeholder="Years of Experience" onChange={handleChange} required />

          <textarea
            name="homeAddress"
            placeholder="Home Address"
            onChange={handleChange}
            className="md:col-span-2"
            required
          />

          <textarea
            name="clinicAddress"
            placeholder="Clinic / Hospital Address"
            onChange={handleChange}
            className="md:col-span-2"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-purple-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorForm;
