// lib/request-deduplicator.ts

export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  public async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const requestPromise = requestFn();

    this.pendingRequests.set(key, requestPromise);

    requestPromise.finally(() => {
      this.pendingRequests.delete(key);
    });

    return requestPromise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();
