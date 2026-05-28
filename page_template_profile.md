# SEO Page Template — Reusable Profile
> Created from: "Manila Rope Scrap" page (ID: 295)
> Live example: https://alshaabalwaseem.com/manila-pp-ship-rope-scrap/
> Created: 26 May 2026

---

## 1. CSS Template (Inject into page content <style>)
```css
/* Hide default WordPress/Astra page title */
header.entry-header, h1.entry-title {
  display:none !important; margin:0 !important; padding:0 !important; height:0 !important;
}

/* Page wrapper */
.rope-page-wrap {
  max-width:980px; margin:0 auto; padding-top:48px;
}

/* H1 — thin + professional */
.rope-page-wrap h1 {
  font-size:28px; line-height:1.2; font-weight:500; margin:0 0 14px 0; letter-spacing:0.2px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .rope-page-wrap { padding-top:22px; padding-left:14px; padding-right:14px; }
  .rope-page-wrap h1 { font-size:22px; }
}
```

## 2. Page Structure (Outline Expansion Pattern)
1. `<style>` block (CSS from Section 1)
2. `<div class='rope-page-wrap'>`
3. **H1** — Core keyword heading (e.g. "Manila Rope Scrap / PP Rope / Ship Rope Scrap Buyers & Sellers in UAE (Import/Export)")
4. **Intro paragraph** (80–120 words) — who we are + what we buy/sell + trust + CTA
5. **WhatsApp + Email CTA**
6. **H2: "Rope Scrap We Buy & Sell"** — bullet list of keyword-intent items
7. **H2: "Types of [material] we buy & sell"** — bullet list with descriptions
8. **H2: "How we grade / what affects price"** — bullet list of pricing factors
9. **H2: "UAE pickup + international export/import"** — paragraph about logistics
10. **H2: "Why businesses work with us"** — bullet list (fast quoting, digital weighing, bulk exp, WhatsApp)
11. **H2: "FAQ"** — 3 H3 questions + answers
12. **Final CTA** — "Ready to trade? Message us on WhatsApp"
13. `</div>`
14. `<script type="application/ld+json">` — FAQ Schema

## 3. Rank Math Meta Fields
| Field | Format |
|-------|--------|
| **Meta Title** | `"[Material] Scrap Buyer/Seller UAE \| [Keywords]"` (≤60 chars) |
| **Meta Description** | `"Buy & sell [material] scrap in UAE. Fast pickup Sharjah/Dubai + import/export containers worldwide. WhatsApp for quote."` (≤160 chars) |
| **Focus Keyword** | Primary buyer-intent keyword (e.g. "manila rope scrap buyer") |
| **_seo_goal** | `"Rank for [keyword] queries (UAE + import/export) and generate WhatsApp leads."` |

## 4. Slug / Permalink
- Format: `[material-keyword]-scrap`
- Example: `manila-pp-ship-rope-scrap`

## 5. Page Settings (Astra / WP meta)
| Setting | Value |
|---------|-------|
| Status | `publish` |
| Parent | `172` (Services page) — **or** leave as top-level if under Products menu |
| Comment status | `closed` |
| Ping status | `closed` |
| Template | `""` (default) |
| Sidebar | `default` (inherits from site) |

## 6. Rank Math 100/100 Checklist (MUST verify before publishing)

| # | Item | Requirement |
|---|------|-------------|
| 1 | **Meta Title** | ≤60 chars, includes focus keyword |
| 2 | **Meta Description** | ≤158 chars, includes focus keyword naturally |
| 3 | **Focus Keyword** | Set to primary buyer-intent phrase (e.g. "aluminum dross buyer") |
| 4 | **Slug (Permalink)** | Contains the focus keyword partially (e.g. "aluminum-dross-waste") |
| 5 | **H1** | Contains the focus keyword naturally |
| 6 | **H2 heading** | At LEAST one H2 must contain the EXACT focus keyword phrase |
| 7 | **First paragraph** | Must contain the focus keyword within the first 100 words |
| 8 | **Internal links** | At least 2-3 links to other pages on the same site (Services, Contact, related product page) |
| 9 | **Image** | At least 1 image with `alt` text containing the focus keyword |
| 10 | **Content length** | Minimum 800 words (1,000+ recommended) |
| 11 | **Readability** | Mix of paragraphs AND lists — not all lists |
| 12 | **FAQ Schema** | ld+json FAQ schema present in the page |
| 13 | **Keyword in body** | Focus keyword appears 3-5 times naturally in the body content |

> **Gold Rule:** After publishing, ALWAYS check Rank Math score. If below 100, fix the missing items above.

## 7. Content Writing Rules
- B2B tone, professional, not keyword-stuffed
- Use "**we buy & sell**" framing (cover both supplier and buyer intent)
- Every sentence should serve the user: "what's in it for me?"
- FAQ Schema always included for rich results
- CTA always links WhatsApp + email
- Target countries (copy from this page): UAE, Saudi, Oman, Qatar, Philippines, Indonesia, Thailand, Canada, USA

---

*Copy this profile and replace `[material]` / `[keyword]` for each new page.*
