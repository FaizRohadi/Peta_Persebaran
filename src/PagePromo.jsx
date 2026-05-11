import { useState } from "react";
import { T } from "./i18n.js";
import { PROMOS, GERAI_WEBSITES, BADGE_COLORS } from "./promos.js";

const GERAI_CONFIG = {
  "INDOMARET": { color:"#e8404a", bg:"#fef2f2", label:"Indomaret"  },
  "ALFAMART":  { color:"#2563eb", bg:"#eff6ff", label:"Alfamart"   },
  "YOMART":    { color:"#f97316", bg:"#fff7ed", label:"Yomart"     },
  "LAWSON":    { color:"#0891b2", bg:"#ecfeff", label:"Lawson"     },
  "CIRCLE K":  { color:"#7c3aed", bg:"#f5f3ff", label:"Circle K"  },
};

const IcoExt = ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IcoApp  = ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IcoTag  = ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;

function PromoCard({ promo, lang, gerai }) {
  const [open, setOpen] = useState(false);
  const cfg   = GERAI_CONFIG[gerai] || {};
  const badge = BADGE_COLORS[promo.type] || BADGE_COLORS.special;
  const title   = lang==="en" ? promo.title_en   : promo.title_id;
  const period  = lang==="en" ? promo.period_en  : promo.period_id;
  const desc    = lang==="en" ? promo.desc_en    : promo.desc_id;
  const items   = lang==="en" ? promo.items_en   : promo.items_id;
  const t       = T[lang];

  return (
    <div className="promo-card">
      <div className="pc-header" onClick={()=>setOpen(v=>!v)}>
        <div className="pc-header-left">
          <span className="pc-badge" style={{background:badge.bg, color:badge.color}}>
            <IcoTag/> {lang==="en"? BADGE_COLORS[promo.type]?.label : badge.label}
          </span>
          <h4 className="pc-title">{title}</h4>
          <p className="pc-period">📅 {period}</p>
        </div>
        <div className="pc-header-right">
          <span className="pc-highlight" style={{background:cfg.bg, color:cfg.color}}>
            {promo.highlight}
          </span>
          <button className="pc-toggle">{open?"▲":"▼"}</button>
        </div>
      </div>
      {open && (
        <div className="pc-body">
          <p className="pc-desc">{desc}</p>
          {items?.length > 0 && (
            <div className="pc-items">
              <p className="pc-items-label"><IcoTag/> {t.promo_items}</p>
              <ul>
                {items.map((item, i) => (
                  <li key={i}>
                    <span className="pc-dot" style={{background:cfg.color}}/>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GeraiPromoSection({ gerai, data, lang, allData }) {
  const cfg  = GERAI_CONFIG[gerai] || {};
  const web  = GERAI_WEBSITES[gerai] || {};
  const count = allData.filter(d=>d.gerai===gerai).length;
  const t    = T[lang];

  return (
    <div className="gps" id={`promo-${gerai.toLowerCase().replace(" ","-")}`}>
      {/* Section header */}
      <div className="gps-header" style={{borderLeft:`5px solid ${cfg.color}`}}>
        <div className="gps-title-row">
          <div>
            <h3 className="gps-name" style={{color:cfg.color}}>{cfg.label}</h3>
            <p className="gps-tagline">{lang==="en"? data.tagline_en : data.tagline_id}</p>
          </div>
          <div className="gps-meta">
            <span className="gps-count" style={{background:cfg.bg,color:cfg.color}}>
              {count} {lang==="id"?"gerai di Bandung":"stores in Bandung"}
            </span>
          </div>
        </div>

        {/* Website links */}
        <div className="gps-links">
          <a href={web.official} target="_blank" rel="noopener noreferrer"
            className="gps-link primary" style={{background:cfg.color}}>
            <IcoExt/> {t.promo_visit} — {web.label}
          </a>
          <a href={web.promo} target="_blank" rel="noopener noreferrer"
            className="gps-link secondary" style={{borderColor:cfg.color,color:cfg.color}}>
            <IcoExt/> {t.promo_visit_promo}
          </a>
          {web.app && (
            <a href={web.app} target="_blank" rel="noopener noreferrer"
              className="gps-link app">
              <IcoApp/> {t.promo_open_app}
            </a>
          )}
        </div>
      </div>

      {/* Promo cards */}
      <div className="gps-promos">
        {data.promos.map(p => (
          <PromoCard key={p.id} promo={p} lang={lang} gerai={gerai}/>
        ))}
      </div>

      {/* More link */}
      <a href={web.promo} target="_blank" rel="noopener noreferrer" className="gps-more" style={{color:cfg.color}}>
        {t.promo_more} {cfg.label} →
      </a>
    </div>
  );
}

export default function PagePromo({ allData, lang }) {
  const t = T[lang];
  const [activeGerai, setActiveGerai] = useState("ALL");
  const geraiList = Object.keys(GERAI_CONFIG);

  const visibleGerais = activeGerai==="ALL" ? geraiList : [activeGerai];

  return (
    <div className="dash-page promo-page">
      {/* Header */}
      <div className="page-hdr">
        <div>
          <h2>{t.promo_title}</h2>
          <p>{t.promo_sub}</p>
        </div>
        <span className="hdr-badge">Mei 2026</span>
      </div>

      {/* Filter tabs */}
      <div className="promo-filter-tabs">
        <button
          className={`pft-btn ${activeGerai==="ALL"?"active":""}`}
          onClick={()=>setActiveGerai("ALL")}>
          🏪 {t.promo_filter_all}
        </button>
        {geraiList.map(g => {
          const cfg = GERAI_CONFIG[g];
          const active = activeGerai===g;
          return (
            <button key={g}
              className={`pft-btn ${active?"active":""}`}
              style={active?{background:cfg.color,borderColor:cfg.color,color:"#fff"}:{borderColor:cfg.color,color:cfg.color}}
              onClick={()=>setActiveGerai(g)}>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Quick jump anchors */}
      {activeGerai==="ALL" && (
        <div className="promo-jump">
          {geraiList.map(g => {
            const cfg = GERAI_CONFIG[g];
            return (
              <a key={g} href={`#promo-${g.toLowerCase().replace(" ","-")}`}
                className="pj-chip" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.color}33`}}>
                {cfg.label}
              </a>
            );
          })}
        </div>
      )}

      {/* Gerai sections */}
      <div className="promo-sections">
        {visibleGerais.map(g => PROMOS[g] ? (
          <GeraiPromoSection
            key={g}
            gerai={g}
            data={PROMOS[g]}
            lang={lang}
            allData={allData}
          />
        ) : null)}
      </div>
    </div>
  );
}
