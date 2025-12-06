
export namespace ProgressRequest {
  export interface GetList {}

  export interface GetById {
    id: string | number;
  }

  export interface Create {
    productId: number;
    percentage: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'failed';
    description?: string;
  }

  export interface Update {
    percentage?: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'failed';
    description?: string;
  }

  export interface Delete {
    id: string | number;
  }
}