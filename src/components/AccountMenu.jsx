import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, HelpCircle, Info, ChevronRight, LogOut, DoorOpen } from "lucide-react";
import { logOut as firebaseLogOut } from "../firebase/auth";
import { showToast } from "../utils/helpers";

const Tile = ({ danger, children }) => (
  <span className="menu-icon" style={{ color: danger ? "var(--red)" : "var(--muted)" }}>{children}</span>
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
      <motion.div className="account-menu" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}>
        <div className="account-menu-header">
          <div className="avatar-lg">
            {(user?.displayName || profile?.name || "U")[0].toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.displayName || profile?.name || "User"}</div>
            <div className="user-meta">{user?.email ? `${user.email} · ` : ""}Lv. <span style={{ color: "var(--accent)", fontWeight: 700 }}>{level}</span> · <span style={{ color: "var(--accent)", fontWeight: 700 }}>{xp} XP</span></div>
          </div>
        </div>

        <button className="account-menu-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <Tile><User size={15} /></Tile>
          <span className="menu-label">My Profile</span>
          <ChevronRight size={14} className="menu-shortcut" />
        </button>
        <button className="account-menu-item" onClick={() => { onNavigate("settings"); onClose(); }}>
          <Tile><Settings size={15} /></Tile>
          <span className="menu-label">Settings</span>
          <ChevronRight size={14} className="menu-shortcut" />
        </button>
        <button className="account-menu-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <Tile><HelpCircle size={15} /></Tile>
          <span className="menu-label">Help & Support</span>
          <ChevronRight size={14} className="menu-shortcut" />
        </button>
        <button className="account-menu-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <Tile><Info size={15} /></Tile>
          <span className="menu-label">About</span>
          <span className="menu-shortcut">v1.0.0</span>
        </button>

        <div className="account-menu-divider" />

        <button className="account-menu-item danger" onClick={handleLogout}>
          <Tile danger><LogOut size={15} /></Tile>
          <span className="menu-label">Sign Out</span>
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
