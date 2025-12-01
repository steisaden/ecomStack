'use client'

import * as React from 'react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  FileText, 
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Plus
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface BulkProductData {
  title: string
  description: string
  category: string
  price: number
  isAffiliate: boolean
  affiliateUrl?: string
  imageUrl?: string
  tags: string[]
  inStock: boolean
}

interface BulkUploadResult {
  success: boolean
  processed: number
  errors: string[]
  created: number
}

interface BulkProductUploadProps {
  onUploadComplete?: () => void
}

export default function BulkProductUpload({ onUploadComplete }: BulkProductUploadProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [bulkData, setBulkData] = useState<BulkProductData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [manualEntry, setManualEntry] = useState<BulkProductData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    isAffiliate: false,
    affiliateUrl: '',
    imageUrl: '',
    tags: [],
    inStock: true
  })
  const [tagInput, setTagInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const categories = [
    'Hair Care',
    'Skin Care',
    'Body Care',
    'Essential Oils',
    'Wellness',
    'Accessories'
  ]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    // Reset form state when flipping back
    if (isFlipped) {
      setUploadFile(null)
      setBulkData([])
      setUploadResult(null)
      setManualEntry({
        title: '',
        description: '',
        category: '',
        price: 0,
        isAffiliate: false,
        affiliateUrl: '',
        imageUrl: '',
        tags: [],
        inStock: true
      })
      setTagInput('')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      })
      return
    }

    setUploadFile(file)
    parseCSVFile(file)
  }

  const parseCSVFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast({
          title: "Invalid CSV format",
          description: "CSV must have header row and at least one data row",
          variant: "destructive"
        })
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['title', 'description', 'category', 'price']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Missing required columns",
          description: `CSV must include: ${missingHeaders.join(', ')}`,
          variant: "destructive"
        })
        return
      }

      const products: BulkProductData[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length < headers.length) continue

        const product: BulkProductData = {
          title: values[headers.indexOf('title')] || '',
          description: values[headers.indexOf('description')] || '',
          category: values[headers.indexOf('category')] || '',
          price: parseFloat(values[headers.indexOf('price')]) || 0,
          isAffiliate: values[headers.indexOf('isaffiliate')]?.toLowerCase() === 'true',
          affiliateUrl: values[headers.indexOf('affiliateurl')] || '',
          imageUrl: values[headers.indexOf('imageurl')] || '',
          tags: values[headers.indexOf('tags')]?.split(';').filter(Boolean) || [],
          inStock: values[headers.indexOf('instock')]?.toLowerCase() !== 'false'
        }

        if (product.title && product.description && product.category) {
          products.push(product)
        }
      }

      setBulkData(products)
      toast({
        title: "CSV parsed successfully",
        description: `Found ${products.length} valid products`,
      })
    }

    reader.readAsText(file)
  }

  const addTag = () => {
    if (tagInput.trim() && !manualEntry.tags.includes(tagInput.trim())) {
      setManualEntry(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setManualEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addManualProduct = () => {
    if (!manualEntry.title || !manualEntry.description || !manualEntry.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, description, and category",
        variant: "destructive"
      })
      return
    }

    setBulkData(prev => [...prev, { ...manualEntry }])
    setManualEntry({
      title: '',
      description: '',
      category: '',
      price: 0,
      isAffiliate: false,
      affiliateUrl: '',
      imageUrl: '',
      tags: [],
      inStock: true
    })
    setTagInput('')
    
    toast({
      title: "Product added",
      description: "Product added to bulk upload queue",
    })
  }

  const processBulkUpload = async () => {
    if (bulkData.length === 0) {
      toast({
        title: "No products to upload",
        description: "Please add products via CSV or manual entry",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ products: bulkData })
      })

      const result = await response.json()
      
      if (response.ok) {
        setUploadResult(result)
        if (result.success && result.created > 0) {
          toast({
            title: "Bulk upload completed",
            description: `Successfully created ${result.created} out of ${result.processed} products`,
          })
          // Trigger refresh of parent component
          if (onUploadComplete) {
            onUploadComplete()
          }
          // Clear the bulk data after successful upload
          setBulkData([])
        } else {
          toast({
            title: "Upload completed with issues",
            description: `Created ${result.created} products, but encountered ${result.errors.length} errors`,
            variant: "destructive"
          })
        }
      } else {
        if (response.status === 401) {
          toast({
            title: "Authentication required",
            description: "Please log in to upload products",
            variant: "destructive"
          })
        } else {
          throw new Error(result.message || 'Upload failed')
        }
      }
    } catch (error) {
      console.error('Bulk upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      })
      setUploadResult({
        success: false,
        processed: bulkData.length,
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
        created: 0
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const headers = 'title,description,category,price,isAffiliate,affiliateUrl,imageUrl,tags,inStock\n'
    const sample = 'Sample Product,A beautiful handcrafted product,Hair Care,29.99,false,,https://example.com/image.jpg,organic;natural,true\n'
    const csvContent = headers + sample
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-product-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bulk-upload-container">
      <style jsx>{`
        .bulk-upload-container {
          perspective: 1200px;
          height: 600px;
          position: relative;
          z-index: 20;
        }
        
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
          transform-style: preserve-3d;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .flip-card.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.3s ease;
          z-index: 10;
        }
        
        .flip-card-face:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
        
        .upload-zone {
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .upload-zone::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .upload-zone:hover {
          border-color: #3b82f6;
          background-color: #f8fafc;
          transform: translateY(-2px);
        }
        
        .upload-zone:hover::before {
          left: 100%;
        }
        
        .upload-zone.dragover {
          border-color: #3b82f6;
          background-color: #eff6ff;
          transform: scale(1.02);
          box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.2);
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        }
        
        .upload-zone.dragover {
          animation: pulse-glow 1.5s infinite;
        }
      `}</style>

      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Face - Bulk Upload Button */}
        <div className="flip-card-face">
          <Card className="h-full bg-white border border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Product Upload
              </CardTitle>
              <CardDescription>
                Upload multiple products at once using CSV files or manual entry
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 space-y-4">
              <div className="text-center space-y-2">
                <div className="text-4xl">📦</div>
                <p className="text-muted-foreground">
                  Streamline your product management with bulk operations
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleFlip} size="lg" className="min-w-[160px]">
                  <Upload className="h-4 w-4 mr-2" />
                  Start Bulk Upload
                </Button>
                <Button variant="outline" onClick={downloadTemplate} size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center max-w-md">
                Supports CSV files with product data including titles, descriptions, 
                categories, pricing, and affiliate information
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Face - Upload Form */}
        <div className="flip-card-face flip-card-back">
          <Card className="h-full bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Product Upload
                </CardTitle>
                <CardDescription>
                  Upload products via CSV file or add them manually
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleFlip}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6 overflow-y-auto">
              {/* Upload Result */}
              {uploadResult && (
                <div className={`p-4 rounded-lg border ${
                  uploadResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {uploadResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {uploadResult.success ? 'Upload Completed' : 'Upload Failed'}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>Processed: {uploadResult.processed} products</p>
                    <p>Created: {uploadResult.created} products</p>
                    {uploadResult.errors.length > 0 && (
                      <div>
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside">
                          {uploadResult.errors.map((error, index) => (
                            <li key={index} className="text-red-600">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CSV Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">CSV File Upload</Label>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-3 w-3 mr-1" />
                    Template
                  </Button>
                </div>
                
                <div 
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.add('dragover')
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('dragover')
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove('dragover')
                    const files = e.dataTransfer.files
                    if (files.length > 0) {
                      setUploadFile(files[0])
                      parseCSVFile(files[0])
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {uploadFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-green-600" />
                      <p className="font-medium">{uploadFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bulkData.length} products parsed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="font-medium">Drop CSV file here or click to browse</p>
                      <p className="text-sm text-muted-foreground">
                        Supports CSV files with product data
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Entry Section */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-medium">Manual Product Entry</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={manualEntry.title}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter product title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={manualEntry.category} 
                      onValueChange={(value) => setManualEntry(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={manualEntry.description}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={manualEntry.price}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={manualEntry.imageUrl}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {manualEntry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {manualEntry.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button onClick={addManualProduct} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product to Queue
                </Button>
              </div>

              {/* Product Queue */}
              {bulkData.length > 0 && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Product Queue ({bulkData.length} products)
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setBulkData([])}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto space-y-3 border rounded-lg p-3 bg-gray-50/50">
                    {bulkData.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                              {product.category}
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              product.inStock 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              product.isAffiliate 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {product.isAffiliate ? 'Affiliate' : 'Direct'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBulkData(prev => prev.filter((_, i) => i !== index))}
                          className="ml-3 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-3 pt-6 border-t mt-6">
                <Button 
                  onClick={processBulkUpload} 
                  disabled={isProcessing || bulkData.length === 0}
                  className="flex-1 h-12"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {bulkData.length} Products
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleFlip} className="h-12" size="lg">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}