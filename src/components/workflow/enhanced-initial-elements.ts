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