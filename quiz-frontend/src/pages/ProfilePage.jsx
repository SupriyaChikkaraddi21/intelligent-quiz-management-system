import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [preferredDifficulty, setPreferredDifficulty] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const API_BASE = "http://localhost:8000";

  const toAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };


  const loadProfile = async () => {
    try {
      const res = await api.get("/accounts/profile/");
      setProfile(res.data);
      setFullName(res.data.full_name || "");
      setPreferredDifficulty(
        res.data.preferences?.preferred_difficulty || ""
      );
      setPreferredCategory(
        res.data.preferences?.preferred_category || ""
      );

      const avatar =
        res.data.avatar_url ?? res.data.avatar ?? null;
      setAvatarPreview(avatar ? toAbsoluteUrl(avatar) : null);
    } catch {
      alert("Failed to load profile");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    try {
      await api.post("/accounts/profile/", {
        full_name: fullName,
        preferences: {
          preferred_difficulty: preferredDifficulty,
          preferred_category: preferredCategory,
        },
      });
      alert("Profile updated");
      loadProfile();
    } catch {
      alert("Failed to update profile");
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await api.post(
        "/accounts/profile/avatar/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const avatar =
        res?.data?.avatar_url ?? res?.data?.avatar ?? null;
      if (avatar) setAvatarPreview(toAbsoluteUrl(avatar));
    } catch {
      alert("Avatar upload failed");
      loadProfile();
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-slate-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4
                    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_45%)] pointer-events-none" />

      {/* CARD */}
      <div
        className="
          relative w-full max-w-xl
          rounded-3xl bg-white p-8
          shadow-xl
          transition-all duration-300
        "
      >
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your personal details and learning preferences.
          </p>
        </div>

        {/* AVATAR */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="
              relative w-28 h-28 rounded-full overflow-hidden
              bg-slate-100
              ring-2 ring-sky-200
              transition-all duration-300
              hover:ring-sky-400 hover:shadow-lg hover:-translate-y-1
            "
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                No Avatar
              </div>
            )}
          </div>

          <label
            className="
              mt-4 cursor-pointer
              text-sm font-medium
              px-4 py-2 rounded-lg
              bg-sky-100 text-sky-700
              hover:bg-sky-200
              transition
            "
          >
            {uploading ? "Uploading…" : "Change Avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
            />
          </label>
        </div>

        {/* FORM */}
        <div className="space-y-6">

          <Field label="Full Name">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Preferred Difficulty">
            <select
              value={preferredDifficulty}
              onChange={(e) => setPreferredDifficulty(e.target.value)}
              className="input"
            >
              <option value="">None</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </Field>

          <Field label="Preferred Category">
            <input
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              placeholder="Python, Java, DBMS"
              className="input"
            />
          </Field>

        </div>

        {/* SAVE */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={saveProfile}
            className="
              px-6 py-3 rounded-xl
              bg-sky-500 text-white font-semibold
              shadow-md
              hover:bg-sky-600 hover:shadow-lg hover:-translate-y-[1px]
              active:scale-[0.98]
              transition-all
            "
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* styles */}
      <style>
        {`
          .input {
            margin-top: 0.5rem;
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            color: #0f172a;
            outline: none;
            transition: all 0.2s ease;
          }
          .input:focus {
            border-color: #38bdf8;
            box-shadow: 0 0 0 3px rgba(56,189,248,0.25);
          }
        `}
      </style>
    </div>
  );
}

/* ---------- SMALL WRAPPER ---------- */

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}