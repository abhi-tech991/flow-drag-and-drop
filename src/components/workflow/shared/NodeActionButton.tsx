import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  color?: string;
  disabled?: boolean;
  className?: string;
}

export const NodeActionButton: React.FC<NodeActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'outline',
  size = 'sm',
  color,
  disabled = false,
  className
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gap-2 transition-all duration-200 hover:scale-105",
        className
      )}
      style={{
        borderColor: color,
        color: color
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
};