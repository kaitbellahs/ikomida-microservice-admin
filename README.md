# ikomida-microservice-admin

Back-office operations.

> Part of the **iKomida** platform. See **[ikomida-k8s-config](https://github.com/kaitbellahs/ikomida-k8s-config)** for the architecture overview of all 31 repositories.

---

## Role

Statistics, plan management, platform settings, terms of service and per-vendor app configuration. Reached through a wildcard route restricted to six internal roles — `ADMIN`, `MANAGER`, `MARKETING`, `ANALYTICAL`, `FINANCE` and `APP` — so back-office access is a single, auditable surface.

## Endpoints

As declared in the [gateway route table](https://github.com/kaitbellahs/ikomida-microservice-gateway/blob/dev/src/routes.ts) (5 routes reach this service):

| Method | Path | Roles |
|---|---|---|
| `POST` | `/admin/*` | MARKETING, MANAGER, ADMIN, ANALYTICAL, APP, FINANCE |
| `PATCH` | `/admin/*` | MARKETING, MANAGER, ADMIN, ANALYTICAL, APP, FINANCE |
| `GET` | `/admin/*` | MARKETING, MANAGER, ADMIN, ANALYTICAL, APP, FINANCE |
| `PUT` | `/admin/*` | MARKETING, MANAGER, ADMIN, ANALYTICAL, APP, FINANCE |
| `DELETE` | `/admin/*` | MARKETING, MANAGER, ADMIN, ANALYTICAL, APP, FINANCE |

## Stack

TypeScript (ESM) · Express · Sequelize · rollup · Docker · Kubernetes

Depends on [`@ikomida/shared-types`](https://github.com/kaitbellahs/ikomida-shared-types), [`@ikomida/shared-backend`](https://github.com/kaitbellahs/ikomida-shared-backend) and [`@ikomida/shared-logics`](https://github.com/kaitbellahs/ikomida-shared-logics).

## Build

```bash
yarn install
yarn build      # rollup bundle
yarn service    # run locally
```

## Status

Built in 2022. The platform is no longer deployed; this repository is published as a record of the work. **The commit history predates generative AI coding assistants.**

## License

Licensed under the [Apache License 2.0](LICENSE) — free for commercial use, provided the copyright notice and [NOTICE](NOTICE) are retained.

Copyright 2022 Khalid Ait Bellahs.
