import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '@/lib/background/job-queue';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
        );
    }

    const job = await jobQueue.getJob(params.id);

    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
}
