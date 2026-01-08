import { Review, Insights, PipelineConfig, DailyStat, IngestionData, ClassificationData } from '../types';

// Utilities for simulation delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_INGESTION_DATA: IngestionData = {
  totalReviews: 447,
  tokenCount: 5167,
  savedPath: "/kaggle/working/in.swiggy.android_raw_reviews.csv",
  samples: [
    { date: "2026-01-06 08:24:47", content: "worst app don't buy any thing from Instamart.....", score: 1 },
    { date: "2026-01-06 08:19:23", content: "good", score: 5 },
    { date: "2026-01-06 08:17:28", content: "Best", score: 5 },
    { date: "2026-01-06 08:10:32", content: "login problem too much", score: 1 },
    { date: "2026-01-06 08:10:25", content: "good", score: 3 },
    { date: "2026-01-06 08:07:26", content: "good", score: 5 },
    { date: "2026-01-06 08:05:37", content: "good app", score: 5 },
    { date: "2026-01-06 08:02:52", content: "Worst technical team and support team. Was one...", score: 1 },
    { date: "2026-01-06 08:01:45", content: "food taste very good 😋", score: 5 },
    { date: "2026-01-06 07:59:19", content: "total froud worst app.full itam not delivered", score: 1 },
  ]
};

const MOCK_CLASSIFICATION: ClassificationData = {
  totalReviews: 447,
  taxonomy: [
    'Delivery Delays', 
    'Order Accuracy/Missing Items', 
    'Customer Support Issues', 
    'Pricing & Fees', 
    'Payment Method Issues', 
    'App Usability/Technical Issues', 
    'Uncategorized'
  ],
  distribution: [
    { topic: 'Uncategorized', count: 334 },
    { topic: 'Delivery Delays', count: 35 },
    { topic: 'Customer Support Issues', count: 28 },
    { topic: 'Order Accuracy/Missing Items', count: 21 },
    { topic: 'App Usability/Technical Issues', count: 11 },
    { topic: 'Pricing & Fees', count: 11 },
    { topic: 'Payment Method Issues', count: 7 }
  ],
  savedPath: "/kaggle/working/in.swiggy.android_processed_reviews.csv"
};

