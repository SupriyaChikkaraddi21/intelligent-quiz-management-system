import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">

        {/* BRAND */}
        <div>
          <h2 className="text-xl font-semibold text-white">QuizGen</h2>
          <p className="text-gray-400 text-sm mt-3">
            AI-powered smart quiz generation, analytics, and performance tracking.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition">Home</a></li>
            <li><a href="/select" className="hover:text-white transition">Create Quiz</a></li>
            <li><a href="/leaderboard" className="hover:text-white transition">Leaderboard</a></li>
            <li><a href="/profile" className="hover:text-white transition">Profile</a></li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Connect</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                className="hover:text-white transition"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                className="hover:text-white transition"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-white transition"
              >
                Help & Support
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-gray-700 mt-10 pt-5">
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} QuizGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
