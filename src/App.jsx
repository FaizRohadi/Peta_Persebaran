import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { T } from "./i18n.js";

// ─── Leaflet icon fix ─────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── Gerai config ─────────────────────────────────────────────────────────
const GERAI_CONFIG = {
  "INDOMARET":       { color:"#e8404a", bg:"#fef2f2", label:"Indomaret",        tag:"indomaret"       },
  "ALFAMART":        { color:"#2563eb", bg:"#eff6ff", label:"Alfamart",         tag:"alfamart"        },
  "YOMART":          { color:"#f97316", bg:"#fff7ed", label:"Yomart",           tag:"yomart"          },
  "LAWSON":          { color:"#0891b2", bg:"#ecfeff", label:"Lawson",           tag:"lawson"          },
  "CIRCLE K":        { color:"#7c3aed", bg:"#f5f3ff", label:"Circle K",        tag:"circlek"         },
  "INDOMARET FRESH": { color:"#16a34a", bg:"#f0fdf4", label:"Indomaret Fresh",  tag:"indomaretfresh"  },
};
const getCfg = (g) => GERAI_CONFIG[g] || { color:"#6b7280", bg:"#f9fafb", label:g, tag:"other" };

// ─── Gerai profiles (photos + metadata) ──────────────────────────────────
const GERAI_PROFILES = [
  {
    key: "INDOMARET",
    img: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
    imgFallback: "https://placehold.co/800x360/fee2e2/e8404a?text=Indomaret",
    founded: 1988, national: "21.000+",
    tagKeys: ["Swalayan|Self-service","Waralaba|Franchise","24 Jam|24 Hours","Salim Group|Salim Group"],
    descKey: "indomaret_desc",
  },
  {
    key: "ALFAMART",
    img: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80",
    imgFallback: "https://placehold.co/800x360/dbeafe/2563eb?text=Alfamart",
    founded: 1999, national: "17.000+",
    tagKeys: ["AlfaGift|AlfaGift","Waralaba|Franchise","24 Jam|24 Hours","Tbk Listed|Tbk Listed"],
    descKey: "alfamart_desc",
  },
  {
    key: "YOMART",
    img: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
    imgFallback: "https://placehold.co/800x360/ffedd5/f97316?text=Yomart",
    founded: 2003, national: "300+",
    tagKeys: ["Lokal Jabar|Local West Java","Komunitas|Community","Terjangkau|Affordable","Bandung|Bandung"],
    descKey: "yomart_desc",
  },
  {
    key: "LAWSON",
    img: "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=800&q=80",
    imgFallback: "https://placehold.co/800x360/cffafe/0891b2?text=Lawson",
    founded: 2011, national: "700+",
    tagKeys: ["Japan Style|Japan Style","Ready-to-Eat|Ready-to-Eat","Onigiri|Onigiri","Premium|Premium"],
    descKey: "lawson_desc",
  },
  {
    key: "CIRCLE K",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    imgFallback: "https://placehold.co/800x360/ede9fe/7c3aed?text=Circle+K",
    founded: 1986, national: "300+",
    tagKeys: ["International|International","24 Jam|24 Hours","Couche-Tard|Couche-Tard","Frozone|Frozone"],
    descKey: "circlek_desc",
  },
  {
    key: "INDOMARET FRESH",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    imgFallback: "https://placehold.co/800x360/dcfce7/16a34a?text=Indomaret+Fresh",
    founded: 2015, national: "100+",
    tagKeys: ["Premium|Premium","Fresh Produce|Fresh Produce","Bakery|Bakery","Modern|Modern"],
    descKey: "indomaretfresh_desc",
  },
];

