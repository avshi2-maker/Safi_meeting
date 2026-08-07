"use client";
// BackButton.tsx (src/components/BackButton.tsx) · updated 07.08.2026 18:40 (Asia/Jerusalem)
import Link from "next/link";

export default function BackButton({ label = "לדף הראשי" }: { label?: string }) {
  return (
    <div className="backbar">
      <Link href="/" className="btn btn-ghost">→ {label}</Link>
    </div>
  );
}
