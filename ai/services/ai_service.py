import json
from ai.clients.groq_client import GroqClient


class AIService:

    # --------------------------------------------------
    # JSON Extraction (Robust against noise / truncation)
    # --------------------------------------------------
    @staticmethod
    def _extract_json(text):
        if not text:
            return None

        stack = []
        start = None

        for i, ch in enumerate(text):
            if ch == "{":
                if start is None:
                    start = i
                stack.append("{")
            elif ch == "}":
                if stack:
                    stack.pop()
                    if not stack and start is not None:
                        try:
                            return json.loads(text[start:i + 1])
                        except Exception:
                            return None
        return None

    # --------------------------------------------------
    # Main Question Generator
    # --------------------------------------------------
    @staticmethod
    def generate_questions(
        topic,
        difficulty,
        count,
        *,
        question_type="mcq",
        origin_hint="",
        language="en",
    ):
        client = GroqClient.get_client()

        context = f"\nIMPORTANT CONTEXT: {origin_hint}\n" if origin_hint else ""

        # =========================
        # FORMAT BLOCK
        # =========================

        if question_type == "mcq":
            format_block = (
                '{\n'
                '  "questions": [\n'
                '    {\n'
                '      "question": "string",\n'
                '      "choices": ["A","B","C","D"],\n'
                '      "correct_choice_index": 0,\n'
                '      "hint": "string",\n'
                '      "explanation": "string",\n'
                '      "references": []\n'
                '    }\n'
                '  ]\n'
                '}\n'
            )

        elif question_type == "true_false":
            format_block = (
                '{\n'
                '  "questions": [\n'
                '    {\n'
                '      "question": "string",\n'
                '      "choices": ["True","False"],\n'
                '      "correct_choice_index": 0,\n'
                '      "hint": "string",\n'
                '      "explanation": "string",\n'
                '      "references": []\n'
                '    }\n'
                '  ]\n'
                '}\n'
            )

        elif question_type == "type_answer":
            format_block = (
                '{\n'
                '  "questions": [\n'
                '    {\n'
                '      "question": "string",\n'
                '      "correct_text": "string",\n'
                '      "hint": "string",\n'
                '      "explanation": "string",\n'
                '      "references": []\n'
                '    }\n'
                '  ]\n'
                '}\n'
            )
        else:
            return []

        # =========================
        # LANGUAGE ENFORCEMENT
        # =========================

        language_instruction = ""
        if language == "kn":
            language_instruction = (
                "IMPORTANT:\n"
                "- Generate EVERYTHING strictly in Kannada\n"
                "- Do NOT mix English words\n"
                "- KEEP QUESTIONS SHORT\n"
                "- DO NOT exceed required length\n"
                "- COMPLETE THE JSON fully\n"
            )

        # =========================
        # PROMPT
        # =========================

        prompt = (
            f"Generate {count} {question_type.replace('_', ' ')} questions for \"{topic}\"\n"
            f"Difficulty: {difficulty}\n"
            f"{language_instruction}"
            f"{context}\n"
            "STRICT RULES:\n"
            "- RETURN ONLY VALID JSON\n"
            "- NO TEXT OUTSIDE JSON\n"
            "- DO NOT truncate\n"
            "- END AFTER JSON COMPLETES\n\n"
            "FORMAT:\n"
            f"{format_block}"
        )

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a quiz generator. "
                            "Return ONLY valid JSON. "
                            "The JSON must be COMPLETE."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=3000,
                temperature=0.6,
            )

            raw = response.choices[0].message.content

            data = AIService._extract_json(raw)

            if not data or "questions" not in data:
                return []

            cleaned = []

            for q in data["questions"]:
                try:
                    if question_type == "mcq":
                        cleaned.append({
                            "question_type": "mcq",
                            "question": q["question"],
                            "choices": q["choices"],
                            "correct_choice_index": int(q["correct_choice_index"]),
                            "correct_text": "",
                            "hint": q.get("hint", ""),
                            "explanation": q.get("explanation", ""),
                            "references": q.get("references", []),
                        })

                    elif question_type == "true_false":
                        cleaned.append({
                            "question_type": "true_false",
                            "question": q["question"],
                            "choices": ["True", "False"],
                            "correct_choice_index": int(q["correct_choice_index"]),
                            "correct_text": "",
                            "hint": q.get("hint", ""),
                            "explanation": q.get("explanation", ""),
                            "references": q.get("references", []),
                        })

                    elif question_type == "type_answer":
                        cleaned.append({
                            "question_type": "type_answer",
                            "question": q["question"],
                            "choices": [],
                            "correct_choice_index": -1,
                            "correct_text": q.get("correct_text", ""),
                            "hint": q.get("hint", ""),
                            "explanation": q.get("explanation", ""),
                            "references": q.get("references", []),
                        })

                except Exception:
                    continue

            return cleaned if cleaned else []

        except Exception:
            return []
