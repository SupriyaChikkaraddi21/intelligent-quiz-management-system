import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  /* ================= SCROLL REVEAL ================= */
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-10");
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

  /* ================= COUNT UP ================= */
  const useCountUp = (end, duration = 1500) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
      let startTime;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        setCount(Math.floor(end * percentage));

        if (percentage < 1) requestAnimationFrame(animate);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [end, duration]);

    return [count, ref];
  };

  const [endpoints, endpointsRef] = useCountUp(30);
  const [apps, appsRef] = useCountUp(6);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="text-xl font-extrabold tracking-tight cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            Quiz<span className="text-sky-400">Gen</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm rounded-lg border border-white/20 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 text-sm rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-sky-500/40"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative reveal opacity-0 translate-y-10 transition-all duration-700">

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-sky-500/20 blur-[160px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-20 items-center">

          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Generate Smarter Quizzes. <br />
              <span className="text-sky-400">
                Learn Faster with AI.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-xl">
              AI-powered quiz platform designed for students and teachers.
              Instantly generate questions, track performance in real time,
              and improve learning outcomes with structured analytics.
            </p>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-sky-500 hover:bg-sky-600 px-7 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:-translate-y-1 shadow-xl shadow-sky-500/40"
              >
                Start Free
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-7 py-3 rounded-xl border border-white/20 hover:bg-white/10 hover:-translate-y-1 transition-all duration-200"
              >
                Login
              </button>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              Secure authentication • Google OAuth • Role-based access • Production deployed
            </p>
          </div>

          {/* PREVIEW CARD */}
          <div className="hidden md:block">
            <div className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-8 shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="absolute inset-0 rounded-3xl bg-sky-500/5 blur-2xl pointer-events-none" />

              <p className="text-sm text-slate-400 mb-6 relative">
                Dashboard Preview
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8 relative">
                {[
                  ["Quizzes", "12"],
                  ["Avg Score", "78%"],
                  ["Accuracy", "82%"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/10 p-4 text-center border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all duration-200"
                  >
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Performance Trend</p>
                <div className="flex items-end gap-2 h-24">
                  {[35, 50, 65, 60, 78, 82].map((v, i) => (
                    <div
                      key={i}
                      className="w-4 rounded-lg bg-sky-400 transition-all duration-500 hover:bg-sky-300"
                      style={{ height: `${v}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="h-32 bg-gradient-to-b from-transparent to-slate-900" />
      </section>

      {/* ================= TRUST / SCALE ================= */}
      <section className="py-20 text-center reveal opacity-0 translate-y-10 transition-all duration-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-slate-300">

            <div ref={endpointsRef}>
              <p className="text-3xl font-bold text-sky-400">{endpoints}+</p>
              <p className="text-sm">REST API Endpoints</p>
            </div>

            <div ref={appsRef}>
              <p className="text-3xl font-bold text-sky-400">{apps}</p>
              <p className="text-sm">Modular Django Apps</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-sky-400">AI</p>
              <p className="text-sm">Dynamic Question Generation</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-sky-400">Cloud</p>
              <p className="text-sm">Production Deployment</p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center reveal opacity-0 translate-y-10 transition-all duration-700">
        <h2 className="text-3xl font-bold mb-16">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            ["1", "Select topic and difficulty"],
            ["2", "AI generates structured questions"],
            ["3", "Analyze results and improve"],
          ].map(([step, text]) => (
            <div
              key={step}
              className="rounded-2xl bg-white/5 border border-white/10 p-10 hover:-translate-y-3 hover:border-sky-400/40 transition-all duration-300"
            >
              <div className="text-sky-400 text-4xl font-bold mb-4">{step}</div>
              <p className="text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= AUDIENCE ================= */}
      <section className="py-24 bg-white/5 border-y border-white/10 reveal opacity-0 translate-y-10 transition-all duration-700">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16">
            Built for Students and Teachers
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-left">
            {[
              {
                title: "Students",
                items: [
                  "Generate AI-based quizzes instantly",
                  "Track performance and accuracy trends",
                  "Adaptive difficulty recommendations",
                  "Practice & challenge modes",
                ],
              },
              {
                title: "Teachers",
                items: [
                  "Create and manage quizzes",
                  "Assign quizzes to classrooms",
                  "Monitor student participation",
                  "Analyze learning progress",
                ],
              },
            ].map((section) => (
              <div
                key={section.title}
                className="rounded-2xl bg-white/5 border border-white/10 p-10 hover:-translate-y-3 hover:border-sky-400/40 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-6 text-sky-400">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-slate-300">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-36 text-center overflow-hidden reveal opacity-0 translate-y-10 transition-all duration-700">

        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-sky-700" />
        <div className="absolute inset-0 bg-sky-500/20 blur-[120px]" />

        <div className="relative max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-extrabold">
            Ready to Experience Smarter Learning?
          </h2>

          <p className="mt-6 text-sky-100 text-lg">
            Join now and transform how quizzes are created and analyzed.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="mt-12 bg-white text-sky-600 px-12 py-4 rounded-2xl font-semibold text-lg hover:bg-sky-50 hover:-translate-y-1 transition-all duration-200 shadow-2xl shadow-white/40"
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 border-t border-white/10 py-10 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} QuizGen. Built with Django & React.</p>
        <p className="mt-2">AI-powered • Secure • Role-based • Cloud deployed</p>
      </footer>

    </div>
  );
}