import uvicorn
import fitz
import easyocr
import requests
import tempfile
import io
from PIL import Image
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI(title="OCR API")

reader = easyocr.Reader(['en'])  # Load once at startup

class OCRRequest(BaseModel):
    pdf_url: str

@app.post("/ocr")
def extract_text(request: OCRRequest):
    url = request.pdf_url
    print(f"Downloading PDF from {url}")
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Download error: {str(e)}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        temp_pdf.write(response.content)
        pdf_path = temp_pdf.name

    pdf_document = fitz.open(pdf_path)
    all_text = []
    lengthpdf=len(pdf_document)
    if(lengthpdf > 10):
        print("Upload a size smaller than 10")
        return
       
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        print(page)
        typed_text = page.get_text()

        # Convert page to high-res image
        mat = fitz.Matrix(300 / 72, 300 / 72)
        pix = page.get_pixmap(matrix=mat)
        img = Image.open(io.BytesIO(pix.tobytes("png")))

        ocr_results = reader.readtext(np.array(img), detail=0)
        ocr_text = '\n'.join(ocr_results)

        page_text = f"\n--- PAGE {page_num + 1} ---\n"
        if typed_text.strip():
            page_text += typed_text + "\n"
        if ocr_text.strip():
            page_text += ocr_text + "\n"

        all_text.append(page_text)

    pdf_document.close()
    final_text = '\n'.join(all_text)

    return {"text": final_text}


if __name__ == "__main__":
        
    print("🚀 Starting OCR FastAPI server on http://localhost:8000 ...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)