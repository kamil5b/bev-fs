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
