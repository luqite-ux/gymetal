# Guangyue Nine-Language Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add seven languages to Guangyue with locale-prefixed public URLs, RTL Arabic, DeepSeek translation plus independent DeepSeek review, localized database content, SEO, tests, and a standalone deployment package.

**Architecture:** Middleware rewrites supported locale prefixes to the existing App Router pages and sends the locale through request headers. A typed client language provider controls dictionaries, cookies, URL switching, and document direction. Supabase JSONB fields store localized customer content; a customer-owned script performs two DeepSeek passes with strict shape and forbidden-language validation.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, DeepSeek API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-01-guangyue-nine-language-design.md`

## Global Constraints

- Preserve the approved site visuals.
- Keep English as the unprefixed default locale.
- Keep all database writes scoped to tenant `7114167b-c383-4ef7-8c09-2af19a94882b`.
- Never expose DeepSeek or Supabase service-role keys to the browser or repository.
- Never introduce warranty, guarantee, quality-guarantee, or equivalent promises.
- Arabic is RTL; every other enabled locale is LTR.
- Deployment package contains no environment files.

---

### Task 1: Locale contracts and middleware

**Files:**
- Create: `lib/locales.ts`
- Modify: `middleware.ts`
- Test: `tests/multilingual-contract.test.mjs`

**Interfaces:**
- Produces: `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `isSupportedLocale()`, `localizePath()`, `stripLocalePrefix()`.

- [ ] Write failing tests for nine locale codes, default English URL behavior, locale prefix stripping, and admin/API exclusions.
- [ ] Run `node --test tests/multilingual-contract.test.mjs` and confirm RED.
- [ ] Implement locale helpers and middleware rewrite/header/cookie behavior.
- [ ] Re-run the test and confirm GREEN.

### Task 2: Language provider and switcher

**Files:**
- Modify: `lib/i18n.ts`
- Modify: `lib/language-context.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/header.tsx`
- Test: `tests/multilingual-contract.test.mjs`

**Interfaces:**
- Consumes: locale helpers from Task 1.
- Produces: nine switcher options, locale-aware navigation, `html lang`, and RTL state.

- [ ] Add failing assertions for all switcher labels, locale cookies, and Arabic RTL.
- [ ] Confirm RED.
- [ ] Implement typed dictionaries, initial server locale, switch navigation, and document direction.
- [ ] Confirm GREEN.

### Task 3: DeepSeek-reviewed static dictionaries

**Files:**
- Create: `scripts/translate-static-locales.mjs`
- Create: `lib/generated-translations.json`
- Modify: `lib/i18n.ts`
- Test: `tests/multilingual-contract.test.mjs`

**Interfaces:**
- Consumes: English static dictionary.
- Produces: shape-identical reviewed dictionaries for `es`, `pt`, `fr`, `ar`, `el`, `ru`, and `de`.

- [ ] Add failing dictionary completeness and forbidden-language tests.
- [ ] Confirm RED.
- [ ] Implement translation pass, review pass, recursive shape validation, and atomic JSON output.
- [ ] Generate dictionaries using the server-only DeepSeek key.
- [ ] Confirm GREEN.

### Task 4: Localized database reads and SEO

**Files:**
- Modify: `lib/frontend-news.ts`
- Modify: `app/(frontend)/news/page.tsx`
- Modify: `app/(frontend)/news/[slug]/page.tsx`
- Modify: `app/sitemap.ts`
- Modify: `app/layout.tsx`
- Test: `tests/multilingual-contract.test.mjs`

**Interfaces:**
- Consumes: request locale and article JSONB fields.
- Produces: locale-aware articles, localized canonical URLs, language alternates, and sitemap entries.

- [ ] Add failing tests for requested-locale → English → first-non-empty fallback and alternate URL generation.
- [ ] Confirm RED.
- [ ] Implement locale-aware queries/rendering and SEO outputs.
- [ ] Confirm GREEN.

### Task 5: Tenant settings, products, and articles translation

**Files:**
- Create: `scripts/translate-tenant-content.mjs`
- Test: `tests/multilingual-contract.test.mjs`

**Interfaces:**
- Consumes: tenant/product/article JSONB fields and DeepSeek key.
- Produces: reviewed target-language JSONB values and nine enabled tenant languages.

- [ ] Add failing script contract tests for exact tenant scope, two-pass review, atomic writes, and forbidden-language rejection.
- [ ] Confirm RED.
- [ ] Implement dry-run, translation/review, validation, tenant update, and per-row atomic patching.
- [ ] Run the script and record successful/failed units without printing secrets.
- [ ] Re-query Supabase and confirm every enabled language is populated or explicitly reported as blocked.
- [ ] Confirm GREEN.

### Task 6: Full verification and delivery

**Files:**
- Modify: only files required by verification findings.

**Interfaces:**
- Produces: verified GitHub main commit and standalone ZIP without secrets.

- [ ] Run all Node contract tests.
- [ ] Run `npm run build`.
- [ ] Start the production build and inspect representative desktop and 390px pages for English, Spanish, Arabic, and German.
- [ ] Verify Arabic RTL, language switching, news list/detail, sitemap, robots, and console output.
- [ ] Scan source/database output for forbidden promises and secret leakage.
- [ ] Commit only relevant source, tests, scripts, and reviewed dictionaries.
- [ ] Push to `luqite-ux/gymetal` using the company-token workflow and verify remote main SHA.
- [ ] Assemble the standalone deployment package without environment files and compute SHA256.

