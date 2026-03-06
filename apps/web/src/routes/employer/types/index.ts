/**
 * Type Definitions for Create Job Feature
 * 
 * All types used in the job creation form
 */

import type { Shift } from '@jobnow/types';

/**
 * Form Data Type (matches Zod schema)
 */
export interface CreateJobFormData {
  title: string;
  category: string;
  description: string;
  salary: number;
  quantity: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
}

/**
 * Job Category Definition
 */
export interface JobCategory {
  id: string;
  label: string;
  icon: string;
}

/**
 * Location Coordinates
 */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * API Response for Job Creation
 */
export interface CreateJobResponse {
  id: string;
  employerId: string;
  title: string;
  status: 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN';
  createdAt: Date;
  shifts?: Shift[];
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
  code?: string;
  statusCode: number;
}

/**
 * Form Step Type
 */
export type FormStep = 1 | 2 | 3;

/**
 * Form State Type
 */
export interface FormState {
  currentStep: FormStep;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Location Selection Type
 */
export interface LocationSelection {
  coordinates: LocationCoordinates;
  address: string;
  selectedAt: Date;
}

/**
 * Budget Information
 */
export interface BudgetInfo {
  salary: number;
  quantity: number;
  totalBudget: number;
}

/**
 * Time Range
 */
export interface TimeRange {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
}

/**
 * Form Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Category Bottom Sheet Props
 */
export interface CategoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
}

/**
 * Location Selector Props
 */
export interface LocationSelectorProps {
  onLocationSelect: (location: LocationCoordinates, address: string) => void;
  currentLocation?: LocationCoordinates;
  currentAddress?: string;
}

/**
 * Create Job Form Props
 */
export interface CreateJobFormProps {
  onSuccess?: (jobId: string) => void;
  onError?: (error: Error) => void;
  initialData?: Partial<CreateJobFormData>;
}

/**
 * Mutation Result Type
 */
export interface MutationResult<T = CreateJobResponse> {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

export {};
