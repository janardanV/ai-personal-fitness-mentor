import { createContext, useContext, useState, useEffect } from "react";
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
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0A0A0A", flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#22C55E",
        }}>F</div>
        <div style={{ color: "#A0A0A0", fontSize: 13, letterSpacing: "0.05em" }}>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest: !user }}>
      {children}
    </AuthContext.Provider>
  );
};
