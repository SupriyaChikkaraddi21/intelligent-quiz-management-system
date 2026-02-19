import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* PUBLIC */
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* CORE */
import Dashboard from "./pages/Dashboard";
import QuizSelect from "./pages/QuizSelect";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResults from "./pages/QuizResults";
import Leaderboard from "./pages/Leaderboard";
import ProgressChartPage from "./pages/ProgressChart";
import ProfilePage from "./pages/ProfilePage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import History from "./pages/History";
import CreateQuiz from "./pages/CreateQuiz";
import MyQuizzes from "./pages/MyQuizzes";
import Rewards from "./pages/Rewards";

/* NEW MODE SELECT PAGE */
import CreateQuizMode from "./pages/CreateQuizMode";

/* TEACHER */
import Classrooms from "./pages/Classrooms";
import ClassroomDetail from "./pages/ClassroomDetail";
import QuizView from "./pages/QuizView";

/* LAYOUT */
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";

export default function App() {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) return null;

  const isLandingPage = location.pathname === "/";

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      {/* ================= PUBLIC LANDING ================= */}
      {isLandingPage && (
        <>
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
          <Footer />
        </>
      )}

      {/* ================= AUTH PAGES ================= */}
      {isAuthPage && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:uid/:token"
            element={<ResetPassword />}
          />
        </Routes>
      )}

      {/* ================= PROTECTED APP ================= */}
      {!isLandingPage && !isAuthPage && (
        <div className="min-h-screen text-slate-900">
          <Navbar />

          <div className="flex h-[calc(100vh-64px)]">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
              <Routes>

                {/* ================= DASHBOARD ================= */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                {/* ================= CREATE QUIZ FLOW (NEW CLEAN STRUCTURE) ================= */}

                {/* Mode selection page */}
                <Route
                  path="/create"
                  element={
                    <PrivateRoute>
                      <CreateQuizMode />
                    </PrivateRoute>
                  }
                />

                {/* Manual builder (NEW CLEAN URL) */}
                <Route
                  path="/create/manual"
                  element={
                    <PrivateRoute>
                      <CreateQuiz />
                    </PrivateRoute>
                  }
                />

                {/* AI builder (NEW CLEAN URL) */}
                <Route
                  path="/create/ai"
                  element={
                    <PrivateRoute>
                      <QuizSelect />
                    </PrivateRoute>
                  }
                />

                {/* ================= OLD ROUTES (KEPT FOR BACKWARD COMPATIBILITY) ================= */}

                <Route
                  path="/create-quiz"
                  element={
                    <PrivateRoute>
                      <CreateQuiz />
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
                  path="/quiz/:id"
                  element={
                    <PrivateRoute>
                      <QuizSelect />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/my-quizzes"
                  element={
                    <PrivateRoute>
                      <MyQuizzes />
                    </PrivateRoute>
                  }
                />

                {/* ================= TEACHER ================= */}

                <Route
                  path="/classrooms"
                  element={
                    <PrivateRoute>
                      <Classrooms />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/classrooms/:id"
                  element={
                    <PrivateRoute>
                      <ClassroomDetail />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/quiz-view/:quizId"
                  element={
                    <PrivateRoute>
                      <QuizView />
                    </PrivateRoute>
                  }
                />

                {/* ================= QUIZ FLOW ================= */}

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

                {/* ================= OTHER ================= */}

                <Route
                  path="/history"
                  element={
                    <PrivateRoute>
                      <History />
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

                <Route
                  path="/rewards"
                  element={
                    <PrivateRoute>
                      <Rewards />
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
