# 🔧 Claude Code Prompt Efficiency Rules (Annex)

This set of prompt rules is designed to improve Claude Code's performance, accuracy, and token efficiency without sacrificing output quality. Include or reference these rules when prompting Claude for coding tasks.

---

## 1. Scope Clarity
- Always state **which file(s)** or **part of the codebase** the prompt concerns.
- Be explicit: are you creating, modifying, or reviewing code?

## 2. Minimal Context Loading
- Only include relevant file paths, names, or code snippets.
- Avoid pasting full files unless absolutely necessary.

## 3. Output Precision
- Clearly define the expected output:
  - “Return only the updated function”
  - “Explain logic in comments”
  - “Output a full modified file”
- Indicate format: `inline edit`, `diff`, or `full file`.

## 4. Style & Framework Consistency
- Mention stack details:  
  Example: `React + Vite + TypeScript + TailwindCSS + shadcn/ui`
- Coding preferences:
  - Use functional components
  - Avoid `any` type
  - Use Tailwind utility-first conventions

## 5. Error Handling & Comments
- Request only essential error handling unless stated otherwise.
- Prefer **brief inline comments** only where logic isn't obvious.

## 6. Token Efficiency
- Include phrases like:
  - “Be concise”
  - “Avoid unnecessary boilerplate”
  - “Reuse existing functions when possible”
- Don’t repeat code unless it's needed for context.

## 7. Modular Suggestions
- For complex requests, instruct:
  - “Break this into steps”
  - “Pause for review after each part”

## 8. Avoid Ambiguity
- Prefer:
  - “Add a wallet connect button using RainbowKit”
- Avoid:
  - “Add crypto wallet support”

## 9. When Using Memory
- If project memory is active:
  - “Use project memory for file structure, imports, and naming conventions”

## 10. Post-Completion Checks
- Ask Claude to:
  - “Check for unused imports or invalid JSX”
  - “Ensure performance and readability best practices”

---

Use these rules as a reusable annex in your prompts to streamline collaboration with Claude Code.
