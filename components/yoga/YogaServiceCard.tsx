"use client";

import { YogaService } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

interface YogaServiceCardProps {
  service: YogaService;
}

export function YogaServiceCard({ service }: YogaServiceCardProps) {
  const href = `/yoga-booking/${service.slug}`;

  return (
    <Card
      className="group relative transition-transform duration-200 ease-out hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]"
    >
      <CardHeader className="p-0">
        {service.image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={service.image.url}
              alt={service.image.title || service.image.description || service.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4=`}
            />

            {/* Gradient overlay for hover/focus state */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

            {/* Hover-to-reveal CTA */}
            <Link
              href={href}
              aria-label={`View details and book ${service.name}`}
              className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none group-hover:pointer-events-auto"
            >
              <span className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-beauty-dark shadow-sm backdrop-blur-sm transition-all duration-200 ease-out opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                View Details & Book
              </span>
            </Link>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <CardTitle className="text-beauty-dark mb-2">{service.name}</CardTitle>
        <p className="text-beauty-muted mb-4">{service.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-beauty-muted">Duration:</span>
            <span className="text-sm font-medium">{service.duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-beauty-muted">Price:</span>
            <span className="text-lg font-semibold text-beauty-primary">${service.price}</span>
          </div>
        </div>

        {service.includedAmenities && service.includedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {service.includedAmenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={href} className="w-full" aria-label={`View details and book ${service.name}`}>
          <Button 
            className="w-full"
            variant="default"
          >
            View Details & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}