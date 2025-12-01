import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { analyzeMarketTrends } from '@/lib/affiliate/market-analysis';
import { CommissionTracker } from '@/lib/affiliate/commission-tracking';
import { BulkOperationManager } from '@/lib/affiliate/bulk-operations';