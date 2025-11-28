// src/components/AvatarUpload.jsx
import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function AvatarUpload({ currentAvatarUrl, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  function handleFileChange(e) {
    setError("");
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("Max file size 2MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function upload() {
    if (!file) return setError("Choose an image first.");
    setLoading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await api.post("/accounts/profile/avatar/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded && onUploaded(res.data.avatar || preview);
      setFile(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <div style={{ marginBottom: 8 }}>
        <img
          src={preview || "/default-avatar.png"}
          alt="avatar"
          style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}
        />
      </div>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={upload} disabled={loading} style={{ marginRight: 8 }}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button type="button" onClick={() => { setFile(null); setPreview(currentAvatarUrl || null); }}>
          Cancel
        </button>
      </div>

      {error && <div style={{ color: "red", marginTop: 8 }}>{String(error)}</div>}
    </div>
  );
}
