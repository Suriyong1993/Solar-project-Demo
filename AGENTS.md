<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Commands

- `bun run dev` — start dev server
- `bun run build` — production build (Nitro → Vercel preset)
- `bun run lint` — ESLint (also runs Prettier via plugin)
- `bun run format` — Prettier write all files
- No typecheck or test scripts exist. Run `npx tsc --noEmit` for type checking.

## Stack

TanStack Start (React 19 + Vite 8 + Nitro) with Tailwind CSS v4 and shadcn/ui (new-york, `rsc: false`). Package manager is **Bun** (lockfile: `bun.lock`).

## Architecture

- **Vite config** imports `@lovable.dev/vite-tanstack-config` which bundles tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro, and more. **Do not** add those plugins manually — duplicates will break the build.
- **Server entry** is `src/server.ts` (SSR error wrapper around `@tanstack/react-start/server-entry`). Configured via `tanstackStart.server: "server"` in vite.config.ts.
- **Routing** is file-based in `src/routes/`. `routeTree.gen.ts` is auto-generated — never edit it. See `src/routes/README.md` for naming conventions.
- **Path alias**: `@/*` → `./src/*`
- **Server-only code**: name files `*.server.ts`. Do NOT import the `server-only` package (ESLint will error).

## Deploy

Deploys to **Vercel** via Nitro preset. `vercel.json` pins `bun@1.3.14` for install/build. Node version is set in the Vercel dashboard (Project Settings > General), not in `vercel.json`.

## Conventions

- shadcn/ui components live in `src/components/ui/`. Add via `npx shadcn@latest add <component>`.
- Tuya smart device integration in `src/lib/tuya-*.ts`.
- `bunfig.toml` enforces a 24h minimum release age for dependencies. Excluded packages are Lovable-owned — confirm before adding more.
