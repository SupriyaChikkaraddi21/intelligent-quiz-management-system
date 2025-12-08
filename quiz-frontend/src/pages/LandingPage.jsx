// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function LandingPage() {
//   const navigate = useNavigate();

//   return (
//     <div className="bg-[#F8FAFC] text-[#1E293B]">

//       {/* ---------------- HERO SECTION ---------------- */}
//       <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

//         {/* Left */}
//         <div>
//           <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#1F3A5F]">
//             QuizGen – Intelligent Quiz Management <br /> with AI-Generated Questions
//           </h1>

//           <p className="text-lg mt-6 text-[#64748B] max-w-lg">
//             Reduce quiz creation time, improve learning outcomes, and track
//             performance effortlessly — all powered by AI and secure evaluation workflows.
//           </p>

//           <div className="flex gap-4 mt-8">
//             <button
//               onClick={() => navigate("/register")}
//               className="bg-[#F5A623] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
//             >
//               Start Quiz Free
//             </button>

//             <button
//               onClick={() => navigate("/dashboard")}
//               className="border px-6 py-3 rounded-lg font-semibold text-[#1F3A5F] hover:bg-gray-100 transition"
//             >
//               View Dashboard
//             </button>
//           </div>

//           <p className="text-sm text-[#64748B] mt-4">
//             Secure platform • AI-assisted • Performance tracking
//           </p>
//         </div>

//         {/* Right – Dashboard Preview */}
//         <div className="hidden md:block">
//           <img
//             src="/images/dashboard-preview.png"
//             alt="Dashboard Preview"
//             className="rounded-xl shadow-lg border"
//           />
//         </div>
//       </section>

//       {/* ---------------- PROBLEM → SOLUTION ---------------- */}
//       <section className="max-w-6xl mx-auto px-6 py-16">
//         <h2 className="text-2xl font-bold text-[#1F3A5F]">Why QuizGen?</h2>

//         <div className="mt-6 grid md:grid-cols-2 gap-10 text-[#64748B]">
//           <div>
//             <h3 className="font-semibold text-[#1E293B]">The Problem</h3>
//             <p className="mt-2">
//               Manual quiz creation is slow, question banks become outdated, and
//               students rarely get clear performance insights.
//             </p>
//           </div>
//           <div>
//             <h3 className="font-semibold text-[#1E293B]">The Solution</h3>
//             <p className="mt-2">
//               QuizGen automates question generation, centralizes quizzes, and provides  
//               simple performance dashboards so learning becomes efficient and transparent.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* ---------------- CORE CAPABILITIES ---------------- */}
//       <section className="bg-white py-20 border-t border-b">
//         <div className="max-w-7xl mx-auto px-6">
//           <h2 className="text-3xl font-bold text-center text-[#1F3A5F]">
//             Core Capabilities
//           </h2>

//           <div className="grid md:grid-cols-3 gap-10 mt-12">
//             {[
//               {
//                 title: "Secure Login & Profiles",
//                 desc: "Safe and protected access for every user with personalized progress tracking.",
//               },
//               {
//                 title: "Category & Difficulty Selection",
//                 desc: "Choose topics and difficulty levels for personalized learning experiences.",
//               },
//               {
//                 title: "AI-Generated Questions",
//                 desc: "Generate new, relevant questions instantly with AI assistance.",
//               },
//               {
//                 title: "Timed Quiz Attempts",
//                 desc: "Built-in timer ensures structured and disciplined quiz attempts.",
//               },
//               {
//                 title: "Automatic Scoring",
//                 desc: "Instant scoring removes manual work and speeds up evaluation.",
//               },
//               {
//                 title: "Performance Dashboard",
//                 desc: "View score history, improvements, and analytics in one clean interface.",
//               },
//             ].map((item, i) => (
//               <div
//                 key={i}
//                 className="p-6 bg-[#F8FAFC] rounded-xl border shadow-sm"
//               >
//                 <h3 className="font-semibold text-[#1E293B]">{item.title}</h3>
//                 <p className="text-sm mt-2 text-[#64748B]">{item.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ---------------- HOW IT WORKS ---------------- */}
//       <section className="max-w-6xl mx-auto px-6 py-20">
//         <h2 className="text-3xl font-bold text-center text-[#1F3A5F]">
//           How QuizGen Works
//         </h2>

