# Figma MCP setup and mobile UI generation flow

This guide gives you a practical flow to connect Figma MCP and generate
mobile UI from your app content in a controlled way.

## 1) Current status on your machine

- `~/.codex/config.toml`: created
- `FIGMA_OAUTH_TOKEN`: missing

Use this command in PowerShell (current session):

```powershell
$env:FIGMA_OAUTH_TOKEN="YOUR_FIGMA_TOKEN"
```

Optional: persist for next sessions:

```powershell
setx FIGMA_OAUTH_TOKEN "YOUR_FIGMA_TOKEN"
```

After `setx`, restart your terminal/IDE.

## 2) Config that is already prepared

Path: `C:\Users\phand\.codex\config.toml`

```toml
[features]
rmcp_client = true

[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
bearer_token_env_var = "FIGMA_OAUTH_TOKEN"
http_headers = { "X-Figma-Region" = "us-east-1" }
startup_timeout_sec = 20
tool_timeout_sec = 90
```

## 3) Practical workflow for "content -> mobile UI"

1. Define one target screen at a time (for example, `Job list`).
2. Convert content to a structured input:
   - screen goal
   - sections
   - fields
   - actions
   - empty/loading/error states
3. Ask Figma AI/plugin to generate the frame from this structure.
4. Refine the generated frame manually in Figma.
5. Use Figma MCP with Codex to implement code from the exact node URL.

## 4) Prompt template for Figma AI/plugin

Use this template for each screen:

```text
Create a mobile app screen (390x844) for "JobNow".

Screen name: {SCREEN_NAME}
Goal: {SCREEN_GOAL}

Design system:
- Primary: #2563EB
- Secondary: #10B981
- Typography: Inter / SF Pro
- Radius: 12px
- Style: Minimal, clean, high contrast

Content model:
- Top bar: {TOP_BAR}
- Main sections:
  1) {SECTION_1}
  2) {SECTION_2}
  3) {SECTION_3}
- Primary CTA: {PRIMARY_CTA}
- Secondary CTA: {SECONDARY_CTA}

Required states:
- Loading state
- Empty state
- Error state (with retry action)

Output:
- One high-fidelity frame
- One component set for reusable controls
- Spacing and typography consistent with an 8px grid
```

## 5) Next step for you now

1. Add `FIGMA_OAUTH_TOKEN`.
2. Restart IDE/terminal.
3. Send me one Figma frame URL (or node URL), and I will run the MCP flow
   to translate it into code.

