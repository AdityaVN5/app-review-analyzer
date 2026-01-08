from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class IngestRequest(BaseModel):
    app_id: str
    days: int
    target_date: str # YYYY-MM-DD
    language: str = "en"
    country: str = "in"

class ReviewItem(BaseModel):
    id: str
    date: str
    content: str
    rating: int
    topic: Optional[str] = "Uncategorized"

class DailyStat(BaseModel):
    topic: str
    counts: dict

class IngestResponse(BaseModel):
    reviews: List[ReviewItem]
    meta_token_count: int 

class ClassifyRequest(BaseModel):
    reviews: List[ReviewItem]
    app_id: str 

class ClassifyResponse(BaseModel):
    processed_reviews: List[ReviewItem]
    taxonomy: List[str]
    csv_download_url: str
    
class InsightRequest(BaseModel):
    processed_reviews: List[ReviewItem]
    taxonomy: List[str]
    days: int
    app_id: str 

class InsightResponse(BaseModel):
    report_markdown: str
    daily_stats: List[DailyStat]
    daily_stats_csv_download_url: str