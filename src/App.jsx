import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  Clock, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Webhook, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ShieldAlert, 
  CheckCircle,
  Database,
  Upload,
  CheckCircle2 as CheckCircleIcon,
  Download,
  AlertCircle,
  FileCode,
  DollarSign
} from 'lucide-react';
import './App.css';

// Default preloaded test sets
const DEFAULT_REGISTRY = [
  {
    id: 'set-1',
    name: 'bangkok-search-golden-set',
    itemCount: 5,
    creator: 'Agoda ML Platform',
    dateCreated: '2026-06-20',
    targetService: 'hotel-recommendations-RAG',
    items: [
      {
        test_id: 'bk-01',
        prompt: "Find family hotels in Bangkok under $100 with pool.",
        reference_context: "Hotel Indigo: $95, pool, central. Bangkok Palace: $60, pool, family rooms. Siam Resort: $120, pool.",
        ground_truth: "Here are two options in Bangkok under $100 with pools:\n1. Bangkok Palace ($60/night) - features family rooms and pool.\n2. Hotel Indigo ($95/night) - offers central location and pool."
      },
      {
        test_id: 'bk-02',
        prompt: "Show me breakfast options at Siam Resort.",
        reference_context: "Siam Resort breakfast: buffet style from 6:30 AM to 10:30 AM, international cuisine, $15.",
        ground_truth: "Siam Resort offers an international buffet breakfast served from 6:30 AM to 10:30 AM. It costs $15 per person."
      },
      {
        test_id: 'bk-03',
        prompt: "Find pet friendly boutique hotels in Phuket.",
        reference_context: "Phuket Boutique Stay: pets allowed with $20 fee. Kata beach resort: no pets allowed. Rawai Oasis: dogs under 10kg, no fee.",
        ground_truth: "Here are boutique options in Phuket:\n1. Phuket Boutique Stay (allows pets for a $20 fee).\n2. Rawai Oasis (allows small dogs under 10kg for free)."
      },
      {
        test_id: 'bk-04',
        prompt: "Does Bangkok Palace offer airport shuttle?",
        reference_context: "Bangkok Palace does not have a private shuttle, but recommends the public airport rail link nearby.",
        ground_truth: "Bangkok Palace does not offer a private shuttle service. However, they recommend using the nearby public airport rail link."
      },
      {
        test_id: 'bk-05',
        prompt: "What is the cancellation policy for Hotel Indigo?",
        reference_context: "Cancellation is free up to 24 hours before check-in. Within 24 hours, a 1-night fee applies.",
        ground_truth: "You can cancel free of charge up to 24 hours before your check-in. If you cancel within 24 hours, you will be charged a 1-night fee."
      }
    ]
  },
  {
    id: 'set-2',
    name: 'cancellation-policy-tests',
    itemCount: 3,
    creator: 'Applied AI Team',
    dateCreated: '2026-06-18',
    targetService: 'hotel-recommendations-RAG',
    items: [
      {
        test_id: 'cx-01',
        prompt: "Can I cancel my Siam Resort booking?",
        reference_context: "Siam Resort bookings are non-refundable within 48 hours of check-in. Otherwise free cancellation.",
        ground_truth: "You can cancel Siam Resort free of charge if it is more than 48 hours before check-in. Within 48 hours, it is non-refundable."
      },
      {
        test_id: 'cx-02',
        prompt: "What is the fee for late cancellation at Kata beach?",
        reference_context: "Kata beach resort late cancellation fee is 50% of the total booking price.",
        ground_truth: "The fee for late cancellation at Kata beach resort is 50% of your total booking price."
      },
      {
        test_id: 'cx-03',
        prompt: "Is my booking at Skytrain Lodge refundable?",
        reference_context: "Skytrain Lodge bookings are fully refundable up to 7 days before check-in.",
        ground_truth: "Your booking at Skytrain Lodge is fully refundable if cancelled at least 7 days before check-in."
      }
    ]
  }
];

// Preloaded 6-week SLA history for VP Panel
const INITIAL_SLA_HISTORY = [
  { week: 'Wk 20', qualityScore: 0.88, latencySla: 95.2, spend: 140, copq: 12 },
  { week: 'Wk 21', qualityScore: 0.89, latencySla: 96.1, spend: 145, copq: 8 },
  { week: 'Wk 22', qualityScore: 0.87, latencySla: 94.8, spend: 160, copq: 18 },
  { week: 'Wk 23', qualityScore: 0.85, latencySla: 93.5, spend: 175, copq: 25 },
  { week: 'Wk 24', qualityScore: 0.89, latencySla: 95.8, spend: 155, copq: 9 },
  { week: 'Wk 25', qualityScore: 0.91, latencySla: 97.4, spend: 150, copq: 4 }
];

const SIMULATED_PROMPTS = [
  {
    prompt: "Find family hotels in Bangkok under $100 with pool.",
    context: "Hotel Indigo: $95, pool, central location. Bangkok Palace: $60, pool, family rooms. Siam Resort: $120, pool, breakfast included.",
    healthy_response: "Here are two options in Bangkok under $100 with pools:\n1. Bangkok Palace ($60/night) - features family rooms and pool.\n2. Hotel Indigo ($95/night) - offers central location and pool.",
    degraded_response: "Here is Siam Resort ($120/night) which has a pool and breakfast. Also check out Marriott Bangkok ($250/night) which has pool access."
  },
  {
    prompt: "What is the cancellation policy for Hotel Indigo?",
    context: "Cancellation is free up to 24 hours before check-in. Within 24 hours, a 1-night fee applies.",
    healthy_response: "You can cancel free of charge up to 24 hours before your check-in. If you cancel within 24 hours, you will be charged a fee equal to 1 night's stay.",
    degraded_response: "Cancellation is completely free at all times with no penalties or hidden fees."
  },
  {
    prompt: "Does Bangkok Palace offer airport shuttle?",
    context: "Bangkok Palace does not have a private shuttle, but recommends the public airport rail link nearby.",
    healthy_response: "Bangkok Palace does not offer a private shuttle service. However, they recommend using the nearby public airport rail link for transport.",
    degraded_response: "Yes! Bangkok Palace offers a complimentary airport shuttle service 24/7 for all hotel guests."
  },
  {
    prompt: "Show me breakfast options at Siam Resort.",
    context: "Siam Resort breakfast: buffet style from 6:30 AM to 10:30 AM, international cuisine, $15 if not booked with room.",
    healthy_response: "Siam Resort offers an international buffet breakfast served from 6:30 AM to 10:30 AM. It costs $15 per person if it is not already included in your room booking.",
    degraded_response: "Siam Resort has no breakfast options available on-site, but there are local street vendors nearby."
  },
  {
    prompt: "Find pet friendly boutique hotels in Phuket.",
    context: "Phuket Boutique Stay: pets allowed with $20 fee. Kata beach resort: no pets allowed. Rawai Oasis: small dogs allowed under 10kg, no fee.",
    healthy_response: "Here are boutique options in Phuket:\n1. Phuket Boutique Stay (allows pets for a $20 fee).\n2. Rawai Oasis (allows small dogs under 10kg for free).",
    degraded_response: "Phuket Boutique Stay, Kata Beach Resort, and Rawai Oasis are all fully pet friendly and have no restrictions."
  }
];

// Robust, ReDoS-free CSV parser
const parseCSV = (text) => {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 0 || currentField !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
    } else {
      currentField += char;
    }
  }
  
  // Push last field & row if anything left
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  
  return rows.map(row => row.map(cell => cell.trim())).filter(row => row.some(cell => cell !== ""));
};

// Offline Jaccard similarity word-overlap calculator
const calculateJaccard = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const clean = (s) => {
    const normalized = s.toLowerCase().replace(/[\p{P}\p{S}]/gu, "");
    if (/[\u0e00-\u0e7f]/u.test(normalized)) {
      return normalized.replace(/\s+/g, "").split("").filter(Boolean);
    }
    return normalized.split(/\s+/).filter(Boolean);
  };
  const words1 = new Set(clean(str1));
  const words2 = new Set(clean(str2));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  if (union.size === 0) return 0;
  return parseFloat((intersection.size / union.size).toFixed(2));
};

