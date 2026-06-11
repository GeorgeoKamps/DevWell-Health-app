"""Retrieval over the DevWell knowledge base.

Primary backend is ChromaDB (per the spec). If `chromadb` isn't installed, we
fall back to a dependency-free in-memory TF-IDF index so retrieval always works.
Either way, `get_retriever().retrieve(query, k)` returns the top chunks with
their source file (for citations).
"""
import os
import re
import glob
import math
from collections import Counter

KB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge_base")
CHROMA_PATH = os.getenv("CHROMA_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db"))
COLLECTION = "devwell_kb"


# ----- doc loading + chunking ------------------------------------------------
def load_chunks() -> list[dict]:
    chunks = []
    for path in sorted(glob.glob(os.path.join(KB_DIR, "**", "*.md"), recursive=True)):
        category = os.path.basename(os.path.dirname(path))
        source = os.path.relpath(path, KB_DIR).replace("\\", "/")
        with open(path, encoding="utf-8") as f:
            text = f.read()
        for i, chunk in enumerate(_chunk(text)):
            chunks.append({"id": f"{source}::{i}", "text": chunk, "source": source, "category": category})
    return chunks


def _chunk(text: str, max_chars: int = 700) -> list[str]:
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks, cur = [], ""
    for p in paras:
        if len(cur) + len(p) > max_chars and cur:
            chunks.append(cur.strip())
            cur = ""
        cur += p + "\n\n"
    if cur.strip():
        chunks.append(cur.strip())
    return chunks


def _tokenize(s: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", s.lower())


# ----- TF-IDF fallback index -------------------------------------------------
class _TfidfIndex:
    backend = "tfidf"

    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        toks = [_tokenize(c["text"]) for c in chunks]
        df = Counter()
        for t in toks:
            df.update(set(t))
        n = max(1, len(chunks))
        self.idf = {w: math.log((n + 1) / (c + 1)) + 1 for w, c in df.items()}
        self.vectors = [self._vec(t) for t in toks]

    def _vec(self, toks: list[str]) -> dict:
        if not toks:
            return {}
        tf = Counter(toks)
        v = {w: (c / len(toks)) * self.idf.get(w, 0.0) for w, c in tf.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        return {w: x / norm for w, x in v.items()}

    def retrieve(self, query: str, k: int = 4) -> list[dict]:
        qv = self._vec(_tokenize(query))
        scored = []
        for i, dv in enumerate(self.vectors):
            small, big = (qv, dv) if len(qv) < len(dv) else (dv, qv)
            s = sum(val * big.get(w, 0.0) for w, val in small.items())
            if s > 0:
                scored.append((s, i))
        scored.sort(reverse=True)
        out = []
        for s, i in scored[:k]:
            c = self.chunks[i]
            out.append({"text": c["text"], "source": c["source"], "category": c["category"], "score": round(s, 3)})
        return out


# ----- ChromaDB index --------------------------------------------------------
class _ChromaIndex:
    backend = "chroma"

    def __init__(self, chunks: list[dict]):
        import chromadb
        self.client = chromadb.PersistentClient(path=CHROMA_PATH)
        self.col = self.client.get_or_create_collection(COLLECTION)
        if self.col.count() == 0:
            self.col.add(
                ids=[c["id"] for c in chunks],
                documents=[c["text"] for c in chunks],
                metadatas=[{"source": c["source"], "category": c["category"]} for c in chunks],
            )

    def retrieve(self, query: str, k: int = 4) -> list[dict]:
        res = self.col.query(query_texts=[query], n_results=k)
        out = []
        docs = res.get("documents", [[]])[0]
        metas = res.get("metadatas", [[]])[0]
        dists = res.get("distances", [[None] * len(docs)])[0]
        for doc, meta, dist in zip(docs, metas, dists):
            out.append({
                "text": doc,
                "source": meta.get("source", "?"),
                "category": meta.get("category", "?"),
                "score": round(1 - dist, 3) if isinstance(dist, (int, float)) else None,
            })
        return out


_retriever = None


def get_retriever():
    """Cached retriever. Prefers Chroma, falls back to TF-IDF."""
    global _retriever
    if _retriever is None:
        chunks = load_chunks()
        try:
            _retriever = _ChromaIndex(chunks)
        except Exception:
            _retriever = _TfidfIndex(chunks)
    return _retriever


def retrieve(query: str, k: int = 4) -> list[dict]:
    return get_retriever().retrieve(query, k)
