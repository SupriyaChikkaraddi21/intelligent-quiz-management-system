// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [preferredDifficulty, setPreferredDifficulty] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const toAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${window.location.origin}${url}`;
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
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-white via-sky-50 to-sky-100 px-4">

      {/* MAIN CARD */}
      <div className="w-full max-w-xl rounded-3xl bg-white
                      border border-sky-200 p-8 shadow-lg">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your personal details and learning preferences.
          </p>
        </div>

        {/* AVATAR */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full overflow-hidden
                          border border-sky-300 flex items-center
                          justify-center bg-sky-50">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-400 text-sm">
                No Avatar
              </span>
            )}
          </div>

          <label className="mt-4 cursor-pointer text-sm
                            px-4 py-2 rounded-lg
                            bg-sky-100 text-slate-700
                            hover:bg-sky-200 transition">
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

          <div>
            <label className="text-xs uppercase text-slate-500">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-lg bg-white
                         border border-sky-200 px-4 py-3
                         text-slate-800
                         focus:outline-none focus:ring-2
                         focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-slate-500">
              Preferred Difficulty
            </label>
            <select
              value={preferredDifficulty}
              onChange={(e) => setPreferredDifficulty(e.target.value)}
              className="mt-2 w-full rounded-lg bg-white
                         border border-sky-200 px-4 py-3
                         text-slate-800 focus:outline-none"
            >
              <option value="">None</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase text-slate-500">
              Preferred Category
            </label>
            <input
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              placeholder="Python, Java, DBMS"
              className="mt-2 w-full rounded-lg bg-white
                         border border-sky-200 px-4 py-3
                         text-slate-800 focus:outline-none"
            />
          </div>

        </div>

        {/* SAVE */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={saveProfile}
            className="px-6 py-3 rounded-xl
                       bg-sky-500 text-white font-semibold
                       hover:bg-sky-600 transition"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
