from fastapi import APIRouter
from chains.chat_chain import generate_reply
from models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """Health Q&A. Uses Claude with the Byte persona + conversation history when
    ANTHROPIC_API_KEY is set; otherwise returns a canned reply."""
    return generate_reply(req)
