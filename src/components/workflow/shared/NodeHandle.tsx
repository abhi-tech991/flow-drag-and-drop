import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface NodeHandleProps {
  type: 'source' | 'target';
  position: Position;
  color: string;
  isConnectable?: boolean;
  id?: string;
  className?: string;
}

export const NodeHandle: React.FC<NodeHandleProps> = ({
  type,
  position,
  color,
  isConnectable = true,
  id,
  className
}) => {
  return (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={isConnectable}
      className={cn(
        "w-3 h-3 border-2 transition-all duration-200 hover:scale-125",
        className
      )}
      style={{
        backgroundColor: color,
        borderColor: color
      }}
    />
  );
};