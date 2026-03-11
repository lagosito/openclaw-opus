#!/usr/bin/env python3
"""
reporter.py — OpenClaw Activity Reporter
=========================================
Run this on PABLO (Mac Mini) to push activity to Supabase.

Install deps:
    pip install supabase python-dotenv

Usage:
    # Single report
    python reporter.py --agent pablo --message "Finished experiment" --tokens-in 1200 --tokens-out 800 --cost 0.012

    # Or import and call report() from your own code:
    from reporter import report
    report(message="Task done", tokens_in=500, tokens_out=300, cost=0.005)

Env vars needed (add to .env):
    SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=eyJ...
"""

import argparse
import os
import sys
from datetime import datetime

try:
    from supabase import create_client
except ImportError:
    print("Install deps: pip install supabase python-dotenv")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv optional

AGENT_IDS = {
    "claude": "claude-kiosk-prod",
    "pablo": "pablo-mac-mini",
}

MODEL_DEFAULT = "claude-opus-4-5"


def get_client():
    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise EnvironmentError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
        )
    return create_client(url, key)


def report(
    message: str,
    tokens_in: int = 0,
    tokens_out: int = 0,
    cost: float = 0.0,
    agent: str = "pablo",
    model: str = MODEL_DEFAULT,
    activity_type: str = "task",
) -> dict:
    """Push one activity record to Supabase. Returns the inserted row."""
    client = get_client()
    agent_id = AGENT_IDS.get(agent, agent)  # accept raw id too

    payload = {
        "agent_id": agent_id,
        "message": message,
        "tokens_in": tokens_in,
        "tokens_out": tokens_out,
        "cost": cost,
        "model": model,
        "type": activity_type,
        "created_at": datetime.utcnow().isoformat(),
    }

    result = client.table("activity").insert(payload).execute()
    if hasattr(result, "error") and result.error:
        raise RuntimeError(f"Supabase error: {result.error}")

    row = result.data[0] if result.data else payload
    print(f"✅  Reported [{agent.upper()}]: {message[:60]}")
    return row


def update_agent_status(agent: str, status: str) -> None:
    """Update an agent's status: active | idle | error"""
    client = get_client()
    agent_id = AGENT_IDS.get(agent, agent)
    client.table("agents").update({"status": status, "updated_at": datetime.utcnow().isoformat()}).eq("id", agent_id).execute()
    print(f"🔄  {agent.upper()} status → {status}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OpenClaw activity reporter")
    parser.add_argument("--agent", choices=["claude", "pablo"], default="pablo")
    parser.add_argument("--message", required=True)
    parser.add_argument("--tokens-in", type=int, default=0)
    parser.add_argument("--tokens-out", type=int, default=0)
    parser.add_argument("--cost", type=float, default=0.0)
    parser.add_argument("--model", default=MODEL_DEFAULT)
    parser.add_argument("--type", dest="activity_type", default="task")
    parser.add_argument("--status", choices=["active", "idle", "error"], help="Update agent status only")
    args = parser.parse_args()

    if args.status:
        update_agent_status(args.agent, args.status)
    else:
        report(
            message=args.message,
            tokens_in=args.tokens_in,
            tokens_out=args.tokens_out,
            cost=args.cost,
            agent=args.agent,
            model=args.model,
            activity_type=args.activity_type,
        )
