/**
 * seed-agents.ts
 * Run once to insert CLAUDE and PABLO into Supabase.
 * Usage: npx tsx scripts/seed-agents.ts
 *
 * Requires env vars:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (from Supabase → Settings → API → service_role)
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const agents = [
  {
    id: "claude-kiosk-prod",
    name: "CLAUDE",
    emoji: "🤖",
    role: "Kiosk · Producción",
    model: "claude-opus-4-5",
    status: "active",
  },
  {
    id: "pablo-mac-mini",
    name: "PABLO",
    emoji: "🦞",
    role: "OpenClaw · Experimentos",
    model: "claude-opus-4-5",
    status: "idle",
  },
];

async function seed() {
  console.log("🌱  Seeding agents...");
  for (const agent of agents) {
    const { data, error } = await supabase
      .from("agents")
      .upsert(agent, { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.error(`❌  ${agent.name}:`, error.message);
    } else {
      console.log(`✅  ${data.name} (${data.id}) — status: ${data.status}`);
    }
  }
  console.log("\n🎉  Done! Open the dashboard to see your agents.");
}

seed();
