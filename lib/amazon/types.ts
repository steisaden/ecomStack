export interface AmazonProductData {
  asin: string;
  title: string;
  imageUrl: string;
  price: number;
  availability: boolean;
  lastUpdated: string;
}

export interface AmazonApiError {
  code: string;
  message: string;
}

export interface AmazonProductResponse {
  data?: AmazonProductData;
  error?: AmazonApiError;
}
