"use client";
// Clock.tsx (src/components/Clock.tsx) · updated 07.08.2026 18:40 (Asia/Jerusalem)
import { useEffect, useState } from "react";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <div className="clock"><span className="clock-time">--:--:--</span></div>;
  const time = now.toLocaleTimeString("he-IL", { hour12: false });
  const date = now.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <div className="clock">
      <span className="clock-time">{time}</span>
      <span className="clock-date">יום {DAYS[now.getDay()]} · {date}</span>
    </div>
  );
}
