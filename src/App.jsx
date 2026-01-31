import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Box, Search, Filter, ChevronRight, FileText, ArrowRight, Factory, 
  ShieldCheck, Settings, Users, Mail, Phone, MapPin, Menu, X, 
  Download, CheckCircle2, Globe, Award, Zap, Printer as Fax,
  ChevronLeft, MessageSquare, HelpCircle, HardDrive, PenTool,
  Activity, Eye, Maximize2, Layers, Cpu, Scale
} from 'lucide-react';


const CLIENT_LOGOS = [
  { name: "WINGS", img: "src/assets/images/logos/logo_wings.png" },
  { name: "SUPERINDO", img: "src/assets/images/logos/logo_superindo.png" },
  { name: "MAYORA", img: "src/assets/images/logos/logo_mayora.png" },
  { name: "INDOMARCO", img: "src/assets/images/logos/logo_indomarco.png" },
  { name: "ALFAMART", img: "src/assets/images/logos/logo_alfamart.png" },
  { name: "INDOMARET", img: "src/assets/images/logos/logo_indomaret.png" },
  { name: "UNILEVER", img: "src/assets/images/logos/logo_unilever.png" },
  { name: "DANONE", img: "src/assets/images/logos/logo_danone.png" },
  { name: "NESTLE", img: "src/assets/images/logos/logo_nestle.png" },
  { name: "COCA COLA", img: "src/assets/images/logos/logo_cocacola.png" },
  { name: "TOYOTA", img: "src/assets/images/logos/logo_toyota.png" },
  { name: "HONDA", img: "src/assets/images/logos/logo_honda.png" }
];

const CATEGORIES = [
  "Semua Produk", "Pallet Plastik", "Container Industri", 
  "Wadah Bulk", "Crates Botol", "Tempat Sampah", "Peralatan Ternak"
];

const CERTIFICATES = [
  { id: 1, title: "ISO 9001:2015", desc: "Quality Management", jp: "品質管理", img: "src/assets/images/certificates/cert_iso9001.jpg" },
  { id: 2, title: "ISO 14001:2015", desc: "Environmental Care", jp: "環境管理", img: "src/assets/images/certificates/cert_iso14001.jpg" },
  { id: 3, title: "ISO 45001:2018", desc: "Health & Safety", jp: "安全衛生", img: "src/assets/images/certificates/cert_iso45001.jpg" },
  { id: 4, title: "Food Grade", desc: "Safety Compliance", jp: "食品安全", img: "src/assets/images/certificates/cert_foodgrade.jpg" }
];

const PRODUCTS = Array.from({ length: 48 }, (_, i) => {
  const cats = ["Pallet Plastik", "Container Industri", "Wadah Bulk", "Crates Botol", "Tempat Sampah", "Peralatan Ternak"];
  const cat = cats[i % cats.length];
  const prefixes = {
    "Pallet Plastik": "pallet",
    "Container Industri": "container",
    "Wadah Bulk": "bulk",
    "Crates Botol": "crate",
    "Tempat Sampah": "dustbin",
    "Peralatan Ternak": "livestock"
  };
  return {
    id: i + 1,
    sku: `INP-${prefixes[cat].toUpperCase().substring(0, 2)}-${1001 + i}`,
    name: `${cat} Series ${101 + i} Ultra-Zen`,
    cat: cat,
    dim: `${600 + (i * 10)} x ${400 + (i * 5)} x ${150 + i} mm`,
    load: `${1500 + (i * 50)} kg`,
    staticLoad: `${4000 + (i * 100)} kg`,
    mat: "High-Density Polyethylene (HDPE)",
    color: i % 2 === 0 ? "Industrial Blue" : "Coal Black",
    // Gambar produk: src/assets/images/products/product_[category]_[number].jpg
    img: `src/assets/images/products/product_${prefixes[cat]}_${(i % 5) + 1}.jpg`
  };
});

// ==========================================
// SHARED COMPONENTS
// ==========================================

const SectionTag = ({ number, title, jp }) => (
  <div className="flex flex-col gap-4 mb-12 text-left">
    <div className="flex items-center gap-4">
      <span className="text-red-600 font-black text-xs tracking-tighter">[{number}]</span>
      <div className="h-px w-12 bg-red-600"></div>
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">{title}</span>
    </div>
    <span className="text-4xl font-black text-zinc-100/10 leading-none uppercase -mt-4 select-none">{jp}</span>
  </div>
);

const Logo = ({ light = false, className = "" }) => (
  <div className={`flex items-center gap-6 group cursor-pointer ${className}`}>
    <div className="relative overflow-hidden">
      <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-sm transition-transform duration-700 group-hover:rotate-90">
        <Box className="text-white" size={24} />
      </div>
    </div>
    <div className="flex flex-col text-left">
      <span className={`text-[10px] font-black tracking-[0.6em] uppercase leading-none ${light ? 'text-white' : 'text-zinc-950'}`}>インドラグラハ</span>
      <span className={`text-[12px] font-black tracking-tighter uppercase mt-1 ${light ? 'text-zinc-400' : 'text-zinc-900'}`}>INDRAGRAHA NUSAPLASINDO</span>
    </div>
  </div>
);

