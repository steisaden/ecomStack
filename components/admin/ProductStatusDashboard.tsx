import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AffiliateProduct, ImageRefreshStatus, LinkValidationStatus } from '@/lib/types';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface ProductStatusDashboardProps {
  onRefreshProduct?: (productId: string) => Promise<void>;
  onRefreshImage?: (productId: string) => Promise<void>;
  onValidateLink?: (productId: string) => Promise<void>;
}

const StatusBadge = ({ status }: { status: ImageRefreshStatus | LinkValidationStatus }) => {
  const variant = {
    current: 'success',
    valid: 'success',
    outdated: 'warning',
    checking: 'info',
    invalid: 'destructive',
    failed: 'destructive',
  }[status] as 'success' | 'warning' | 'info' | 'destructive';

  return <Badge variant={variant}>{status}</Badge>;
};

export default function ProductStatusDashboard({ 
  onRefreshProduct,
  onRefreshImage,
  onValidateLink
}: ProductStatusDashboardProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, { image: boolean; link: boolean }>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products with status
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch from API
        const response = await fetch('/api/admin/products/status');
        if (response.ok) {
          // In a real implementation, we'd fetch the actual affiliate products
          // For now, we'll use mock data but would connect to real API
          const mockProducts: AffiliateProduct[] = [
            {
              id: '1', title: 'Premium Skincare Set', affiliateUrl: 'https://amzn.to/1',
              imageRefreshStatus: 'current', linkValidationStatus: 'valid',
              lastImageRefresh: new Date(Date.now() - 3600000).toISOString(), lastLinkCheck: new Date(Date.now() - 1800000).toISOString(),
              needsReview: false, description: 'A premium set of skincare products', price: 49.99, tags: ['skincare', 'premium'], commissionRate: 8, platform: 'amazon', performance: { clicks: 120, conversions: 12, revenue: 599.88, conversionRate: 10, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
            {
              id: '2', title: 'Organic Hair Oil', affiliateUrl: 'https://amzn.to/2',
              imageRefreshStatus: 'outdated', linkValidationStatus: 'invalid',
              lastImageRefresh: new Date(Date.now() - 86400000).toISOString(), lastLinkCheck: new Date(Date.now() - 3600000).toISOString(),
              needsReview: true, description: 'Organic hair oil for healthy hair', price: 29.99, tags: ['hair', 'organic'], commissionRate: 10, platform: 'amazon', performance: { clicks: 85, conversions: 8, revenue: 239.92, conversionRate: 9.4, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
            {
              id: '3', title: 'Essential Oil Diffuser', affiliateUrl: 'https://amzn.to/3',
              imageRefreshStatus: 'failed', linkValidationStatus: 'checking',
              lastImageRefresh: new Date(Date.now() - 172800000).toISOString(), lastLinkCheck: new Date().toISOString(),
              needsReview: true, description: 'Ultrasonic diffuser for aromatherapy', price: 34.99, tags: ['aromatherapy', 'diffuser'], commissionRate: 12, platform: 'amazon', performance: { clicks: 200, conversions: 15, revenue: 524.85, conversionRate: 7.5, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
            {
              id: '4', title: 'Natural Face Mask', affiliateUrl: 'https://amzn.to/4',
              imageRefreshStatus: 'current', linkValidationStatus: 'valid',
              lastImageRefresh: new Date(Date.now() - 1800000).toISOString(), lastLinkCheck: new Date(Date.now() - 900000).toISOString(),
              needsReview: false, description: 'Natural clay face mask for all skin types', price: 19.99, tags: ['skincare', 'mask'], commissionRate: 15, platform: 'amazon', performance: { clicks: 300, conversions: 25, revenue: 499.75, conversionRate: 8.3, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
          ];
          setProducts(mockProducts);
        } else {
          // Handle error
          console.error('Failed to fetch product statuses');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.title.toLowerCase().includes(filter.toLowerCase()))
      .filter(p => statusFilter.length === 0 || statusFilter.includes(p.imageRefreshStatus) || statusFilter.includes(p.linkValidationStatus));
  }, [products, filter, statusFilter]);

  const handleRefreshImage = async (productId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], image: true }
    }));

    try {
      if (onRefreshImage) {
        await onRefreshImage(productId);
      } else {
        // Call API to schedule image refresh
        const response = await fetch(`/api/admin/products/${productId}/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'refresh_image' })
        });

        if (response.ok) {
          // Update product status in local state
          setProducts(prev => prev.map(p => 
            p.id === productId 
              ? { 
                  ...p, 
                  imageRefreshStatus: 'current', 
                  lastImageRefresh: new Date().toISOString() 
                } 
              : p
          ));
        } else {
          console.error('Failed to schedule image refresh');
        }
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [productId]: { ...prev[productId], image: false }
      }));
    }
  };

  const handleValidateLink = async (productId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], link: true }
    }));

    try {
      if (onValidateLink) {
        await onValidateLink(productId);
      } else {
        // Call API to schedule link validation
        const response = await fetch(`/api/admin/products/${productId}/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'validate_link' })
        });

        if (response.ok) {
          // Update product status in local state
          setProducts(prev => prev.map(p => 
            p.id === productId 
              ? { 
                  ...p, 
                  linkValidationStatus: 'valid', 
                  lastLinkCheck: new Date().toISOString() 
                } 
              : p
          ));
        } else {
          console.error('Failed to schedule link validation');
        }
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [productId]: { ...prev[productId], link: false }
      }));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Filter products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filter by Status</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem onCheckedChange={() => setStatusFilter([])}>All</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem onCheckedChange={() => setStatusFilter(['outdated', 'failed', 'invalid'])}>Needs Review</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem onCheckedChange={() => setStatusFilter(['current', 'valid'])}>Healthy</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Image Status</TableHead>
              <TableHead>Link Status</TableHead>
              <TableHead>Last Image Refresh</TableHead>
              <TableHead>Last Link Check</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className={product.needsReview ? 'bg-yellow-50' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <span>{product.title}</span>
                    <a 
                      href={product.affiliateUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  {product.needsReview && (
                    <span className="text-xs text-yellow-600">Needs review</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <StatusBadge status={product.imageRefreshStatus} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <StatusBadge status={product.linkValidationStatus} />
                  </div>
                </TableCell>
                <TableCell>
                  {product.lastImageRefresh ? formatTime(product.lastImageRefresh) : 'N/A'}
                </TableCell>
                <TableCell>
                  {product.lastLinkCheck ? formatTime(product.lastLinkCheck) : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleRefreshImage(product.id)}
                      disabled={loadingStates[product.id]?.image}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingStates[product.id]?.image ? 'animate-spin' : ''}`} />
                      {loadingStates[product.id]?.image ? 'Refreshing...' : 'Image'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleValidateLink(product.id)}
                      disabled={loadingStates[product.id]?.link}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingStates[product.id]?.link ? 'animate-spin' : ''}`} />
                      {loadingStates[product.id]?.link ? 'Validating...' : 'Link'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          No products match your current filters
        </div>
      )}
    </div>
  );
}
