import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const GERAI_CONFIG = {
  "INDOMARET":       { color: "#e8404a", light: "#fef2f2", label: "Indomaret"        },
  "INDOMARET FRESH": { color: "#16a34a", light: "#f0fdf4", label: "Indomaret Fresh"  },
  "ALFAMART":        { color: "#2563eb", light: "#eff6ff", label: "Alfamart"         },
};
const getCfg = (g) => GERAI_CONFIG[g] || { color: "#7c3aed", light: "#f5f3ff", label: g };

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:13px;height:13px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.28)"></div>`,
    iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });
}

function FitBounds({ data }) {
  const map = useMap();
  useEffect(() => {
    if (data.length > 0)
      map.fitBounds(L.latLngBounds(data.map(d => [d.lat, d.lon])), { padding: [40, 40] });
  }, [data, map]);
  return null;
}

// ─── NAV ICONS ────────────────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconStats = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${accent}` }}>
      <p className="sc-label">{label}</p>
      <p className="sc-value" style={{ color: accent }}>{value}</p>
      {sub && <p className="sc-sub">{sub}</p>}
    </div>
  );
}

// ─── BAR CHART (pure CSS) ─────────────────────────────────────────────────────
function BarChart({ data, color, maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d.value));
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bc-row">
          <span className="bc-label" title={d.label}>{d.label}</span>
          <div className="bc-track">
            <div className="bc-bar"
              style={{ width: `${(d.value / max) * 100}%`, background: color || d.color || "#2563eb" }}
            />
          </div>
          <span className="bc-val">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DONUT CHART (SVG) ────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
  const size = 140, r = 52, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = data.map(d => {
    const pct = d.value / total;
    const seg = { ...d, dash: pct * circ, gap: (1 - pct) * circ, offset };
    offset += pct * circ;
    return seg;
  });
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segs.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="22"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a1f2e" fontFamily="Plus Jakarta Sans">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9.5" fill="#6b7280" fontFamily="Plus Jakarta Sans" fontWeight="600">TOTAL</text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="dl-row">
            <span className="dl-dot" style={{ background: d.color }} />
            <span className="dl-label">{d.label}</span>
            <span className="dl-val">{d.value}</span>
            <span className="dl-pct">{Math.round(d.value/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PAGE: STATISTIK
// ════════════════════════════════════════════════════════════════════════════════
function PageStatistik({ allData }) {
  const byGerai = {};
  const byKec   = {};
  const byStatus = {};
  allData.forEach(d => {
    byGerai[d.gerai]      = (byGerai[d.gerai]      || 0) + 1;
    byKec[d.kecamatan]    = (byKec[d.kecamatan]    || 0) + 1;
    byStatus[d.geo_status]= (byStatus[d.geo_status]|| 0) + 1;
  });

  const geraiData = Object.entries(GERAI_CONFIG).map(([k, v]) => ({
    label: v.label, value: byGerai[k] || 0, color: v.color,
  }));

  const kecData = Object.entries(byKec)
    .sort(([,a],[,b]) => b - a)
    .map(([k, v]) => ({ label: k, value: v }));

  const statusData = [
    { label: "EXACT",      value: byStatus["EXACT"]      || 0, color: "#16a34a" },
    { label: "KELURAHAN",  value: byStatus["KELURAHAN"]  || 0, color: "#ca8a04" },
    { label: "KECAMATAN",  value: byStatus["KECAMATAN"]  || 0, color: "#ea580c" },
    { label: "FAILED",     value: byStatus["FAILED"]     || 0, color: "#dc2626" },
  ].filter(d => d.value > 0);

  const successRate = Math.round(((byStatus["EXACT"] || 0) + (byStatus["KELURAHAN"] || 0)) / allData.length * 100);

  return (
    <div className="page-statistik">
      <div className="page-header">
        <div>
          <h2 className="page-title">Statistik</h2>
          <p className="page-sub">Ringkasan data minimarket Kota Bandung</p>
        </div>
        <div className="header-badge">Data TPBW 2024</div>
      </div>

      {/* Summary cards */}
      <div className="cards-grid">
        <StatCard label="Total Minimarket" value={allData.length} sub="Seluruh gerai" accent="#2563eb" />
        <StatCard label="Indomaret" value={byGerai["INDOMARET"] || 0}
          sub={`${Math.round((byGerai["INDOMARET"]||0)/allData.length*100)}% dari total`} accent="#e8404a" />
        <StatCard label="Alfamart" value={byGerai["ALFAMART"] || 0}
          sub={`${Math.round((byGerai["ALFAMART"]||0)/allData.length*100)}% dari total`} accent="#2563eb" />
        <StatCard label="Indomaret Fresh" value={byGerai["INDOMARET FRESH"] || 0}
          sub="Varian premium" accent="#16a34a" />
        <StatCard label="Kecamatan" value={Object.keys(byKec).length}
          sub="Tersebar di wilayah" accent="#7c3aed" />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Donut */}
        <div className="chart-card">
          <h3 className="chart-title">Distribusi Gerai</h3>
          <DonutChart data={geraiData} total={allData.length} />
        </div>

        {/* Status geocoding */}
        <div className="chart-card">
          <h3 className="chart-title">Status Geocoding</h3>
          <BarChart data={statusData} />
          <p className="chart-note">
            Nominatim query: ALAMAT → KELURAHAN → KECAMATAN (fallback)
          </p>
        </div>

        {/* Per kecamatan */}
        <div className="chart-card wide">
          <h3 className="chart-title">Persebaran per Kecamatan</h3>
          <BarChart data={kecData} color="#2563eb" />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PAGE: PETA
// ════════════════════════════════════════════════════════════════════════════════
function PagePeta({ allData }) {
  const [filtered,    setFiltered]    = useState(allData);
  const [filterKec,   setFilterKec]   = useState("ALL");
  const [filterGerai, setFilterGerai] = useState("ALL");
  const [search,      setSearch]      = useState("");
  const [showCircle,  setShowCircle]  = useState(true);
  const [opacity,     setOpacity]     = useState(0.12);

  const kecList = [...new Set(allData.map(d => d.kecamatan))].sort();
  const byKec   = {};
  allData.forEach(d => { byKec[d.kecamatan] = (byKec[d.kecamatan] || 0) + 1; });

  useEffect(() => {
    let r = allData;
    if (filterKec   !== "ALL") r = r.filter(d => d.kecamatan === filterKec);
    if (filterGerai !== "ALL") r = r.filter(d => d.gerai     === filterGerai);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(d => d.alamat.toLowerCase().includes(q) || d.kelurahan.toLowerCase().includes(q) || d.kecamatan.toLowerCase().includes(q));
    }
    setFiltered(r);
  }, [allData, filterKec, filterGerai, search]);

  const reset = () => { setFilterKec("ALL"); setFilterGerai("ALL"); setSearch(""); };

  return (
    <div className="page-peta">
      {/* ── Filter Panel ── */}
      <div className="map-panel">
        <p className="panel-title">Filter Peta</p>

        <div className="pf-field">
          <label>Cari Alamat / Kelurahan</label>
          <input type="text" placeholder="Ketik nama jalan..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="pf-field">
          <label>Kecamatan</label>
          <select value={filterKec} onChange={e => setFilterKec(e.target.value)}>
            <option value="ALL">Semua Kecamatan</option>
            {kecList.map(k => <option key={k} value={k}>{k} ({byKec[k]})</option>)}
          </select>
        </div>

        <div className="pf-field">
          <label>Gerai</label>
          <div className="gerai-pills">
            {["ALL", ...Object.keys(GERAI_CONFIG)].map(g => {
              const cfg = g === "ALL" ? null : getCfg(g);
              const active = filterGerai === g;
              return (
                <button key={g}
                  className={`pill ${active ? "pill-on" : ""}`}
                  style={active && cfg ? { background: cfg.color, borderColor: cfg.color, color: "#fff" }
                    : cfg ? { borderColor: cfg.color, color: cfg.color } : {}}
                  onClick={() => setFilterGerai(g)}>
                  {g === "ALL" ? "Semua" : getCfg(g).label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pf-field">
          <div className="radius-row">
            <label>Radius 1 km</label>
            <button className={`rad-toggle ${showCircle ? "on" : ""}`}
              onClick={() => setShowCircle(v => !v)}>
              {showCircle ? "ON" : "OFF"}
            </button>
          </div>
          {showCircle && (
            <input type="range" min={0.04} max={0.35} step={0.01}
              value={opacity} onChange={e => setOpacity(+e.target.value)}
              className="op-slider" />
          )}
        </div>

        <button className="reset-filter" onClick={reset}>↺ Reset</button>

        <div className="panel-divider" />

        {/* Legend */}
        <p className="panel-label">Legenda</p>
        {Object.entries(GERAI_CONFIG).map(([k, v]) => (
          <div key={k} className="leg-item">
            <span className="leg-dot" style={{ background: v.color }} />
            <span>{v.label}</span>
          </div>
        ))}

        <div className="panel-divider" />
        <p className="panel-label">Menampilkan</p>
        <p className="showing-num">{filtered.length} <span>dari {allData.length} lokasi</span></p>
      </div>

      {/* ── Map ── */}
      <div className="map-container">
        <MapContainer center={[-6.9175, 107.6191]} zoom={12}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}>

          {/* CartoDB Positron — bersih & minimal */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          <FitBounds data={filtered} />

          {filtered.map(d => {
            const cfg = getCfg(d.gerai);
            return (
              <div key={d.id}>
                {showCircle && (
                  <Circle center={[d.lat, d.lon]} radius={1000}
                    pathOptions={{ color: cfg.color, fillColor: cfg.color,
                      fillOpacity: opacity, weight: 1.5, opacity: 0.5 }} />
                )}
                <Marker position={[d.lat, d.lon]} icon={makeIcon(cfg.color)}>
                  <Popup maxWidth={240}>
                    <div className="mpopup">
                      <div className="mpop-head" style={{ background: cfg.light, borderLeft: `4px solid ${cfg.color}` }}>
                        <strong style={{ color: cfg.color }}>{d.gerai}</strong>
                      </div>
                      <div className="mpop-body">
                        <div className="mpop-row"><span>📍</span><span>{d.alamat}</span></div>
                        <div className="mpop-row"><span>🏘️</span><span>{d.kelurahan}</span></div>
                        <div className="mpop-row"><span>🗺️</span><span>Kec. {d.kecamatan}</span></div>
                        <div className="mpop-row"><span>🎯</span>
                          <span className={`pop-badge ${d.geo_status?.toLowerCase()}`}>{d.geo_status}</span>
                        </div>
                      </div>
                      <p className="mpop-coord">{d.lat?.toFixed(6)}, {d.lon?.toFixed(6)}</p>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ROOT APP — Dashboard shell
// ════════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page,    setPage]    = useState("home");
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("./data_minimarket.json").then(r => r.json()).then(d => {
      setAllData(d); setLoading(false);
    });
  }, []);

  const byGerai = {};
  allData.forEach(d => { byGerai[d.gerai] = (byGerai[d.gerai] || 0) + 1; });

  const navItems = [
    { id: "home",      label: "Beranda",    icon: <IconHome /> },
    { id: "statistik", label: "Statistik",  icon: <IconStats /> },
    { id: "peta",      label: "Peta",       icon: <IconMap /> },
  ];

  return (
    <div className="shell">
      {/* ══ SIDEBAR NAV ══ */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="brand-icon">🏪</div>
          <div className="brand-text">
            <span className="brand-name">MiniMap</span>
            <span className="brand-sub">TPBW Bandung</span>
          </div>
        </div>

        <div className="nav-items">
          {navItems.map(n => (
            <button key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}>
              <span className="ni-icon">{n.icon}</span>
              <span className="ni-label">{n.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-footer">
          <div className="nf-dot" />
          <span>Data TPBW</span>
        </div>
      </nav>

      {/* ══ MAIN AREA ══ */}
      <div className="main">
        {loading ? (
          <div className="splash">
            <div className="splash-spinner" />
            <p>Memuat data...</p>
          </div>
        ) : (
          <>
            {page === "home" && (
              <div className="page-home">
                <div className="home-hero">
                  <h1>Dashboard Minimarket</h1>
                  <p>Sistem informasi sebaran gerai minimarket Kota Bandung berdasarkan data TPBW</p>
                </div>

                <div className="home-cards">
                  <button className="hc" onClick={() => setPage("statistik")}>
                    <div className="hc-icon" style={{ background: "#eff6ff" }}>
                      <IconStats />
                    </div>
                    <div>
                      <p className="hc-title">Statistik</p>
                      <p className="hc-desc">Distribusi gerai, persebaran kecamatan, dan status geocoding</p>
                    </div>
                    <span className="hc-arrow">→</span>
                  </button>
                  <button className="hc" onClick={() => setPage("peta")}>
                    <div className="hc-icon" style={{ background: "#f0fdf4" }}>
                      <IconMap />
                    </div>
                    <div>
                      <p className="hc-title">Peta Persebaran</p>
                      <p className="hc-desc">Visualisasi titik lokasi dan radius 1km per gerai minimarket</p>
                    </div>
                    <span className="hc-arrow">→</span>
                  </button>
                </div>

                <div className="home-summary">
                  {Object.entries(GERAI_CONFIG).map(([k, v]) => (
                    <div key={k} className="hs-item" style={{ borderLeft: `4px solid ${v.color}` }}>
                      <span className="hs-num" style={{ color: v.color }}>{byGerai[k] || 0}</span>
                      <span className="hs-label">{v.label}</span>
                    </div>
                  ))}
                  <div className="hs-item" style={{ borderLeft: "4px solid #7c3aed" }}>
                    <span className="hs-num" style={{ color: "#7c3aed" }}>{allData.length}</span>
                    <span className="hs-label">Total Lokasi</span>
                  </div>
                </div>
              </div>
            )}
            {page === "statistik" && <PageStatistik allData={allData} />}
            {page === "peta"      && <PagePeta      allData={allData} />}
          </>
        )}
      </div>
    </div>
  );
}
