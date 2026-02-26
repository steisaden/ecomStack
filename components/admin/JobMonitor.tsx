import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Job, JobStatus, JobType } from '@/lib/background/types';
import { RefreshCw, Play, AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';

interface JobMonitorProps {
  onRefresh?: () => void;
  onJobRetry?: (jobId: string) => Promise<void>;
}

export default function JobMonitor({ onRefresh, onJobRetry }: JobMonitorProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to fetch jobs from the API
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, we would call the API to get job data
      // For now, using mock data with potential API integration
      const mockJobs: Job[] = [
        {
          id: 'job_1',
          type: 'image_refresh',
          productId: 'prod_1',
          status: 'completed',
          scheduledAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          completedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
          progress: 100,
          totalItems: 10,
          processedItems: 10
        },
        {
          id: 'job_2',
          type: 'link_validation',
          productId: 'prod_2',
          status: 'running',
          scheduledAt: new Date().toISOString(),
          progress: 45,
          totalItems: 20,
          processedItems: 9
        },
        {
          id: 'job_3',
          type: 'full_sync',
          status: 'failed',
          scheduledAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          error: 'Network timeout occurred while validating links',
          totalItems: 50,
          processedItems: 20
        },
        {
          id: 'job_4',
          type: 'image_refresh',
          status: 'pending',
          scheduledAt: new Date().toISOString(),
          totalItems: 15,
          processedItems: 0
        }
      ];

      setJobs(mockJobs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch job status');
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: JobStatus): "sage" | "destructive" | "default" | "secondary" | "outline" => {
    switch (status) {
      case 'completed':
        return 'sage'; // mapped from success
      case 'failed':
        return 'destructive';
      case 'running':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      if (onJobRetry) {
        await onJobRetry(jobId);
      } else {
        // Call the API to retry the job
        const response = await fetch('/api/admin/jobs/retry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId })
        });

        if (!response.ok) {
          throw new Error('Failed to retry job');
        }
      }
      // Refresh the job list after retry
      await fetchJobs();
    } catch (error) {
      console.error('Error retrying job:', error);
      setError('Failed to retry job');
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      await fetchJobs();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Background Jobs</h3>
        <Button onClick={handleRefresh} size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex justify-center items-center">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Loading jobs...
                </div>
              </TableCell>
            </TableRow>
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No background jobs found
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono">{job.id}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {job.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(job.status)}
                    <Badge variant={getStatusVariant(job.status)} className="ml-2 capitalize">
                      {job.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{formatTime(job.scheduledAt)}</TableCell>
                <TableCell>
                  {job.productId ? (
                    <span className="font-mono">{job.productId}</span>
                  ) : (
                    <span className="text-muted-foreground">All products</span>
                  )}
                </TableCell>
                <TableCell>
                  {job.totalItems !== undefined && job.processedItems !== undefined ? (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(job.processedItems / job.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                  {job.totalItems !== undefined && job.processedItems !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {job.processedItems} of {job.totalItems}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleJobDetails(job)}
                    >
                      Details
                    </Button>
                    {job.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetryJob(job.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Job Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Job ID</h4>
                  <p className="font-mono">{selectedJob.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <p className="capitalize">{selectedJob.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="flex items-center">
                    {getStatusIcon(selectedJob.status)}
                    <Badge variant={getStatusVariant(selectedJob.status)} className="ml-2 capitalize">
                      {selectedJob.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Product ID</h4>
                  <p>{selectedJob.productId || 'All products'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                <div className="text-sm">
                  <p>Scheduled: {formatTime(selectedJob.scheduledAt)}</p>
                  {selectedJob.completedAt && (
                    <p>Completed: {formatTime(selectedJob.completedAt)}</p>
                  )}
                </div>
              </div>

              {selectedJob.error && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                    Error Details
                  </h4>
                  <div className="p-3 bg-red-50 rounded-md text-sm text-red-700">
                    {selectedJob.error}
                  </div>
                </div>
              )}

              {selectedJob.totalItems !== undefined && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Progress</h4>
                  <div className="space-y-1 text-sm">
                    <p>Total items: {selectedJob.totalItems}</p>
                    <p>Processed: {selectedJob.processedItems || 0}</p>
                    {selectedJob.progress !== undefined && (
                      <p>Progress: {selectedJob.progress}%</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
