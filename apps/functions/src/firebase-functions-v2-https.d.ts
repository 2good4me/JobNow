declare module 'firebase-functions/v2/https' {
  export class HttpsError extends Error {
    code: string;
    constructor(code: string, message: string);
  }

  export interface CallableRequest<T = unknown> {
    data: T;
    auth?: {
      uid?: string;
    };
  }

  export function onCall<T = unknown, R = unknown>(
    options: { region?: string },
    handler: (request: CallableRequest<T>) => Promise<R> | R
  ): (request: CallableRequest<T>) => Promise<R>;
}
