"""Robust JSON extraction from LLM responses (handles ```json fences + prose)."""
import json
import re


def extract_json(text: str):
    fenced = re.search(r"```(?:json)?\s*(.+?)```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    start = min((i for i in (text.find("{"), text.find("[")) if i != -1), default=-1)
    if start == -1:
        raise ValueError("no JSON found in response")
    depth, end = 0, -1
    for i, ch in enumerate(text[start:], start):
        if ch in "{[":
            depth += 1
        elif ch in "}]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    return json.loads(text[start:end])
