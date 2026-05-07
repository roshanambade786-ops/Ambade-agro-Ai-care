import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, query, doc, setDoc, getDocs 
} from 'firebase/firestore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Sprout, ShoppingCart, Bot, Bell, Home, ShoppingBag, TrendingUp, History, 
  Package, User, PlusCircle, Loader2, Send, Leaf, Sun, Cloud, CreditCard, 
  Users, Phone, ShieldCheck, Camera, Search, FileText, Settings, 
  MessageCircle, LayoutDashboard, LogOut, ChevronRight, CheckCircle2, AlertCircle, Scan, MapPin
} from 'lucide-react';

// --- Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ambade-agro-v1';
const apiKey = ""; // Gemini API Key

// --- Styles ---
const glassStyle = "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl";

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState('farmer'); // 'farmer' or 'admin'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-green-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-green-100">
      {/* Global Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded-lg shadow-lg shadow-green-200">
            <Sprout className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter leading-none uppercase">
              AMBADE AGRO <span className="text-green-600">AI</span>
            </h1>
            <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase mt-0.5">Smart Krishi Solutions</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border">
            <button 
              onClick={() => setView('farmer')} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${view === 'farmer' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500'}`}
            >MOBILE APP</button>
            <button 
              onClick={() => setView('admin')} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${view === 'admin' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500'}`}
            >WEB DASHBOARD</button>
          </div>
          {user && <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {!user ? (
          <AuthModule onLogin={() => setView('farmer')} />
        ) : (
          view === 'farmer' ? <FarmerMobileApp user={user} /> : <AdminDashboard user={user} />
        )}
      </main>
      <Analytics />
    </div>
  );
}

// --- 1. LOGIN / REGISTRATION ---
function AuthModule() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);

  const onSendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, window.recaptchaVerifier);
      window.confirmationResult = result;
      setStep('otp');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const onVerifyOtp = async () => {
    setLoading(true);
    try {
      await window.confirmationResult.confirm(otp);
    } catch (e) { alert("Invalid OTP"); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm border border-slate-100 text-center">
        <div className="mb-8">
          <img src="https://api.iconify.design/noto:sheaf-of-rice.svg" className="w-16 h-16 mx-auto mb-4" alt="logo" />
          <h2 className="text-3xl font-black text-slate-800">Ambade <span className="text-green-600">Agro</span> AI</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">AI के साथ स्मार्ट खेती</p>
        </div>

        <div id="recaptcha-container"></div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
              <input 
                type="tel" placeholder="मोबाइल नंबर" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 font-bold focus:border-green-500 outline-none transition-all"
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button onClick={onSendOtp} className="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : "मोबाइल नंबर से लॉगिन"}
            </button>
            <button className="w-full bg-white border-2 border-slate-100 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-slate-600 text-sm">
               <img src="https://www.google.com/favicon.ico" className="w-4 h-4" /> Google से लॉगिन करें
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <input 
              type="text" placeholder="6-अंकों का OTP" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-green-500"
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button onClick={onVerifyOtp} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">
               लॉगिन की पुष्टि करें
            </button>
          </div>
        )}
        <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase">नया किसान? <span className="text-green-600 cursor-pointer">रजिस्टर करें</span></p>
      </div>
    </div>
  );
}

// --- 2. HOME DASHBOARD ---
function FarmerHome({ user, onTabChange }) {
  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* User Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black text-slate-800">नमस्ते, रामेश्वर यादव</h2>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            <MapPin size={10} className="text-green-600" /> अकोला, महाराष्ट्र
          </div>
        </div>
        <div className="relative">
          <Bell className="text-slate-400" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
        </div>
      </div>

      {/* Weather Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Cloud size={100} /></div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-4xl font-black">28°C</h3>
          <Sun size={40} className="text-yellow-300 fill-yellow-300" />
        </div>
        <p className="text-sm font-bold opacity-90 italic">आंशिक बादल</p>
        <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-widest bg-white/10 p-2 rounded-xl inline-flex">
          <span>H: 32° | L: 24°</span>
          <span>आर्द्रता: 65%</span>
        </div>
        <p className="mt-4 text-[11px] font-bold text-blue-100 bg-blue-800/30 p-2 rounded-xl border border-white/10">
          आज बारिश की संभावना 20% है
        </p>
      </div>

      {/* Quick Services */}
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">त्वरित सुविधाएं</h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'AI फसल डॉक्टर', icon: Bot, color: 'text-blue-600', bg: 'bg-blue-50', id: 'ai' },
            { label: 'मौसम अपडेट', icon: Cloud, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'मंडी भाव', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'खाद सुझाव', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', id: 'advice' }
          ].map((s, i) => (
            <div key={i} onClick={() => s.id && onTabChange(s.id)} className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition">
              <div className={`${s.bg} ${s.color} p-4 rounded-2xl shadow-sm border border-white`}><s.icon size={20}/></div>
              <span className="text-[9px] font-bold text-center leading-none text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My Crops */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">मेरी ��सलें</h4>
          <PlusCircle size={16} className="text-green-600" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-white shadow-inner group">
             <div className="bg-white p-2 rounded-xl text-green-600 shadow-sm"><Sprout size={18}/></div>
             <div className="flex-1">
                <p className="text-[11px] font-black text-slate-800">गेहूं (Wheat)</p>
                <p className="text-[9px] font-bold text-slate-400">खेत का प्रकार: सिंचित</p>
             </div>
             <ChevronRight size={14} className="text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 3. AI CROP DOCTOR ---
function AICropDoctor() {
  const [img, setImg] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleCapture = () => {
    setAnalyzing(true);
    setTimeout(() => {
       setResult({
         disease: "गेहूं - पत्ती धब्बा रोग (Leaf Blotch)",
         risk: "मध्यम",
         desc: "पत्तियों पर भूरे रंग के धब्बे, जो बाद में बड़े होकर सूख जाते हैं।",
         solution: [
           { name: "टेबुकोनाज़ोल 25.9% EC", qty: "1ml प्रति लीटर पानी" },
           { name: "प्रोपिकोनाज़ोल 25% EC", qty: "1ml प्रति लीटर पानी" }
         ]
       });
       setAnalyzing(false);
    }, 2000);
  };

  if (result) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setResult(null)} className="p-2 bg-slate-100 rounded-xl"><ChevronRight className="rotate-180" size={16}/></button>
            <h3 className="font-black text-lg">परिणाम</h3>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl">
            <p className="text-[10px] font-black text-red-600 uppercase mb-1">रोग की पहचान</p>
            <h4 className="text-xl font-black text-slate-800">{result.disease}</h4>
            <p className="text-xs font-bold text-red-500 mt-1">रोग का स्तर: {result.risk}</p>
        </div>

        <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">लक्षण</h5>
            <p className="text-xs font-medium text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border">{result.desc}</p>
        </div>

        <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">सुझाया गया उपचार</h5>
            <div className="space-y-3">
                {result.solution.map((s, i) => (
                    <div key={i} className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center">
                        <div className="bg-green-100 p-2 rounded-xl text-green-600"><CheckCircle2 size={20}/></div>
                        <div>
                            <p className="text-[11px] font-black text-slate-800">{s.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">खुराक: {s.qty}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <button className="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all mt-4">
            पूरी जानकारी PDF में लें
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 flex flex-col items-center h-full">
      <div className="w-full">
         <h3 className="font-black text-xl mb-1">AI फसल डॉक्टर</h3>
         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">फसल की फोटो अपलोड करें</p>
      </div>

      <div className="w-full aspect-square bg-slate-100 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
         {!analyzing ? (
           <>
             <div className="bg-white p-6 rounded-full shadow-lg text-green-600 mb-4 group-hover:scale-110 transition-transform">
                <Camera size={40} />
             </div>
             <p className="text-xs font-bold text-slate-400">फोटो लें / गैलरी से चुनें</p>
             <button onClick={handleCapture} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"></button>
           </>
         ) : (
           <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
              <p className="text-sm font-black text-green-700">AI जांच कर रहा है...</p>
           </div>
         )}
      </div>

      <div className="w-full space-y-3">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">हाल ही की जाँच</h4>
         <div className="flex items-center justify-between p-4 bg-white border rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden border">
                    <img src="https://images.unsplash.com/photo-1599818817415-32130e9d682f?auto=format&fit=crop&q=80&w=50" className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-slate-800">गेहूं - पत्ती धब्बा रोग</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">20 मई 2024</p>
                </div>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
         </div>
      </div>
    </div>
  );
}

// --- 4. FARMER MOBILE APP SHELL ---
function FarmerMobileApp({ user }) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto w-full max-w-[390px] h-[800px] bg-white rounded-[3.5rem] border-[12px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative">
        {/* Dynamic Island */}
        <div className="h-7 w-32 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-[110]"></div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pt-10 pb-24 scrollbar-hide">
          {activeTab === 'home' && <FarmerHome user={user} onTabChange={setActiveTab} />}
          {activeTab === 'ai' && <AICropDoctor />}
          {activeTab === 'shop' && <div className="p-8 text-center"><p className="font-bold text-slate-400">दुकान जल्द आ रही है...</p></div>}
        </div>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 w-full h-20 bg-white/90 backdrop-blur-xl border-t flex items-center justify-around px-6 z-[100]">
          {[
            { id: 'home', icon: Home, label: 'होम' },
            { id: 'advice', icon: Leaf, label: 'मेरी फसलें' },
            { id: 'ai', icon: Bot, label: 'AI डॉक्टर' },
            { id: 'shop', icon: ShoppingBag, label: 'स्टोर' },
            { id: 'profile', icon: User, label: 'प्रोफाइल' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-green-600 scale-110' : 'text-slate-400'}`}
            >
              <tab.icon size={22} className={activeTab === tab.id ? 'fill-green-600/10' : ''} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 5. ADMIN DASHBOARD ---
function AdminDashboard({ user }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('dashboard');

  const stats = [
    { label: 'आज की बिक्री', value: '₹ 56,240', change: '+18% vs कल', icon: ShoppingBag, color: 'bg-green-600' },
    { label: 'आज के बिल', value: '42', change: '+5 vs कल', icon: FileText, color: 'bg-blue-600' },
    { label: 'कुल मुनाफा (आज)', value: '₹ 12,450', change: '+16% vs कल', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  const salesData = [
    { name: '19 मई', value: 20000 },
    { name: '20 मई', value: 45000 },
    { name: '21 मई', value: 38000 },
    { name: '22 मई', value: 52000 },
    { name: '23 मई', value: 48000 },
    { name: '24 मई', value: 65000 },
    { name: '25 मई', value: 56240 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit sticky top-24">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><User size={20}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">स्वागत है,</p>
            <p className="text-xs font-black text-slate-800 leading-none">Ambade Agro Care</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: 'dashboard', label: 'डैशबोर्ड', icon: LayoutDashboard },
            { id: 'pos', label: 'POS / बिलिंग', icon: ShoppingCart },
            { id: 'stock', label: 'स्टॉक प्रबंधन', icon: Package },
            { id: 'product', label: 'प्रोडक्ट', icon: ShoppingBag },
            { id: 'purchase', label: 'खरीद', icon: TrendingUp }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${adminTab === item.id ? 'bg-green-50 text-green-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {adminTab === 'dashboard' && <DashboardContent />}
        {adminTab === 'pos' && <POSContent />}
        {adminTab === 'stock' && <StockContent />}
        {adminTab === 'product' && <ProductContent />}
        {adminTab === 'purchase' && <PurchaseContent />}
      </div>
    </div>
  );
}

// Placeholder components for admin sections
function DashboardContent() {
  return <div className="bg-white p-6 rounded-3xl"><h2 className="text-2xl font-black">डैशबोर्ड</h2></div>;
}

function POSContent() {
  return <div className="bg-white p-6 rounded-3xl"><h2 className="text-2xl font-black">POS / बिलिंग</h2></div>;
}

function StockContent() {
  return <div className="bg-white p-6 rounded-3xl"><h2 className="text-2xl font-black">स्टॉक प्रबंधन</h2></div>;
}

function ProductContent() {
  return <div className="bg-white p-6 rounded-3xl"><h2 className="text-2xl font-black">प्रोडक्ट</h2></div>;
}

function PurchaseContent() {
  return <div className="bg-white p-6 rounded-3xl"><h2 className="text-2xl font-black">खरीद</h2></div>;
}
