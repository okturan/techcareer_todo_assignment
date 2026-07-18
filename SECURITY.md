# Security policy

## Supported version

Security fixes target the current `master` branch. This is a local learning and
portfolio application rather than a hosted production service; historical
commits and independently deployed copies are not patched in place.

## Reporting a vulnerability

Please use [GitHub's private vulnerability reporting form](https://github.com/okturan/techcareer_todo_assignment/security/advisories/new)
instead of opening a public issue. Include the affected endpoint or browser
flow, a minimal request, clear reproduction steps, and the security impact.

Relevant reports include:

- SQL, script, markup, or OpenAPI injection through todo fields or errors;
- an unexpected cross-origin access path or exposure beyond the documented
  same-origin, local stack;
- path, secret, container, dependency, or configuration weaknesses with a
  demonstrated impact;
- a production-like start that silently falls back to tracked development
  database credentials.

The API has no user authentication or per-user todo ownership; that is an
explicit limitation of this local reference project, not an authorization
bypass. Duplicate handling, validation wording, and ordinary CRUD defects can
be reported as normal bugs.

Use a disposable database with invented todos. Do not attach credentials,
personal task data, or destructive payloads. The maintainer will coordinate
validation, remediation, and disclosure through the private advisory.
