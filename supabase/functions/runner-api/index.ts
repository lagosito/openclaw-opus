import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const fullPath = url.pathname;
  const fnIndex = fullPath.indexOf("/runner-api");
  const path = fnIndex >= 0 ? fullPath.substring(fnIndex + "/runner-api/".length) : fullPath.replace(/^\//, "");
  const method = req.method;

  console.log("Runner API:", method, path, fullPath);

  try {
    // GET /tasks?status=queue — runner polls for tasks
    if (method === "GET" && path === "tasks") {
      const status = url.searchParams.get("status") || "queue";
      const agentId = url.searchParams.get("agent_id");
      let query = supabase
        .from("tasks")
        .select("*, agents(name, emoji, model)")
        .eq("status", status)
        .order("created_at", { ascending: true });
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return json(data);
    }

    // POST /tasks — create a task
    if (method === "POST" && path === "tasks") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: body.title,
          agent_id: body.agent_id || null,
          status: body.status || "queue",
          priority: body.priority || "medium",
          due_at: body.due_at || null,
        })
        .select()
        .single();
      if (error) throw error;
      return json(data, 201);
    }

    // PATCH /tasks/:id — update task status/assignee/priority
    if (method === "PATCH" && path.startsWith("tasks/")) {
      const taskId = path.replace("tasks/", "");
      const body = await req.json();
      const updates: Record<string, unknown> = {};
      if (body.status !== undefined) updates.status = body.status;
      if (body.agent_id !== undefined) updates.agent_id = body.agent_id;
      if (body.priority !== undefined) updates.priority = body.priority;
      if (body.due_at !== undefined) updates.due_at = body.due_at;
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();
      if (error) throw error;

      // Log activity for status changes
      if (body.status === "in-progress" || body.status === "done") {
        await supabase.from("activity").insert({
          agent_id: data.agent_id,
          type: body.status === "done" ? "task_completed" : "task_started",
          message: `Task "${data.title}" ${body.status === "done" ? "completed" : "started"}`,
          model: "",
        });
      }
      return json(data);
    }

    // POST /task-runs — runner posts results
    if (method === "POST" && path === "task-runs") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("task_runs")
        .insert({
          task_id: body.task_id,
          agent_id: body.agent_id || null,
          status: body.status || "success",
          output: body.output || null,
          tokens_in: body.tokens_in || 0,
          tokens_out: body.tokens_out || 0,
          cost: body.cost || 0,
          model: body.model || null,
          logs: body.logs || null,
          started_at: body.started_at || null,
          finished_at: body.finished_at || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Update task to done
      await supabase
        .from("tasks")
        .update({ status: "done" })
        .eq("id", body.task_id);

      // Log activity
      await supabase.from("activity").insert({
        agent_id: body.agent_id,
        type: body.status === "failed" ? "error" : "task_completed",
        message: body.status === "failed"
          ? `Task run failed: ${body.output || "unknown error"}`
          : `Task completed (${body.tokens_in + body.tokens_out} tokens, $${body.cost})`,
        tokens_in: body.tokens_in || 0,
        tokens_out: body.tokens_out || 0,
        cost: body.cost || 0,
        model: body.model || "",
      });

      return json(data, 201);
    }

    // POST /job-runs — runner posts job results
    if (method === "POST" && path === "job-runs") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("job_runs")
        .insert({
          job_id: body.job_id,
          agent_id: body.agent_id || null,
          status: body.status || "success",
          output: body.output || null,
          tokens_in: body.tokens_in || 0,
          tokens_out: body.tokens_out || 0,
          cost: body.cost || 0,
          model: body.model || null,
          logs: body.logs || null,
          started_at: body.started_at || null,
          finished_at: body.finished_at || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Update job last_run
      await supabase
        .from("jobs")
        .update({ last_run: body.finished_at || new Date().toISOString() })
        .eq("id", body.job_id);

      // Log activity
      await supabase.from("activity").insert({
        agent_id: body.agent_id,
        type: body.status === "failed" ? "error" : "job_completed",
        message: body.status === "failed"
          ? `Job run failed: ${body.output || "unknown error"}`
          : `Job completed (${body.tokens_in + body.tokens_out} tokens, $${body.cost})`,
        tokens_in: body.tokens_in || 0,
        tokens_out: body.tokens_out || 0,
        cost: body.cost || 0,
        model: body.model || "",
      });

      return json(data, 201);
    }

    // GET /agents
    if (method === "GET" && path === "agents") {
      const { data, error } = await supabase.from("agents").select("*").order("created_at");
      if (error) throw error;
      return json(data);
    }

    // POST /agents
    if (method === "POST" && path === "agents") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("agents")
        .insert({ name: body.name, emoji: body.emoji || "🤖", role: body.role || "", model: body.model || "claude-opus-4" })
        .select()
        .single();
      if (error) throw error;
      return json(data, 201);
    }

    // GET /activity
    if (method === "GET" && path === "activity") {
      const agentId = url.searchParams.get("agent_id");
      let query = supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(50);
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return json(data);
    }

    // GET /usage
    if (method === "GET" && path === "usage") {
      // Aggregate from task_runs and job_runs
      const { data: taskRuns } = await supabase.from("task_runs").select("*");
      const { data: jobRuns } = await supabase.from("job_runs").select("*");
      const allRuns = [...(taskRuns || []), ...(jobRuns || [])];
      const totalCost = allRuns.reduce((s, r) => s + Number(r.cost), 0);
      const totalTokens = allRuns.reduce((s, r) => s + r.tokens_in + r.tokens_out, 0);
      return json({ totalCost, totalTokens, runs: allRuns.length });
    }

    // GET /jobs
    if (method === "GET" && path === "jobs") {
      const { data, error } = await supabase.from("jobs").select("*, agents(name, emoji)").order("created_at");
      if (error) throw error;
      return json(data);
    }

    // POST /jobs
    if (method === "POST" && path === "jobs") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          name: body.name,
          agent_id: body.agent_id || null,
          schedule: body.schedule || "0 * * * *",
          timezone: body.timezone || "UTC",
          enabled: body.enabled ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return json(data, 201);
    }

    // GET /skills
    if (method === "GET" && path === "skills") {
      const { data, error } = await supabase.from("skills").select("*").order("created_at");
      if (error) throw error;
      return json(data);
    }

    // PATCH /skills/:id
    if (method === "PATCH" && path.startsWith("skills/")) {
      const skillId = path.replace("skills/", "");
      const body = await req.json();
      const updates: Record<string, unknown> = {};
      if (body.enabled !== undefined) updates.enabled = body.enabled;
      if (body.config !== undefined) updates.config = body.config;
      const { data, error } = await supabase
        .from("skills")
        .update(updates)
        .eq("id", skillId)
        .select()
        .single();
      if (error) throw error;
      return json(data);
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("Runner API error:", err);
    return json({ error: err.message }, 500);
  }
});
