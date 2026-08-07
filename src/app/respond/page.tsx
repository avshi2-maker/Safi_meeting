// page.tsx (src/app/respond/page.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { redirect } from "next/navigation";
import { getParticipant } from "@/lib/participants";
import { getResponse } from "@/lib/responses";
import AvailabilityForm from "@/components/AvailabilityForm";

export const dynamic = "force-dynamic";

export default async function RespondPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  if (!p) redirect("/");
  const participant = await getParticipant(p);
  if (!participant) redirect("/");
  const existing = await getResponse(p);

  return (
    <AvailabilityForm
      participant={{ id: participant.id, name: participant.name }}
      existing={existing ? { availability: existing.availability, note: existing.note } : null}
    />
  );
}
