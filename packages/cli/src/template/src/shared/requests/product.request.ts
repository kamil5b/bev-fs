/**
 * Product API Request Types
 */

export namespace ProductRequest {
  export interface GetList {}

  export interface GetById {
    id: string | number
  }

  export interface Create {
    name: string
    price: number
  }

  export interface Update {
    name?: string
    price?: number
  }

  export interface Delete {
    id: string | number
  }
}
