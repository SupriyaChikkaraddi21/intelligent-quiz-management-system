import os
import json
import re
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_json(text):
    """
    Safely extract first valid JSON object from text
    """
    try:
        start = text.index("{")
        end = text.rindex("}") + 1
        return json.loads(text[start:end])
    except Exception:
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
                {"role": "user", "content": prompt},
            ],
            max_tokens=1200,
            temperature=0.6,
        )

        raw = response.choices[0].message.content
        data = extract_json(raw)

        if not data or "questions" not in data:
            print("Invalid JSON from Groq:", raw)
            return []

        cleaned = []

        for q in data["questions"]:
            try:
                if (
                    not q.get("question")
                    or not isinstance(q.get("choices"), list)
                    or len(q["choices"]) != 4
                ):
                    continue

                cleaned.append({
                    "question": q["question"],
                    "choices": q["choices"],
                    "correct_choice_index": int(q["correct_choice_index"]),
                    "explanation": q.get("explanation", ""),
                    "references": q.get("references", []),
                })
            except Exception:
                continue

        return cleaned

    except Exception as e:
        print("GROQ ERROR:", e)
        return []
