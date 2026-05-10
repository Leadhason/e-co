UI Design System & Agent Build Specification


This document is the authoritative reference for building the StoneBase admin interface. It specifies every design token, layout pattern, component, and screen in enough detail for an AI agent or developer to produce pixel-accurate output without referencing any other source.


1. Design Philosophy
StoneBase Admin follows a clean, professional aesthetic modelled on Linear and Stripe Dashboard.

Flat surfaces only. No gradients, shadows, blurs, or glow effects anywhere in the UI.
White and warm off-white as the primary palette. Dark charcoal (#1A1A18) for text and CTAs.
Borders do the structural work. Depth is created through layered backgrounds and 1px borders, not shadows.
Typography is the hero. Weight and size contrast carry hierarchy without colour.
Every authenticated screen uses the same sidebar shell. Only the content area changes.
Ghanaian market context baked in: Ghanaian Cedi (₵), local names, Paystack, MoMo.


2. Design Tokens
All values below must be applied exactly. Do not substitute or approximate.
2.1 Colour Palette

Token
Hex
Usage
Background primary
#FFFFFF
Main content surfaces, cards, inputs, sidebar
Background secondary
#F6F5F3
Page background, right panel, filter bars
Background tertiary
#FAF9F7
Table header rows, hover states, inner cards
Background subtle
#F0EDE8
Active nav item, selected table row
Text primary
#1A1A18
All primary text, headings, labels, CTAs
Text secondary
#6B6860
Subtext, descriptions, secondary labels
Text muted
#A8A59F
Placeholders, timestamps, meta info
Text hint
#B8B5B0
Disabled states, very faint labels
Border strong
#D8D5D0
Outer container borders, section dividers
Border default
#E4E2DE
Card borders, table borders, input borders
Border subtle
#F0EDE8
Table row dividers, inner separators
CTA background
#1A1A18
Primary buttons
CTA text
#FFFFFF
Text on primary buttons
CTA hover
#2E2E2B
Primary button hover state


2.2 Semantic Colours (Status Badges)

Status
Background
Text
Usage
Pending / Unpaid
#FAEEDA
#854F0B
Orders awaiting action, unpaid invoices
Processing / Info
#E6F1FB
#185FA5
Orders being handled
Shipped / Success
#EAF3DE
#3B6D11
Shipped orders, successful states
Delivered / Teal
#E1F5EE
#0F6E56
Fully completed orders
Cancelled / Danger
#FCEBEB
#A32D2D
Cancelled, refunded, error states
Draft / Neutral
#F1EFE8
#5F5E5A
Draft products, inactive states
Owner / Purple
#EEEDFE
#3C3489
Admin owner role badge
Default address
#E1F5EE
#0F6E56
Default address tag on customer detail
Blocked customer
#FCEBEB
#A32D2D
Blocked customer status


2.3 Typography

Role
Font
Size / Weight
Usage
UI sans-serif
System / Inter
var(--font-sans)
All UI text, labels, inputs, nav
Mono
DM Mono
Google Fonts import
SKUs, order numbers, prices, refs, footers
Page title
sans-serif
15-16px / 500
Screen headings
Card title
sans-serif
13px / 500
Section card headers
Section label
DM Mono
11px/500 uppercase
Above field groups in detail panels
Body / cell text
sans-serif
12px / 400
Table cells, form values
Metric value
sans-serif
22px / 500
Dashboard stat cards


2.4 Spacing & Border Radius

Border radius — containers / outer frames: 10-12px
Border radius — inputs, buttons, pills: 6-8px
Border radius — status badges: 4px | Avatar circles: 50%
Border width — outer app frame: 1px solid #D8D5D0
Border width — cards, inputs, table cells: 1px solid #E4E2DE
Border width — active nav item left accent: 2px solid #1A1A18
Input height: 34-40px | Button primary: 34-40px | Button ghost/action: 28-32px
Card padding: 14-20px | Page content padding: 24-32px


3. Global Layout Shell
Every authenticated screen uses the same shell. Only the main content area swaps between screens.

3.1 Outer Frame
Background: #F6F5F3 | Border: 1px solid #D8D5D0 | Border radius: 10-12px | Display: flex row | Height: 100vh

3.2 Sidebar Navigation
Width: 200px, fixed | Background: #FFFFFF | Right border: 1px solid #E4E2DE | Padding: 20px 0

Brand mark
Logo mark: 24x24px dark (#1A1A18) rounded square (border-radius 5px) with white stacked-bars SVG icon
Logo text: 13px / 500, color #1A1A18, letter-spacing -0.01em, text: StoneBase
Brand section: 1px border-bottom #E4E2DE, 20px padding-bottom before nav items

Nav item styles
Default: flex row, gap 9px, padding 7px 16px, font 13px, radius 6px, margin 1px 8px, color #6B6860
Hover: bg #F6F5F3, color #1A1A18 | Active: bg #F0EDE8, color #1A1A18, weight 500
Icons: Tabler outline, 15px | Section labels: 10px DM Mono uppercase #B8B5B0, padding 12px 16px 4px

Nav structure (top to bottom)
Overview (ti-layout-dashboard), Orders (ti-shopping-bag), Products (ti-box), Customers (ti-users)
[Section label: Store] Shipping (ti-truck-delivery), Refunds (ti-receipt-refund), Analytics (ti-chart-bar)
[Section label: System] Settings (ti-settings)
[Bottom, margin-top auto, border-top 1px #E4E2DE] Admin (ti-user-circle)


4. Reusable Components
4.1 Primary Button
Height 32-40px | Bg #1A1A18 | Border none | Radius 7-8px | Font 12-13px/500 | Color #FFFFFF
Hover: bg #2E2E2B | Active: transform scale(0.99)

4.2 Ghost Button
Height 28-34px | Bg transparent | Border 1px #E4E2DE | Radius 6-7px | Font 11-13px | Color #6B6860
Hover: border-color #B8B5B0, color #1A1A18

4.3 Danger Button
Height 28-34px | Bg transparent | Border 1px #F0C4C4 | Radius 6-7px | Color #A32D2D
Hover: bg #FCEBEB

4.4 Text Input / Select
Height 34-40px | Bg #FFFFFF | Border 1px #D8D5D0 (focus: #1A1A18) | Radius 7-8px | Font 12-14px
Placeholder: #C8C5C0 | Focus ring: box-shadow 0 0 0 3px rgba(26,26,24,0.06) | Transition border-color 0.15s

4.5 Status Badge
Display inline-flex | Padding 2px 8px | Radius 4px | Font 11px/500 DM Mono | Colours: see Section 2.2

4.6 Search Bar
Flex row, gap 6px, height 32px, padding 0 10px, bg #F6F5F3, border 1px #E4E2DE, radius 7px
Contains: ti-search icon (14px #A8A59F) + bare input (no border, transparent bg, 12px, no outline)

4.7 Filter Pill
Height 26px | Padding 0 10px | Radius 20px | Font 11px DM Mono
Default: bg #FFFFFF, border 1px #E4E2DE, color #6B6860 | Active: bg #1A1A18, border #1A1A18, color #FFFFFF

4.8 Toggle Switch
Track: 36x20px radius 20px | Off: bg #E4E2DE | On: bg #1A1A18 | Transition 0.2s
Thumb: 14x14px white circle, top 3 left 3 | On position: translateX(16px)

4.9 Avatar Circle
30-44px circle (50%) | Bg #F0EDE8 | Color #6B6860 | Font 11-14px/500 | Content: initials (first letter of each name word, uppercase)

4.10 Section Label (Detail Panels)
Font 11px/500 DM Mono uppercase letter-spacing 0.06em color #A8A59F
1px border-bottom #F0EDE8, padding-bottom 8px, margin-bottom 8px

4.11 Data Table
Full width, border-collapse collapse
Header: bg #FAF9F7, font 11px/400 #A8A59F, padding 8px 20px, border-bottom 1px #E4E2DE
Cells: font 12px #1A1A18, padding 10px 20px, border-bottom 1px #F0EDE8 (none on last row)
Hover: bg #FAF9F7 | Selected: bg #F0EDE8 | Clickable rows: cursor pointer

4.12 Split Panel Layout
List panel: ~55% width, border-right 1px #E4E2DE | Detail panel: ~45%, bg #FFFFFF
Detail closed: list expands to 100% | Width transition: 0.2s
Detail header: padding 14px 20px, border-bottom 1px #E4E2DE, flex row space-between
Detail body: overflow-y auto, padding 20px, flex-column, gap 20px

4.13 Metric Card (Dashboard)
Bg #FFFFFF | Border 1px #E4E2DE | Radius 10px | Padding 14px 16px
Label: 11px #A8A59F | Value: 22px/500 #1A1A18 -0.02em tracking | Delta: 11px DM Mono
Delta up: #3B6D11 | Delta down: #A32D2D | Delta neutral: #A8A59F

4.14 Settings Card
Bg #FFFFFF | Border 1px #E4E2DE | Radius 10px | Overflow hidden
Header: padding 14px 20px, border-bottom 1px #E4E2DE, flex row space-between, title 13px/500
Body: padding 20px, flex-column, gap 14px

4.15 Timeline
Flex column. Each item: flex row, gap 12px
Left: dot (8px circle bg #1A1A18) + vertical stem (1px bg #E4E2DE, flex 1). Last item: no stem.
Right: event text (12px #1A1A18) + timestamp (11px DM Mono #A8A59F), padding-bottom 14px


5. Screens
5.1 Login
Only unauthenticated screen. Two-column layout with no sidebar nav.

Layout
Outer: flex row, border 1px #D8D5D0, radius 10-12px, min-height 600px
Left panel: 44% width, bg #FFFFFF, border-right 1px #E4E2DE, padding 36px 40px, flex column space-between
Right panel: flex 1, bg #F6F5F3, padding 48px, flex column justify-center

Left panel contents
Top: brand mark (logo mark + StoneBase text, same spec as sidebar)
Bottom: tagline label — 11px DM Mono uppercase color #A8A59F, text: Admin console
Tagline body: Instrument Serif (Google Font), italic, 26px, line-height 1.35, color #6B6860
Emphasis: color #1A1A18, font-style normal. Emphasised text: store needs
Full tagline: Everything your / store needs, / in one place.

Right panel (top to bottom)
Heading: 20px/500 #1A1A18 — Sign in to your account
Subheading: 13px #A8A59F — Admin access only
Email address: label (11px #6B6860) + text input
Password: label + password input with show/hide toggle (11px DM Mono #A8A59F, absolute right 12px)
Row: Keep me signed in checkbox + label (12px #6B6860) left | Forgot password? link (12px #6B6860) right
Primary button: full width, Sign in
Divider: 1px #E4E2DE lines each side of or text (11px DM Mono #C8C5C0)
SSO button: full width, bg #FFFFFF, border 1.5px #B8B5B0, radius 8px, dark text, 4-square grid icon, Continue with SSO
Footer: 11px DM Mono #B8B5B0 centered — v1.0.0 · StoneBase Admin · Internal use only


5.2 Dashboard (Overview)
Page header
Left: Overview — 16px/500 #1A1A18 | Right: current date — 12px DM Mono #A8A59F | Margin-bottom 20px

Metric cards row
4-column grid, gap 12px, margin-bottom 20px
Cards: Total revenue (₵), Orders today, Active products, Low stock alerts
Each card: see Component 4.13

Charts row
2-column grid, gap 12px, margin-bottom 20px
Left card: Revenue — last 7 days — line chart via Chart.js
Line: border-color #1A1A18, width 1.5, point-radius 3, tension 0.3, fill rgba(26,26,24,0.04)
X-axis: Mon-Sun labels, no grid, ticks 11px #A8A59F | Y-axis: ₵ + value in thousands, grid #F0EDE8
Right card: Orders by status — doughnut chart, cutout 70%, border-width 0
Colours: Pending #185FA5, Shipped #3B6D11, Delivered #0F6E56, Cancelled #A32D2D
Custom HTML legend: 8x8px radius-2px colour squares + 11px DM Mono labels + %, flex column gap 8px, placed right of canvas
All Chart.js default legends must be disabled (plugins.legend.display: false)

Recent orders table
Full-width card: header with Recent orders left, View all → right (11px DM Mono #A8A59F, hover #1A1A18)
Columns: Order (#SB-XXXXX DM Mono #6B6860), Customer, Items, Total (₵), Status badge
Shows last 5 orders


5.3 Products
Split-panel layout. List panel 55% left, detail panel 45% right. Detail opens on row click.

List panel header
Title: Products (15px/500) | Search bar | Add product primary button (ti-plus icon left)

Filter bar
Pills: All (default active), Published, Draft, Archived, Low stock
Bg #FAF9F7, padding 10px 20px, border-bottom 1px #E4E2DE

Products table columns
Product: name (12px/500) + SKU below (11px DM Mono #A8A59F)
Category: 12px #6B6860 | Price: DM Mono ₵ prefix
Stock: DM Mono. 0 = color #A32D2D | at/below threshold = #854F0B | normal = #1A1A18
Status: badge. Low stock badge overrides Published when stock <= threshold and > 0

Detail panel sections
Header: product name (13px/500) | X ghost, Delete danger, Save changes primary
Image slot: full width 140px, bg #F6F5F3, dashed border 1px #D8D5D0, ti-photo 22px + Click to upload image (12px)
Basic info: Name (full width), Description (textarea), Category + Status in 2-col row
Pricing: Base price (₵) + Low stock threshold in 2-col row
Variants: inner card rows (variant label, SKU DM Mono, stock count, price, ti-edit icon); Add variant ghost button below


5.4 Orders
Split-panel layout identical in structure to Products.

List panel
Header: Orders title + search bar (no Add button)
Filter pills: All, Pending, Processing, Shipped, Delivered, Cancelled
Columns: Order (DM Mono #6B6860), Customer, Total (₵), Payment (badge), Status (badge)

Detail panel sections
Header: order number (DM Mono 13px/500) | X ghost, Print ghost (ti-printer), Update status primary
Customer & shipping: 2-col info grid: Customer name, Phone | Email (full span) | Payment method | Address (full span) | Paystack ref (full span)
Order status: two selects side by side — Order status + Payment status
Items: inner card rows — product name (12px) + SKU below (11px DM Mono), quantity (x N), subtotal (₵)
Totals block: bg #FAF9F7, border 1px #E4E2DE, radius 8px, padding 12px 14px. Rows: Subtotal, Shipping, Discount. Final Total row: border-top 1px #E4E2DE, bold.
Timeline: see Component 4.15
Internal note: plain text in #FAF9F7 inner card, 12px #6B6860, line-height 1.6


5.5 Customers
Split-panel layout identical in structure to Products and Orders.

List panel
Header: Customers title + search bar
Filter pills: All, Active, Blocked
Columns: Customer (28px avatar + name 12px/500 + email 11px #A8A59F), Phone (DM Mono), Orders, Total spent (₵), Status badge

Detail panel sections
Header: customer name (13px/500) | X ghost, Block danger (ti-ban icon)
Profile: 2-col info grid: Email, Phone, Joined date, Status badge
Quick stats: 3-col stat grid: Total orders | Total spent (₵) | Avg order (₵ = round(total/orders))
Saved addresses: address inner cards; default address has teal Default badge (bg #E1F5EE color #0F6E56)
Recent orders: mini-rows — order number (DM Mono), date, status badge, total (₵)


5.6 Settings
Three-column layout: main sidebar (200px) + settings sub-nav (180px) + content area (flex 1).

Settings sub-nav
Bg #FAF9F7, border-right 1px #E4E2DE, padding 16px 0
Active item: color #1A1A18, weight 500, bg #F0EDE8, border-right 2px solid #1A1A18
Sections: General (Store info, Payments, Notifications), Admin (Team, Shipping zones)

Content area
Overflow-y auto, padding 28px 32px
Each tab: title (16px/500 #1A1A18) + subtitle (12px #A8A59F) at top
Save footer: flex row, justify-content flex-end, gap 8px, padding-top 4px

Store info tab
Card General: Store name | Contact email + phone (2-col) | Address | Currency + Timezone (2-col)
Card Tax: Tax rate (%) + Tax inclusive pricing (2-col)
Defaults: GHS — Ghanaian Cedi (₵), Africa/Accra (GMT+0)

Payments tab
Card Paystack: Public key, Secret key (type=password), Webhook URL
Card Payment methods: toggle Paystack card & MoMo (default on), toggle Cash on delivery (default off)

Notifications tab
Card Email alerts: 5 toggle rows — New order (on), Payment confirmed (on), Low stock (on), Order cancelled (off), Refund issued (off)
Card Recipient: single email address input

Team tab
Card Admin users: Invite admin ghost button in card header
Row per admin: avatar (initials), name + email (DM Mono), role badge, Remove danger button (hidden for Owner)
Owner badge: bg #EEEDFE color #3C3489 | Employee badge: bg #F0EDE8 color #6B6860

Shipping zones tab
Card Zones: Add zone ghost button in header. Rows: zone name (12px/500), regions (11px #A8A59F), flat rate (DM Mono), ti-edit ghost
Card Free delivery: enable toggle + minimum order amount number input


6. Technology Notes
Use these exact choices. Do not substitute.

Framework: Next.js (App Router)
Styling: Tailwind CSS — map all design tokens to tailwind.config.js theme.extend
Fonts: DM Mono via Google Fonts (global CSS). Instrument Serif on login screen only.
Icons: Tabler Icons outline only — @tabler/icons-react or react-icons/tb
Charts: Chart.js via react-chartjs-2. All default legends disabled; custom HTML legends.
Currency: Ghanaian Cedi (₵). Format: ₵ + number.toLocaleString()
Payments: Paystack. Webhook URL: /api/paystack/webhook
Database: Neon Postgres via Prisma 6
Auth: Custom admin auth. Session-based or JWT. Not Clerk.

6.1 Tailwind Token Mapping
colors.bg.primary = #FFFFFF
colors.bg.secondary = #F6F5F3
colors.bg.tertiary = #FAF9F7
colors.bg.subtle = #F0EDE8
colors.text.primary = #1A1A18
colors.text.secondary = #6B6860
colors.text.muted = #A8A59F
colors.text.hint = #B8B5B0
colors.border.strong = #D8D5D0
colors.border.default = #E4E2DE
colors.border.subtle = #F0EDE8
fontFamily.mono = ['DM Mono', 'monospace']


7. Agent Build Instructions
Follow every rule below exactly when generating code for this project.

Never deviate from the colour tokens in Section 2. Do not introduce new colours.
Never use gradients, box-shadows (except focus rings), blur, or glow on any element.
Never use a dark background on any surface. The darkest surface is #F6F5F3.
All monetary values must be prefixed with ₵ and formatted with .toLocaleString().
All order numbers must use DM Mono font, prefixed with #SB- and zero-padded to 5 digits.
All SKUs must render in DM Mono font.
Status badges must use exactly the colour pairs in Section 2.2. Do not use Tailwind colour classes for badges.
The sidebar nav is identical on every authenticated screen — extract as a single shared component.
Products, Orders, and Customers all use the same split-panel layout logic — extract as a shared component.
Detail panels always open to the right of the list. The list shrinks; it does not disappear.
Charts must disable the default Chart.js legend. Use custom HTML legends with 8x8px colour squares.
Settings tabs switch via JS/React state. Do not use Next.js routing for tab switching within the settings screen.
All settings form fields must be wired to real state and submitted via Next.js Server Actions.
The login screen is the only screen without the sidebar shell.
Instrument Serif is only loaded on the login screen. Do not import it in the global stylesheet.
All chart canvas elements must have role=img and aria-label with a descriptive summary.
All icon-only buttons must have aria-label. Decorative icons must have aria-hidden=true.


End of document. Build exactly as specified.
