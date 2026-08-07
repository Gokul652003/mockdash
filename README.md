# MockDash

A Linux desktop mock API server built with Electron. Configure mock endpoints,
start the server on your chosen port, and watch incoming requests live.

## Features

- Create/edit/delete mock endpoints with custom status, delay, headers and body
- Route path parameters (`/api/users/:id`)
- Response templating via `{{ expression }}`
- Live request log panel
- Start/stop the server from the sidebar

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

## Templating reference

| Expression | Description |
| --- | --- |
| `{{request.query.name}}` | URL query parameter |
| `{{request.params.id}}` | Path parameter |
| `{{request.body.email}}` | Request body value |
| `{{random.int}}` | Random integer (default 1–1000) |
| `{{random.int.10.99}}` | Random integer within a range |
| `{{random.guid}}` | Random hex id |
| `{{timestamp.iso}}` | Current timestamp (ISO) |