# FarmBridge --- Full Project Idea, System Workflow & Antigravity Build Brief

> **Project title:** FarmBridge --- AI-Powered Direct Farmer-to-Consumer
> Marketplace\
> **Category:** AgriTech \| Digital Marketplace \| Supply Chain \|
> AI-Assisted Decision Support\
> **Primary objective:** Connect farmers directly with consumers,
> retailers, restaurants, and other buyers to improve market access,
> make pricing more transparent, and coordinate local fulfilment.\
> **Initial pilot area:** Pollachi and nearby communities, Tamil Nadu,
> India (configurable for other regions).\
> **Product format:** Responsive web application / Progressive Web App
> (PWA), designed mobile-first for farmers.

------------------------------------------------------------------------

## 1. Project Overview

FarmBridge is a digital agricultural marketplace that helps farmers list
and sell their produce directly to buyers. Traditional agricultural
supply chains may involve local agents, wholesalers, distributors, and
retailers. Each stage can add handling, transport, storage, and
commercial margins. Farmers may have limited access to buyers and price
information, while consumers may have difficulty finding fresh produce
directly from local farms.

FarmBridge provides a shared platform where:

-   **Farmers** can create a profile, list available produce, set their
    selling prices, manage stock, receive orders, and monitor sales.
-   **Consumers** can discover nearby produce, compare listings, order
    quantities, select delivery or pickup, pay, and track fulfilment.
-   **Retailers and restaurants** can source produce in larger
    quantities, repeat orders, and communicate their demand to farmers.
-   **Delivery partners** can manage assigned pickups and deliveries,
    update order status, and navigate routes.
-   **Administrators** can verify accounts, moderate listings, handle
    disputes, configure platform settings, and view operational
    analytics.

FarmBridge does not assume that removing every intermediary
automatically reduces costs. Its goal is to reduce **unnecessary**
intermediary steps while showing platform fees, packaging, and delivery
charges transparently. Farmers retain control of their listing prices,
and buyers can see the full payable amount before checkout.

The project should be built as a practical marketplace first. AI
features should provide decision support using available data and must
not be presented as guaranteed predictions.

------------------------------------------------------------------------

## 2. Problem Statement

Small and marginal farmers can face challenges when selling perishable
agricultural produce:

1.  **Limited market access:** Farmers may rely on familiar local buyers
    and have difficulty reaching a wider set of customers.
2.  **Weak price visibility:** Farmers may not have timely,
    understandable reference prices for comparable produce.
3.  **Reduced bargaining power:** Farmers may have limited options when
    they need to sell harvested produce quickly.
4.  **Fragmented demand:** Individual household orders are small and
    spread across locations, making fulfilment costly.
5.  **Uncertain demand:** Farmers may not know what buyers are likely to
    need or how much produce to prepare.
6.  **Perishability and wastage:** Delays, unsold inventory, poor
    coordination, and long delivery routes can reduce product quality.
7.  **Digital accessibility:** Some farmers may need a simple,
    local-language, low-bandwidth interface and assisted onboarding.
8.  **Trust and fulfilment:** Buyers need confidence in seller identity,
    product details, order status, and dispute handling.

### Problem statement in one paragraph

Farmers often depend on multiple market participants to reach buyers,
which can limit price transparency, reduce their share of the final
selling price, and make demand and delivery coordination difficult. At
the same time, consumers and local businesses may struggle to discover
fresh produce from nearby farms at clear, competitive prices. A simple,
trustworthy digital platform is needed to connect both sides, coordinate
orders and logistics, and support better decisions with accessible
market and demand insights.

------------------------------------------------------------------------

## 3. Proposed Solution

FarmBridge is a mobile-first marketplace with farmer, buyer, delivery,
and admin experiences connected through one backend.

### Core solution

-   Give farmers an easy way to register and create digital farm
    profiles.
-   Let farmers list produce with photos, category, available quantity,
    unit, price, harvest/availability date, and pickup location.
-   Make listings discoverable to nearby households, retailers, and
    restaurants.
-   Support direct ordering, stock reservation, order confirmation,
    cancellation rules, and status tracking.
-   Show a transparent checkout breakdown: produce subtotal, delivery or
    pickup fee, platform fee (if any), discount (if any), and final
    total.
-   Coordinate pickup and delivery, including collection-point options
    and grouped local orders.
-   Provide farmer sales summaries and buyer order history.
-   Add AI-assisted price references, demand trends, and route planning
    as optional modules when data and integrations are available.
-   Support Tamil and English initially, with a structure that can
    accommodate more languages.

### Product principles

-   **Farmer agency:** Farmers set their own listing prices and decide
    whether to accept an order.
-   **Transparent pricing:** All fees are visible before an order is
    confirmed.
-   **Practical logistics:** The app should support pickup as well as
    delivery; it should not assume delivery is always economical.
-   **Trust and safety:** Verify accounts appropriately, protect
    personal data, and provide clear order and dispute records.
-   **Accessible design:** Large tap targets, simple forms, readable
    text, local-language support, and low-bandwidth performance.
-   **Honest AI:** Show estimates and confidence/limitations; never
    imply that AI guarantees market prices, quality, or future demand.

------------------------------------------------------------------------

## 4. Project Goals and Success Measures

### Goals

1.  Improve farmers' access to local and business buyers.
2.  Help farmers understand listing, order, and net-earnings
    information.
3.  Make product availability and final buyer costs more transparent.
4.  Improve coordination between listing, ordering, pickup, and
    delivery.
5.  Reduce avoidable spoilage through better visibility and timely
    fulfilment.
6.  Build a system that can start small and expand to more crops and
    locations.

### Pilot metrics

Track actual results during a pilot rather than claiming impact in
advance:

-   Number of verified farmers onboarded.
-   Number of active produce listings.
-   Number of buyers and repeat buyers.
-   Orders placed, accepted, completed, cancelled, and refunded.
-   Average time from order placement to farmer confirmation.
-   Order fulfilment rate.
-   Average order value and repeat purchase rate.
-   Farmer gross sales and estimated net earnings after disclosed costs.
-   Buyer total cost compared with relevant local alternatives, where
    reliable comparable data exists.
-   Delivery cost per order, distance, and on-time rate.
-   Quantity listed, quantity sold, and reported unsold/spoiled
    quantity.
-   User satisfaction and support/dispute resolution time.

Do not state a percentage increase in farmer income or reduction in
consumer price without pilot evidence.

------------------------------------------------------------------------

## 5. Target Users and Roles

### 5.1 Farmer

A farmer or farm representative who sells produce.

**Can:** - Register and manage profile. - Add farm name, approximate
location, preferred language, and contact details. - Add, edit, pause,
or remove product listings. - Set price, quantity, unit, minimum order
quantity, availability, and harvest date. - View incoming orders and
accept or reject with a reason. - Update preparation and handover
status. - View sales, order history, fees, and estimated payout
status. - Receive notifications and buyer messages. - Report issues.

