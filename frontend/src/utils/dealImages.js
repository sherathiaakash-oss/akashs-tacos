// frontend/src/utils/dealImages.js
// A deal's banner image is named after its title, minus the "[MEMBERS ONLY]" / "[ALL USERS]" tag, e.g.
//   title: "💳 [MEMBERS ONLY] WELCOME 60% BOX EXPLOSION"  ->  "💳 WELCOME 60% BOX EXPLOSION.webp"
// Some files have no space after the emoji ("🍟FREE FIESTA FRIES REWARD.webp"), so both spellings are tried.
// New deals added in the admin screen work automatically as long as their image follows the same naming rule.

const toUrl = (name) => `/images/menu/${encodeURI(name).replace(/#/g, '%23').replace(/\?/g, '%3F')}.webp`;

export function dealImageCandidates(title) {
  const base = String(title || '').replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  if (!base) return [];
  const names = [base];
  const first = base.split(' ')[0];
  if ([...first].some((ch) => ch.charCodeAt(0) > 127)) names.push(base.replace(/^(\S+)\s+/, '$1')); // emoji glued to the text
  return [...new Set(names)].map(toUrl);
}

// The emoji at the start of the title (used by the placeholder)
export function dealEmoji(title) {
  const first = String(title || '').trim().split(/\s+/)[0] || '';
  return [...first].some((ch) => ch.charCodeAt(0) > 127) ? first : '🎁';
}
