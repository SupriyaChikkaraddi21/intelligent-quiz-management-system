import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizSelect from "./pages/QuizSelect";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResults from "./pages/QuizResults";
import Leaderboard from "./pages/Leaderboard";
import ProgressChartPage from "./pages/ProgressChart";
import ProfilePage from "./pages/ProfilePage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard"; // ⭐ NEW

import PrivateRoute from "./components/PrivateRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";

export default function App() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Hide Navbar + Sidebar + Footer only on login, register, landing page
  const hideNavigation =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/";

  return (
    <>
      {/* TOP NAVBAR (hidden on landing/login/register) */}
      {!hideNavigation && <Navbar />}

      {/* AUTHENTICATED LAYOUT (Sidebar + Content) */}
      {!hideNavigation ? (
        <div className="flex">

          {/* SIDEBAR (left) */}
          <Sidebar />

          {/* MAIN CONTENT AREA (right) */}
          <div className="flex-1 min-h-screen bg-[#F8FAFC] p-6 overflow-y-auto">
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/select"
                element={
                  <PrivateRoute>
                    <QuizSelect />
                  </PrivateRoute>
                }
              />

              <Route
                path="/attempt/:attemptId"
                element={
                  <PrivateRoute>
                    <QuizAttempt />
                  </PrivateRoute>
                }
              />

              <Route
                path="/results/:attemptId"
                element={
                  <PrivateRoute>
                    <QuizResults />
                  </PrivateRoute>
                }
              />

              <Route
                path="/leaderboard"
                element={
                  <PrivateRoute>
                    <Leaderboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/progress"
                element={
                  <PrivateRoute>
                    <ProgressChartPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <AnalyticsDashboard />   {/* ⭐ NEW ANALYTICS PAGE */}
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      ) : (
        // PUBLIC ROUTES (landing, login, register)
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      )}

      {/* FOOTER (hidden on landing/login/register) */}
      {!hideNavigation && <Footer />}
    </>
  );
}
