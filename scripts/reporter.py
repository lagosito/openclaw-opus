#!/usr/bin/env python3
"""
reporter.py — OpenClaw Activity Reporter
=========================================
Corre esto en PABLO (Mac Mini) para enviar actividad al Control Center.

Instalar dependencias:
    pip install supabase python-dotenv

Configuración mínima — crea un archivo .env con solo esto:
    SUPABASE_SERVICE_ROLE_KEY=eyJ...

La URL del proyecto ya está hardcodeada.

Uso desde terminal:
    python reporter.py --agent pablo --message "Experimento terminado" --tokens-in 1200 --tokens-out 800 --cost 0.012
    python reporter.py --agent pablo --status active
    python reporter.py --agent claude --message "Kiosk session done" --tokens-in 500 --tokens-out 300 --cost 0.004

Uso desde Python:
    from reporter import report, update_agent_status
    report(message="Task done", tokens_in=500, tokens_out=300, cost=0.005, agent="pablo")
    update_agent_status("pablo", "active")
"""

import argparse
import os
import sys
from datetime import datetime

try:
    from supabase import create_client
except ImportError:
    print("❌  Instala dependencias: pip install supabase python-dotenv")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv opcional

# ── Configuración del proyecto ──────────────────────────────────────────────
SUPABASE_URL = "https://rygtccmcqycnzkfpjxss.supabase.co"

AGENT_IDS = {
    "claude": "claude-kiosk-prod",
    "pablo":  "pablo-mac-mini",
}

MODEL_DEFAULT = "claude-opus-4-5"
# ─────────────────────────────────────────────────────────────────────────────


def get_client():
    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_KEY")
    )
    if not key:
        raise EnvironmentError(
            "❌  Falta SUPABASE_SERVICE_ROLE_KEY en el .env\n"
            "    Encuéntrala en: Supabase → Settings → API → service_role"
        )
    return create_client(SUPABASE_URL, key)


def report(
    message: str,
    tokens_in: int = 0,
    tokens_out: int = 0,
    cost: float = 0.0,
    agent: str = "pablo",
    model: str = MODEL_DEFAULT,
    activity_type: str = "task",
) -> dict:
    """Envía un registro de actividad a Supabase. Retorna la fila insertada."""
    client = get_client()
    agent_id = AGENT_IDS.get(agent, agent)

    payload = {
        "agent_id":   agent_id,
        "message":    message,
        "tokens_in":  tokens_in,
        "tokens_out": tokens_out,
        "cost":       cost,
        "model":      model,
        "type":       activity_type,
        "created_at": datetime.utcnow().isoformat(),
    }

    result = client.table("activity").insert(payload).execute()
    row = result.data[0] if result.data else payload
    print(f"✅  [{agent.upper()}] {message[:70]}")
    return row


def update_agent_status(agent: str, status: str) -> None:
    """Actualiza el status del agente: active | idle | error"""
    client = get_client()
    agent_id = AGENT_IDS.get(agent, agent)
    client.table("agents").update({
        "status":     status,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", agent_id).execute()
    print(f"🔄  {agent.upper()} → {status}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OpenClaw Activity Reporter")
    parser.add_argument("--agent",   choices=["claude", "pablo"], default="pablo")
    parser.add_argument("--message", default="")
    parser.add_argument("--tokens-in",  type=int,   default=0)
    parser.add_argument("--tokens-out", type=int,   default=0)
    parser.add_argument("--cost",       type=float, default=0.0)
    parser.add_argument("--model",      default=MODEL_DEFAULT)
    parser.add_argument("--type",       dest="activity_type", default="task")
    parser.add_argument("--status",     choices=["active", "idle", "error"],
                        help="Solo actualizar status del agente")
    args = parser.parse_args()

    if args.status:
        update_agent_status(args.agent, args.status)
    elif args.message:
        report(
            message=args.message,
            tokens_in=args.tokens_in,
            tokens_out=args.tokens_out,
            cost=args.cost,
            agent=args.agent,
            model=args.model,
            activity_type=args.activity_type,
        )
    else:
        parser.print_help()