**Should not be required to:** - Use complex analytics to list a
product. - Share a precise home address publicly. - Accept an order
before confirming stock.

### 5.2 Consumer

An individual or household purchasing produce.

**Can:** - Register or browse as a guest if enabled. - Set delivery area
or pickup preference. - Search and filter listings. - View seller
profile, product details, price, quantity, and availability. - Add
products to cart, choose quantity, and place an order. - Select delivery
slot or pickup point. - Pay using enabled methods. - Track orders,
cancel within policy, request support, and rate completed orders.

### 5.3 Retailer / Restaurant / Institutional Buyer

A business purchasing regular or bulk produce.

**Can:** - Create a buyer business profile. - Search by crop, quantity,
location, and availability. - Submit bulk or recurring purchase
requests. - Request a quotation for large orders. - Save favourite farms
and repeat past orders. - View invoices/order summaries and order
history.

Bulk pricing should be negotiated or configured transparently; the
system should not assume a single fixed discount.

### 5.4 Delivery Partner

A person or local logistics provider responsible for fulfilment.

**Can:** - View assigned jobs. - Accept or decline assignments if the
model allows. - View pickup and drop-off instructions. - Update pickup,
in-transit, delivered, and failed-delivery status. - Record proof of
delivery where appropriate. - Contact support about delays or route
issues.

Delivery partners should only see the personal information necessary to
complete assigned deliveries.

### 5.5 Administrator

The platform operator.

**Can:** - Review and verify farmer/business accounts. - Manage user
access and roles. - Moderate product listings and reported content. -
View and manage orders, cancellations, refunds, and disputes. -
Configure categories, units, service areas, fees, and delivery
settings. - Manage reference-price data sources. - View dashboards and
export authorized reports. - Review audit logs and operational alerts.

Admin actions that affect payments, account status, or disputes should
be logged.

------------------------------------------------------------------------

## 6. Core Features

### A. Authentication and onboarding

-   Mobile/email registration with OTP or secure authentication
    provider.
-   Role selection: farmer, consumer, business buyer, delivery partner.
-   Profile completion wizard.
-   Farmer profile verification workflow with status: `not_submitted`,
    `pending`, `verified`, `rejected`, `needs_information`.
-   Language preference (Tamil / English initially).
-   Consent and privacy notice.
-   Secure sign-out and account recovery.

For a hackathon demo, use test accounts and clearly label mock
verification or payment flows.

### B. Farmer profile and farm page

-   Farm name and short description.
-   Farmer display name.
-   Approximate farm location / service area.
-   Main crops and farming categories.
-   Profile image or farm photo.
-   Verification status.
-   Active listings.
-   Ratings/reviews after completed orders.
-   Preferred order fulfilment options.

Do not display a farmer's precise private address publicly. Share pickup
instructions only with the relevant buyer after order confirmation, when
needed.

### C. Product catalog and inventory

Each listing should support:

-   Product name and crop category.
-   Product image(s).
-   Description and visible condition/grade if farmer-supplied.
-   Price per unit (kg, bunch, piece, litre, bag, etc.).
-   Available quantity.
-   Minimum order quantity.
-   Optional maximum quantity per buyer.
-   Harvested-on or expected-availability date.
-   Listing expiry date.
-   Pickup/delivery availability.
-   Approximate farm area.
-   Active / paused / sold-out status.

Inventory should be updated safely when orders are accepted. Avoid
overselling by reserving quantity during checkout or confirmation and
releasing it if the order expires or is cancelled under policy.

### D. Buyer marketplace

-   Home page with search and category browsing.
-   Nearby produce based on buyer-selected location.
-   Filters: category, price range, distance/service area, availability,
    seller, fulfilment method.
-   Sort: relevance, price, newest, nearest (only if location data is
    available and permission is granted).
-   Product details page.
-   Farmer profile page.
-   Cart and quantity controls.
-   Saved/favourite listings.
-   Similar products or alternative sellers.
-   Clear empty, loading, and error states.

### E. Order management

Suggested order lifecycle:

`cart` → `pending_farmer_confirmation` → `accepted` → `preparing` →
`ready_for_pickup` → `picked_up` → `in_transit` → `delivered` →
`completed`

Other terminal or exception statuses:

`rejected`, `cancelled`, `payment_failed`, `refund_pending`, `refunded`,
`delivery_failed`, `disputed`

Not every order uses every status. Pickup orders can skip delivery-only
states.

Every status change should include: - Timestamp. - Actor (farmer, buyer,
delivery partner, admin, system). - Optional reason/note. - Relevant
order ID.

### F. Transparent checkout and payments

Show a price breakdown before placing an order:

-   Produce subtotal.
-   Delivery fee, if applicable.
-   Platform fee, if applicable.
-   Discount, if applicable.
-   Taxes, if applicable and properly configured.
-   Total payable.

Payment options depend on actual provider configuration. Integrate a
payment gateway only after credentials and merchant onboarding are
ready. Never store card numbers, CVV, UPI PIN, passwords, or payment
secrets in the app database.

For the MVP, a clearly labelled simulated payment flow is acceptable for
demonstration, but it must not be represented as a real transaction.

### G. Delivery and pickup

-   Buyer chooses farm pickup, collection point, or delivery where
    supported.
-   Delivery zones and serviceable pincodes/areas.
-   Delivery slot selection.
-   Farmer marks order ready.
-   Delivery assignment (manual for MVP; automatic later).
-   Delivery status timeline.
-   Route planning using a real routing service when configured.
-   Delivery fee estimate displayed before checkout.
-   Failed delivery and rescheduling workflow.
-   Proof of delivery, such as buyer confirmation or delivery OTP, if
    appropriate.

For an initial pilot, limit delivery to a small area and allow farm
pickup to reduce operational complexity.

### H. Notifications and messaging

-   New order notification to farmer.
-   Farmer accepted/rejected notification to buyer.
-   Payment status notification.
-   Preparation and delivery updates.
-   Low-stock / listing expiry reminder.
-   Cancellation, refund, and dispute updates.
-   In-app message thread or structured contact workflow.

Push notifications should be supplemental; the order status in the app
remains the source of truth.

### I. Ratings, reviews, and trust

-   Only buyers with completed orders can review that order.
-   Review text and rating moderation.
-   Report listing/user option.
-   Dispute form with order reference and reason.
-   Verified badge only after a real verification process.
-   Avoid publishing unverified quality claims or AI-generated
    certifications.

### J. Dashboards and reports

**Farmer dashboard:** - Active listings. - Pending orders. -
Today's/weekly/monthly sales. - Completed orders. - Estimated net amount
after disclosed fees. - Low-stock and expiring listings. - Popular
products and buyer trends.

**Buyer dashboard:** - Active orders. - Past purchases. - Saved
farms/products. - Reorder shortcut. - Refund/support status.

