from fastapi import APIRouter, Response
import pandas as pd
from io import StringIO, BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from typing import List, Dict
router = APIRouter(prefix="/api/reports")

# Dynamic Report Data (Starts empty to avoid "cached" mock data)
report_data: List[Dict] = []

@router.get("/csv")
async def export_csv():
    df = pd.DataFrame(report_data)
    output = StringIO()
    df.to_csv(output, index=False)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=security_report.csv"}
    )

@router.get("/pdf")
async def export_pdf():
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.setFont("Helvetica-Bold", 24)
    p.drawString(100, 750, "CloudGuard AI - Security Report")
    
    p.setFont("Helvetica", 12)
    p.drawString(100, 720, f"Date: {pd.Timestamp.now()}")
    
    y = 680
    for item in report_data:
        p.drawString(100, y, f"- {item['Resource']} ({item['Provider']}): {item['Violation']} | {item['Status']}")
        y -= 25
        
    p.showPage()
    p.save()
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=security_report.pdf"}
    )
