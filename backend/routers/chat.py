from fastapi import APIRouter
from data import mock
from models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """Placeholder echo-style reply. Will become a RAG-powered answer grounded
    in the nutrition/exercise knowledge base."""
    reply = f"You asked: \"{req.message}\". {mock.CHAT_CANNED}"
    return ChatResponse(reply=reply, sources=["placeholder/knowledge_base.md"])
