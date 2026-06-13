"""RAG retriever. In the sandbox chromadb may be absent, so the TF-IDF
fallback is what we assert on — and it's the path that must always work."""
from rag.retriever import (
    load_chunks, list_sources, read_doc, get_retriever, _TfidfIndex,
)


def test_knowledge_base_loads_chunks():
    chunks = load_chunks()
    assert len(chunks) > 0
    c = chunks[0]
    assert {"id", "text", "source", "category"} <= set(c)


def test_tfidf_retrieval_is_relevant():
    idx = _TfidfIndex(load_chunks())
    hits = idx.retrieve("desk stretch for the neck and shoulders", k=3)
    assert len(hits) >= 1
    assert hits[0]["score"] > 0
    # results carry a citable source
    assert hits[0]["source"].endswith(".md")


def test_list_sources_groups_by_category():
    cats = list_sources()
    assert isinstance(cats, dict)
    assert any(cats.values())


def test_read_doc_known_and_unknown():
    cats = list_sources()
    some_source = next(iter(next(iter(cats.values()))))
    doc = read_doc(some_source)
    assert doc is not None and doc["text"]
    assert read_doc("../etc/passwd") is None  # path traversal rejected


def test_get_retriever_is_cached():
    assert get_retriever() is get_retriever()
