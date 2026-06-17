// gallery-data.js
// Dynamic source for the two-level product gallery.
// Only uses images that already exist inside assets/subproducts/*

// GitHub Pages path helper for dynamically generated image URLs.
// Ensures assets resolve correctly when hosted at: /<repo>/
function bbAssetUrl(relativePath) {
  if (!relativePath) return relativePath;

  // Pass through absolute URLs.
  if (/^(?:[a-z]+:)?\/\//i.test(relativePath)) return relativePath;

  // If it already starts with '/', treat as absolute from domain.
  if (relativePath.startsWith('/')) return relativePath;

  // Normalize leading './'
  while (relativePath.startsWith('./')) relativePath = relativePath.slice(2);

  const parts = window.location.pathname.split('/').filter(Boolean);
  const repo = parts.length ? parts[0] : '';
  const base = repo ? `/${repo}/` : '/';
  return base.replace(/\/$/, '/') + relativePath.replace(/^\//, '');
}

window.bbAssetUrl = bbAssetUrl;

window.galleryData = {
  fabric: [
{ name: 'Ajrakh Print', image: bbAssetUrl('assets/subproducts/fabric1.png') },
    { name: 'Bagru Print', image: bbAssetUrl('assets/subproducts/fabric2.png') },
{ name: 'Dabu Print', image: bbAssetUrl('assets/subproducts/fabric3.jpeg') },
{ name: 'Sanganeri Print', image: bbAssetUrl('assets/subproducts/fabric4.png') }
  ],

  cover: [
{ name: 'Patch work', image: bbAssetUrl('assets/subproducts/cover1.jpeg') },
{ name: 'Hand Block', image: bbAssetUrl('assets/subproducts/cover2.jpeg') },
{ name: 'Hand Embroided', image: bbAssetUrl('assets/subproducts/cover3.jpeg') },
{ name: 'Hand Knotted', image: bbAssetUrl('assets/subproducts/cover4.jpeg') }
  ],

  rugs: [],

  // Your request includes carpet as a separate category card.
  // The existing site uses data-gallery-category="rugs" for the 3rd card,
  // but you want a modal for carpet. We map rugs -> carpet via script.js.
  carpet: [
    { name: 'Flat Weave', image: bbAssetUrl('assets/subproducts/carpet1.jpeg') },
    { name: 'Hand Knotted', image: bbAssetUrl('assets/subproducts/carpet2.jpeg') },
    { name: 'Hand Tufted', image: bbAssetUrl('assets/subproducts/carpet3.jpeg') },
    { name: 'Hand Woven', image: bbAssetUrl('assets/subproducts/carpet4.jpeg') }
  ],

  pottery: [
    { name: 'Blue Pottery', image: bbAssetUrl('assets/subproducts/pottery1.jpeg') },
    { name: 'Hand Glazed Pottery', image: bbAssetUrl('assets/subproducts/pottery2.webp') },
    { name: 'Madhubani painted Pottery', image: bbAssetUrl('assets/subproducts/pottery3.jpeg') }
  ],

  brass: [
    { name: 'Brass Idol', image: bbAssetUrl('assets/subproducts/brass1.jpeg') },
    { name: 'Brass Home Decor', image: bbAssetUrl('assets/subproducts/brass2.jpeg') },
    { name: 'Brass Candle Holder', image: bbAssetUrl('assets/subproducts/brass3.jpeg') },
    { name: 'Brass Diya', image: bbAssetUrl('assets/subproducts/brass4.jpeg') }
  ]
};


