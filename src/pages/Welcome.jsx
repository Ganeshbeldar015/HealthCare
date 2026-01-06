import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  CreditCard, 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  UserCircle,
  Menu,
  X,
  ClipboardList,
  Pill,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

/* 🧠 Data Constants */
const features = [
  { 
    icon: <ClipboardList size={24} />, 
    title: "Patient Registration", 
    desc: "Secure digital onboarding with medical history." 
  },
  { 
    icon: <LayoutDashboard size={24} />, 
    title: "Smart Dashboards", 
    desc: "Role-based dashboards for patients, doctors & admins." 
  },
  { 
    icon: <Calendar size={24} />, 
    title: "Appointment Requests", 
    desc: "Request, approve, and manage appointments seamlessly." 
  },
  { 
    icon: <Pill size={24} />, 
    title: "Digital Prescriptions", 
    desc: "Access prescriptions and treatment history anytime." 
  },
  { 
    icon: <CreditCard size={24} />, 
    title: "Billing & Records", 
    desc: "Track medical expenses and financial history." 
  },
  { 
    icon: <Lock size={24} />, 
    title: "Enterprise Security", 
    desc: "Role-based access with Firebase security." 
  },
];

const steps = [
  { title: "Registration", desc: "Register as patient or doctor." },
  { title: "Profile Setup", desc: "Complete profile details." },
  { title: "Appointments", desc: "Request or manage appointments." },
  { title: "Health Management", desc: "Track health records & billing." },
];

/**
 * Three.js Background Component
 * Generates an interactive 3D DNA Helix that follows the cursor
 */
const ThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let renderer, scene, camera, dnaGroup, frameId;
    let isComponentMounted = true;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    const initThree = () => {
      if (!mountRef.current || !window.THREE) return;

      const THREE = window.THREE;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Scene Setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 30;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);

      // DNA Geometry
      dnaGroup = new THREE.Group();
      const sphereGeom = new THREE.SphereGeometry(0.5, 16, 16);
      const strand1Mat = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x064e3b, shininess: 100 });
      const strand2Mat = new THREE.MeshPhongMaterial({ color: 0x06b6d4, emissive: 0x083344, shininess: 100 });

      const numPoints = 50;
      const curveHeight = 50;
      const radius = 6;
      const twist = 2.0;

      for (let i = 0; i < numPoints; i++) {
        const ratio = i / numPoints;
        const y = (ratio * curveHeight) - (curveHeight / 2);
        const angle = ratio * Math.PI * 2 * twist;

        const sphere1 = new THREE.Mesh(sphereGeom, strand1Mat);
        sphere1.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        dnaGroup.add(sphere1);

        const sphere2 = new THREE.Mesh(sphereGeom, strand2Mat);
        sphere2.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
        dnaGroup.add(sphere2);

        if (i % 2 === 0) {
          const barGeom = new THREE.CylinderGeometry(0.1, 0.1, radius * 2);
          const barMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, opacity: 0.2, transparent: true });
          const bar = new THREE.Mesh(barGeom, barMat);
          bar.position.set(0, y, 0);
          bar.rotation.z = Math.PI / 2;
          bar.rotation.y = -angle;
          dnaGroup.add(bar);
        }
      }

      scene.add(dnaGroup);

      // Lights
      const light1 = new THREE.PointLight(0xffffff, 1.2, 100);
      light1.position.set(20, 20, 20);
      scene.add(light1);
      
      const light2 = new THREE.PointLight(0x10b981, 1, 100);
      light2.position.set(-20, -20, 20);
      scene.add(light2);
      
      scene.add(new THREE.AmbientLight(0x404040, 1.5));

      const onMouseMove = (e) => {
        // Normalize mouse coordinates to -1 to +1
        mouseX = (e.clientX / width) * 2 - 1;
        mouseY = -(e.clientY / height) * 2 + 1;
      };

      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('resize', handleResize);

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        
        // Damping / Easing for smooth cursor following
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        if (dnaGroup) {
          // Continuous rotation + cursor influence
          dnaGroup.rotation.y += 0.005;
          dnaGroup.rotation.y += targetX * 0.1; // Follow X
          dnaGroup.rotation.x = targetY * 0.5;  // Tilt on Y
        }
        
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
        if (renderer && renderer.domElement && mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    };

    let cleanupFn = () => {};

    if (!window.THREE) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if (isComponentMounted) cleanupFn = initThree() || (() => {});
      };
      document.head.appendChild(script);
    } else {
      cleanupFn = initThree() || (() => {});
    }

    return () => {
      isComponentMounted = false;
      cleanupFn();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

const App = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <ThreeBackground />

      {/* 🟢 Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-emerald-600 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-cyan-600">
            MediConnect
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              How it Works
            </a>
            <button 
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-emerald-700 px-5 py-2 rounded-full border border-emerald-200 hover:bg-emerald-50 transition-all"
            >
              Login
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="text-sm font-semibold bg-emerald-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* 🌟 Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-emerald-700 uppercase bg-emerald-100/50 backdrop-blur-md rounded-full border border-emerald-200">
              Interactive Medical Hub
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1] mb-8 tracking-tight">
            Smart Healthcare <br />
              <span className="text-emerald-600">Management Platform
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            A unified digital ecosystem connecting patients, doctors, and administrators — managing healthcare smarter, faster, and safer.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <button 
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <UserCircle size={22} />
              Join as Patient
            </button>
            <button 
              onClick={() => navigate("/doctor-signup")}
              className="w-full sm:w-auto px-10 py-5 bg-white/70 backdrop-blur-md text-slate-800 border border-slate-200 font-bold rounded-2xl shadow-sm hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <Stethoscope size={22} />
              Join as Doctor
            </button>
          </motion.div>
        </div>
      </section>

      {/* 🧩 Features Grid */}
      <section id="features" className="py-24 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">What Our Platform Offers</h2>
            <div className="h-1.5 w-24 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -12, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative p-8 rounded-3xl bg-white border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 group shadow-lg hover:shadow-2xl overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-cyan-50/0 group-hover:from-emerald-50/50 group-hover:to-cyan-50/50 transition-all duration-300"></div>
                
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/30 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50 mb-6 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-emerald-300/50 transition-all duration-300 transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-base">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔄 How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-900/95 text-white relative overflow-hidden backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-emerald-400">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group p-6 rounded-2xl hover:bg-white/5 transition-all">
                <div className="mb-6 flex items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center font-black text-emerald-400 text-2xl border border-emerald-500/30">
                    {idx + 1}
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                <p className="text-emerald-100/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Built for Patients and Doctors 
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Patients manage care, doctors handle appointments and  maintain quality — all from one secure platform.
          </p>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        <p>© 2024 VitalsFlow • Encrypted Healthcare Core • HIPAA Certified</p>
      </footer>
    </div>
  );
};

export default App;