import { LinkValidationResult } from "./types";

class LinkValidator {
    async validateLink(url: string): Promise<LinkValidationResult> {
        const { recordTimer, increment, recordMetric } = await import('../monitoring/production-monitoring');
        const timer = recordTimer('link_validation_request');
        
        const result: Partial<LinkValidationResult> = { url, lastChecked: new Date().toISOString() };

        try {
            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'manual', // We handle redirects manually
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                signal: AbortSignal.timeout(10000) // 10-second timeout
            });

            result.statusCode = response.status;

            if (response.status >= 200 && response.status < 300) {
                result.isValid = true;
                increment('link_validation_success', 1);
            } else if (response.status >= 300 && response.status < 400) {
                result.isValid = true; // Redirects are considered valid for now
                result.redirectUrl = response.headers.get('location') || undefined;
                increment('link_validation_success', 1, { type: 'redirect' });
            } else {
                result.isValid = false;
                result.error = `HTTP status code ${response.status}`;
                increment('link_validation_failure', 1, { status_code: response.status.toString() });
            }

        } catch (error: any) {
            result.isValid = false;
            result.statusCode = 0;
            result.error = error.name === 'TimeoutError' ? 'Request timed out' : error.message;
            increment('link_validation_failure', 1, { error_type: error.name });
        }

        // Calculate failure rate
        const totalValidations = (await import('../monitoring/production-monitoring')).productionMonitoring.getLatestMetricValue('link_validation_total') || 0;
        const totalFailures = (await import('../monitoring/production-monitoring')).productionMonitoring.getLatestMetricValue('link_validation_failure') || 0;
        const failureRate = totalValidations > 0 ? totalFailures / totalValidations : 0;
        
        increment('link_validation_total', 1);
        recordMetric('link_validation_failure_rate', failureRate);
        
        timer();
        return result as LinkValidationResult;
    }

    async validateBulkLinks(urls: string[]): Promise<LinkValidationResult[]> {
        const validationPromises = urls.map(url => this.validateLink(url));
        return Promise.all(validationPromises);
    }

    async scheduleValidation(productId: string): Promise<void> {
        // Placeholder for scheduling a background validation job
        console.log(`Validation job scheduled for product: ${productId}`);
        return Promise.resolve();
    }
}

export const linkValidator = new LinkValidator();
