'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackToAdminButton() {
    return (
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary/80">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
    );
}
