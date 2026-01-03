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
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!acceptDeclaration || !acceptPrivacy) {
            alert("You must accept the declaration and privacy policy to continue.");
            return;
        }

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
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            name="name"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            value={user?.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Mobile Number
                        </label>
                        <input
                            name="phone"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            placeholder="Enter 10-digit mobile number"
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 10) {
                                    handleChange({
                                        target: { name: "phone", value },
                                    });
                                }
                            }}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Must be exactly 10 digits
                        </p>
                    </div>

                    {/* Aadhaar */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Aadhaar Number
                        </label>
                        <input
                            name="aadhaar"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={12}
                            placeholder="Enter 12-digit Aadhaar number"
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 12) {
                                    handleChange({
                                        target: { name: "aadhaar", value },
                                    });
                                }
                            }}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Must be exactly 12 digits
                        </p>
                    </div>



                    {/* Medical UID */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Medical UID / Registration ID
                        </label>
                        <input
                            name="uid"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Specialization */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Specialization
                        </label>
                        <input
                            name="specialization"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* College */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            College Name with Address
                        </label>
                        <input
                            name="college"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Passout Year */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Year of Passout
                        </label>
                        <input
                            name="passoutYear"
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="YYYY"
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 4) {
                                    handleChange({
                                        target: { name: "passoutYear", value },
                                    });
                                }
                            }}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />

                    </div>

                    {/* Experience */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Years of Experience
                        </label>
                        <input
                            name="experience"
                            type="number"
                            min="0"
                            step="0.5"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />

                    </div>

                    {/* Home Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Home Address
                        </label>
                        <textarea
                            name="homeAddress"
                            rows="3"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Clinic Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Clinic / Hospital Address
                        </label>
                        <textarea
                            name="clinicAddress"
                            rows="3"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    {/* Declaration Checkbox */}
                    <div className="md:col-span-2 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="declaration"
                            checked={acceptDeclaration}
                            onChange={(e) => setAcceptDeclaration(e.target.checked)}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="declaration" className="text-sm text-gray-700">
                            I hereby declare that all the information provided above is true,
                            accurate, and complete to the best of my knowledge. I understand that
                            providing false or misleading information may result in rejection or
                            permanent blocking from the platform.
                        </label>
                    </div>

                    {/* Privacy Policy Checkbox */}
                    <div className="md:col-span-2 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="privacy"
                            checked={acceptPrivacy}
                            onChange={(e) => setAcceptPrivacy(e.target.checked)}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="privacy" className="text-sm text-gray-700">
                            I have read and agree to the{" "}
                            <span className="text-purple-600 underline cursor-pointer">
                                Privacy Policy
                            </span>{" "}
                            and{" "}
                            <span className="text-purple-600 underline cursor-pointer">
                                Terms & Conditions
                            </span>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !acceptDeclaration || !acceptPrivacy}
                        className={`md:col-span-2 py-3 rounded-lg font-semibold transition
    ${loading || !acceptDeclaration || !acceptPrivacy
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

export default DoctorForm;
