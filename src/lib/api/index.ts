import {   TOKELESS_URLS,  } from '@/constants/urls';
import {BASEURL} from '@/constants/env';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, CancelTokenSource } from 'axios';
import { isEmpty } from 'ramda';
import { toast } from 'sonner';
import { z } from 'zod';
import { getHeaders } from './headers';


// Response schema types
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		message: z.string(),
		data: dataSchema,
	});

export type ApiResponse<T> = {
	success: boolean;
	message: string;
	data: T;
};

// Request cancellation management
class RequestManager {
	private cancelSources: Map<string, CancelTokenSource> = new Map();

	createCancelToken(requestId: string): CancelTokenSource {
		// Cancel existing request with same ID if it exists
		this.cancelRequest(requestId);

		// Create new cancel token
		const source = axios.CancelToken.source();
		this.cancelSources.set(requestId, source);
		return source;
	}

	cancelRequest(requestId: string): void {
		const source = this.cancelSources.get(requestId);
		if (source) {
			source.cancel('Request canceled by user');
			this.cancelSources.delete(requestId);
		}
	}

	cancelAll(): void {
		this.cancelSources.forEach((source) => {
			source.cancel('All requests canceled');
		});
		this.cancelSources.clear();
	}
}

// Error handling
class ApiErrorHandler {
	static handleError(error: unknown): never {
		if (axios.isCancel(error)) {
			// Request was canceled, not an error
			throw error;
		}

		if (error instanceof AxiosError) {
			const statusCode = error.response?.status || 500;
			const errorMessage =
				error.response?.data?.message || error.message || 'An unexpected error occurred';
			const requestUrl = error.config?.url || '';
toast.error('Server error. Please try again later.');
			// Handle different error status codes
			// switch (statusCode) {
			// 	case 401:
			// 		// Skip redirect for login attempts - let form handle the error
			// 		if (requestUrl.includes('/auth/login')) {
			// 			// Just throw the error for form to handle
			// 			break;
			// 		}
			// 		// Unauthorized - clear auth and redirect to login for other requests
			// 		useAuthStore.getState().logout();
			// 		toast.error('Your session has expired. Please log in again.');
			// 		window.location.href = '/sign-in';
			// 		break;
			// 	case 403:
			// 		// Forbidden
			// 		toast.error('You do not have permission to perform this action');
			// 		break;
			// 	case 404:
			// 		if (errorMessage === 'Admin not found') {
			// 			useAuthStore.getState().logout();
			// 			toast.error('Your session has expired. Please log in again.');
			// 			window.location.href = '/login';
			// 		} else {
			// 			toast.error('The requested resource was not found');
			// 		}
			// 		break;
			// 	case 422:
			// 		// Validation error
			// 		if (error.response?.data?.errors) {
			// 			// Handle validation errors array if available
			// 			const firstError = error.response.data.errors[0];
			// 			toast.error(
			// 				firstError?.message || 'Validation error. Please check your input.'
			// 			);
			// 		} else {
			// 			toast.error('Validation error. Please check your input.');
			// 		}
			// 		break;
			// 	case 500:
			// 	case 502:
			// 	case 503:
			// 		// Server errors
			// 		toast.error('Server error. Please try again later.');
			// 		break;
			// 	default:
			// 		// Other errors
			// 		toast.error(errorMessage);
			// }
		} else {
			// Non-axios errors
			toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
		}

		throw error;
	}
}

// URL validation
// class UrlValidator {
// 	static isValidUrl(url: string): boolean {
// 		// Check if URL is in predefined URLs
// 		if (Object.values(URLS).includes(url as any)) {
// 			return true;
// 		}

// 		// Check if URL starts with any dynamic URL prefix
// 		return Object.keys(DYNAMIC_URLS).some((key) => url.startsWith(key));
// 	}

// 	static validateDynamicUrl(route: keyof typeof DYNAMIC_URLS, ...params: string[]): boolean {
// 		try {
// 			if (!DYNAMIC_URLS[route]) {
// 				return false;
// 			}

