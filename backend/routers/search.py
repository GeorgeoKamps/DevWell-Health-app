from fastapi import APIRouter, Query, HTTPException
from rag.retriever import retrieve, list_sources, read_doc, get_retriever
from models.schemas import SearchResponse, SearchResult, KnowledgeResponse, KnowledgeDoc

router = APIRouter(tags=["knowledge"])


@router.get("/search", response_model=SearchResponse)
def search(q: str = Query(..., min_length=1), k: int = 5) -> SearchResponse:
    """Search the DevWell knowledge base (the same retriever the AI features use)."""
    hits = retrieve(q, k=k)
    return SearchResponse(
        query=q,
        backend=get_retriever().backend,
        results=[SearchResult(**h) for h in hits],
    )


@router.get("/knowledge", response_model=KnowledgeResponse)
def knowledge() -> KnowledgeResponse:
    """List the knowledge base documents grouped by category."""
    return KnowledgeResponse(backend=get_retriever().backend, categories=list_sources())


@router.get("/knowledge/doc", response_model=KnowledgeDoc)
def knowledge_doc(source: str = Query(..., min_length=1)) -> KnowledgeDoc:
    """Return the full text of a single knowledge-base document."""
    doc = read_doc(source)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return KnowledgeDoc(**doc)
