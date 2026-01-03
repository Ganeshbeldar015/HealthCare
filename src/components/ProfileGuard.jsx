import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";

function ProfileGuard({ children }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().isProfileCompleted) {
          setProfileCompleted(true);
        }
      } catch (error) {
        console.error("Profile check failed:", error);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  /* 🔄 Still checking */
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking profile...
      </div>
    );
  }

  /* ❌ Not logged in */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* ❌ Logged in but profile NOT completed */
  if (!profileCompleted) {
    return <Navigate to="/patient-registration" replace />;
  }

  /* ✅ Everything OK */
  return children;
}

export default ProfileGuard;
