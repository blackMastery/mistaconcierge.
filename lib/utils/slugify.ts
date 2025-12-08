export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

export function generateSKU(productName: string, variantName?: string): string {
  const base = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8)
  
  const variant = variantName 
    ? variantName.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 4)
    : ''
  
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  return `${base}${variant ? '-' + variant : ''}-${random}`
}
