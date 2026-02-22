import { NextResponse } from 'next/server';
import { jobQueue } from '@/lib/background/job-queue';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
    );
  }

  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Get the job to check if it can be retried
    const job = await jobQueue.getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'failed') {
      return NextResponse.json({ error: 'Only failed jobs can be retried' }, { status: 400 });
    }

    // To retry a job, we simply create a new job with the same parameters
    let newJob;
    switch (job.type) {
      case 'image_refresh':
        newJob = await jobQueue.addJob('image_refresh', job.productId);
        break;
      case 'link_validation':
        newJob = await jobQueue.addJob('link_validation', job.productId);
        break;
      case 'full_sync':
        newJob = await jobQueue.addJob('full_sync');
        break;
      default:
        return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Job retry scheduled successfully',
      newJobId: newJob.id
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrying job:', error);
    return NextResponse.json({ 
      error: 'Failed to retry job' 
    }, { status: 500 });
  }
}