//         <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8 mt-12 text-center">
//           {[
//             "Register and log in",
//             "Choose a category",
//             "Select difficulty",
//             "AI generates questions",
//             "Attempt quiz with timer",
//             "Get score & explanations",
//           ].map((step, i) => (
//             <div key={i}>
//               <div className="w-10 h-10 mx-auto rounded-full bg-[#2BB0A6] text-white flex items-center justify-center font-bold">
//                 {i + 1}
//               </div>
//               <p className="mt-3 text-sm text-[#1E293B]">{step}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ---------------- TRUST & RELIABILITY ---------------- */}
//       <section className="bg-white py-16 border-t">
//         <div className="max-w-6xl mx-auto px-6">
//           <h2 className="text-2xl font-bold text-[#1F3A5F]">Trust & Reliability</h2>

//           <ul className="grid md:grid-cols-2 gap-8 mt-6 text-[#64748B]">
//             <li>Secure assessment environment</li>
//             <li>Protected user data</li>
//             <li>Reliable scoring and analytics</li>
//             <li>Designed for ongoing academic use</li>
//           </ul>
//         </div>
//       </section>

//       {/* ---------------- PROJECT OUTCOMES ---------------- */}
//       <section className="max-w-6xl mx-auto px-6 py-20">
//         <h2 className="text-2xl font-bold text-[#1F3A5F]">Project outcomes & impact</h2>

//         <ul className="mt-4 text-[#64748B] space-y-2">
//           <li>Faster quiz creation — significant time savings.</li>
//           <li>Consistent evaluation across quizzes.</li>
//           <li>Clear insights for learning improvement.</li>
//           <li>Instant answer explanations support learning.</li>
//           <li>Ready for academic deployment.</li>
//         </ul>
//       </section>

//       {/* ---------------- FINAL CTA ---------------- */}
//       <section className="bg-[#1F3A5F] text-white py-20 text-center">
//         <h2 className="text-3xl font-bold">Get Started with QuizGen</h2>
//         <p className="opacity-80 mt-2">No payment • Academic access • Instant login</p>

//         <button
//           onClick={() => navigate("/register")}
//           className="mt-8 bg-[#F5A623] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
//         >
//           Get Started with QuizGen
//         </button>
//       </section>

//       {/* ---------------- FOOTER (UPDATED - NO DEVELOPER SECTION) ---------------- */}
//       <footer className="bg-white border-t">
//         <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">

//           {/* Column 1 – Project Info */}
//           <div>
//             <h4 className="text-sm font-semibold text-[#1F3A5F]">QuizGen</h4>
//             <p className="mt-2 text-sm text-[#64748B]">
//               Intelligent Quiz Management System with AI-Generated Questions — academic demo and pilot-ready.
//             </p>
//           </div>

//           {/* Column 2 – Contact */}
//           <div>
//             <p className="text-xs font-semibold text-[#1E293B]">Contact</p>
//             <p className="mt-2 text-sm text-[#64748B]">quizgen.project@gmail.com</p>
//           </div>

//           {/* Column 3 – Resources */}
//           <div>
//             <p className="text-xs font-semibold text-[#1E293B]">Resources</p>
//             <ul className="mt-2 space-y-2 text-sm text-[#64748B]">
//               <li><a href="/docs" className="hover:underline">Documentation</a></li>
//               <li><a href="/github" className="hover:underline">GitHub Repository</a></li>
//               <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
//               <li><a href="/terms" className="hover:underline">Terms & Conditions</a></li>
//             </ul>
//           </div>

//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-4 border-t border-slate-100 text-sm text-[#64748B] flex justify-between">
//           <span>© {new Date().getFullYear()} QuizGen</span>

//           <div className="flex gap-4">
//             <a href="/privacy" className="hover:underline">Privacy</a>
//             <a href="/terms" className="hover:underline">Terms</a>
//             <a href="/about" className="hover:underline">About</a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useEffect } from "react";
import dashboardPreview from "../images/dashboard_preview.jpeg";


