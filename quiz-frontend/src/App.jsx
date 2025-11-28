import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizSelect from "./pages/QuizSelect";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResults from "./pages/QuizResults";
import Leaderboard from "./pages/Leaderboard";
import ProgressChartPage from "./pages/ProgressChart";
import PrivateRoute from "./components/PrivateRoute";
import ProfilePage from "./pages/ProfilePage";

import Navbar from "./components/Navbar";   // ✅ Navbar added
import Footer from "./components/Footer";   // ✅ Footer added


export default function App() {
  const location = useLocation();

  // Hide Navbar + Footer on login/register pages
  const hideNavbarFooter =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {/* Show Navbar only when logged in */}
      {!hideNavbarFooter && <Navbar />}

      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
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
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

      </Routes>

      {/* Show Footer only when logged in */}
      {!hideNavbarFooter && <Footer />}
    </>
  );
}
