import { API_BASE_URL } from '../main.jsx';
import React, { useState, useEffect } from 'react';
import BuilderCard from '../components/BuilderCard';
import { categoryImageUrl } from '../utils/categoryImages';
import { useNavigate } from 'react-router-dom';

// Live-feed photo: tries the post's own photo in /images/feed/ (webp, jpg, png), then a related menu photo,
// then a branded placeholder, so a card is never left as an empty grey box.
function FeedImage({ post }) {
  const sources = [
    `/images/feed/${post.photo}.webp`,
    `/images/feed/${post.photo}.jpg`,
    `/images/feed/${post.photo}.png`,
    `/images/menu/${post.filename}.webp`
  ];
  const [attempt, setAttempt] = useState(0);

  if (attempt >= sources.length) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex flex-col items-center justify-center text-white">
        <span className="text-6xl">🌮</span>
        <span className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-80">{post.tag}</span>
      </div>
    );
  }
  return (
    <img
      key={sources[attempt]}
      src={sources[attempt]}
      alt={post.tag}
      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      style={{ objectPosition: '50% 30%' }} /* keeps faces in frame on portrait-style photos */
      onError={() => setAttempt((n) => n + 1)}
    />
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [productCatalogue, setProductCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Promotional Sliding Banners Matrix Dataset
  const promotions = [
    {
      title: "100% VEGETARIAN REVOLUTION",
      subtitle: "Every item. Every mash. Zero meat. Crafted with premium spiced paneer, smoky black beans, and legendary lava sauce.",
      badge: "Pure Veg Kitchen",
      bgColor: "bg-neutral-900 text-white",
      btnText: "Explore Menu",
      action: () => navigate('/menu')
    },
    {
      title: "REGISTER & CLAIM 60% OFF",
      subtitle: "New to Akash's Tacos? Sign up right now and instantly avail special discounts on your very first dynamic custom build box!",
      badge: "Welcome Offer",
      bgColor: "bg-amber-600 text-white",
      // CONDITIONAL STATE GATE: If the user is logged in, show the Loyalty Dashboard text. If active, show Sign In.
      btnText: localStorage.getItem('activeUser_id') ? "View Loyalty Dashboard" : "Sign In Now",
      action: () => navigate(localStorage.getItem('activeUser_id') ? '/menu' : '/auth')
    },
    {
      title: "THE DORITOS LOCOS EXPERIENCE",
      subtitle: "Smashed fillings loaded inside authentic crunchy Doritos Nacho Cheese and Sweet Chilli structural shells.",
      badge: "Trending Fusion",
      bgColor: "bg-stone-900 text-amber-400",
      btnText: "Order Boxes",
      action: () => navigate('/menu')
    }
  ];

  // Carousel slide rotator timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promotions.length]);
  // Fetch the dynamic aggregated collection feed natively from our server on mount
  useEffect(() => {
    fetch('\https://akashs-tacos-backend.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        setProductCatalogue(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("MongoDB aggregate connection failure:", err);
        setLoading(false);
      });
  }, []);

  /* 
    DYNAMIC SUB-CATEGORY EXTRACTOR:
    Scans the 'category' fields streaming from your 17 separate database tables.
    If you append a completely new section tomorrow, it generates here automatically.
  */
  const extractedCategoriesList = [
    ...new Set(productCatalogue.map(product => product.category))
  ].filter(Boolean);

  // 3. Operational Performance & Value Metrics Dataset
  const brandMetrics = [
    { title: "NUTRITION FIRST", value: "Fresh & Smashed", desc: "Detailed nutritional tables and transparent recipe building maps are accessible for every component dynamically built on our screen." },
    { title: "LOCAL SOURCING", value: "100% Regional", desc: "Our fresh greens, field tomatoes, white onions, and farm paneer are processed locally under rigorous food safety inspections." },
    { title: "FAST DISPATCH PIPELINE", value: "Minutes to Door", desc: "The exact second your custom cart converts into an active order number tracker, our line chefs assemble your order in our signature mashed format." }
  ];

  // 4. Curated Community Live Social Feed Dataset
  const socialFeed = [
    { tag: "@akash_tacos_fan", caption: "My Large custom Smashed Spiced Paneer Doritos Taco hits different with Level 5 Inferno Salsa! 🔥 #PureVeg", photo: "akash_tacos_fan", filename: "Doritos Nacho Cheese Paneer Blast" },
    { tag: "@munchie_explorer", caption: "Standard Chips Box Supreme loaded up with warm liquid nacho cheese sauce and tangy mango salsa. Best value ever! 🥤🍟", photo: "munchie_explorer", filename: "Standard Chips Box Supreme" },
    { tag: "@veg_foodie_india", caption: "Trying out the Cheesy Double Decker Hybrid combo meal with fries and cinnamon twists at Akash Tacos. Highly recommended! 🌱🌮", photo: "veg_foodie_india", filename: "Cheesy Double Decker Master" }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
        <span className="text-xs font-black tracking-widest text-stone-500 uppercase">Synchronizing Live Homepage Parameters...</span>
      </div>
    );
  }
  return (
    <div className="space-y-12 pb-12 select-none animate-fadeIn">
      
      {/* MODULE A: PROMOTIONAL SLIDER BANNER CAROUSEL */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg h-[340px] transition-all duration-500">
        {promotions.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex flex-col justify-center p-12 transition-opacity duration-700 ${slide.bgColor} ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="max-w-2xl space-y-4">
              <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-sm border border-white/10">
                {slide.badge}
              </span>
              <h1 className="text-4xl font-black font-sans tracking-tight leading-none uppercase">
                {slide.title}
              </h1>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                {slide.subtitle}
              </p>
              <button
                onClick={slide.action}
                className="mt-4 px-6 py-3 bg-white text-neutral-900 font-black uppercase tracking-wider text-xs rounded-sm shadow-md hover:bg-amber-100 active:scale-95 transition"
              >
                {slide.btnText} →
              </button>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 right-8 z-20 flex space-x-2">
          {promotions.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* MODULE B: INTERACTIVE ENGINE BUILDER CARD PAIR (Wired directly to menu.jsx category tab states) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BuilderCard kind="TACO" showBadge onClick={() => navigate('/menu', { state: { selectedCategory: "🛠️ MAKE YOUR OWN" } })} />
        <BuilderCard kind="MEAL" showBadge onClick={() => navigate('/menu', { state: { selectedCategory: "🛠️ MAKE YOUR OWN" } })} />
      </div>
      {/* MODULE C: DYNAMIC COMPREHENSIVE MENU GRID (Looped Natively from MongoDB Columns!) */}
      <div className="space-y-8">
        <div className="flex flex-col space-y-1"><h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 font-sans">OUR COMPREHENSIVE MENU</h2><div className="w-12 h-1 bg-amber-600 rounded-xs"></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {extractedCategoriesList.map((categoryString, index) => {
            // Each category has its own dedicated banner image
            const categoryImage = categoryImageUrl(categoryString);

            return (
              <div 
                key={index} 
                onClick={() => navigate('/menu', { state: { selectedCategory: categoryString } })} 
                className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-xs border-0 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                  {categoryImage && <img src={categoryImage} alt={categoryString} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" onError={(e) => { e.target.style.display = 'none'; }} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
                </div>
                <div className="flex items-center justify-center space-x-3 bg-white py-5 px-4 border-0">
                  <span className="font-sans font-black text-[13px] tracking-widest text-neutral-900 uppercase text-center group-hover:text-amber-600 transition-colors duration-500">{categoryString}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODULE D: CORE OPERATIONAL METRICS INFOGRAPHICS */}
      <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-md">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded-sm">Quality Standard</span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">EVERY BITE HITS DIFFERENT</h2>
          <p className="text-xs text-zinc-400 font-medium">We are redefining fast-casual dining in India. Here is how we maintain an elite system standard across our entire operations footprint.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {brandMetrics.map((metric, index) => (
            <div key={index} className="bg-neutral-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3 transition-all duration-500 hover:border-amber-600/30">
              <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase block">{metric.title}</span>
              <h3 className="text-xl font-black uppercase tracking-wide text-white">{metric.value}</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">{metric.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODULE E: LIVE SOCIAL FEED SECTION HUB */}
      <div className="space-y-6">
        <div className="flex flex-col space-y-1"><h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 font-sans">THE BELL LIVE FEED</h2><div className="w-12 h-1 bg-amber-600 rounded-xs"></div></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {socialFeed.map((post, index) => (
            <div key={index} className="flex flex-col bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="h-56 w-full bg-stone-100 overflow-hidden"><FeedImage post={post} /></div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                <p className="text-xs font-medium text-stone-600 leading-relaxed">{post.caption}</p>
                <div className="text-[11px] font-black text-amber-600 uppercase tracking-wider border-t border-stone-100 pt-3">{post.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODULE F: BRAND SUMMARY PARAGRAPH TEXT */}
      <div className="border-t border-stone-200/80 pt-8 text-center sm:text-left space-y-4 max-w-4xl mx-auto px-2">
        <h4 className="font-sans font-black text-xs tracking-widest text-neutral-900 uppercase">ABOUT AKASH'S TACOS INDIA</h4>
        <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wide leading-relaxed">
          Inspired natively by the global fast-casual customization pipeline seen on channels like tacobell.co.in, Akash's Tacos is engineered from the ground up as a premier 100% vegetarian culinary exploration workspace. Every Single corn container shell configuration, spiced plant protein mash, melted mozzarella pull array, and dynamic pricing multiplier matrix lives natively within your secure online cloud database. Explore our custom layout menus today and craft a meal that speaks to your taste buds.
        </p>
      </div>

    </div>
  );
}
