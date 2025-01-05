'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { APIError, handleAPIResponse } from '@/lib/api/errors';

interface Store {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  storeURL: string;
  domainSettings: {
    subdomain: string;
    customDomain: string;
    customDomainVerified?: boolean;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };
  settings: {
    defaultMarkup: number;
    minimumMarkup: number;
    maximumMarkup: number;
    autoFulfillment: boolean;
    lowBalanceAlert: number;
    notifications: {
      email: boolean;
      orderUpdates: boolean;
      lowStock: boolean;
      promotions: boolean;
    };
  };
  status: 'pending' | 'active' | 'suspended';
  analytics: {
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
  };
}

export function useStore(storeId: string) {
  const { data: session } = useSession();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user && storeId) {
      fetchStore();
    }
  }, [session, storeId]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/stores/${storeId}`);
      const data = await handleAPIResponse<Store>(response);
      
      setStore(data);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to fetch store';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    store,
    loading,
    error,
    refreshStore: fetchStore
  };
}