from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import the chatbot logic
from chat_service import get_chatbot_response

# Initialize the FastAPI app
app = FastAPI(
    title="MedVault AI Assistant",
    description="API for the MedVault chatbot.",
    version="1.0.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST"], 
    allow_headers=["*"], 
)

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    action: str | None = None
    suggestions: list[str] | None = None

# --- API Endpoints ---
@app.get("/", tags=["Root"])
def read_root():
    return {"status": "MedVault AI Assistant is running!"}

@app.post("/api/chat", response_model=ChatResponse, tags=["Chatbot"])
def chat_with_bot(request: ChatRequest):
    user_message = request.message
    
    # Get the response from the chat service
    bot_response = get_chatbot_response(user_message)
    
    # Handle dictionary response (Rich response with actions/suggestions)
    if isinstance(bot_response, dict):
        return ChatResponse(
            reply=bot_response.get("message", ""),
            action=bot_response.get("action"),
            suggestions=bot_response.get("suggestions")
        )
    
    # Handle simple string response
    return ChatResponse(reply=str(bot_response))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)