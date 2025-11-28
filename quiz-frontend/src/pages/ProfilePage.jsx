import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [preferredDifficulty, setPreferredDifficulty] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Utility: ensure a URL is absolute (prefix origin if needed)
  const toAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // url might be '/media/avatars/....' -> prefix origin
    return `${window.location.origin}${url}`;
  };

  // -----------------------------
  // Load profile data
  // -----------------------------
  const loadProfile = async () => {
    try {
      const res = await api.get("/accounts/profile/");
      setProfile(res.data);

      setFullName(res.data.full_name || "");
      setPreferredDifficulty(res.data.preferences?.preferred_difficulty || "");
      setPreferredCategory(res.data.preferences?.preferred_category || "");

      // backend may return either `avatar` (relative path) or `avatar_url` (absolute)
      const avatarFromApi =
        res.data.avatar_url ?? res.data.avatar ?? null;

      if (avatarFromApi) {
        setAvatarPreview(toAbsoluteUrl(avatarFromApi));
      } else {
        setAvatarPreview(null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      alert("Failed to load profile");
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // Save profile
  // -----------------------------
  const saveProfile = async () => {
    try {
      await api.post("/accounts/profile/", {
        full_name: fullName,
        preferences: {
          preferred_difficulty: preferredDifficulty,
          preferred_category: preferredCategory,
        },
      });

      alert("Profile updated!");
      await loadProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    }
  };

  // -----------------------------
  // Upload avatar
  // -----------------------------
  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await api.post("/accounts/profile/avatar/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Prefer backend-provided avatar_url if present
      const avatarUrlFromResponse =
        res?.data?.avatar_url ?? res?.data?.avatar ?? null;

      if (avatarUrlFromResponse) {
        setAvatarPreview(toAbsoluteUrl(avatarUrlFromResponse));
      } else {
        // As a fallback, reload profile to get avatar path
        await loadProfile();
      }

      alert("Avatar uploaded!");
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload avatar");
      // revert local preview when failed
      await loadProfile();
    } finally {
      setUploading(false);
      // revoke local URL object after some time to release memory (optional)
      setTimeout(() => {
        if (localUrl) URL.revokeObjectURL(localUrl);
      }, 5000);
    }
  };

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 bg-white flex items-center justify-center">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">Avatar</div>
            )}
          </div>

          <label className="mt-4 cursor-pointer inline-flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            {uploading ? "Uploading..." : "Upload Avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Fields */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="font-semibold">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="font-semibold">Preferred Difficulty</label>
            <select
              value={preferredDifficulty}
              onChange={(e) => setPreferredDifficulty(e.target.value)}
              className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- None --</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold">Preferred Category</label>
            <input
              type="text"
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              placeholder="Eg: Python, Java, DBMS"
              className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={saveProfile}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
