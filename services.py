# services.py
import os
import datetime
import json
import time
import math
import google.generativeai as genai
import pandas as pd
from google_play_scraper import Sort, reviews
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

load_dotenv()

# Configure GenAI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# --- SERVICE 1: INGESTION (Cell 1 Logic) ---
def fetch_reviews(app_id: str, days: int, lang: str, country: str) -> pd.DataFrame:
    print(f"🚀 Fetching reviews for {app_id}...")
    
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=days)
    
    all_reviews = []
    continuation_token = None
    
    while True:
        result, continuation_token = reviews(
            app_id,
            lang=lang,
            country=country,
            sort=Sort.NEWEST,
            count=200, 
            continuation_token=continuation_token
        )
        
        if not result: break
        
        oldest_in_batch = result[-1]['at']
        
        for r in result:
            if r['at'] >= start_date:
                all_reviews.append({
                    'id': r['reviewId'],
                    'date': r['at'],
                    'content': r['content'],
                    'score': r['score'],
                    'app_id': app_id
                })
        
        if oldest_in_batch < start_date:
            break
            
    df = pd.DataFrame(all_reviews)
    print(f"✅ Fetched {len(df)} reviews.")
    return df

# --- SERVICE 2: CLASSIFICATION (Cell 2 Logic) ---
def classify_reviews(df: pd.DataFrame) -> tuple[pd.DataFrame, list]:
    if df.empty:
        return df, []

    model_flash = genai.GenerativeModel('gemini-2.5-flash') # Updated to latest stable Flash

    # 1. Taxonomy Discovery
    print("🔍 Pass 1: Discovering Taxonomy...")
    sample_reviews = df['content'].sample(min(100, len(df)), random_state=42).tolist()
    sample_text = "\n".join([f"- {r[:150]}" for r in sample_reviews])
    
    discovery_prompt = f"""
    Analyze these user reviews for a food delivery/utility app.
    Identify the Top 6 distinct categories.
    Output ONLY a valid JSON list of strings.
    Reviews: {sample_text}
    """
    
    taxonomy = ["General"]
    try:
        response = model_flash.generate_content(discovery_prompt)
        cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
        taxonomy = json.loads(cleaned_text)
        if "Uncategorized" not in taxonomy: taxonomy.append("Uncategorized")
    except Exception as e:
        print(f"⚠️ Taxonomy fallback: {e}")
        taxonomy = ["Delivery Issues", "App Bugs", "Food Quality", "Refunds", "Positive Feedback", "Uncategorized"]

    # 2. Parallel Classification Helper
    def process_batch(batch_df, taxonomy_list):
        batch_text = ""
        for _, row in batch_df.iterrows():
            clean_text = str(row['content']).replace('\n', ' ').replace('"', "'")[:200]
            batch_text += f"{row['id']}: {clean_text}\n"
        
        prompt = f"""
        Map each Review ID to exactly ONE category from: {taxonomy_list}
        Output strict JSON: {{"id": "category"}}
        Reviews:
        {batch_text}
        """
        
        for attempt in range(3):
            try:
                resp = model_flash.generate_content(
                    prompt, 
                    generation_config={"response_mime_type": "application/json"}
                )
                data = json.loads(resp.text)
                if isinstance(data, dict):
                    return data
                else:
                    print(f"⚠️ Batch response is not a dict: {type(data)}")
                    return {}
            except Exception as e:
                print(f"⚠️ Error parsing batch JSON (attempt {attempt+1}): {e}")
                time.sleep(1) # Backoff
        return {}

    # 3. Execution
    print(f"🚀 Pass 2: Classifying {len(df)} reviews...")
    batch_size = 50
    batches = [df.iloc[i:i+batch_size] for i in range(0, len(df), batch_size)]
    review_category_map = {}

    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_batch = {executor.submit(process_batch, b, taxonomy): b for b in batches}
        for future in as_completed(future_to_batch):
            try:
                batch_result = future.result()
                if isinstance(batch_result, dict):
                    review_category_map.update(batch_result)
                else:
                    print(f"⚠️ Skipping non-dict batch result: {type(batch_result)}")
            except Exception as e:
                print(f"⚠️ Thread error: {e}")

    df['topic'] = df['id'].map(review_category_map).fillna("Uncategorized")
    return df, taxonomy

# --- SERVICE 3: ANALYSIS (Cell 3 Logic) ---
def generate_report(df: pd.DataFrame, taxonomy: list, days: int) -> str:
    print("🧠 Generative Report...")
    
    # Statistics
    topic_counts = df['topic'].value_counts().to_string()
    avg_rating = df.groupby('topic')['score'].mean().round(2).to_string()
    
    # Examples
    examples_text = ""
    for topic in taxonomy:
        if topic in df['topic'].values:
            samples = df[df['topic'] == topic]['content'].head(3).tolist()
            examples_text += f"\nTopic: {topic}\nExamples: {samples}\n"

    # Analysis Prompt
    prompt = f"""
    You are the Head of Product. Analyze this data from the last {days} days.
    
    Data:
    1. Volume: {topic_counts}
    2. Sentiment: {avg_rating}
    3. Verbatim: {examples_text}
    
    Write a Strategic Trend Analysis Report in Markdown.
    Include: Executive Summary, Critical Issues, Feature Requests, and Action Plan.
    """
    
    model_pro = genai.GenerativeModel('gemini-2.5-pro') # Using Flash for speed/cost, switch to Pro if needed
    response = model_pro.generate_content(prompt)
    return response.text