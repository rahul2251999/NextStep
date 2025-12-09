import os
from typing import List, Dict, Any
from dotenv import load_dotenv
import json

load_dotenv()

class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "groq").lower()
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    async def generate_text(self, prompt: str, system_prompt: str = None, max_tokens: int = 1000) -> str:
        """Generate text using the configured LLM provider."""
        if self.provider == "groq":
            return await self._generate_with_groq(prompt, system_prompt, max_tokens)
        elif self.provider == "openai":
            return await self._generate_with_openai(prompt, system_prompt, max_tokens)
        elif self.provider == "huggingface":
            return await self._generate_with_huggingface(prompt, system_prompt, max_tokens)
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")
    
    async def _generate_with_groq(self, prompt: str, system_prompt: str = None, max_tokens: int = 1000) -> str:
        """Generate text using Groq API."""
        try:
            from groq import Groq
            
            if not self.groq_api_key:
                raise ValueError("GROQ_API_KEY not set")
            
            client = Groq(api_key=self.groq_api_key)
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = client.chat.completions.create(
                model="llama-3-8b-8192",  # or llama-3-70b-8192 for better quality
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"Groq API error: {str(e)}")
    
    async def _generate_with_openai(self, prompt: str, system_prompt: str = None, max_tokens: int = 1000) -> str:
        """Generate text using OpenAI API."""
        try:
            from openai import OpenAI
            
            if not self.openai_api_key:
                raise ValueError("OPENAI_API_KEY not set")
            
            client = OpenAI(api_key=self.openai_api_key)
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {str(e)}")
    
    async def _generate_with_huggingface(self, prompt: str, system_prompt: str = None, max_tokens: int = 1000) -> str:
        """Generate text using HuggingFace Inference API."""
        try:
            import httpx
            
            if not self.huggingface_api_key:
                raise ValueError("HUGGINGFACE_API_KEY not set")
            
            model = "mistralai/Mistral-7B-Instruct-v0.2"  # Free model
            
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://api-inference.huggingface.co/models/{model}",
                    headers={"Authorization": f"Bearer {self.huggingface_api_key}"},
                    json={
                        "inputs": full_prompt,
                        "parameters": {
                            "max_new_tokens": max_tokens,
                            "temperature": 0.7,
                            "return_full_text": False,
                        },
                    },
                    timeout=30.0,
                )
                
                if response.status_code != 200:
                    raise RuntimeError(f"HuggingFace API error: {response.text}")
                
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "")
                return str(result)
        except Exception as e:
            raise RuntimeError(f"HuggingFace API error: {str(e)}")
    
    async def improve_resume_bullet(
        self,
        original_bullet: str,
        job_requirements: List[str],
        job_title: str = None,
    ) -> str:
        """Improve a resume bullet point following STAR/RIC format."""
        system_prompt = """You are an expert resume writer and career coach. You rewrite resume bullet points to highlight accomplishments using the Result-Impact-Context (RIC) format, similar to STAR method.

Guidelines:
- Start with a concrete, quantified result or achievement
- Follow with how you achieved it (impact and method)
- Provide context (team size, scope, tools used)
- Use action verbs and be specific
- Do NOT invent any accomplishments or skills not supported by the candidate's experience
- Keep it professional and confident, not overly generic
- Avoid phrases that sound AI-generated
- Keep it concise (ideally one line, max two lines)
- Write in third person implied (no "I" pronouns, as resumes typically omit them)"""

        job_context = ""
        if job_requirements:
            job_context = f"\nThe target job requires: {', '.join(job_requirements[:5])}"
        if job_title:
            job_context += f"\nJob title: {job_title}"

        prompt = f"""Rewrite the following resume bullet point to follow the Result-Impact-Context format:

Original bullet: "{original_bullet}"
{job_context}

Provide only the improved bullet point, nothing else. Do not add explanations or markdown formatting."""

        try:
            improved = await self.generate_text(prompt, system_prompt, max_tokens=200)
            # Clean up the response
            improved = improved.strip().strip('"').strip("'")
            # Remove any markdown or extra formatting
            if improved.startswith("Improved:"):
                improved = improved.replace("Improved:", "").strip()
            return improved
        except Exception as e:
            # Fallback: return original if generation fails
            print(f"Error improving bullet: {str(e)}")
            return original_bullet
    
    async def generate_recruiter_message(
        self,
        candidate_summary: str,
        job_title: str,
        company: str,
        recipient_name: str = None,
    ) -> str:
        """Generate a LinkedIn message for a recruiter."""
        system_prompt = """You are an assistant that drafts brief LinkedIn messages to recruiters. The message should be:
- Polite, professional, and show genuine interest
- Brief (3-4 sentences)
- Human and authentic (NOT like it was written by AI)
- Avoid excessive praise or buzzwords
- Mention the specific job and why the candidate is a good fit"""

        greeting = f"Hello {recipient_name}," if recipient_name else "Hello,"

        prompt = f"""Draft a LinkedIn message to a recruiter.

{greeting}

Candidate background: {candidate_summary}

Job: {job_title} at {company}

Write a brief, authentic message expressing interest in the role and highlighting relevant experience. Keep it conversational and professional."""

        try:
            message = await self.generate_text(prompt, system_prompt, max_tokens=300)
            # Ensure it starts with greeting
            if not message.startswith(greeting.split(",")[0]):
                message = f"{greeting}\n\n{message}"
            return message.strip()
        except Exception as e:
            raise RuntimeError(f"Failed to generate recruiter message: {str(e)}")
    
    async def generate_referral_message(
        self,
        candidate_summary: str,
        job_title: str,
        company: str,
        contact_name: str,
        contact_role: str = None,
        connection: str = None,
    ) -> str:
        """Generate a LinkedIn message asking for a referral."""
        system_prompt = """You are an assistant that drafts LinkedIn messages asking for referrals. The message should be:
- Polite and appreciative of their time
- Not too formal, but professional
- Mention any commonalities or connections if provided
- Brief (4-6 sentences)
- Genuine and not like a mass email
- Respectful of the fact that you're asking for a favor"""

        connection_context = ""
        if connection:
            if connection == "alumni":
                connection_context = "We both attended [University]."
            elif connection == "former colleague":
                connection_context = "We worked together at [Previous Company]."
            else:
                connection_context = f"We are connected through {connection}."

        role_context = f" as a {contact_role}" if contact_role else ""

        prompt = f"""Draft a LinkedIn message asking for a referral.

Hi {contact_name},

{connection_context if connection_context else ""}

I saw that you're working at {company}{role_context} and noticed a {job_title} opening that aligns with my background.

Candidate background: {candidate_summary}

Write a brief, friendly message that:
1. Introduces yourself and any shared context
2. Mentions interest in the role at {company}
3. Highlights relevant experience briefly
4. Politely asks for a referral or advice about the role

Keep it genuine and appreciative."""

        try:
            message = await self.generate_text(prompt, system_prompt, max_tokens=400)
            return message.strip()
        except Exception as e:
            raise RuntimeError(f"Failed to generate referral message: {str(e)}")


# Singleton instance
llm_service = LLMService()

