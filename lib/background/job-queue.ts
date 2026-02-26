import { redis } from '../db/config';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type JobType = 'image_refresh' | 'link_validation' | 'full_sync';

export interface Job {
    id: string;
    type: JobType;
    productId?: string;
    status: JobStatus;
    scheduledAt: string;
    completedAt?: string;
    error?: string;
    priority?: number;
    retryCount?: number;
    maxRetries?: number;
}

class JobQueue {
    private redis = redis;

    constructor() {
        if (!this.redis) {
            console.warn('Redis not configured. Job queue requires REDIS_URL.');
        }
    }

    // Redis-based methods
    private async addJobToRedis(job: Job): Promise<void> {
        if (!this.redis) throw new Error('Redis not available');

        const priority = job.priority || 0;
        const score = Date.now() + (priority * 1000000); // Higher priority = lower score

        await Promise.all([
            this.redis.zadd('jobs:pending', score, job.id),
            this.redis.hset('jobs:data', job.id, JSON.stringify(job))
        ]);
    }

    private async getNextJobFromRedis(): Promise<Job | undefined> {
        if (!this.redis) throw new Error('Redis not available');

        const jobIds = await this.redis.zrange('jobs:pending', 0, 0);
        if (jobIds.length === 0) return undefined;

        const jobId = jobIds[0];
        const jobData = await this.redis.hget('jobs:data', jobId);

        if (!jobData) return undefined;

        // Move job from pending to running
        await Promise.all([
            this.redis.zrem('jobs:pending', jobId),
            this.redis.zadd('jobs:running', Date.now(), jobId)
        ]);

        const job = JSON.parse(jobData) as Job;
        job.status = 'running';
        await this.redis.hset('jobs:data', jobId, JSON.stringify(job));

        return job;
    }

    private async updateJobStatusInRedis(jobId: string, status: JobStatus, error?: string): Promise<void> {
        if (!this.redis) throw new Error('Redis not available');

        const jobData = await this.redis.hget('jobs:data', jobId);
        if (!jobData) return;

        const job = JSON.parse(jobData) as Job;
        job.status = status;
        if (error) job.error = error;
        if (status === 'completed' || status === 'failed') {
            job.completedAt = new Date().toISOString();
        }

        await this.redis.hset('jobs:data', jobId, JSON.stringify(job));

        // Move job to appropriate queue
        await this.redis.zrem('jobs:running', jobId);
        if (status === 'completed') {
            await this.redis.zadd('jobs:completed', Date.now(), jobId);
        } else if (status === 'failed') {
            // Check if job should be retried
            if ((job.retryCount || 0) < (job.maxRetries || 3)) {
                job.retryCount = (job.retryCount || 0) + 1;
                job.status = 'pending';
                const retryDelay = Math.pow(2, job.retryCount) * 1000; // Exponential backoff
                await Promise.all([
                    this.redis.zadd('jobs:pending', Date.now() + retryDelay, jobId),
                    this.redis.hset('jobs:data', jobId, JSON.stringify(job))
                ]);
            } else {
                await this.redis.zadd('jobs:failed', Date.now(), jobId);
            }
        }
    }

    // Public interface methods
    async addJob(type: JobType, productId?: string, priority: number = 0, maxRetries: number = 3): Promise<Job> {
        const newJob: Job = {
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            productId,
            status: 'pending',
            scheduledAt: new Date().toISOString(),
            priority,
            retryCount: 0,
            maxRetries
        };

        await this.addJobToRedis(newJob);

        return newJob;
    }

    async getNextJob(): Promise<Job | undefined> {
        return await this.getNextJobFromRedis();
    }

    async updateJobStatus(jobId: string, status: JobStatus, error?: string): Promise<void> {
        await this.updateJobStatusInRedis(jobId, status, error);
    }

    async getJob(jobId: string): Promise<Job | undefined> {
        if (!this.redis) throw new Error('Redis not available');
        const jobData = await this.redis.hget('jobs:data', jobId);
        return jobData ? JSON.parse(jobData) : undefined;
    }

    async listJobs(status?: JobStatus, limit: number = 100): Promise<Job[]> {
        if (!this.redis) throw new Error('Redis not available');
        let jobIds: string[] = [];

        if (status) {
            const queueKey = `jobs:${status}`;
            jobIds = await this.redis.zrevrange(queueKey, 0, limit - 1);
        } else {
            const [pending, running, completed, failed] = await Promise.all([
                this.redis.zrevrange('jobs:pending', 0, limit / 4),
                this.redis.zrevrange('jobs:running', 0, limit / 4),
                this.redis.zrevrange('jobs:completed', 0, limit / 4),
                this.redis.zrevrange('jobs:failed', 0, limit / 4)
            ]);
            jobIds = [...pending, ...running, ...completed, ...failed];
        }

        const jobs: Job[] = [];
        for (const jobId of jobIds) {
            const jobData = await this.redis.hget('jobs:data', jobId);
            if (jobData) {
                jobs.push(JSON.parse(jobData));
            }
        }

        return jobs;
    }

    async getQueueStats(): Promise<{ pending: number; running: number; completed: number; failed: number }> {
        if (!this.redis) throw new Error('Redis not available');
        const [pending, running, completed, failed] = await Promise.all([
            this.redis.zcard('jobs:pending'),
            this.redis.zcard('jobs:running'),
            this.redis.zcard('jobs:completed'),
            this.redis.zcard('jobs:failed')
        ]);

        return { pending, running, completed, failed };
    }

    async cleanup(): Promise<void> {
        return;
    }
}

export const jobQueue = new JobQueue();
