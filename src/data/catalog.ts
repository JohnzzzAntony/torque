import catalog from './products.json';

export type CatalogProduct = (typeof catalog.products)[number] & { verified?: boolean };
export const products: CatalogProduct[] = catalog.products;

export function productPath(product: CatalogProduct) {
  return '/products/' + product.category + '/' + product.slug + '/';
}

export function productLabel(product: CatalogProduct) {
  return product.verified ? product.name + ' (' + product.sku + ')' : product.name;
}
