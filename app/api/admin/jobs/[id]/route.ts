import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '@/lib/background/job-queue';

// Dummy admin check
const isAdmin = (request: Request) => {
    return request.headers.get('Authorization') === `Bearer ${process.env.ADMIN_SECRET}`;
};

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await jobQueue.getJob(params.id);

    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
}
