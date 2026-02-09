# Directives Layer

This directory contains **Directives** (SOPs) written in Markdown. 
These files define **what** needs to be done.

## Format
- **Goal**: Clear objective.
- **Inputs**: Required data/parameters.
- **Steps**: Human-readable instructions on *how* to orchestrate the task.
- **Tools**: Which `execution/` scripts to use (if any).

## Example
`directives/scrape_competitor.md` tells the agent to:
1. Read the list of URLs.
2. Run `execution/scraper.py` for each URL.
3. Save results to `data/output.csv`.
