import { NextResponse } from 'next/server';
import { jobQueue } from '@/lib/background/job-queue';
import { productSyncService } from '@/lib/background/product-sync';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
        );
    }
    const jobs = await jobQueue.listJobs();
    return NextResponse.json(jobs);
}

export async function POST(request: Request) {
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
        );
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
