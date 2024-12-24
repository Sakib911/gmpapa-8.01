'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Store, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ResellerSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const callbackUrl = searchParams.get('from') || '/reseller';
  const message = searchParams.get('message');

  // Show message if exists
  if (message) {
    toast({
      title: "Notice",
      description: message,
      duration: 5000,
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        role: 'reseller',
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('pending approval')) {
          router.push('/auth/reseller/signin/error');
          return;
        }
        setError('Invalid email or password');
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in to your reseller account.",
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Info Section */}
        <div className="hidden md:flex flex-col justify-center space-y-6 p-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Reseller Portal
            </h1>
            <p className="text-lg text-gray-400">
              Access your reseller dashboard to manage your store, track orders, and grow your business.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Store className="h-6 w-6 text-purple-500 mt-1" />
              <div>
                <h3 className="font-semibold">Dedicated Store</h3>
                <p className="text-sm text-gray-400">
                  Get your own branded storefront with customizable themes and domain
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ShieldCheck className="h-6 w-6 text-purple-500 mt-1" />
              <div>
                <h3 className="font-semibold">Secure Platform</h3>
                <p className="text-sm text-gray-400">
                  Built with enterprise-grade security to protect your business
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <Card className="border-purple-900/20 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reseller Sign In</CardTitle>
            <CardDescription>
              Sign in to your reseller account to manage your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have a reseller account?{' '}
                  <Link href="/auth/reseller/register" className="text-purple-500 hover:underline">
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  <Link href="/auth/signin" className="text-purple-500 hover:underline">
                    Customer sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}