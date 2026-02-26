import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AffiliateProduct, ImageRefreshStatus, LinkValidationStatus } from '@/lib/types';

interface BulkProductActionsProps {
  products: AffiliateProduct[];
  selectedProducts: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkRefresh?: (productIds: string[]) => Promise<void>;
  onBulkValidateLinks?: (productIds: string[]) => Promise<void>;
}

export default function BulkProductActions({
  products,
  selectedProducts,
  onSelectionChange,
  onBulkRefresh,
  onBulkValidateLinks
}: BulkProductActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map(p => p.id));
    }
  };

  const handleBulkRefresh = async () => {
    if (selectedProducts.length === 0) return;

    setIsRefreshing(true);
    try {
      if (onBulkRefresh) {
        await onBulkRefresh(selectedProducts);
      } else {
        // Call API to schedule bulk image refresh
        const response = await fetch('/api/admin/products/bulk-refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productIds: selectedProducts,
            action: 'refresh_image'
          })
        });

        if (!response.ok) {
          console.error('Failed to schedule bulk image refresh');
        }
      }
      // Reset selection after operation
      onSelectionChange([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBulkValidate = async () => {
    if (selectedProducts.length === 0) return;

    setIsValidating(true);
    try {
      if (onBulkValidateLinks) {
        await onBulkValidateLinks(selectedProducts);
      } else {
        // Call API to schedule bulk link validation
        const response = await fetch('/api/admin/products/bulk-refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productIds: selectedProducts,
            action: 'validate_link'
          })
        });

        if (!response.ok) {
          console.error('Failed to schedule bulk link validation');
        }
      }
      // Reset selection after operation
      onSelectionChange([]);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: ImageRefreshStatus | LinkValidationStatus) => {
    switch (status) {
      case 'current':
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'outdated':
      case 'checking':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: ImageRefreshStatus | LinkValidationStatus): "default" | "secondary" | "destructive" | "outline" | "sage" => {
    switch (status) {
      case 'current':
      case 'valid':
        return 'sage'; // mapped from success
      case 'outdated':
      case 'checking':
        return 'outline'; // mapped from warning
      case 'failed':
      case 'invalid':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedProducts.length === products.length && products.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select All
          </label>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleBulkRefresh}
            disabled={selectedProducts.length === 0 || isRefreshing}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : `Refresh Images (${selectedProducts.length})`}
          </Button>
          <Button
            onClick={handleBulkValidate}
            disabled={selectedProducts.length === 0 || isValidating}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Validating...' : `Validate Links (${selectedProducts.length})`}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const imageStatus: ImageRefreshStatus = product.imageRefreshStatus ?? 'current';
          const linkStatus: LinkValidationStatus = product.linkValidationStatus ?? 'valid';

          return (
            <div
              key={product.id}
              className={`border rounded-lg p-3 flex items-start space-x-3 ${selectedProducts.includes(product.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
            >
              <Checkbox
                id={`product-${product.id}`}
                checked={selectedProducts.includes(product.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectionChange([...selectedProducts, product.id]);
                  } else {
                    onSelectionChange(selectedProducts.filter(id => id !== product.id));
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium truncate">{product.title}</span>
                  <Badge variant={getStatusVariant(imageStatus)} className="shrink-0">
                    <span className="flex items-center">
                      {getStatusIcon(imageStatus)}
                      <span className="ml-1">{imageStatus}</span>
                    </span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Link:</span>
                  <Badge variant={getStatusVariant(linkStatus)} className="shrink-0">
                    <span className="flex items-center">
                      {getStatusIcon(linkStatus)}
                      <span className="ml-1">{linkStatus}</span>
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
