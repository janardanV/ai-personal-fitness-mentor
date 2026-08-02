import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, HelpCircle, Info, ChevronRight, LogOut, DoorOpen } from "lucide-react";
import { logOut as firebaseLogOut } from "../firebase/auth";
import { showToast } from "../utils/helpers";

const Tile = ({ danger, children }) => (
  <div style={{
    width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    background: danger ? "rgba(255,71,87,0.1)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${danger ? "rgba(255,71,87,0.16)" : "rgba(255,255,255,0.07)"}`,
    color: danger ? "#FF4757" : "rgba(255,255,255,0.6)",
  }}>{children}</div>
);

const AccountMenu = ({ user, profile, level, xp, dispatch, onClose, onNavigate }) => {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => { setLogoutOpen(true); };

  const confirmLogout = async () => {
    try { await firebaseLogOut(); } catch (err) { console.error("Logout failed:", err); }
    try { localStorage.removeItem("ai_fitness_mentor_v1"); } catch {}
    dispatch({ type: "LOGOUT" });
    showToast("Signed out. Continuing as guest.");
  };

  return (
    <>
      <style>{`
        .am-item:hover { background: rgba(255,255,255,0.06); color: #FFFFFF; }
        .am-item.danger:hover { background: rgba(255,71,87,0.12); color: #FF4757; }
      `}</style>
      <motion.div className="account-menu" style={{ background: "#131313", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.65)", padding: 8 }} initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
        <div className="account-menu-header" style={{ padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 4, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #C8FF00, #A5E600)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, color: "#0B0B0B", flexShrink: 0 }}>
            {(user?.displayName || profile?.name || "U")[0].toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.displayName || profile?.name || "User"}</div>
            <div className="user-meta">{user?.email ? `${user.email} · ` : ""}Lv. <span style={{ color: "#C8FF00", fontWeight: 700 }}>{level}</span> · <span style={{ color: "#C8FF00", fontWeight: 700 }}>{xp} XP</span></div>
          </div>
        </div>

        {user?.photoURL && (
          <div style={{ textAlign: "center", padding: "4px 12px 10px" }}>
            <img src={user.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(200,255,0,0.2)" }} />
          </div>
        )}

        <button className="account-menu-item am-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <Tile><User size={14} /></Tile>
          <span className="menu-label" style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>My Profile</span>
          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
        </button>
        <button className="account-menu-item am-item" onClick={() => { onNavigate("settings"); onClose(); }}>
          <Tile><Settings size={14} /></Tile>
          <span className="menu-label" style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>Settings</span>
          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
        </button>
        <button className="account-menu-item am-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <Tile><HelpCircle size={14} /></Tile>
          <span className="menu-label" style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>Help & Support</span>
          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
        </button>
        <button className="account-menu-item am-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <Tile><Info size={14} /></Tile>
          <span className="menu-label" style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>About</span>
          <span className="menu-shortcut">v1.0.0</span>
        </button>

        <div className="account-menu-divider" />

        <button className="account-menu-item am-item danger" onClick={handleLogout}>
          <Tile danger><LogOut size={14} /></Tile>
          <span className="menu-label" style={{ fontSize: 14 }}>Sign Out</span>
        </button>
      </motion.div>

      <AnimatePresence>
        {logoutOpen && (
          <motion.div className="logout-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setLogoutOpen(false)}>
            <motion.div className="logout-modal" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div className="logout-modal-icon"><DoorOpen size={24} /></div>
              <h3>Sign Out</h3>
              <p>Are you sure you want to sign out? You'll continue as a guest. Your data is saved locally and will be here when you sign back in.</p>
              <div className="logout-modal-actions">
                <button className="btn-cancel" onClick={() => setLogoutOpen(false)}>Cancel</button>
                <button className="btn-signout" onClick={confirmLogout}>Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountMenu;
