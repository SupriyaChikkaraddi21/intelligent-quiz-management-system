import json
from openai import OpenAI

client = OpenAI()


def generate_questions(topic, difficulty, count, origin_hint=""):
    """
    AI Question generation utility.
    - origin_hint (optional) forces Indian GK/Current Affairs context if needed.
    - Backward compatible with old calls where origin_hint was not sent.
    """

    # Add contextual control
    context_line = ""
    if origin_hint:
        context_line = f"\nIMPORTANT: {origin_hint}\n"

    prompt = f"""
Generate {count} multiple-choice questions for the topic "{topic}".
Difficulty level: {difficulty}.
{context_line}

STRICT RULES:
- ALWAYS return valid JSON.
- NO markdown.
- NO extra text.
- Choices must be a list of 4 items.
- correct_choice_index must be an integer (0–3).
- Explanation must be short and factual.
- If topic relates to GK, Current Affairs, or National events:
    * Prefer India-specific context unless explicitly stated otherwise.

Return JSON ONLY in this structure:

{{
  "questions": [
    {{
      "question": "string",
      "choices": ["A", "B", "C", "D"],
      "correct_choice_index": 0,
      "explanation": "string",
      "references": ["url1", "url2"]
    }}
  ]
}}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return ONLY valid JSON. No markdown, no extra text."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
        )

        raw = response.choices[0].message.content.strip()

        # Attempt JSON parsing
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            print("JSON PARSE ERROR — Raw output:\n", raw)
            return []

        # Ensure proper structure
        questions = data.get("questions", [])
        cleaned = []

        for q in questions:
            try:
                cleaned.append({
                    "question": q["question"],
                    "choices": q["choices"],
                    "correct_choice_index": int(q["correct_choice_index"]),
                    "explanation": q.get("explanation", ""),
                    "references": q.get("references", []),
                })
            except Exception as e:
                print("Invalid question structure:", e)
                continue

        return cleaned

    except Exception as e:
        print("AI ERROR:", e)
        return []
