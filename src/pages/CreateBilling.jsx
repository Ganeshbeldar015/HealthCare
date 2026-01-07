import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { Plus, Trash2, Receipt } from "lucide-react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CreateBilling() {
  const navigate = useNavigate();

  /* ================= DOCTOR ================= */
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);

  /* ================= PATIENT ================= */
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  /* ================= DATE ================= */
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* ================= BILL ITEMS ================= */
  const [items, setItems] = useState([
    { description: "", amount: "" },
  ]);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH DOCTOR (AUTH UID) ================= */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setDoctorLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "doctors"),
          where("authUid", "==", user.uid),
          where("status", "==", "approved")
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setDoctor({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          alert("Doctor profile not found or not approved");
        }
      } catch (err) {
        console.error("Doctor fetch failed:", err);
      } finally {
        setDoctorLoading(false);
      }
    });

    return () => unsub();
  }, []);

  /* ================= FETCH PATIENTS ================= */
  useEffect(() => {
    const fetchPatients = async () => {
      const snap = await getDocs(collection(db, "patients"));
      setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchPatients();
  }, []);

  /* ================= BILL ITEM HANDLERS ================= */
  const addItem = () =>
    setItems([...items, { description: "", amount: "" }]);

  const removeItem = (index) =>
    setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    const copy = [...items];
    copy[index][field] = value;
    setItems(copy);
  };

  const total = items.reduce(
    (sum, i) => sum + (parseFloat(i.amount) || 0),
    0
  );

  /* ================= SUBMIT BILL ================= */
  const submitBill = async () => {
    if (!doctor || !selectedPatient) {
      alert("Doctor or patient not selected");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "bills"), {
        /* 🔐 DOCTOR */
        doctorAuthUid: auth.currentUser.uid,
        doctorRefId: doctor.id,
        doctorName: doctor.name,
        doctorMedicalUid: doctor.collegeUid,

        /* 👤 PATIENT */
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.personalInfo.firstName} ${selectedPatient.personalInfo.lastName}`,

        /* 📄 BILL */
        date,
        items: items.map((i) => ({
          description: i.description,
          amount: parseFloat(i.amount),
        })),
        total,
        status: "Pending",

        createdAt: serverTimestamp(),
      });

      navigate("/doctor-dashboard", { replace: true });
    } catch (err) {
      console.error("Billing failed:", err);
      alert("Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER PATIENTS ================= */
  const filteredPatients = patients.filter((p) =>
    `${p.personalInfo.firstName} ${p.personalInfo.lastName}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 pt-16">

     <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/doctor-dashboard")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold">Create Billing</h1>
      </div>

      {/* ================= DOCTOR (READ ONLY) ================= */}
      <label className="font-medium text-sm">Doctor</label>
      <input
        value={
          doctorLoading
            ? "Loading..."
            : doctor
            ? doctor.name
            : "Not available"
        }
        disabled
        className="w-full border rounded-lg px-4 py-2 mt-1 bg-gray-100 cursor-not-allowed"
      />

      {/* ================= PATIENT ================= */}
      <label className="font-medium text-sm mt-4 block">Patient</label>
      <input
        value={patientSearch}
        onChange={(e) => {
          setPatientSearch(e.target.value);
          setShowPatientList(true);
        }}
        onFocus={() => setShowPatientList(true)}
        placeholder="Search Patient"
        className="w-full border rounded-lg px-4 py-2 mt-1"
      />

      {showPatientList && patientSearch && (
        <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPatient(p);
                setPatientSearch(
                  `${p.personalInfo.firstName} ${p.personalInfo.lastName}`
                );
                setShowPatientList(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {p.personalInfo.firstName} {p.personalInfo.lastName}
            </div>
          ))}
        </div>
      )}

      {/* ================= DATE ================= */}
      <div className="mt-6">
        <label className="font-medium text-sm">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-4 py-2 mt-1"
        />
      </div>

      {/* ================= BILL ITEMS ================= */}
      <div className="space-y-4 mt-6">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              placeholder="Service / Treatment"
              value={item.description}
              onChange={(e) =>
                updateItem(i, "description", e.target.value)
              }
              className="flex-1 border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              placeholder="₹"
              value={item.amount}
              onChange={(e) =>
                updateItem(i, "amount", e.target.value)
              }
              className="w-32 border rounded-lg px-3 py-2 text-right"
            />

            <button
              type="button"
              disabled={items.length === 1}
              onClick={() => removeItem(i)}
              className="text-gray-300 hover:text-red-500"
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-4 text-sm text-emerald-600"
      >
        + Add another item
      </button>

      {/* ================= TOTAL ================= */}
      <div className="mt-6 flex justify-between font-bold text-lg">
        <span>Total</span>
        <span className="text-emerald-600">₹{total}</span>
      </div>

      {/* ================= SUBMIT ================= */}
      <button
        onClick={submitBill}
        disabled={loading}
        className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        <Receipt />
        {loading ? "Submitting..." : "Generate Bill"}
      </button>
    </div>
  );
}
