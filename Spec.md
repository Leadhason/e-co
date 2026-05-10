# E-Commerce Admin & Inventory System — Full Project Specification

## Overview

This document is a complete specification for a standalone e-commerce administration and inventory management system. It covers the product vision, user roles, feature breakdown, data model, system architecture, project structure, and build order. It is intended to give a developer or agent full context to begin building without ambiguity.

---

## What We Are Building

A standalone admin dashboard for a single e-commerce brand. It is entirely separate from the customer-facing storefront. The admin system is where the business manages its products, stock, orders, customers, analytics, and configuration.

The storefront and the admin system share the same Neon Postgres database. They do not call each other directly — the storefront writes data (orders, customers), and the admin reads and manages it.

---

## Users & Roles

There are exactly two roles in this system. No custom roles, no self-registration. Accounts are created by the owner from within the settings module.

### Owner
- Has full read and write access to every module
- Is the primary user of the analytics module
- Can manage the employee account (create, edit, reset password, block, delete)
- Cannot be demoted or deleted from within the system

### Employee
- Handles all day-to-day operations — adding products, updating stock, processing orders, managing customers
- Cannot access the full analytics module (only low stock alerts and recent orders)
- Cannot access account management settings
- Cannot access financial configuration (Paystack keys, revenue reports)

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Database | Neon Postgres |
| ORM | Prisma |
| Auth | Custom session-based auth |
| File storage | Supabase Storage |
| Email | Resend |
| Payments | Paystack |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Feature Modules

The system is divided into six feature modules.

---

### 1. Auth

Auth covers everything related to identity — proving it, maintaining it, recovering it, and enforcing access by role.

#### Micro-features

**Login**
- Email and password form
- Show / hide password toggle
- Remember me option (extends session lifetime)
- Error states — wrong password, account not found, account blocked

**Logout**
- Single click logout from anywhere in the dashboard
- Session fully invalidated server-side on logout

**Session management**
- User stays logged in across page refreshes and browser closes if remember me is active
- Session expires after inactivity (7 days)
- If session expires mid-use, redirect to login and return user to their previous location after re-authentication

**Role enforcement**
- On login, the system reads the user's role and stores it in the session
- Every protected page checks role before rendering
- Direct URL access to an unauthorised page results in a redirect, not just a hidden menu item

**Password reset**
- Forgot password link on the login page
- User enters email, receives a time-limited reset link (expires in 1 hour)
- After reset, the old password is immediately invalidated

**Change password (from settings)**
- Logged-in user can change their own password
- Must provide current password first
- New password requires a confirmation field

**Account blocking**
- If the owner blocks the employee account, they cannot log in
- If they are already logged in when blocked, their session is invalidated immediately

#### What is NOT being built
- Self-registration / signup page
- Two-factor authentication
- OAuth / social login
- Magic links

---

### 2. Product Management

The most complex module in the system due to variant support.

#### Micro-features

**Products list page**
- Table of all products showing name, category, main image, price, total stock, status
- Search by product name or SKU
- Filter by category, status (published, draft, archived), stock level (in stock, low stock, out of stock)
- Sort by name, price, date added, stock level
- Pagination
- Bulk actions — select multiple products and publish, archive, or delete
- Add product button
- Import products button (CSV flow)

**Add / edit product page**
One form used for both creating and editing.

*Basic info*
- Product name
- Description (rich text — bold, bullets, basic formatting)
- Category (select existing or create new inline)
- Product status — published, draft, archived

*Images*
- Upload multiple images
- Drag to reorder (first image is the cover)
- Delete individual images

*Pricing*
- Base price (default if no variant-level override is set)

*Variants*
- Add variant attributes (e.g. attribute: "Size", options: "S, M, L, XL")
- Add multiple attributes (e.g. "Color", options: "Red, Blue, Black")
- System generates all combinations (Red/S, Red/M, Blue/S etc.)
- Per variant: SKU (auto-suggested, editable), price override, stock quantity, low stock threshold
- Ability to disable specific variants (e.g. Blue/XL not available)