// ─── Haversine ────────────────────────────────────────────────────────────
function haversine(lat1,lon1,lat2,lon2) {
  const R=6371, dL=(lat2-lat1)*Math.PI/180, dO=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
const fmtDist = (km) => km<1 ? `${Math.round(km*1000)} m` : `${km.toFixed(2)} km`;

// ─── Leaflet icons ────────────────────────────────────────────────────────
function makeStoreIcon(color, big=false) {
  const s = big?17:12;
  return L.divIcon({
    className:"",
    html:`<div style="width:${s}px;height:${s}px;border-radius:50%;background:${color};border:${big?3:2}px solid #fff;box-shadow:0 2px ${big?12:6}px rgba(0,0,0,0.3)"></div>`,
    iconSize:[s,s], iconAnchor:[s/2,s/2], popupAnchor:[0,-s/2-2],
  });
}
function makeUserIcon() {
  return L.divIcon({
    className:"",
    html:`<div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 10px rgba(59,130,246,0.6)"></div>
      <div style="position:absolute;inset:-7px;border-radius:50%;background:rgba(59,130,246,0.15);animation:userPulse 2s infinite"></div>
    </div>`,
    iconSize:[20,20], iconAnchor:[10,10], popupAnchor:[0,-14],
  });
}

// ─── Map helpers ──────────────────────────────────────────────────────────
function FitBounds({data}) {
  const map=useMap();
  useEffect(()=>{ if(data.length>0) map.fitBounds(L.latLngBounds(data.map(d=>[d.lat,d.lon])),{padding:[40,40]}); },[data,map]);
  return null;
}
function FlyToUser({pos}) {
  const map=useMap();
  useEffect(()=>{ if(pos) map.flyTo([pos.lat,pos.lon],15,{duration:1.2}); },[pos,map]);
  return null;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────
const IcoHome   = ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoMap    = ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IcoStats  = ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoTarget = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>;
const IcoWalk   = ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7l-3 6 3 2 1 5M9 7l5 1 2 5"/></svg>;

// ─── Language Toggle ──────────────────────────────────────────────────────
function LangToggle({lang, setLang}) {
  return (
    <div className="lang-toggle">
      <button className={lang==="id"?"lt-active":""} onClick={()=>setLang("id")}>🇮🇩 ID</button>
      <button className={lang==="en"?"lt-active":""} onClick={()=>setLang("en")}>🇬🇧 EN</button>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({data,total}) {
  const r=52,cx=70,cy=70,circ=2*Math.PI*r;
  let off=0;
  const segs=data.map(d=>{const p=d.value/total;const s={...d,dash:p*circ,offset:off};off+=p*circ;return s;});
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {segs.map((s,i)=><circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="22"
          strokeDasharray={`${s.dash} ${circ-s.dash}`} strokeDashoffset={-s.offset} transform={`rotate(-90 ${cx} ${cy})`}/>)}
        <text x={cx} y={cy-6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a1f2e" fontFamily="Plus Jakarta Sans">{total}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="Plus Jakarta Sans" fontWeight="600">TOTAL</text>
      </svg>
      <div className="donut-legend">
        {data.map((d,i)=>(
          <div key={i} className="dl-row">
            <span className="dl-dot" style={{background:d.color}}/>
            <span className="dl-label">{d.label}</span>
            <span className="dl-val">{d.value}</span>
            <span className="dl-pct">{Math.round(d.value/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function BarChart({data,color}) {
  const max=Math.max(...data.map(d=>d.value),1);
  return (
    <div className="bar-chart">
      {data.map((d,i)=>(
        <div key={i} className="bc-row">
          <span className="bc-label" title={d.label}>{d.label}</span>
          <div className="bc-track"><div className="bc-bar" style={{width:`${(d.value/max)*100}%`,background:color||d.color||"#2563eb"}}/></div>
          <span className="bc-val">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
function StatCard({label,value,sub,accent}) {
  return (
    <div className="stat-card" style={{borderTop:`3px solid ${accent}`}}>
      <p className="sc-label">{label}</p>
      <p className="sc-value" style={{color:accent}}>{value}</p>
      {sub && <p className="sc-sub">{sub}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ════════════════════════════════════════════════════════════════════════════
function Landing({allData, onNavigate, lang}) {
  const t = T[lang];
  const byGerai={};
  allData.forEach(d=>{byGerai[d.gerai]=(byGerai[d.gerai]||0)+1;});
  const districts = [...new Set(allData.map(d=>d.kecamatan))].length;

  return (
    <div className="landing">

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg-pattern"/>
        <div className="hero-content">
          <span className="hero-badge">{t.hero_badge}</span>
          <h1 className="hero-h1">{t.hero_title_1}<br/><span className="hero-gradient">{t.hero_title_2}</span></h1>
          <p className="hero-p">{t.hero_sub}</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={()=>onNavigate("peta")}><IcoMap/>{t.hero_btn_map}</button>
            <button className="btn-outline" onClick={()=>onNavigate("statistik")}><IcoStats/>{t.hero_btn_stats}</button>
          </div>
          <div className="hero-stats">
            {[
              {val:allData.length, label:t.total_locations},
              {val:byGerai["INDOMARET"]||0, label:"Indomaret"},
              {val:byGerai["ALFAMART"]||0,  label:"Alfamart"},
              {val:byGerai["YOMART"]||0,    label:"Yomart"},
              {val:byGerai["CIRCLE K"]||0,  label:"Circle K"},
              {val:byGerai["LAWSON"]||0,    label:"Lawson"},
              {val:districts, label:t.total_districts},
            ].map((s,i)=>(
              <div key={i} className="hs-chip">
                <span className="hs-num">{s.val}</span>
                <span className="hs-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APA ITU MINIMARKET ── */}
      <section className="land-section alt-bg">
        <div className="land-inner">
          <div className="section-head">
            <h2>{t.section_what}</h2>
            <p>{t.section_what_sub}</p>
          </div>
          <p className="what-intro">{t.what_intro}</p>
          <div className="what-grid">
            {[
              {icon:"🕐", title:t.feat_hours,    desc:t.feat_hours_d},
              {icon:"📦", title:t.feat_products,  desc:t.feat_products_d},
              {icon:"💳", title:t.feat_payment,   desc:t.feat_payment_d},
              {icon:"📍", title:t.feat_location,  desc:t.feat_location_d},
            ].map((f,i)=>(
              <div key={i} className="what-card">
                <span className="wc-icon">{f.icon}</span>
                <strong>{f.title}</strong>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFIL GERAI ── */}
      <section className="land-section">
        <div className="land-inner">
          <div className="section-head">
            <h2>{t.section_gerai}</h2>
            <p>{t.section_gerai_sub}</p>
          </div>
          <div className="gerai-grid">
            {GERAI_PROFILES.map(p=>{
              const cfg=getCfg(p.key);
              const tagPair = (s) => lang==="en" ? s.split("|")[1] : s.split("|")[0];
              return (
                <div key={p.key} className="gc">
                  <div className="gc-img-wrap">
                    <img src={p.img} alt={cfg.label} className="gc-img"
                      onError={e=>{e.target.src=p.imgFallback;}}/>
                    <div className="gc-img-ov" style={{background:`linear-gradient(to top,${cfg.color}cc 0%,transparent 55%)`}}>
                      <span className="gc-badge" style={{background:cfg.color}}>{cfg.label}</span>
                    </div>
                  </div>
                  <div className="gc-body">
                    <div className="gc-stats">
                      <div><b>{byGerai[p.key]||0}</b><span>{t.stores_bandung}</span></div>
                      <div><b>{p.founded}</b><span>{t.year_founded}</span></div>
                      <div><b>{p.national}</b><span>{t.national_stores}</span></div>
                    </div>
                    <p className="gc-desc">{t[p.descKey]}</p>
                    <div className="gc-tags">
                      {p.tagKeys.map((tk,i)=>(
                        <span key={i} style={{background:cfg.bg,color:cfg.color}}>{tagPair(tk)}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EXPLORE ── */}
      <section className="land-section alt-bg">
        <div className="land-inner">
          <div className="section-head"><h2>{t.section_explore}</h2></div>
          <div className="explore-cards">
            <button className="exp-card" onClick={()=>onNavigate("peta")}>
              <div className="exp-icon" style={{background:"#f0fdf4",color:"#16a34a"}}><IcoMap/></div>
              <div><p className="exp-title">{t.explore_map_title}</p><p className="exp-desc">{t.explore_map_desc}</p></div>
              <span className="exp-arr">→</span>
            </button>
            <button className="exp-card" onClick={()=>onNavigate("statistik")}>
              <div className="exp-icon" style={{background:"#eff6ff",color:"#2563eb"}}><IcoStats/></div>
              <div><p className="exp-title">{t.explore_stats_title}</p><p className="exp-desc">{t.explore_stats_desc}</p></div>
              <span className="exp-arr">→</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="land-footer">
        <p>© 2026 Dashboard Minimarket TPBW — Kota Bandung</p>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STATISTICS PAGE
// ════════════════════════════════════════════════════════════════════════════
function PageStats({allData, lang}) {
  const t=T[lang];
  const byGerai={},byKec={},byStatus={};
  allData.forEach(d=>{
    byGerai[d.gerai]=(byGerai[d.gerai]||0)+1;
    byKec[d.kecamatan]=(byKec[d.kecamatan]||0)+1;
    byStatus[d.geo_status]=(byStatus[d.geo_status]||0)+1;
  });
  const geraiData=Object.entries(GERAI_CONFIG).map(([k,v])=>({label:v.label,value:byGerai[k]||0,color:v.color}));
  const kecData=Object.entries(byKec).sort(([,a],[,b])=>b-a).map(([k,v])=>({label:k,value:v}));
  const statusData=[
    {label:"EXACT",value:byStatus["EXACT"]||0,color:"#16a34a"},
    {label:"KELURAHAN",value:byStatus["KELURAHAN"]||0,color:"#ca8a04"},
    {label:"KECAMATAN",value:byStatus["KECAMATAN"]||0,color:"#ea580c"},
    {label:"FAILED",value:byStatus["FAILED"]||0,color:"#dc2626"},
  ].filter(d=>d.value>0);
  const okPct=Math.round(((byStatus["EXACT"]||0)+(byStatus["KELURAHAN"]||0))/allData.length*100);

  return (
    <div className="dash-page stats-page">
      <div className="page-hdr">
        <div><h2>{t.stats_title}</h2><p>{t.stats_sub}</p></div>
        <span className="hdr-badge">TPBW 2026</span>
      </div>
      <div className="cards-grid">
        <StatCard label={t.stats_total}   value={allData.length}               sub={t.stats_all}              accent="#2563eb"/>
        <StatCard label="Indomaret"        value={byGerai["INDOMARET"]||0}       sub={`${Math.round((byGerai["INDOMARET"]||0)/allData.length*100)}%`} accent="#e8404a"/>
        <StatCard label="Alfamart"         value={byGerai["ALFAMART"]||0}        sub={`${Math.round((byGerai["ALFAMART"]||0)/allData.length*100)}%`}  accent="#2563eb"/>
        <StatCard label="Yomart"           value={byGerai["YOMART"]||0}          sub={t.stats_spread}           accent="#f97316"/>
        <StatCard label="Circle K"         value={byGerai["CIRCLE K"]||0}        sub={t.stats_spread}           accent="#7c3aed"/>
        <StatCard label="Lawson"           value={byGerai["LAWSON"]||0}          sub={t.stats_premium}          accent="#0891b2"/>
        <StatCard label="Indomaret Fresh"  value={byGerai["INDOMARET FRESH"]||0} sub={t.stats_premium}          accent="#16a34a"/>
        <StatCard label={t.stats_geocode}  value={`${okPct}%`}                   sub={`${byStatus["EXACT"]||0} ${t.stats_exact}`} accent="#16a34a"/>
        <StatCard label={lang==="id"?"Kecamatan":"Districts"} value={Object.keys(byKec).length} sub={t.stats_spread} accent="#7c3aed"/>
      </div>
      <div className="charts-row3">
        <div className="chart-card"><h3>{t.stats_dist_gerai}</h3><DonutChart data={geraiData} total={allData.length}/></div>
        <div className="chart-card"><h3>{t.stats_geocode_status}</h3><BarChart data={statusData}/><p className="chart-note">{t.stats_query_note}</p></div>
        <div className="chart-card"><h3>{t.stats_per_kec}</h3><BarChart data={kecData} color="#2563eb"/></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAP PAGE
// ════════════════════════════════════════════════════════════════════════════
function PageMap({allData, lang}) {
  const t=T[lang];
  const [filtered,    setFiltered]    = useState(allData);
  const [filterKec,   setFilterKec]   = useState("ALL");
  const [filterGerai, setFilterGerai] = useState("ALL");
  const [search,      setSearch]      = useState("");
  const [showCircle,  setShowCircle]  = useState(true);
  const [opacity,     setOpacity]     = useState(0.1);
  const [userPos,     setUserPos]     = useState(null);
  const [tracking,    setTracking]    = useState(false);
  const [trackErr,    setTrackErr]    = useState(null);
  const [nearbyList,  setNearbyList]  = useState([]);
  const [flyTo,       setFlyTo]       = useState(null);
  const watchRef = useRef(null);

  const kecList=[...new Set(allData.map(d=>d.kecamatan))].sort();
  const byKec={};
  allData.forEach(d=>{byKec[d.kecamatan]=(byKec[d.kecamatan]||0)+1;});
  
  useEffect(()=>{
    let r=allData;
    if(filterKec!=="ALL") r=r.filter(d=>d.kecamatan===filterKec);
    if(filterGerai!=="ALL") r=r.filter(d=>d.gerai===filterGerai);
    if(search){const q=search.toLowerCase();r=r.filter(d=>d.alamat.toLowerCase().includes(q)||d.kelurahan.toLowerCase().includes(q)||d.kecamatan.toLowerCase().includes(q));}
    setFiltered(r);
  },[allData,filterKec,filterGerai,search]);

  useEffect(()=>{
    if(!userPos) return;
    const w=allData.map(d=>({...d,dist:haversine(userPos.lat,userPos.lon,d.lat,d.lon)})).sort((a,b)=>a.dist-b.dist);
    setNearbyList(w.slice(0,8));
  },[userPos,allData]);

  const startTracking=useCallback(()=>{
    if(!navigator.geolocation){setTrackErr(t.track_err);return;}
    setTrackErr(null);setTracking(true);
    watchRef.current=navigator.geolocation.watchPosition(
      pos=>{const p={lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy};setUserPos(p);setFlyTo(p);},
      ()=>{setTrackErr(t.track_err);setTracking(false);},
      {enableHighAccuracy:true,maximumAge:5000}
    );
  },[t]);
  const stopTracking=useCallback(()=>{
    if(watchRef.current!=null) navigator.geolocation.clearWatch(watchRef.current);
    setTracking(false);setUserPos(null);setNearbyList([]);setFlyTo(null);
  },[]);

  const markersData=filtered.map(d=>({...d,dist:userPos?haversine(userPos.lat,userPos.lon,d.lat,d.lon):null}));

  return (
    <div className="page-peta">
      <div className="map-panel">

        {/* Tracking */}
        <div className="track-section">
          <p className="panel-title">📡 {t.track_title}</p>
          {!tracking
            ? <button className="track-btn on" onClick={startTracking}><IcoTarget/>{t.track_start}</button>
            : <button className="track-btn off" onClick={stopTracking}>{t.track_stop}</button>}
          {trackErr && <p className="track-err">{trackErr}</p>}
          {userPos && <div className="user-info"><div><span>📍</span><span>{userPos.lat.toFixed(5)}, {userPos.lon.toFixed(5)}</span></div><div><span>🎯</span><span>{t.track_accuracy} ±{Math.round(userPos.acc||0)} m</span></div></div>}
        </div>

        {nearbyList.length>0 && (
          <div className="nearby-sec">
            <p className="panel-label">{t.track_nearest}</p>
            {nearbyList.map((d,i)=>{
              const cfg=getCfg(d.gerai);
              return (
                <div key={d.id} className={`nb-item ${i===0?"nb-first":""}`}>
                  <div className="nb-rank" style={{background:i===0?cfg.color:"#f3f4f6",color:i===0?"#fff":"#9ca3af"}}>{i===0?"★":i+1}</div>
                  <div className="nb-body">
                    <p style={{color:cfg.color,fontWeight:700,fontSize:"0.7rem"}}>{cfg.label}</p>
                    <p className="nb-addr">{d.alamat}</p>
                    <p className="nb-kel">{d.kelurahan}</p>
                  </div>
                  <div className="nb-dist">
                    <span style={{color:i===0?cfg.color:"#374151",fontWeight:800,fontSize:"0.75rem"}}>{fmtDist(d.dist)}</span>
                    <span className="nb-walk"><IcoWalk/>~{Math.round(d.dist*1000/80)} {t.track_walk}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="divider"/>

        {/* Filters */}
        <p className="panel-title">{t.map_filter}</p>
        <div className="pf">
          <label>{t.map_search}</label>
          <input type="text" placeholder={t.map_search_ph} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="pf">
          <label>{t.map_kec}</label>
          <select value={filterKec} onChange={e=>setFilterKec(e.target.value)}>
            <option value="ALL">{t.map_kec_all}</option>
            {kecList.map(k=><option key={k} value={k}>{k} ({byKec[k]})</option>)}
          </select>
        </div>
        <div className="pf">
          <label>{t.map_gerai}</label>
          <div className="g-pills">
            {["ALL",...Object.keys(GERAI_CONFIG)].map(g=>{
              const cfg=g==="ALL"?null:getCfg(g);
              const active=filterGerai===g;
              return (
                <button key={g} className={`pill ${active?"pill-on":""}`}
                  style={active&&cfg?{background:cfg.color,borderColor:cfg.color,color:"#fff"}:cfg?{borderColor:cfg.color,color:cfg.color}:{}}
                  onClick={()=>setFilterGerai(g)}>
                  {g==="ALL"?t.map_gerai_all:getCfg(g).label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="pf">
          <div className="radius-row">
            <label>{t.map_radius}</label>
            <button className={`rad-tog ${showCircle?"on":""}`} onClick={()=>setShowCircle(v=>!v)}>{showCircle?"ON":"OFF"}</button>
          </div>
          {showCircle && <input type="range" min={0.04} max={0.35} step={0.01} value={opacity} onChange={e=>setOpacity(+e.target.value)} className="op-slider"/>}
        </div>
        <button className="reset-btn" onClick={()=>{setFilterKec("ALL");setFilterGerai("ALL");setSearch("");}}>{t.map_reset}</button>

        <div className="divider"/>
        <p className="panel-label">{t.map_legend}</p>
        <div className="leg-item"><span className="leg-dot" style={{background:"#3b82f6"}}/><span>{lang==="id"?"Lokasi Anda":"Your Location"}</span></div>
        {Object.entries(GERAI_CONFIG).map(([k,v])=>(
          <div key={k} className="leg-item"><span className="leg-dot" style={{background:v.color}}/><span>{v.label}</span></div>
        ))}
        <div className="divider"/>
        <p className="showing-count">{filtered.length} <span>{t.map_showing} {allData.length} {t.map_locations}</span></p>
      </div>

      {/* Map */}
      <div className="map-wrap">
        <MapContainer center={[-6.9175,107.6191]} zoom={12} style={{width:"100%",height:"100%"}} zoomControl={false}>
          <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={19}/>
          <FitBounds data={filtered}/>
          {flyTo && <FlyToUser pos={flyTo}/>}
          {userPos && (<>
            <Marker position={[userPos.lat,userPos.lon]} icon={makeUserIcon()}>
              <Popup><div className="pop"><strong style={{color:"#3b82f6"}}>📍 {lang==="id"?"Lokasi Anda":"Your Location"}</strong></div></Popup>
            </Marker>
            <Circle center={[userPos.lat,userPos.lon]} radius={userPos.acc||50}
              pathOptions={{color:"#3b82f6",fillColor:"#3b82f6",fillOpacity:0.1,weight:1.5,opacity:0.5,dashArray:"4"}}/>
          </>)}
          {markersData.map(d=>{
            const cfg=getCfg(d.gerai);
            const isNearest=nearbyList.length>0&&nearbyList[0].id===d.id;
            return (
              <div key={d.id}>
                {showCircle && <Circle center={[d.lat,d.lon]} radius={1000}
                  pathOptions={{color:cfg.color,fillColor:cfg.color,fillOpacity:isNearest?opacity*2.5:opacity,weight:isNearest?2.5:1.5,opacity:isNearest?0.9:0.5}}/>}
                <Marker position={[d.lat,d.lon]} icon={makeStoreIcon(cfg.color,isNearest)}>
                  <Popup maxWidth={250}>
                    <div className="pop">
                      <div className="pop-hd" style={{background:cfg.bg,borderLeft:`4px solid ${cfg.color}`}}>
                        <strong style={{color:cfg.color}}>{isNearest?"⭐ "+d.gerai:d.gerai}</strong>
                      </div>
                      <div className="pop-bd">
                        <div className="pop-row"><span>📍</span><span>{d.alamat}</span></div>
                        <div className="pop-row"><span>🏘️</span><span>{d.kelurahan}</span></div>
                        <div className="pop-row"><span>🗺️</span><span>Kec. {d.kecamatan}</span></div>
                        {d.dist!=null && <div className="pop-row"><span>🚶</span><span style={{color:cfg.color,fontWeight:700}}>{fmtDist(d.dist)} {t.track_dist_popup} (~{Math.round(d.dist*1000/80)} {t.track_walk})</span></div>}
                      </div>
                      <p className="pop-coord">{d.lat?.toFixed(6)}, {d.lon?.toFixed(6)}</p>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
        {tracking && <div className="live-badge"><span className="lb-dot"/>LIVE</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD SHELL (Map + Stats branch)
// ════════════════════════════════════════════════════════════════════════════
function Dashboard({allData, initPage, onBack, lang, setLang}) {
  const [page, setPage] = useState(initPage||"peta");
  const t = T[lang];
  return (
    <div className="shell">
      <nav className="dash-nav">
        <div className="dn-top">
          <button className="back-btn" onClick={onBack}>← {t.nav_home}</button>
          <div className="dn-brand">🏪 MiniMap</div>
        </div>
        <div className="dn-items">
          <button className={`dn-item ${page==="peta"?"active":""}`} onClick={()=>setPage("peta")}>
            <IcoMap/><span>{t.nav_map}</span>
          </button>
          <button className={`dn-item ${page==="statistik"?"active":""}`} onClick={()=>setPage("statistik")}>
            <IcoStats/><span>{t.nav_stats}</span>
          </button>
        </div>
        <LangToggle lang={lang} setLang={setLang}/>
      </nav>
      <div className="dash-main">
        {page==="peta"      && <PageMap   allData={allData} lang={lang}/>}
        {page==="statistik" && <PageStats allData={allData} lang={lang}/>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view,    setView]    = useState("landing");  // "landing" | "dashboard"
  const [initTab, setInitTab] = useState("peta");
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang,    setLang]    = useState("id");

  useEffect(()=>{
    fetch("./data_minimarket.json").then(r=>r.json()).then(d=>{setAllData(d);setLoading(false);});
  },[]);

  const goTo = (tab) => { setInitTab(tab); setView("dashboard"); };

  if(loading) return (
    <div className="splash"><div className="splash-spin"/><p>Memuat data...</p></div>
  );

  if(view==="dashboard") return (
    <Dashboard allData={allData} initPage={initTab} onBack={()=>setView("landing")} lang={lang} setLang={setLang}/>
  );

  return (
    <div className="landing-shell">
      {/* Landing Navbar */}
      <header className="land-nav">
        <div className="ln-brand">🏪 <strong>MiniMap</strong></div>
        <nav className="ln-links">
          <button onClick={()=>goTo("peta")}>Peta</button>
          <button onClick={()=>goTo("statistik")}>Statistik</button>
        </nav>
        <LangToggle lang={lang} setLang={setLang}/>
      </header>
      <Landing allData={allData} onNavigate={goTo} lang={lang}/>
    </div>
  );
}
