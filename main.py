# main.py
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.requests import Request
from schemas import AnalyzeRequest, AnalysisResponse
from services import fetch_reviews, classify_reviews, generate_report, save_reviews_to_csv, estimate_token_usage, calculate_daily_stats, save_daily_stats_to_csv
import os
import datetime

# Create downloads directory if not exists
os.makedirs("downloads", exist_ok=True)

app = FastAPI(title="Google Play Reviews AI Agent")

# Mount downloads directory
app.mount("/downloads", StaticFiles(directory="downloads"), name="downloads")

@app.get("/")
def home():
    return {"status": "Active", "usage": "Send POST request to /analyze"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_app_reviews(request: AnalyzeRequest, req: Request):
    try:
        # Step 1: Ingestion
        df = fetch_reviews(
            request.app_id, 
            request.days_to_fetch, 
            request.language, 
            request.country
        )
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No reviews found for this period.")

        # Step 1.5: Calculate Token Usage
        token_count = estimate_token_usage(df)

        # Step 2: Classification
        processed_df, taxonomy = classify_reviews(df)

        # Step 2.5: Save Processed Data CSV
        csv_filename = save_reviews_to_csv(processed_df, request.app_id)
        
        # Step 2.6: Calculate & Save Daily Stats
        daily_stats = calculate_daily_stats(processed_df, request.days_to_fetch)
        
        # Generate date keys for CSV header
        end_date = datetime.datetime.now()
        dates_header = []
        for i in range(request.days_to_fetch, -1, -1):
            d = end_date - datetime.timedelta(days=i)
            dates_header.append(d.strftime('%b %d'))
            
        stats_csv_filename = save_daily_stats_to_csv(daily_stats, dates_header, request.app_id)

        # Construct full download URLs
        base_url = str(req.base_url).rstrip("/")
        download_url = f"{base_url}/downloads/{csv_filename}"
        stats_download_url = f"{base_url}/downloads/{stats_csv_filename}"

        # Step 3: Analysis
        report = generate_report(processed_df, taxonomy, request.days_to_fetch)

        # Prepare Response
        # Convert first 10 rows to dict for preview
        preview_data = processed_df.head(10).to_dict(orient="records")
        # Ensure dates are strings for JSON serialization
        for item in preview_data:
            item['date'] = str(item['date'])

        return AnalysisResponse(
            app_id=request.app_id,
            total_reviews=len(processed_df),
            taxonomy_detected=taxonomy,
            report_markdown=report,
            processed_data_preview=preview_data,
            token_count=token_count,
            csv_download_url=download_url,
            daily_stats=daily_stats,
            daily_stats_csv_download_url=stats_download_url
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0")