**Admin dashboard:** - Total users by role. - Verification queue. -
Active listings. - Orders by status. - Sales volume (clearly distinguish
gross order value from platform revenue). - Delivery performance. -
Complaints/disputes. - Usage and operational trends.

------------------------------------------------------------------------

## 7. AI and Smart Features

AI should be introduced after the core marketplace has useful, reliable
data. For the first prototype, simple rule-based insights can be used
and labelled as such.

### 7.1 Price recommendation

**Purpose:** Give farmers a reference range, not dictate their price.

**Possible inputs:** - Crop/product type. - Unit and grade (if known). -
Region/market. - Date/season. - Available public market-price
observations. - Recent FarmBridge completed transactions, once enough
exist. - Supply and demand signals.

**Output:** - Suggested reference range. - Source and timestamp of
reference data. - Factors considered. - Clear notice that actual prices
vary by quality, location, quantity, and market conditions.

**MVP approach:** 1. Begin with admin-entered or legally reusable public
reference data. 2. Display the reference source and last-updated time.
3. Compare a farmer's proposed price with the reference range. 4. Do not
block the farmer from setting another price. 5. Add an ML model only
after sufficient quality-labelled historical records are available.

### 7.2 Crop demand insights

**Purpose:** Show which products are receiving interest in a selected
area.

**Possible inputs:** - Searches and product views (aggregated). - Cart
additions. - Completed orders. - Seasonal patterns. - Product
availability. - Buyer type and area at an appropriately aggregated
level.

**MVP output:** - Trending products based on recent platform activity. -
Weekly order counts. - Demand direction (increasing / stable /
decreasing) only when supported by enough data. - Suggested listing
reminders, not planting instructions.

Avoid making agricultural planting or financial guarantees from limited
marketplace data.

### 7.3 Smart delivery grouping

**Purpose:** Help coordinate nearby orders to reduce avoidable distance
and cost.

**MVP:** - Group orders by service area and delivery slot. - Show a
suggested stop order using a routing API or a basic distance
heuristic. - Allow an operator/driver to adjust the route. - Display
estimated distance/time as estimates.

### 7.4 AI-assisted quality photo review (future)

An image model may flag visible damage or unusual appearance, but visual
checks are not a substitute for human inspection or official grading.
Keep this feature out of the MVP unless it can be responsibly tested.

### 7.5 Tamil voice assistance (future / optional)

-   Speech-to-text for product listing and search.
-   Read-aloud support for important status messages.
-   Clear confirmation before submitting a listing or order.
-   Fallback to normal text input.

------------------------------------------------------------------------

## 8. End-to-End Workflows

### Workflow 1: Farmer onboarding and listing

1.  Farmer opens FarmBridge.
2.  Selects Tamil or English.
3.  Registers / signs in.
4.  Selects the Farmer role.
5.  Completes farm profile and approximate location.
6.  Submits any required verification information.
7.  Verification status is shown clearly.
8.  Opens "Add Produce".
9.  Enters product name, category, image, price, unit, quantity, and
    availability.
10. Selects pickup/delivery options.
11. Previews listing and confirms.
12. Listing becomes visible according to the configured verification
    rules.
13. Farmer can edit, pause, mark sold out, or renew the listing.

**Key validations:** Price must be positive; quantity must be
non-negative; unit must be selected; availability must be valid; image
upload must meet file limits.

### Workflow 2: Consumer order

1.  Buyer opens marketplace.
2.  Chooses location/service area or grants location permission.
3.  Searches or browses products.
4.  Opens a product and reviews farmer, price, unit, availability, and
    fulfilment options.
5.  Selects quantity.
6.  Adds product to cart.
7.  System checks current stock and serviceability.
8.  Buyer selects pickup/delivery and available slot.
9.  Checkout displays full price breakdown.
10. Buyer confirms order and completes enabled payment flow.
11. Order is created as pending farmer confirmation (or the configured
    equivalent).
12. Farmer receives notification.
13. Buyer sees order timeline and updates.

### Workflow 3: Farmer accepts and fulfils an order

1.  Farmer opens pending order.
2.  Reviews requested quantity, fulfilment option, and buyer
    instructions.
3.  Accepts or rejects with a reason.
4.  On acceptance, inventory is reserved/adjusted consistently.
5.  Farmer prepares the produce.
6.  Marks order ready for pickup or delivery.
7.  For delivery, assigned partner receives the job.
8.  Partner confirms pickup and updates status.
9.  Buyer receives delivery progress.
10. Buyer confirms receipt or reports an issue.
11. Order is marked completed according to the configured confirmation
    policy.
12. Payment/payout status is updated by the payment integration or
    clearly labelled demo logic.
13. Buyer may submit a review.

### Workflow 4: Retailer / restaurant bulk request

1.  Business buyer creates a business profile.
2.  Searches listings by crop, quantity, area, and availability.
3.  Selects a listing or submits a bulk requirement.
4.  Farmer reviews requested quantity, delivery/pickup details, and
    proposed terms.
5.  Farmer responds with availability and price/quotation.
6.  Buyer accepts or requests a change.
7.  An order is created and processed using the standard order
    lifecycle.
8.  Business buyer can repeat the order or save the farmer.

### Workflow 5: Delivery partner fulfilment

1.  Admin or system assigns a delivery task.
2.  Delivery partner reviews pickup and drop-off information.
3.  Partner accepts the task.
4.  Partner navigates to pickup point.
5.  Confirms pickup.
6.  Updates in-transit status.
7.  Reaches buyer and completes delivery using confirmation method.
8.  If unsuccessful, selects a failure reason and notifies support.
9.  Order and delivery history are updated.

### Workflow 6: Cancellation, refund, and dispute

1.  Buyer or farmer requests cancellation according to the order state
    and policy.
2.  System checks whether cancellation is allowed.
3.  Other party is notified when required.
4.  Order status and inventory reservation are updated.
5.  If money was collected, refund is initiated through the configured
    payment provider or flagged for manual review.
6.  Buyer can open a dispute with reason and supporting details.
7.  Admin reviews the order timeline and available evidence.
8.  Admin records resolution and reason.
9.  All actions are timestamped in the audit trail.

### Workflow 7: Admin verification and moderation

1.  Admin opens verification queue.
2.  Reviews submitted farmer/business information.
3.  Approves, rejects, or requests additional information.
4.  User receives a status notification.
5.  Admin reviews reported listings or accounts.
6.  Takes an appropriate action with a recorded reason.
7.  System records actor, time, and action.

------------------------------------------------------------------------

## 9. Application Pages and Navigation

### Public / shared

-   Landing page.
-   About FarmBridge.
-   How it works.
-   Marketplace.
-   Product details.
-   Farmer/store profile.
-   Login / registration.
-   Help / contact / policies.

### Farmer portal

