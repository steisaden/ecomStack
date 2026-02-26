'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

interface YogaService {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  includedAmenities: string[]
  luxuryFeatures: string[]
  imageUrl?: string
  displayOrder: number
  slug: string
}

export function YogaServicesManager() {
  const [services, setServices] = useState<YogaService[]>([])
  const [filteredServices, setFilteredServices] = useState<YogaService[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<YogaService | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [newService, setNewService] = useState<Partial<YogaService>>({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    category: 'Private Session',
    includedAmenities: [],
    luxuryFeatures: [],
    imageUrl: '',
    displayOrder: 0,
    slug: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchQuery])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/yoga-services', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch services')
      }
      
      const data = await response.json()
      
      if (data.message) {
        toast.info(data.message)
        setEmptyMessage(data.message)
      } else {
        setEmptyMessage(null)
      }
      
      setServices(data.services || [])
    } catch (error: any) {
      console.error('Error fetching services:', error)
      toast.error(error.message || 'Failed to load yoga services')
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      )
    }

    setFilteredServices(filtered)
  }

  const handleAdd = () => {
    setNewService({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      category: 'Private Session',
      includedAmenities: [],
      luxuryFeatures: [],
      imageUrl: '',
      displayOrder: 0,
      slug: ''
    })
    setIsAddDialogOpen(true)
  }

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true)
      const response = await fetch('/api/admin/yoga-services/seed', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed yoga services')
      }
      toast.success(data.message || 'Yoga services seeded')
      await fetchServices()
    } catch (error: any) {
      console.error('Error seeding yoga services:', error)
      toast.error(error.message || 'Failed to seed yoga services')
    } finally {
      setSeeding(false)
    }
  }

  const handleSaveNew = async () => {
    if (!newService.name || !newService.description) {
      toast.error('Name and description are required')
      return
    }

    try {
      const response = await fetch('/api/admin/yoga-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newService)
      })

      if (!response.ok) throw new Error('Failed to create service')

      toast.success('Service created successfully')
      setIsAddDialogOpen(false)
      fetchServices()
    } catch (error) {
      console.error('Error creating service:', error)
      toast.error('Failed to create service')
    }
  }

  const handleEdit = (service: YogaService) => {
    setEditingService(service)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingService) return

    try {
      const response = await fetch(`/api/admin/yoga-services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingService)
      })

      if (!response.ok) throw new Error('Failed to update service')

      toast.success('Service updated successfully')
      setIsEditDialogOpen(false)
      fetchServices()
    } catch (error) {
      console.error('Error updating service:', error)
      toast.error('Failed to update service')
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/yoga-services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to delete service')

      toast.success('Service deleted successfully')
      fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading yoga services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yoga Services Management</h1>
          <p className="text-gray-600 mt-2">Manage your yoga and wellness service offerings.</p>
        </div>
        <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {emptyMessage && services.length === 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">{emptyMessage}</p>
              <Button onClick={handleSeedDefaults} disabled={seeding}>
                {seeding ? 'Seeding...' : 'Seed Defaults'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Input
        placeholder="Search services..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No yoga services found.</p>
            <Button onClick={handleAdd} className="mt-4">Add Your First Service</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Service Header */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                  <Badge variant="secondary">{service.category}</Badge>
                </div>

                {/* Service Image */}
                {service.imageUrl && (
                  <div className="relative aspect-video bg-gray-100">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Service Details */}
                <div className="p-4 space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-teal-600">
                      ${service.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      {service.duration} min
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Yoga Service</DialogTitle>
            <DialogDescription>
              Create a new yoga or wellness service offering.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-name">Service Name *</Label>
              <Input
                id="new-name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="e.g., Private Yoga Session"
              />
            </div>

            <div>
              <Label htmlFor="new-description">Description *</Label>
              <Textarea
                id="new-description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                rows={4}
                placeholder="Describe the service..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-price">Price ($)</Label>
                <Input
                  id="new-price"
                  type="number"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="new-duration">Duration (minutes)</Label>
                <Input
                  id="new-duration"
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-category">Category</Label>
              <select
                id="new-category"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Private Session">Private Session</option>
                <option value="Group Class">Group Class</option>
                <option value="Workshop">Workshop</option>
                <option value="Retreat">Retreat</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                📷 To add an image, edit the service in Contentful and upload an image asset.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNew}>
              Create Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Yoga Service</DialogTitle>
            <DialogDescription>
              Update service details and save changes.
            </DialogDescription>
          </DialogHeader>

          {editingService && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Service Name</Label>
                <Input
                  id="edit-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Private Session">Private Session</option>
                  <option value="Group Class">Group Class</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Retreat">Retreat</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  📷 To change the image, edit this service in Contentful and upload a new image asset.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
