// Job queue types and interfaces

export interface SyncJob {
  id: string;
  type: 'image_refresh' | 'link_validation' | 'full_sync';
  productId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledAt: string;
  completedAt?: string;
  error?: string;
  progress?: number; // 0-100 percentage
  totalItems?: number;
  processedItems?: number;
}

export type Job = SyncJob;
export type JobStatus = SyncJob['status'];
export type JobType = SyncJob['type'];

export interface JobQueueConfig {
  maxConcurrentJobs?: number;
  jobTimeoutMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
}