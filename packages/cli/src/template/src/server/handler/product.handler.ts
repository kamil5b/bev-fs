import { productService } from '../service/product.service';

// Product List Handler
export const getProducts = () => {
  return productService.listProducts();
};

// Product Create Handler
export const createProduct = (body: any) => {
  return productService.createProduct(body);
};

// Product Detail Handler
export const getProduct = (params: any) => {
  const id = parseInt(params.id);
  return productService.getProduct(id);
};

// Product Update Handler
export const updateProduct = (params: any, body: any) => {
  const id = parseInt(params.id);
  return productService.updateProduct(id, body);
};

// Product Delete Handler
export const deleteProduct = (params: any) => {
  const id = parseInt(params.id);
  return productService.deleteProduct(id);
};

// Progress List Handler
export const getProductProgress = (params: any) => {
  const productId = parseInt(params.id);
  return productService.listProductProgress(productId);
};

// Progress Create Handler
export const createProductProgress = (params: any, body: any) => {
  const productId = parseInt(params.id);
  return productService.createProductProgress(productId, body);
};

// Progress Detail Handler
export const getProgressDetail = (params: any) => {
  const productId = parseInt(params.id);
  const progressId = parseInt(params.progressId);
  return productService.getProductProgress(productId, progressId);
};

// Progress Update Handler
export const updateProgressDetail = (params: any, body: any) => {
  const productId = parseInt(params.id);
  const progressId = parseInt(params.progressId);
  return productService.updateProductProgress(productId, progressId, body);
};

// Progress Delete Handler
export const deleteProgressDetail = (params: any) => {
  const productId = parseInt(params.id);
  const progressId = parseInt(params.progressId);
  return productService.deleteProductProgress(productId, progressId);
};
