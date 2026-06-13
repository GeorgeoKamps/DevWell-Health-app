"""extract_json must survive the messy ways LLMs wrap JSON."""
import pytest
from chains.jsonutil import extract_json


def test_plain_json():
    assert extract_json('{"a": 1}') == {"a": 1}


def test_fenced_json():
    assert extract_json('```json\n{"a": 1}\n```') == {"a": 1}


def test_json_with_prose_around_it():
    txt = 'Sure! Here is your plan:\n{"days": [1, 2]}\nHope that helps.'
    assert extract_json(txt) == {"days": [1, 2]}


def test_array_root():
    assert extract_json("noise [1, 2, 3] more") == [1, 2, 3]


def test_no_json_raises():
    with pytest.raises(ValueError):
        extract_json("there is nothing structured here")
