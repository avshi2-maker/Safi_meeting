// meeting.ts (src/lib/meeting.ts) · updated 31.08.2026 (Asia/Jerusalem)
// Fixed constraints for the current round. The gathering is hosted at Tali's
// home in Ramat HaSharon, so Tali must be able to attend every proposed date,
// and the meeting place + address are fixed (used for the Waze link too).
// Set REQUIRED_ATTENDEE to "" to drop the must-attend rule.
export const REQUIRED_ATTENDEE = "טלי";
export const MEETING_PLACE = "ביתה של טלי ברמת השרון";
export const MEETING_ADDRESS = "וייצמן 13 רמת השרון";
