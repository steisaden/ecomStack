import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-green-400">Pure Essence</h3>
            <p className="text-gray-300 leading-relaxed">
              Handcrafted essential oils and holistic wellness services to nurture 
              your mind, body, and spirit naturally.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-green-400">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-green-400">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-green-400">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-300 hover:text-green-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-300 hover:text-green-400 transition-colors">
                  Essential Oils
                </a>
              </li>
              <li>
                <a href="#yoga" className="text-gray-300 hover:text-green-400 transition-colors">
                  Yoga Services
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-300 hover:text-green-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-green-400 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Services</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">Aromatherapy Yoga</li>
              <li className="text-gray-300">Private Wellness Sessions</li>
              <li className="text-gray-300">Essential Oil Workshops</li>
              <li className="text-gray-300">Custom Oil Blends</li>
              <li className="text-gray-300">Wellness Consultations</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">hello@pureessence.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">(555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-400 mt-0.5" />
                <span className="text-gray-300">
                  123 Wellness Way<br />
                  Natural City, NC 27401
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-300 text-sm">
            © 2024 Pure Essence. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
              Shipping & Returns
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}