-   Farmer dashboard.
-   My farm profile.
-   My listings.
-   Add / edit produce.
-   Inventory.
-   Orders.
-   Order details.
-   Sales and earnings.
-   Price insights.
-   Messages / notifications.
-   Support and settings.

### Buyer portal

-   Buyer home.
-   Marketplace and search.
-   Product details.
-   Cart.
-   Checkout.
-   Order confirmation.
-   My orders.
-   Order tracking.
-   Favourite farms.
-   Reviews.
-   Support and profile.

### Business buyer portal

-   Business dashboard.
-   Bulk requirements.
-   Quotations.
-   Saved suppliers.
-   Repeat orders.
-   Purchase history.

### Delivery portal

-   Assigned deliveries.
-   Delivery details.
-   Pickup confirmation.
-   Route view.
-   Delivery status.
-   Completed / failed deliveries.

### Admin portal

-   Admin overview.
-   User management.
-   Farmer verification.
-   Listing moderation.
-   Orders.
-   Delivery operations.
-   Payments and refunds.
-   Disputes.
-   Categories and service areas.
-   Price reference management.
-   Analytics and reports.
-   Audit logs.
-   Platform settings.

------------------------------------------------------------------------

## 10. Suggested Technology Stack

Choose the tools based on the team's experience and actual deployment
requirements.

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React + TypeScript      Responsive user
                                                  interfaces

  Styling                 Tailwind CSS            Consistent, responsive
                                                  design

  UI components           Accessible React        Reusable forms,
                          component library       dialogs, tables,
                                                  navigation

  Backend                 Python + FastAPI        REST APIs and business
                                                  logic

  Database                Supabase PostgreSQL     Structured marketplace
                                                  data

  Authentication          Supabase Auth           Sign-in and user
                                                  sessions

  Authorization           PostgreSQL Row Level    Role and data access
                          Security + backend      control
                          checks                  

  File storage            Supabase Storage        Product and profile
                                                  images

  Data validation         Pydantic                API request/response
                                                  validation

  AI / analytics          Python, Pandas, NumPy,  Data preparation and
                          scikit-learn            initial models

  Maps                    OpenStreetMap + Leaflet Map display

  Routing                 OSRM or another         Route estimates
                          configured routing      
                          service                 

  Payments                Razorpay or another     Real payment processing
                          approved provider       when enabled

  Notifications           Firebase Cloud          Push and transactional
                          Messaging / email       alerts
                          provider                

  Charts                  Recharts or equivalent  Dashboards and
                                                  analytics

  Testing                 Pytest, frontend test   API and UI testing
                          framework, Postman      

  Version control         Git + GitHub            Collaboration and
                                                  source history

  Deployment              Vercel (frontend),      Hosting
                          Render or equivalent    
                          (API)                   

  Design                  Figma                   UI/UX planning
  -----------------------------------------------------------------------

### Environment configuration

Keep secrets in environment variables, never in source code or
client-side bundles.

Example variable names (use placeholders only):

``` env
# Frontend
VITE_API_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Backend
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
PAYMENT_PROVIDER_KEY_ID=
PAYMENT_PROVIDER_KEY_SECRET=
MAPS_OR_ROUTING_API_KEY=
```

The Supabase service-role key and payment secrets must only be used on
the server. Do not commit `.env` files. Add `.env.example` with blank or
dummy values.

------------------------------------------------------------------------

## 11. High-Level System Architecture

``` text
 Farmer Web/PWA       Buyer Web/PWA       Delivery Portal       Admin Portal
       |                    |                    |                    |
       +--------------------+--------------------+--------------------+
                                    |
                           React + TypeScript
                                    |
                              HTTPS REST API
                                    |
                              FastAPI Backend
                                    |
        +---------------------------+---------------------------+
        |                           |                           |
  Authentication              Marketplace                  Operations
  and authorization           and inventory                and logistics
        |                           |                           |
        +---------------------------+---------------------------+
                                    |
                            Supabase PostgreSQL
                                    |
             +----------------------+----------------------+
             |                      |                      |
       Supabase Storage       AI / Analytics         Integrations
       Product images         Price insights         Payments
       Profile images         Demand trends           Maps / routing
                              Reports                 Notifications
```

### Backend responsibilities

-   Validate all incoming requests.
-   Enforce role-based permissions.
-   Verify listing availability and inventory.
-   Calculate order totals on the server.
-   Manage order status transitions.
-   Integrate payment provider securely.
-   Log important operations.
-   Return clear errors and avoid exposing secrets or private data.

The frontend must not be trusted to calculate authoritative prices,
approve payments, or grant roles.

------------------------------------------------------------------------

## 12. Suggested Database Design

Use UUID primary keys and timestamps. Add indexes for commonly searched
fields and foreign keys. Exact schema can be refined during
implementation.

### `profiles`

-   `id` (UUID; matches authenticated user ID)
-   `role` (`farmer`, `consumer`, `business`, `delivery`, `admin`)
-   `display_name`
-   `phone` (protected)
-   `email` (if used)
-   `preferred_language`
-   `avatar_path`
-   `verification_status`
-   `created_at`
-   `updated_at`

### `farms`

-   `id`
-   `owner_id` → profiles
-   `farm_name`
-   `description`
-   `region`
-   `district`
-   `pincode` (if needed)
-   `approx_latitude` / `approx_longitude` (optional; avoid public
    precision)
-   `pickup_instructions` (private)
-   `created_at`

### `products`

-   `id`
-   `farmer_id` → profiles
-   `farm_id` → farms
-   `name`
-   `category_id`
-   `description`
-   `image_paths`
-   `price`
-   `unit`
-   `available_quantity`
-   `minimum_order_quantity`
-   `availability_date`
-   `expiry_at` (optional)
-   `fulfilment_options`
-   `status`
-   `created_at`
-   `updated_at`

### `categories`

-   `id`
-   `name`
-   `parent_id` (optional)
-   `is_active`

### `carts` and `cart_items`

-   Cart owner and cart state.
-   Product ID, selected quantity, and last observed price.
-   Revalidate current price and stock at checkout.

### `orders`

-   `id`
-   `buyer_id`
-   `farmer_id`
-   `order_number`
-   `status`
-   `fulfilment_type` (`pickup`, `delivery`, `collection_point`)
-   `delivery_area`
-   `delivery_address_id` (private reference, where applicable)
-   `subtotal`
-   `delivery_fee`
-   `platform_fee`
-   `tax_amount` (if applicable)
-   `discount_amount`
-   `total_amount`
-   `currency`
-   `payment_status`
-   `created_at`
-   `updated_at`

For the MVP, one farmer per order simplifies fulfilment. A multi-farmer
cart can be split into separate farmer orders during checkout.

### `order_items`

-   `id`
-   `order_id`
-   `product_id`
-   `product_name_snapshot`
-   `unit_snapshot`
-   `unit_price_snapshot`
-   `quantity`
-   `line_total`

