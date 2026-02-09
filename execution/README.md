# Execution Layer

This directory contains **Execution Scripts** (mostly Python).
These files define **how** to do the work deterministically.

## Rules
- **Deterministic**: Same input = same output. No hallucinations.
- **Single Purpose**: One script does one thing well (e.g., `send_email.py`, `optimize_image.py`).
- **Environment**: Use `.env` for secrets.
- **Logging**: Print clear success/error messages to stdout so the orchestrator (Agent) can understand what happened.

## Usage
The Orchestrator (Agent) calls these scripts via terminal commands.
`python execution/my_script.py --arg value`
