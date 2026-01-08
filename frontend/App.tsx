import React, { useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { StageContainer } from './components/StageContainer';
import { IngestionView } from './components/IngestionView';
import { ClassificationView } from './components/ClassificationView';
import { InsightsView } from './components/InsightsView';
import { api } from './services/api';
import { PipelineState, PipelineConfig } from './types';

const INITIAL_STATE: PipelineState = {
  stage: 0,
  status: 'idle',
  ingestion: null,
  classification: null,
  insights: null,
};

function App() {
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  
  // Configuration State
  const [config, setConfig] = useState<PipelineConfig>({
    appName: '', 
    targetDate: new Date().toISOString().split('T')[0],
    lookupDays: 2
  });

  // Additional State
  const [logs, setLogs] = useState<string[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);

  const runPipeline = useCallback(async () => {
    // Reset and start loading
    setState({ ...INITIAL_STATE, status: 'loading', stage: 1 });
    setLogs([]);
    setTotalTime(0);
    const startTime = Date.now();

    try {
      const appId = config.appName.includes('id=') ? config.appName.split('id=')[1].split('&')[0] : config.appName;

      // --- STAGE 1: INGESTION ---
      setLogs(prev => [...prev, `🚀 Fetching reviews for ${appId}...`]);
      const ingestRes = await api.ingest(config);
      
      const ingestionData = {
          totalReviews: ingestRes.reviews.length,
          tokenCount: ingestRes.meta_token_count,
          savedPath: "memory",
          samples: ingestRes.reviews.slice(0, 10).map((r: any) => ({
              id: r.id,
              date: r.date,
              content: r.content,
              rating: r.rating
          }))
      };

      setLogs(prev => [...prev, `✅ Fetched ${ingestRes.reviews.length} reviews.`]);
      setState(prev => ({
          ...prev,
          ingestion: ingestionData,
          stage: 2, 
      }));

      // --- STAGE 2: CLASSIFICATION ---
      setLogs(prev => [...prev, `🔍 Pass 1: Discovering Taxonomy...`]);
      // Artificial delay for visuals if needed, or just let API time it. 
      // The user wants "Cell 1 should display output after fetching...". Done by setting stage 2.

      setLogs(prev => [...prev, `🚀 Pass 2: Classifying ${ingestRes.reviews.length} reviews...`]);
      const classifyRes = await api.classify(ingestRes.reviews, appId);
      
      const classificationData = {
            totalReviews: ingestRes.reviews.length,
            taxonomy: classifyRes.taxonomy,
            distribution: api.calculateDistribution(classifyRes.processed_reviews.slice(0, 50), classifyRes.taxonomy), // Sample distribution
            savedPath: "memory",
            csvDownloadUrl: classifyRes.csv_download_url
      };

      setState(prev => ({
          ...prev,
          classification: classificationData,
          stage: 3,
      }));

      // --- STAGE 3: INSIGHTS ---
      setLogs(prev => [...prev, `🧠 Generative Report...`]);
      const insightRes = await api.insight(classifyRes.processed_reviews, classifyRes.taxonomy, config.lookupDays, appId);

      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      setTotalTime(timeTaken);

      const insightsData = {
            trends: [], 
            risks: [],  
            recommendations: [], 
            dailyStats: insightRes.daily_stats,
            markdownReport: insightRes.report_markdown,
            dailyStatsCsvDownloadUrl: insightRes.daily_stats_csv_download_url
      };

      setState(prev => ({
          ...prev,
          insights: insightsData,
          status: 'complete'
      }));

      setLogs(prev => [...prev, `✨ Analysis Complete in ${timeTaken.toFixed(2)}s`]);

    } catch (error) {
      console.error("Pipeline failed", error);
      setState(prev => ({ ...prev, status: 'idle' })); 
      setLogs(prev => [...prev, `❌ Error: ${error}`]);
      alert("Failed to connect to backend or process data.");
    }
  }, [config]);

  const resetPipeline = () => {
    setState(INITIAL_STATE);
  };

  const handleConfigChange = (field: keyof PipelineConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const isRunning = state.status === 'loading';
  const isComplete = state.status === 'complete';

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-zinc-900 rounded-sm"></div>
            <span className="font-medium tracking-tight text-sm">Review Analyst</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono text-zinc-400">v1.0.2</span>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-6 text-zinc-900">
            Autonomous Review <br className="hidden md:block"/> Intelligence Pipeline
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed mb-8">
            A three-stage agentic workflow that transforms raw unstructured user feedback into actionable product insights using semantic taxonomy induction.
          </p>
          
          {/* Configuration Inputs */}
          <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 max-w-3xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* App Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2" htmlFor="appName">
                  Play Store Link
                </label>
                <input
                  id="appName"
                  type="text"
                  value={config.appName}
                  onChange={(e) => handleConfigChange('appName', e.target.value)}
                  disabled={isRunning || isComplete}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow disabled:opacity-50"
                  placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2" htmlFor="targetDate">
                  Target Date
                </label>
                <input
                  id="targetDate"
                  type="date"
                  value={config.targetDate}
                  onChange={(e) => handleConfigChange('targetDate', e.target.value)}
                  disabled={isRunning || isComplete}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow disabled:opacity-50"
                />
              </div>

              {/* Lookup Days */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2" htmlFor="lookupDays">
                  Lookup Days
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="lookupDays"
                    type="number"
                    min="1"
                    max="30"
                    value={config.lookupDays}
                    onChange={(e) => handleConfigChange('lookupDays', parseInt(e.target.value) || 0)}
                    disabled={isRunning || isComplete}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow disabled:opacity-50"
                  />
                  <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Days prior</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={runPipeline}
              disabled={isRunning || isComplete}
              className={`
                group flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm
                ${isRunning || isComplete 
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-md hover:ring-2 hover:ring-zinc-200 hover:ring-offset-2'}
              `}
            >
              {isRunning ? (
                <>Processing...</>
              ) : isComplete ? (
                <>Analysis Complete</>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Start Analysis
                </>
              )}
            </button>

            {isComplete && (
              <button
                onClick={resetPipeline}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-zinc-600 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </header>

        {/* Pipeline Stages */}
        <div className="space-y-0 relative">
          
          {/* Vertical Line Connector (Background) */}
          <div className="absolute left-[9px] top-4 bottom-0 w-px bg-zinc-100 -z-10"></div>

          {/* Stage 1: Ingestion */}
          <StageContainer
            stepNumber="01"
            title="Data Ingestion"
            description={`Fetching raw reviews for ${config.appName}, calculating token usage, and preparing dataset.`}
            agentName="Ingestion Agent"
            status={
              state.stage === 0 ? 'waiting' :
              state.stage === 1 && state.ingestion === null ? 'loading' : 'complete'
            }
          >
            {state.ingestion && <IngestionView data={state.ingestion} />}
          </StageContainer>

          {/* Stage 2: Classification */}
          <StageContainer
            stepNumber="02"
            title="Review Classification"
            description="Agent applies the discovered taxonomy to label every review and generate category statistics."
            agentName="Classification Agent"
            status={
              state.stage < 2 ? 'waiting' :
              state.stage === 2 && state.classification === null ? 'loading' : 'complete'
            }
          >
            {state.classification && <ClassificationView data={state.classification} logs={logs} />}
          </StageContainer>

          {/* Stage 3: Synthesis */}
          <StageContainer
            stepNumber="03"
            title="Insight Synthesis"
            description={`Agent aggregates classified data from ${config.lookupDays} days prior to ${config.targetDate} to identify trends.`}
            agentName="Synthesis Agent"
            status={
              state.stage < 3 ? 'waiting' :
              state.stage === 3 && state.insights === null ? 'loading' : 'complete'
            }
          >
            {state.insights && <InsightsView data={state.insights} totalTime={totalTime} />}
          </StageContainer>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-10 mt-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-zinc-400 text-sm">
          <p>© 2024 Intelligence Pipeline. System status: Operational.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;