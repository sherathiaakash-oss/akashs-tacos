// frontend/src/utils/categoryImages.js
// Every menu category (and the ALL tab) has its OWN dedicated banner image in public/images/menu.
// Category names in the database include an emoji and sometimes different spacing from the file name
// (e.g. "⚡ CRUNCHY HARD SHELL SELECTION" vs file "⚡CRUNCHY HARD SHELL SELECTION.webp"),
// so categories are matched on their letters only and mapped to the exact file names below.

const CATEGORY_FILES = {
  ALL: 'ALL.webp',
  MAKEYOUROWN: '🛠️ MAKE YOUR OWN.webp',
  SOFTSHELLTACOSELECTION: '🌮 SOFT SHELL TACO SELECTION.webp',
  CRUNCHYHARDSHELLSELECTION: '⚡CRUNCHY HARD SHELL SELECTION.webp',
  MULTISHELLMIXMATCHCOMBOS: '🌟 MULTI-SHELL MIX & MATCH COMBOS.webp',
  LARGETORTILLABURRITOS: '🌯 LARGE TORTILLA BURRITOS.webp',
  CORNTORTILLACHIPSBOXES: '🍟 CORN TORTILLA CHIPS BOXES.webp',
  BIGBELLVALUEMEALBOXES: '🥤 BIG BELL VALUE MEAL BOXES.webp',
  APPETIZERSSIDES: '🍿 APPETIZERS & SIDES.webp',
  BEVERAGESCHILLFREEZES: '🥤 BEVERAGES & CHILL FREEZES.webp',
  SWEETDESSERTS: '🍩 SWEET DESSERTS.webp'
};

const lettersOnly = (text) => String(text || '').toUpperCase().replace(/[^A-Z]/g, '');
// encodeURI (not encodeURIComponent): a literal "&" must stay "&" in the URL. The Vite dev server decodes
// public-file URLs with decodeURI, which leaves "%26" undecoded, so an encoded "&" would never match the file.
const toUrl = (fileName) => `/images/menu/${encodeURI(fileName).replace(/#/g, '%23').replace(/\?/g, '%3F')}`;

// Returns the dedicated image URL for a category, or null for a brand-new category that has no image yet
// (the page then shows a plain dark background, never a random menu item's photo).
export const categoryImageUrl = (category) => {
  const file = CATEGORY_FILES[lettersOnly(category)];
  return file ? toUrl(file) : null;
};

export const CREATE_TACO_IMAGE = toUrl('create your won taco.webp');
export const CREATE_MEAL_IMAGE = toUrl('create your won meal.webp');
