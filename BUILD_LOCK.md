# TV OIO — Build Lock

This repository is the canonical TV OIO frontend/API source.

- Canonical repository: `detiillimichel-max/TVOIO-`
- Production frontend: `https://detiillimichel-max.github.io/TVOIO-/`
- Worker: `oio-tv-api`
- Secrets remain in Cloudflare Workers Secrets and must never be committed.

## Safety rule

Frontend changes must not contain API keys, tokens, or secret values. Cloudflare deployments must preserve existing secrets. Do not introduce a deployment command that deletes or replaces encrypted secrets.
