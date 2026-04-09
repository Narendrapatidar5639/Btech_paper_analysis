import os
import json
from groq import Groq
from dotenv import load_dotenv
from django.conf import settings

# Docling Imports
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions

# .env file load karein
load_dotenv()

# 1. AI Analysis Function (Groq + .env)
def get_semantic_analysis(text):
    """
    AI logic to analyze paper text and return structured JSON.
    Optimized for Dashboard Frequency Charts and ChatGPT Redirection.
    """
    if not text or len(text) < 100:
        return {"topics": {}, "questions": {}}

    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("❌ GROQ_API_KEY not found in .env file!")
            return {"topics": {"Error": 0}, "questions": {}}

        client = Groq(api_key=api_key)
        
        # PROMPT UPDATED: To return Object instead of List for Dashboard compatibility
        prompt = f"""
        Analyze the following engineering exam paper text and return a strictly valid JSON object.
        1. Identify key topics and their importance percentage (0-100).
        2. Extract recurring or important questions and assign a frequency count (how many times it likely appeared or its priority).

        Text: {text[:5000]}

        CRITICAL: The "questions" field MUST be a dictionary/object where the KEY is the full question text and the VALUE is the frequency number.
        
        Response format MUST be exactly like this:
        {{
            "topics": {{"Topic Name": 40, "Another Topic": 60}},
            "questions": {{
                "What is the difference between CNN and RNN?": 3,
                "Explain Backpropagation algorithm in detail.": 5
            }}
        }}
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        content = chat_completion.choices[0].message.content
        analysis_result = json.loads(content)

        # Double Check: Agar AI ne galti se list bhej di, toh convert karein
        if isinstance(analysis_result.get("questions"), list):
            formatted_q = {q: 1 for q in analysis_result["questions"]}
            analysis_result["questions"] = formatted_q

        print("✅ AI Analysis Successful & Formatted for Dashboard")
        return analysis_result

    except Exception as e:
        print(f"❌ AI Analysis Error: {e}")
        return {
            "topics": {"General Analysis": 100},
            "questions": {"Error processing questions. Please check AI logs.": 0}
        }


# 2. OCR / PDF Processing Function (Docling)
def process_pdf_ocr(pdf_url_or_path, existing_text=None):
    """
    Extracts text from PDF using Docling. 
    Skips processing if existing_text is already present to save resources.
    """
    # SKIP if already processed
    if existing_text and len(existing_text.strip()) > 100:
        print("⏩ Skipping OCR: Text already exists in Database.")
        return existing_text

    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True 
    pipeline_options.do_table_structure = True

    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
        }
    )

    try:
        source = pdf_url_or_path
        
        # Local path handling improvement
        if not str(pdf_url_or_path).startswith(('http://', 'https://')):
            clean_path = str(pdf_url_or_path).lstrip('/')
            source = os.path.join(settings.BASE_DIR, clean_path)
            
            if not os.path.exists(source):
                source = pdf_url_or_path
                if not os.path.exists(source):
                    print(f"❌ File not found at: {source}")
                    return ""

        print(f"📄 Starting Docling OCR: {source}")
        result = converter.convert(source)
        
        extracted_text = result.document.export_to_markdown()

        if len(extracted_text.strip()) < 50:
            print("⚠️ Warning: Extracted text is too short.")
            return ""
            
        print(f"✅ OCR Successful! ({len(extracted_text)} chars)")
        return extracted_text

    except Exception as e:
        print(f"❌ Docling OCR Error: {e}")
        return ""