Snapshots preserve what was ordered if a listing changes later.

### `order_events`

-   `id`
-   `order_id`
-   `actor_id`
-   `event_type`
-   `from_status`
-   `to_status`
-   `note`
-   `created_at`

### `payments`

-   `id`
-   `order_id`
-   `provider`
-   `provider_payment_reference`
-   `amount`
-   `currency`
-   `status`
-   `created_at`
-   `updated_at`

Do not store sensitive payment credentials or card details.

### `delivery_tasks`

-   `id`
-   `order_id`
-   `delivery_partner_id`
-   `status`
-   `pickup_time`
-   `delivered_time`
-   `route_reference` (optional)
-   `proof_reference` (optional)
-   `failure_reason` (optional)

### `reviews`

-   `id`
-   `order_id`
-   `buyer_id`
-   `farmer_id`
-   `rating`
-   `review_text`
-   `moderation_status`
-   `created_at`

### `price_references`

-   `id`
-   `product/category`
-   `market_name`
-   `region`
-   `unit`
-   `reference_price`
-   `source_name`
-   `source_url` (if applicable)
-   `observed_at`
-   `created_at`

### `notifications`

-   `id`
-   `user_id`
-   `title`
-   `message`
-   `type`
-   `read_at`
-   `created_at`

### `disputes`

-   `id`
-   `order_id`
-   `opened_by`
-   `reason`
-   `description`
-   `status`
-   `resolution`
-   `resolved_by`
-   `created_at`
-   `resolved_at`

### `audit_logs`

-   `id`
-   `actor_id`
-   `action`
-   `entity_type`
-   `entity_id`
-   `metadata` (avoid sensitive information)
-   `created_at`

------------------------------------------------------------------------

## 13. Important Business Rules

1.  A farmer can create and manage only their own farm and listings.
2.  A buyer can view only their own private orders, addresses, and
    payment details.
3.  A delivery partner can view only assigned delivery tasks and the
    information needed to fulfil them.
4.  Admin access must be restricted and auditable.
5.  Users must not be able to change their own role to admin.
6.  Product price, availability, fees, and total must be revalidated
    server-side at checkout.
7.  Stock must not be oversold when two buyers order at the same time.
8.  A farmer must confirm an order if availability is not guaranteed.
9.  Order state changes must follow permitted transitions.
10. Payment success must be verified server-side with the provider;
    never rely only on a frontend success screen.
11. Refunds must follow the configured payment provider workflow and
    platform policy.
12. Reviews should be tied to completed orders.
13. All displayed charges must be disclosed before order confirmation.
14. AI outputs must be marked as estimates and show their source or
    limitations.
15. Public pages must not reveal sensitive personal information or
    precise private addresses.

------------------------------------------------------------------------

## 14. UI/UX Design Direction for Antigravity

### Visual style

Create a polished, modern AgriTech product---not a generic ecommerce
template.

-   **Brand:** FarmBridge
-   **Theme:** Fresh, trustworthy, accessible, rural-friendly,
    professional.
-   **Suggested palette:**
    -   Deep leaf green: `#1F6B45`
    -   Fresh green: `#3C9B62`
    -   Soft mint: `#EAF5ED`
    -   Warm off-white: `#FAFBF7`
    -   Charcoal: `#202820`
    -   Muted text: `#68736B`
    -   Amber accent: `#E7A83E`
-   Use green as the main action colour, with accessible contrast.
-   Use clean typography, rounded cards, subtle borders, clear icons,
    and meaningful whitespace.
-   Use genuine-looking agricultural imagery, but avoid fake
    certification badges or misleading claims.
-   Design mobile-first, especially for farmer screens.
-   Support Tamil and English labels and longer translated text.
-   Use responsive desktop layouts for admin and business buyers.
-   Use skeleton loaders, empty states, validation feedback, and clear
    success/error messages.
-   Avoid excessive gradients, glassmorphism, animated backgrounds, and
    crowded dashboards.

### Navigation

**Public/buyer navigation:** Home, Marketplace, Categories, How it
Works, Orders, Cart, Profile.

**Farmer navigation:** Dashboard, My Products, Add Produce, Orders,
Sales, Price Insights, Messages, Profile.

**Admin navigation:** Overview, Users, Verification, Listings, Orders,
Deliveries, Payments, Disputes, Analytics, Settings.

Use role-aware navigation after authentication.

### Key screens to design

1.  Landing page with value proposition, "Explore Produce" and "Join as
    Farmer" actions.
2.  Sign-up and role selection.
3.  Farmer onboarding wizard.
4.  Farmer dashboard with order summary, listings, sales and quick
    actions.
5.  Add/edit product form.
6.  Farmer product management table/cards.
7.  Consumer marketplace with search, category filters and location
    selection.
8.  Product detail with seller, price/unit, availability, quantity
    selector and fulfilment options.
9.  Cart and transparent checkout.
10. Order confirmation and order timeline.
11. Delivery task dashboard.
12. Admin overview and verification queue.
13. Price insights screen with source and timestamp.
14. Tamil-language experience.
15. Profile, help, and dispute flows.

------------------------------------------------------------------------

## 15. MVP Scope

Build a working end-to-end vertical slice before adding advanced AI.

### Must-have MVP

-   Role-based sign-in (farmer, buyer, admin; delivery can be simulated
    initially).
-   Farmer profile.
-   Create/edit/pause produce listings.
-   Marketplace with search and filters.
-   Product details.
-   Cart and checkout.
-   Order creation and farmer acceptance/rejection.
-   Stock consistency.
-   Order status timeline.
-   Basic admin user/listing/order management.
-   Responsive design.
-   Seed/demo data and clear test instructions.

### Should-have

-   Tamil and English UI.
-   Image upload.
-   Pickup and delivery choice.
-   Notifications.
-   Transparent fee breakdown.
-   Farmer sales dashboard.
-   Reviews after completed orders.

### Could-have / later

-   Real payment gateway and payout workflow.
-   Automated delivery partner assignment.
-   Advanced route optimization.
-   ML price recommendation.
-   Crop demand forecasting.
-   Voice assistant.
-   Photo-based quality assistance.
-   Bulk procurement and recurring orders.
-   Offline-first capabilities.

**Hackathon guidance:** If time is limited, implement the Must-have
items with seeded sample listings. Add one AI feature as a demonstrable
prototype and clearly label it as an estimate or demo where appropriate.

------------------------------------------------------------------------

## 16. Suggested API Endpoints

Use REST endpoints with request validation, authentication, and
role-based authorization.

### Authentication / profiles

-   `GET /api/v1/me`
-   `PATCH /api/v1/me`
-   `GET /api/v1/profiles/{id}` (public-safe fields only)
-   `POST /api/v1/farms`
-   `GET /api/v1/farms/{id}`
-   `PATCH /api/v1/farms/{id}`

