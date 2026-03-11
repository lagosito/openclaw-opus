# OpenClaw Control Center — Context File
> Leer esto al inicio de cada sesión de AI. Actualizar cuando haya cambios importantes.

---

## ¿Qué es este proyecto?
**openclaw-opus** es un Control Center unificado para monitorear y gestionar dos agentes de IA desde un solo panel.

- **URL producción:** https://openclaw-opus.lovable.app
- **Repo:** https://github.com/lagosito/openclaw-opus
- **Stack:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase
- **Generado con:** [Lovable](https://lovable.dev) — Lovable maneja Supabase automáticamente

---

## Los dos agentes

### 🤖 CLAUDE — `claude-kiosk-prod`
- **Qué es:** Claude.ai corriendo como Kiosk en producción
- **Rol:** Atiende usuarios reales
- **Status en DB:** `active`
- **Model:** `claude-opus-4-5`
- **Cómo reporta:** Pendiente de definir (via n8n webhook probablemente)

### 🦞 PABLO — `pablo-mac-mini`
- **Qué es:** OpenClaw corriendo en un Mac Mini físico
- **Rol:** Experimentos y desarrollo
- **Status en DB:** `idle`
- **Model:** `claude-opus-4-5`
- **Cómo reporta:** `scripts/reporter.py` (Python)
- **Usuario del Mac Mini:** pablo@Mac-mini-von-pablo
- **Carpeta en Mac Mini:** `~/openclaw/`
- **Python:** 3.14.3 (requiere venv)

---

## Supabase
- **Manejado por:** Lovable (no hay acceso directo a service_role key)
- **Project ID:** `rygtccmcqycnzkfpjxss`
- **URL:** `https://rygtccmcqycnzkfpjxss.supabase.co`
- **Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3RjY21jcXljbnprZnBqeHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjU3ODQsImV4cCI6MjA4NjkwMTc4NH0.QC37jJAslB2sbNk24GyfkVn0IxrQwOMOCAmrTOsYNIM-`
- **Service role key:** NO disponible desde Lovable UI (solo anon y publishable key visibles)
- **RLS:** ⚠️ ACTIVO — bloquea writes con anon key. Pendiente deshabilitar.

### Tablas en DB
- `agents` — CLAUDE y PABLO ya insertados ✅
- `tasks` — tareas por agente
- `jobs` — jobs programados
- `skills` — skills habilitadas
- `activity` — log de actividad (tokens, costo, mensajes)
- `task_runs` — historial de ejecución de tareas
- `job_runs` — historial de ejecución de jobs

---

## Estado actual del proyecto

### ✅ Hecho
- Dashboard (Control Center) con KPIs y cards por agente
- AgentsPage rediseñada con cards de CLAUDE y PABLO
- CLAUDE y PABLO insertados en la DB con IDs personalizados
- `scripts/reporter.py` — script Python para reportar actividad desde Mac Mini
- `scripts/seed-agents.ts` — script para reinsertar agentes si hace falta
- URL de Supabase hardcodeada en reporter.py

### ⚠️ Pendiente / Bloqueado
- **RLS deshabilitado:** La anon key no puede escribir a la DB. Solución: en Lovable chat pedir que ejecute `ALTER TABLE activity DISABLE ROW LEVEL SECURITY;` para todas las tablas, O conseguir la service_role key de alguna forma.
- **PABLO reporter funcionando:** Bloqueado por el RLS. Una vez resuelto RLS, solo correr `python3 reporter.py --agent pablo --status active` desde `~/openclaw/` con el venv activado.
- **CLAUDE reporter:** Pendiente definir cómo claude.ai/Kiosk reporta al panel. Opción más viable: n8n webhook.

---

## Comandos útiles — Mac Mini (PABLO)
```bash
# Activar entorno
cd ~/openclaw && source venv/bin/activate

# Reportar actividad
python3 reporter.py --agent pablo --message "mensaje" --tokens-in 100 --tokens-out 50 --cost 0.001

# Cambiar status
python3 reporter.py --agent pablo --status active
python3 reporter.py --agent pablo --status idle
```

---

## Próximos pasos (en orden de prioridad)
1. **Resolver RLS** — pedirle a Lovable que deshabilite RLS en todas las tablas
2. **Probar reporter.py en Mac Mini** — verificar que PABLO puede enviar actividad al panel
3. **Definir y construir reporter de CLAUDE** — probablemente via n8n
4. **Conectar n8n** para automatizaciones entre agentes

---

## Integraciones conectadas
- ✅ GitHub (este repo)
- ✅ n8n (cuenta conectada: lagosito.app.n8n.cloud)
- ✅ Google Calendar
- ✅ Gmail
- ✅ Airtable
- ✅ Stripe
- ✅ Figma
- ✅ Hugging Face

---
*Última actualización: 2026-03-11*