// ==========================================
// MAIN APPLICATION
// ==========================================

const App = () => {
  const [activeCategory, setActiveCategory] = useState("Semua Produk");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRFQ, setShowRFQ] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeMap, setActiveMap] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State baru untuk notifikasi & preview sertifikat
  const [isRFQSubmitted, setIsRFQSubmitted] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(null);

  const itemsPerPage = 9;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCat = activeCategory === "Semua Produk" || p.cat === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchTerm]);

  const currentProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleRFQSubmit = (e) => {
    e.preventDefault();
    setIsRFQSubmitted(true);
    // Tutup modal setelah delay sebentar agar user sempat membaca
    setTimeout(() => {
      setIsRFQSubmitted(false);
      setShowRFQ(false);
      setSelectedProduct(null);
    }, 4000);
  };

  const locations = {
    jakarta: {
      name: "Corporate Headquarters",
      city: "JAKARTA PUSAT",
      address: "Jl. Imam Mahbud No. 34, Duri Pulo",
      embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.657!2d106.805!3d-6.176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f664a382b61b%3A0xc3b83b3815599026!2zSmwuIEltYW0gTWFoYnVkIE5vLjM0!5e0!3m2!1sen!2sid!4v1700000000"
    },
    banten: {
      name: "Manufacturing Plant",
      city: "TANGERANG, BANTEN",
      address: "Jl. Raya PLP Curug Gg. Vihara No. 3",
      embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.052!2d106.556!3d-6.256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fbc412239d5b%3A0x630441d3d6502283!2zQ3VydWcsIFRhbmdlcmFuZw!5e0!3m2!1sen!2sid!4v1700000000"
    }
  };

  return (
    <div className={`min-h-screen bg-white font-sans text-zinc-950 selection:bg-red-600 selection:text-white overflow-x-hidden transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* GLOBAL OVERLAYS & CUSTOM STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body { font-family: 'Space Grotesk', sans-serif; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f4f4f5; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef4444; }
      `}</style>

      {/* FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-500 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-20 flex justify-between items-center">
          <Logo />
          
          <div className="hidden lg:flex items-center gap-12 text-left">
            {[
              { label: 'Home', id: 'home' },
              { label: 'Tentang', id: 'about' },
              { label: 'Catalog', id: 'katalog' },
              { label: 'Engineering', id: 'workflow' },
              { label: 'Network', id: 'network' }
            ].map((item) => (
              <button 
                key={item.label} 
                onClick={() => scrollTo(item.id)} 
                className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 transition-all relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
              </button>
            ))}
            <div className="h-6 w-px bg-zinc-200"></div>
            <button 
              onClick={() => setShowRFQ(true)} 
              className="bg-zinc-950 text-white px-8 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-600 transition-all flex items-center gap-3"
            >
              Minta Penawaran <ArrowRight size={14} />
            </button>
          </div>

          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 z-[110] bg-zinc-950 transition-transform duration-700 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden p-12 flex flex-col justify-center`}>
        <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-white"><X size={40} /></button>
        <div className="space-y-12">
          {['home', 'about', 'katalog', 'workflow', 'network'].map((id) => (
            <button key={id} onClick={() => scrollTo(id)} className="block text-6xl font-black text-white uppercase tracking-tighter italic hover:text-red-600 transition-colors">
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* HERO SECTION - Path: src/assets/images/hero_main.jpg */}
      <section id="home" className="relative pt-40 pb-20 min-h-screen flex items-center grid-pattern border-b border-zinc-100 overflow-hidden text-left">
        <div className="absolute top-40 right-0 w-1/3 h-2/3 bg-zinc-50 border-l border-b border-zinc-200 -z-10 translate-x-12 translate-y-12 text-left"></div>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-12 gap-12 items-center text-left">
          <div className="lg:col-span-8 text-left text-left">
            <div className="mb-10 inline-flex items-center gap-4 py-2 px-4 bg-zinc-950 text-white rounded-full text-left">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse text-left"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-left">Est. 1972 — Manufacturing Authority</span>
            </div>
            <h1 className="text-[12vw] lg:text-[10rem] font-black text-zinc-950 leading-[0.8] tracking-tighter uppercase italic mb-12 text-left text-left">
              Beyond <br /> <span className="text-red-600 not-italic text-left">Plastic.</span>
            </h1>
            <div className="max-w-xl border-l-4 border-zinc-950 pl-10 text-left text-left">
              <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-10 text-left text-left">
                Penyedia solusi logistik industri kelas dunia. Kami menggabungkan presisi Jepang dengan skala manufaktur Indonesia untuk infrastruktur rantai pasok yang tak terhentikan.
              </p>
              <div className="flex flex-wrap gap-6 text-left text-left">
                <button onClick={() => scrollTo('katalog')} className="px-10 py-5 bg-zinc-950 text-white font-bold text-xs uppercase tracking-[0.4em] rounded-sm hover:bg-red-600 transition-all flex items-center gap-4 shadow-xl text-left">
                  Buka Katalog <Layers size={18} />
                </button>
                <button onClick={() => scrollTo('about')} className="px-10 py-5 border-2 border-zinc-950 text-zinc-950 font-bold text-xs uppercase tracking-[0.4em] rounded-sm hover:bg-zinc-950 hover:text-white transition-all text-left">
                  Our Legacy
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 relative flex justify-center text-left">
            <div className="relative group w-full max-w-md aspect-[3/4] overflow-hidden rounded-sm bg-zinc-100 border-8 border-white shadow-2xl text-left">
              <img 
                src="src/assets/images/hero_main.jpg" 
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 text-left" 
                alt="Industrial"
                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000"} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent text-left"></div>
              <div className="absolute bottom-8 left-8 text-white text-left text-left">
                <p className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-60 mb-2 text-left">Facility View</p>
                <p className="text-2xl font-black uppercase italic text-left">Main Plant 01</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO MARQUEE (Our Clients) - Path: src/assets/images/logos/ */}
      <section className="bg-zinc-950 py-20 overflow-hidden border-y-4 border-red-600 text-left">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-10 flex justify-between items-center text-left text-left">
            <span className="text-[11px] font-black text-red-600 uppercase tracking-[0.8em] italic text-left">Our Strategic Clients</span>
            <div className="h-px flex-grow mx-12 bg-white/10 text-left"></div>
        </div>
        <div className="flex animate-marquee whitespace-nowrap items-center gap-24 text-left">
          {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
            <div key={i} className="flex-shrink-0 group flex flex-col items-center gap-4 text-left">
              <img 
                src={logo.img} 
                alt={logo.name} 
                className="h-16 lg:h-20 w-auto grayscale opacity-40 brightness-200 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-auto text-left"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-white font-black text-4xl opacity-10 group-hover:opacity-100 group-hover:text-red-600 transition-all text-left">{logo.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT US SECTION - Gallery Path: src/assets/images/about_heritage/ */}
      <section id="about" className="py-40 bg-white border-b border-zinc-100 text-left text-left">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-left">
          <SectionTag number="00" title="Historical Legacy" jp="歴史的遺産" />
          <div className="grid lg:grid-cols-12 gap-20 items-start mb-24 text-left text-left">
            <div className="lg:col-span-7 text-left text-left">
              <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none mb-16 text-left text-left text-left">
                Mengabdi untuk <br /> <span className="text-red-600 text-left">Industri Sejak 1972.</span>
              </h2>
              <div className="space-y-10 text-xl text-zinc-500 font-medium leading-relaxed max-w-4xl text-left text-left">
                <p className="border-l-4 border-red-600 pl-8 text-left text-left">
                  Didirikan pada tahun 1972 sebagai salah satu produsen plastik pertama di Indonesia, PT. Indragraha Nusaplasindo telah menjadi pelopor dalam pengembangan produk plastik injeksi untuk kebutuhan industri.
                </p>
                <p className="text-left text-left">
                  Pada tahun 1995, kami bertransformasi menjadi PT Indragraha Nusaplasindo dengan tujuan mempercepat adaptasi dan pemanfaatan produk plastik di pasar lokal. Sejak saat itu, kami mengembangkan sistem produksi cepat yang disesuaikan (built-to-suit) untuk menjawab kebutuhan pasar industri yang terus berkembang.
                </p>
                <p className="text-left text-left">
                  Melalui produk seperti kontainer serbaguna, palet plastik, kotak botol, tempat sampah, peralatan peternakan, dan lainnya, kami turut merevolusi penggunaan plastik di berbagai sektor industri lokal, termasuk otomotif, manufaktur berat, pertanian/perikanan, dan distribusi ritel.
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-5 flex flex-col gap-12 pt-12 lg:pt-0 text-left text-left">
              {[
                { label: "Jenis Produk", value: "70+" },
                { label: "Pelanggan Setia", value: "100+" },
                { label: "Tahun Pengalaman", value: "50+" }
              ].map((stat, i) => (
                <div key={i} className="border-b-[10px] border-zinc-950 pb-8 flex justify-between items-end group hover:border-red-600 transition-all duration-700 text-left text-left">
                  <div className="flex flex-col gap-2 text-left text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 group-hover:text-zinc-950 transition-colors text-left text-left">Statistical Data</span>
                    <span className="text-lg font-black uppercase tracking-tighter group-hover:text-red-600 transition-colors text-left text-left">{stat.label}</span>
                  </div>
                  <span className="text-8xl lg:text-9xl font-black tracking-tighter italic leading-none group-hover:text-red-600 group-hover:scale-110 transition-all duration-700 transform origin-right text-left text-left">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About Gallery Grid - Path: src/assets/images/about_heritage/ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-left">
            <div className="aspect-[4/5] bg-zinc-100 overflow-hidden group text-left text-left">
              <img src="src/assets/images/about_heritage/about_heritage_1.jpg" alt="Heritage Factory" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 text-left" onError={(e) => e.target.src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=800"} />
            </div>
            <div className="aspect-[4/5] bg-zinc-100 overflow-hidden group md:mt-12 text-left text-left">
              <img src="src/assets/images/about_heritage/about_heritage_2.jpg" alt="Precision Moulding" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 text-left" onError={(e) => e.target.src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800"} />
            </div>
            <div className="aspect-[4/5] bg-zinc-100 overflow-hidden group text-left text-left">
              <img src="src/assets/images/about_heritage/about_heritage_3.jpg" alt="Legacy Team" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 text-left" onError={(e) => e.target.src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800"} />
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW / ENGINEERING */}
      <section id="workflow" className="py-40 bg-zinc-50 relative overflow-hidden text-left text-left">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-left text-left">
          <SectionTag number="01" title="Production Protocol" jp="製造プロセス" />
          <div className="grid lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 text-left text-left">
            {[
              { id: "01", t: "Blueprint Design", d: "Analisis teknis dan simulasi beban digital untuk kustomisasi mould.", icon: <PenTool size={24}/> },
              { id: "02", t: "Mould Casting", d: "Pencetakan baja grade industri dengan toleransi mikron.", icon: <Settings size={24}/> },
              { id: "03", t: "Precision Injection", d: "Proses injeksi plastik dengan kontrol suhu otomatis.", icon: <Cpu size={24}/> },
              { id: "04", t: "Quality Audit", d: "Pengujian stress-test ekstrem sebelum distribusi massal.", icon: <Activity size={24}/> }
            ].map((step, i) => (
              <div key={i} className="bg-white p-12 group hover:bg-zinc-950 transition-all duration-700 text-left text-left">
                <div className="text-red-600 mb-10 group-hover:scale-125 transition-transform duration-500 text-left text-left">{step.icon}</div>
                <h4 className="text-2xl font-black uppercase mb-4 tracking-tighter group-hover:text-white text-left text-left">{step.t}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-500 text-left text-left text-left">{step.d}</p>
                <div className="mt-10 text-[10px] font-black text-zinc-200 group-hover:text-red-600/30 transition-colors text-left text-left">STEP_{step.id}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG SECTION - Product Paths: src/assets/images/products/ */}
      <section id="katalog" className="py-40 bg-white text-left text-left">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-left text-left">
          <div className="flex flex-col lg:flex-row gap-16 text-left text-left">
            
            {/* STICKY SIDEBAR */}
            <aside className="lg:w-80 flex-shrink-0 text-left text-left">
              <div className="sticky top-32 text-left text-left">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-300 mb-8 italic text-left text-left">Filter by Category</h3>
                <div className="space-y-2 text-left text-left">
                  {CATEGORIES.map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => {setActiveCategory(cat); setCurrentPage(1);}} 
                      className={`w-full text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 flex justify-between items-center group ${activeCategory === cat ? 'bg-zinc-950 text-white shadow-lg' : 'hover:bg-zinc-50 text-zinc-400'}`}
                    >
                      {cat}
                      <ChevronRight size={14} className={`transition-transform ${activeCategory === cat ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                    </button>
                  ))}
                </div>

                <div className="mt-16 p-8 bg-zinc-950 text-white rounded-sm overflow-hidden relative group text-left text-left">
                  <div className="relative z-10 text-left text-left">
                    <p className="text-[10px] font-black tracking-widest uppercase text-red-600 mb-4 italic text-left text-left">Custom Project</p>
                    <p className="text-xl font-black uppercase leading-tight mb-6 tracking-tighter text-left text-left">Punya Spesifikasi <br /> Khusus?</p>
                    <button onClick={() => setShowRFQ(true)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors text-left text-left">
                      Mulai Konsultasi <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-white/5 opacity-50 text-left text-left text-left"><Factory size={120} /></div>
                </div>
              </div>
            </aside>

            {/* PRODUCT GRID */}
            <main className="flex-grow text-left text-left">
              <div className="flex flex-col md:flex-row gap-8 justify-between items-end mb-16 border-b border-zinc-100 pb-10 text-left text-left">
                <div className="relative w-full md:w-96 group text-left text-left text-left">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-hover:text-red-600 transition-colors text-left text-left text-left" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search SKU or Name..." 
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-sm focus:ring-2 focus:ring-zinc-950 transition-all font-medium text-left text-left text-left"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-left text-left">
                  Showing <span className="text-zinc-950 text-left text-left">{filteredProducts.length}</span> Results
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10 text-left text-left">
                {currentProducts.map((product) => (
                  <div key={product.id} className="group flex flex-col border border-zinc-100 hover:border-zinc-950 transition-all duration-500 bg-white text-left text-left text-left">
                    <div className="aspect-square bg-zinc-100 overflow-hidden relative text-left text-left">
                      <img 
                        src={product.img} 
                        alt={product.name} 
                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 text-left text-left"
                        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1595273670150-db0a3d39074f?q=80&w=400"}
                      />
                      <div className="absolute top-4 left-4 text-left text-left">
                        <span className="bg-zinc-950 text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase text-left text-left">{product.sku}</span>
                      </div>
                      
                      {/* TECHNICAL OVERLAY ON HOVER */}
                      <div className="absolute inset-0 bg-zinc-950/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-between text-white text-left text-left">
                        <div className="space-y-4 text-left text-left">
                          <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase text-left text-left">Technical Specifications</p>
                          <div className="grid grid-cols-2 gap-4 text-[11px] font-medium uppercase tracking-tighter text-left text-left text-left">
                            <div className="opacity-60 text-left text-left">Material</div><div className="text-left text-left">{product.mat}</div>
                            <div className="opacity-60 text-left text-left">Dynamic Load</div><div className="text-left text-left">{product.load}</div>
                            <div className="opacity-60 text-left text-left">Static Load</div><div className="text-left text-left">{product.staticLoad}</div>
                            <div className="opacity-60 text-left text-left">Dimension</div><div className="text-left text-left">{product.dim}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {setSelectedProduct(product); setShowRFQ(true);}}
                          className="w-full py-4 border border-white hover:bg-white hover:text-zinc-950 transition-all font-bold text-[10px] uppercase tracking-widest text-left text-left px-6 text-left"
                        >
                          Request Quotation
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-8 text-left text-left text-left">
                      <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-2 italic leading-none text-left text-left text-left">{product.cat}</p>
                      <h4 className="text-xl font-black tracking-tighter uppercase mb-6 leading-tight group-hover:text-red-600 transition-colors text-left text-left text-left">{product.name}</h4>
                      <div className="flex items-center justify-between pt-6 border-t border-zinc-50 text-left text-left">
                        <div className="flex items-center gap-2 text-zinc-400 text-left text-left">
                          <Scale size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-left text-left text-left">{product.load} Capacity</span>
                        </div>
                        <button 
                          onClick={() => {setSelectedProduct(product); setShowRFQ(true);}}
                          className="p-2 text-zinc-300 hover:text-red-600 transition-colors text-left text-left text-left"
                        >
                          <Maximize2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-4 text-left text-left">
                  <button 
                    onClick={() => {setCurrentPage(p => Math.max(p - 1, 1)); scrollTo('katalog');}} 
                    disabled={currentPage === 1}
                    className="p-4 border border-zinc-100 disabled:opacity-20 hover:bg-zinc-50 transition-all text-left text-left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-2 text-left text-left">
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => {setCurrentPage(i + 1); scrollTo('katalog');}}
                        className={`w-10 h-10 text-[11px] font-bold transition-all ${currentPage === i + 1 ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'} text-left text-left`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => {setCurrentPage(p => Math.min(p + 1, totalPages)); scrollTo('katalog');}} 
                    disabled={currentPage === totalPages}
                    className="p-4 border border-zinc-100 disabled:opacity-20 hover:bg-zinc-50 transition-all text-left text-left"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* STRATEGIC NETWORK */}
      <section id="network" className="py-40 bg-zinc-950 text-white relative overflow-hidden text-left text-left text-left">
        <div className="absolute inset-0 opacity-10 pointer-events-none grid-pattern invert text-left text-left text-left"></div>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10 text-left text-left text-left">
          <SectionTag number="02" title="National Hubs" jp="全国拠点" />
          <div className="grid lg:grid-cols-2 gap-12 text-left text-left text-left text-left">
            {Object.entries(locations).map(([key, loc]) => (
              <div 
                key={key} 
                onClick={() => setActiveMap(key)}
                className="group p-12 bg-white/5 border border-white/10 hover:border-red-600 transition-all duration-700 cursor-pointer relative text-left text-left text-left text-left"
              >
                <div className="flex justify-between items-start mb-12 text-left text-left text-left text-left">
                  <div className="text-left text-left text-left text-left">
                    <p className="text-red-500 text-[10px] font-bold tracking-[0.5em] uppercase mb-4 italic text-left text-left text-left text-left">{loc.city}</p>
                    <h4 className="text-4xl font-black uppercase italic tracking-tighter text-left text-left text-left text-left">{loc.name}</h4>
                  </div>
                  <div className="w-16 h-16 bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-colors text-left text-left text-left text-left">
                    {key === 'jakarta' ? <MapPin /> : <Factory />}
                  </div>
                </div>
                <p className="text-white/40 text-sm font-medium tracking-wide mb-8 text-left text-left text-left text-left">{loc.address}</p>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-left text-left text-left text-left">
                  View On Map <ArrowRight size={14} />
                </div>
                <div className="absolute -bottom-2 -right-2 text-white/5 text-[8rem] font-black select-none pointer-events-none group-hover:text-red-600/5 transition-colors leading-none text-left text-left text-left text-left text-left">
                  {key === 'jakarta' ? 'HQ' : 'MT'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS - Path: src/assets/images/certificates/ */}
      <section className="py-40 bg-white border-b border-zinc-100 text-left text-left text-left">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-left text-left text-left text-left">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 text-left text-left text-left">
            <div className="text-left text-left text-left text-left text-left">
              <SectionTag number="03" title="Compliance & Safety" jp="品質保証" />
              <h3 className="text-5xl font-black uppercase tracking-tighter italic leading-none max-w-lg text-left text-left text-left text-left">Sertifikasi Global <br /> Menjamin Keamanan.</h3>
            </div>
            <p className="text-sm text-zinc-400 font-medium max-w-sm text-right text-right">Standardisasi mutu internasional ISO dan kepatuhan Food Grade di setiap lini produksi kami.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-left text-left text-left text-left">
            {CERTIFICATES.map((cert) => (
              <div key={cert.id} className="group cursor-pointer text-left text-left text-left text-left" onClick={() => setActiveCertificate(cert)}>
                <div className="aspect-[3/4] bg-zinc-100 rounded-sm overflow-hidden mb-6 relative text-left text-left text-left text-left text-left">
                  <img src={cert.img} alt={cert.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 text-left text-left text-left text-left text-left" onError={(e) => e.target.src="https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=600"} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/60 text-left text-left text-left text-left text-left">
                    <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-white text-left text-left text-left text-left text-left"><Maximize2 /></div>
                  </div>
                </div>
                <h5 className="text-lg font-black uppercase tracking-tighter mb-1 text-left text-left text-left text-left text-left">{cert.title}</h5>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-left text-left text-left text-left text-left">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER - Updated with RaalSy Logo & Dark Background */}
      <footer className="bg-[#111] pt-32 pb-16 text-white/40 text-left text-left text-left">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-left text-left text-left text-left">
          <div className="grid lg:grid-cols-4 gap-20 mb-32 text-left text-left text-left text-left">
            <div className="lg:col-span-2 text-left text-left text-left">
              <Logo light className="mb-12 text-left text-left text-left" />
              <p className="text-xl font-medium text-white/60 max-w-md leading-relaxed mb-12 italic text-left text-left text-left">
                “Membangun kekuatan infrastruktur logistik Indonesia dengan presisi plastik grade industri terbaik.”
              </p>
              <div className="flex flex-col gap-6 font-bold uppercase tracking-[0.3em] text-[12px] text-white/80 text-left text-left text-left">
                <a href="tel:+62216324982" className="flex items-center gap-4 hover:text-red-500 transition-colors text-left text-left text-left leading-none text-left text-left">
                  <Phone size={18} className="text-red-600 text-left text-left text-left text-left" /> +62-21 632 4982
                </a>
                <a href="mailto:admin@indragraha.com" className="flex items-center gap-4 hover:text-red-500 transition-colors text-left text-left text-left leading-none text-left text-left text-left text-left">
                  <Mail size={18} className="text-red-600 text-left text-left text-left text-left text-left text-left" /> info@indragraha.com
                </a>
              </div>
            </div>
            <div className="text-left text-left text-left text-left text-left text-left">
              <h5 className="text-white font-black uppercase tracking-widest mb-10 text-[10px] italic underline decoration-red-600 underline-offset-8 text-left text-left text-left text-left text-left text-left text-left">Operasional</h5>
              <div className="space-y-8 text-left text-left text-left text-left text-left text-left">
                <div className="text-left text-left text-left text-left text-left text-left text-left">
                  <p className="text-white font-black text-sm uppercase tracking-tighter mb-2 text-left text-left text-left text-left text-left text-left text-left text-left">Jakarta Headquarters</p>
                  <p className="text-xs leading-relaxed text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Jl. Imam Mahbud No. 34, Gambir, Jakarta Pusat 10140</p>
                </div>
                <div className="text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                  <p className="text-white font-black text-sm uppercase tracking-tighter mb-2 text-left text-left text-left text-left text-left text-left text-left text-left text-left">Manufacturing Hub</p>
                  <p className="text-xs leading-relaxed text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Jl. Raya PLP Curug No. 3, Bitung, Banten</p>
                </div>
              </div>
            </div>
            <div className="text-left text-left text-left text-left text-left text-left text-left text-left">
              <h5 className="text-white font-black uppercase tracking-widest mb-10 text-[10px] italic underline decoration-red-600 underline-offset-8 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Quick Access</h5>
              <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                <li className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><button onClick={() => scrollTo('katalog')} className="hover:text-white transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Technical Catalog</button></li>
                <li className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><button onClick={() => scrollTo('workflow')} className="hover:text-white transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Engineering Protocol</button></li>
                <li className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><button className="hover:text-white transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Sustainability Report</button></li>
                <li className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><button className="hover:text-white transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Partner Program</button></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar - Redesigned to Center with RaalSy Branding */}
          <div className="pt-12 border-t border-white/5 flex flex-col items-center justify-center gap-10 text-[10px] font-black uppercase tracking-[0.5em] text-center">
            <p>© 2026 PT INDRAGRAHA NUSAPLASINDO — ALL RIGHTS RESERVED.</p>
            
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-4 transition-all duration-700">
               <span className="opacity-40 italic tracking-widest text-[8px]">Build By</span>
               <a 
                href="https://raalsy.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative flex items-center justify-center transition-all duration-500 hover:scale-110"
               >
                 <img 
                  src="src/assets/images/logos/raalsy.png" 
                  alt="RaalSy" 
                  className="h-8 w-auto grayscale opacity-40 brightness-200 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-100 transition-all duration-700" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                 />
                 <span className="hidden text-white font-black text-lg tracking-tighter italic opacity-40 group-hover:opacity-100 group-hover:text-red-600 transition-all">RAALSY.</span>
               </a>
            </div>

            <div className="flex gap-12 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              <a href="#" className="hover:text-white transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Catalog PDF</a>
              <a href="#" className="hover:text-white transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Privacy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MAP MODAL */}
      {activeMap && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
          <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" onClick={() => setActiveMap(null)}></div>
          <div className="relative w-full max-w-6xl bg-zinc-950 border border-white/10 overflow-hidden flex flex-col h-[85vh] animate-in zoom-in duration-500 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <div className="flex justify-between items-center p-8 border-b border-white/5 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              <div className="flex items-center gap-6 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-sm text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                  {activeMap === 'jakarta' ? <MapPin /> : <Factory />}
                </div>
                <div className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">{locations[activeMap].name}</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">{locations[activeMap].address}</p>
                </div>
              </div>
              <button onClick={() => setActiveMap(null)} className="text-white/20 hover:text-red-500 transition-all hover:rotate-90 p-4 border border-white/5 rounded-full text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><X size={32} /></button>
            </div>
            <div className="flex-grow bg-zinc-900 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              <iframe title="map" src={locations[activeMap].embed} width="100%" height="100%" style={{ border: 0, filter: 'invert(1) grayscale(1) contrast(1.2)' }} allowFullScreen="" loading="lazy"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE FULL PREVIEW MODAL */}
      {activeCertificate && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500 text-left">
          <div className="absolute inset-0 bg-zinc-950/98 backdrop-blur-3xl text-left" onClick={() => setActiveCertificate(null)}></div>
          <div className="relative w-full max-w-4xl h-full flex flex-col justify-center items-center p-8 animate-in zoom-in duration-700 text-left">
            <button onClick={() => setActiveCertificate(null)} className="absolute top-8 right-8 p-4 text-white/50 hover:text-red-600 transition-all hover:rotate-90 text-left">
              <X size={48} />
            </button>
            <div className="w-full bg-white border-[20px] border-zinc-950 shadow-2xl overflow-hidden aspect-[1/1.4] max-h-screen text-left">
              <img 
                src={activeCertificate.img} 
                className="w-full h-full object-contain p-8 text-left" 
                alt={activeCertificate.title}
                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200"}
              />
            </div>
            <div className="mt-8 text-center text-left text-left">
               <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none text-left text-left">{activeCertificate.title}</h3>
               <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] mt-4 text-left text-left text-left">{activeCertificate.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* RFQ MODAL */}
      {showRFQ && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
          <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" onClick={() => {setShowRFQ(false); setSelectedProduct(null); setIsRFQSubmitted(false);}}></div>
          <div className="relative w-full max-w-7xl bg-white border-8 border-zinc-950 shadow-2xl overflow-hidden animate-in zoom-in duration-700 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <div className="grid lg:grid-cols-12 min-h-[80vh] text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              <div className="lg:col-span-5 bg-zinc-950 p-16 lg:p-24 text-white flex flex-col justify-between relative overflow-hidden text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                <div className="absolute -right-20 -top-20 text-[20rem] font-black text-white/5 italic select-none leading-none text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">RFQ</div>
                <div className="relative z-10 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                  <SectionTag number="PRO-ZEN" title="Request For Quotation" jp="見積依頼" />
                  <h3 className="text-7xl font-black uppercase tracking-tighter italic leading-none mb-12 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Inisiasi <br /><span className="text-red-600 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Proyek.</span></h3>
                  <div className="p-8 border-l-4 border-red-600 bg-white/5 backdrop-blur-sm text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                    <p className="text-sm font-medium leading-relaxed text-white/60 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                      Tim teknis kami akan memproses permintaan Anda dalam waktu maksimal 24 jam kerja. Sertakan rincian spesifikasi untuk akurasi penawaran.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex gap-12 text-[10px] font-black uppercase tracking-widest text-white/30 italic text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                  <span className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">ISO 9001 CERTIFIED</span>
                  <span className="text-red-600 text-left">•</span>
                  <span className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">MADE IN INDONESIA</span>
                </div>
              </div>
              <div className="lg:col-span-7 p-12 lg:p-20 overflow-y-auto max-h-[90vh] custom-scrollbar text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                <div className="flex justify-end mb-12 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                  <button onClick={() => {setShowRFQ(false); setSelectedProduct(null); setIsRFQSubmitted(false);}} className="p-4 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><X size={32} /></button>
                </div>
                
                {isRFQSubmitted ? (
                  // Dummy Notification Success
                  <div className="h-[60vh] flex flex-col justify-center items-center text-center animate-in zoom-in duration-500 text-left">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl animate-bounce text-left text-left">
                      <CheckCircle2 size={48} />
                    </div>
                    <h4 className="text-4xl font-black uppercase tracking-tighter italic mb-4 text-left text-left text-left">Permintaan Terkirim!</h4>
                    <p className="text-zinc-500 text-lg font-bold uppercase tracking-widest max-w-md text-left text-left text-left">
                      Oke baik, tinggal tunggu pesan dari kami ya. Manifest Anda sedang diproses oleh tim engineering.
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedProduct && (
                      <div className="mb-12 p-8 bg-zinc-50 border-l-8 border-zinc-950 flex items-center gap-10 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                        <div className="w-24 h-24 bg-white border border-zinc-200 p-2 overflow-hidden shadow-sm text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                          <img src={selectedProduct.img} className="w-full h-full object-cover grayscale text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" alt="Selected" />
                        </div>
                        <div className="text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 italic leading-none text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Produk Terpilih</p>
                          <p className="text-2xl font-black uppercase tracking-tighter italic leading-tight text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">{selectedProduct.name}</p>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">{selectedProduct.sku}</p>
                        </div>
                      </div>
                    )}

                    <form className="space-y-12 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" onSubmit={handleRFQSubmit}>
                      <div className="grid md:grid-cols-2 gap-12 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                        <div className="space-y-4 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Nama Lengkap</label>
                          <input type="text" className="w-full border-b-2 border-zinc-100 focus:border-red-600 outline-none py-4 text-lg font-bold transition-all uppercase placeholder:text-zinc-200 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" placeholder="RANGGA ALLIFYAN" required />
                        </div>
                        <div className="space-y-4 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Instansi / Perusahaan</label>
                          <input type="text" className="w-full border-b-2 border-zinc-100 focus:border-red-600 outline-none py-4 text-lg font-bold transition-all uppercase placeholder:text-zinc-200 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" placeholder="PT LOGISTIK MAJU JAYA" required />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-12 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                        <div className="space-y-4 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Email Bisnis</label>
                          <input type="email" className="w-full border-b-2 border-zinc-100 focus:border-red-600 outline-none py-4 text-lg font-bold transition-all uppercase placeholder:text-zinc-200 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" placeholder="porto2025@raalsy.com" required />
                        </div>
                        <div className="space-y-4 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Nomor Telepon</label>
                          <input type="tel" className="w-full border-b-2 border-zinc-100 focus:border-red-600 outline-none py-4 text-lg font-bold transition-all uppercase placeholder:text-zinc-200 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" placeholder="+62 821 0000 0000" required />
                        </div>
                      </div>
                      <div className="space-y-4 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Pesan & Spesifikasi Kuantitas</label>
                        <textarea className="w-full border-b-2 border-zinc-100 focus:border-red-600 outline-none py-4 text-lg font-bold transition-all uppercase placeholder:text-zinc-200 h-32 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" placeholder="Sebutkan kuantitas dan detail alamat pengiriman..." required></textarea>
                      </div>
                      <button type="submit" className="w-full py-8 bg-zinc-950 text-white font-black text-sm uppercase tracking-[0.5em] hover:bg-red-600 transition-all shadow-2xl active:scale-95 italic text-left px-10 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                        Submit RFQ Manifest
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;