*No variants*
- If the product has no variants: single SKU, stock quantity, and low stock threshold at product level

**Product detail page**
- Read-only view of all product info, images, and variant table with current stock
- Quick links to edit or archive

**Delete / archive**
- Archiving hides the product from the storefront but preserves data (critical for order history integrity)
- Hard delete only allowed on draft products that have never been ordered
- Deleting a product with order history is blocked — archive instead

**Category management**
- Accessible from settings or as a sub-section of product management
- Create, rename, delete categories
- A category cannot be deleted if products are still assigned to it

**CSV bulk import**
- Downloadable template with predefined columns
- Upload CSV
- Validate before saving — catch missing required fields, duplicate SKUs, invalid prices
- Preview what will be imported before confirming
- Results screen after import — successes and failures with reasons
- Images handled separately (uploaded per product after import)

CSV row structure (one row per variant):
```
product_name | category | base_price | variant_name | variant_sku | variant_price | stock_qty | low_stock_threshold
```

One product with multiple variants = multiple rows grouped by product name.

**Stock adjustment (from product)**
- Inside each product's detail or edit page
- Employee enters new quantity and selects a reason (restock, damaged, correction)
- Creates a log entry with timestamp and who made the change

#### What is NOT being built
- Supplier management
- Purchase orders
- Barcode / QR generation
- Product bundles
- Digital products

---

### 3. Order Management

Orders are the most sensitive feature — they involve money and customer expectations.

#### Micro-features

**Orders list page**
- Table showing order number, date, customer name, items summary, total, payment status, order status
- Search by order number or customer name
- Filter by order status (pending, processing, shipped, delivered, cancelled, refunded)
- Filter by payment status (paid, unpaid, refunded)
- Filter by date range
- Sort by date, total, status
- Pagination
- Export orders to CSV

**Order detail page**

*Order summary*
- Order number and date placed
- Order status with full status history (timestamp per change)
- Payment status and payment method
- Paystack transaction reference number

*Items ordered*
- Product name, variant (e.g. Red / M), quantity, unit price, subtotal
- Product image thumbnail
- Archived products still display correctly (data is snapshotted at order time)

*Pricing breakdown*
- Subtotal, shipping fee, discount, total

*Customer info*
- Name, email, phone, shipping address

*Internal notes*
- Admin can add timestamped notes to an order
- Notes show who added them
- Notes are never visible to the customer

**Order status management**
- Status flow: Pending → Processing → Shipped → Delivered
- Can also move to Cancelled or Refunded
- Each change is logged with timestamp and who made it
- Skipping steps is allowed (e.g. Pending → Shipped for walk-in pickups)

**Cancellation**
- Only allowed if the order has not been shipped
- Stock is automatically returned to inventory on cancellation
- Cancellation reason required (dropdown: customer request, out of stock, payment issue, other)
- Cancelled orders are never deleted

**Refunds**
- Only initiable on paid orders
- Admin marks as refunded in the system; actual reversal is done manually in Paystack dashboard
- Refund logged with amount and who processed it
- Order status moves to Refunded

**Stock decrement on order**
- Stock decremented automatically per variant when an order is placed (handled by storefront)
- If stock hits zero between cart and payment completion, order is flagged
- Admin sees a warning on the order detail page

#### What is NOT being built
- Shipping label generation
- Automated courier integration
- Split orders
- Backorders
- Automated Paystack refund API triggering

---

### 4. Customer Management

Customers are created by the storefront — the admin never manually creates a customer.

#### Micro-features

**Customers list page**
- Table showing name, email, phone, date joined, total orders, total spent
- Search by name, email, or phone
- Filter by account status (active, blocked)
- Sort by date joined, total orders, total spent
- Pagination

**Customer detail page**

*Profile info*
- Full name, email, phone number
- Date account created
- Account status (active or blocked)

