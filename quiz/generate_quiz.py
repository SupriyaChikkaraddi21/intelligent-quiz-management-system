import json
from openai import OpenAI

client = OpenAI()

def generate_questions(topic, difficulty, count):
    prompt = f"""
Generate {count} multiple-choice questions on the topic "{topic}".
Difficulty: {difficulty}.

Return ONLY valid JSON in this structure:

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
                {"role": "system", "content": "Return valid JSON only."},
                {"role": "user", "content": prompt}
            ]
        )

        raw = response.choices[0].message.content.strip()

        # JSON parse
        data = json.loads(raw)

        return data.get("questions", [])

    except Exception as e:
        print("AI ERROR:", e)
        return []
