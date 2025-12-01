import { amazonProductApi } from '../amazon/product-api';
import { linkValidator } from '../validation/link-validator';
import { jobQueue, Job, JobType } from './job-queue';

class ProductSyncService {
    async scheduleImageRefresh(productId?: string): Promise<string> {
        const job = await jobQueue.addJob('image_refresh', productId);
        return job.id;
    }

    async scheduleLinkValidation(productId?: string): Promise<string> {
        const job = await jobQueue.addJob('link_validation', productId);
        return job.id;
    }

    async scheduleFullSync(): Promise<string> {
        const job = await jobQueue.addJob('full_sync');
        return job.id;
    }

    async processJob(job: Job): Promise<void> {
        await jobQueue.updateJobStatus(job.id, 'running');
        try {
            switch (job.type) {
                case 'image_refresh':
                    // In a real implementation, we would get the product from a database
                    // and then refresh its image from the Amazon API.
                    console.log(`Processing image refresh for product: ${job.productId}`);
                    if (job.productId) {
                        await amazonProductApi.getProductImage(job.productId);
                    }
                    break;
                case 'link_validation':
                    // Similarly, we'd get the product and its URL to validate.
                    console.log(`Processing link validation for product: ${job.productId}`);
                    if (job.productId) {
                        // Assuming the product ID is the URL for simplicity
                        await linkValidator.validateLink(job.productId);
                    }
                    break;
                case 'full_sync':
                    // This would involve fetching all products and scheduling individual jobs.
                    console.log('Processing full product sync.');
                    break;
            }
            await jobQueue.updateJobStatus(job.id, 'completed');
        } catch (error: any) {
            await jobQueue.updateJobStatus(job.id, 'failed', error.message);
        }
    }

    async processNextJob(): Promise<void> {
        const job = await jobQueue.getNextJob();
        if (job) {
            await this.processJob(job);
        }
    }
}

export const productSyncService = new ProductSyncService();
