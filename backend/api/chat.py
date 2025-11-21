from fastapi import APIRouter
from pydantic import BaseModel
from agent.scheduling_agent import SchedulingAgent

router = APIRouter(prefix="/chat", tags=["Chat"])

agent = SchedulingAgent()

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: str | None = None


@router.post("/")
async def chat_endpoint(req: ChatRequest):
    response = await agent.process_message(
        message=req.message,
        session_id=req.session_id,
        user_id=req.user_id
    )
    return response
