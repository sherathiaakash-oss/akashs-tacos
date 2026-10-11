import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Popover from '../components/Popover';
import BuilderCard from '../components/BuilderCard';
import { categoryImageUrl } from '../utils/categoryImages';
import { API, getCartUserId, emitCartUpdated, mergeAnonymousCart } from '../utils/cart';

export default function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [productCatalogue, setProductCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [cartResponseData, setCartResponseData] = useState({ items: [] });

  const [modalType, setModalType] = useState("SIZE_ONLY");
  const [activeItem, setActiveItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState({ id: "SZ_02", name: "Regular", multiplier: 1.2 });
  const [selectedShells, setSelectedShells] = useState({});
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [selectedMealCompanions, setSelectedMealCompanions] = useState([]);
  const [selectedPackets, setSelectedPackets] = useState({});

  const [shellsCatalog, setShellsCatalog] = useState([]);
  const [proteinsCatalog, setProteinsCatalog] = useState([]);
  const [cheesesCatalog, setCheesesCatalog] = useState([]);
  const [saucesCatalog, setSaucesCatalog] = useState([]);
  const [salsasCatalog, setSalsasCatalog] = useState([]);
  const [toppingsCatalog, setToppingsCatalog] = useState([]);
  const [packetsCatalog, setPacketsCatalog] = useState([]);

  const tabRefs = useRef({});

  const resetModalStates = () => {
    setSelectedSize({ id: "SZ_02", name: "Regular", multiplier: 1.2 });
    setSelectedShells({});
    setSelectedIngredients({});
    setSelectedMealCompanions([]);
    setSelectedPackets({});
  };

  // ---------- toast + popover helpers ----------
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const toastTimer = useRef(null);
  const cartBusy = useRef(false);

  const showToast = (message, type = 'ok') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  // The toast is itself a manual popover so it can appear ABOVE the open customizer popup
  useEffect(() => {
    const el = toastRef.current;
    if (!el || !el.showPopover) return;
    const isOpen = el.matches(':popover-open');
    if (toast && !isOpen) el.showPopover();
    if (!toast && isOpen) el.hidePopover();
  }, [toast]);

  const openPopover = () => {
    const el = document.getElementById('options');
    if (el && !el.matches(':popover-open')) el.showPopover();
  };
  const closePopover = () => {
    const el = document.getElementById('options');
    if (el && el.matches(':popover-open')) el.hidePopover();
  };

  const bagQty = (id) =>
    (cartResponseData?.items || []).filter((r) => r.itemid === id).reduce((sum, r) => sum + (r.qty || 0), 0);

  // One place that talks to POST /api/cart/add
  const sendToCart = async (payload) => {
    if (cartBusy.current) return false;
    cartBusy.current = true;
    try {
      const res = await fetch(`${API}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: getCartUserId(), ...payload })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.message || data.error || 'Could not update your bag', 'error');
        return false;
      }
      setCartResponseData(data);
      emitCartUpdated();
      return true;
    } catch {
      showToast('Cannot reach the server. Is the backend running?', 'error');
      return false;
    } finally {
      cartBusy.current = false;
    }
  };

  const refreshCartQuantitiesFromDatabase = () => {
    const key = localStorage.getItem('activeUser_id') || "Guest_Workspace_Session";
    fetch(`//api/cart/${key}`)
      .then(res => res.json())
      .then(cartData => {
        if (cartData && Array.isArray(cartData.items)) {
          setCartResponseData(cartData);
        } else if (Array.isArray(cartData)) {
          setCartResponseData({ items: cartData });
        } else {
          setCartResponseData({ items: [] });
        }
      })
      .catch(() => {
        setCartResponseData({ items: [] });
      });
  };
  useEffect(() => {
    fetch('//api/menu')
      .then(res => res.json())
      .then(data => {
        setProductCatalogue(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("MongoDB aggregate connection failure:", err);
        setLoading(false);
      });

    // 🧺 Load every pantry table the popup needs (this was missing, so the popup lists were empty)
    const getTable = (table) =>
      fetch(`//api/admin/${table}`)
        .then(res => res.json())
        .then(rows => (Array.isArray(rows) ? rows : []))
        .catch(() => []);

    Promise.all([
      getTable('shells'), getTable('proteins'), getTable('cheeses'),
      getTable('sauces'), getTable('salsas'), getTable('toppings'), getTable('sideandextras')
    ]).then(([shells, proteins, cheeses, sauces, salsas, toppings, packets]) => {
      setShellsCatalog(shells);
      setProteinsCatalog(proteins);
      setCheesesCatalog(cheeses);
      setSaucesCatalog(sauces);
      setSalsasCatalog(salsas);
      setToppingsCatalog(toppings);
      setPacketsCatalog(packets);
    });
  }, []);

  const handlePopoverSelectionTrigger = (targetProduct) => {
    resetModalStates();
    const isMealBox = (targetProduct?.category || "").includes("BIG BELL VALUE MEAL BOXES");
    const shMap = {};
    const ingMap = {};
    const companions = [];

    // Flatten the recipe: a meal box links to a taco (MN_xx) which links to its own pantry ingredients
    const recipe = [];
    (targetProduct?.linked_ingredients || []).forEach(id => {
      if (id.startsWith("MN_")) {
        const sub = productCatalogue.find(p => p._id === id);
        (sub?.linked_ingredients || []).forEach(subId => recipe.push(subId));
      } else {
        recipe.push(id);
      }
    });

    recipe.forEach(id => {
      if (id.startsWith("SH_")) {
        shMap[id] = (shMap[id] || 0) + 1;
      } else if (["PR_", "CH_", "SC_", "SL_", "TP_"].some(p => id.startsWith(p))) {
        ingMap[id] = 1;
      } else if (["SD_", "DK_", "DS_"].some(p => id.startsWith(p))) {
        if (!companions.includes(id)) companions.push(id);
      }
    });

    setSelectedShells(shMap);
    setSelectedIngredients(ingMap);
    setSelectedMealCompanions(companions);
    setActiveItem(targetProduct);
    setModalType(isMealBox ? "CREATE_MEAL" : "CREATE_TACO");
    openPopover();
  };

  const getShellGroupCounts = () => {
    let groupATotal = 0;
    let groupBTotal = 0;
    Object.entries(selectedShells).forEach(([id, qty]) => {
      if (["SH_07", "SH_08"].includes(id)) groupBTotal += qty;
      else groupATotal += qty;
    });
    return { groupATotal, groupBTotal };
  };
  const handleShellQuantityChange = (id, delta) => {
    const isBox = ["SH_07", "SH_08"].includes(id);
    const { groupATotal, groupBTotal } = getShellGroupCounts();
    if (delta > 0 && ((isBox && groupATotal > 0) || (!isBox && groupBTotal > 0) || (isBox && groupBTotal >= 1) || (!isBox && groupATotal >= 3))) return;
    setSelectedShells(p => {
      const c = p[id] || 0;
      const n = c + delta;
      if (n <= 0) { const cp = { ...p }; delete cp[id]; return cp; }
      return { ...p, [id]: n };
    });
  };

  const handleIngredientQuantityChange = (id, delta) => {
    setSelectedIngredients(p => {
      const c = p[id] || 0;
      const n = c + delta;
      if (n <= 0) { const cp = { ...p }; delete cp[id]; return cp; }
      if (delta > 0 && c >= 1) return p;
      return { ...p, [id]: n };
    });
  };

  const getTotalPacketsCount = () => Object.values(selectedPackets).reduce((a, b) => a + b, 0);
  
  const handlePacketQuantityChange = (id, delta) => {
    setSelectedPackets(p => {
      const c = p[id] || 0;
      const n = c + delta;
      if (n <= 0) { const cp = { ...p }; delete cp[id]; return cp; }
      if (delta > 0 && getTotalPacketsCount() >= 5) return p;
      return { ...p, [id]: n };
    });
  };

  const calculateLiveModalPrice = () => {
    if (!activeItem) return 0;
    let m = selectedSize.multiplier;
    let sm = 0;
    let cp = 0;
    Object.entries(selectedShells).forEach(([id, q]) => {
      const s = shellsCatalog.find(x => x._id === id);
      if (s) sm += (s.price * q) * m;
    });
    Object.keys(selectedIngredients).forEach(id => {
      const i = [...proteinsCatalog, ...cheesesCatalog, ...saucesCatalog, ...salsasCatalog, ...toppingsCatalog].find(x => x._id === id);
      if (i) sm += i.price * m;
    });
    selectedMealCompanions.forEach(id => {
      const p = productCatalogue.find(x => x._id === id);
      if (p) cp += p.baseCost;
    });
    return Math.round(Math.max(sm + cp - ((activeItem.benefit || 0) * m), String(activeItem._id).startsWith('CUSTOM_') ? 0 : (activeItem.baseCost || 79)));
  };
  // + / - / Add To Bag on sides, drinks and desserts
  const handleDirectQuantityAdjustment = async (id, d) => {
    const node = productCatalogue.find(p => p._id === id);
    if (!node) return;
    const wasEmpty = bagQty(id) === 0;
    const ok = await sendToCart({
      itemid: node._id, productName: node.productName, category: node.category,
      sizeId: "SZ_02", sizeMultiplier: 1.2, benefit: Number(node.benefit || 0),
      qty: d, unitPrice: Number(node.baseCost)
    });
    if (ok && d > 0 && wasEmpty) showToast(`${node.productName} added to your bag`);
  };

  // "Compile & Save to Cart" button inside the popup
  const handleModalCommitToCart = async () => {
    if (!activeItem) return;
    if (Object.keys(selectedShells).length === 0) {
      showToast('Pick at least one shell first', 'error');
      return;
    }
    const ok = await sendToCart({
      itemid: activeItem._id, productName: activeItem.productName, category: activeItem.category,
      sizeId: selectedSize.id, sizeMultiplier: selectedSize.multiplier, selectedShells,
      selectedPantryIngredients: Object.keys(selectedIngredients), selectedMealCompanions, selectedPackets,
      benefit: Number(activeItem.benefit || 0), qty: 1, unitPrice: calculateLiveModalPrice()
    });
    if (ok) {
      closePopover();
      showToast(`${activeItem.productName} saved to your bag`);
      resetModalStates();
    }
  };

  const handleTransformToFullCustomizer = () => {
    setModalType("CREATE_MEAL");
    const cp = { ...selectedIngredients };
    (activeItem?.linked_ingredients || []).forEach(id => { cp[id] = 1; });
    setSelectedIngredients(cp);
  };

  const handleLaunchBlankBuilder = (m) => {
    const mock = m === "TACO" 
      ? { _id: "CUSTOM_TACO", productName: "CUSTOM TACO BUILD", category: "🛠️ MAKE YOUR OWN", baseCost: 149, benefit: 0 }
      : { _id: "CUSTOM_MEAL", productName: "CUSTOM COMBINATION MEAL", category: "🛠️ MAKE YOUR OWN", baseCost: 299, benefit: 0 };
    setActiveItem(mock);
    setModalType(m === "TACO" ? "CREATE_TACO" : "CREATE_MEAL");
    openPopover();
  };

  useEffect(() => {
    mergeAnonymousCart().then(refreshCartQuantitiesFromDatabase);
  }, []);

  useEffect(() => {
    if (!loading) refreshCartQuantitiesFromDatabase();
  }, [loading, activeTab]);
  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      setActiveTab(location.state.selectedCategory);
    }
  }, [location.state]);

  const databaseCategories = [...new Set(productCatalogue.map(product => product.category))].filter(Boolean);
  const extractedCategoriesList = ["ALL", "🛠️ MAKE YOUR OWN", ...databaseCategories];

  useEffect(() => {
    const activeElement = tabRefs.current[activeTab];
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const visibleItems = productCatalogue.filter(product => activeTab === "ALL" || product.category === activeTab);
  const targetCategoryTitle = activeTab === "ALL" ? "BIG SAVING COMBOS" : activeTab;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
        <span className="text-xs font-black tracking-widest text-stone-500 uppercase">Streaming 17 Tables Cluster Feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 select-none bg-neutral-50/10 animate-fadeIn">
      
      <div className="sticky top-0 z-40 px-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-white py-4 border-b border-stone-200/60 shadow-md">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-4 max-w-full">
          {extractedCategoriesList.map((categoryName) => (
            <button key={categoryName} ref={el => tabRefs.current[categoryName] = el} onClick={() => setActiveTab(categoryName)} className={`px-4 py-2 text-[10.5px] font-black tracking-widest uppercase transition-all duration-300 rounded-md border shrink-0 select-none cursor-pointer ${activeTab === categoryName ? 'bg-amber-600 border-amber-500 text-white shadow-md font-extrabold' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-neutral-900'}`}>{categoryName === "ALL" ? "All" : categoryName}</button>
          ))}
        </div>
        <div className="flex items-center shrink-0 self-end xl:self-center">
          <div className="bg-emerald-50 text-emerald-600 font-sans font-black text-[11px] tracking-widest uppercase border border-emerald-200/40 px-4 py-2 rounded-full shadow-2xs flex items-center space-x-1.5"><span>🌱</span><span>100% GREEN KITCHEN</span><span className="text-emerald-300">•</span><span>RAJKOT</span></div>
        </div>
      </div>
      <div className="relative h-[380px] w-full bg-indigo-950 overflow-hidden shadow-xs border-0 rounded-3xl">
        {categoryImageUrl(activeTab) && (
          <img src={categoryImageUrl(activeTab)} alt={activeTab} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
        <div className="absolute bottom-10 left-10 space-y-1.5 text-white z-10"><span className="text-[9px] uppercase font-black tracking-widest text-amber-500 bg-amber-950/50 border border-amber-900/50 px-2.5 py-0.5 rounded-sm">Live Database Connected</span><h1 className="text-4xl font-black tracking-tight uppercase font-sans filter drop-shadow-md">{targetCategoryTitle}</h1></div>
      </div>

      <div className="px-6 pb-4">
        {activeTab === "🛠️ MAKE YOUR OWN" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4 pb-12">
            <BuilderCard kind="TACO" onClick={() => handleLaunchBlankBuilder("TACO")} />
            <BuilderCard kind="MEAL" onClick={() => handleLaunchBlankBuilder("MEAL")} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 pt-4">
            {visibleItems.map((product) => {
              const qty = bagQty(product._id);
              const isDirect = product.category === "🍿 APPETIZERS & SIDES" ||
                product.category === "🥤 BEVERAGES & CHILL FREEZES" ||
                product.category === "🍩 SWEET DESSERTS";
              return (
                <div key={product._id} className="group flex flex-col bg-transparent overflow-hidden border-0 cursor-pointer transform hover:-translate-y-1 transition-all duration-500">
                  <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-white shadow-sm border border-stone-100"><img src={`/images/menu/${product.productName}.webp`} alt={product.productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.backgroundColor = '#f4f4f0'; }} /><span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">🌱 VEG</span></div>
                  <div className="pt-4 flex-1 flex flex-col justify-between space-y-2 px-1">
                    <div className="space-y-1"><h3 className="font-sans font-black text-sm tracking-wide text-neutral-900 uppercase group-hover:text-amber-600 transition-colors duration-500 leading-snug">{product.productName}</h3><p className="text-[11px] font-medium text-stone-500 leading-relaxed line-clamp-2">{product.description}</p></div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-sans font-black text-base text-neutral-900">₹{product.baseCost}</span>
                      {isDirect ? (
                        qty > 0 ? (
                          <div className="flex items-center space-x-1 bg-neutral-900 rounded-full p-1">
                            <button onClick={() => handleDirectQuantityAdjustment(product._id, -1)} aria-label="Remove one" className="w-7 h-7 flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-black text-[16px] leading-none rounded-full cursor-pointer active:scale-90 transition">−</button>
                            <span className="min-w-[30px] text-center text-[14px] font-black text-white">{qty}</span>
                            <button onClick={() => handleDirectQuantityAdjustment(product._id, 1)} aria-label="Add one" className="w-7 h-7 flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-black text-[16px] leading-none rounded-full cursor-pointer active:scale-90 transition">+</button>
                          </div>
                        ) : (
                          <button onClick={() => handleDirectQuantityAdjustment(product._id, 1)} className="px-5 py-2.5 bg-neutral-900 text-white group-hover:bg-amber-600 font-black text-[9px] uppercase tracking-widest rounded-full transition-colors duration-300 cursor-pointer active:scale-95">Add To Bag</button>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          {qty > 0 && <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">In bag ×{qty}</span>}
                          <button onClick={() => handlePopoverSelectionTrigger(product)} className="px-5 py-2.5 bg-neutral-900 text-white group-hover:bg-amber-600 font-black text-[9px] uppercase tracking-widest rounded-full transition-colors duration-300 shadow-2xs active:scale-95 cursor-pointer">Selection</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}  
      </div>

      <div
        ref={toastRef}
        popover="manual"
        style={{ inset: 'auto', top: 16, left: '50%', transform: 'translateX(-50%)', margin: 0, border: 'none', padding: 0, background: 'transparent', overflow: 'visible' }}
      >
        {toast && (
          <div className={`px-5 py-3 rounded-full shadow-xl text-xs font-black tracking-wide uppercase ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white'}`}>
            {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.message}
          </div>
        )}
      </div>

      <Popover 
        activeItem={activeItem} modalType={modalType} selectedSize={selectedSize} setSelectedSize={setSelectedSize}
        shellsCatalog={shellsCatalog} selectedShells={selectedShells} handleShellQuantityChange={handleShellQuantityChange} getShellGroupCounts={getShellGroupCounts}
        proteinsCatalog={proteinsCatalog} cheesesCatalog={cheesesCatalog} saucesCatalog={saucesCatalog} salsasCatalog={salsasCatalog} toppingsCatalog={toppingsCatalog}
        selectedIngredients={selectedIngredients} handleIngredientQuantityChange={handleIngredientQuantityChange} productCatalogue={productCatalogue}
        selectedMealCompanions={selectedMealCompanions} setSelectedMealCompanions={setSelectedMealCompanions} packetsCatalog={packetsCatalog}
        selectedPackets={selectedPackets} handlePacketQuantityChange={handlePacketQuantityChange} getTotalPacketsCount={getTotalPacketsCount}
        calculateLiveModalPrice={calculateLiveModalPrice} handleModalCommitToCart={handleModalCommitToCart} resetModalStates={resetModalStates} handleTransformToFullCustomizer={handleTransformToFullCustomizer}
      />

    </div>
  );
}
