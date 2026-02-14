# Source Rules

## Priority

1. Explicit `repo_url`
2. Explicit `official_url`
3. Registry match (`provider_registry.yaml`)
4. Auto discovery from npm metadata
5. Ask user for official URL or GitHub repo URL

## Stable Version Filter

Exclude versions containing:
- alpha
- beta
- rc
- preview
- canary
- nightly

Case-insensitive matching is required.

## Failure Strategy

- Return partial results when possible.
- Explain missing pieces and next action.
- Never fabricate release notes.
