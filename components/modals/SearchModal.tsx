"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      onOpenChange(false)
      setSearchQuery('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false)
    } else if (e.key === 'Enter' && e.target === e.currentTarget) {
      handleSearch(e as any)
    }
  }

  // Focus the input when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const input = document.getElementById('search-input')
        if (input) {
          input.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Clear search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <Search className="w-5 h-5 text-beauty-primary" />
            Search Products
          </ModalTitle>
        </ModalHeader>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Input
              id="search-input"
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 bg-beauty-primary hover:bg-beauty-primary/90"
              disabled={!searchQuery.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-beauty-muted mt-4">
          <p>Search through our collection of handcrafted beauty products and natural skincare essentials.</p>
        </div>
      </ModalContent>
    </Modal>
  )
}