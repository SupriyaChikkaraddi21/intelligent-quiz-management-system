import os
from groq import Groq


class GroqClient:

    @staticmethod
    def get_client():
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set")

        return Groq(api_key=api_key)
