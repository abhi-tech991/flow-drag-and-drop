import { Node, Edge } from '@xyflow/react';

export const enhancedInitialNodes: Node[] = [
  {
    id: 'erp-source',
    type: 'enhancedDataSource',
    position: { x: 50, y: 50 },
    data: {
      label: 'Pull inventory data from ERP',
      source: 'NetSuite',
      description: 'Remove + rename columns',
      status: 'completed',
      config: {
        sourceType: 'netsuite',
        connectionString: 'configured',
        autoSync: true,
        syncFrequency: '30'
      },
    },
  },
  {
    id: 'shopify-source',
    type: 'enhancedDataSource',
    position: { x: 50, y: 350 },
    data: {
      label: 'Pull inventory data from Shopify',
      source: 'Shopify',
      description: 'Clean column names',
      status: 'completed',
      config: {
        sourceType: 'shopify',
        connectionString: 'configured',
        autoSync: true,
        syncFrequency: '15'
      },
    },
  },
  {
    id: 'combine-process',
    type: 'enhancedProcess',
    position: { x: 450, y: 200 },
    data: {
      label: 'Combine inventory data',
      description: 'Merge and standardize data from multiple sources',
      status: 'processing',
      config: {
        transformationType: 'merge',
        transformationRules: 'Merge by SKU, standardize column names'
      },
    },
  },
  {
    id: 'filter-retired',
    type: 'enhancedFilter',
    position: { x: 700, y: 150 },
    data: {
      label: 'Remove retired products',
      description: 'Filter out discontinued items',
      status: 'idle',
      config: {
        filterConditions: '{"status": {"not": "retired"}}',
        discrepancyThreshold: '0'
      },
    },
  },
  {
    id: 'ai-categorize',
    type: 'enhancedAI',
    position: { x: 900, y: 50 },
    data: {
      label: 'Categorize SKUs into product categories with AI',
      description: 'Assign category using AI',
      status: 'idle',
      config: {
        aiModel: 'categorization',
        confidenceThreshold: '85',
        autoLearning: true
      },
    },
  },
  {
    id: 'filter-discrepancies',
    type: 'enhancedFilter',
    position: { x: 1200, y: 200 },
    data: {
      label: 'Filter for discrepancies',
      description: 'Keep discrepancies, Remove conflicts',
      status: 'idle',
      config: {
        filterConditions: '{"discrepancy": {"exists": true}}',
        discrepancyThreshold: '5'
      },
    },
  },
  {
    id: 'compare-inventory',
    type: 'enhancedProcess',
    position: { x: 900, y: 400 },
    data: {
      label: 'Compare inventory: identify discrepancies & assign status',
      description: 'Identify discrepancies, Assign SKU status',
      status: 'idle',
      config: {
        transformationType: 'aggregate',
        transformationRules: 'Compare quantities, identify discrepancies'
      },
    },
  },
  {
    id: 'visualize-results',
    type: 'enhancedVisualization',
    position: { x: 1200, y: 450 },
    data: {
      label: 'Visualize SKU by Status',
      description: 'Display analytics and charts',
      status: 'idle',
      config: {
        chartType: 'dashboard',
        metrics: 'SKU status breakdown, discrepancy analysis',
        realTime: true
      },
    },
  },
];

export const enhancedInitialEdges: Edge[] = [
  {
    id: 'erp-to-combine',
    source: 'erp-source',
    target: 'combine-process',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-erp))', strokeWidth: 2 },
  },
  {
    id: 'shopify-to-combine',
    source: 'shopify-source',
    target: 'combine-process',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-shopify))', strokeWidth: 2 },
  },
  {
    id: 'combine-to-filter',
    source: 'combine-process',
    target: 'filter-retired',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-process))', strokeWidth: 2 },
  },
  {
    id: 'filter-to-ai',
    source: 'filter-retired',
    target: 'ai-categorize',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-filter))', strokeWidth: 2 },
  },
  {
    id: 'ai-to-filter-discrepancies',
    source: 'ai-categorize',
    target: 'filter-discrepancies',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-ai))', strokeWidth: 2 },
  },
  {
    id: 'filter-to-compare',
    source: 'filter-retired',
    target: 'compare-inventory',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-filter))', strokeWidth: 2 },
  },
  {
    id: 'compare-to-visualize',
    source: 'compare-inventory',
    target: 'visualize-results',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-process))', strokeWidth: 2 },
  },
  {
    id: 'filter-discrepancies-to-visualize',
    source: 'filter-discrepancies',
    target: 'visualize-results',
    animated: true,
    style: { stroke: 'hsl(var(--workflow-filter))', strokeWidth: 2 },
  },
];