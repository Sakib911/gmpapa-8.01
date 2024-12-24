'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { debounce } from '@/lib/utils/debounce';

interface DomainInputProps {
  onDomainChange: (domain: string | null, subdomain: string | null) => void;
}

export function DomainInput({ onDomainChange }: DomainInputProps) {
  const [useSubdomain, setUseSubdomain] = useState(false);
  const [domain, setDomain] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const checkAvailability = debounce(async (value: string, type: 'domain' | 'subdomain') => {
    if (!value) {
      setError('');
      onDomainChange(null, null);
      return;
    }
    
    setChecking(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.set(type, value);
      
      const response = await fetch(`/api/reseller/check-domain?${params}`);
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      
      const data = await response.json();
      
      if (!data.available) {
        setError(`This ${type} is already taken`);
        onDomainChange(null, null);
      } else {
        onDomainChange(
          type === 'domain' ? value : null,
          type === 'subdomain' ? value : null
        );
      }
    } catch (error) {
      console.error('Domain check error:', error);
      setError('Failed to check availability');
      onDomainChange(null, null);
    } finally {
      setChecking(false);
    }
  }, 500);

  useEffect(() => {
    if (useSubdomain) {
      setDomain('');
      if (subdomain) {
        checkAvailability(subdomain, 'subdomain');
      }
    } else {
      setSubdomain('');
      if (domain) {
        checkAvailability(domain, 'domain');
      }
    }
  }, [useSubdomain]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Use Subdomain</Label>
        <Switch
          checked={useSubdomain}
          onCheckedChange={setUseSubdomain}
        />
      </div>

      {useSubdomain ? (
        <div className="space-y-2">
          <Label>Subdomain</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="mystore"
              value={subdomain}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setSubdomain(value);
                if (value) {
                  checkAvailability(value, 'subdomain');
                } else {
                  setError('');
                  onDomainChange(null, null);
                }
              }}
              className="flex-1"
            />
            <span className="text-muted-foreground">.gmpapa.com</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Custom Domain</Label>
          <Input
            placeholder="store.example.com"
            value={domain}
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              setDomain(value);
              if (value) {
                checkAvailability(value, 'domain');
              } else {
                setError('');
                onDomainChange(null, null);
              }
            }}
          />
        </div>
      )}

      {checking && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking availability...
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}