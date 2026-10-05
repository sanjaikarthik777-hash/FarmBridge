# FarmBridge 🌿
### AI-Powered Direct Farmer-to-Consumer Marketplace
> **Initial Pilot Region:** Pollachi & Coimbatore District, Tamil Nadu, India  
> **Categories:** AgriTech | Digital Marketplace | Supply Chain | AI Decision Support

---

## 1. Project Overview

FarmBridge is a digital agricultural marketplace built to bridge the gap between farmers and consumers, institutional kitchens, and local retailers. Traditional agricultural supply chains introduce multiple handling steps and opaque commercial margins. FarmBridge enables farmers to retain complete agency over their listing prices while providing buyers with 100% transparent fee breakdowns (produce subtotal, flat ₹5 platform fee, and delivery charges disclosed upfront).

AI features on FarmBridge serve as honest decision support tools—cross-referencing daily Tamil Nadu Uzhavar Sandhai bulletins and APMC Mandi rates—without ever mandating prices or fabricating predictions.

---

## 2. Key Features

- **Direct Farmer Agency:** Farmers set their own prices, update field stock, and accept or reject orders based on real harvest conditions.
- **Bilingual Interface:** Full English and Tamil (தமிழ்) toggle for rural and urban accessibility.
- **100% Transparent Checkout:** Authoritative server-side calculation disclosing produce subtotal, ₹5 flat service fee, and ₹25 local delivery fee.
- **Atomic Stock Reservation:** Prevents overselling during concurrent checkouts.
- **Visual Order Lifecycle:** `placed` → `confirmed` → `harvesting & packing` → `ready for pickup` → `in transit` → `delivered` → `completed`.
- **AI Price Benchmark Assistant:** Compares proposed prices with daily Uzhavar Sandhai & Mandi modal ranges, classifying prices as *competitive*, *premium*, or *below market*.
- **Crop Demand Insights:** Detects trending crops from aggregated search and basket velocity.
- **Logistics Route Clustering:** Groups open orders by neighborhood to minimize transit distances and delivery fees.
- **1-Click Persona Switcher:** Built-in demo account switcher for instantaneous evaluation across Farmer, Consumer, Business Buyer, Delivery Partner, and Platform Admin roles.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Python 3.14, FastAPI, Pydantic, Uvicorn
- **Database & Security:** Supabase PostgreSQL Schema, Row Level Security (RLS) policies
- **Testing:** Pytest, FastAPI TestClient / HTTPX
- **Localization:** English & Tamil (தமிழ்)

---

## 4. Repository Structure

```text
Lovhack/
├── frontend/                     # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Header, DemoBanner
│   │   ├── pages/
│   │   │   ├── public/          # Marketplace, ProductModal
│   │   │   ├── farmer/          # FarmerDashboard, AddProduceModal
│   │   │   ├── buyer/           # CartDrawer, OrdersPage
│   │   │   ├── insights/        # InsightsPage (AI Price & Demand)
│   │   │   ├── delivery/        # DeliveryPage (Logistics Portal)
│   │   │   └── admin/           # AdminDashboard (Console & Audits)
│   │   ├── services/            # API client
│   │   ├── i18n/                # English & Tamil dictionaries
│   │   └── types/               # TypeScript models
│   ├── vite.config.ts           # Tailwind plugin & proxy to port 8001
│   └── package.json
├── backend/                      # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                 # Auth, farms, products, cart, orders, delivery, insights, admin
│   │   ├── core/                # Config & settings
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Demo datastore, AI benchmarking, logistics clustering
│   │   └── main.py              # Application entry point
│   ├── tests/                   # Pytest automated test suite
│   ├── requirements.txt
│   └── .env.example
├── supabase/
│   ├── migrations/              # PostgreSQL schema with full RLS policies
│   └── seed.sql                 # Pollachi pilot seed data
├── docs/
│   ├── architecture.md          # System architecture & privacy
│   └── workflow.md              # End-to-end walk-through guide
├── FarmBridge_Antigravity_Project_Brief.md # Master project brief
├── .gitignore
└── README.md
```

---

## 5. Getting Started Locally

### Prerequisites
- Node.js (v18+) & npm
- Python (3.10+)

### 1. Backend Setup
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
API Documentation (Swagger UI): `http://127.0.0.1:8001/docs`

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open in browser: `http://127.0.0.1:5173/`

---

## 6. Pre-Configured Demo Accounts (1-Click Switcher)

Switch personas instantaneously from the top demo banner chip or the user dropdown:

| Persona | Role | Pilot Context |
| :--- | :--- | :--- |
| **Murugan Palanisamy (முருகன்)** | Farmer | Thennam Thoppu Natural Farm, Aliyar Road, Pollachi |
| **Lakshmi Ramasamy (லட்சுமி)** | Farmer | Anaimalai Organic Valley, Western Ghats Foothills |
| **Kavitha Sundaram (கவிதா)** | Consumer | Household Buyer, Mahalingapuram, Pollachi |
| **Anand Kumar (Annapoorna)** | Business Buyer | Restaurant Procurement, Commercial Kitchen |
| **Senthil Velan (செந்தில்)** | Delivery Partner | Local Agro Logistics Driver |
| **Selvam Arumugam** | Platform Admin | Platform Governance & Verification Operator |

---

## 7. Running Automated Tests

Run the backend pytest suite:
```powershell
cd backend
python -m pytest tests -v
```

All 6 core tests validate:
1. Health and root discovery
2. Category and produce listing
3. Farmer produce creation and validation
4. Consumer order checkout and atomic stock decrement
5. AI price recommendation and Mandi benchmark classification
6. Admin overview metrics

---

## 8. Responsible AI Disclosures

- AI price assistance provides benchmark comparison based on regional Uzhavar Sandhai daily bulletins.
- Farmers maintain complete freedom to set prices above or below market averages.
- Crop demand insights reflect aggregated marketplace activity; planting and investment recommendations are explicitly disclaimed.
