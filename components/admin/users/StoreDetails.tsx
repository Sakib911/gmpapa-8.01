
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  Store as StoreIcon,
  Settings,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StoreDetailsProps {
  store: any;
  onClose: () => void;
}

export function StoreDetails({ store, onClose }: StoreDetailsProps) {
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);

  const handleVerifyDomain = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/admin/stores/${store._id}/verify-domain`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to verify domain');
      }

      toast({
        title: 'Success',
        description: 'Domain verified successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify domain',
        variant: 'destructive'
      });
    } finally {
      setVerifying(false);
    }
  };

  const getDomainStatus = () => {
    if (store.domainSettings.customDomain) {
      if (store.domainSettings.customDomainVerified) {
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      }
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending Verification
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        Using Subdomain
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Store Information</CardTitle>
                <Button variant="outline" size="sm" onClick={() => window.open(store.storeURL, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Store
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Store Name</p>
                  <p className="font-medium">{store.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                    {store.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{store.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{store.analytics.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(store.analytics.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(store.analytics.totalProfit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {store.domainSettings.customDomain || `${store.domainSettings.subdomain}.yourdomain.com`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {store.domainSettings.customDomain ? 'Custom Domain' : 'Subdomain'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getDomainStatus()}
                  {store.domainSettings.customDomain && !store.domainSettings.customDomainVerified && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleVerifyDomain}
                      disabled={verifying}
                    >
                      Verify Domain
                    </Button>
                  )}
                </div>
              </div>

              {store.domainSettings.customDomain && !store.domainSettings.customDomainVerified && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Domain needs to be verified. Please add the following DNS records:
                    <div className="mt-2 font-mono text-sm">
                      <div>A Record: {store.domainSettings.dnsSettings?.aRecord}</div>
                      <div>CNAME Record: {store.domainSettings.dnsSettings?.cnameRecord}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Default Markup</p>
                    <p className="font-medium">{store.settings.defaultMarkup}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Auto Fulfillment</p>
                    <p className="font-medium">
                      {store.settings.autoFulfillment ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Balance Alert</p>
                    <p className="font-medium">{formatCurrency(store.settings.lowBalanceAlert)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Markup Range</p>
                    <p className="font-medium">
                      {store.settings.minimumMarkup}% - {store.settings.maximumMarkup}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Store Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(store.analytics.monthlyRevenue || 0)}</p>
                    <p className={`text-xs ${(store.analytics.revenueGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {store.analytics.revenueGrowth > 0 ? '+' : ''}{store.analytics.revenueGrowth || 0}% from last month
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Monthly Orders</p>
                    <p className="text-2xl font-bold">{store.analytics.monthlyOrders || 0}</p>
                    <p className={`text-xs ${(store.analytics.orderGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {store.analytics.orderGrowth > 0 ? '+' : ''}{store.analytics.orderGrowth || 0}% from last month
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(store.analytics.averageOrderValue || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      Based on last 30 days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
