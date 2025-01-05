export class APIError extends Error {
    constructor(
      message: string,
      public status?: number,
      public data?: any
    ) {
      super(message);
      this.name = 'APIError';
    }
  }
  
  export async function handleAPIResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || 'An error occurred',
        response.status,
        errorData
      );
    }
    return response.json();
  }