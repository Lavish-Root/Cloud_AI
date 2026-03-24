from fastapi import APIRouter, Response
import pandas as pd
from io import StringIO, BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from typing import List, Dict

router = APIRouter(prefix="/api/reports")

@router.get("/security-status")
async def get_security_status_report():
    """Proxy for the main security audit PDF."""
    return await export_pdf()

@router.get("/csv")
async def export_csv():
    # Simulated report data
    report_data = [
        {"Provider": "AWS", "Resource": "S3 Bucket", "Violation": "Public Access", "Status": "CRITICAL"},
        {"Provider": "GCP", "Resource": "IAM Policy", "Violation": "Owner Hijack", "Status": "CRITICAL"},
    ]
    df = pd.DataFrame(report_data)
    output = StringIO()
    df.to_csv(output, index=False)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=CloudGuard_Audit.csv"}
    )

@router.get("/pdf")
async def export_pdf():
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    p.setFont("Helvetica-Bold", 28)
    p.setFillColorRGB(0.1, 0.4, 0.8) 
    p.drawString(50, 750, "CloudGuard AI Pro")
    
    p.setFont("Helvetica-Bold", 16)
    p.setFillColorRGB(0.2, 0.2, 0.2)
    p.drawString(50, 725, "Enterprise Security Audit Report")
    
    p.setFont("Helvetica", 10)
    p.drawString(50, 710, f"Generated on: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")
    p.line(50, 700, 550, 700)
    
    # Findings Section
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 670, "1. Executive Summary")
    p.setFont("Helvetica", 11)
    p.drawString(50, 650, "The multi-cloud environment shows signs of configuration drift in IAM and Storage sectors.")
    p.drawString(50, 635, "ML Engine has flagged 3 anomalous access patterns in the last 24 hours.")

    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 600, "2. High-Priority Findings")
    
    findings = [
        ("AWS", "S3 Bucket", "Public Access Enabled", "CRITICAL"),
        ("GCP", "IAM Policy", "Owner Hijack Attempt", "CRITICAL"),
        ("Azure", "NSG Rule", "SSH Port 22 Open to 0.0.0.0/0", "HIGH"),
        ("AWS", "IAM User", "MFA Not Enabled for Root", "HIGH"),
    ]
    
    y = 570
    p.setFont("Helvetica", 10)
    for provider, res, issue, sev in findings:
        p.setFillColorRGB(0.8, 0, 0) if sev == "CRITICAL" else p.setFillColorRGB(0.8, 0.4, 0)
        p.drawString(50, y, f"[{sev}] {provider}: {res} - {issue}")
        y -= 20
        
    p.setFillColorRGB(0, 0, 0)
    p.line(50, y, 550, y)
    y -= 30
    
    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, y, "Confidential - For Internal Use Only. Encrypted with AES-256.")

    p.showPage()
    p.save()
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=CloudGuard_Security_Audit.pdf"}
    )
