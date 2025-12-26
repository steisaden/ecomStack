// app/admin/affiliate-products/dashboard/page.tsx

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Forces Vercel rebuild
export default function AffiliateDashboardPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="commissions">Commissions</TabsTrigger>
                    <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Affiliate Overview</CardTitle>
                            <CardDescription>Track your affiliate performance and market trends.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Overview content coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="commissions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Tracking</CardTitle>
                            <CardDescription>View and manage affiliate commissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Commission tracking features coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="operations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Operations</CardTitle>
                            <CardDescription>Manage bulk product updates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Bulk operation tools coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}