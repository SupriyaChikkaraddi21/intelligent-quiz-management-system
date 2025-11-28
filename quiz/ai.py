import json
import os
import re
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def clean_json_output(text):
    """
    Removes markdown ```json blocks and cleans escape issues.
    """
    text = text.strip()

    # Remove ```json or ``` if present
    text = text.replace("```json", "").replace("```", "").strip()

    # Remove stray backslashes
    text = text.replace("\\(", "(").replace("\\)", ")")
    text = text.replace("\\[", "[").replace("\\]", "]")
    text = text.replace("\\{", "{").replace("\\}", "}")
    text = text.replace("\\n", " ")

    return text


def generate_questions(topic="General", difficulty="Medium", count=5):
    """
    Generates strictly formatted MCQ questions using OpenAI with stable JSON output.
    """

    prompt = f"""
You MUST generate exactly {count} multiple-choice questions about "{topic}" at "{difficulty}" difficulty.

You must return ONLY VALID JSON in EXACTLY this format:

{{
  "questions": [
    {{
      "question": "string",
      "choices": ["A", "B", "C", "D"],
      "correct_choice_index": 1,
      "explanation": "string",
      "references": []
    }}
  ]
}}

STRICT RULES YOU MUST FOLLOW:
- "choices" must ALWAYS contain exactly 4 answer options.
- "correct_choice_index" MUST be an integer: 0, 1, 2, or 3.
- "correct_choice_index" MUST match the correct answer in "choices".
- DO NOT include answer text like "Correct answer: A". Only provide the index.
- DO NOT include commentary, notes, markdown, code fences, or explanations outside JSON.
- DO NOT include additional fields. ONLY the structure above.
- MUST NOT include ```json or ``` anywhere.
- MUST return pure JSON object only.
"""

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
        )

        raw_text = response.output_text
        print("AI RAW OUTPUT:\n", raw_text)

        cleaned = clean_json_output(raw_text)

        # Attempt to parse JSON
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            cleaned = re.sub(r"\\u[\dA-Fa-f]{4}", "", cleaned)
            cleaned = cleaned.replace("\n", " ")
            data = json.loads(cleaned)

        questions = data.get("questions", [])

        # Validate structure to avoid backend crashes
        validated = []
        for q in questions:
            question_text = q.get("question", "").strip()
            choices = q.get("choices", [])
            correct_index = q.get("correct_choice_index", None)

            # Fix invalid AI output automatically
            if not isinstance(choices, list) or len(choices) != 4:
                continue  # skip invalid question

            if correct_index not in [0, 1, 2, 3]:
                continue  # invalid correct index

            validated.append({
                "question": question_text,
                "choices": choices,
                "correct_choice_index": int(correct_index),
                "explanation": q.get("explanation", ""),
                "references": q.get("references", []),
            })

        return validated

    except Exception as e:
        print("AI ERROR:", e)
        return None
