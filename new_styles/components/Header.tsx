import { Button } from "./ui/button";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Pure Essence</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-900 hover:text-primary transition-colors">
              Home
            </a>
            <a href="#products" className="text-gray-900 hover:text-primary transition-colors">
              Essential Oils
            </a>
            <a href="#yoga" className="text-gray-900 hover:text-primary transition-colors">
              Yoga Services
            </a>
            <a href="#blog" className="text-gray-900 hover:text-primary transition-colors">
              Blog
            </a>
            <a href="#about" className="text-gray-900 hover:text-primary transition-colors">
              About
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-2">Cart (0)</span>
            </Button>
            <Button size="sm">Contact</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#home" className="block px-3 py-2 text-gray-900 hover:text-primary">
                Home
              </a>
              <a href="#products" className="block px-3 py-2 text-gray-900 hover:text-primary">
                Essential Oils
              </a>
              <a href="#yoga" className="block px-3 py-2 text-gray-900 hover:text-primary">
                Yoga Services
              </a>
              <a href="#blog" className="block px-3 py-2 text-gray-900 hover:text-primary">
                Blog
              </a>
              <a href="#about" className="block px-3 py-2 text-gray-900 hover:text-primary">
                About
              </a>
              <div className="flex items-center space-x-2 px-3 py-2">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="ml-2">Cart (0)</span>
                </Button>
                <Button size="sm">Contact</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}