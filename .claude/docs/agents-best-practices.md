# Claude Code Agents — Reference

Source: https://code.claude.com/docs/en/agents and https://code.claude.com/docs/en/sub-agents
Fetched: 2026-09-09

## Ways to run agents in parallel

| Approach | What it gives you | Use it when |
|---|---|---|
| [Subagents](https://code.claude.com/docs/en/sub-agents) | Delegated workers inside one session that do a side task in their own context and return a summary | A side task would flood the main conversation with search results, logs, or file contents you won't reference again |
| [Agent view](https://code.claude.com/docs/en/agent-view) (`claude agents`) | One screen to dispatch and monitor background sessions | Several independent tasks you want to hand off and check on later |
| [Agent teams](https://code.claude.com/docs/en/agent-teams) | Multiple coordinated sessions with a shared task list and inter-agent messaging, run by a lead (experimental, off by default) | You want Claude to split a project into pieces, assign them, and keep workers in sync |
| [Dynamic workflows](https://code.claude.com/docs/en/workflows) | A script that runs many subagents and cross-checks results | Work too big for one turn-at-a-time coordination: codebase-wide audits, large migrations, cross-checked research |

Supporting tools: [worktrees](https://code.claude.com/docs/en/worktrees) (isolated git checkouts per session), [cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging), and `/batch` (splits one large change into 5–30 worktree-isolated subagents that each open a PR).

## Subagents — core concepts

Subagents are specialized assistants that run a task in an **isolated context window**, keeping exploration/logs/file contents out of the main conversation and returning only a summary. Each has its own context, custom system prompt, tool access, and permissions.

**Use a subagent when:** a task would flood the main conversation, you need task-specific behavior, you want to restrict tools/permissions, work is self-contained, or you want to route to a cheaper/faster model (e.g. Haiku).

**Use the main conversation when:** the task needs frequent back-and-forth, phases share significant context, changes are quick/targeted, or latency matters.

### Built-in subagents
- **Explore** — read-only (no Write/Edit), inherits model (capped at Opus on API). For file discovery/code search. Override by creating a project/user subagent literally named `Explore` with `model: haiku` to keep it cheap.
- **Plan** — read-only, used during plan mode for research.
- **general-purpose** — full subagent tool access; for complex research/multi-step operations. Model: `CLAUDE_CODE_SUBAGENT_MODEL` env var if set, else main conversation's model.
- **claude** — catch-all default.
- **statusline-setup**, **claude-code-guide** — specialized built-ins.

### File locations & priority (highest to lowest)
1. Managed settings (org-wide)
2. `--agents` CLI flag (session only)
3. `.claude/agents/` (this project) — **best practice: check into version control**
4. `~/.claude/agents/` (all projects, personal)
5. Plugin `agents/` directory

## Subagent file format

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices. Use after writing or modifying code.
tools: Read, Glob, Grep
model: sonnet
permissionMode: default
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

### Frontmatter fields

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Unique id, lowercase + hyphens. No `:` and can't start with `-` |
| `description` | Yes | Tells Claude when to delegate to this subagent |
| `tools` | No | Allowlist of tools. Omit = inherit all subagent-eligible tools |
| `disallowedTools` | No | Denylist (supports `mcp__server` or `mcp__*` patterns) |
| `model` | No | `sonnet`, `opus`, `haiku`, `fable`, full model ID, or `inherit` |
| `permissionMode` | No | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, `manual` |
| `maxTurns` | No | Cap on agentic turns (output marked partial if hit) |
| `skills` | No | Skills to preload at startup |
| `mcpServers` | No | MCP servers scoped to this subagent (inline or by reference) |
| `hooks` | No | Lifecycle hooks scoped to this subagent |
| `memory` | No | `user` / `project` / `local` — persistent memory across sessions |
| `background` | No | `true` to force running in background |
| `effort` | No | `low`, `medium`, `high`, `xhigh`, `max` |
| `isolation` | No | `worktree` for an isolated git worktree |
| `color` | No | Display color |
| `initialPrompt` | No | Auto-submitted first turn when run as a main session |
| `experimental` | No | e.g. `cacheTtl: 5m` / `1h` for prompt caching |

### Tool access examples
```yaml
tools: Read, Grep, Glob, Bash              # allowlist
disallowedTools: Write, Edit               # denylist
disallowedTools: mcp__github               # remove one MCP server's tools
disallowedTools: mcp__*                    # remove all MCP tools
tools: Agent(worker, researcher), Read, Bash  # restrict which subagents it can spawn
```

Tools always stripped from subagents: `Agent` (at depth limit), `AskUserQuestion`, `EndConversation`, `EnterPlanMode`, `ExitPlanMode` (unless `permissionMode: plan`), `ScheduleWakeup`, `TaskOutput`, `WaitForMcpServers`, `Workflow`.
Background subagents lose most built-ins except: `Read`, `Grep`, `Glob`, `Bash`, `PowerShell`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`, `TodoWrite`, `Skill`, `ToolSearch`, `EnterWorktree`, `ExitWorktree`, `Monitor`, `TaskStop`, `SendMessage`, `Artifact`.
**Forks** skip these filters entirely — they get the main conversation's exact tool pool.

## Model selection order
1. Per-invocation `model` param
2. Subagent's own `model` frontmatter field
3. `CLAUDE_CODE_SUBAGENT_MODEL` env var
4. Main conversation's model

Force one model for all subagents:
```json
{ "env": { "CLAUDE_CODE_SUBAGENT_MODEL": "haiku", "CLAUDE_CODE_SUBAGENT_MODEL_FORCE": "1" } }
```

## Forks (`/subtask`)

A fork inherits the **entire** conversation — same system prompt, tools, model, full message history — so you can hand off a side task without re-explaining context. Tool calls stay isolated; only the final result returns to the main conversation. Good for: parallel approaches, side tasks needing lots of background, brainstorming without polluting the main thread.

## Using subagents
- **Automatic delegation**: Claude picks based on task + subagent `description` (combined description budget: 15,000 tokens across all subagents — keep them short).
- **Explicit**: natural language ("Use the test-runner subagent to fix failing tests"), `@"code-reviewer (agent)"`, or `claude --agent code-reviewer` / `"agent": "code-reviewer"` in settings.
- **Foreground** blocks the main conversation and passes permission prompts through; **background** runs concurrently (default for forks) and surfaces prompts in the main session. Force background with `background: true`.
- Subagents can be **resumed** (`@subagent-<name> continue that review...`) — they retain full history and pick up where they stopped.

## Nesting & limits
- Subagents can spawn subagents up to 3 layers deep by default (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, set to `1` to disable nesting).
- Max 20 concurrent subagents by default (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`).

## Disabling
```json
{ "permissions": { "deny": ["Agent(Explore)", "Agent(Plan)", "Agent(my-custom-agent)"] } }
```
or `claude --disallowedTools "Agent(Explore)"`, or `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS=1` to kill all built-ins.
Fork mode: `CLAUDE_CODE_DISABLE_FORK_MODE=1`.

## Troubleshooting
- New subagent not picked up → restart Claude Code if `.claude/agents/` or `~/.claude/agents/` didn't exist when the session started.
- Combined descriptions > 15,000 tokens → trim `description`, move detail into the system prompt.
- Invalid frontmatter: missing `name` → treated as plain doc; missing `description` → file skipped; YAML parse error → file skipped; bad `name` (contains `:` or starts with `-`) → file skipped. Check with `claude plugin validate .claude/agents/`.

## Best practices (from the docs)
1. Store project-specific subagents in `.claude/agents/`, checked into version control.
2. Store personal, reusable subagents in `~/.claude/agents/`.
3. Keep `description` fields short and clear — they cost token budget.
4. Use `model: haiku` for research-heavy subagents to save cost.
5. Enable `memory` for subagents that should improve over time.
6. Use `isolation: worktree` for experimental/risky work to protect the main checkout.
7. Preload `skills` for domain-specific subagents to skip discovery overhead.
8. Define `hooks` for conditional tool restrictions (e.g. read-only DB access).
9. Use forks (`/subtask`) for side tasks that need full context without polluting the main conversation.
10. Resume subagents instead of starting fresh when continuing related work.
