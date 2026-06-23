# SBM User Portal

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication (Supabase)

Copy `.env.example` to `.env.local` and set your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from Supabase Dashboard → Project Settings → API. Email/password auth must be enabled under Authentication → Providers.

### Manual test checklist

1. Visit `/` while logged out → redirects to `/login`
2. Submit invalid credentials → error shown below password field, inputs turn red
3. Submit valid credentials → redirects to `/`, session cookie set
4. Visit `/login` while authenticated → redirects to `/`

### Go API

Set the backend URL in `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

- **Server-side:** `getLatestProfile()` in `src/utils/api.ts` — fetches `/me` with the Supabase JWT from cookies (`cache: 'no-store'`)
- **Client-side:** `UserProfileCard` demonstrates dynamic fetch via the browser Supabase session

Both attach `Authorization: Bearer <token>` to requests. The Go backend must be running with a profile row for the authenticated user.

### Analytics (optional)

Set in `.env.local` / Vercel env for staging and production:

```bash
# GA4 Measurement ID (Admin → Data streams → Web)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Meta Pixel (Events Manager)
NEXT_PUBLIC_META_PIXEL_ID=
```

Scripts load only when the env var is set. GA4 tracks page views on client-side route changes.

**Portal events** (all include `app_name: portal`):

| Event                       | When                               |
| --------------------------- | ---------------------------------- |
| `sign_up`                   | Email verified on `/register`      |
| `begin_checkout`            | Enroll tapped                      |
| `purchase`                  | Payment confirmed                  |
| `portal_checkout_abandoned` | Razorpay closed without paying     |
| `portal_login`              | Successful login (password or OTP) |

Mark `sign_up`, `begin_checkout`, and `purchase` as conversions in GA4 Admin. Register `app_name` as a custom dimension.

## Scripts

- `pnpm dev` — start the development server
- `pnpm build` — create a production build
- `pnpm start` — run the production server
- `pnpm lint` — run ESLint
- `pnpm format` — format the project with Prettier
- `pnpm format:check` — verify formatting without writing changes

## Git hooks

Husky runs the following hooks:

- **pre-commit** — `pnpm format:check` (commit fails if any file is not formatted)
- **pre-push** — `pnpm build` (push fails if the production build fails)
- **commit-msg** — validates the commit message with Commitlint

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
