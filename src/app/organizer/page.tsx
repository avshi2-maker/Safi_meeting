// page.tsx (src/app/organizer/page.tsx) · updated 07.08.2026 19:30 (Asia/Jerusalem)
import { getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import { getLatestSuggestion } from "@/lib/suggestions";
import { tallyPrefs } from "@/lib/prefs";
import { isOrganizer } from "@/app/actions";
import OrganizerGate from "@/components/OrganizerGate";
import OrganizerDashboard from "@/components/OrganizerDashboard";

export const dynamic = "force-dynamic";

export default async function OrganizerPage() {
  if (!(await isOrganizer())) return <OrganizerGate />;

  const [participants, responses, latest] = await Promise.all([
    getParticipants(),
    getAllResponses(),
    getLatestSuggestion(),
  ]);

  return (
    <OrganizerDashboard
      participants={participants.map((p) => ({ id: p.id, name: p.name }))}
      responses={responses.map((r) => ({
        participant_id: r.participant_id,
        name: r.name,
        availability: r.availability,
        note: r.note,
      }))}
      latest={latest ? {
        options: latest.options,
        model: latest.model,
        tokens_in: latest.tokens_in,
        tokens_out: latest.tokens_out,
        cost_usd: latest.cost_usd,
      } : null}
      prefs={tallyPrefs(responses)}
    />
  );
}
