import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";

function PatientR() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    contact: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    conditions: "",
    history: "",
    insuranceProvider: "",
    insuranceNumber: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  /* 🔹 Fetch existing patient data (AUTO-FILL) */
  useEffect(() => {
    if (!user) return;

    const fetchPatient = async () => {
      try {
        const ref = doc(db, "patients", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setForm({
            firstName: data.personalInfo.firstName || "",
            lastName: data.personalInfo.lastName || "",
            gender: data.personalInfo.gender || "",
            dob: data.personalInfo.dob || "",
            contact: data.personalInfo.contact || "",
            address: data.personalInfo.address || "",
            bloodGroup: data.medicalInfo.bloodGroup || "",
            allergies: data.medicalInfo.allergies || "",
            conditions: data.medicalInfo.conditions || "",
            history: data.medicalInfo.history || "",
            insuranceProvider: data.insurance.provider || "",
            insuranceNumber: data.insurance.number || "",
          });

          setIsEditMode(true);
        }
      } catch (err) {
        console.error("Failed to fetch patient data", err);
      } finally {
        setInitialLoading(false);
      }
    };

    if (!loading) {
      fetchPatient();
    }
  }, [user, loading]);

  if (loading || initialLoading) {
    return <div className="p-10 text-center">Loading form...</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      /* Save / Update patient profile */
      await setDoc(
        doc(db, "patients", user.uid),
        {
          personalInfo: {
            firstName: form.firstName,
            lastName: form.lastName,
            gender: form.gender,
            dob: form.dob,
            contact: form.contact,
            address: form.address,
          },
          medicalInfo: {
            bloodGroup: form.bloodGroup,
            allergies: form.allergies,
            conditions: form.conditions,
            history: form.history,
          },
          insurance: {
            provider: form.insuranceProvider,
            number: form.insuranceNumber,
          },
          updatedAt: serverTimestamp(),
          ...(isEditMode ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      );

      /* Ensure profile flag is set */
      await setDoc(
        doc(db, "users", user.uid),
        { isProfileCompleted: true },
        { merge: true }
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "Edit Patient Profile" : "Patient Registration"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <Section title="Personal Information">
            <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
            <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
            <Input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact Number" />
            <Input type="date" name="dob" value={form.dob} onChange={handleChange} />
            <Select name="gender" value={form.gender} onChange={handleChange} />
            <Input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="md:col-span-2" />
          </Section>

          {/* Medical Info */}
          <Section title="Medical Information">
            <Input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood Group" />
            <Input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Allergies" />
            <Input name="conditions" value={form.conditions} onChange={handleChange} placeholder="Medical Conditions" />
            <Input name="history" value={form.history} onChange={handleChange} placeholder="Medical History" />
          </Section>

          {/* Insurance */}
          <Section title="Insurance Information">
            <Input name="insuranceProvider" value={form.insuranceProvider} onChange={handleChange} placeholder="Insurance Provider" />
            <Input name="insuranceNumber" value={form.insuranceNumber} onChange={handleChange} placeholder="Insurance Number" />
          </Section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
          >
            {submitting
              ? "Saving..."
              : isEditMode
              ? "Update Profile"
              : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientR;

/* 🔹 Small reusable helpers */
function Section({ title, children }) {
  return (
    <section>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </section>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full p-3 border rounded-lg outline-none focus:border-purple-500 ${className}`}
    />
  );
}

function Select({ value, onChange }) {
  return (
    <select
      name="gender"
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg outline-none focus:border-purple-500"
    >
      <option value="">Select Gender</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
  );
}
