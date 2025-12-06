/**
 * Shared request/response types for type-safe API communication
 */

// Product
export interface Product {
  id: number;
  name: string;
  price: number;
}

export namespace ProductAPI {
  export interface GetListRequest {}
  export interface GetListResponse {
    products: Product[];
  }

  export interface CreateRequest {
    name: string;
    price: number;
  }
  export interface CreateResponse {
    created: Product;
  }

  export interface GetByIdRequest {
    id: string | number;
  }
  export interface GetByIdResponse {
    product: Product;
  }

  export interface UpdateRequest {
    name?: string;
    price?: number;
  }
  export interface UpdateResponse {
    updated: Product;
  }

  export interface DeleteRequest {
    id: string | number;
  }
  export interface DeleteResponse {
    deleted: number;
  }
}

// Progress
export interface Progress {
  id: number;
  productId: number;
  percentage: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export namespace ProgressAPI {
  export interface GetListRequest {}
  export interface GetListResponse {
    progress: Progress[];
  }

  export interface CreateRequest {
    productId: number;
    percentage: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  }
  export interface CreateResponse {
    created: Progress;
  }

  export interface GetByIdRequest {
    id: string | number;
  }
  export interface GetByIdResponse {
    progress: Progress;
  }

  export interface UpdateRequest {
    percentage?: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  }
  export interface UpdateResponse {
    updated: Progress;
  }

  export interface DeleteRequest {
    id: string | number;
  }
  export interface DeleteResponse {
    deleted: number;
  }
}

// User
export interface User {
  id: number;
  name: string;
  email: string;
}

export namespace UserAPI {
  export interface GetListRequest {}
  export interface GetListResponse {
    users: User[];
  }

  export interface CreateRequest {
    name: string;
    email: string;
  }
  export interface CreateResponse {
    created: User;
  }

  export interface GetByIdRequest {
    id: string | number;
  }
  export interface GetByIdResponse {
    user: User;
  }

  export interface UpdateRequest {
    name?: string;
    email?: string;
  }
  export interface UpdateResponse {
    updated: User;
  }

  export interface DeleteRequest {
    id: string | number;
  }
  export interface DeleteResponse {
    deleted: number;
  }
}
