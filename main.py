# main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    IngestRequest, IngestResponse, 
    ClassifyRequest, ClassifyResponse, 
    InsightRequest, InsightResponse
)
from services import (
    fetch_reviews, classify_reviews, generate_report, 
    save_reviews_to_csv, estimate_token_usage, 
    calculate_daily_stats, save_daily_stats_to_csv
)
import os
import datetime
import pandas as pd

# Create downloads directory if not exists
os.makedirs("downloads", exist_ok=True)

app = FastAPI(title="Google Play Reviews AI Agent")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount downloads directory
app.mount("/downloads", StaticFiles(directory="downloads"), name="downloads")

@app.get("/")
def home():
    return {"status": "Active", "usage": "Use /stage/1/ingest, /stage/2/classify, /stage/3/insight"}

@app.post("/stage/1/ingest", response_model=IngestResponse)
async def ingest_stage(request: IngestRequest):
    try:
        # Step 1: Ingestion
        df = fetch_reviews(
            request.app_id, 
            request.days, 
            request.target_date,
            request.language, 
            request.country
        )
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No reviews found for this period.")

        # Step 1.5: Calculate Token Usage (Metadata)
        token_count = estimate_token_usage(df)
        
        # Convert to list of dicts for response
        # Ensure dates are strings
        reviews_data = df.to_dict(orient="records")
        for item in reviews_data:
            item['date'] = str(item['date'])
        
        return IngestResponse(
            reviews=reviews_data,
            meta_token_count=token_count
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stage/2/classify", response_model=ClassifyResponse)
async def classify_stage(request: ClassifyRequest, req: Request):
    try:
        # Reconstruct DataFrame from request
        df = pd.DataFrame([r.dict() for r in request.reviews])
        
        # Step 2: Classification
        processed_df, taxonomy = classify_reviews(df)

        # Step 2.5: Save Processed Data CSV
        csv_filename = save_reviews_to_csv(processed_df, request.app_id)
        base_url = str(req.base_url).rstrip("/")
        download_url = f"{base_url}/downloads/{csv_filename}"
        
        # Prepare response
        processed_data = processed_df.to_dict(orient="records")
        for item in processed_data:
            item['date'] = str(item['date'])

        return ClassifyResponse(
            processed_reviews=processed_data,
            taxonomy=taxonomy,
            csv_download_url=download_url
        )
    except Exception as e:
        print(f"Classification Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stage/3/insight", response_model=InsightResponse)
async def insight_stage(request: InsightRequest, req: Request):
    try:
        # Reconstruct DataFrame
        df = pd.DataFrame([r.dict() for r in request.processed_reviews])
        
        # Step 2.6: Calculate & Save Daily Stats
        daily_stats = calculate_daily_stats(df, request.days)
        
        # Generate date keys for CSV header
        end_date = datetime.datetime.now()
        dates_header = []
        for i in range(request.days, -1, -1):
            d = end_date - datetime.timedelta(days=i)
            dates_header.append(d.strftime('%b %d'))
            
        stats_csv_filename = save_daily_stats_to_csv(daily_stats, dates_header, request.app_id)
        
        base_url = str(req.base_url).rstrip("/")
        stats_download_url = f"{base_url}/downloads/{stats_csv_filename}"

        # Step 3: Analysis
        report = generate_report(df, request.taxonomy, request.days)

        return InsightResponse(
            report_markdown=report,
            daily_stats=daily_stats,
            daily_stats_csv_download_url=stats_download_url
        )

    except Exception as e:
        print(f"Insight Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