*Order history*
- All orders placed by this customer
- Each row: order number, date, status, total
- Clicking an order links directly to that order's detail page
- Summary at top: total orders placed, total amount spent

*Shipping addresses*
- All addresses the customer has saved or used
- Read only — admin cannot edit customer addresses

**Account blocking**
- Owner or employee can block a customer
- Blocked customers cannot log in to the storefront or place orders
- Reason required (dropdown: fraudulent activity, payment disputes, abusive behaviour, other)
- Block is reversible
- Block is logged — who, when, reason

#### What is NOT being built
- Customer segmentation
- Loyalty / rewards system
- Direct messaging from admin
- Customer notes or tagging
- Manually creating or editing customer accounts

---

### 5. Analytics

The owner's primary reason for logging in. Every number should answer a specific business question.

**Permissions note:** The employee can only see low stock alerts and recent orders from the dashboard. All other analytics are owner-only.

#### Micro-features

**Dashboard / overview**
- Total revenue — today, this week, this month, with comparison to previous equivalent period
- Total orders — same breakdowns
- Average order value — same breakdowns
- New customers — for the selected period
- Recent orders — last 10 with status
- Low stock alerts — products at or below their threshold, shown prominently

**Sales report page**
- Revenue over time (line chart, selected date range)
- Orders over time (same format)
- Date range selector: today, last 7 days, last 30 days, last 3 months, custom
- Breakdown by category
- Breakdown by payment method

**Products report page**
- Top selling products by units sold and by revenue
- Worst performing products (zero or very low sales in period)
- Most refunded products
- Stock levels summary (total, in stock, low stock, out of stock)

**Orders report page**
- Order status breakdown (chart)
- Average fulfilment time (order placed to shipped)
- Cancellation rate and most common reasons
- Refund rate

**Customer report page**
- Total customers over time
- New vs returning customers
- Top customers by total spent and total orders

**Exports**
- Every report page has an export to CSV button

#### What is NOT being built
- Predictive / forecast analytics
- Marketing attribution
- Profit and loss (requires cost of goods data)
- Live streaming dashboard (data refreshes on page load or interval)

---

### 6. Settings

Configuration for how the system behaves and who can use it.

#### Micro-features

**Store information**
- Store name
- Store logo (upload and replace)
- Contact email (used in system emails)
- Contact phone number
- Store address (used on invoices)
- Currency (set once, affects all price display)
- Timezone (affects when analytics reset)

**Account management**
- Owner views and edits their own name and email
- Owner changes their own password (current password required)
- Owner cannot delete or demote their own account
- Owner creates the employee account (name, email, temporary password)
- Owner edits employee name and email
- Owner resets employee password (temporary password, must change on first login)
- Owner blocks or unblocks the employee account
- Owner deletes the employee account if staff changes
- Roles are fixed — cannot be changed after account creation

**Shipping settings**
- Define shipping zones by region or city
- Flat shipping fee per zone
- Free shipping threshold per zone
- Enable or disable cash on delivery per zone
- Default zone catches any unmatched address

**Notification settings**
- Toggle alerts for: new order placed, order cancelled, refund requested, stock hits low threshold, new customer registered
- Set recipient email per alert type (defaults to store contact email)

**Payment settings**
- Paystack public and secret key fields
- Webhook URL displayed (read only — pasted into Paystack dashboard)
- Toggle cash on delivery as payment option
- Test mode toggle (switches between Paystack test and live keys)

**Tax settings**
- Single tax rate (percentage)
- Toggle — tax included in displayed prices or added at checkout
- Set to zero if not tax-registered

**Data export**
- Export all products to CSV
- Export all orders to CSV
- Export all customers to CSV

**Danger zone**
- All irreversible actions (delete account, switch live mode, change currency) require a confirmation modal before executing

#### What is NOT being built
- Custom email template editor
- Multiple currencies
- Custom roles or granular permission editors
- Storefront appearance / theme settings
- Billing or subscription management
- API key management beyond Paystack