// Pre-populate initial traces and history for the telemetry view
const getInitialTelemetry = () => {
  const initialTraces = [];
  const initialHistory = [];
  const now = Date.now();

  for (let i = 29; i >= 0; i--) {
    const isV2 = Math.random() > 0.5;
    const model = isV2 ? 'agoda-custom-llama-v2' : 'agoda-custom-llama-v1';
    const faithfulness = 0.78 + Math.random() * 0.18;
    const relevance = 0.82 + Math.random() * 0.14;
    const latency = 120 + Math.floor(Math.random() * 80);
    const cost = 0.00025 + Math.random() * 0.0001;
    const promptObj = SIMULATED_PROMPTS[Math.floor(Math.random() * SIMULATED_PROMPTS.length)];
    const isCopq = faithfulness < 0.70 || relevance < 0.70;

    initialTraces.push({
      request_id: `req-init-${1000 + i}`,
      timestamp: new Date(now - i * 10000).toISOString(),
      model_id: model,
      service_name: "hotel-recommendations-RAG",
      prompt: promptObj.prompt,
      response: promptObj.healthy_response,
      context_retrieved: promptObj.context,
      metrics: {
        latency_ms: latency,
        prompt_tokens: 120,
        completion_tokens: 85,
        cost_usd: cost,
        faithfulness: parseFloat(faithfulness.toFixed(2)),
        relevance: parseFloat(relevance.toFixed(2))
      }
    });
    
    initialHistory.push({
      time: new Date(now - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      avgFaithfulness: parseFloat(faithfulness.toFixed(2)),
      avgRelevance: parseFloat(relevance.toFixed(2)),
      avgCost: cost,
      avgCopq: isCopq ? cost : 0,
      avgLatency: latency,
      v2RefFaithfulness: 0.88,
      v2RefRelevance: 0.90
    });
  }
  return { initialTraces, initialHistory };
};

const { initialTraces: staticInitialTraces, initialHistory: staticInitialHistory } = getInitialTelemetry();

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('live-monitoring');

  // LocalStorage-backed state initializer helper
  const getStoredItem = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem('agoda_eval_' + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Crash-Safe LocalStorage Sync helper
  const safeSaveToStorage = (key, val) => {
    try {
      localStorage.setItem('agoda_eval_' + key, JSON.stringify(val));
    } catch (e) {
      console.warn("localStorage quota exceeded or failed to save for key:", 'agoda_eval_' + key, e);
    }
  };

  // --- V1/V2 Shared Dashboard State ---
  const [activeModel, setActiveModel] = useState(() => getStoredItem('activeModel', 'agoda-custom-llama-v1'));
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [simulationStatus, setSimulationStatus] = useState('normal'); 
  const [overlayV2, setOverlayV2] = useState(true);
  const [totalRequests, setTotalRequests] = useState(() => getStoredItem('totalRequests', 1485));
  const [totalCost, setTotalCost] = useState(() => getStoredItem('totalCost', 0.4452));
  const [totalCopq, setTotalCopq] = useState(() => getStoredItem('totalCopq', 0.0485));
  const [p95Latency, setP95Latency] = useState(190);
  const [recentTraces, setRecentTraces] = useState(() => staticInitialTraces.slice(0, 15));
  const [history, setHistory] = useState(() => staticInitialHistory);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const [copySuccessId, setCopySuccessId] = useState(null);
  const [webhookLog, setWebhookLog] = useState("// Webhook payload console (Waiting for alerts...)");
  
  // Alert rules state
  const [rules, setRules] = useState(() => getStoredItem('rules', [
    { id: 'rule-1', metric: 'faithfulness', condition: 'less_than', threshold: 0.70, window: 15, minSamples: 10 },
    { id: 'rule-2', metric: 'latency', condition: 'greater_than', threshold: 600, window: 10, minSamples: 10 }
  ]));
  const [incidents, setIncidents] = useState(() => getStoredItem('incidents', []));

  // --- Feature 1: Registry State ---
  const [registry, setRegistry] = useState(() => getStoredItem('registry', DEFAULT_REGISTRY));
  const [selectedRegistryId, setSelectedRegistryId] = useState('set-1');
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // --- Feature 2: Workbench Benchmark State ---
  const [workbenchModelA, setWorkbenchModelA] = useState('agoda-custom-llama-v1');
  const [workbenchModelB, setWorkbenchModelB] = useState('agoda-custom-llama-v2');
  const [benchmarkProgress, setBenchmarkProgress] = useState(0); 
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [expandedBenchId, setExpandedBenchId] = useState(null);

  // --- Feature 3: MLOps Canary Split State ---
  const [canaryPercentage, setCanaryPercentage] = useState(() => getStoredItem('canaryPercentage', 10));
  const [pendingCanaryPercentage, setPendingCanaryPercentage] = useState(10);
  const [showCanaryConfirm, setShowCanaryConfirm] = useState(false);

  // --- Feature 4: VP SLA & Savings State ---
  const [slaHistory] = useState(() => getStoredItem('slaHistory', INITIAL_SLA_HISTORY));
  const [efficiencySavings, setEfficiencySavings] = useState(() => getStoredItem('efficiencySavings', 5280.00));
  const [markdownReportDownloaded, setMarkdownReportDownloaded] = useState(false);

  // Alert Form State
  const [formMetric, setFormMetric] = useState('faithfulness');
  const [formCondition, setFormCondition] = useState('less_than');
  const [formThreshold, setFormThreshold] = useState(0.70);
  const [formWindow, setFormWindow] = useState(15);
  const [formMinSamples, setFormMinSamples] = useState(10);

  // Refs for loop synchronization
  const tracesRef = useRef(staticInitialTraces);
  const benchmarkIntervalRef = useRef(null);

  // Save state helpers
  useEffect(() => {
    safeSaveToStorage('activeModel', activeModel);
    safeSaveToStorage('totalRequests', totalRequests);
    safeSaveToStorage('totalCost', totalCost);
    safeSaveToStorage('totalCopq', totalCopq);
    safeSaveToStorage('rules', rules);
    safeSaveToStorage('incidents', incidents);
    safeSaveToStorage('registry', registry);
    safeSaveToStorage('canaryPercentage', canaryPercentage);
    safeSaveToStorage('slaHistory', slaHistory);
    safeSaveToStorage('efficiencySavings', efficiencySavings);
  }, [activeModel, totalRequests, totalCost, totalCopq, rules, incidents, registry, canaryPercentage, slaHistory, efficiencySavings]);

  // Clean up benchmark intervals on unmount
  useEffect(() => {
    return () => {
      if (benchmarkIntervalRef.current) {
        clearInterval(benchmarkIntervalRef.current);
      }
    };
  }, []);

  // Simulator telemetry running logic
  useEffect(() => {
    if (!isRunning) return;

    const intervalTime = 2000 / speed;
    
    const loop = setInterval(() => {
      const promptObj = SIMULATED_PROMPTS[Math.floor(Math.random() * SIMULATED_PROMPTS.length)];
      const reqId = `req-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowStr = new Date().toISOString();

      // Implement Canary Traffic Split for Model selection
      const currentActiveModel = Math.random() * 100 < canaryPercentage ? 'agoda-custom-llama-v2' : activeModel;

      let faithfulness = 0.82 + Math.random() * 0.14;
      let relevance = 0.84 + Math.random() * 0.12;
      let latency = 120 + Math.floor(Math.random() * 60);
      let cost = 0.00022 + Math.random() * 0.00008;
      let response = promptObj.healthy_response;

      if (currentActiveModel === 'agoda-custom-llama-v2') {
        faithfulness = 0.88 + Math.random() * 0.08;
        relevance = 0.90 + Math.random() * 0.06;
        latency = 140 + Math.floor(Math.random() * 80);
        cost = 0.00032 + Math.random() * 0.00005;
      }

      // Simulation overrides
      if (simulationStatus === 'drift' && currentActiveModel === 'agoda-custom-llama-v1') {
        faithfulness = 0.40 + Math.random() * 0.20; 
        relevance = 0.48 + Math.random() * 0.18;    
        latency = 135 + Math.floor(Math.random() * 90);
        response = promptObj.degraded_response;
      } else if (simulationStatus === 'latency_outage') {
        latency = 900 + Math.floor(Math.random() * 500); 
        if (Math.random() > 0.7) {
          relevance = 0.60 + Math.random() * 0.15;
        }
      }

      const isCopq = faithfulness < 0.70 || relevance < 0.70;
      const traceCost = parseFloat(cost.toFixed(6));
      const copqWasted = isCopq ? traceCost : 0;

      // Accumulate MLOps savings if traffic split routed to cheaper fallback model correctly
      if (currentActiveModel === 'agoda-custom-llama-v2' && simulationStatus === 'drift') {
        setEfficiencySavings(prev => prev + 10.00);
      }

      const newTrace = {
        request_id: reqId,
        timestamp: nowStr,
        model_id: currentActiveModel,
        service_name: "hotel-recommendations-RAG",
        prompt: promptObj.prompt,
        response: response,
        context_retrieved: promptObj.context,
        metrics: {
          latency_ms: latency,
          prompt_tokens: 120,
          completion_tokens: 85,
          cost_usd: traceCost,
          faithfulness: parseFloat(faithfulness.toFixed(2)),
          relevance: parseFloat(relevance.toFixed(2))
        }
      };

      const currentTraces = [newTrace, ...tracesRef.current].slice(0, 50);
      tracesRef.current = currentTraces;

      setTotalRequests(prev => prev + 1);
      setTotalCost(prev => prev + traceCost);
      setTotalCopq(prev => prev + copqWasted);
      setRecentTraces(currentTraces.slice(0, 15));

      const last30 = currentTraces.slice(0, 30);
      const latencies = last30.map(t => t.metrics.latency_ms).sort((a, b) => a - b);
      const p95Idx = Math.floor(latencies.length * 0.95);
      const newP95 = latencies[p95Idx] || latency;
      setP95Latency(newP95);

      setHistory(prev => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const last15 = currentTraces.slice(0, 15);
        const len = last15.length;
        const avgFaith = len > 0 ? last15.reduce((acc, t) => acc + t.metrics.faithfulness, 0) / len : 0.85;
        const avgRel = len > 0 ? last15.reduce((acc, t) => acc + t.metrics.relevance, 0) / len : 0.88;
        const avgC = len > 0 ? last15.reduce((acc, t) => acc + t.metrics.cost_usd, 0) / len : 0.00030;
        const avgCop = len > 0 ? last15.reduce((acc, t) => acc + (t.metrics.faithfulness < 0.7 || t.metrics.relevance < 0.7 ? t.metrics.cost_usd : 0), 0) / len : 0;
        const avgLat = len > 0 ? last15.reduce((acc, t) => acc + t.metrics.latency_ms, 0) / len : 150;

        const newPoint = {
          time: timeStr,
          avgFaithfulness: parseFloat(avgFaith.toFixed(2)),
          avgRelevance: parseFloat(avgRel.toFixed(2)),
          avgCost: avgC,
          avgCopq: avgCop,
          avgLatency: avgLat,
          v2RefFaithfulness: 0.89,
          v2RefRelevance: 0.91
        };

        const newHistory = [...prev, newPoint];
        if (newHistory.length > 20) {
          newHistory.shift();
        }
        return newHistory;
      });

      // Alert Engine processing
      rules.forEach(rule => {
        const sampleSize = Math.min(rule.window, currentTraces.length);
        if (sampleSize < rule.minSamples) return; 

        const windowTraces = currentTraces.slice(0, sampleSize);
        let valSum = 0;
        
        if (rule.metric === 'faithfulness') {
          valSum = windowTraces.reduce((sum, t) => sum + t.metrics.faithfulness, 0);
        } else if (rule.metric === 'relevance') {
          valSum = windowTraces.reduce((sum, t) => sum + t.metrics.relevance, 0);
        } else if (rule.metric === 'latency') {
          valSum = windowTraces.reduce((sum, t) => sum + t.metrics.latency_ms, 0);
        }

        const avgVal = parseFloat((valSum / sampleSize).toFixed(2));
        let isViolated = false;

        if (rule.condition === 'less_than') {
          isViolated = avgVal < rule.threshold;
        } else if (rule.condition === 'greater_than') {
          isViolated = avgVal > rule.threshold;
        }

        if (isViolated) {
          setIncidents(prevIncidents => {
            const activeIncident = prevIncidents.find(inc => inc.ruleId === rule.id && !inc.resolved);
            if (activeIncident) return prevIncidents; 

            const newInc = {
              id: `inc-${Math.floor(1000 + Math.random() * 9000)}`,
              ruleId: rule.id,
              metric: rule.metric,
              threshold: rule.threshold,
              actualValue: avgVal,
              timestamp: new Date().toLocaleTimeString(),
              resolved: false,
              resolvedAt: null
            };

            setWebhookLog(JSON.stringify({
              event: "LLM_QUALITY_ALERT_TRIGGERED",
              incident_id: newInc.id,
              timestamp: new Date().toISOString(),
              rule: { metric: rule.metric, condition: rule.condition, threshold: rule.threshold },
              evaluation: { samples_evaluated: sampleSize, rolling_average: avgVal, alert_status: "CRITICAL" },
              target_service: "hotel-recommendations-RAG",
              active_model: currentActiveModel
            }, null, 2));

            return [newInc, ...prevIncidents];
          });
        } else {
          setIncidents(prevIncidents => {
            return prevIncidents.map(inc => {
              if (inc.ruleId === rule.id && !inc.resolved) {
                return { ...inc, resolved: true, resolvedAt: new Date().toLocaleTimeString() };
              }
              return inc;
            });
          });
        }
      });

    }, intervalTime);

    return () => clearInterval(loop);
  }, [isRunning, speed, activeModel, simulationStatus, rules, canaryPercentage]);

  // Rollback logic
  const handleRollback = () => {
    setActiveModel('agoda-custom-llama-v2');
    setSimulationStatus('normal');
    setIncidents(prev => 
      prev.map(inc => inc.resolved ? inc : { ...inc, resolved: true, resolvedAt: new Date().toLocaleTimeString() })
    );

    setWebhookLog(JSON.stringify({
      event: "AUTONOMOUS_ROLLBACK_EXECUTED",
      timestamp: new Date().toISOString(),
      service: "hotel-recommendations-RAG",
      action: "MODEL_PROMOTION_REVERTED",
      previous_model: "agoda-custom-llama-v1",
      promoted_model: "agoda-custom-llama-v2",
      status: "STABLE"
    }, null, 2));
  };

  const handleTestWebhook = () => {
    setWebhookLog(JSON.stringify({
      event: "TEST_WEBHOOK_PING",
      timestamp: new Date().toISOString(),
      recipient: "Slack Channel: #llm-alerts-agoda",
      message: "LLM Eval Pulse dashboard connection verified.",
      status: "OK"
    }, null, 2));
  };

  const handleCopy = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopySuccessId(fieldId);
    setTimeout(() => setCopySuccessId(null), 1500);
  };

  // Add a new alert rule
  const handleAddRule = (e) => {
    e.preventDefault();
    const newRule = {
      id: `rule-${Date.now()}`,
      metric: formMetric,
      condition: formCondition,
      threshold: parseFloat(formThreshold),
      window: parseInt(formWindow),
      minSamples: parseInt(formMinSamples)
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        
        // Parse CSV using the robust, ReDoS-free state scanner
        const rows = parseCSV(text);
        if (rows.length < 2) {
          throw new Error("CSV contains no rows.");
        }

        const headers = rows[0].map(h => h.toLowerCase());
        const promptIndex = headers.indexOf('prompt');
        const truthIndex = headers.indexOf('ground_truth');
        const refIndex = headers.indexOf('reference_context');

        if (promptIndex === -1 || truthIndex === -1) {
          throw new Error("Missing required headers: 'prompt' and 'ground_truth'.");
        }

        // Enforce 50-item hard limit (CPO scope guardrail)
        const rowCount = rows.length - 1;
        if (rowCount > 50) {
          throw new Error("CSV exceeds limit of 50 test cases. Upload block active.");
        }

        const parsedItems = [];
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i];
          
          // Index Safety: Guard against missing columns or out-of-bound access
          const promptVal = promptIndex >= 0 && promptIndex < cols.length ? cols[promptIndex] : "";
          const refVal = refIndex >= 0 && refIndex < cols.length ? cols[refIndex] : "Dynamic testing context";
          const truthVal = truthIndex >= 0 && truthIndex < cols.length ? cols[truthIndex] : "";

          parsedItems.push({
            test_id: `us-${Math.floor(100 + Math.random() * 900)}-${i}`,
            prompt: promptVal,
            reference_context: refVal || "Dynamic testing context",
            ground_truth: truthVal
          });
        }

        const newRegistryItem = {
          id: `custom-set-${Date.now()}`,
          name: file.name.replace('.csv', ''),
          itemCount: parsedItems.length,
          creator: 'User Upload',
          dateCreated: new Date().toISOString().split('T')[0],
          targetService: 'hotel-recommendations-RAG',
          items: parsedItems
        };

        const updatedRegistry = [newRegistryItem, ...registry];
        setRegistry(updatedRegistry);
        setSelectedRegistryId(newRegistryItem.id);
        setUploadSuccess(true);
      } catch (err) {
        setUploadError(err.message);
      }
    };
    reader.readAsText(file);
  };

  // --- Feature 2: Pre-Release Workbench Benchmark Simulator ---
  const handleStartBenchmark = () => {
    const selectedSet = registry.find(r => r.id === selectedRegistryId);
    if (!selectedSet || selectedSet.items.length === 0) return;

    // Clear any existing benchmark interval to prevent leaks
    if (benchmarkIntervalRef.current) {
      clearInterval(benchmarkIntervalRef.current);
    }

    setIsBenchmarking(true);
    setBenchmarkProgress(0);
    setBenchmarkResults(null);

    const total = selectedSet.items.length;
    let currentIdx = 0;
    const itemsEvaluated = [];

    // Run batch evaluations asynchronously (paging 5 items/sec)
    benchmarkIntervalRef.current = setInterval(() => {
      if (currentIdx >= total) {
        clearInterval(benchmarkIntervalRef.current);
        benchmarkIntervalRef.current = null;
        setIsBenchmarking(false);
        setBenchmarkProgress(100);
        
        // Finalize aggregates
        const avgFaithA = itemsEvaluated.reduce((sum, item) => sum + item.modelA.faithfulness, 0) / total;
        const avgFaithB = itemsEvaluated.reduce((sum, item) => sum + item.modelB.faithfulness, 0) / total;
        const avgSimA = itemsEvaluated.reduce((sum, item) => sum + item.modelA.similarity, 0) / total;
        const avgSimB = itemsEvaluated.reduce((sum, item) => sum + item.modelB.similarity, 0) / total;
        const avgLatA = itemsEvaluated.reduce((sum, item) => sum + item.modelA.latency, 0) / total;
        const avgLatB = itemsEvaluated.reduce((sum, item) => sum + item.modelB.latency, 0) / total;
        
        const isSlaMetA = avgFaithA >= 0.75 && avgSimA >= 0.70 && avgLatA <= 250;
        const isSlaMetB = avgFaithB >= 0.75 && avgSimB >= 0.70 && avgLatB <= 250;

        setBenchmarkResults({
          testSetName: selectedSet.name,
          totalItems: total,
          aggregates: {
            modelA: {
              name: workbenchModelA.replace('agoda-custom-', ''),
              avgFaithfulness: parseFloat(avgFaithA.toFixed(2)),
              avgSimilarity: parseFloat(avgSimA.toFixed(2)),
              avgLatency: Math.round(avgLatA),
              gateStatus: isSlaMetA ? 'READY TO PROMO' : 'BLOCKED'
            },
            modelB: {
              name: workbenchModelB.replace('agoda-custom-', ''),
              avgFaithfulness: parseFloat(avgFaithB.toFixed(2)),
              avgSimilarity: parseFloat(avgSimB.toFixed(2)),
              avgLatency: Math.round(avgLatB),
              gateStatus: isSlaMetB ? 'READY TO PROMO' : 'BLOCKED'
            }
          },
          details: itemsEvaluated
        });
        return;
      }

      // Simulate evaluate next chunk of items
      const batchLimit = Math.min(currentIdx + 2, total);
      for (let i = currentIdx; i < batchLimit; i++) {
        const item = selectedSet.items[i];
        
        // Model A metrics (V1 model behavior)
        let faithA = 0.75 + Math.random() * 0.20;
        let simA = calculateJaccard(item.ground_truth, item.prompt + " " + item.reference_context);
        simA = Math.min(1, Math.max(0.3, simA + 0.35 + Math.random() * 0.15));
        let latA = 110 + Math.floor(Math.random() * 80);
        let respA = `[Benchmark Output Model A] Siam Palace and Skytrain Lodge match cancellation requests.`;

        // Model B metrics (V2 model behavior - generally better scores)
        let faithB = 0.85 + Math.random() * 0.10;
        let simB = calculateJaccard(item.ground_truth, item.ground_truth);
        simB = Math.min(1, Math.max(0.5, simB - (Math.random() * 0.10)));
        let latB = 140 + Math.floor(Math.random() * 100);
        let respB = `[Benchmark Output Model B] Yes, hotel booking is fully refundable up to check-in bounds.`;

        itemsEvaluated.push({
          test_id: item.test_id,
          prompt: item.prompt,
          ground_truth: item.ground_truth,
          modelA: {
            output: respA,
            faithfulness: parseFloat(faithA.toFixed(2)),
            similarity: parseFloat(simA.toFixed(2)),
            latency: latA
          },
          modelB: {
            output: respB,
            faithfulness: parseFloat(faithB.toFixed(2)),
            similarity: parseFloat(simB.toFixed(2)),
            latency: latB
          }
        });
      }

      currentIdx = batchLimit;
      setBenchmarkProgress(Math.round((currentIdx / total) * 100));
    }, 400);
  };

  // --- Feature 3: MLOps Canary confirmation updates ---
  const handleSaveCanarySplit = () => {
    setCanaryPercentage(pendingCanaryPercentage);
    setShowCanaryConfirm(false);

    setWebhookLog(JSON.stringify({
      event: "CANARY_TRAFFIC_ALLOCATION_UPDATED",
      timestamp: new Date().toISOString(),
      service_name: "hotel-recommendations-RAG",
      traffic_split: {
        "agoda-custom-llama-v1": 100 - pendingCanaryPercentage,
        "agoda-custom-llama-v2": pendingCanaryPercentage
      }
    }, null, 2));
  };

  // --- Feature 4: Markdown report generator ---
  const generateMarkdownReport = () => {
    if (!benchmarkResults) {
      return `
# LLM EVAL PULSE - PLATFORM EXECUTIVE SLA & QUALITY AUDIT
## Generated on: ${new Date().toISOString().split('T')[0]}
## Target Service: hotel-recommendations-RAG

### 📊 Platform Observability Summary
*   **Active Traffic Routing:** ${activeModel === 'agoda-custom-llama-v1' ? 'Llama-v1 (100% Production)' : `Canary Split Mode (Canary: ${canaryPercentage}%)`}
*   **Total Requests Processed:** ${totalRequests.toLocaleString()}
*   **Accumulated API Cost:** $${totalCost.toFixed(4)} USD
*   **Cost of Poor Quality (COPQ) Waste:** $${totalCopq.toFixed(4)} USD (Ratio: ${(totalCost > 0 ? (totalCopq / totalCost * 100).toFixed(1) : 0)}%)
*   **Accumulated MLOps Efficiency Savings:** $${efficiencySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD

### 📈 Weekly SLA Compliance Status
*   **Overall SLA Compliance:** 94.8% (Target: > 90%)
*   **Average Quality (Faithfulness):** ${(history.length > 0 ? (history.reduce((sum, h) => sum + h.avgFaithfulness, 0) / history.length).toFixed(2) : '0.88')}
*   **Average Relevance:** ${(history.length > 0 ? (history.reduce((sum, h) => sum + h.avgRelevance, 0) / history.length).toFixed(2) : '0.90')}

---
*Generated dynamically from namespaced browser audit logs (agoda_eval_)*
      `.trim();
    }
    return `
# LLM EVAL PULSE BENCHMARK RUN
## Test Registry Set: ${benchmarkResults.testSetName}
## Evaluated Cases: ${benchmarkResults.totalItems}
## Date Run: ${new Date().toISOString().split('T')[0]}

### 📊 Summary Comparisons
*   **Model A (${benchmarkResults.aggregates.modelA.name}):**
    *   Avg Faithfulness: ${benchmarkResults.aggregates.modelA.avgFaithfulness}
    *   Avg Jaccard Similarity: ${benchmarkResults.aggregates.modelA.avgSimilarity}
    *   Avg Latency: ${benchmarkResults.aggregates.modelA.avgLatency}ms
    *   Promotion Status: **${benchmarkResults.aggregates.modelA.gateStatus}**

*   **Model B (${benchmarkResults.aggregates.modelB.name}):**
    *   Avg Faithfulness: ${benchmarkResults.aggregates.modelB.avgFaithfulness}
    *   Avg Jaccard Similarity: ${benchmarkResults.aggregates.modelB.avgSimilarity}
    *   Avg Latency: ${benchmarkResults.aggregates.modelB.avgLatency}ms
    *   Promotion Status: **${benchmarkResults.aggregates.modelB.gateStatus}**

---
*Generated by Agoda LLM Eval Platform Workbench*
    `.trim();
  };

  const handleDownloadMarkdownReport = () => {
    const reportText = generateMarkdownReport();
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Choose appropriate file name based on whether it is benchmark results or platform SLA audit
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = benchmarkResults 
      ? `agoda_benchmark_report_${benchmarkResults.testSetName}_${dateStr}.md`
      : `agoda_platform_sla_audit_${dateStr}.md`;
      
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMarkdownReportDownloaded(true);
    setTimeout(() => setMarkdownReportDownloaded(false), 1500);
  };

  // Word Diff Renderer layout helper
  const renderWordDiff = (actual, expected) => {
    if (!actual || !expected) return null;
    const actWords = actual.split(/\s+/);
    const expWordsClean = expected.toLowerCase().replace(new RegExp("[.,/#!$%^&*;:{}=\\-_`~()]", "g"), "").split(/\s+/);
    return (
      <div className="diff-container">
        {actWords.map((word, idx) => {
          const cleanWord = word.toLowerCase().replace(new RegExp("[.,/#!$%^&*;:{}=\\-_`~()]", "g"), "");
          const isMatch = expWordsClean.some(w => w.includes(cleanWord) || cleanWord.includes(w));
          if (isMatch) {
            return <React.Fragment key={idx}>{word} </React.Fragment>;
          } else {
            return (
              <React.Fragment key={idx}>
                <span className="diff-mismatch">{word}</span>{' '}
              </React.Fragment>
            );
          }
        })}
      </div>
    );
  };

  // SVGs sparkline builders for history
  const buildSvgPath = (data, key, minVal, maxVal) => {
    if (data.length < 2) return "";
    const width = 600;
    const height = 150;
    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * width;
      const val = d[key];
      const diff = maxVal - minVal;
      const ratio = diff > 0 ? (val - minVal) / diff : 0.5;
      const y = height - ratio * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const buildSvgAreaPath = (data, key, minVal, maxVal) => {
    const linePath = buildSvgPath(data, key, minVal, maxVal);
    if (!linePath) return "";
    return `${linePath} L 600,150 L 0,150 Z`;
  };

  const activeIncidents = incidents.filter(inc => !inc.resolved);
  const copqPercent = totalCost > 0 ? ((totalCopq / totalCost) * 100).toFixed(1) : "0.0";

  return (
    <div className="dashboard">
      {/* 1. Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <Activity size={28} color="var(--border-color-glow)" />
          <div>
            <h1>LLM Eval Pulse</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              LLM Platform Observability & Real-Time Quality Gate
            </p>
          </div>
          <span className="badge badge-platform">Platform SDK v2.0</span>
        </div>

        {/* Global Tabs Navigation */}
        <nav className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'live-monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('live-monitoring')}
          >
            <Activity size={14} /> Production Observability
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pre-release' ? 'active' : ''}`}
            onClick={() => setActiveTab('pre-release')}
          >
            <Layers size={14} /> Pre-Release Workbench
          </button>
          <button 
            className={`tab-btn ${activeTab === 'registry' ? 'active' : ''}`}
            onClick={() => setActiveTab('registry')}
          >
            <Database size={14} /> Test Set Registry
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mlops-config' ? 'active' : ''}`}
            onClick={() => setActiveTab('mlops-config')}
          >
            <Settings size={14} /> MLOps Config & Canary
          </button>
          <button 
            className={`tab-btn ${activeTab === 'vp-dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('vp-dashboard')}
          >
            <TrendingUp size={14} /> Executive Reports (SLA)
          </button>
        </nav>
      </header>

      {/* 2. Active Alert banner */}
      {activeIncidents.length > 0 && activeTab === 'live-monitoring' && (
        <div className="alert-banner animate-alert-flash">
          <div className="alert-banner-left">
            <ShieldAlert size={20} color="var(--color-danger)" />
            <span>
              <strong>CRITICAL QUALITY DRIFT:</strong> {activeIncidents.length} active threshold breach(es) detected. Answer faithfulness has degraded.
            </span>
          </div>
          <div className="alert-banner-right">
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', background: 'var(--color-danger)' }} onClick={handleRollback}>
              <RefreshCw size={14} />
              Autonomous Rollback
            </button>
          </div>
        </div>
      )}

      {/* 3. Global Scorecard Stats (Changes depending on Tab context) */}
      <section className="scorecard-grid">
        <div className="kpi-card" style={{ '--card-accent': 'var(--color-info)' }}>
          <div className="kpi-header">
            <span>Total Evaluated Requests</span>
            <Activity size={18} color="var(--color-info)" />
          </div>
          <div className="kpi-value">{totalRequests.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span>Async Ingestion log stream</span>
          </div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': 'var(--color-purple)' }}>
          <div className="kpi-header">
            <span>P95 Telemetry Latency</span>
            <Clock size={18} color="var(--color-purple)" />
          </div>
          <div className="kpi-value">{p95Latency} ms</div>
          <div className="kpi-subtext">
            <span>SLA threshold limit: &lt; 200ms</span>
          </div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': 'var(--color-warning)' }}>
          <div className="kpi-header">
            <span>Cumulative Spend</span>
            <Coins size={18} color="var(--color-warning)" />
          </div>
          <div className="kpi-value">${totalCost.toFixed(4)}</div>
          <div className="kpi-subtext">
            <span>Model inference cost only</span>
          </div>
        </div>

        <div className="kpi-card" style={{ '--card-accent': 'var(--color-danger)' }}>
          <div className="kpi-header">
            <span>Cost of Poor Quality (COPQ)</span>
            <AlertTriangle size={18} color="var(--color-danger)" />
          </div>
          <div className="kpi-value" style={{ color: parseFloat(copqPercent) > 15 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
            ${totalCopq.toFixed(4)}
          </div>
          <div className="kpi-subtext">
            <span className={parseFloat(copqPercent) > 15 ? 'copq-warning' : 'copq-healthy'}>
              {copqPercent}% of total token spend
            </span>
          </div>
        </div>
      </section>

      {/* 4. Tab Routing Containers */}
      {activeTab === 'live-monitoring' && (
        <main className="main-grid">
          {/* Left Column: Charts & Audit Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <TrendingUp size={20} color="var(--color-info)" />
                  Real-Time Quality Metrics
                </div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={overlayV2} onChange={(e) => setOverlayV2(e.target.checked)} />
                  Overlay Llama-v2 Benchmark
                </label>
              </div>

              <div className="charts-grid">
                <div className="chart-container">
                  <div className="chart-title-sub">
                    <span>Rolling Evaluation Scores (As judge metrics)</span>
                    <div className="chart-legend">
                      <div className="legend-item"><span className="legend-color" style={{ backgroundColor: 'var(--color-success)' }}></span> Faithfulness</div>
                      <div className="legend-item"><span className="legend-color" style={{ backgroundColor: 'var(--color-info)' }}></span> Answer Relevance</div>
                      {overlayV2 && <div className="legend-item"><span className="legend-color" style={{ border: '1px dashed var(--text-muted)' }}></span> Llama-v2 Ref</div>}
                    </div>
                  </div>
                  {history.length > 1 ? (
                    <svg viewBox="0 0 600 150" className="chart-svg">
                      <line x1="0" y1="37.5" x2="600" y2="37.5" className="chart-grid-line" />
                      <line x1="0" y1="75" x2="600" y2="75" className="chart-grid-line" />
                      <line x1="0" y1="112.5" x2="600" y2="112.5" className="chart-grid-line" />
                      <text x="10" y="30" className="chart-axis-text">0.75</text>
                      <text x="10" y="70" className="chart-axis-text">0.50</text>
                      <text x="10" y="110" className="chart-axis-text">0.25</text>
                      
                      <defs>
                        <linearGradient id="grad-faith" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="grad-rel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <path d={buildSvgAreaPath(history, 'avgFaithfulness', 0, 1)} fill="url(#grad-faith)" />
                      <path d={buildSvgAreaPath(history, 'avgRelevance', 0, 1)} fill="url(#grad-rel)" />

                      {overlayV2 && (
                        <>
                          <path d={buildSvgPath(history, 'v2RefFaithfulness', 0, 1)} className="line-v2-ref" />
                          <path d={buildSvgPath(history, 'v2RefRelevance', 0, 1)} className="line-v2-ref" style={{ opacity: 0.4 }} />
                        </>
                      )}
                      <path d={buildSvgPath(history, 'avgFaithfulness', 0, 1)} className="line-faithfulness" />
                      <path d={buildSvgPath(history, 'avgRelevance', 0, 1)} className="line-relevance" />
                    </svg>
                  ) : (
                    <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading timeline...</div>
                  )}
                </div>

                <div className="chart-container">
                  <div className="chart-title-sub">
                    <span>Spend vs. Cost of Poor Quality (COPQ)</span>
                    <div className="chart-legend">
                      <div className="legend-item"><span className="legend-color" style={{ backgroundColor: 'var(--color-purple)' }}></span> Avg Token Cost</div>
                      <div className="legend-item"><span className="legend-color" style={{ backgroundColor: 'var(--color-danger)' }}></span> COPQ Wasted</div>
                    </div>
                  </div>
                  {history.length > 1 ? (
                    <svg viewBox="0 0 600 150" className="chart-svg">
                      <line x1="0" y1="37.5" x2="600" y2="37.5" className="chart-grid-line" />
                      <line x1="0" y1="75" x2="600" y2="75" className="chart-grid-line" />
                      <line x1="0" y1="112.5" x2="600" y2="112.5" className="chart-grid-line" />
                      <text x="10" y="30" className="chart-axis-text">$0.00045</text>
                      <text x="10" y="70" className="chart-axis-text">$0.00030</text>
                      <text x="10" y="110" className="chart-axis-text">$0.00015</text>

                      <defs>
                        <linearGradient id="grad-cost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-purple)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--color-purple)" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="grad-copq" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-danger)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--color-danger)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <path d={buildSvgAreaPath(history, 'avgCost', 0, 0.0006)} fill="url(#grad-cost)" />
                      <path d={buildSvgAreaPath(history, 'avgCopq', 0, 0.0006)} fill="url(#grad-copq)" />

                      <path d={buildSvgPath(history, 'avgCost', 0, 0.0006)} className="line-cost" />
                      <path d={buildSvgPath(history, 'avgCopq', 0, 0.0006)} className="line-copq" />
                    </svg>
                  ) : (
                    <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Calculating cost...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Traces table */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Database size={20} color="var(--color-success)" />
                  Asynchronous Telemetry Audit Log
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing last 15 traces</span>
              </div>
              <div className="traces-table-container">
                <table className="traces-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Model</th>
                      <th>Latency</th>
                      <th>Cost</th>
                      <th>Faithfulness</th>
                      <th>Relevance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTraces.map((trace) => {
                      const isExpanded = expandedTraceId === trace.request_id;
                      const faithScore = trace.metrics.faithfulness;
                      const isBadFaith = faithScore < 0.70;
                      return (
                        <React.Fragment key={trace.request_id}>
                          <tr>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{trace.request_id}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{trace.model_id.replace('agoda-custom-', '')}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{trace.metrics.latency_ms}ms</td>
                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>${trace.metrics.cost_usd.toFixed(5)}</td>
                            <td>
                              <span className={`score-badge ${isBadFaith ? 'score-badge-red' : 'score-badge-green'}`}>
                                {faithScore.toFixed(2)}
                              </span>
                            </td>
                            <td>
                              <span className={`score-badge ${trace.metrics.relevance < 0.7 ? 'score-badge-red' : 'score-badge-green'}`}>
                                {trace.metrics.relevance.toFixed(2)}
                              </span>
                            </td>
                            <td>
                              <button className="btn-action-small" onClick={() => setExpandedTraceId(isExpanded ? null : trace.request_id)}>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                Details
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="row-expanded-detail">
                              <td colSpan="7">
                                <div className="trace-detail-grid">
                                  <div className="trace-detail-box">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                      <span className="trace-detail-title">Prompt (Input)</span>
                                      <button className="btn-action-small" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }} onClick={() => handleCopy(trace.prompt, `prompt-${trace.request_id}`)}>
                                        {copySuccessId === `prompt-${trace.request_id}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <div className="trace-detail-content">{trace.prompt}</div>
                                  </div>
                                  <div className="trace-detail-box">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                      <span className="trace-detail-title">Context Retrieved (RAG)</span>
                                      <button className="btn-action-small" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }} onClick={() => handleCopy(trace.context_retrieved, `context-${trace.request_id}`)}>
                                        {copySuccessId === `context-${trace.request_id}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <div className="trace-detail-content">{trace.context_retrieved}</div>
                                  </div>
                                  <div className="trace-detail-box">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                      <span className="trace-detail-title">Response (Output)</span>
                                      <button className="btn-action-small" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }} onClick={() => handleCopy(trace.response, `resp-${trace.request_id}`)}>
                                        {copySuccessId === `resp-${trace.request_id}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <div className="trace-detail-content" style={{ color: isBadFaith ? '#fca5a5' : '#34d399' }}>{trace.response}</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Rule Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Drift Control Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Settings size={20} color="var(--color-warning)" />
                  Simulator Drift Control
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Manually trigger evaluation drifts or outages to verify dynamic alerts and rollback gates.
                </span>
                <div className="controls-grid">
                  <button className={`control-btn ${simulationStatus === 'normal' ? 'active-success' : ''}`} onClick={() => setSimulationStatus('normal')}>
                    🟢 Healthy Stream
                  </button>
                  <button className={`control-btn ${simulationStatus === 'drift' ? 'active-danger' : ''}`} onClick={() => setSimulationStatus('drift')}>
                    🔴 Quality Drift (v1)
                  </button>
                  <button className={`control-btn ${simulationStatus === 'latency_outage' ? 'active-warning' : ''}`} onClick={() => setSimulationStatus('latency_outage')}>
                    ⚡ Latency Spike
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-action-small" onClick={() => setIsRunning(!isRunning)}>
                      {isRunning ? <Pause size={12} /> : <Play size={12} />}
                      {isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <button className="btn-action-small" style={{ background: speed === 1 ? '#334155' : 'transparent', border: 'none' }} onClick={() => setSpeed(1)}>1x</button>
                      <button className="btn-action-small" style={{ background: speed === 2 ? '#334155' : 'transparent', border: 'none' }} onClick={() => setSpeed(2)}>2x</button>
                      <button className="btn-action-small" style={{ background: speed === 5 ? '#334155' : 'transparent', border: 'none' }} onClick={() => setSpeed(5)}>5x</button>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Active: <strong style={{ color: 'var(--text-primary)' }}>{activeModel.replace('agoda-custom-', '')}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Incidents console */}
            <div className="panel" style={{ borderLeft: activeIncidents.length > 0 ? '3px solid var(--color-danger)' : '1px solid var(--border-color)' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <ShieldAlert size={20} color="var(--color-danger)" />
                  Incident & Actions Console
                </div>
                <span className="badge" style={{ backgroundColor: activeIncidents.length > 0 ? 'var(--color-danger-glow)' : 'var(--color-success-glow)', color: activeIncidents.length > 0 ? '#fca5a5' : '#34d399' }}>
                  {activeIncidents.length} active
                </span>
              </div>
              <div className="incidents-list">
                {incidents.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', gap: '0.5rem' }}>
                    <CheckCircle size={24} color="var(--color-success)" />
                    Zero incidents. Quality is fully compliant.
                  </div>
                ) : (
                  incidents.map(inc => (
                    <div key={inc.id} className={`incident-card ${inc.resolved ? 'resolved' : ''}`}>
                      <div className="incident-header">
                        <span className={`incident-title ${inc.resolved ? 'resolved' : ''}`}>
                          {inc.resolved ? 'RESOLVED' : 'ACTIVE BREACH'} - {inc.id}
                        </span>
                        <span className="incident-time">{inc.timestamp}</span>
                      </div>
                      <div className="incident-details">
                        Metric <strong>{inc.metric}</strong> reached <strong>{inc.actualValue}</strong> (Threshold: {inc.threshold})
                        {inc.resolvedAt && <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--color-success)' }}>Resolved at {inc.resolvedAt}</div>}
                      </div>
                      {!inc.resolved && (
                        <div className="incident-actions">
                          <button className="btn-action-small" style={{ borderColor: 'var(--color-danger)', color: '#fca5a5' }} onClick={handleRollback}>
                            Rollback to Llama-v2
                          </button>
                          <button className="btn-action-small" onClick={handleTestWebhook}>
                            Force Webhook
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Alert builder */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <AlertTriangle size={20} color="var(--color-purple)" />
                  Alert Rules Configuration
                </div>
              </div>
              <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Evaluate Metric</label>
                    <select className="form-select" value={formMetric} onChange={(e) => setFormMetric(e.target.value)}>
                      <option value="faithfulness">Faithfulness</option>
                      <option value="relevance">Relevance</option>
                      <option value="latency">Latency (ms)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select className="form-select" value={formCondition} onChange={(e) => setFormCondition(e.target.value)}>
                      <option value="less_than">Less Than</option>
                      <option value="greater_than">Greater Than</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Threshold Value: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-info)' }}>{formThreshold}{formMetric === 'latency' ? ' ms' : ''}</span>
                  </label>
                  <input type="range" min={formMetric === 'latency' ? 100 : 0.1} max={formMetric === 'latency' ? 1500 : 0.99} step={formMetric === 'latency' ? 50 : 0.05} value={formThreshold} onChange={(e) => setFormThreshold(parseFloat(e.target.value))} className="slider-input" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Evaluation Window (No. of Requests)</label>
                    <input type="number" min="5" max="50" className="form-input" value={formWindow} onChange={(e) => setFormWindow(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min Sample Size (Avoid noise)</label>
                    <input type="number" min="2" max="30" className="form-input" value={formMinSamples} onChange={(e) => setFormMinSamples(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Add Alert Rule</button>
              </form>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div className="form-label" style={{ marginBottom: '0.5rem' }}>Active Alert Rules</div>
                <div className="rules-list">
                  {rules.map((rule) => (
                    <div key={rule.id} className="rule-item">
                      <div className="rule-text">
                        <AlertTriangle size={12} color="var(--color-warning)" />
                        <span>{rule.metric.toUpperCase()} {rule.condition === 'less_than' ? '<' : '>'} {rule.threshold} (window: {rule.window} traces)</span>
                      </div>
                      <button className="rule-remove" onClick={() => handleDeleteRule(rule.id)}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Webhook JSON logger */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Webhook size={20} color="var(--color-info)" />
                  Out-of-Path Webhook Log
                </div>
              </div>
              <div className="webhook-console">{webhookLog}</div>
            </div>
          </div>
        </main>
      )}

      {/* --- Feature 2: Pre-Release Workbench Tab Container --- */}
      {activeTab === 'pre-release' && (
        <main className="single-column-grid">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Layers size={20} color="var(--color-purple)" />
                Pre-Release Evaluation Workbench
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Golden dataset to benchmark prompt or model updates</span>
            </div>

            <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'end', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Golden Test Set</label>
                <select className="form-select" value={selectedRegistryId} onChange={(e) => setSelectedRegistryId(e.target.value)}>
                  {registry.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.itemCount} cases)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model Configuration A</label>
                <select className="form-select" value={workbenchModelA} onChange={(e) => setWorkbenchModelA(e.target.value)}>
                  <option value="agoda-custom-llama-v1">agoda-custom-llama-v1</option>
                  <option value="agoda-custom-llama-v2">agoda-custom-llama-v2</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model Configuration B (Compare)</label>
                <select className="form-select" value={workbenchModelB} onChange={(e) => setWorkbenchModelB(e.target.value)}>
                  <option value="agoda-custom-llama-v2">agoda-custom-llama-v2</option>
                  <option value="agoda-custom-llama-v1">agoda-custom-llama-v1</option>
                </select>
              </div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', height: '38px' }} 
                onClick={handleStartBenchmark}
                disabled={isBenchmarking}
              >
                <RefreshCw size={14} className={isBenchmarking ? 'animate-spin' : ''} />
                Execute Benchmark
              </button>
            </div>

            {/* Benchmark running progress bar */}
            {isBenchmarking && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Simulating batch evaluation runs async...</span>
                  <strong>{benchmarkProgress}%</strong>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${benchmarkProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Benchmark results report card */}
            {benchmarkResults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem', animation: 'slide-in 0.3s ease-out' }}>
                <div className="comparison-report-grid">
                  {/* Model A Summary */}
                  <div className="report-summary-box" style={{ borderLeft: '3px solid var(--color-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Model A: {benchmarkResults.aggregates.modelA.name}</strong>
                      <span className={`score-badge ${benchmarkResults.aggregates.modelA.gateStatus === 'READY TO PROMO' ? 'score-badge-green' : 'score-badge-red'}`}>
                        {benchmarkResults.aggregates.modelA.gateStatus}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <div>Avg Faithfulness: <strong style={{ color: 'var(--color-success)' }}>{benchmarkResults.aggregates.modelA.avgFaithfulness}</strong></div>
                      <div>Jaccard Similarity: <strong style={{ color: 'var(--color-info)' }}>{benchmarkResults.aggregates.modelA.avgSimilarity}</strong></div>
                      <div>Avg Latency: <strong>{benchmarkResults.aggregates.modelA.avgLatency}ms</strong></div>
                    </div>
                  </div>

                  {/* Model B Summary */}
                  <div className="report-summary-box" style={{ borderLeft: '3px solid var(--color-info)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Model B: {benchmarkResults.aggregates.modelB.name}</strong>
                      <span className={`score-badge ${benchmarkResults.aggregates.modelB.gateStatus === 'READY TO PROMO' ? 'score-badge-green' : 'score-badge-red'}`}>
                        {benchmarkResults.aggregates.modelB.gateStatus}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <div>Avg Faithfulness: <strong style={{ color: 'var(--color-success)' }}>{benchmarkResults.aggregates.modelB.avgFaithfulness}</strong></div>
                      <div>Jaccard Similarity: <strong style={{ color: 'var(--color-info)' }}>{benchmarkResults.aggregates.modelB.avgSimilarity}</strong></div>
                      <div>Avg Latency: <strong>{benchmarkResults.aggregates.modelB.avgLatency}ms</strong></div>
                    </div>
                  </div>
                </div>

                {/* Audit export report block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#121318', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Download pre-release gate benchmarks report for Agoda CI/CD pipelines</span>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={handleDownloadMarkdownReport}>
                    <Download size={14} />
                    {markdownReportDownloaded ? 'Downloaded Report!' : 'Download Markdown Audit Log'}
                  </button>
                </div>

                {/* Individual Test cases word diff explorer */}
                <div className="panel-title" style={{ fontSize: '0.95rem' }}><FileCode size={16} /> Individual Case Trace Diff Inspections</div>
                <div className="bench-table-container">
                  <table className="traces-table">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Model A Similarity</th>
                        <th>Model B Similarity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkResults.details.map((item) => {
                        const isExpanded = expandedBenchId === item.test_id;
                        return (
                          <React.Fragment key={item.test_id}>
                            <tr>
                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{item.test_id}</td>
                              <td><span className="score-badge score-badge-green">{item.modelA.similarity}</span></td>
                              <td><span className="score-badge score-badge-green" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee' }}>{item.modelB.similarity}</span></td>
                              <td>
                                <span className={`score-badge ${item.modelB.similarity >= 0.7 ? 'score-badge-green' : 'score-badge-red'}`}>
                                  {item.modelB.similarity >= 0.7 ? 'Passed' : 'Regressed'}
                                </span>
                              </td>
                              <td>
                                <button className="btn-action-small" onClick={() => setExpandedBenchId(isExpanded ? null : item.test_id)}>
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  Diff View
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="row-expanded-detail">
                                <td colSpan="5">
                                  <div className="trace-detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="trace-detail-box" style={{ gridColumn: 'span 2' }}>
                                      <div className="trace-detail-title">Prompt Input</div>
                                      <div className="trace-detail-content">{item.prompt}</div>
                                    </div>
                                    <div className="trace-detail-box" style={{ gridColumn: 'span 2' }}>
                                      <div className="trace-detail-title">Ground Truth Target</div>
                                      <div className="trace-detail-content">{item.ground_truth}</div>
                                    </div>
                                    <div className="trace-detail-box">
                                      <div className="trace-detail-title">Model A Output Diff View</div>
                                      <div style={{ marginTop: '0.4rem' }}>{renderWordDiff(item.modelA.output, item.ground_truth)}</div>
                                    </div>
                                    <div className="trace-detail-box">
                                      <div className="trace-detail-title">Model B Output Diff View</div>
                                      <div style={{ marginTop: '0.4rem' }}>{renderWordDiff(item.modelB.output, item.ground_truth)}</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* --- Feature 1: Golden Test Registry Tab Container --- */}
      {activeTab === 'registry' && (
        <main className="single-column-grid">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Database size={20} color="var(--color-info)" />
                Golden Test Set Registry
              </div>
            </div>

            <div className="main-grid" style={{ gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
              {/* Import CSV block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="file-upload-zone" style={{ position: 'relative' }}>
                  <Upload size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--color-purple)' }} />
                  <p style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Upload Test Set CSV</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Drag & drop or click to browse</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-danger)', marginTop: '0.4rem', fontWeight: '500' }}>Strict limit: Max 50 cases</p>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload} 
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                  />
                </div>

                {uploadError && (
                  <div className="alert-banner" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.25)', padding: '0.5rem 1rem' }}>
                    <div className="alert-banner-left" style={{ color: '#fca5a5', fontSize: '0.8rem' }}>
                      <AlertCircle size={16} />
                      <span>{uploadError}</span>
                    </div>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="alert-banner" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.25)', padding: '0.5rem 1rem' }}>
                    <div className="alert-banner-left" style={{ color: '#34d399', fontSize: '0.8rem' }}>
                      <CheckCircleIcon size={16} />
                      <span>CSV parsed and registered successfully!</span>
                    </div>
                  </div>
                )}

                <div className="trace-detail-box" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="trace-detail-title">CSV Format Template Guide</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ensure your CSV contains header names matching the template below:</p>
                  <pre style={{ backgroundColor: '#090a0f', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
                    test_id,prompt,reference_context,ground_truth
                  </pre>
                  <button className="btn-secondary" style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem' }} onClick={() => handleCopy("test_id,prompt,reference_context,ground_truth\nbk-01,\"Find hotels near Siam Palace.\",\"Context content...\",\"Expected output Siam Palace...\"", 'csv-template')}>
                    {copySuccessId === 'csv-template' ? 'Copied Template!' : 'Copy Sample Template'}
                  </button>
                </div>
              </div>

              {/* Registered sets list */}
              <div className="panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div className="form-label">Registered Evaluation Datasets</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {registry.map(set => (
                    <div 
                      key={set.id} 
                      className="report-summary-box" 
                      style={{ 
                        borderColor: selectedRegistryId === set.id ? 'var(--color-purple)' : 'var(--border-color)',
                        background: selectedRegistryId === set.id ? 'rgba(139, 92, 246, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedRegistryId(set.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{set.name}</span>
                        <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                          {set.itemCount} cases
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <div>Creator: <strong>{set.creator}</strong></div>
                        <div>Target Service: <strong>{set.targetService}</strong></div>
                        <div>Created: <strong>{set.dateCreated}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* --- Feature 3: MLOps Configuration & Webhook Config Tab Container --- */}
      {activeTab === 'mlops-config' && (
        <main className="main-grid">
          {/* Traffic split controller */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Settings size={20} color="var(--color-warning)" />
                MLOps Deployment split settings
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Allocate percentage splits of live production traffic to compare versions in a canary deployment.
              </span>

              {/* Slider for allocation */}
              <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Production (`v1`): <strong>{100 - pendingCanaryPercentage}%</strong></span>
                  <span>Canary (`v2`): <strong>{pendingCanaryPercentage}%</strong></span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={pendingCanaryPercentage}
                  onChange={(e) => setPendingCanaryPercentage(parseInt(e.target.value))}
                  className="slider-input" 
                />
              </div>

              <button 
                className="btn-primary" 
                onClick={() => setShowCanaryConfirm(true)}
                disabled={pendingCanaryPercentage === canaryPercentage}
              >
                Apply Canary Traffic Split
              </button>
            </div>
          </div>

          {/* Webhook curl generator */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Webhook size={20} color="var(--color-info)" />
                CI/CD Webhook cURL Integration
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Downstream pipeline triggers payload dynamic code format:
              </span>
              <pre style={{ backgroundColor: '#090a0f', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
{`curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "CANARY_TRAFFIC_ALLOCATION_UPDATED",
    "timestamp": "${new Date().toISOString()}",
    "service_name": "hotel-recommendations-RAG",
    "traffic_split": {
      "agoda-custom-llama-v1": ${100 - canaryPercentage},
      "agoda-custom-llama-v2": ${canaryPercentage}
    }
  }' \\
  https://platform.agoda.com/api/v2/canary-gate`}
              </pre>
              <button 
                className="btn-secondary" 
                onClick={() => handleCopy(`curl -X POST -H "Content-Type: application/json" -d '{"event":"CANARY_TRAFFIC_ALLOCATION_UPDATED","traffic_split":{"v1":${100-canaryPercentage},"v2":${canaryPercentage}}}' https://platform.agoda.com/api/v2/canary-gate`, 'curl-copy')}
              >
                {copySuccessId === 'curl-copy' ? 'Copied cURL Command!' : 'Copy cURL Snippet'}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* --- Feature 4: VP Executive Reports Dashboard Tab Container --- */}
      {activeTab === 'vp-dashboard' && (
        <main className="single-column-grid">
          {/* Executive scorecard */}
          <section className="scorecard-grid">
            <div className="kpi-card" style={{ '--card-accent': 'var(--color-success)' }}>
              <div className="kpi-header">
                <span>Accumulated Efficiency Savings</span>
                <DollarSign size={18} color="var(--color-success)" />
              </div>
              <div className="kpi-value">${efficiencySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="kpi-subtext">
                <span>Savings from auto-routing to fallback models</span>
              </div>
            </div>
            <div className="kpi-card" style={{ '--card-accent': 'var(--color-purple)' }}>
              <div className="kpi-header">
                <span>Overall Quality SLA Compliance</span>
                <CheckCircleIcon size={18} color="var(--color-purple)" />
              </div>
              <div className="kpi-value">94.8%</div>
              <div className="kpi-subtext">
                <span>Target SLA: &gt; 90% (Quality &gt; 0.8)</span>
              </div>
            </div>
            <div className="kpi-card" style={{ '--card-accent': 'var(--color-info)' }}>
              <div className="kpi-header">
                <span>Total Budget Allocation savings</span>
                <Coins size={18} color="var(--color-info)" />
              </div>
              <div className="kpi-value">12.5%</div>
              <div className="kpi-subtext">
                <span>Compared to unmonitored default models</span>
              </div>
            </div>
          </section>

          {/* 6-week SLA timelines */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <TrendingUp size={20} color="var(--color-purple)" />
                Historical 6-Week Platform SLA Trends (LocalStorage Audits)
              </div>
            </div>

            <div className="main-grid" style={{ gap: '1.5rem' }}>
              {/* Latency compliance sparkline */}
              <div className="chart-container">
                <div className="chart-title-sub">
                  <span>Latency SLA Compliance Percentage (%)</span>
                </div>
                <svg viewBox="0 0 600 150" className="chart-svg">
                  <line x1="0" y1="37.5" x2="600" y2="37.5" className="chart-grid-line" />
                  <line x1="0" y1="75" x2="600" y2="75" className="chart-grid-line" />
                  <line x1="0" y1="112.5" x2="600" y2="112.5" className="chart-grid-line" />
                  <text x="10" y="30" className="chart-axis-text">98%</text>
                  <text x="10" y="70" className="chart-axis-text">95%</text>
                  <text x="10" y="110" className="chart-axis-text">92%</text>
                  
                  <defs>
                    <linearGradient id="grad-sla-lat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-purple)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--color-purple)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path d={buildSvgAreaPath(slaHistory, 'latencySla', 90, 100)} fill="url(#grad-sla-lat)" />
                  <path d={buildSvgPath(slaHistory, 'latencySla', 90, 100)} className="line-relevance" style={{ stroke: 'var(--color-purple)' }} />
                </svg>
              </div>

              {/* COPQ savings sparkline */}
              <div className="chart-container">
                <div className="chart-title-sub">
                  <span>Weekly COPQ Financial Loss Wasted ($)</span>
                </div>
                <svg viewBox="0 0 600 150" className="chart-svg">
                  <line x1="0" y1="37.5" x2="600" y2="37.5" className="chart-grid-line" />
                  <line x1="0" y1="75" x2="600" y2="75" className="chart-grid-line" />
                  <line x1="0" y1="112.5" x2="600" y2="112.5" className="chart-grid-line" />
                  <text x="10" y="30" className="chart-axis-text">$25</text>
                  <text x="10" y="70" className="chart-axis-text">$15</text>
                  <text x="10" y="110" className="chart-axis-text">$5</text>

                  <defs>
                    <linearGradient id="grad-sla-copq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-danger)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--color-danger)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path d={buildSvgAreaPath(slaHistory, 'copq', 0, 30)} fill="url(#grad-sla-copq)" />
                  <path d={buildSvgPath(slaHistory, 'copq', 0, 30)} className="line-copq" />
                </svg>
              </div>
            </div>

            {/* Audit export report block inside VP Dashboard */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#121318', padding: '0.75rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Export the latest pre-release benchmark and platform quality SLA audit report</span>
              <button 
                className="btn-primary" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
                onClick={handleDownloadMarkdownReport}
              >
                <Download size={14} />
                {markdownReportDownloaded ? 'Downloaded Report!' : 'Download Executive Summary Report'}
              </button>
            </div>

          </div>
        </main>
      )}

      {/* --- MLOps Split Confirmation modal --- */}
      {showCanaryConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <AlertTriangle size={20} />
              Confirm Canary Split update
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Are you sure you want to adjust the live production canary routing for **hotel-recommendations-RAG**?
            </p>
            <div style={{ background: '#161821', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              Canary Split: **{pendingCanaryPercentage}%** routed to **agoda-custom-llama-v2**
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setShowCanaryConfirm(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={handleSaveCanarySplit}>
                Confirm Routing Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer */}
      <footer className="dashboard-footer">
        <div>
          <span>LLM Eval Pulse dashboard prototype V2. Maintained by Saurabh Chawda.</span>
        </div>
        <div className="footer-links">
          <a href="file:///c:/Users/saura/OneDrive/Desktop/LIVE PROTOTYPES/Agoda_TPM/FINAL_PRD.md" target="_blank">FINAL_PRD.md</a>
          <span>GitHub Profile</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
