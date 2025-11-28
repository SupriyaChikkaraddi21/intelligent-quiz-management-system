import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner mt-10 py-4">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-600">

        {/* Left */}
        <p className="text-sm">
          © {new Date().getFullYear()} QuizGen — All Rights Reserved.
        </p>

        {/* Right */}
        <div className="flex gap-4 mt-3 md:mt-0 text-sm">
          <a
            href="https://github.com"
            target="_blank"
            className="hover:text-blue-600 transition"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            className="hover:text-blue-600 transition"
          >
            LinkedIn
          </a>
          <a
            href="#"
            className="hover:text-blue-600 transition"
          >
            Help
          </a>
        </div>

      </div>
    </footer>
  );
}
