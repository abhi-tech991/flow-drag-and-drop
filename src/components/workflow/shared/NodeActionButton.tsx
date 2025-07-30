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
  loading?: boolean;
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
  loading = false,
  className
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "gap-2 transition-all duration-200 hover:scale-105 relative overflow-hidden",
        loading && "animate-pulse",
        className
      )}
      style={{
        borderColor: color,
        color: color
      }}
    >
      <Icon className={cn("h-4 w-4", loading && "animate-spin")} />
      {loading ? 'Loading...' : label}
      
      {/* Shimmer effect for loading */}
      {loading && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </Button>
  );
};