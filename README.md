# SBM User Portal

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `pnpm dev` — start the development server
- `pnpm build` — create a production build
- `pnpm start` — run the production server
- `pnpm lint` — run ESLint

## Commit messages

Commits are validated by [Commitlint](https://commitlint.js.org/) via a Husky `commit-msg` hook.

Format:

```
<type>: <subject>
```

- **type** — one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **subject** — lowercase, imperative mood, no trailing period, no scope

Examples:

```
feat: add commitlint
fix: handle empty form submission
chore: update dependencies
```

Not allowed:

```
feat(scope): add commitlint   # no scope
Feat: add commitlint           # type must be lowercase
feat: Add commitlint           # subject must be lowercase
feat: add commitlint.          # no trailing period
```
