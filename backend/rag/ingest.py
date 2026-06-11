"""Build / refresh the ChromaDB index from the knowledge base.

Usage:
    cd backend && python -m rag.ingest
"""
from rag.retriever import load_chunks, get_retriever


def main():
    chunks = load_chunks()
    print(f"Loaded {len(chunks)} chunks from the knowledge base.")
    r = get_retriever()
    print(f"Retriever backend: {r.backend}")
    # smoke test
    hits = r.retrieve("high protein meal in 15 minutes", k=3)
    print(f"Sample query returned {len(hits)} hits:")
    for h in hits:
        print(f"  - {h['source']} (score {h['score']})")


if __name__ == "__main__":
    main()
