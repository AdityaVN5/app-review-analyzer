# schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class AnalyzeRequest(BaseModel):
    app_id: str = "in.swiggy.android"
    days_to_fetch: int = 2
    country: str = "in"
    language: str = "en"

class ReviewItem(BaseModel):
    id: str
    date: str
    content: str
    score: int
    topic: Optional[str] = "Uncategorized"

class AnalysisResponse(BaseModel):
    app_id: str
    total_reviews: int
    taxonomy_detected: List[str]
    report_markdown: str
    processed_data_preview: List[ReviewItem]