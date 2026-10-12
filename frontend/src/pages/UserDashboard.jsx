import { API_BASE_URL } from '../main.jsx';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const navigate = useNavigate();
  const activeUser_id = localStorage.getItem('activeUser_id') || "Guest_Session";
  
  // Safe baseline profiles initialization guaranteeing view containers mount properly
  const [profileData, setProfileData] = useState({
    User_id: activeUser_id,
    firstName: "Customer",
    lastName: "",
    email: "session@akashstacos.com",
    phoneNo: "9999999999",
    address: "Not Provided",
    password: "", // 🔐 Tracks the credential modification layer
    is_guest: false,
    is_admin: false,
    is_member: false
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Real Admin CRUD Table System variables
  const [adminActiveTable, setAdminActiveTable] = useState("Shells");
  const [tableRowsData, setTableRowsData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRowFormData, setNewRowFormData] = useState({});

  // Dynamic API endpoint lookup mapper catalog directory
  const endpointMap = {
    "Shells": "shells", "Sizes": "sizes", "Proteins": "proteins", "Cheeses": "cheeses",
    "Sauces": "sauces", "Salsas": "salsas", "Toppings": "toppings", "Sides": "sides",
    "Drinks": "drinks", "Desserts": "desserts", "MenuItem": "menuitems", "Deals": "deals"
  };
  // PROFILE HYDRATION ENGINE: Aggressively streams real document fields from your Mongo User Table
  useEffect(() => {
    setLoading(true);
    fetch(`\${API_BASE_URL}/api/user/profile/${activeUser_id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          setProfileData({
            User_id: data.User_id || activeUser_id,
            firstName: data.firstName || "Customer",
            lastName: data.lastName || "",
            email: data.email || "",
            phoneNo: data.phoneNo || "",
            address: data.address || "",
            password: data.password || "", // 👑 Successfully extracts saved credential hashes
            is_guest: data.is_guest === true,
            is_admin: data.is_admin === true, // Resolves true from MongoDB document properties
            is_member: data.is_member === true
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile payload streaming fault fallback:", err);
        setLoading(false);
      });
  }, [activeUser_id]);

  const fetchTableRowsData = () => {
    if (!profileData.is_admin) return;
    setTableRowsLoading(true);
    setEditingRowId(null);
    setShowAddForm(false);

    const routeKey = endpointMap[adminActiveTable] || "menuitems";
    fetch(`\${API_BASE_URL}/api/admin/${routeKey}`)
      .then(res => res.json())
      .then(data => {
        setTableRowsData(Array.isArray(data) ? data : []);
        setTableRowsLoading(false);
      })
      .catch(() => {
        setTableRowsData([]);
        setTableRowsLoading(false);
      });
  };

  useEffect(() => { fetchTableRowsData(); }, [adminActiveTable, profileData.is_admin]);

  const handleSecureLogout = async () => {
    try { await fetch(`\${API_BASE_URL}/api/auth/logout/${activeUser_id}`, { method: 'POST' }); } catch(e){}
    localStorage.clear(); navigate('/auth'); window.location.reload();
  };

  const handleAdminDeleteRow = async (rowId) => {
    const routeKey = endpointMap[adminActiveTable];
    if (!window.confirm(`⚠️ Permanently delete document row ${rowId} inside table ${adminActiveTable}?`)) return;

    try {
      const res = await fetch(`\${API_BASE_URL}/api/admin/${routeKey}/${rowId}`, { method: 'DELETE' });
      if (res.ok) setTableRowsData(prev => prev.filter(r => (r._id || r.id) !== rowId));
    } catch (err) { console.error(err); }
  };
  const handleStartEditRow = (row) => {
    setEditingRowId(row._id || row.id);
    setEditFormData({ ...row });
  };

  const handleSaveInlineEdit = async (rowId) => {
    const routeKey = endpointMap[adminActiveTable];
    try {
      const res = await fetch(`\${API_BASE_URL}/api/admin/${routeKey}/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setEditingRowId(null);
        fetchTableRowsData();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateNewRowEntry = async (e) => {
    e.preventDefault();
    const routeKey = endpointMap[adminActiveTable];
    try {
      const res = await fetch(`\${API_BASE_URL}/api/admin/${routeKey}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRowFormData)
      });
      if (res.ok) {
        setNewRowFormData({});
        setShowAddForm(false);
        fetchTableRowsData();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    fetch(`\${API_BASE_URL}/api/user/profile/${activeUser_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    }).then((res) => res.json())
      .then((data) => {
        if(data.success) {
          // If user updated their actual User_id handle, re-sync client storage key tokens
          localStorage.setItem('activeUser_id', profileData.User_id);
          setIsEditing(false);
          window.location.reload();
        }
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="text-xs font-black tracking-widest text-stone-400 uppercase">Synchronizing Live Permissions...</span>
      </div>
    );
  }
  return (
    <div className="space-y-8 select-none animate-fadeIn font-sans pb-12">
      
      {/* MODULE A: HEADER CONTAINER PANEL */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-0 shadow-md">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-tight">
              {profileData.is_admin ? "WELCOME, ADMIN" : `WELCOME, ${profileData.firstName.toUpperCase()}`}
            </h1>
            <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-sm border
              ${profileData.is_admin ? 'bg-amber-950 border-amber-700 text-amber-400' : 
                profileData.is_member ? 'bg-emerald-950 border-emerald-700 text-emerald-400' : 'bg-stone-800 border-stone-700 text-stone-400'}`}>
              {profileData.is_admin ? "👑 System Admin Control" : profileData.is_member ? "💳 Taco Club Member" : "💼 Temporary Guest"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Tracking Identifier Handle: <strong className="text-white font-bold">@{profileData.User_id}</strong></p>
        </div>
        
        <button 
          onClick={handleSecureLogout}
          className="px-6 py-2.5 bg-zinc-800 text-white hover:bg-linear-to-r hover:from-red-600 hover:to-rose-700 font-black text-xs tracking-widest uppercase rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-300 transform cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* MODULE B: TEMPORARY GUEST NOTIFICATION LOOP TEXT CARD */}
      {profileData.is_guest && (
        <div className="bg-amber-50 border border-amber-200/70 rounded-3xl p-6 sm:p-8">
          <p className="text-xs text-amber-800 font-semibold leading-relaxed uppercase tracking-wide">
            ℹ️ You are currently authenticated under a temporary checkout guest token. Your credentials will scrub from database tables upon session expiration timeout loops.
          </p>
        </div>
      )}

      {/* MODULE C: REGISTRY MODIFIER FORM (User ID, Email, & Password Integrated) */}
      {!profileData.is_guest && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col space-y-1 border-b border-stone-100 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">✏️ UPDATE ACCOUNT REGISTRY INFORMATION</h3>
            <p className="text-[10.5px] text-stone-500 font-semibold uppercase tracking-wide">Modify your database records row updates dynamically below.</p>
          </div>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* 🆔 UNIQUE USER ID INPUT FIELD */}
            <div className="flex flex-col space-y-1">
              <label className="text-[9.5px] font-black tracking-widest text-stone-700">UNIQUE USER ID / USERNAME</label>
              <input type="text" disabled={!isEditing} value={profileData.User_id || ""} onChange={(e) => setProfileData({...profileData, User_id: e.target.value})} className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 disabled:opacity-60 focus:outline-hidden" />
            </div>

            {/* 🔐 PASSWORD INPUT FIELD */}
            <div className="flex flex-col space-y-1">
              <label className="text-[9.5px] font-black tracking-widest text-stone-700">ACCOUNT PASSWORD</label>
              <input type="password" disabled={!isEditing} value={profileData.password || ""} onChange={(e) => setProfileData({...profileData, password: e.target.value})} className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 disabled:opacity-60 focus:outline-hidden" />
            </div>

            {/* 📧 EMAIL ADDRESS INPUT FIELD */}
            <div className="flex flex-col space-y-1">
              <label className="text-[9.5px] font-black tracking-widest text-stone-700">EMAIL ADDRESS</label>
              <input type="email" disabled={!isEditing} value={profileData.email || ""} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 disabled:opacity-60 focus:outline-hidden" />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9.5px] font-black tracking-widest text-stone-700">CONTACT MOBILE NUMBER</label>
              <input type="tel" disabled={!isEditing} value={profileData.phoneNo || ""} onChange={(e) => setProfileData({...profileData, phoneNo: e.target.value})} className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 disabled:opacity-60 focus:outline-hidden" />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9.5px] font-black tracking-widest text-stone-700">FIRST NAME</label>
              <input type="text" disabled={!isEditing} value={profileData.firstName || ""} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 disabled:opacity-60 focus:outline-hidden" />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9.5px] font-black tracking-widest text-stone-700">LAST NAME</label>
              <input type="text" disabled={!isEditing} value={profileData.lastName || ""} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 disabled:opacity-60 focus:outline-hidden" />
            </div>

            <div className="sm:col-span-2 flex flex-col space-y-1">
              <label className="text-[9.5px] font-black tracking-widest text-stone-700">DELIVERY DISPATCH MAILING ADDRESS</label>
              <input type="text" disabled={!isEditing} value={profileData.address || ""} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 disabled:opacity-60 focus:outline-hidden" />
            </div>

            <div className="sm:col-span-2 pt-2">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-black text-[10px] tracking-widest uppercase rounded-md cursor-pointer">Commit Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-black text-[10px] tracking-widest uppercase rounded-md cursor-pointer">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-neutral-900 hover:bg-amber-600 text-white font-black text-[10px] tracking-widest uppercase rounded-md cursor-pointer transition">Modify Profile Details</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* MODULE D: LIVE SYSTEM DATA SPREADSHEET MANAGER WORKSPACE LAYER */}
      {profileData.is_admin && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4 gap-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-600 flex items-center space-x-1.5"><span>🛠️</span><span>LIVE SYSTEM DATA CONTROLLER SPREADSHEET</span></h3>
              <p className="text-[10.5px] text-stone-500 font-semibold uppercase tracking-wide">Read, inject, alter or purge document fields dynamically across any target collection.</p>
            </div>
            <select 
              value={adminActiveTable} 
              onChange={(e) => setAdminActiveTable(e.target.value)} 
              className="bg-stone-50 border border-stone-200 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-hidden cursor-pointer shadow-2xs text-neutral-900 font-bold"
            >
              {["Shells", "Sizes", "Proteins", "Cheeses", "Sauces", "Salsas", "Toppings", "Sides", "Drinks", "Desserts", "MenuItem", "Deals"].map(tbl => (
                <option key={tbl} value={tbl}>{tbl}</option>
              ))}
            </select>
          </div>

          <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <span className="text-xs font-black tracking-widest text-stone-700 uppercase">Collection Matrix: <span className="text-neutral-900 underline font-black">{adminActiveTable}</span></span>
              <button 
                onClick={() => { setShowAddForm(!showAddForm); setNewRowFormData({ _id: `NEW_${Date.now().toString().slice(-4)}` }); }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest rounded-md transition shadow-2xs cursor-pointer"
              >
                {showAddForm ? "✕ Collapse Add" : "➕ Add New Document Row"}
                            </button>
            </div>

            {/* Collapsible Injection Form Panel */}
            {showAddForm && (
              <form onSubmit={executeInsertRowQuery} className="mb-6 p-4 bg-white border border-stone-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                <input type="text" placeholder="DOCUMENT _ID" value={newRowFormData._id || ""} onChange={(e) => setNewRowFormData({...newRowFormData, _id: e.target.value})} className="p-2 border rounded-md text-xs font-semibold focus:border-amber-500 outline-hidden" required />
                <input type="text" placeholder="NAME / PRODUCTNAME" value={newRowFormData.name || newRowFormData.productName || ""} onChange={(e) => setNewRowFormData({...newRowFormData, name: e.target.value, productName: e.target.value})} className="p-2 border rounded-md text-xs font-semibold focus:border-amber-500 outline-hidden" required />
                <input type="number" placeholder="PRICE / BASECOST / BENEFIT" onChange={(e) => setNewRowFormData({...newRowFormData, price: Number(e.target.value), baseCost: Number(e.target.value), benefit: Number(e.target.value)})} className="p-2 border rounded-md text-xs font-semibold focus:border-amber-500 outline-hidden" required />
                <button type="submit" className="sm:col-span-3 py-2.5 bg-neutral-900 text-white font-black text-[10px] uppercase rounded-md tracking-wider hover:bg-amber-600 transition-colors cursor-pointer">Execute Insert Command Query →</button>
              </form>
            )}

            {tableLoading ? (
              <div className="text-center py-12 font-black text-xs text-stone-400 uppercase tracking-widest animate-pulse">Querying Cluster Streams...</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-[10px] font-black tracking-wider text-stone-700 uppercase">
                      <th className="p-3">ID Key</th>
                      <th className="p-3">Title / Descriptor Field</th>
                      <th className="p-3 text-center">Operational Direct CRUD Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[11px] font-semibold text-stone-600">
                    {tableRowsData.map((row, idx) => {
                      const id = row._id || row.id || `ROW_${idx}`;
                      const isRowEditing = editingRowId === id;
                      return (
                        <tr key={id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-neutral-900 text-xs">{id}</td>
                          <td className="p-3 uppercase text-neutral-800 font-bold">
                            {isRowEditing ? (
                              <input type="text" value={editFormData.name || editFormData.productName || ""} onChange={(e) => setEditFormData({...editFormData, name: e.target.value, productName: e.target.value})} className="p-1.5 border rounded-md text-xs font-bold w-full uppercase focus:border-amber-500 outline-hidden bg-white" />
                            ) : (
                              row.productName || row.name || row.dealCode || "Unnamed Document Entry Row"
                            )}
                          </td>
                          <td className="p-3 text-center space-x-1.5 whitespace-nowrap">
                            {isRowEditing ? (
                              <>
                                <button onClick={() => executeUpdateRowQuery(id)} className="px-3 py-1 bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest rounded-sm cursor-pointer shadow-2xs hover:bg-emerald-700 transition">Save</button>
                                <button onClick={() => setEditingRowId(null)} className="px-3 py-1 bg-stone-100 text-stone-600 font-black text-[9px] uppercase tracking-widest rounded-sm cursor-pointer hover:bg-stone-200">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleStartEditRow(row)} className="px-2.5 py-1 bg-stone-50 hover:bg-amber-100 text-stone-700 hover:text-amber-800 font-black text-[9px] uppercase tracking-widest rounded-sm transition cursor-pointer">Edit</button>
                                <button onClick={() => executeRowPurgeQuery(id)} className="px-2.5 py-1 bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 font-black text-[9px] uppercase tracking-widest rounded-sm transition cursor-pointer">Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