---

## Data Model

### Tables and fields

**ADMIN_USER**
```
id                uuid        PK
name              string
email             string      unique
password_hash     string
role              enum        OWNER | EMPLOYEE
is_blocked        boolean     default false
created_at        timestamp
```

**STORE_SETTINGS** *(single row table)*
```
id                uuid        PK
name              string
logo_url          string
contact_email     string
contact_phone     string
address           string
currency          string
timezone          string
tax_rate          float
tax_inclusive     boolean
cod_enabled       boolean
updated_at        timestamp
```

**CATEGORY**
```
id                uuid        PK
name              string      unique
created_at        timestamp
```

**PRODUCT**
```
id                uuid        PK
category_id       uuid        FK → CATEGORY
name              string
description       text
base_price        float
status            enum        PUBLISHED | DRAFT | ARCHIVED
low_stock_threshold int
created_at        timestamp
updated_at        timestamp
```

**PRODUCT_IMAGE**
```
id                uuid        PK
product_id        uuid        FK → PRODUCT
url               string
position          int
created_at        timestamp
```

**VARIANT_ATTRIBUTE**
```
id                uuid        PK
product_id        uuid        FK → PRODUCT
name              string      (e.g. "Size", "Color")
```

**ATTRIBUTE_OPTION**
```
id                uuid        PK
attribute_id      uuid        FK → VARIANT_ATTRIBUTE
value             string      (e.g. "Red", "XL")
```

**PRODUCT_VARIANT**
```
id                uuid        PK
product_id        uuid        FK → PRODUCT
sku               string      unique
price_override    float       nullable
stock_qty         int
low_stock_threshold int
is_active         boolean     default true
created_at        timestamp
```

**VARIANT_OPTION_MAP** *(join table — links a variant to its specific options)*
```
id                uuid        PK
variant_id        uuid        FK → PRODUCT_VARIANT
option_id         uuid        FK → ATTRIBUTE_OPTION
```

**STOCK_ADJUSTMENT** *(manual adjustments only — not order-driven decrements)*
```
id                uuid        PK
variant_id        uuid        FK → PRODUCT_VARIANT
admin_id          uuid        FK → ADMIN_USER
quantity_change   int         (positive = added, negative = removed)
reason            string
created_at        timestamp
```

**CUSTOMER**
```
id                uuid        PK
name              string
email             string      unique
phone             string
is_blocked        boolean     default false
block_reason      string      nullable
blocked_at        timestamp   nullable
created_at        timestamp
```

**CUSTOMER_ADDRESS**
```
id                uuid        PK
customer_id       uuid        FK → CUSTOMER
line1             string
line2             string      nullable
city              string
region            string
is_default        boolean
```

**ORDER**
```
id                uuid        PK
customer_id       uuid        FK → CUSTOMER
address_id        uuid        FK → CUSTOMER_ADDRESS
order_number      string      unique
status            enum        PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED
payment_status    enum        UNPAID | PAID | REFUNDED
payment_method    string
paystack_ref      string      nullable
subtotal          float
shipping_fee      float
discount          float       default 0
total             float
created_at        timestamp
```

**ORDER_ITEM** *(snapshotted — does not rely on joins for product data)*
```
id                uuid        PK
order_id          uuid        FK → ORDER
variant_id        uuid        FK → PRODUCT_VARIANT (nullable — variant may be deleted)
product_name      string      (snapshot)
variant_name      string      (snapshot, e.g. "Red / M")
sku               string      (snapshot)
unit_price        float       (snapshot)
quantity          int
subtotal          float
```

**ORDER_STATUS_LOG**
```
id                uuid        PK
order_id          uuid        FK → ORDER
admin_id          uuid        FK → ADMIN_USER
status            enum
created_at        timestamp
```

**ORDER_NOTE**
```
id                uuid        PK
order_id          uuid        FK → ORDER
admin_id          uuid        FK → ADMIN_USER
note              text
created_at        timestamp
```

