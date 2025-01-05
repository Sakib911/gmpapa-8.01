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
  status: 'pending' | 'active' | 'suspended';
  analytics: {
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
  };
}

export function useStores() {
  const { data: session } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
      fetchStores();
    }
  }, [session]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stores');
      const data = await handleAPIResponse<Store[]>(response);
      
      setStores(data);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to fetch stores';
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
    stores,
    loading,
    error,
    refreshStores: fetchStores
  };
}