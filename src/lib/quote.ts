import { products, productLabel, productPath, type CatalogProduct } from '../data/catalog';

interface StoredItem {
  sku: string;
  qty: number;
}

interface QuoteItem extends StoredItem {
  product: CatalogProduct;
}

const KEY = 'torque-quote';
const catalogBySku = new Map(products.map((product) => [product.sku, product]));
const normalizeQty = (qty: number) => Math.min(999, Math.max(1, Math.round(qty) || 1));

export function getQuote(): QuoteItem[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(data)) return [];
    const items = new Map<string, QuoteItem>();
    for (const entry of data) {
      const product = catalogBySku.get(entry?.sku);
      if (product) items.set(product.sku, { sku: product.sku, product, qty: normalizeQty(Number(entry.qty)) });
    }
    return [...items.values()];
  } catch {
    return [];
  }
}

function saveQuote(items: StoredItem[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.map(({ sku, qty }) => ({ sku, qty }))));
    return true;
  } catch {
    return false;
  }
}

export function removeFromQuote(sku: string): boolean {
  return saveQuote(getQuote().filter((item) => item.sku !== sku));
}

export function setQty(sku: string, qty: number): boolean {
  return saveQuote(getQuote().map((item) => item.sku === sku ? { ...item, qty: normalizeQty(qty) } : item));
}

export function quoteLines(items: QuoteItem[]): string {
  return items.map(({ product, qty }, index) => {
    const spec = product.verified ? product.spec : 'example: ' + product.spec;
    return (index + 1) + '. ' + productLabel(product) + ' — ' + spec + ' · Qty ' + qty;
  }).join('\n');
}

export function watchQuote(update: () => void): void {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY || event.key === null) update();
  });
  window.addEventListener('pageshow', update);
}

export function initQuoteButtons(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-quote-add]'));
  const message = document.querySelector<HTMLElement>('[data-quote-feedback]');
  const paint = () => {
    const items = getQuote();
    buttons.forEach((button) => {
      const added = items.some((item) => item.sku === button.dataset.sku);
      button.setAttribute('aria-pressed', String(added));
      button.textContent = added ? 'Added · remove' : 'Add to quote';
      button.classList.toggle('is-added', added);
    });
    document.querySelectorAll<HTMLElement>('[data-quote-count]').forEach((element) => {
      element.textContent = String(items.length);
    });
    document.querySelectorAll<HTMLElement>('[data-quote-bar]').forEach((bar) => {
      bar.hidden = items.length === 0;
    });
    document.documentElement.classList.toggle('has-quote-bar', items.length > 0);
  };

  buttons.forEach((button) => {
    const product = catalogBySku.get(button.dataset.sku ?? '');
    if (!product) return;
    button.disabled = false;
    button.addEventListener('click', () => {
      const items = getQuote();
      const added = items.some((item) => item.sku === product.sku);
      const saved = added ? removeFromQuote(product.sku) : saveQuote([...items, { sku: product.sku, qty: 1 }]);
      if (message) {
        message.hidden = saved;
        if (!saved) button.insertAdjacentElement('afterend', message);
      }
      paint();
    });
  });
  watchQuote(paint);
  paint();
}

export function quoteItemLink(item: QuoteItem): string {
  return productPath(item.product);
}
