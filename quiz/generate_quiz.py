import os
import json
import re
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_json(text):
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return None
    try:
        return json.loads(match.group())
    except json.JSONDecodeError:
        return None


def generate_questions(topic, difficulty, count, origin_hint=""):
    if not os.getenv("GROQ_API_KEY"):
        print("GROQ_API_KEY not set")
        return []

    context = f"\nIMPORTANT: {origin_hint}\n" if origin_hint else ""

    prompt = f"""
Generate {count} multiple-choice questions for "{topic}"
Difficulty: {difficulty}
{context}

STRICT RULES:
- Return ONLY valid JSON
- NO markdown
- EXACTLY 4 choices
- correct_choice_index must be 0–3

FORMAT:
{{
  "questions": [
    {{
      "question": "string",
      "choices": ["A","B","C","D"],
      "correct_choice_index": 0,
      "explanation": "string",
      "references": []
    }}
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Return ONLY valid JSON"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.6,
        )

        raw = response.choices[0].message.content
        data = extract_json(raw)

        if not data:
            print("Invalid JSON from Groq:", raw)
            return []

        return data.get("questions", [])

    except Exception as e:
        print("GROQ ERROR:", e)
        return []
