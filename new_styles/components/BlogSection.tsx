import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "5 Essential Oils for Better Sleep and Relaxation",
    excerpt: "Discover how lavender, chamomile, and other calming oils can transform your bedtime routine and improve sleep quality naturally.",
    image: "https://images.unsplash.com/photo-1647934174394-e6b359549292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZXNzZW50aWFsJTIwb2lsJTIwYm90dGxlcyUyMGxhdmVuZGVyfGVufDF8fHx8MTc1NzI1Nzk3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Sleep & Wellness",
    author: "Sarah Chen",
    date: "December 5, 2024",
    readTime: "5 min read",
    featured: true
  },
  {
    id: 2,
    title: "DIY Essential Oil Blends for Yoga Practice",
    excerpt: "Learn to create custom aromatherapy blends that enhance your yoga sessions and deepen your mind-body connection.",
    image: "https://images.unsplash.com/photo-1620924721217-93fd71e354ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMGJsb2clMjBhcm9tYXRoZXJhcHl8ZW58MXx8fHwxNzU3MjU3OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Yoga & Aromatherapy",
    author: "Sarah Chen",
    date: "November 28, 2024",
    readTime: "7 min read",
    featured: false
  },
  {
    id: 3,
    title: "The Science Behind Eucalyptus Oil Benefits",
    excerpt: "Explore the research-backed benefits of eucalyptus oil for respiratory health, mental clarity, and natural healing.",
    image: "https://images.unsplash.com/photo-1697399511512-17d3adfab058?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldWNhbHlwdHVzJTIwZXNzZW50aWFsJTIwb2lsfGVufDF8fHx8MTc1NzI1Nzk3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Essential Oil Education",
    author: "Sarah Chen",
    date: "November 22, 2024",
    readTime: "6 min read",
    featured: false
  }
];

const categories = [
  "All Posts",
  "Essential Oil Education",
  "Yoga & Aromatherapy", 
  "Sleep & Wellness",
  "DIY Recipes",
  "Wellness Tips"
];

export function BlogSection() {
  return (
    <section id="blog" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-section font-heading text-primary mb-4">
            Wellness Blog
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover tips, recipes, and insights about essential oils, yoga, and holistic wellness 
            to enhance your natural living journey.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category, index) => (
            <Button
              key={category}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className={index === 0 ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {blogPosts.filter(post => post.featured).map((post) => (
          <Card key={post.id} className="mb-12 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-[4/3] lg:aspect-auto bg-gray-100">
                <ImageWithFallback
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="mb-4">
                  <Badge className="bg-green-600 mb-3">Featured Post</Badge>
                  <Badge variant="outline" className="ml-2">{post.category}</Badge>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{post.author}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-4">{post.date}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
                <Button className="w-fit bg-green-600 hover:bg-green-700">
                  Read Full Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.filter(post => !post.featured).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-[4/3] bg-gray-100">
                <ImageWithFallback
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="outline">{post.category}</Badge>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-3">{post.author}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-3">{post.date}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
                <Button variant="outline" className="w-full">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="text-center p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Stay Updated with Our Wellness Tips
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get weekly insights on essential oils, yoga practices, and natural wellness 
                delivered straight to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button className="bg-green-600 hover:bg-green-700">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* View All Posts */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Blog Posts
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}