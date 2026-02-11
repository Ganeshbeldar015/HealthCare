🚀 Project Overview

MediConnect is a role-based healthcare management platform that digitizes hospital operations such as doctor onboarding, patient appointments, and prescription issuance, while enforcing identity at the database level using Firebase Authentication + Firestore.

This project is built with real-world medical compliance concepts, not just UI-level checks.

🧠 Problem Statement

Traditional healthcare systems often suffer from:

❌ Doctor impersonation

❌ Unverified or fake prescriptions

❌ Weak role isolation

❌ Poor auditability

❌ Fragmented appointment workflows

MediConnect solves this by binding every action to authenticated identity, not user input.

✨ Key Features (Hackathon Highlights)
🔐 Authentication & Role Management

Firebase Email/Password Authentication

Strict role-based routing & access control

Independent flows for:

👤 Patient

👨‍⚕️ Doctor

🛡️ Admin

👤 Patient Module

Patient signup & profile creation

Browse verified doctors

Request appointments

Track appointment status:

Requested / Approved / Rejected / Completed

View only their own prescriptions

Secure access to medical history

👨‍⚕️ Doctor Module

Doctor signup with Medical Registration Number (Medical UID)

Admin-controlled verification workflow

Doctor dashboard:

Appointment requests

Issued prescriptions

Secure prescription creation

Doctor identity fetched automatically via Firebase Auth UID

❌ No manual doctor selection (prevents impersonation)

View only prescriptions issued by the logged-in doctor

Real-time prescription updates

🛡️ Admin Module

Central doctor verification authority

Approve / Reject / Restore doctors

View complete doctor profiles:

Medical UID

Specialization

Experience

Contact details

Strong role isolation (no patient medical data access)

💊 Prescription System (Core Innovation)

Designed with hospital-grade compliance logic:

Prescriptions are always tied to Firebase Auth UID

Doctors cannot issue prescriptions under another doctor’s name

Each prescription securely stores:

Doctor Auth UID (identity)

Doctor Medical UID (registration number)

Patient reference

Medicines, dosage, timing

Timestamp

Patients see only their prescriptions

Doctors see all prescriptions they’ve ever issued

✅ Prevents:

Identity spoofing

Data tampering

Unauthorized access

🧱 Architecture & Tech Stack
Layer	Technology
Frontend	React + Vite
Styling	Tailwind CSS
Routing	React Router
Backend / BaaS	Firebase
Authentication	Firebase Auth
Database	Firestore
State Management	React Hooks
Real-Time Updates	Firestore onSnapshot
📂 Firestore Data Model (Simplified)
users
patients
doctors
 ├─ authUid        // Firebase Auth UID
 ├─ medicalUid     // Medical Registration Number
 ├─ status         // waiting / approved / rejected

appointments

prescriptions
 ├─ doctorAuthUid
 ├─ doctorMedicalUid
 ├─ patientId
 ├─ medicines[]
 ├─ createdAt

🔒 Security-First Design Principles

Auth UID ≠ Medical UID

Auth UID → identity & permissions

Medical UID → verification & display

Firestore queries always rely on Auth UID

UI never controls identity

Designed for scalable Firestore security rules

🛠️ Local Setup
Prerequisites

Node.js (LTS)

Firebase Project (Auth + Firestore enabled)

Installation
git clone https://github.com/abdullahMunawarKhan/HealthCare.git
cd HealthCare
npm install
npm run dev


📌 Configure Firebase credentials in:

src/utils/firebase.js

🎯 Why MediConnect Stands Out (For Shortlisting)

✔ Real-world healthcare workflow modeling
✔ Backend-level security thinking
✔ Strong role isolation
✔ Audit-friendly prescription system
✔ Scalable Firestore schema
✔ Clean, modular UI architecture

This is not a CRUD app — it demonstrates system design and security mindset.

🔮 Future Enhancements

Prescription PDF generation

Digital doctor signature

Medical document uploads

Admin analytics dashboard

Advanced Firestore security rules

Firebase Hosting deployment

👨‍💻 Author

Abdullah Munawar Khan
Built with a focus on security, correctness, and real-world applicability.

📜 License

MIT License — free to use, modify, and distribute.