'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Store, Globe, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResellerDetailsProps {
  reseller: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function ResellerDetails({ reseller, onClose, onUpdate }: ResellerDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [domain, setDomain] = useState('');
  const { toast } = useToast();

  const handleDomainAssignment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/resellers/${reseller._id}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign domain');
      }

      toast({
        title: 'Success',
        description: 'Domain assigned successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Failed to assign domain:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!reseller} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reseller Details</DialogTitle>
          <DialogDescription>
            View and manage reseller information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              {/* Profile Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={reseller.image} />
                      <AvatarFallback>
                        {reseller.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{reseller.name}</h2>
                      <p className="text-muted-foreground">{reseller.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>{reseller.status}</Badge>
                        <Badge variant="outline">
                          Since {new Date(reseller.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Business Name</Label>
                      <p className="font-medium">{reseller.businessName}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{reseller.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Business Description</Label>
                    <p className="text-muted-foreground">
                      {reseller.businessDescription || 'No description provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="store">
            <div className="space-y-4">
              {/* Domain Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter domain (e.g., store.example.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleDomainAssignment}
                      disabled={loading || !domain}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Assign Domain
                    </Button>
                  </div>

                  {reseller.domain && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="font-medium">{reseller.domain}</span>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Store Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Default Markup</Label>
                      <p className="font-medium">{reseller.settings?.defaultMarkup || 20}%</p>
                    </div>
                    <div>
                      <Label>Auto Fulfillment</Label>
                      <p className="font-medium">
                        {reseller.settings?.autoFulfillment ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <Label>Low Balance Alert</Label>
                      <p className="font-medium">
                        {formatCurrency(reseller.settings?.lowBalanceAlert || 100)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Total Orders</Label>
                    <p className="text-2xl font-bold">{reseller.statistics?.totalOrders || 0}</p>
                  </div>
                  <div>
                    <Label>Total Revenue</Label>
                    <p className="text-2xl font-bold">
                      {formatCurrency(reseller.statistics?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <Label>Average Order Value</Label>
                    <p className="text-2xl font-bold">
                      {formatCurrency(reseller.statistics?.averageOrderValue || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Monthly Growth</Label>
                      <p className="text-2xl font-bold text-green-500">
                        +{reseller.analytics?.monthlyGrowth || 0}%
                      </p>
                    </div>
                    <div>
                      <Label>Active Products</Label>
                      <p className="text-2xl font-bold">
                        {reseller.analytics?.activeProducts || 0}
                      </p>
                    </div>
                  </div>

                  {/* Add charts and more analytics here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}