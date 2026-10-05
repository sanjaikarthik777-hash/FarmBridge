# FarmBridge System Architecture

## Overview
FarmBridge is designed as a direct farmer-to-consumer agricultural marketplace tailored for regional hubs (initial pilot: Pollachi, Coimbatore District, Tamil Nadu, India).

```text
 ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
 │ Farmer Portal  │     │ Consumer PWA   │     │ Delivery App   │     │ Admin Console  │
 └───────┬────────┘     └───────┬────────┘     └───────┬────────┘     └───────┬────────┘
         │                      │                      │                      │
         └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                           │
                                React 19 + TypeScript + Tailwind CSS
                                           │
                                    Vite HTTP Proxy
                                           │
                                  FastAPI (Python 3.14)
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                Auth & Security    Marketplace & Orders   AI Decision Support
                        │                  │                  │
                        └──────────────────┼──────────────────┘
                                           │
                            PostgreSQL / Supabase RLS
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
                Mandi Price Feeds                      Delivery Routing
            (Uzhavar Sandhai Bulletins)               (Cluster Optimization)
```

## Security & Data Privacy
1. **Server-Side Authoritative Totals:** The frontend never computes final payable totals; all line totals, platform fees, and stock reservations are validated server-side.
2. **Approximate Location Discovery:** Public listings expose only approximate areas (e.g., *Aliyar Road, Pollachi*). Exact private farm gate pickup instructions and household door numbers are strictly restricted to confirmed orders.
3. **Role-Based Row Level Security:** Supabase RLS policies guarantee farmers modify only their own listings, buyers access only their own orders, delivery partners view only assigned route tasks, and administrative functions are auditable.
