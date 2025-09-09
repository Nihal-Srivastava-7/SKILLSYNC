import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Home from "./components/home/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";

import Profile from "./components/auth/Profile";
import ResumeBuilder from "./components/resume/ResumeBuilder";
import JobList from "./components/jobs/JobList";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import AdminPanel from "./components/admin/AdminPanel";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  const adminEmail = "nihalsrivastava2323@gmail.com";
  if (!user) return <Navigate to="/login" replace />;
  if (
    user.role === "admin" ||
    (user.email || localStorage.getItem("userEmail")) === adminEmail
  ) {
    return children;
  }
  return <Navigate to="/resume" replace />;
}

function App() {
  const location = useLocation();
  const { user } = useAuth();

  // Only remove header/footer from login, signup, home
  const noHeaderFooterPaths = ["/", "/login", "/signup"];
  const hideHeaderFooter = noHeaderFooterPaths.includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobList skills={user?.skills || []} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        {/* Catch-all: redirect to resume if logged in, else login */}
        <Route
          path="*"
          element={<Navigate to={user ? "/resume" : "/login"} replace />}
        />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}
export default App;
