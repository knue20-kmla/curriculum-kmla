# KMLA 교육과정 안내

민족사관고등학교 교육과정을 진로별 경로, 교과 비교, 전체 과목 검색으로 탐색하는 한국어 웹앱입니다.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kmla-curriculum` — 프런트엔드(Vite + React). 화면은 `src/App.tsx`와 `src/components/`
- `artifacts/kmla-curriculum/source-presentation.html` — 과목·경로·비교 데이터의 원본(`const DATA=`를 vite 플러그인이 추출). `public/original-presentation.html`과 동일본
- `artifacts/api-server` — Express API(현재 health 라우트만)

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm-workspace.yaml`의 overrides가 linux-x64 바이너리만 허용합니다. Windows/macOS 로컬 빌드는 해당 플랫폼 override를 빼야 합니다.
- 프런트 dev/build에는 `PORT`, `BASE_PATH` 환경변수가 필요합니다.
- 과목 데이터를 바꾸면 `source-presentation.html`과 `public/original-presentation.html`을 함께 갱신하세요.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
