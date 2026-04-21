from fastapi import FastAPI
from database import engine, Base
from routes import auth
from routes import ai
from routes import transaction
from fastapi.middleware.cors import CORSMiddleware
from routes import chatbot
from routes import budget


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Create tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(transaction.router, prefix="/transactions")
app.include_router(budget.router)

@app.get("/")
def root():
    return {"message": "AI Finance Tracker API is running"}