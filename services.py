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
def fetch_reviews(app_id: str, days: int, target_date_str: str, lang: str = 'en', country: str = 'us') -> pd.DataFrame:
    print(f"🚀 Fetching reviews for {app_id}...")
    
    try:
        # Parse target date
        try:
             target_date = datetime.datetime.strptime(target_date_str, "%Y-%m-%d")
        except ValueError:
             target_date = datetime.datetime.fromisoformat(target_date_str.replace('Z', '+00:00')).replace(tzinfo=None)

        # Start date is target_date - days
        start_date = target_date - datetime.timedelta(days=days)
        # End date limit (exclusive) is target_date + 1 day
        end_date_limit = target_date + datetime.timedelta(days=1)
        
        all_reviews = []
        continuation_token = None
        
        # Determine how many to fetch. Since we can't filter by date API-side easily, 
        # we fetch a safe amount. 
        # If days is small, 1000 might be enough.
        max_fetch = 3000 
        fetched_count = 0
        
        while fetched_count < max_fetch:
            result, continuation_token = reviews(
                app_id,
                lang=lang,
                country=country,
                sort=Sort.NEWEST,
                count=200, 
                continuation_token=continuation_token
            )
            
            if not result: break
            
            batch_reviews = []
            for r in result:
                r_date = r['at'] # datetime object
                
                # Check if review is within range
                if start_date <= r_date < end_date_limit:
                    batch_reviews.append({
                        'id': r['reviewId'],
                        'date': r['at'],
                        'content': r['content'],
                        'rating': r['score'], # Standardizing on 'rating', previously 'score'
                        'app_id': app_id
                    })
                
            all_reviews.extend(batch_reviews)
            fetched_count += len(result)
            
            # Optimization: If the newest review in this batch is already older than our start_date?
            # No, 'reviews' returns NEWEST first. 
            # So if the OLDEST review in this batch is NEWER than end_date_limit, we keep fetching?
            # Wait. 
            # If batch has reviews [Today, Yesterday ...]. 
            # If we want [Last Week].
            # We skip newer ones until we find ones <= end_date_limit.
            # If the OLDEST in batch is OLDER than start_date, we can stop? Yes.
            
            oldest_in_batch = result[-1]['at'] # The last one is oldest
            if oldest_in_batch < start_date:
                print(f"Stopping fetch: Reached date {oldest_in_batch} which is older than {start_date}")
                break
                
        df = pd.DataFrame(all_reviews)
        if not df.empty:
             # Ensure we don't have duplicates if any
             df = df.drop_duplicates(subset=['id'])
             
        print(f"✅ Fetched {len(df)} reviews.")
        return df
        
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return pd.DataFrame()

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
        Output a SINGLE JSON object where keys are Review IDs and values are Categories.
        Format: {{"id1": "category", "id2": "category"}}
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
                elif isinstance(data, list):
                    # Handle case where model returns list of dicts [{"id": "cat"}, ...]
                    merged = {}
                    for item in data:
                        if isinstance(item, dict):
                            # Check if it's {"id": "val"} format or {"id": "...", "category": "..."}
                            # The prompt asks for {"id": "category"}
                            # So we assume item keys are ids.
                            merged.update(item)
                    return merged
                else:
                    print(f"⚠️ Batch response is not dict or list: {type(data)}")
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
    avg_rating = df.groupby('topic')['rating'].mean().round(2).to_string()
    
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
    Include: Executive Summary, Critical Issues, and Feature Requests.
    IMPORTANT: Return ONLY the markdown content. Do not include any conversational filler like "Here is the report". Start directly with the # Title.
    """
    
    model_pro = genai.GenerativeModel('gemini-2.5-pro') # Using Flash for speed/cost, switch to Pro if needed
    response = model_pro.generate_content(prompt)
    return response.text

# --- HELPERS ---
def save_reviews_to_csv(df: pd.DataFrame, app_id: str) -> str:
    """Saves the dataframe to a CSV file in the downloads directory."""
    filename = f"{app_id}_reviews.csv"
    filepath = os.path.join("downloads", filename)
    df.to_csv(filepath, index=False)
    return filename

def estimate_token_usage(df: pd.DataFrame) -> int:
    """Estimates token usage based on character count (1 token ~= 4 chars)."""
    if df.empty:
        return 0
    total_chars = df['content'].fillna('').astype(str).str.len().sum()
    return math.ceil(total_chars / 4)

def calculate_daily_stats(df: pd.DataFrame, days: int) -> list:
    """Aggregates review counts by topic and date."""
    if df.empty:
        return []

    # Ensure date is datetime
    df['date'] = pd.to_datetime(df['date'])
    df['date_str'] = df['date'].dt.strftime('%b %d') # e.g. "Jun 01"

    # Get last N days including today to ensure consistent columns
    end_date = datetime.datetime.now()
    dates = []
    for i in range(days, -1, -1):
        d = end_date - datetime.timedelta(days=i)
        dates.append(d.strftime('%b %d'))

    stats = []
    topics = df['topic'].unique()

    for topic in topics:
        topic_data = {'topic': topic, 'counts': {}}
        topic_df = df[df['topic'] == topic]
        
        # Count per date
        counts = topic_df['date_str'].value_counts().to_dict()
        
        # Fill all dates (even if 0) for frontend table consistency
        for d in dates:
            topic_data['counts'][d] = counts.get(d, 0)
            
        stats.append(topic_data)
        
    return stats

def save_daily_stats_to_csv(daily_stats: list, dates: list, app_id: str) -> str:
    """Saves daily stats to a wide-format CSV."""
    rows = []
    for stat in daily_stats:
        row = {'Topic': stat['topic']}
        for date in dates:
            row[date] = stat['counts'].get(date, 0)
        rows.append(row)
    
    df_stats = pd.DataFrame(rows)
    filename = f"{app_id}_daily_topic_volume.csv"
    filepath = os.path.join("downloads", filename)
    df_stats.to_csv(filepath, index=False)
    return filename