**REFUND**
```
id                uuid        PK
order_id          uuid        FK → ORDER
admin_id          uuid        FK → ADMIN_USER
amount            float
reason            string
created_at        timestamp
```

**SHIPPING_ZONE**
```
id                uuid        PK
name              string
flat_rate         float
free_threshold    float       nullable
cod_enabled       boolean
```

**SHIPPING_ZONE_REGION**
```
id                uuid        PK
zone_id           uuid        FK → SHIPPING_ZONE
region_name       string
```

**NOTIFICATION_SETTING**
```
id                uuid        PK
event             string      (e.g. "new_order", "low_stock")
is_enabled        boolean
recipient_email   string
```

### Key design decisions

**Variant system**
A three-table design: `VARIANT_ATTRIBUTE` stores attribute types (Size, Color), `ATTRIBUTE_OPTION` stores values (S, M, Red, Blue), and `PRODUCT_VARIANT` stores the actual sellable combinations. `VARIANT_OPTION_MAP` links each variant to the options that compose it. This allows any number of attributes without schema changes.

**ORDER_ITEM snapshots product data**
`product_name`, `variant_name`, `sku`, and `unit_price` are stored as plain values — not just foreign keys. This preserves historical accuracy even if products are renamed, repriced, or deleted.

**ORDER_STATUS_LOG**
Every status change writes a row here in addition to updating `ORDER.status`. Current status is always readable from the `ORDER` table. Full history is always available from the log.

**STOCK_ADJUSTMENT as a log**
Manual stock changes write here. Order-driven decrements update `PRODUCT_VARIANT.stock_qty` directly inside a Prisma transaction — they do not write to `STOCK_ADJUSTMENT`.

**STORE_SETTINGS as a single-row table**
Always queried with `findFirst()`. Simpler than scattering config across environment variables.

---

## System Architecture

### Overview

A Next.js App Router application deployed on Vercel. It connects to a Neon Postgres database via Prisma, stores images in Supabase Storage, sends emails via Resend, and integrates with Paystack for payment data.

### Layers

**UI layer**
React pages and components built with the App Router. Server components for data display, client components only where interactivity is required (forms, modals, dropdowns).

**Auth middleware**
A Next.js middleware file that runs on every request before the page renders. Checks for a valid session and the user's role. Redirects unauthenticated users to login and unauthorised roles to a 403 page.

**Server actions**
All mutations (form submissions, status updates, deletions) are handled by server actions. No client-side fetch calls for mutations.

**Route handlers**
Used only for the Paystack webhook (`/api/webhooks/paystack`). Paystack sends POST requests from outside the app and server actions cannot receive these.

**Prisma ORM**
Sits between server actions and the database. Type-safe queries, schema management, and migrations.

**Neon Postgres**
Serverless Postgres. Connection pooling is built in — compatible with Vercel's serverless function environment.

### External services

| Service | Purpose |
|---|---|
| Supabase Storage | Product image storage and delivery |
| Resend | Outgoing admin notification emails |
| Paystack | Payment processing (storefront) and webhook events (order payment status) |

### Storefront relationship

The storefront is a separate Next.js codebase. It shares the same Neon Postgres database. No direct API calls between the two — the storefront writes (orders, customers), the admin reads and manages.

### Environment variables

```bash
# Database
DATABASE_URL=

# Auth
SESSION_SECRET=

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
```

---

## Project Structure

