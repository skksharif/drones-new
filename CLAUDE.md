# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev            # next dev (Turbopack) on :3000
npm run build          # next build — also the only way to catch typed-route errors
npm run lint           # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit       # type check
npm run admin:password # print ADMIN_PASSWORD_HASH + ADMIN_SESSION_SECRET (-- --write edits .env.local)
```

There is no test suite. The verification loop for any change is `npx tsc --noEmit`, `npx eslint .`, then `npx next build` (53 routes at present — every storefront page still prerenders; only `/admin/*` is dynamic).

`npx tsc --noEmit` reads `.next/types`, which only `next build` (or `next dev`) regenerates. **Adding a route makes `tsc` fail with "does not satisfy the constraint 'AppRoutes'" until you build once.**

If you delete or rename a route, `.next/types` keeps validators for the old path and `tsc` fails with `Cannot find module '../../src/app/<gone>/page.js'`. Delete `.next/types` and re-run `next build` to regenerate.

## Product constraints

The public site is a **storefront with no commerce backend**. Do not add payment integration, order state, or customer accounts.

There *is* an admin panel (`/admin`) and the catalogue lives in MongoDB — that is deliberate and was added on request. Everything else about the shop is unchanged.

**There is no checkout and no online ordering.** The cart is a shortlist: browse → add to cart → review → **enquire on WhatsApp**. Every commercial CTA ends at `whatsappLink()` (`src/lib/site.ts`) or a `tel:` link. Never reintroduce "Buy now", "Proceed to checkout", payment UI, or order state.

Content is real business data (AgroSky Drone Aspirant, Vuyyuru AP). Don't invent products, prices, or specs — if a category has no products it renders an empty state, and that's intentional.

## Architecture

### Data layer — `src/lib`

The catalogue lives in **MongoDB**, read through `catalogue.ts`:

- `getCatalogue()` is wrapped in React `cache()`, so a page with six rails makes one round trip. It is **server-only** — it pulls in the MongoDB driver. It returns `products`, `categories` and `banners`.
- **MongoDB is the only source.** There is no committed-JSON fallback: one cannot be kept in step with the live catalogue, so the failure it prevents (a blank shop) is traded for a worse one — a shop quietly serving stale products and prices. Without `MONGODB_URI` the build fails with a clear message rather than shipping, so `next build` now requires a reachable cluster. There is no `data/` directory and no seed script: the catalogue exists only in MongoDB, and a snapshot lives in `scripts/backups/db-export-*.json`.
- `toClientCatalogue()` drops `description` and `highlights` (`ClientProduct`) before handing the catalogue to the browser.
- Document order is not guaranteed, so both types carry `order`. The seed script assigns it from array position and the admin reorder buttons rewrite it.

`products.ts` and `categories.ts` are now **pure selectors over arrays you pass in** — `findProduct(products, slug)`, `computePriceBounds(products)`, `discountPercent(product)`, `stockedCategories(categories, products)`. They hold no data. Add new derivations here rather than computing in components.

`price: null` means enquiry-only and is handled everywhere: `formatPrice` renders "Price on request", such products sort last in both price orders, are excluded from a narrowed price filter, and are counted separately as `enquiryCount` in the cart.

`site.ts` is the single source of brand/contact truth. `seo.ts` builds every `Metadata` object (`pageMetadata`) and all JSON-LD.

### State — two external stores, no state-in-effects

Both use `useSyncExternalStore` with a `getServerSnapshot`, deliberately: React 19's `react-hooks/set-state-in-effect` rule is on, and hydrating from URL/localStorage inside an effect would trip it.

- **Filters live in the URL** (`src/hooks/useProductFilters.ts`). The snapshot is `window.location.search`; writes go through `history.replaceState` (Back returns to the previous page, not the previous checkbox). Updates re-read the URL instead of closing over state, so taps in the same frame can't clobber each other. The server snapshot is `""`, so pages prerender the unfiltered catalogue with real product markup. `parseFilters`/`serialiseFilters` in that file own the querystring format; defaults are omitted from the URL.
- **Cart lives in localStorage** (`src/store/cartStore.ts`, key `agrosky.cart.v1`). It persists only `{slug, qty}` and re-resolves products from the catalogue on read, dropping slugs that no longer exist. `src/store/cart.tsx` wraps it in `CartProvider`/`useCart` and exposes resolved lines, `subtotal`, `enquiryCount`, and `ready` (false until storage is read — use it to avoid flashing an empty cart).

Pure filter/sort/search logic is in `src/lib/filters.ts` (`filterProducts`, `scoreProduct`); the hook only owns serialisation.

### Composition

`ProductBrowser` is the one filterable surface — toolbar, desktop sidebar, mobile bottom sheets, grid, empty state. `/products`, `/search` and `/category/[slug]` all render it; category pages pass `source` (their subset) and `lockedCategory` (pins the facet and hides it from the panel).

Rails and panels are `SectionCard` (white card on the grey `--color-surface-app` page). `ProductCard` reads `useCatalogue()` for the category name and the New badge, so it is a client component; the pages that render it are still prerendered.

**Route groups.** `app/layout.tsx` is now the bare document shell — `<html>`, fonts, metadata, nothing else. The shop chrome lives in `components/layout/StorefrontShell` and is mounted by `app/(storefront)/layout.tsx`: `CatalogueProvider` → `CartProvider` → `Header` / `PageTransition` / `Footer` / `WhatsAppFab` / `CartToast` / `BottomNav`. `app/admin/*` sits outside that group and gets none of it.

There are **two 404s**, and that split is load-bearing. Next serialises the nearest not-found boundary into the payload of every route beneath it, so `app/not-found.tsx` (unmatched URLs, rendered on the root segment) is deliberately minimal — a logo bar and two links, no catalogue, no providers. `app/(storefront)/not-found.tsx` is the rich one and is reached by `notFound()` from a shop route, where the chrome is already paid for. Putting the full shell in the root 404 added ~70 KB to every page.

### Styling — Tailwind v4

All design tokens live in `@theme` in `src/app/globals.css`; there is no `tailwind.config`. Brand red `#a12d33` (`brand-*`), gold `#f9a825`, neutral `ink-*`. Reusable utilities are declared with `@utility` (`container-page`, `gradient-brand`, `gradient-app`, `glass`, `no-scrollbar`, `line-clamp-2-fixed`).

Layout tokens matter more than they look:

- `--header-h` is `0px` — the app bar scrolls away and sticky toolbars pin to the viewport top. Anything sticky offsets against this token, not a literal.
- `--bottom-nav-h` includes `env(safe-area-inset-bottom)` and collapses to `0` at `lg`. Anything fixed to the bottom must offset against it or it will sit under the tab bar.

`framer-motion` is in `package.json` but unused — animations are CSS keyframes in `globals.css`, all collapsed by the global `prefers-reduced-motion` block. Don't reach for the library.

### Traps

- **Never put a `transform` on `PageTransition`.** It would make that wrapper the containing block for every `position: fixed` descendant, dropping the filter/sort sheets to the bottom of the document. The fade is opacity-only for this reason; the comment in the file says so.
- Carousels use scroll-snap + `scrollTo`/`scrollBy` and derive edge state from `onScroll`. Don't rewrite them with transform math or effect-driven state.
- Route params are typed by Next's generated `PageProps<"/category/[slug]">` / `LayoutProps<"/">` globals — don't hand-write prop types, and `params` is a promise.
- New routes must be added to `src/app/sitemap.ts`.
- Never put the full `StorefrontShell` in `app/not-found.tsx` — see the two-404s note above.

## Admin panel — `/admin`

**Auth** (`lib/auth.ts`, `lib/password.ts`). Credentials are environment-only and never in source: `ADMIN_USERNAME` (default `admin`), `ADMIN_PASSWORD_HASH` (salted scrypt, generated by `npm run admin:password`; `-- --write` puts it straight into `.env.local` so the session secret never reaches the terminal) and `ADMIN_SESSION_SECRET` (signs an HMAC-SHA256 `httpOnly` cookie, 8-hour expiry). `lib/password.ts` exists separately so the script can import it under plain Node without pulling in `next/headers`.

**The authorization boundary is `app/admin/(protected)/layout.tsx` plus `requireSession()` at the top of every server action.** `src/proxy.ts` also redirects, but it only checks that the cookie *exists* — the Next docs say Proxy "should not be used as a full session management or authorization solution". A layout guard alone is not enough either: server actions are POST endpoints with a public id, so anyone can call one directly.

If `mongodb+srv://` fails with `querySrv ECONNREFUSED`, the machine's resolver is refusing SRV lookups (`node -e "console.log(require('dns').getServers())"` will show something like `127.0.0.1`). That is a local DNS problem, not a code one — use the non-SRV Atlas URI (`mongodb://host-00,host-01,host-02/?ssl=true&replicaSet=…&authSource=admin`) as a workaround.

Note the file is `src/proxy.ts`, not `middleware.ts` and not repo-root — Next 16 renamed Middleware to Proxy, and it must sit beside `app`. If the build output does not print `ƒ Proxy (Middleware)`, it is in the wrong place and silently never runs.

**Writes** go through `lib/admin/`: `validate.ts` (form → document, or field errors — never trust the form shape), `repository.ts` (the only place that writes), `actions.ts` (`"use server"`), `guard.ts`. Every mutation ends in `revalidatePath("/", "layout")`: one product edit can move the home rails, a category page, the listing, the product page and the sitemap.

**Categories are read-only.** They are the shape of the shop rather than its contents — every product, filter facet, chip, breadcrumb, sitemap entry and JSON-LD block hangs off their slugs — so nothing in the app can create, edit, delete or reorder one. `/admin/categories` is a reference view with no controls and no server action behind it; there is no category form, no `parseCategoryForm`, and `repository.ts` never touches that collection. `Reorderable` is `"products" | "banners"` and `moveAction` **refuses** any other `kind` rather than defaulting — a server action is a POST endpoint with a public id, so hiding the buttons would not have been enough.

Categories are still *referenced* freely: the product form picks one (and `parseProductForm` rejects a slug that is not in the catalogue), the banner form offers `/category/<slug>` link targets, and every storefront surface reads them. Editing the list means editing `data/categories.json` and re-running `npm run seed`, or changing the documents directly — deliberately outside the app.

**Home banners.** `banners` is the third collection, and **one live banner is one slide** — the carousel's length is however many are active. Each slide is painted either by an uploaded image or by a flat `backgroundColor`, chosen with `background`; `theme` picks light or dark copy, because a pale colour under white text is the one combination that renders a slide unreadable. `image`/`alt` are required only in image mode, `backgroundColor` only in colour mode, and a colour slide is rejected with no copy at all since it would render as a blank rectangle. The overlay is `eyebrow` / `headline` / `subline` / `ctaLabel` / `href`, all optional. It is an all-or-nothing switch: while any banner has `active: true` the home carousel shows only those, and with none active it falls back to the automatic slides built from live offers. The home page filters out inactive banners *before* passing them to `PromoBanner` — that component is a client component, so a parked draft's headline would otherwise be readable in the page source. A banner's `href` is validated as a same-site path; it is the most prominent link on the site and must not be able to point elsewhere.

**Forms keep their state on a rejected save.** React resets a form once its action resolves, so a single bad field used to wipe everything else the editor had typed. Each save action echoes the submitted `values` back in `SaveState` along with an incrementing `attempt`; the forms re-seed their defaults through `components/admin/resubmit.ts` and carry `key={state.attempt}` so they remount and pick those defaults up. If you add a field to a form, read its default through `was.text(...)` / `was.checked(...)` / `was.lines(...)` or it will be lost on every validation error.

**Images.** The browser uploads straight to Cloudinary with a signed ticket from `createUploadTicketAction()` — a file must not pass through a server action, since Vercel caps the request body at a few megabytes. Without `CLOUDINARY_*` set, `ImageManager` falls back to pasting `/public` paths. `images.remotePatterns` in `next.config.ts` allows `res.cloudinary.com`.

A product's images are edited as **one ordered list** whose first entry is the primary; the form posts it back as the existing `image` + `gallery` fields.