export default function LandingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const items = document.querySelectorAll(".workflow-item");
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.4 }
    );
  
    items.forEach((item) => observer.observe(item));
  
    return () => observer.disconnect();
  }, []);
  

  return (
    <div className="landing-wrapper">

      {/* ✅ NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <h3 className="nav-logo">QuizGen</h3>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#trust">Trust</a>
          </div>

          <div className="nav-buttons">
            <button onClick={() => navigate("/login")} className="btn-primary">
              Login
            </button>
            <button onClick={() => navigate("/register")} className="btn-primary">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ HERO */}
      <section className="hero-section">
        <div className="hero-grid">
          <div>
            <h1 className="hero-title">
              QuizGen – Intelligent Quiz Management <br /> with AI-Generated Questions
            </h1>

            <p className="hero-subtitle">
              Reduce quiz creation time, improve learning outcomes, and track
              performance effortlessly — all powered by AI and secure evaluation workflows.
            </p>

            <div className="hero-buttons">
              <button onClick={() => navigate("/register")} className="btn-primary">
                Start Quiz Free
              </button>

              <button onClick={() => navigate("/dashboard")} className="btn-secondary">
                View Dashboard
              </button>
            </div>

            <p className="hero-trust">
              Secure platform • AI-assisted • Performance tracking
            </p>
          </div>

          <div className="hero-image-wrap">
            <img
                src={dashboardPreview}
                alt="Dashboard Preview"
                className="hero-image"
              />

          </div>
        </div>
      </section>

      {/* ✅ WHY QUIZGEN */}
      <section className="problem-section">
        <h2 className="section-title">Why QuizGen?</h2>

        <div className="problem-grid">
          <div className="problem-card">
            <h3>The Problem</h3>
            <p>
              Manual quiz creation is slow, question banks become outdated, and
              students rarely get clear performance insights.
            </p>
          </div>
          <div className="problem-card highlight">
            <h3>The Solution</h3>
            <p>
              QuizGen automates question generation, centralizes quizzes, and provides  
              simple performance dashboards so learning becomes efficient and transparent.
            </p>
          </div>
        </div>
      </section>
      <section className="feature-section" id="features">
  <h2 className="section-title">AI Subject-Based Quiz</h2>

  {/* ✅ THIS WRAPPER FIXES SIDE-BY-SIDE */}
  <div className="feature-cards">
    <div className="feature-card">
      <img src="/images/ai-subject.png" alt="AI Subject Quiz" />
      <p>
        Users select a subject and difficulty level. AI dynamically generates
        intelligent questions tailored to the user's knowledge level.
      </p>
    </div>

    <div className="feature-card">
      <img src="/images/ai-pdf.png" alt="AI PDF Quiz" />
      <p>
        Users upload text or PDF documents and AI automatically creates
        quizzes directly from the study material with smart evaluations.
      </p>
    </div>
  </div>
</section>

      

      {/* ✅ CORE CAPABILITIES */}
      <section className="capabilities-section">
        <h2 className="section-title ">Core Capabilities</h2>

        <div className="capabilities-grid">
          {[
            "Secure Login & Profiles",
            "Category & Difficulty Selection",
            "AI-Generated Questions",
            "Timed Quiz Attempts",
            "Automatic Scoring",
            "Performance Dashboard",
          ].map((item, i) => (
            <div key={i} className="capability-card">
              {item}
            </div>
          ))}
        </div>
      </section>
      
  <section className="workflow-horizontal-section" id="workflow">
  <h2 className="section-title">How QuizGen Works</h2>
  <p className="section-subtitle">
    A simple AI-powered process from login to result.
  </p>

  <div className="workflow-horizontal">
    {[
      "Register & Login",
      "Choose Subject / Upload PDF",
      "AI Generates Questions",
      "Attempt Timed Quiz",
      "Automatic Evaluation",
      "Result & PDF Report",
    ].map((step, i) => (
      <div key={i} className="workflow-horizontal-card">
        <span className="workflow-step-number">{i + 1}</span>
        <p>{step}</p>
      </div>
    ))}
  </div>
</section>

      {/* ✅ TRUST */}
      <section className="trust-section" id="trust">
        <h2 className="section-title">Trust & Reliability</h2>

        <ul className="trust-list">
          <li>Secure assessment environment</li>
          <li>Protected user data</li>
          <li>Reliable scoring and analytics</li>
          <li>Designed for ongoing academic use</li>
        </ul>
      </section>

      {/* ✅ PROJECT OUTCOMES */}
      <section className="outcome-section">
        <h2 className="section-title">Project Outcomes & Impact</h2>
        <ul>
          <li>Faster quiz creation</li>
          <li>Consistent evaluation</li>
          <li>Clear learning insights</li>
          <li>Instant explanations</li>
          <li>Academic-ready deployment</li>
        </ul>
      </section>

      {/* ✅ FINAL CTA */}
      <section className="final-cta">
        <h2>Get Started with QuizGen</h2>
        <p>No payment • Academic access • Instant login</p>

        <button onClick={() => navigate("/register")} className="btn-primary large">
          Get Started with QuizGen
        </button>
      </section>

      {/* ✅ FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>QuizGen</h4>
            <p>Intelligent Quiz Management System with AI-Generated Questions</p>
          </div>

          <div>
            <p>quizgen.project@gmail.com</p>
          </div>

          <div>
            <a href="/docs">Docs</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} QuizGen
        </div>
      </footer>

    </div>
  );
}