### Products

-   `GET /api/v1/products`
-   `GET /api/v1/products/{id}`
-   `POST /api/v1/products` (farmer)
-   `PATCH /api/v1/products/{id}` (owner/admin)
-   `POST /api/v1/products/{id}/pause`
-   `POST /api/v1/products/{id}/mark-sold-out`

### Cart / orders

-   `GET /api/v1/cart`
-   `POST /api/v1/cart/items`
-   `PATCH /api/v1/cart/items/{id}`
-   `DELETE /api/v1/cart/items/{id}`
-   `POST /api/v1/orders`
-   `GET /api/v1/orders`
-   `GET /api/v1/orders/{id}`
-   `POST /api/v1/orders/{id}/accept`
-   `POST /api/v1/orders/{id}/reject`
-   `POST /api/v1/orders/{id}/cancel`
-   `POST /api/v1/orders/{id}/status`

### Delivery

-   `GET /api/v1/delivery/tasks`
-   `POST /api/v1/delivery/tasks/{id}/accept`
-   `POST /api/v1/delivery/tasks/{id}/status`

### AI / insights

-   `GET /api/v1/insights/price-reference`
-   `GET /api/v1/insights/demand`
-   `POST /api/v1/insights/price-estimate` (estimate only)

### Admin

-   `GET /api/v1/admin/overview`
-   `GET /api/v1/admin/verifications`
-   `POST /api/v1/admin/verifications/{id}/decision`
-   `GET /api/v1/admin/disputes`
-   `POST /api/v1/admin/disputes/{id}/resolve`

Return consistent error structures and appropriate HTTP status codes.
Document APIs using FastAPI's OpenAPI/Swagger support.

------------------------------------------------------------------------

## 17. Security, Privacy, and Reliability

-   Use HTTPS in deployment.
-   Use managed authentication or secure password handling; do not store
    plaintext passwords.
-   Enforce authorization on the backend and database.
-   Configure Supabase Row Level Security policies.
-   Keep service-role and payment secrets server-side.
-   Validate file type and size for uploads.
-   Restrict image uploads to safe formats and use generated storage
    paths.
-   Rate-limit sensitive endpoints such as login, OTP, checkout, and
    messaging.
-   Validate prices and quantities server-side.
-   Use payment webhooks with signature verification and idempotency.
-   Use database transactions or atomic operations for stock reservation
    and order creation.
-   Log security-relevant admin actions.
-   Minimize collection of personal data.
-   Use approximate location for discovery and keep exact addresses
    private.
-   Provide privacy, cancellation, refund, and support policies.
-   Back up production data and test recovery.
-   Use environment-specific configuration for development, staging, and
    production.

------------------------------------------------------------------------

## 18. Testing Plan

### Functional tests

-   Farmer can register and create a farm profile.
-   Farmer can create, update, pause, and mark a listing sold out.
-   Buyer can search, filter, add to cart, and place an order.
-   Checkout rejects invalid quantities and unavailable stock.
-   Farmer can accept/reject an order.
-   Buyer sees valid order status updates.
-   Delivery partner can access only assigned tasks.
-   Admin can verify users and resolve disputes.
-   Reviews are allowed only for eligible completed orders.

### Edge cases

-   Two buyers attempt to purchase the last available quantity.
-   Product price changes after being added to cart.
-   Farmer rejects an order.
-   Payment fails or webhook arrives more than once.
-   Buyer cancels after preparation begins.
-   Delivery fails or is delayed.
-   Image upload fails.
-   Network disconnects during checkout.
-   Unauthorized user attempts to access another user's order.
-   Empty marketplace, no search results, and expired listing.

### Usability tests

-   A first-time farmer can create a listing with minimal assistance.
-   Forms are usable on a low-cost Android phone.
-   Tamil labels fit without clipping.
-   Buttons and inputs are accessible and easy to tap.
-   Error messages explain how to recover.

------------------------------------------------------------------------

## 19. Development Roadmap

### Stage 1 --- Design and foundation

-   Create app structure and design tokens.
-   Build responsive navigation and role-based layouts.
-   Configure Supabase and FastAPI.
-   Set up database migrations and authentication.

### Stage 2 --- Farmer listing

-   Farmer onboarding and profile.
-   Product CRUD and image storage.
-   Inventory validation.
-   Farmer dashboard.

### Stage 3 --- Buyer marketplace

-   Browse, search, filter, product detail.
-   Cart and quantity management.
-   Buyer profile and saved locations.

### Stage 4 --- Orders

-   Checkout and server-side totals.
-   Order creation and farmer response.
-   Status timeline and inventory reservation.
-   Cancellation rules.

### Stage 5 --- Operations

-   Admin dashboard.
-   Verification and moderation.
-   Delivery task workflow.
-   Notifications and basic reports.

### Stage 6 --- Intelligence

-   Reference-price display.
-   Demand insights from actual or clearly labelled sample data.
-   Route grouping and estimated travel.
-   Evaluate whether there is enough data for an ML model.

### Stage 7 --- Pilot readiness

-   Security review.
-   Functional and edge-case testing.
-   Demo data cleanup.
-   User testing with a small group.
-   Document known limitations and next steps.

------------------------------------------------------------------------

## 20. Demo Scenario

Use this scenario to demonstrate the product to judges or reviewers:

1.  A farmer signs in and opens the farmer dashboard.
2.  The farmer lists 50 kg of tomatoes at a chosen price per kilogram,
    with today's availability.
3.  A consumer opens the marketplace, selects the local area, and finds
    the tomato listing.
4.  The consumer opens the product, selects 2 kg, and adds it to the
    cart.
5.  Checkout shows produce subtotal and any configured delivery/platform
    fees.
6.  The consumer places a demo order.
7.  The farmer receives the order and accepts it.
8.  Inventory is updated to reflect the accepted order.
9.  The farmer marks the order as ready for pickup or delivery.
10. The order timeline updates for the buyer.
11. The buyer confirms receipt and submits a review.
12. The farmer dashboard reflects the completed order and earnings
    summary.
13. The admin dashboard shows the order and its status history.
14. Optionally, demonstrate a price reference or demand insight, clearly
    identifying whether the data is sample or real.

This demonstrates the core value: a direct digital connection from farm
listing to buyer fulfilment.

------------------------------------------------------------------------

# 21. Master Prompt for Google Antigravity

Copy the prompt below into Antigravity to generate the FarmBridge
application. Treat it as a project brief and implementation guide, not a
request to create only a static design.

