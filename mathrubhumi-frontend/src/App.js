import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import IdleTimeoutModal from "./components/IdleTimeoutModal";
import { startIdleTimer, stopIdleTimer } from "./utils/idleTimer";
import { clearSession } from "./utils/session";

function App() {
  const [showIdleModal, setShowIdleModal] = useState(false);
  // navigate removed; will use window.location for redirects

  useEffect(() => {
    // 30 minutes = 30 * 60 * 1000 ms
    const timeoutMs = 30 * 60 * 1000;
    const onIdle = () => {
      // Clear tokens
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      clearSession();
      setShowIdleModal(true);
    };
    startIdleTimer(onIdle, timeoutMs);
    return () => stopIdleTimer();
  }, []);

  const handleModalClose = () => {
    setShowIdleModal(false);
    window.location.href = "/login";
  };

  return (
    <Router>
      <IdleTimeoutModal isOpen={showIdleModal} onClose={handleModalClose} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
