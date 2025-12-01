import { NextResponse } from 'next/server';
import { jobQueue } from '@/lib/background/job-queue';
import { productSyncService } from '@/lib/background/product-sync';

// Dummy admin check
const isAdmin = (request: Request) => {
    // In a real app, you'd have proper authentication
    return request.headers.get('Authorization') === `Bearer ${process.env.ADMIN_SECRET}`;
};

export async function GET(request: Request) {
    if (!isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jobs = await jobQueue.listJobs();
    return NextResponse.json(jobs);
}

export async function POST(request: Request) {
    if (!isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, productId } = await request.json();

    if (!type) {
        return NextResponse.json({ error: 'Job type is required' }, { status: 400 });
    }

    let jobId;
    switch (type) {
        case 'image_refresh':
            jobId = await productSyncService.scheduleImageRefresh(productId);
            break;
        case 'link_validation':
            jobId = await productSyncService.scheduleLinkValidation(productId);
            break;
        case 'full_sync':
            jobId = await productSyncService.scheduleFullSync();
            break;
        default:
            return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Job scheduled successfully', jobId }, { status: 201 });
}
