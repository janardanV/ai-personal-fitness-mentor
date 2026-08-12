import { createContext, useContext, useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const AuthContext = createContext(null);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[GOOGLE] onAuthStateChanged uid:", firebaseUser?.uid || null, "email:", firebaseUser?.email || null);
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0B0F14", flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: "rgba(200,255,50,0.1)",
          border: "1px solid rgba(200,255,50,0.2)", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#C8FF32", animation: "glowPulse 3s ease infinite",
        }}><Activity size={24} /></div>
        <div style={{ color: "#A7B1C2", fontSize: 13, letterSpacing: "0.05em" }}>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest: !user }}>
      {children}
    </AuthContext.Provider>
  );
};
