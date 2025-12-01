import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Star, Heart, ShoppingCart } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Lavender Serenity",
    description: "Pure lavender essential oil for relaxation and better sleep. Handcrafted from organic French lavender fields.",
    price: 24.99,
    originalPrice: 29.99,
    image: "https://images.unsplash.com/photo-1647934174394-e6b359549292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZXNzZW50aWFsJTIwb2lsJTIwYm90dGxlcyUyMGxhdmVuZGVyfGVufDF8fHx8MTc1NzI1Nzk3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    benefits: ["Promotes relaxation", "Improves sleep quality", "Reduces stress"],
    rating: 4.9,
    reviews: 127,
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: "Eucalyptus Fresh",
    description: "Invigorating eucalyptus oil perfect for respiratory support and mental clarity. Sustainably sourced from Australia.",
    price: 22.99,
    originalPrice: 27.99,
    image: "https://images.unsplash.com/photo-1697399511512-17d3adfab058?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldWNhbHlwdHVzJTIwZXNzZW50aWFsJTIwb2lsfGVufDF8fHx8MTc1NzI1Nzk3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    benefits: ["Clears airways", "Boosts mental focus", "Natural antiseptic"],
    rating: 4.8,
    reviews: 89,
    inStock: true,
    featured: false
  }
];

export function ProductSection() {
  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Premium Essential Oils
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Each bottle contains the pure essence of nature, carefully distilled and crafted 
            with love to bring you the highest quality essential oils.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <div className="aspect-[4/3] bg-gray-100">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-green-600">
                    Best Seller
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    </div>
                    <Badge variant={product.inStock ? "default" : "destructive"} className="mt-1">
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-gray-600">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Key Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={!product.inStock}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Want to learn more about essential oils and their benefits?
          </p>
          <Button variant="outline" size="lg">
            View Essential Oil Guide
          </Button>
        </div>
      </div>
    </section>
  );
}