import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CartPage from './pages/CartPage';
import Auth from './pages/Auth';
import OrdersPage from './pages/OrdersPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard'; 

function TacoSideLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <div className="w-full my-3 overflow-visible">
      <Link 
        to={to} 
        className={`block w-full py-4 pl-6 border border-zinc-950/40 shadow-md font-sans text-[13px] font-black tracking-widest text-left uppercase select-none transition-all duration-150 skew-cross-box
          ${isActive 
            ? 'bg-amber-600 text-white border-amber-500 font-extrabold' 
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-800'
          }`}
      >
        <div className="unskew-cross-content italic tracking-wider">
          {children}
        </div>
      </Link>
    </div>
  );
}
// Sidebar cart link with a live item count
function CartLink() {
  const location = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () => {
      const id = localStorage.getItem('activeUser_id') || 'Guest_Workspace_Session';
      fetch(`http://localhost:5000/api/cart/${id}`)
        .then((res) => res.json())
        .then((cart) => setCount((cart.items || []).reduce((sum, row) => sum + (row.qty || 0), 0)))
        .catch(() => {});
    };
    load();
    window.addEventListener('cart-updated', load);
    return () => window.removeEventListener('cart-updated', load);
  }, [location.pathname]);

  return <TacoSideLink to="/cart">My Cart ({count})</TacoSideLink>;
}

export default function App() {
  // Read flags out of local browser cache keys safely with hard string fallback protection checks
  const activeUser_id = localStorage.getItem('activeUser_id');
  const is_admin = localStorage.getItem('is_admin') === "true"; 

  return (
    <Router>
      <div className="flex min-h-screen bg-stone-100 font-sans text-neutral-800 antialiased">
        
        {/* Left-Aligned Narrow Sticky Dark Side Navigation Bar Container */}
        <nav className="fixed top-0 left-0 bottom-0 z-50 flex flex-col w-[175px] bg-black shadow-2xl border-r border-zinc-950 no-scrollbar select-none">
          
          {/* Brand Header Logo Block */}
          <div className="flex flex-col items-center justify-center pt-8 pb-6 px-2 bg-black z-10 border-b border-zinc-950/60">
            <div className="text-4xl mb-2 filter drop-shadow">🔔</div>
            <div className="text-sm font-black tracking-tighter text-center leading-none text-white">
              AKASH'S <br/> <span className="text-amber-500 text-base font-black tracking-wide">TACOS</span>
            </div>
            <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 mt-2 bg-emerald-950/40 px-2 py-0.5 rounded-xs border border-emerald-400/40">
              100% Veg
            </span>
          </div>

          {/* Master Cross-Angled Ribbon Stack Window */}
          <div className="flex-1 py-4 overflow-y-auto bg-black no-scrollbar overflow-visible">
            <TacoSideLink to="/menu">Order Now</TacoSideLink>
            <TacoSideLink to="/">Our Food</TacoSideLink>
            
            {/* DYNAMIC REDIRECT NAVIGATION TRIGGER GATE */}
            {activeUser_id ? (
              <div className="w-full my-3 overflow-visible">
                <Link 
                  to={is_admin ? "/admin-dashboard" : "/dashboard"} 
                  className="block w-full py-4 pl-6 border border-emerald-900 bg-emerald-950/40 text-emerald-400 font-sans text-[12px] font-black tracking-wider text-left uppercase select-none skew-cross-box italic hover:bg-emerald-900/60 transition duration-150"
                >
                  <div className="unskew-cross-content">👤 {activeUser_id}</div>
                </Link>
              </div>
            ) : (
              <TacoSideLink to="/auth">Sign In</TacoSideLink>
            )}

            <CartLink />
            <TacoSideLink to="/orders">My Orders</TacoSideLink>
          </div>

          {/* Brand Footer Block */}
          <div className="p-3 text-center bg-neutral-950 border-t border-zinc-950 text-[9px] text-zinc-600 font-bold uppercase tracking-wider leading-none z-10">
            © 2026 <br/> Akash's Tacos
          </div>
        </nav>

        {/* Right Main Content Display Frame Panel Content Area */}
        <main className="flex-1 min-h-screen ml-[175px] p-6 bg-zinc-100">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xs min-h-[calc(100vh-3rem)] p-6 border border-zinc-200/40">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/dashboard" element={<UserDashboard />} /> 
              <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
            </Routes>
          </div>
        </main>
        
      </div>
    </Router>
  );
}
