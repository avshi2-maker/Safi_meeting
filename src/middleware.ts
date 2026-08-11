// middleware.ts (src/middleware.ts) · updated 11.08.2026 11:15 (Asia/Jerusalem)
// Force the canonical subdomain: anyone opening the .vercel.app address is
// redirected to safi.marble-art.co.il. API routes (cron/digest) are excluded.
import { NextRequest, NextResponse } from "next/server";

const CANON = "safi.marble-art.co.il";
const VERCEL = "safi-meeting.vercel.app";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  if (host === VERCEL) {
    const url = req.nextUrl.clone();
    url.host = CANON;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 307);
  }
  return NextResponse.next();
}

export const config = {
  // Redirect page views only — never /api (keeps the digest cron working),
  // Next internals, or the static images.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|safi_qr.png|safi_backround.png|safi_4helmets.png).*)"],
};
