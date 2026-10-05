# FarmBridge End-to-End Workflow Guide

## Primary User Journey (Pollachi Pilot Scenario)

### 1. Farmer Harvest Listing
1. Farmer signs in as **Farmer Murugan Palanisamy** (`f1000000-0000-0000-0000-000000000001`).
2. Opens **Farmer Portal** -> clicks **"Add New Harvest"**.
3. Enters produce name (e.g., *Country Tomatoes (நாட்டு தக்காளி)*), available quantity (e.g., 50 kg), and proposed selling price (e.g., ₹32/kg).
4. Uses the embedded **AI Mandi Benchmark Assistant** to cross-reference daily Uzhavar Sandhai modal prices (₹34/kg) and see estimated net earnings after the nominal flat ₹5 platform fee.
5. Publishes listing with farm gate pickup and local delivery enabled.

### 2. Consumer Discovery & Transparent Checkout
1. Consumer signs in as **Kavitha Sundaram** (`b1000000-0000-0000-0000-000000000001`).
2. Opens **Marketplace**, filters by *Fresh Vegetables* or *Aliyar Road Foothills*.
3. Opens the tomato harvest card, views farm details, harvest time (today at dawn), and adds 2 kg to the basket.
4. Opens basket drawer. Verifies the **100% Transparent Price Breakdown**:
   - Produce subtotal: ₹64.00
   - Disclosed platform maintenance fee: ₹5.00
   - Standard local delivery fee: ₹25.00
   - Total payable: ₹94.00
5. Selects morning delivery slot and confirms order via simulated payment.

### 3. Order Fulfilment Lifecycle
1. The backend atomically reserves 2 kg from available inventory.
2. Farmer Murugan receives the order as `pending_farmer_confirmation` and clicks **"Accept & Reserve Stock"**.
3. Status advances to `accepted` -> Farmer harvests and clicks **"Start Harvest & Packing"** (`preparing`) -> **"Mark Ready for Dispatch"** (`ready_for_pickup`).
4. Assigned delivery partner **Senthil Velan** accepts the route task, picks up produce from farm gate 2, and updates status to `delivered`.
5. Consumer Kavitha confirms doorstep receipt (`completed`) and submits a verified 5-star review.
6. Farmer Murugan's dashboard updates gross sales and payout summaries.
