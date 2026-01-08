# main.py
from fastapi import FastAPI, HTTPException
from schemas import AnalyzeRequest, AnalysisResponse
from services import fetch_reviews, classify_reviews, generate_report

app = FastAPI(title="Google Play Reviews AI Agent")

@app.get("/")
def home():
    return {"status": "Active", "usage": "Send POST request to /analyze"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_app_reviews(request: AnalyzeRequest):
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

        # Step 2: Classification
        processed_df, taxonomy = classify_reviews(df)

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
            processed_data_preview=preview_data
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0")