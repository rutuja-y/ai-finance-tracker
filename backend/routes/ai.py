from fastapi import APIRouter
import requests
import os

router = APIRouter()

API_KEY = "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"

@router.post("/parse")
def parse_expense(data: dict):
    user_input = data.get("text")

    prompt = f"""
    Extract structured data from this input:

    "{user_input}"

    Return ONLY valid JSON in this format:
    {{
    "text": "string",
    "amount": number,
    "category": "Food | Travel | Shopping | Bills | Other",
    "type": "income or expense"
    }}

    Rules:
    - Do not return anything except JSON
    - Do not add explanation
    - Detect category properly
    """

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "openai/gpt-3.5-turbo",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
    )

    result = response.json()
    content = result["choices"][0]["message"]["content"]

    return {"result": content}