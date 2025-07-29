import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

interface DataSourceNodeProps {
  data: {
    label: string;
    source?: string;
    description?: string;
    icon?: string;
  };
}

const DataSourceNode: React.FC<DataSourceNodeProps> = ({ data }) => {
  const getSourceColor = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'netsuite':
        return 'bg-workflow-erp text-white';
      case 'shopify':
        return 'bg-workflow-shopify text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'netsuite':
        return '🔷'; // NetSuite-like icon
      case 'shopify':
        return '🛍️'; // Shopify-like icon
      default:
        return '📊';
    }
  };

  return (
    <Card className="min-w-[280px] p-4 shadow-lg border-2 border-workflow-erp/20 bg-card">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-workflow-erp/10 flex items-center justify-center text-xl">
            {data.source ? getSourceIcon(data.source) : <Database className="h-6 w-6 text-workflow-erp" />}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {data.source && (
              <Badge className={getSourceColor(data.source)}>
                {data.source}
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-card-foreground text-sm leading-tight mb-1">
            {data.label}
          </h3>
          
          {data.description && (
            <p className="text-xs text-muted-foreground">
              {data.description}
            </p>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-workflow-erp bg-workflow-erp"
      />
    </Card>
  );
};

export default memo(DataSourceNode);