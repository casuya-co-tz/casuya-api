# Casuya API

Reception Desk — gateway to the entire Casuya ecosystem (REST, GraphQL, and WebSocket entry points).

## Responsibilities

- Request routing, validation, and composition across services
- Authentication handshake with `casuya-auth`
- GraphQL and WebSocket gateways
- Health checks and service orchestration

## Getting started

```bash
pnpm install
pnpm build
pnpm test
```

## Configuration

Copy `../.env.example` to `.env` at the workspace root and provide the required
`DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET` values.

## Related packages

- `casuya-auth` — identity and tokens
- `casuya-orchestrator` — background job processing
- `casuya-platform` — frontend consuming this API

## License

MIT
