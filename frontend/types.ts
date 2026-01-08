export interface SampleReview {
  date: string;
  content: string;
  score: number;
}

export interface IngestionData {
  totalReviews: number;
  tokenCount: number;
  savedPath: string;
  samples: SampleReview[];
}

export interface CategoryStat {
  topic: string;
  count: number;
}

export interface Taxonomy {
  issues: string[];
  features: string[];
  themes: string[];
}

export interface ClassificationData {
  totalReviews: number;
  taxonomy: string[];
  distribution: CategoryStat[];
  savedPath: string;
  csvDownloadUrl?: string; // Optional URL for downloading the CSV
}

// Keeping Review interface for legacy or future detail views
export interface Review {
  id: string;
  text: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  severity: 'low' | 'medium' | 'high';
}

export interface DailyStat {
  topic: string;
  counts: { [date: string]: number };
}

export interface Insights {
  trends: string[];
  risks: string[];
  recommendations: string[];
  dailyStats: DailyStat[];
  markdownReport: string;
  dailyStatsCsvDownloadUrl?: string;
}

export interface PipelineState {
  stage: 0 | 1 | 2 | 3;
  status: 'idle' | 'loading' | 'complete';
  ingestion: IngestionData | null;
  classification: ClassificationData | null; // Replaced reviews list with aggregated stats
  insights: Insights | null;
}

export interface PipelineConfig {
  appName: string;
  targetDate: string;
  lookupDays: number;
}

export interface ReviewItem {
    id: string;
    date: string;
    content: string;
    score: number;
    topic: string;
}

export interface AnalysisResponse {
    app_id: string;
    total_reviews: number;
    taxonomy_detected: string[];
    report_markdown: string;
    processed_data_preview: ReviewItem[];
    token_count: number;
    csv_download_url: string;
    daily_stats: DailyStat[];
    daily_stats_csv_download_url: string;
}