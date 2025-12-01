import { productSyncService } from './product-sync';

class Scheduler {
    private intervalId: NodeJS.Timeout | null = null;

    start(interval: number = 10000) { // Default to every 10 seconds
        if (this.intervalId) {
            console.log('Scheduler is already running.');
            return;
        }
        console.log(`Scheduler starting with an interval of ${interval}ms`);
        this.intervalId = setInterval(() => {
            console.log('Scheduler is checking for new jobs...');
            productSyncService.processNextJob();
        }, interval);
    }

    stop() {
        if (this.intervalId) {
            console.log('Scheduler stopping.');
            clearInterval(this.intervalId);
            this.intervalId = null;
        } else {
            console.log('Scheduler is not running.');
        }
    }
}

export const scheduler = new Scheduler();