const REPORT_CONTENT = `Strategic Trend Analysis Report: User Feedback (Last 48 Hours)
To: Leadership & Engineering Teams From: Head of Product Date: [Current Date] Subject: Analysis of Recent User Feedback & Immediate Action Plan

1. Executive Summary
While we see a high volume of generic positive feedback, our core service delivery is facing a crisis. Critical operational areas such as delivery, order accuracy, and customer support are failing, resulting in extremely low sentiment scores (averaging 1.1-1.6 out of 5) and creating significant user frustration. These issues are actively eroding user trust and require immediate, focused intervention to prevent churn and reputational damage.

2. Critical Issues (Red Flags)
Our analysis highlights three interconnected areas that are severely underperforming. These are not isolated complaints but patterns indicating systemic problems.

Core Fulfillment Failure (Delivery & Accuracy):
Data: "Delivery Delays" is our second-highest specific complaint category (35 mentions) with a sentiment of 1.40/5. "Order Accuracy/Missing Items" follows closely with 21 mentions and a 1.67/5 sentiment.
Analysis: Our fundamental promise of delivering the correct items on time is broken. Verbatims mention "constant delays," "ETA that changes in every minute," and receiving "expired and cheap quality products." The fact that even premium "Swiggy Black" members are experiencing this indicates a deep operational issue, not just an edge case. This is our most significant business risk.

Support System Breakdown:
Data: "Customer Support Issues" has the lowest sentiment score across all topics (1.14/5) with a high volume of 28 mentions.
Analysis: Our support system is actively making bad situations worse. Users report that their issues are "not resolved" and describe the service as the "worst." This means that when our core fulfillment fails, users have no effective recourse, turning a single bad experience into a reason to abandon the app entirely.

Trust & Transparency Gaps (Pricing & Payments):
Data: "Pricing & Fees" has a critically low sentiment of 1.36/5. "Payment Method Issues" also shows problems, with verbatims citing un-refunded failed payments.
Analysis: Users feel cheated. Complaints about high delivery charges are compounded by reports of being "charged more money after the order was placed." Furthermore, the failure to refund money from failed transactions is a cardinal sin in e-commerce, causing irreparable damage to user trust.

3. Feature Requests & Feedback
Beneath the frustration, users are telling us what they need to see improved:

- Reliable Issue Resolution: Users want a simple, in-app process to report missing, wrong, or expired items with photo/video evidence. The current system is perceived as a dead end.
- Transparent Checkout: Users are demanding clarity on costs. The checkout screen must explicitly break down all charges (item cost, delivery fee, taxes, etc.) before the payment is confirmed to eliminate surprises.
- Accurate Delivery ETAs: The fluctuating ETA is a major source of frustration. Users need a reliable and accurate real-time tracking experience.
- Core App Stability: Critical bugs, such as the "minimum amount in cart page shows 1999" and login problems, are blocking basic usability and must be fixed.

4. Action Plan
Based on this analysis, I am directing our teams to prioritize the following three initiatives immediately:

Form a "Fulfillment Task Force" (Lead: Ops & Product):
Action: Assemble a cross-functional team (Product, Ops, Eng) to map the entire order lifecycle from placement to delivery.
Objective: Identify the top 3 root causes of delays and inaccuracies within one week. Propose and begin implementing operational (e.g., picker training, inventory checks) and technical (e.g., inventory sync logic, ETA algorithm refinement) fixes in the next sprint.

Prioritize a "Self-Serve Resolution Flow" (Lead: Product & Eng):
Action: Immediately scope and begin development of an enhanced in-app "Report an Issue" feature.
Objective: In the next 2-3 sprints, deliver a flow where users can select specific items from an order, report a problem (missing, damaged, expired), upload photo evidence, and trigger an automated refund or credit. This will provide immediate resolution for users and reduce the load on our failing support channels.

Launch a "Trust & Stability" Sprint (Lead: Eng & Design):
Action: Dedicate the next engineering sprint to fixing critical financial and trust-related issues.
Objective: a) Resolve the "payment failed, money deducted" bug as the #1 priority. b) Fix the cart value and login bugs. c) Redesign the checkout UI to provide a crystal-clear, itemized cost breakdown before a user confirms their order.`;

const generateMockDailyStats = (config: PipelineConfig): DailyStat[] => {
  const stats: DailyStat[] = [
    { topic: 'Delivery Issue', counts: {} },
    { topic: 'Food Stale', counts: {} },
    { topic: 'App Crash', counts: {} },
    { topic: 'Login Error', counts: {} }
  ];

  const target = new Date(config.targetDate);
  const days = config.lookupDays;
  
  // Generate dates: [Target - Days, ..., Target]
  const dates: string[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(target);
    d.setDate(d.getDate() - i);
    // Format: "Jun 1"
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push(dateStr);
  }

  // Fill mock random data
  stats.forEach(stat => {
    dates.forEach(date => {
      stat.counts[date] = Math.floor(Math.random() * 25);
    });
  });

  return stats;
};

export const api = {
  runIngestion: async (config: PipelineConfig): Promise<IngestionData> => {
    await delay(2000); // Simulate Cell 1 processing
    return MOCK_INGESTION_DATA;
  },
  classifyReviews: async (ingestionData: IngestionData): Promise<ClassificationData> => {
    await delay(2500); // Simulate Cell 2 processing
    return MOCK_CLASSIFICATION;
  },
  synthesizeInsights: async (classificationData: ClassificationData, config: PipelineConfig): Promise<Insights> => {
    await delay(3000); // Simulate Cell 3 processing
    
    return {
      trends: [
        "Positive reception of the new Dark Mode feature.",
        "Increasing user frustration regarding payment stability.",
        "Stability issues specifically on the Settings screen."
      ],
      risks: [
        "High churn risk due to recurring 'Double Charge' reports.",
        "Potential app store rating drop from crash reports."
      ],
      recommendations: [
        "Prioritize fix for the Settings screen crash (Severity: High).",
        "Audit the payment gateway webhook to prevent double charges.",
        "Investigate notification delivery latency."
      ],
      dailyStats: generateMockDailyStats(config),
      markdownReport: REPORT_CONTENT
    };
  }
};