// 			// Validate params if needed
// 			// This is a simplified version - implement proper validation as needed
// 			return true;
// 		} catch (error) {
// 			return false;
// 		}
// 	}
// }

// Main API client class
class ApiClient {
	private client: AxiosInstance;
	private requestManager: RequestManager;

	constructor() {
		this.requestManager = new RequestManager();
		this.client = axios.create({
			baseURL: BASEURL,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			timeout: 30000, // 30 seconds timeout
		});

		this.setupInterceptors();
	}

	private setupInterceptors(): void {
  this.client.interceptors.request.use(
    async (config) => {
      const url = config.url || '';
		console.log(getHeaders());
      // Add auth headers for protected routes
      if (!Object.values(TOKELESS_URLS).includes(url as any)) {
        const headers = getHeaders();
        if (isEmpty(headers)) {
          throw new Error('Token is missing for protected route.');
        }
        
        // Properly merge headers
        config.headers = {
          ...config.headers,
          ...headers,
        };
      }

      // Handle FormData content type
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']; // Let browser set it
      }

      return config;
    },
    (error) => Promise.reject(ApiErrorHandler.handleError(error))
  );
}

	// Generic request method
	async request<T = any>(config: AxiosRequestConfig) {
		try {
			const requestId = `${config.method || 'get'}-${config.url}`;
			const source = this.requestManager.createCancelToken(requestId);

			const response = await this.client.request<T>({
				...config,
				cancelToken: source.token,
			});

			return response;
			// return response.data;
		} catch (error) {
			throw ApiErrorHandler.handleError(error);
		}
	}

	// Convenience methods
	async get<T>(url: string, config?: Omit<AxiosRequestConfig, 'url' | 'method'>) {
		return this.request<T>({ ...config, url, method: 'get' });
	}

	async post<T, t2>(
		url: string,
		data?: t2,
		config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
	) {
		return this.request<T>({ ...config, url, method: 'post', data });
	}

	async put<T, T2>(
		url: string,
		data?: T2,
		config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
	) {
		return this.request<T>({ ...config, url, method: 'put', data });
	}

	async patch<T = any>(
		url: string,
		data?: any,
		config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
	) {
		return this.request<T>({ ...config, url, method: 'patch', data });
	}

	async delete<T = any>(url: string, config?: Omit<AxiosRequestConfig, 'url' | 'method'>) {
		return this.request<T>({ ...config, url, method: 'delete' });
	}

	// File upload methods
	async uploadFile<T = any>(
		url: string,
		file: File,
		options?: {
			onProgress?: (percentage: number) => void;
			additionalData?: Record<string, any>;
		}
	) {
		const formData = new FormData();
		formData.append('file', file);

		// Add any additional data
		if (options?.additionalData) {
			Object.entries(options.additionalData).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}

		return this.request<T>({
			url,
			method: 'post',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: options?.onProgress
				? (progressEvent) => {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / (progressEvent.total || 1)
						);
						options.onProgress?.(percentCompleted);
					}
				: undefined,
		});
	}

	async uploadMultipleFiles<T = any>(
		url: string,
		files: File[],
		options?: {
			onProgress?: (percentage: number) => void;
			additionalData?: Record<string, any>;
			fieldName?: string;
		}
	) {
		const formData = new FormData();
		const fieldName = options?.fieldName || 'files';

		// Append all files with the same field name
		files.forEach((file) => {
			formData.append(fieldName, file);
		});

		// Add any additional data
		if (options?.additionalData) {
			Object.entries(options.additionalData).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}

		return this.request<T>({
			url,
			method: 'post',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: options?.onProgress
				? (progressEvent) => {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / (progressEvent.total || 1)
						);
						options.onProgress?.(percentCompleted);
					}
				: undefined,
		});
	}

	// Cancel requests
	cancelRequest(requestId: string): void {
		this.requestManager.cancelRequest(requestId);
	}

	cancelAll(): void {
		this.requestManager.cancelAll();
	}
}

// Create and export API client instance
const api = new ApiClient();
export default api;

// Helper for checking axios errors
export const isAxiosError = axios.isAxiosError;