```
admin/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   └── logo.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── edit/
│   │       │           └── page.tsx
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── customers/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── analytics/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           ├── page.tsx
│   │           ├── accounts/
│   │           │   └── page.tsx
│   │           ├── shipping/
│   │           │   └── page.tsx
│   │           ├── payments/
│   │           │   └── page.tsx
│   │           ├── notifications/
│   │           │   └── page.tsx
│   │           └── tax/
│   │               └── page.tsx
│   │
│   ├── api/
│   │   └── webhooks/
│   │       └── paystack/
│   │           └── route.ts
│   │
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── customers.ts
│   │   ├── stock.ts
│   │   └── settings.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── supabase.ts
│   │   ├── resend.ts
│   │   ├── paystack.ts
│   │   ├── session.ts
│   │   └── utils.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Select.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── products/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── VariantBuilder.tsx
│   │   │   └── ImageUploader.tsx
│   │   ├── orders/
│   │   │   ├── OrderStatusBadge.tsx
│   │   │   └── OrderTimeline.tsx
│   │   ├── analytics/
│   │   │   ├── RevenueChart.tsx
│   │   │   └── StatCard.tsx
│   │   └── shared/
│   │       ├── SearchBar.tsx
│   │       ├── FilterBar.tsx
│   │       ├── Pagination.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── middleware.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   │
│   └── constants/
│       ├── roles.ts
│       ├── orderStatus.ts
│       └── routes.ts
│
├── .env.local
├── .env.example
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Structure decisions

**Route groups `(auth)` and `(dashboard)`**
Parentheses mark organisational groups with no URL segment. Each group has its own layout — auth pages get a plain centered layout, dashboard pages get the sidebar and topbar.

**`actions/` not `app/api/`**
Server actions handle all mutations. Route handlers are only used for the Paystack webhook.

**`lib/prisma.ts` as a singleton**
Prevents exhausting database connections in Vercel's serverless environment.

**`constants/orderStatus.ts`**
Status values and allowed transitions defined once, imported everywhere. Prevents typos and makes changes easy.

---

## Build Order

Build what everything else depends on first.

### Phase 1 — Foundation
1. Project scaffold — initialise Next.js, install dependencies, configure Tailwind, set up path aliases
2. Database — connect Neon, write full Prisma schema, run first migration
3. Auth — login, session management, middleware with role guard, password reset, seed owner account
4. Dashboard shell — sidebar, topbar, layout (no real data yet — just the chrome)

### Phase 2 — Core operations
5. Categories — simple CRUD, required before products
6. Products — list, add, edit, image upload, variant builder (no CSV import yet)
7. Stock management — stock overview, manual adjustment, adjustment history
8. Customers — list, detail, order history tab, block/unblock
9. Orders — list, detail, status updates, cancellation, notes, refund marking

### Phase 3 — Intelligence
10. Analytics dashboard — revenue stats, order counts, low stock alerts, recent orders
11. Sales, products, orders, customer reports — charts, date range filters, CSV exports

### Phase 4 — Configuration
12. Settings — store info
13. Settings — account management
14. Settings — shipping zones
15. Settings — payments
16. Settings — notifications
17. Settings — tax

### Phase 5 — Polish
18. CSV bulk import — template, upload, validate, preview, confirm, results
19. Paystack webhook — receive payment events, update order payment status, trigger stock check, send emails
20. Notification emails — wire up all Resend triggers
21. Role enforcement audit — verify every page and server action is properly guarded
22. Error and empty states — every list, form, and destructive action handled correctly
23. Mobile responsiveness — primarily desktop but owner may check analytics on mobile

### Build rule
At the end of every phase, the system should be fully functional and demonstrable. Phase 2 alone is a working inventory and order management tool. Never build a feature that depends on something that doesn't exist yet.

---

## Scope Boundaries

The following are explicitly out of scope and should not be built unless the client requests them as a separate engagement:

- Customer-facing storefront
- Multi-vendor / multi-store support
- Supplier management and purchase orders
- Barcode or QR code generation
- Product bundles or digital products
- Automated courier / shipping label integration
- Backorders
- Automated Paystack refund triggering
- Discount / coupon code system
- Customer loyalty or rewards system
- Predictive analytics or forecasting
- Marketing attribution
- Profit and loss reporting
- Custom email template editor
- Multiple currencies
- Custom admin roles beyond owner and employee
- Audit logs for admin actions
- API key management beyond Paystack
