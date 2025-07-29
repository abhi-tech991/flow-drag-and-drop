import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: 'erp-source',
    type: 'dataSource',
    position: { x: 50, y: 50 },
    data: {
      label: 'Pull inventory data from ERP',
      source: 'NetSuite',
      description: 'Remove + rename columns',
      icon: 'netsuite',
    },
  },
  {
    id: 'shopify-source',
    type: 'dataSource',
    position: { x: 50, y: 350 },
    data: {
      label: 'Pull inventory data from Shopify',
      source: 'Shopify',
      description: 'Clean column names',
      icon: 'shopify',
    },
  },
  {
    id: 'combine-process',
    type: 'process',
    position: { x: 450, y: 200 },
    data: {
      label: 'Combine inventory data',
      description: 'Merge and standardize data from multiple sources',
    },
  },
  {
    id: 'filter-retired',
    type: 'filter',
    position: { x: 700, y: 150 },
    data: {
      label: 'Remove retired products',
      description: 'Filter out discontinued items',
    },
  },
  {
    id: 'ai-categorize',
    type: 'ai',
    position: { x: 900, y: 50 },
    data: {
      label: 'Categorize SKUs into product categories with AI',
      description: 'Assign category using AI',
    },
  },
  {
    id: 'filter-discrepancies',
    type: 'filter',
    position: { x: 1200, y: 200 },
    data: {
      label: 'Filter for discrepancies',
      description: 'Keep discrepancies, Remove conflicts',
    },
  },
  {
    id: 'compare-inventory',
    type: 'process',
    position: { x: 900, y: 400 },
    data: {
      label: 'Compare inventory: identify discrepancies & assign status',
      description: 'Identify discrepancies, Assign SKU status',
    },
  },
  {
    id: 'visualize-results',
    type: 'visualization',
    position: { x: 1200, y: 450 },
    data: {
      label: 'Visualize SKU by Status',
      description: 'Display analytics and charts',
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'erp-to-combine',
    source: 'erp-source',
    target: 'combine-process',
    animated: true,
  },
  {
    id: 'shopify-to-combine',
    source: 'shopify-source',
    target: 'combine-process',
    animated: true,
  },
  {
    id: 'combine-to-filter',
    source: 'combine-process',
    target: 'filter-retired',
    animated: true,
  },
  {
    id: 'filter-to-ai',
    source: 'filter-retired',
    target: 'ai-categorize',
    animated: true,
  },
  {
    id: 'ai-to-filter-discrepancies',
    source: 'ai-categorize',
    target: 'filter-discrepancies',
    animated: true,
  },
  {
    id: 'filter-to-compare',
    source: 'filter-retired',
    target: 'compare-inventory',
    animated: true,
  },
  {
    id: 'compare-to-visualize',
    source: 'compare-inventory',
    target: 'visualize-results',
    animated: true,
  },
  {
    id: 'filter-discrepancies-to-visualize',
    source: 'filter-discrepancies',
    target: 'visualize-results',
    animated: true,
  },
];