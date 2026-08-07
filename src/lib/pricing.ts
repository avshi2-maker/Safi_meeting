// pricing.ts (src/lib/pricing.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
// Date-aware Claude pricing so the cost meter stays accurate across the
// intro-rate cutover. Sonnet 5: $2/$10 per MTok through 31 Aug 2026,
// then $3/$15 from 1 Sep 2026 (source: anthropic.com/news/claude-sonnet-5).

interface Rate {
  input: number; // USD per 1M input tokens
  output: number; // USD per 1M output tokens
}

const INTRO_CUTOVER = Date.UTC(2026, 8, 1); // 2026-09-01

function sonnet5Rate(at: number): Rate {
  return at < INTRO_CUTOVER
    ? { input: 2, output: 10 }
    : { input: 3, output: 15 };
}

const STATIC_RATES: Record<string, Rate> = {
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
};

export function rateFor(model: string, at: number = Date.now()): Rate {
  if (model.startsWith("claude-sonnet-5")) return sonnet5Rate(at);
  return STATIC_RATES[model] ?? sonnet5Rate(at);
}

export function costUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
  at: number = Date.now(),
): number {
  const r = rateFor(model, at);
  const c = (inputTokens / 1_000_000) * r.input + (outputTokens / 1_000_000) * r.output;
  return Math.round(c * 100000) / 100000; // 5 dp
}
