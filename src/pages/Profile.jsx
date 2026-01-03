import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";
import { useNavigate } from "react-router-dom";

function Profile() {
    const { user } = useAuth();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                const ref = doc(db, "patients", user.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    setPatient(snap.data());
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return <div className="p-6">Loading profile...</div>;
    }

    if (!patient) {
        return <div className="p-6">No profile data found.</div>;
    }

    const { personalInfo, medicalInfo } = patient;

    return (
        <div className="space-y-6">
            {/* Top Card */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
                {/* Left */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                        {personalInfo.firstName?.[0]}
                        {personalInfo.lastName?.[0]}
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">
                            {personalInfo.firstName} {personalInfo.lastName}
                        </h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">0 Appointments</p>
                    </div>
                </div>

                {/* Right */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <Info label="Gender" value={personalInfo.gender} />
                    <Info label="Date of Birth" value={personalInfo.dob} />
                    <Info label="Phone Number" value={personalInfo.contact} />
                    <Info label="Blood Group" value={medicalInfo.bloodGroup} />
                    <Info label="Address" value={personalInfo.address} />
                    <Info label="Allergies" value={medicalInfo.allergies || "None"} />
                    <Info label="Conditions" value={medicalInfo.conditions || "None"} />
                    <Info label="Medical History" value={medicalInfo.history || "None"} />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Medical History */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">
                            Medical History (All)
                        </h3>
                        <span className="text-sm text-gray-400">0 records</span>
                    </div>

                    <div className="text-gray-400 text-center py-10">
                        No medical records found
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
                        <div className="flex flex-wrap gap-2">
                            <QuickLink text="Appointments" />
                            <QuickLink text="Medical Records" />
                            <QuickLink text="Medical Bills" />
                            <QuickLink text="Dashboard" />
                            <span
                                onClick={() => navigate("/patient-registration")}
                                className="px-3 py-1 text-xs rounded bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200 transition"
                            >
                                Edit Information
                            </span>

                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Patient Reviews
                        </h3>
                        <p className="text-sm text-gray-400">No reviews</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* 🔹 Reusable Components */
function Info({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-800 truncate">
                {value || "—"}
            </p>
        </div>
    );
}

function QuickLink({ text }) {
    return (
        <span className="px-3 py-1 text-xs rounded bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200 transition">
            {text}
        </span>
    );
}

export default Profile;
