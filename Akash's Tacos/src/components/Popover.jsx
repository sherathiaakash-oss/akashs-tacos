import React from 'react';

export default function Popover({ 
  activeItem, 
  modalType, 
  selectedSize, 
  setSelectedSize,
  shellsCatalog,
  selectedShells,
  handleShellQuantityChange,
  getShellGroupCounts,
  proteinsCatalog,
  cheesesCatalog,
  saucesCatalog,
  salsasCatalog,
  toppingsCatalog,
  selectedIngredients,
  handleIngredientQuantityChange,
  productCatalogue,
  selectedMealCompanions,
  setSelectedMealCompanions,
  packetsCatalog,
  selectedPackets,
  handlePacketQuantityChange,
  getTotalPacketsCount,
  calculateLiveModalPrice,
  handleModalCommitToCart,
  resetModalStates,
  handleTransformToFullCustomizer
}) {
  const handleFormPrevention = (e) => {
    e.preventDefault();
  };

  return (
    <div 
      popover="auto" 
      id="options" 
      className="m-auto w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200/40 p-0 max-h-[85vh] bg-white font-sans text-neutral-900 select-none open:flex open:flex-col animate-fadeIn"
    >
      <form onSubmit={handleFormPrevention} className="flex flex-col h-full overflow-hidden w-full m-0 p-0">
        
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-black text-amber-500 tracking-wider">
              Table Source: {activeItem?.category || "Recipe Configurator"}
            </span>
            <h3 className="text-base font-black uppercase tracking-tight">
              {activeItem?.productName || "Configuration Base"}
            </h3>
          </div>
          <button 
            popoverTarget="options" 
            popoverTargetAction="hide" 
            type="button"
            onClick={resetModalStates} 
            className="text-zinc-400 hover:text-white font-black text-sm p-1.5 cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/50 no-scrollbar max-h-[calc(85vh-140px)]">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/50 space-y-3 shadow-xs">
            <h4 className="text-xs font-black tracking-widest uppercase text-neutral-900">📐 Size</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "SZ_01", name: "Small", multiplier: 1.0 },
                { id: "SZ_02", name: "Regular", multiplier: 1.2 },
                { id: "SZ_03", name: "Large", multiplier: 1.5 }
              ].map((sz) => (
                <button 
                  key={sz.id} 
                  type="button" 
                  onClick={() => setSelectedSize(sz)} 
                  className={`p-3 text-center rounded-xl border text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${selectedSize?.id === sz.id ? 'bg-amber-600 border-amber-500 text-white font-black shadow-md' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                >
                  {sz.name}
                </button>
              ))}
            </div>
          </div>
          {modalType !== "SIZE_ONLY" && (
            <>
              <div className="bg-white p-5 rounded-2xl border border-stone-200/50 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-black tracking-widest uppercase text-neutral-900">🔔 Shell</h4>
                </div>
                <div className="divide-y divide-stone-100">
                  {(!shellsCatalog || shellsCatalog.length === 0) && <p className="py-3 text-[11px] font-bold text-stone-400 uppercase">No shells loaded from database</p>}
                  {shellsCatalog?.map((sh) => {
                    const count = selectedShells[sh._id] || 0;
                    const isBox = ["SH_07", "SH_08"].includes(sh._id);
                    const { groupATotal, groupBTotal } = getShellGroupCounts();
                    const isPlusDisabled = isBox ? (groupATotal > 0 || groupBTotal >= 1) : (groupBTotal > 0 || groupATotal >= 3);
                    return (
                      <div key={sh._id} className="py-3 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-neutral-800 uppercase block">{sh.name}</span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">{isBox ? "Group B: Max 1 Box" : "Group A: Max 3 Shells Combined"}</span>
                        </div>
                        {count === 0 ? (
                          <button disabled={isPlusDisabled} type="button" onClick={() => handleShellQuantityChange(sh._id, 1)} className="px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-black uppercase rounded-md cursor-pointer disabled:bg-stone-100 disabled:text-stone-300 disabled:cursor-not-allowed">+ Select Shell</button>
                        ) : (
                          <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-lg border">
                            <button type="button" onClick={() => handleShellQuantityChange(sh._id, -1)} className="w-7 h-7 bg-white text-neutral-900 font-black rounded-md text-xs flex items-center justify-center cursor-pointer">-</button>
                            <span className="w-6 text-center text-xs font-black text-neutral-900">{count}</span>
                            <button disabled={isPlusDisabled} type="button" onClick={() => handleShellQuantityChange(sh._id, 1)} className="w-7 h-7 bg-white text-neutral-900 font-black rounded-md text-xs flex items-center justify-center cursor-pointer">+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {[
                { title: "🌱 Protein", data: proteinsCatalog },
                { title: "🧀 Cheese", data: cheesesCatalog },
                { title: "🌶️ Sauce", data: saucesCatalog },
                { title: "🍅 Salsa", data: salsasCatalog },
                { title: "🥬 Topping", data: toppingsCatalog }
              ].map((section) => (
                <div key={section.title} className="bg-white p-5 rounded-2xl border border-stone-200/50 space-y-2 shadow-xs">
                  <h4 className="text-xs font-black tracking-widest uppercase text-neutral-900 border-b pb-2">{section.title}</h4>
                  <div className="divide-y text-xs divide-stone-100">
                    {section.data?.map(item => {
                      const count = selectedIngredients[item._id] || 0;
                      return (
                        <div key={item._id} className="py-2.5 flex items-center justify-between">
                          <span className="font-bold text-neutral-800 uppercase">{item.name}</span>
                          {count > 0 ? (
                            <div className="flex items-center space-x-2 bg-stone-100 p-0.5 rounded-md border border-stone-200/40">
                              <button type="button" onClick={() => handleIngredientQuantityChange(item._id, -1)} className="w-6 h-6 bg-white font-black rounded-xs text-xs flex items-center justify-center cursor-pointer">-</button>
                              <span className="w-5 text-center font-black">{count}</span>
                              <button disabled={true} type="button" className="w-6 h-6 bg-white opacity-30 font-black rounded-xs text-xs flex items-center justify-center">+</button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => handleIngredientQuantityChange(item._id, 1)} className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 font-black text-[9.5px] uppercase rounded-sm cursor-pointer">+ Select</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
          {modalType === "CREATE_MEAL" && (
            <>
              {[
                { title: "🍿 APPETIZERS & SIDES", icon: "🍿" },
                { title: "🥤 BEVERAGES & CHILL FREEZES", icon: "🥤" },
                { title: "🍩 SWEET DESSERTS", icon: "🍩" }
              ].map((subGroup) => (
                <div key={subGroup.title} className="bg-white p-5 rounded-2xl border border-stone-200/50 space-y-2 shadow-xs">
                  <h4 className="text-xs font-black tracking-widest uppercase text-neutral-900 border-b pb-1.5"> {subGroup.title}</h4>
                  {productCatalogue?.filter(p => p.category?.includes(subGroup.icon)).map(comp => (
                    <label key={comp._id} className="py-2.5 flex items-center justify-between text-xs font-bold border-b border-stone-100 cursor-pointer select-none">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" checked={selectedMealCompanions.includes(comp._id)} onChange={() => setSelectedMealCompanions(prev => prev.includes(comp._id) ? prev.filter(c => c !== comp._id) : [...prev, comp._id])} className="accent-amber-600 rounded-sm cursor-pointer" />
                        <span className="uppercase text-neutral-800">{comp.productName}</span>
                      </div>
                      <span className="text-neutral-900">+₹{comp.baseCost}</span>
                    </label>
                  ))}
                </div>
              ))}
            </>
          )}

          <div className="bg-white p-5 rounded-2xl border border-stone-200/50 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-xs font-black tracking-widest uppercase text-neutral-900">📦 SideAndExtra</h4>
              <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-sm">Max Cap: 5</span>
            </div>
            <div className="divide-y divide-stone-100">
              {packetsCatalog?.map((pkt) => {
                const count = selectedPackets[pkt._id] || 0;
                return (
                  <div key={pkt._id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <span className="font-bold text-neutral-800 uppercase">{pkt.name}</span>
                    {count === 0 ? (
                      <button disabled={getTotalPacketsCount() >= 5} type="button" onClick={() => handlePacketQuantityChange(pkt._id, 1)} className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-[9.5px] font-black uppercase rounded-sm cursor-pointer">+ Add Packet</button>
                    ) : (
                      <div className="flex items-center space-x-2 bg-stone-100 p-0.5 rounded-md border border-stone-200/40">
                        <button type="button" onClick={() => handlePacketQuantityChange(pkt._id, -1)} className="w-6 h-6 bg-white font-black text-xs cursor-pointer flex items-center justify-center rounded-xs">-</button>
                        <span className="w-5 text-center text-xs font-black text-neutral-900">{count}</span>
                        <button disabled={getTotalPacketsCount() >= 5} type="button" onClick={() => handlePacketQuantityChange(pkt._id, 1)} className="w-6 h-6 bg-white font-black text-xs cursor-pointer flex items-center justify-center rounded-xs">+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {modalType === "SIZE_ONLY" && (
            <div className="text-center py-4 bg-white p-5 rounded-2xl border border-stone-200/50 shadow-xs">
              <button type="button" onClick={handleTransformToFullCustomizer} className="px-6 py-2.5 bg-neutral-900 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-md shadow-2xs transition cursor-pointer">✏️ Customize Recipe Ingredients</button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between shrink-0 shadow-xl">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-stone-500 uppercase block tracking-wider">Dynamic Aggregate Price</span>
            <h2 className="text-xl font-black text-neutral-900">₹{calculateLiveModalPrice()}</h2>
          </div>
          <button 
            type="button" 
            onClick={handleModalCommitToCart} 
            className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md cursor-pointer transition active:scale-95 duration-300"
          >
            Compile & Save to Cart →
          </button>
        </div>

      </form>
    </div>
  );
}
