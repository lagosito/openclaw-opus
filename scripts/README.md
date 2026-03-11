# Scripts

## seed-agents.ts
Inserts CLAUDE and PABLO into Supabase once.

```bash
# Set env vars first (or add to .env)
export VITE_SUPABASE_URL=https://xxxx.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...

npx tsx scripts/seed-agents.ts
```

## reporter.py
Send activity from any agent (PABLO on Mac Mini, CLAUDE on Kiosk) to the Control Center.

### Setup
```bash
pip install supabase python-dotenv
```

Create a `.env` file next to the script:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Usage
```bash
# Report an activity
python reporter.py --agent pablo --message "Experiment finished" --tokens-in 1200 --tokens-out 800 --cost 0.012

# Update agent status
python reporter.py --agent pablo --status active
python reporter.py --agent pablo --status idle

# Report for CLAUDE
python reporter.py --agent claude --message "Kiosk session completed" --tokens-in 500 --tokens-out 300 --cost 0.004
```

### Import in your Python code
```python
from scripts.reporter import report, update_agent_status

# After running a model call:
report(
    message="User asked about menu",
    tokens_in=response.usage.input_tokens,
    tokens_out=response.usage.output_tokens,
    cost=calculate_cost(response),
    agent="pablo",
)

# Mark agent as busy
update_agent_status("pablo", "active")

# Mark agent as done
update_agent_status("pablo", "idle")
```
