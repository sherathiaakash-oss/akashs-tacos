import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [activeMode, setActiveTabMode] = useState("MEMBER_SIGNIN"); // MEMBER_SIGNIN, GUEST_SIGNIN, REGISTER
  const [errorMessage, setErrorMessage] = useState("");
  
  // Controlled form state tracking dictionary
  const [formData, setFormData] = useState({
    User_id: "", firstName: "", lastName: "", email: "", phoneNo: "", address: "", password: "", fullName: ""
  });

  const handleInputChange = (fieldName, value) => {
    setErrorMessage("");
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const getFieldsLayout = () => {
    switch (activeMode) {
      case "MEMBER_SIGNIN":
        return [
          { name: "User_id", label: "UNIQUE USER ID / USERNAME", type: "text", placeholder: "ENTER YOUR UNIQUE USER ID" },
          { name: "password", label: "PASSWORD", type: "password", placeholder: "ENTER YOUR PASSWORD" }
        ];
      case "GUEST_SIGNIN":
        return [
          { name: "fullName", label: "FULL NAME (STAYS AS TEMP USER ID)", type: "text", placeholder: "ENTER YOUR FIRST & LAST NAME" },
          { name: "phoneNo", label: "MOBILE PHONE NUMBER", type: "tel", placeholder: "ENTER YOUR 10-DIGIT MOBILE NUMBER" },
          { name: "address", label: "DELIVERY RESIDENCE ADDRESS", type: "text", placeholder: "ENTER COMPLETE ADDRESS FOR DISPATCH" }
        ];
      case "REGISTER":
        return [
          { name: "User_id", label: "CHOOSE UNIQUE USER ID (MUST BE UNIQUE)", type: "text", placeholder: "CREATE A CHOSEN USERNAME" },
          { name: "firstName", label: "FIRST NAME", type: "text", placeholder: "AKASH" },
          { name: "lastName", label: "LAST NAME", type: "text", placeholder: "PATEL" },
          { name: "email", label: "EMAIL ADDRESS (MUST BE UNIQUE)", type: "email", placeholder: "ENTER VALID EMAIL" },
          { name: "phoneNo", label: "PHONE NUMBER (MUST BE UNIQUE)", type: "tel", placeholder: "ENTER ACTIVE MOBILE NUMBER" },
          { name: "address", label: "PERMANENT HOME ADDRESS", type: "text", placeholder: "ENTER FULL MAILING ADDRESS" },
          { name: "password", label: "CREATE PASSWORD", type: "password", placeholder: "CREATE A SECURE PASSWORD" }
        ];
      default:
        return [];
    }
  };

  const currentFields = getFieldsLayout();
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    let apiEndpointPath = "";
    let submissionPayload = {};

    if (activeMode === "MEMBER_SIGNIN") {
      apiEndpointPath = "https://akashs-tacos-backend.onrender.com/api/auth/signin/member";
      submissionPayload = { User_id: formData.User_id, password: formData.password };
    } else if (activeMode === "GUEST_SIGNIN") {
      apiEndpointPath = "https://akashs-tacos-backend.onrender.com/api/auth/signin/guest";
      submissionPayload = { fullName: formData.fullName, phoneNo: formData.phoneNo, address: formData.address };
    } else if (activeMode === "REGISTER") {
      apiEndpointPath = "https://akashs-tacos-backend.onrender.com/api/auth/register";
      submissionPayload = formData;
    }

    try {
      const response = await fetch(apiEndpointPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authorization query failure.");
      }

      // 👑 FIX PASSING STATE MATRIX GATES:
      // We extract the server boolean rows and cache them to browser local memory instantly on pass!
      if (data.User_id) {
        localStorage.setItem('activeUser_id', data.User_id);
        localStorage.setItem('is_admin', data.is_admin ? "true" : "false");
        localStorage.setItem('is_member', data.is_member ? "true" : "false");
        localStorage.setItem('is_guest', data.is_guest ? "true" : "false");

        // Routing redirects check
        if (data.is_admin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
        window.location.reload();
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const topNavigationLinks = [
    { modeId: "MEMBER_SIGNIN", label: "As Member" },
    { modeId: "GUEST_SIGNIN", label: "As Guest (Instant)" },
    { modeId: "REGISTER", label: "Join Taco Club" }
  ];

  const getBadgeContext = () => {
    if (activeMode === "MEMBER_SIGNIN") return { title: "MEMBER SECURE AUTHORIZATION", sub: "Sign in using your Unique UserID identifier to unlock loyalty points." };
    if (activeMode === "GUEST_SIGNIN") return { title: "FRICTIONLESS GUEST PASSWAY", sub: "No password required! Temporary session parameters delete cleanly upon logout." };
    return { title: "REGISTER REWARDS ACCOUNT", sub: "Create a unique profile. User ID, Email, and Phone Number are strictly validated for uniqueness." };
  };

  const textContext = getBadgeContext();
  return (
    <div className="max-w-md mx-auto my-6 select-none animate-fadeIn font-sans pb-8">
      
      {/* Main Flat, Borderless Auth Frame */}
      <div className="bg-white rounded-3xl p-8 shadow-xs hover:shadow-xl transition-shadow duration-500 border border-stone-100">
        
        {/* Navigation Tabs Row */}
        <div className="flex border-b border-stone-100 pb-3 mb-6 overflow-x-auto no-scrollbar">
          {topNavigationLinks.map((tab) => (
            <button
              key={tab.modeId}
              onClick={() => { setActiveTabMode(tab.modeId); setErrorMessage(""); }}
              className={`flex-1 text-center font-sans font-black text-[11px] tracking-widest pb-2.5 transition-all uppercase whitespace-nowrap px-2 cursor-pointer
                ${activeMode === tab.modeId 
                  ? 'text-amber-600 border-b-2 border-amber-600 font-extrabold' 
                  : 'text-stone-400 hover:text-stone-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Context Header text area */}
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 font-sans">
            {textContext.title}
          </h2>
          <p className="text-[10.5px] text-stone-500 font-semibold uppercase tracking-wide leading-relaxed">
            {textContext.sub}
          </p>
        </div>

        {/* Dynamic Error Status Response Message Notification Alert */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 font-sans font-bold text-[11px] px-4 py-3 rounded-xl uppercase tracking-wide animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {/* Input Rendering Loop */}
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {currentFields.map((field) => (
            <div key={field.name} className="flex flex-col space-y-1 animate-fadeIn">
              <label className="text-[9.5px] font-black tracking-widest text-neutral-800 uppercase">
                {field.label}
              </label>
              <input 
                type={field.type} 
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide text-neutral-900 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all duration-200"
                required
              />
            </div>
          ))}

          {/* Core Action Execution Trigger Button */}
          <button 
            type="submit"
            className="w-full mt-4 py-3.5 bg-neutral-900 hover:bg-amber-600 text-white font-black text-xs tracking-widest uppercase rounded-full transition-colors duration-300 shadow-xs active:scale-98 cursor-pointer"
          >
            {activeMode === "MEMBER_SIGNIN" && "Authorize Member ID →"}
            {activeMode === "GUEST_SIGNIN" && "Initialize Guest Bag Checkout →"}
            {activeMode === "REGISTER" && "Validate & Join Club →"}
          </button>
        </form>

        {/* Pure-Veg Kitchen Footer Accent Badge */}
        <div className="mt-6 flex justify-center border-t border-stone-100 pt-4">
          <span className="bg-emerald-50 text-emerald-600 font-sans font-black text-[9px] tracking-widest uppercase border border-emerald-100/50 px-3 py-1 rounded-full">
            🌱 100% VEGETARIAN SECURE APPARATUS
          </span>
        </div>

      </div>
    </div>
  );
}
