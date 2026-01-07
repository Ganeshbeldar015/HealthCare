🚀 Project Overview

MediConnect is a full-stack healthcare management platform designed to digitize and streamline hospital workflows such as doctor onboarding, patient management, appointments, and prescription issuance — all secured using Firebase Authentication + Firestore.

This project focuses on:

Security-first design

Clear separation of responsibilities

Real-world medical compliance concepts

Scalable architecture suitable for production

🧠 Core Problem We Solve

Traditional healthcare systems struggle with:

Doctor impersonation

Unverified prescriptions

Fragmented appointment flows

Poor auditability

Weak role isolation

MediConnect fixes this by enforcing identity at the data level, not just UI level.

✨ Key Features (Hackathon-Ready Highlights)
🔐 Authentication & Role Management

Firebase Authentication (Email/Password)

Strict role-based routing & guards

Separate flows for:

👤 Patient

👨‍⚕️ Doctor

🛡️ Admin

👤 Patient Features

Patient signup & profile registration

Browse doctors & request appointments

View appointment status (requested / approved / rejected / completed)

View prescriptions issued only for them

Secure access to medical history

👨‍⚕️ Doctor Features

Doctor signup with medical registration number (Medical UID)

Admin-controlled approval workflow

Doctor dashboard with:

Appointment requests

Issued prescriptions

Secure prescription creation

Doctor identity fetched automatically using Firebase Auth UID

No manual doctor selection (prevents impersonation)

View only prescriptions issued by the logged-in doctor

Real-time prescription list updates

🛡️ Admin Features

Admin dashboard for doctor verification

Approve / reject / restore doctors

View complete doctor profile:

Medical UID

Experience, specialization, contact info

Central authority without accessing patient data

💊 Prescription System (Key Highlight)

Designed with real hospital compliance in mind

Prescriptions are always tied to Firebase Auth UID

Doctors cannot issue prescriptions under another doctor’s name

Each prescription stores:

Doctor Auth UID (identity)

Doctor Medical UID (registration number)

Patient reference

Medicines, dosage, timing

Doctors can view all prescriptions they have ever issued

Patients can view only their own prescriptions

This design prevents:

Identity spoofing

Data tampering

Unauthorized access

🧱 Architecture & Tech Stack
Layer	Technology
Frontend	React + Vite
Styling	Tailwind CSS
Routing	React Router
Backend / BaaS	Firebase
Auth	Firebase Authentication
Database	Firestore
State	React Hooks
Real-time updates	Firestore onSnapshot
📂 Firestore Data Model (Simplified)
users
patients
doctors
  ├─ authUid        (Firebase Auth UID)
  ├─ collegeUid     (Medical Registration No.)
  ├─ status         (waiting / approved / rejected)

appointments
prescriptions
  ├─ doctorAuthUid
  ├─ doctorMedicalUid
  ├─ patientId
  ├─ medicines[]
  ├─ createdAt

🔒 Security-First Design Decisions

Auth UID ≠ Medical UID

Auth UID → identity & permissions

Medical UID → verification & display

Firestore queries always use Auth UID

UI choices never decide identity

Ready for Firestore security rules

🛠️ Local Setup
Prerequisites

Node.js (LTS)

Firebase Project (Auth + Firestore enabled)

Steps
git clone https://github.com/abdullahMunawarKhan/HealthCare.git
cd HealthCare
npm install
npm run dev


Configure Firebase in:

src/utils/firebase.js

🎯 Why This Project Stands Out (For Shortlisting)

✔ Real-world healthcare workflow modeling

✔ Strong backend-level security thinking

✔ Clear role isolation

✔ Audit-friendly prescription system

✔ Scalable Firestore schema

✔ Clean UI + modular architecture

This is not just a CRUD app — it demonstrates system design thinking.

🔮 Future Enhancements

Prescription PDF generation

Digital doctor signature

Medical record uploads

Admin analytics dashboard

Advanced Firestore security rules

Deployment with Firebase Hosting

🤝 Contribution

Contributions, issues, and PRs are welcome.

Suggested flow:

Fork the repo

Create a feature branch

Commit changes

Open a Pull Request

👨‍💻 Author

Abdullah Munawar Khan

Built with a focus on security, correctness, and real-world applicability.

📜 License

MIT License — free to use, modify, and distribute.