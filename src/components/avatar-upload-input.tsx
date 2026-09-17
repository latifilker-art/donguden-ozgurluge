"use client";

export function AvatarUploadInput() {
  return (
    <input
      type="file"
      name="avatar"
      accept="image/*"
      className="sr-only"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    />
  );
}
