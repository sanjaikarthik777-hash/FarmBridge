from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, farms, products, cart, orders, delivery, insights, admin, consumer, email_otp, sync

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
app.include_router(sync.router, prefix=settings.API_V1_STR)

# Mount Offline-First PWA Farmer Dashboard
import os
from fastapi.staticfiles import StaticFiles

offline_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "offline-dashboard")
if os.path.exists(offline_dir):
    icons_dir = os.path.join(offline_dir, "icons")
    os.makedirs(icons_dir, exist_ok=True)
    icon192 = os.path.join(icons_dir, "icon-192.png")
    icon512 = os.path.join(icons_dir, "icon-512.png")

    def _generate_png_bytes(width, height, r=27, g=67, b=50):
        import zlib, struct
        def chunk(tag, data):
            return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)
        sig = b"\x89PNG\r\n\x1a\n"
        ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        raw = bytearray()
        for y in range(height):
            raw.append(0)
            for x in range(width):
                raw.extend((r, g, b, 255))
        idat = chunk(b"IDAT", zlib.compress(bytes(raw)))
        iend = chunk(b"IEND", b"")
        return sig + ihdr + idat + iend

    logo_src = r"C:\Users\vishm\.gemini\antigravity-ide\brain\71400741-d717-4736-a681-ba8023dc2d59\farmdirect_app_logo_1791785730235.jpg"
    logo_dest = os.path.join(icons_dir, "logo.png")
    if os.path.exists(logo_src):
        import shutil
        try:
            shutil.copyfile(logo_src, logo_dest)
            shutil.copyfile(logo_src, icon192)
            shutil.copyfile(logo_src, icon512)
        except Exception as e:
            print("Logo copy error:", e)

    app.mount("/offline", StaticFiles(directory=offline_dir, html=True), name="offline")

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
