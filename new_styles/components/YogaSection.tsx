import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Users, Calendar, MapPin } from "lucide-react";

const yogaServices = [
  {
    id: 1,
    name: "Aromatherapy Yoga",
    description: "A unique blend of gentle yoga flows enhanced with carefully selected essential oils to deepen your practice and promote healing.",
    duration: "60 minutes",
    price: 45,
    maxParticipants: 8,
    image: "https://images.unsplash.com/photo-1602827114685-efbb2717da9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBzdHVkaW98ZW58MXx8fHwxNzU3MTcxMDcz&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: ["Essential oil aromatherapy", "Gentle flow sequences", "Meditation & breathwork", "Small group setting"],
    schedule: ["Monday 7:00 PM", "Wednesday 6:30 PM", "Saturday 9:00 AM"],
    popular: true
  },
  {
    id: 2,
    name: "Private Wellness Session",
    description: "One-on-one personalized yoga and aromatherapy session tailored to your specific needs and wellness goals.",
    duration: "90 minutes",
    price: 120,
    maxParticipants: 1,
    image: "https://images.unsplash.com/photo-1645652367526-a0ecb717650a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbiUyMHdlbGxuZXNzfGVufDF8fHx8MTc1NzE5MDU0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: ["Personalized practice", "Custom oil blends", "Wellness consultation", "Take-home oil sample"],
    schedule: ["By appointment", "Flexible scheduling", "Available 7 days/week"],
    popular: false
  },
  {
    id: 3,
    name: "Essential Oil Workshop",
    description: "Learn about essential oils, their benefits, and how to incorporate them into your daily wellness routine.",
    duration: "2 hours",
    price: 65,
    maxParticipants: 12,
    image: "https://images.unsplash.com/photo-1620924721217-93fd71e354ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMGJsb2clMjBhcm9tYXRoZXJhcHl8ZW58MXx8fHwxNzU3MjU3OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: ["Oil education & safety", "Hands-on blending", "DIY recipes", "Starter oil kit included"],
    schedule: ["First Saturday of month", "2:00 PM - 4:00 PM", "Next: Dec 7, 2024"],
    popular: false
  }
];

export function YogaSection() {
  return (
    <section id="yoga" className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Yoga & Wellness Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Elevate your wellness journey with our unique combination of yoga practice 
            and aromatherapy, designed to nurture both body and mind.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {yogaServices.map((service) => (
            <Card key={service.id} className="bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <div className="aspect-[4/3] bg-gray-100">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                {service.popular && (
                  <Badge className="absolute top-4 left-4 bg-green-600">
                    Most Popular
                  </Badge>
                )}
              </div>

              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${service.price}
                    </div>
                    <div className="text-sm text-gray-500">per session</div>
                  </div>
                </div>
                <CardDescription className="text-gray-600">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Service Details */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Max {service.maxParticipants} {service.maxParticipants === 1 ? 'person' : 'people'}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">What's Included:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Schedule */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule:
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {service.schedule.map((time, index) => (
                      <div key={index}>{time}</div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Choose Our Wellness Services?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                    <div>
                      <strong>Certified Instructor:</strong> RYT-200 certified yoga instructor with aromatherapy specialization
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                    <div>
                      <strong>Premium Oils:</strong> Only the highest quality, therapeutic-grade essential oils
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                    <div>
                      <strong>Personalized Approach:</strong> Each session tailored to your individual needs and goals
                    </div>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span>Beautiful studio in downtown wellness district</span>
                </div>
                <div className="text-sm text-gray-600">
                  "The combination of yoga and aromatherapy has transformed my wellness routine. 
                  I leave each session feeling completely renewed." - Sarah M.
                </div>
                <Button variant="outline">
                  View Studio Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}