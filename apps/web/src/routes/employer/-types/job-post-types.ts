import { type JobFormState as JobFormSchemaState } from '../-schemas/jobFormSchema';

export type JobFormState = Omit<JobFormSchemaState, 'latitude' | 'longitude'> & {
  latitude: number | null;
  longitude: number | null;
};
