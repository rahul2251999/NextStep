import re
import fitz  # PyMuPDF
import docx2txt
from typing import Dict, List, Any
import io


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using PyMuPDF."""
    try:
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page in pdf_document:
            text += page.get_text()
        pdf_document.close()
        return text
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX using docx2txt."""
    try:
        text = docx2txt.process(io.BytesIO(file_content))
        return text or ""
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")


def extract_email(text: str) -> str | None:
    """Extract email address from text."""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    """Extract phone number from text."""
    phone_patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        r'\(\d{3}\)\s?\d{3}[-.]?\d{4}',
        r'\+\d{1,3}\s?\d{3}[-.]?\d{3}[-.]?\d{4}',
    ]
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return None


def extract_name(text: str) -> str | None:
    """Extract name from first few lines of resume."""
    lines = text.split('\n')[:5]
    for line in lines:
        line = line.strip()
        # Look for lines with 2-4 capitalized words (likely name)
        words = line.split()
        if 2 <= len(words) <= 4:
            if all(word[0].isupper() if word else False for word in words):
                return line
    return None


def parse_resume_sections(text: str) -> Dict[str, Any]:
    """Parse resume text into structured sections."""
    text_upper = text.upper()
    
    # Common section headers
    section_keywords = {
        "education": ["EDUCATION", "ACADEMIC", "EDUCATIONAL BACKGROUND"],
        "experience": ["EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "PROFESSIONAL EXPERIENCE", "CAREER"],
        "skills": ["SKILLS", "TECHNICAL SKILLS", "COMPETENCIES", "TECHNOLOGIES"],
        "projects": ["PROJECTS", "PROJECT EXPERIENCE"],
        "summary": ["SUMMARY", "PROFESSIONAL SUMMARY", "OBJECTIVE", "PROFILE"],
        "certifications": ["CERTIFICATIONS", "CERTIFICATES", "LICENSES"],
    }
    
    sections = {}
    lines = text.split('\n')
    current_section = None
    current_content = []
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        # Check if this line is a section header
        is_header = False
        for section_name, keywords in section_keywords.items():
            if any(keyword in line.upper() for keyword in keywords):
                # Save previous section
                if current_section:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = section_name
                current_content = []
                is_header = True
                break
        
        if not is_header and current_section:
            current_content.append(line_stripped)
    
    # Save last section
    if current_section:
        sections[current_section] = '\n'.join(current_content).strip()
    
    return sections


def extract_experience_bullets(experience_text: str) -> List[str]:
    """Extract bullet points from experience section."""
    if not experience_text:
        return []
    
    # Split by common bullet characters
    bullets = re.split(r'[•\-\*▪▫‣⁃]\s*', experience_text)
    bullets = [b.strip() for b in bullets if b.strip() and len(b.strip()) > 10]
    
    # Also try splitting by line breaks if no bullets found
    if len(bullets) <= 1:
        lines = experience_text.split('\n')
        bullets = [l.strip() for l in lines if l.strip() and len(l.strip()) > 10]
    
    return bullets[:20]  # Limit to 20 bullets


def parse_resume(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Main function to parse a resume file.
    Returns structured data with name, email, phone, sections, and bullets.
    """
    # Extract text based on file type
    if filename.lower().endswith('.pdf'):
        text = extract_text_from_pdf(file_content)
    elif filename.lower().endswith('.docx'):
        text = extract_text_from_docx(file_content)
    else:
        raise ValueError(f"Unsupported file type: {filename}")
    
    if not text or len(text.strip()) < 50:
        raise ValueError("Resume appears to be empty or too short")
    
    # Extract contact info
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    
    # Parse sections
    sections = parse_resume_sections(text)
    
    # Extract experience bullets
    experience_bullets = []
    if "experience" in sections:
        experience_bullets = extract_experience_bullets(sections["experience"])
    
    # Count entries (simple heuristic)
    education_count = len([s for s in sections.get("education", "").split('\n') if s.strip()]) if "education" in sections else 0
    experience_count = len(experience_bullets) if experience_bullets else 0
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "sections": sections,
        "experience_bullets": experience_bullets,
        "education_count": education_count,
        "experience_count": experience_count,
        "text_content": text,
    }

