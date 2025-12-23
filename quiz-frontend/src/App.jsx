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
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";

export default function App() {
  const location = useLocation();

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {isPublicPage ? (
        /* ---------------- PUBLIC PAGES ---------------- */
        <>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Footer />
        </>
      ) : (
        /* ---------------- AUTHENTICATED DASHBOARD ---------------- */
        <div className="min-h-screen bg-[#0B1220] text-white">
          {/* TOP NAVBAR */}
          <Navbar />

          {/* SIDEBAR + MAIN CONTENT */}
          <div className="flex h-[calc(100vh-64px)]">
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-6">
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
                      <AnalyticsDashboard />
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
            </main>
          </div>
        </div>
      )}
    </>
  );
}