``` text
You are a senior full-stack engineer, product designer, UX researcher, database architect, and AI/ML engineer. Build a polished, responsive AgriTech platform called FarmBridge.

PROJECT:
FarmBridge — AI-Powered Direct Farmer-to-Consumer Marketplace.

MISSION:
Build a trustworthy, mobile-first digital marketplace that connects farmers directly with consumers, retailers, and restaurants. Help farmers list produce, control their own selling prices, manage inventory, and receive orders. Help buyers discover local produce, compare transparent prices, and arrange pickup or delivery. Reduce unnecessary intermediary steps and improve market coordination.

IMPORTANT:
- Build a functional application, not just a static mockup.
- Prioritize an end-to-end MVP that can be run and demonstrated.
- Do not claim that AI, payments, maps, notifications, or verification are live unless they are actually integrated and tested.
- Where credentials or external services are unavailable, create a clearly labelled demo/mock mode and document how to enable the real integration.
- Do not invent real farmer listings, market prices, customer reviews, certifications, or impact statistics. Seed data must be clearly identified as demo data.
- Keep code modular, typed, maintainable, secure, and documented.
- Before making major assumptions, inspect the existing repository and preserve working functionality. Do not overwrite useful existing work without a reason.

TARGET USERS:
1. Farmer
2. Consumer
3. Retailer / Restaurant / Business buyer
4. Delivery partner
5. Admin

RECOMMENDED STACK:
- Frontend: React + TypeScript
- Styling: Tailwind CSS and accessible reusable components
- Backend: Python + FastAPI
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Authorization: backend role checks and Supabase Row Level Security
- File storage: Supabase Storage
- AI/data: Python, Pandas, NumPy, scikit-learn
- Maps: OpenStreetMap + Leaflet
- Routing: OSRM or a configurable routing provider
- Payments: Razorpay or configurable payment provider, only when credentials are supplied
- Notifications: Firebase Cloud Messaging or configurable notification provider
- Testing: Pytest and suitable frontend tests
- Deployment-ready configuration for frontend and backend

If the repository already uses a compatible stack, inspect it first and adapt without unnecessary rewrites. Never expose server secrets in frontend code.

BRAND AND DESIGN:
- Product name: FarmBridge
- Visual identity: fresh, trustworthy, modern, accessible AgriTech.
- Primary green: #1F6B45
- Secondary green: #3C9B62
- Soft mint: #EAF5ED
- Warm background: #FAFBF7
- Main text: #202820
- Muted text: #68736B
- Accent amber: #E7A83E
- Use clear typography, consistent spacing, rounded cards, subtle borders, and clean icons.
- Avoid generic template appearance, excessive gradients, excessive glassmorphism, and cluttered dashboards.
- Mobile-first, especially farmer workflows. Desktop-friendly admin and business buyer dashboards.
- Include Tamil and English language structure. At minimum, implement language switching for the key interface strings if feasible.
- Make buttons, form fields, dialogs, and navigation keyboard accessible with visible focus states.
- Provide loading, empty, error, success, and offline/network-failure states.
- Use realistic agricultural imagery where available, but do not imply that stock images are actual platform farmers.

CORE MVP FEATURES:

A. AUTHENTICATION AND ROLE MANAGEMENT
- Sign up / sign in / sign out.
- Role selection: farmer, consumer, business buyer, delivery partner.
- Admin role assigned only through a secure server-side process; users cannot promote themselves.
- Profile completion and preferred language.
- Role-aware navigation and protected pages.
- If external auth configuration is absent, provide a clearly labelled local demo mode, never fake production security.

B. FARMER EXPERIENCE
- Farmer dashboard with active listings, pending orders, completed orders, sales summary, and quick actions.
- Farm profile with farm name, description, approximate region, crops, and fulfilment options.
- Add/edit/pause/relist product.
- Product fields: name, category, description, image, price, unit, quantity, minimum order quantity, availability/harvest date, and pickup/delivery option.
- Inventory view with available, reserved, and sold quantities where appropriate.
- Incoming order list with details and accept/reject actions.
- Order preparation and ready-for-pickup/delivery status.
- Sales/earnings summary with transparent fee breakdown.
- Price insight page showing references, source, timestamp, and estimate limitations.
- Tamil/English language support.

C. BUYER EXPERIENCE
- Marketplace home with search, crop categories, location/service-area selection, and nearby listings.
- Filters for crop, price range, availability, seller, and fulfilment option.
- Product detail page with farmer/farm profile, listing details, price per unit, available quantity, and harvest/availability date.
- Cart with quantity validation and stock recheck.
- Checkout with delivery/pickup selection and full price breakdown.
- Place order and see order confirmation.
- My orders with status timeline.
- Favourite farms/products and reorder shortcut.
- Review completed orders only.
- Support and dispute flow.

D. BUSINESS BUYER
- Business profile.
- Bulk produce search and requests.
- Request quotation for large orders.
- Save suppliers and repeat orders.
- Clear minimum quantities and negotiated terms.

E. DELIVERY
- Delivery task list and task detail.
- Assigned jobs only.
- Pickup, in-transit, delivered, and failed status updates.
- Route view if routing provider is configured.
- Pickup/collection point support.
- Delivery partner must see only data required to complete assigned jobs.

F. ADMIN
- Dashboard with users by role, listings, orders by status, delivery performance, verification queue, and disputes.
- Farmer/business verification: pending, verified, rejected, needs information.
- Listing moderation and report handling.
- Order lookup and status history.
- Dispute resolution with recorded reason.
- Manage categories, service areas, reference price records, and platform fees.
- Audit logs for sensitive admin actions.
- Do not expose payment secrets or unnecessary user data.

G. MARKETPLACE AND ORDER RULES
- Farmers set their own product prices.
- Show all applicable fees before buyer confirms.
- Revalidate product price, availability, quantity, and serviceability on the backend at checkout.
- Prevent overselling using safe database transactions or atomic stock reservation.
- For the MVP, one farmer per order is acceptable. If cart contains items from multiple farmers, split into separate farmer orders or clearly restrict cart behavior.
- Order lifecycle should support:
  pending_farmer_confirmation -> accepted -> preparing -> ready_for_pickup -> picked_up -> in_transit -> delivered -> completed
- Also support rejected, cancelled, payment_failed, refund_pending, refunded, delivery_failed, and disputed where relevant.
- Pickup orders may skip delivery-only states.
- Store order event history with actor and timestamp.
- Cancellation/refund rules should be explicit and state-aware.
- Never trust client-only payment success; verify payment server-side if a real gateway is enabled.

H. AI FEATURES
Implement a simple, honest AI/analytics foundation:
1. Price recommendation:
   - Show a reference range using configured price data or clearly labelled demo values.
   - Show source and last-updated timestamp.
   - Farmers can choose any allowed price; recommendation must not force a price.
   - If there is insufficient real data, use transparent rule-based reference logic instead of claiming an ML prediction.
2. Demand insights:
   - Use platform activity such as aggregated views, cart additions, and completed orders when available.
   - Demo mode may use clearly labelled sample data.
   - Show trends only when sample size supports them.
3. Delivery grouping:
   - Group orders by area and time slot.
   - Use a configured routing service if available; otherwise show a clearly labelled approximate route or manual ordering.
4. Future-ready interfaces for Tamil voice assistance and image-based product inspection, but do not fabricate a working model.

PAGES TO BUILD:
Public:
- Landing page
- How it works
- Marketplace
- Product detail
- Farmer/farm public profile
- Sign in / register
- Help and policies

Farmer:
- Dashboard
- Farm profile
- My products
- Add/edit product
- Inventory
- Orders and order detail
- Sales and earnings
- Price insights
- Notifications/messages
- Settings

Buyer:
- Marketplace
- Product detail
- Cart
- Checkout
- Order confirmation
- My orders
- Order tracking
- Saved farms
- Reviews
- Profile/support

Business:
- Business dashboard
- Bulk requirements
- Quotations
- Saved suppliers
- Purchase history

Delivery:
- Assigned tasks
- Task detail
- Route view
- Delivery status
- Completed/failed jobs

Admin:
- Admin overview
- User management
- Verification queue
- Listing moderation
- Orders
- Delivery operations
- Payments/refunds status
- Disputes
- Analytics/reports
- Categories/service areas
- Price reference management
- Audit logs
- Settings

DATABASE:
Design PostgreSQL schema with UUID primary keys, foreign keys, timestamps, constraints, and indexes. Include at least:
- profiles
- farms
- categories
- products
- carts
- cart_items
- orders
- order_items (include product/price/unit snapshots)
- order_events
- payments (provider references/status only; no card data or secrets)
- delivery_tasks
- reviews
- price_references
- notifications
- disputes
- audit_logs

Apply appropriate Supabase RLS policies. Users can access only their own private records. Farmers can manage only their own farms and listings. Buyers can access only their own orders. Delivery partners can access only assigned tasks. Admin access must be secure and auditable. Never store plaintext passwords, card numbers, CVV, UPI PIN, or secret API keys.

API:
Create FastAPI routers and Pydantic schemas for:
- /api/v1/me
- /api/v1/farms
- /api/v1/products
- /api/v1/cart
- /api/v1/orders
- /api/v1/delivery/tasks
- /api/v1/insights/price-reference
- /api/v1/insights/demand
- /api/v1/admin/overview
- /api/v1/admin/verifications
- /api/v1/admin/disputes

Use consistent response and error formats, validate input, enforce authorization, and document endpoints through OpenAPI/Swagger.

UX DETAILS:
- Farmers should be able to add a basic product listing with minimal steps.
- Use clear labels, helper text, unit selectors, and inline validation.
- Use large touch targets and readable text.
- Do not require exact GPS location to browse.
- Keep private pickup address and buyer address restricted.
- Use friendly empty states such as “No products listed yet” with a direct “Add produce” action.
- Confirm destructive actions.
- Display currency as INR (₹) for the initial India pilot, but keep currency configurable.
- Use local date/time formatting.
- Make the platform responsive for phone, tablet, and desktop.
- Keep Tamil text layouts from clipping or overflowing.

DEMO DATA:
- Create clearly labelled sample farmers, products, buyers, and orders for local demonstration.
- Use plausible fictional data only and mark it as demo/sample.
- Do not use real personal phone numbers, addresses, or identities.
- Include one sample product such as tomatoes with a stated quantity and price for workflow testing.
- Make demo mode obvious to users and judges.

SECURITY AND QUALITY:
- Backend authorization on every protected operation.
- Supabase RLS.
- Server-side price and inventory validation.
- Safe stock reservation.
- Payment webhook signature validation and idempotency if real payment is integrated.
- File upload validation.
- Rate limiting for sensitive endpoints where feasible.
- Avoid logging secrets or unnecessary personal information.
- Add audit logs for admin decisions and important order/payment state changes.
- Use environment variables and .env.example.
- Never commit real credentials.
- Add basic automated tests for authorization, stock validation, order state transitions, and core endpoints.
- Add error handling, logging, and clear setup instructions.

DELIVERABLES:
1. A polished responsive frontend with role-aware navigation.
2. FastAPI backend with documented REST APIs.
3. Supabase SQL schema/migrations and RLS policy guidance.
4. Seed/demo data.
5. Working farmer-to-buyer order workflow.
6. Admin dashboard for core operations.
7. At least one clearly labelled AI/analytics prototype if time allows.
8. README with prerequisites, installation, environment variables, database setup, running frontend/backend, demo accounts, testing, deployment, and known limitations.
9. .env.example with placeholders only.
10. Screenshots or a concise demo walkthrough if supported by the environment.

IMPLEMENTATION ORDER:
1. Inspect repository and report existing stack/files.
2. Create a concise implementation plan.
3. Build design system and app shell.
4. Implement authentication/role-aware routes.
5. Implement farmer profile and product CRUD.
6. Implement buyer marketplace and product details.
7. Implement cart, checkout, and order lifecycle.
8. Implement farmer order management and inventory consistency.
9. Implement admin basics.
10. Add delivery workflow and notifications.
11. Add AI/insight prototype only with transparent sample/source labels.
12. Add tests, fix errors, and write README.

WORKING STYLE:
- Make changes directly in the current project workspace.
- Prefer small, verifiable steps.
- After each major stage, run the relevant checks and fix errors before continuing.
- Do not stop after generating a visual mockup.
- Do not leave buttons that look functional but do nothing; either implement the action or mark it clearly as unavailable/demo.
- Avoid unnecessary dependencies and duplicated components.
- Keep the design consistent across all roles.
- If external credentials are missing, continue with a safe demo adapter and document the integration steps.
- At the end, provide a concise summary of completed features, run commands, demo login details, tests performed, and remaining limitations.

Start by inspecting the repository and existing files. Then implement the MVP in the current workspace, keeping the application runnable throughout development.
```

------------------------------------------------------------------------

## 22. Suggested Folder Structure

``` text
farmbridge/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── farmer/
│   │   │   ├── buyer/
│   │   │   ├── business/
│   │   │   ├── delivery/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── i18n/
│   │   ├── types/
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── integrations/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/
│   ├── workflow.md
│   └── architecture.md
├── .gitignore
└── README.md
```

This is a suggested structure; Antigravity should adapt it to the
existing repository rather than force a rewrite.

------------------------------------------------------------------------

## 23. Final Project Pitch

**FarmBridge brings farmers and buyers closer through a transparent
digital marketplace.** By combining direct selling, inventory and order
management, local fulfilment, and AI-assisted insights, it aims to
reduce unnecessary supply-chain friction, help farmers make informed
decisions, and make fresh produce easier to discover and purchase.

**Core demonstration:** A farmer lists produce → a consumer finds it and
orders → the farmer accepts → fulfilment is tracked → the completed sale
appears in the farmer dashboard.

**Build priority:** Make this core workflow reliable and easy to use
first. Add real payments, advanced AI, and automated logistics only when
the required data, credentials, and operational partners are available.
