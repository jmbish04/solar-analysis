
# AGENTS.md

## Purpose

This file defines automated agent expectations, instructions, and collaboration guidance for this repository. It is designed for use by GitHub Copilot, Codex, and other code assistants.

---

## Agent Roles

- **Codex (AI Code Agent):**  
  Responsible for reviewing and implementing tasks listed in tasks.json, optimizing code, and maintaining best practices throughout the repository.
- **Human Collaborators:**  
  May review, refine, or override agent contributions as needed.

---

## Agent Instructions

1. **Review & Implement Tasks**
   - Regularly review the `tasks.json` file at the root of the repository.
   - Prioritize and implement all actionable items listed in `tasks.json`.
   - Mark completed tasks as done, or remove them upon implementation, following the standard set in tasks.json.

2. **Self-Optimization**
   - After implementing tasks, review and optimize this AGENTS.md file.
   - Ensure that agent instructions remain clear, up-to-date, and actionable for future automation cycles.

3. **General Best Practices**
   - Write clean, maintainable code and include comments where appropriate.
   - Follow the repository’s coding standards and conventions.
   - Prefer atomic, focused pull requests for each distinct change.
   - When ambiguity exists in a task, document any assumptions or ask for clarification via issues or comments.

4. **Collaboration**
   - Do not overwrite work in progress by others.
   - Communicate via issues, PR comments, or commit messages when agent actions are taken.

5. **Continuous Improvement**
   - Propose new tasks in tasks.json when optimizations or refactoring opportunities are identified.
   - Suggest improvements to AGENTS.md if instructions become outdated or unclear.

---

## Review Request

**Codex (and other agents):**
- Immediately review the current `tasks.json` file and implement all actionable tasks.
- After completing those, review and optimize this AGENTS.md as needed to enhance agent workflow, clarity, and repository health.
