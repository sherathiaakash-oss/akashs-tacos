import { API_BASE_URL } from '../main.jsx';
import React from 'react';
import { CREATE_TACO_IMAGE, CREATE_MEAL_IMAGE } from '../utils/categoryImages';

// "Create your own taco / meal" card with its own photo as a sharp (un-blurred) background.
// A dark gradient sits only behind the text side so the photo itself stays crisp.
const CARDS = {
  TACO: {
    image: CREATE_TACO_IMAGE,
    base: 'bg-gradient-to-br from-amber-500 to-orange-600',
    badge: 'Custom Taco',
    badgeCls: 'bg-white/20 border-white/30 text-white',
    line1: 'CREATE YOUR',
    line2: 'OWN TACO',
    text: 'Select shells, proteins, cheeses, sauces, and your exact level of salsa heat.'
  },
  MEAL: {
    image: CREATE_MEAL_IMAGE,
    base: 'bg-gradient-to-br from-neutral-900 to-zinc-800',
    badge: 'Combo Bundles',
    badgeCls: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    line1: 'CREATE YOUR',
    line2: 'OWN MEAL',
    text: 'Bundle any premium main taco with your favorite sides, desserts, and cold masalas.'
  }
};

export default function BuilderCard({ kind, onClick, showBadge = false }) {
  const c = CARDS[kind];
  return (
    <div
      onClick={onClick}
      className={`group relative ${c.base} rounded-3xl h-64 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden`}
    >
      <img
        src={c.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        style={{ objectPosition: '50% 62%' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      <div className="relative z-10 h-full p-8 flex flex-col justify-end space-y-2">
        {showBadge && (
          <span className={`self-start text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-sm ${c.badgeCls}`}>{c.badge}</span>
        )}
        <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none drop-shadow-md">{c.line1} <br /> {c.line2}</h2>
        <p className="text-white/90 text-xs font-semibold max-w-[75%] drop-shadow">{c.text}</p>
      </div>
    </div>
  );
}
