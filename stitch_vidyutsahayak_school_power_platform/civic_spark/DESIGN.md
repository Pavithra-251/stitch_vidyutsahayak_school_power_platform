---
name: Civic Spark
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444651'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#003120'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a32'
  on-tertiary-container: '#4ac08f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '800'
    lineHeight: 3.5rem
    letterSpacing: -0.025em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.04em
  metric-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a balance between urgent civic intervention and dependable, municipal-grade infrastructure. Built for rural headmasters, local certified technicians, and community volunteers, the interface prioritizes clarity, structural honesty, and immediate utility under variable outdoor lighting and field conditions.

The visual direction merges **Modern Civic Infrastructure** with **High-Contrast Pragmatism**:
- **Dignified & Pragmatic:** Utilitarian clarity devoid of unnecessary decorative fluff. Every element communicates status, urgency, or action.
- **Empathetic & Resolute:** Balances critical alerts with steady, reassuring progress tracking.
- **Field-Ready Legibility:** Oversized touch targets, bold color segmentation, and structural surface hierarchy designed for low-tier devices and harsh sunlight.

## Colors

The palette balances institutional stability with energetic electrical urgency.

- **Primary (`#1E3A8A` - Deep Civic Cobalt):** Anchors navigation, structural headers, primary actions, and institutional verification badges. Communicates authority and system uptime.
- **Secondary (`#D97706` - Amber Electric Gold):** Represents energy, active work orders, electrical triage, and field mobilization. Used for urgent attention markers, secondary interactive accents, and pending verification states.
- **Tertiary (`#059669` - Infrastructure Emerald):** Conveys power restored, safety certification, active field presence, and verified repair completions.
- **Hazard Semantic (`#DC2626` - Alert Crimson):** Dedicated exclusively to life-safety risks, phase failures, exposed wiring hazards, and critical school outages requiring same-day dispatch.
- **Neutrals & Surfaces (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`, `#334155`, `#0F172A`):** Cool slate and warm sand foundation, ensuring AA/AAA contrast ratios across both desktop administrative portals and low-cost mobile screens in rural transit.

## Typography

The design system standardizes on **Plus Jakarta Sans** across all hierarchies. Its open counters, robust x-height, and precise geometric terminals provide optimal readability under low-bandwidth font rendering and screen glare.

- **Tabular Figures:** Metric panels, incident counters, voltage readings, and ticket IDs must render with `font-variant-numeric: tabular-nums` to prevent horizontal jitter during real-time status updates.
- **Hierarchy Rules:** Display and headline levels enforce high-contrast weights (`700` and `800`) to anchor scanning paths. Body text remains at regular `400` with generous line-heights for incident logs, diagnostic notes, and safety guidelines.

## Layout & Spacing

The layout philosophy follows a disciplined fluid grid engineered for both mobile field data collection and multi-column command dashboards.

- **Desktop & Operations Dashboard (>= 1024px):** 12-column layout with `2rem` outer margins and `1.5rem` gutters. Accommodates split views: live geographic incident feeds alongside electrical diagnostic specifications.
- **Tablet (768px - 1023px):** 8-column layout with `1.5rem` margins and `1rem` gutters. Cards collapse into dual-column grids.
- **Mobile Handheld (< 768px):** 4-column layout with `1rem` outer margin and `1rem` gutters. Critical workflows enforce single-column stacked forms with sticky bottom action trays.
- **Field Ergonomics:** All touch targets maintain a minimum vertical height of `48px` with at least `space-sm` (`0.5rem`) physical separation between adjacent clickable surfaces.

## Elevation & Depth

Visual hierarchy uses **tonal layer separation combined with sharp, low-contrast containment borders**, deliberately avoiding heavy blurs or muddy drop-shadows that degrade on budget mobile panels.

- **Base Layer (Canvas):** `#F8FAFC` provides a calm, glare-resistant background.
- **Surface Layer (Cards & Workbenches):** Pure `#FFFFFF` elevated using a subtle border (`1px solid #E2E8F0`) and an ambient anchor shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Interactive Elevated State (Hover/Active):** Surfaces lift via `0 4px 6px -1px rgba(30, 58, 138, 0.08), 0 2px 4px -2px rgba(30, 58, 138, 0.06)` with a slight border shift to `#CBD5E1`.
- **Urgent Modal / Hazard Alert Tray:** Elevated with a structured barrier shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)` and a distinctive `2px` left or top thematic accent rule.

## Shapes

The design system employs **Level 2 (Rounded)** shaping:
- **Component Base (`rounded` / 0.5rem):** Form inputs, buttons, checkboxes, and inline alerts.
- **Containers (`rounded-lg` / 1rem to `rounded-xl` / 1.5rem):** Incident summary cards, technician credential modules, inspection reports, and operational metric blocks.
- **Status Pills (`rounded-full`):** Incident priority tags, certified badges, and quick-filter pills utilize full pill geometry to instantly distinguish semantic markers from standard action buttons.

## Components

### Buttons
- **Primary Civic Action:** Background `#1E3A8A`, text `#FFFFFF`, `rounded-md`, minimum height `48px`, font weight `600`. Focus ring: `3px solid rgba(30, 58, 138, 0.35)` with `2px` white offset.
- **Secondary Dispatch Action:** Background `#D97706`, text `#FFFFFF`. Used for "Accept Dispatch", "Volunteer Now", and "Log Parts Needed".
- **Tertiary / Ghost:** Border `1.5px solid #CBD5E1`, transparent background, text `#0F172A`. Hover: background `#F1F5F9`.

### Urgency & Priority Pills
Pills use high-contrast foreground text over light-tinted backgrounds for immediate situational triage:
- **Critical (Hazard / Total Blackout):** Background `#FEE2E2`, text `#991B1B`, border `1px solid #FCA5A5`, leading icon `alert-triangle`.
- **High (Classrooms Dark / Exams Impending):** Background `#FEF3C7`, text `#92400E`, border `1px solid #FCD34D`.
- **Medium (Partial Phase / Single Wing):** Background `#E0E7FF`, text `#3730A3`, border `1px solid #C7D2FE`.
- **Low (Minor Repair / Fitting):** Background `#F1F5F9`, text `#475569`, border `1px solid #CBD5E1`.

### Status Stepper (Incident Lifecycle)
A horizontal responsive pipeline tracking five stages: `Reported` → `Assigned` → `On-Site Diagnostic` → `Repairs Underway` → `Certified Restored`.
- Completed steps display a `#059669` circle with a bold check icon.
- Current active step features an energetic pulsing `#D97706` indicator with bold text.
- Future steps remain muted in `#94A3B8` with dashed connector lines.

### Input Fields & Verification Forms
- Height `48px`, border `1.5px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`.
- Placeholder text in `#64748B`.
- Active focus state: border `#1E3A8A` with a prominent `3px` aura.
- File and photo proof upload fields feature prominent dashed borders (`2px dashed #94A3B8`) with direct camera trigger capability for field photo uploads.

### Cards (School Outage Dossier)
- White background (`#FFFFFF`), `rounded-xl` (1.5rem), `1px solid #E2E8F0`.
- Top header row displays School Name (bold `1.125rem`), Village/Block District, and the Urgency Pill aligned to the right.
- Middle metric strip displays time elapsed since outage, affected student count, and fault category (e.g., Transformer, Substation, Internal Wiring).
- Footer houses direct call triggers and geolocation actions with high-contrast icon groupings.