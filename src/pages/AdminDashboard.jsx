import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function AdminDashboard() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    // Fetch doctors
    const fetchDoctors = async () => {
        try {
            const snapshot = await getDocs(collection(db, "doctors"));
            const list = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));
            setDoctors(list);
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    function Detail({ label, value }) {
        return (
            <div>
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium text-gray-800 break-words">
                    {value || "—"}
                </p>
            </div>
        );
    }

    useEffect(() => {
        fetchDoctors();
    }, []);

    // Update doctor status
    const updateStatus = async (doctorId, status) => {
        try {
            await updateDoc(doc(db, "doctors", doctorId), {
                status,
                updatedAt: new Date(),
            });
            fetchDoctors();
        } catch (error) {
            console.error("Status update failed:", error);
            alert("Failed to update status");
        }
    };

    if (loading) {
        return <p className="p-6 text-gray-600">Loading doctors...</p>;
    }

    return (
        <div className="p-6 pt-16">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <h2 className="text-xl font-semibold mb-4">Doctor Management</h2>

            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-center">Specialization</th>
                            <th className="p-3 text-center">Experience</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {doctors.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    No doctors found
                                </td>
                            </tr>
                        )}

                        {doctors.map((doctor) => (
                            <tr key={doctor.id} className="border-t"
                                onClick={() => setSelectedDoctor(doctor)}>
                                <td className="p-3">{doctor.name}</td>
                                <td className="p-3 text-center">
                                    {doctor.specialization}
                                </td>
                                <td className="p-3 text-center">
                                    {doctor.experience} yrs
                                </td>

                                {/* STATUS BADGE */}
                                <td className="p-3 text-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium
                      ${doctor.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : doctor.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }
                    `}
                                    >
                                        {doctor.status}
                                    </span>
                                </td>

                                {/* ACTIONS */}
                                <td className="p-3 text-center space-x-2">
                                    {doctor.status === "waiting" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    updateStatus(doctor.id, "approved")
                                                }
                                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateStatus(doctor.id, "rejected")
                                                }
                                                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {doctor.status === "approved" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(doctor.id, "waiting")
                                            }
                                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                                        >
                                            Unapprove
                                        </button>
                                    )}

                                    {doctor.status === "rejected" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(doctor.id, "waiting")
                                            }
                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                        >
                                            Restore
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* DOCTOR DETAILS MODAL */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">

                        {/* Close */}
                        <button
                            onClick={() => setSelectedDoctor(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-4">
                            Doctor Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                            <Detail label="Name" value={selectedDoctor.name} />
                            <Detail label="Email" value={selectedDoctor.email} />
                            <Detail label="Mobile" value={selectedDoctor.phone} />
                            <Detail label="Aadhaar" value={selectedDoctor.aadhaar} />
                            <Detail label="Medical UID" value={selectedDoctor.uid} />
                            <Detail label="Specialization" value={selectedDoctor.specialization} />
                            <Detail label="Experience" value={`${selectedDoctor.experience} yrs`} />
                            <Detail label="College" value={selectedDoctor.college} />
                            <Detail label="Passout Year" value={selectedDoctor.passoutYear} />

                            <div className="md:col-span-2">
                                <Detail label="Home Address" value={selectedDoctor.homeAddress} />
                            </div>

                            <div className="md:col-span-2">
                                <Detail
                                    label="Clinic / Hospital Address"
                                    value={selectedDoctor.clinicAddress}
                                />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 mt-6">
                            {selectedDoctor.status === "waiting" && (
                                <>
                                    <button
                                        onClick={() =>
                                            updateStatus(selectedDoctor.id, "approved")
                                        }
                                        className="px-4 py-2 bg-green-600 text-white rounded"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateStatus(selectedDoctor.id, "rejected")
                                        }
                                        className="px-4 py-2 bg-red-500 text-white rounded"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {selectedDoctor.status === "approved" && (
                                <button
                                    onClick={() =>
                                        updateStatus(selectedDoctor.id, "waiting")
                                    }
                                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                                >
                                    Unapprove
                                </button>
                            )}

                            {selectedDoctor.status === "rejected" && (
                                <button
                                    onClick={() =>
                                        updateStatus(selectedDoctor.id, "waiting")
                                    }
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Restore
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}
