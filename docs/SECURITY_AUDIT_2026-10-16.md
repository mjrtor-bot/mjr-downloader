# Security audit — 2026-10-16 (partial)

This is a **partial source review**, not a security certification. No runtime penetration tests, complete Git history scan, or full dependency audit have been performed.

## Findings requiring attention before production hardening

### High: URL validation does not pin downstream network destinations
`src/lib/security/url-validator.ts` resolves and checks host addresses before calling a provider, but a subsequent process may resolve the hostname again or follow redirects. This is a potential DNS-rebinding/redirect-based SSRF gap. Review every provider's network behavior and enforce destination policy throughout redirects and DNS resolution, not only at the initial check.

### Medium/High depending on deployment: rate limiting and client IP trust
`src/lib/security/rate-limiter.ts` stores counters in process memory, so separate serverless instances do not share limits. `getClientIp` trusts the first `x-forwarded-for` value without a verified proxy trust boundary. Use a trusted ingress/proxy identity and a shared limiter for distributed deployments.

### Medium: internal error messages
`src/app/api/analyze/route.ts` returns `err.message` for unexpected errors. Use generic client-facing errors and keep detailed diagnostics only in protected logs.

### Further review needed
- Verify `format` parameter validation before reaching subprocess argument construction.
- Inspect media providers, worker authentication, redirect behavior and resource limits.
- Review historical commits and tracked files for secrets; rotate any exposed credentials.
- Review dependency licenses and vulnerability advisories.
- Run lint, build, and end-to-end tests in a controlled environment.

## Release gate
Do not claim complete security review or merge production security changes until these findings are resolved and tests are documented.
