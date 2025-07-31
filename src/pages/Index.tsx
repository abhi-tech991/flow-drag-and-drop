import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import WorkflowWrapper from '@/components/workflow/WorkflowWrapper';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <WorkflowWrapper /> : <AuthLayout onAuthSuccess={() => window.location.reload()} />;
};

export default Index;
