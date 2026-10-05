from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, farms, products, cart, orders, delivery, insights, admin, consumer, email_otp

app = FastAPI(
    title="FarmBridge API",
    description="""
    ## FarmBridge — AI-Powered Direct Farmer-to-Consumer Marketplace
    Backend API providing direct farm listings, transparent checkout, order lifecycle management,
    delivery tracking, AI price reference benchmarks, and admin moderation.
    
    *Initial Pilot: Pollachi, Coimbatore District, Tamil Nadu, India.*
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(consumer.router, prefix=settings.API_V1_STR)
app.include_router(farms.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(cart.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(delivery.router, prefix=settings.API_V1_STR)
app.include_router(insights.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(email_otp.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "FarmBridge",
        "description": "AI-Powered Direct Farmer-to-Consumer Marketplace",
        "pilot_region": "Pollachi, Tamil Nadu",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "operational",
        "demo_mode": True
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "demo_mode": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
