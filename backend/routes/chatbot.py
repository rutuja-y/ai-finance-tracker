from fastapi import APIRouter
import requests

router = APIRouter()

API_KEY = "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"

@router.post("/chat")
def chat(data: dict):
    user_message = data.get("message")
    transactions = data.get("transactions")

    prompt = f"""
    You are a financial assistant.

    User transactions:
    {transactions}

    Answer this question:
    {user_message}

    Give a helpful and short response.
    """

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "openai/gpt-4o-mini",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
    )

    result = response.json()
    return {"reply": result["choices"][0]["message"]["content"]}