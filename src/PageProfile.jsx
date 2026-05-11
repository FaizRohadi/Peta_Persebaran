import { useState } from "react";
import { GERAI_WEBSITES } from "./promos.js";
import { T } from "./i18n.js";

/* ─── Gerai master data ─────────────────────────────────────────────────── */
const PROFILES = {
  INDOMARET: {
    color: "#e8404a", bg: "#fef2f2", light: "#fff5f5",
    label: "Indomaret",
    logo: "🔴",
    img: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&q=80",
    imgFallback: "https://placehold.co/900x400/fee2e2/e8404a?text=Indomaret",
    tagline_id: "Mudah dan Hemat",
    tagline_en: "Easy and Affordable",
    founded: "1988",
    hq_id: "Jakarta, Indonesia",
    hq_en: "Jakarta, Indonesia",
    parent_id: "PT Indomarco Prismatama (Salim Group)",
    parent_en: "PT Indomarco Prismatama (Salim Group)",
    national: "21.000+ gerai",
    national_en: "21,000+ outlets",
    employees_id: "±100.000 karyawan",
    employees_en: "±100,000 employees",
    about_id: "Indomaret adalah jaringan minimarket waralaba terbesar di Indonesia yang berada di bawah naungan PT Indomarco Prismatama, bagian dari konglomerasi Salim Group milik Anthony Salim. Bermula dari sebuah gerai kecil yang didirikan untuk memenuhi kebutuhan karyawan pabrik, Indomaret kini hadir di lebih dari 21.000 titik di seluruh Indonesia.\n\nIndomaret menjadi pelopor konsep waralaba minimarket di Indonesia dan meraih penghargaan 'Perusahaan Waralaba Unggul 2003' — penghargaan pertama yang pernah diberikan kepada perusahaan minimarket di Indonesia. Produk unggulannya mencakup lini Private Label Indomaret yang menawarkan kualitas baik dengan harga yang lebih terjangkau.",
    about_en: "Indomaret is Indonesia's largest franchise minimarket chain under PT Indomarco Prismatama, part of Anthony Salim's Salim Group conglomerate. Starting from a small store built to meet factory employees' needs, Indomaret now operates over 21,000 locations across Indonesia.\n\nIndomaret pioneered the franchise minimarket concept in Indonesia and received the 'Outstanding Franchise Company 2003' award — the first ever given to a minimarket company in Indonesia. Its product lineup includes the Indomaret Private Label offering good quality at more affordable prices.",
    history: [
      { year: "1988", event_id: "Gerai pertama dibuka untuk memenuhi kebutuhan karyawan pabrik Salim Group", event_en: "First store opened to meet Salim Group factory employees' needs" },
      { year: "1997", event_id: "Mulai mengembangkan konsep franchise/waralaba minimarket pertama di Indonesia", event_en: "Began developing Indonesia's first minimarket franchise concept" },
      { year: "2003", event_id: "Meraih penghargaan 'Perusahaan Waralaba Unggul' pertama untuk minimarket Indonesia", event_en: "Won the first 'Outstanding Franchise Company' award for Indonesian minimarket" },
      { year: "2010", event_id: "Ekspansi besar-besaran, melewati 5.000 gerai di seluruh Indonesia", event_en: "Major expansion, surpassing 5,000 stores nationwide" },
      { year: "2015", event_id: "Peluncuran Klik Indomaret (platform belanja online resmi)", event_en: "Launch of Klik Indomaret (official online shopping platform)" },
      { year: "2022", event_id: "Melampaui 20.000 gerai, menjadi jaringan minimarket terbesar di Indonesia", event_en: "Surpassed 20,000 stores, becoming Indonesia's largest minimarket chain" },
      { year: "2024", event_id: "Lebih dari 21.000 gerai tersebar di seluruh wilayah Indonesia", event_en: "Over 21,000 outlets spread across all regions of Indonesia" },
    ],
    features_id: ["Sistem waralaba (franchise) untuk mitra bisnis","Private Label Indomaret berkualitas","Klik Indomaret — belanja online resmi","Layanan pembayaran tagihan & top-up","Point Coffee — minuman kopi eksklusif","Tersedia di kawasan perumahan, perkantoran, dan wisata","Jaringan distribusi 42 pusat distribusi nasional"],
    features_en: ["Franchise system for business partners","Quality Indomaret Private Label","Klik Indomaret — official online shopping","Bill payment & top-up services","Point Coffee — exclusive coffee brand","Available in residential, commercial & tourism areas","42 national distribution centers"],
    visi_id: "Menjadi aset nasional dalam mewujudkan kehidupan masyarakat yang lebih baik melalui bisnis ritel.",
    visi_en: "To become a national asset in realizing a better community life through retail business.",
    social: { ig: "indomaret", twitter: "Indomaret", fb: "IndomaretChannel" },
  },

  ALFAMART: {
    color: "#2563eb", bg: "#eff6ff", light: "#f0f8ff",
    label: "Alfamart",
    logo: "🔵",
    img: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=900&q=80",
    imgFallback: "https://placehold.co/900x400/dbeafe/2563eb?text=Alfamart",
    tagline_id: "Belanja Puas, Harga Pas",
    tagline_en: "Shop More, Pay Less",
    founded: "1999",
    hq_id: "Alam Sutera, Tangerang, Banten",
    hq_en: "Alam Sutera, Tangerang, Banten",
    parent_id: "PT Sumber Alfaria Trijaya Tbk (Sigmantara Group)",
    parent_en: "PT Sumber Alfaria Trijaya Tbk (Sigmantara Group)",
    national: "17.000+ gerai",
    national_en: "17,000+ outlets",
    employees_id: "±60.000 karyawan",
    employees_en: "±60,000 employees",
    about_id: "Alfamart didirikan oleh Djoko Susanto melalui PT Sumber Alfaria Trijaya Tbk dan tercatat di Bursa Efek Indonesia (IDX: AMRT). Awalnya merupakan bisnis distribusi produk rokok dan konsumen sejak 1989, Alfamart resmi beroperasi sebagai minimarket pada 1999.\n\nAlfamart dikenal dengan warna biru-merahnya yang khas dan program loyalitas AlfaGift (sebelumnya Ponta). Selain menyediakan kebutuhan harian, Alfamart menawarkan layanan keuangan, pembayaran tagihan, dan pengiriman barang. Alfamart juga terus berkembang ke pasar internasional termasuk Filipina.",
    about_en: "Alfamart was founded by Djoko Susanto through PT Sumber Alfaria Trijaya Tbk and is listed on the Indonesia Stock Exchange (IDX: AMRT). Originally a tobacco and consumer goods distribution business since 1989, Alfamart officially operated as a minimarket in 1999.\n\nAlfamart is known for its distinctive blue-red colors and the AlfaGift (formerly Ponta) loyalty program. Besides providing daily necessities, Alfamart offers financial services, bill payments, and delivery. Alfamart continues to expand internationally including to the Philippines.",
    history: [
      { year: "1989", event_id: "Djoko Susanto mendirikan usaha distribusi produk rokok dan konsumen", event_en: "Djoko Susanto founded consumer and tobacco products distribution business" },
      { year: "1999", event_id: "PT Alfa Mini Mart Utama resmi beroperasi sebagai minimarket Alfamart", event_en: "PT Alfa Mini Mart Utama officially operates as Alfamart minimarket" },
      { year: "2009", event_id: "IPO di Bursa Efek Indonesia (BEI) dengan kode saham AMRT", event_en: "IPO on Indonesia Stock Exchange (IDX) with stock code AMRT" },
      { year: "2012", event_id: "Ekspansi ke Filipina, menjadi minimarket Indonesia pertama go-international", event_en: "Expansion to Philippines, becoming the first Indonesian minimarket to go international" },
      { year: "2016", event_id: "Peluncuran aplikasi Alfagift untuk belanja online dan program loyalitas", event_en: "Launch of Alfagift app for online shopping and loyalty program" },
      { year: "2020", event_id: "Melampaui 17.000 gerai aktif di seluruh Indonesia dan Filipina", event_en: "Surpassed 17,000 active outlets across Indonesia and Philippines" },
      { year: "2024", event_id: "Terus ekspansi dengan inovasi layanan digital dan kemitraan strategis", event_en: "Continued expansion with digital service innovation and strategic partnerships" },
    ],
    features_id: ["Alfagift — aplikasi belanja & loyalitas","Program Ponta rewards poin","Pembayaran tagihan: listrik, BPJS, pulsa","Layanan AlfaExpress (pengiriman cepat)","Pembayaran PPOB (loket pembayaran online)","Ekspansi internasional (Filipina)","Transaksi non-tunai lengkap (QRIS, e-wallet)"],
    features_en: ["Alfagift — shopping & loyalty app","Ponta rewards point program","Bill payments: electricity, BPJS, mobile","AlfaExpress delivery service","PPOB payment counter service","International expansion (Philippines)","Complete cashless transactions (QRIS, e-wallet)"],
    visi_id: "Menjadi jaringan distribusi ritel terkemuka yang dimiliki oleh masyarakat luas, berorientasi kepada pemberdayaan pengusaha kecil.",
    visi_en: "To become a leading retail distribution network owned by the wider community, oriented toward empowering small entrepreneurs.",
    social: { ig: "alfamart", twitter: "alfamart", fb: "alfamartIndonesia" },
  },

  YOMART: {
    color: "#f97316", bg: "#fff7ed", light: "#fffbf5",
    label: "Yomart",
    logo: "🟠",
    img: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=900&q=80",
    imgFallback: "https://placehold.co/900x400/ffedd5/f97316?text=Yomart",
    tagline_id: "Belanja Dekat & Hemat",
    tagline_en: "Shop Close & Save",
    founded: "2003",
    hq_id: "Jl. Jakarta No. 53, Bandung, Jawa Barat",
    hq_en: "Jl. Jakarta No. 53, Bandung, West Java",
    parent_id: "PT Griya Pratama / Yogya Group (PT Akur Pratama)",
    parent_en: "PT Griya Pratama / Yogya Group (PT Akur Pratama)",
    national: "±285 gerai (Jawa Barat)",
    national_en: "±285 outlets (West Java)",
    employees_id: "±3.000 karyawan",
    employees_en: "±3,000 employees",
    about_id: "Yomart adalah satu-satunya jaringan minimarket besar yang lahir dan berpusat di Bandung, Jawa Barat. Dikelola oleh PT Griya Pratama sebagai anak perusahaan dari Yogya Group (PT Akur Pratama) yang telah berpengalaman di industri ritel Indonesia sejak 1982.\n\nBerbeda dari kompetitor nasional, Yomart secara konsisten memfokuskan diri pada pasar lokal Jawa Barat dan mengedepankan semangat 'belanja dekat & hemat' untuk masyarakat setempat. Cabang pertama Yomart dibuka di Ciwastra, Bandung pada Agustus 2003 dan kini telah berkembang menjadi ±285 toko yang tersebar di hampir seluruh kota/kabupaten Jawa Barat.",
    about_en: "Yomart is the only major minimarket chain born and headquartered in Bandung, West Java. Managed by PT Griya Pratama as a subsidiary of Yogya Group (PT Akur Pratama) which has been experienced in Indonesia's retail industry since 1982.\n\nUnlike national competitors, Yomart consistently focuses on the West Java local market and champions the 'shop close & save' spirit for local communities. Yomart's first branch opened in Ciwastra, Bandung in August 2003 and has since grown to ±285 stores spread across almost all cities/regencies in West Java.",
    history: [
      { year: "1948", event_id: "Yogya Group berdiri sebagai toko batik 'Djokdja' di Bandung", event_en: "Yogya Group founded as 'Djokdja' batik shop in Bandung" },
      { year: "1982", event_id: "Yogya Group mulai mengembangkan bisnis ritel modern", event_en: "Yogya Group begins developing modern retail business" },
      { year: "2003", event_id: "Gerai Yomart pertama dibuka di Ciwastra, Bandung (Agustus 2003)", event_en: "First Yomart store opened in Ciwastra, Bandung (August 2003)" },
      { year: "2004", event_id: "Ekspansi ke 28 toko di Bandung, Cimahi, Sumedang, dan Majalengka", event_en: "Expanded to 28 stores in Bandung, Cimahi, Sumedang, and Majalengka" },
      { year: "2009", event_id: "Lebih dari 200 toko beroperasi di Jawa Barat dan Jawa Timur", event_en: "Over 200 stores operating in West Java and East Java" },
      { year: "2016", event_id: "Fokus penguatan di pasar Jawa Barat dengan konsep komunitas lokal", event_en: "Focus on strengthening West Java market with local community concept" },
      { year: "2023", event_id: "±285 toko di hampir seluruh kota/kabupaten Jawa Barat", event_en: "±285 stores in almost all cities/regencies of West Java" },
    ],
    features_id: ["Minimarket asli lokal Bandung & Jawa Barat","Menyasar konsumen menengah ke bawah","Bagian dari ekosistem Yogya Group (ritel terpercaya)","Fokus produk kebutuhan sehari-hari lokal","Dukungan komunitas dan UMKM lokal","Harga kompetitif untuk masyarakat sekitar","Tersebar di 17+ kota/kabupaten Jawa Barat"],
    features_en: ["Authentic local minimarket of Bandung & West Java","Targeting lower-to-middle consumers","Part of Yogya Group ecosystem (trusted retail)","Focus on local daily necessity products","Local community and SME support","Competitive prices for surrounding communities","Spread across 17+ cities/regencies of West Java"],
    visi_id: "Menjadi perusahaan ritel terbaik tidak hanya di skala lokal dan nasional, tetapi juga skala global, dengan memberikan pelayanan terbaik kepada konsumen.",
    visi_en: "To become the best retail company not only at local and national scale but also globally, by providing the best service to consumers.",
    social: { ig: "yomartofficial", twitter: null, fb: "YomartMinimarket" },
  },

  LAWSON: {
    color: "#0891b2", bg: "#ecfeff", light: "#f0fdff",
    label: "Lawson",
    logo: "🩵",
    img: "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=900&q=80",
    imgFallback: "https://placehold.co/900x400/cffafe/0891b2?text=Lawson",
    tagline_id: "Kenyamanan Bergaya Jepang",
    tagline_en: "Japanese-Style Convenience",
    founded: "2011 (Indonesia)",
    hq_id: "Jakarta, Indonesia (Lawson Inc. — Nagoya, Jepang)",
    hq_en: "Jakarta, Indonesia (Lawson Inc. — Nagoya, Japan)",
    parent_id: "PT Midi Utama Indonesia Tbk (IDX: MIDI)",
    parent_en: "PT Midi Utama Indonesia Tbk (IDX: MIDI)",
    national: "700+ gerai",
    national_en: "700+ outlets",
    employees_id: "±5.000 karyawan",
    employees_en: "±5,000 employees",
    about_id: "Lawson adalah jaringan convenience store ikonik dari Jepang yang berdiri sejak 1939 dan masuk ke Indonesia pada 2011 melalui kemitraan dengan PT Midi Utama Indonesia Tbk (anak perusahaan Alfamart Group). Lawson hadir dengan konsep toko bergaya Jepang yang mengedepankan produk ready-to-eat segar.\n\nCiri khas Lawson Indonesia adalah produk makanan siap saji berkualitas tinggi seperti Onigiri, Bento Box, dan berbagai roti yang diproduksi segar setiap hari. Lawson Station Coffee juga menjadi daya tarik tersendiri dengan berbagai varian kopi premium yang disajikan langsung di gerai.",
    about_en: "Lawson is an iconic convenience store chain from Japan founded in 1939 that entered Indonesia in 2011 through a partnership with PT Midi Utama Indonesia Tbk (Alfamart Group subsidiary). Lawson presents a Japanese-style store concept that prioritizes fresh ready-to-eat products.\n\nLawson Indonesia's hallmark is high-quality ready-to-eat food products like Onigiri, Bento Box, and various breads freshly produced daily. Lawson Station Coffee also serves as a distinctive attraction with various premium coffee variants served directly at outlets.",
    history: [
      { year: "1939", event_id: "Lawson berdiri di Amerika Serikat sebagai toko susu keluarga", event_en: "Lawson founded in USA as a family dairy store" },
      { year: "1975", event_id: "Daiei group Jepang mengakuisisi Lawson, membuka era convenience store Jepang", event_en: "Japan's Daiei group acquired Lawson, opening the Japanese convenience store era" },
      { year: "2001", event_id: "Mitsubishi Corporation mengambil alih kepemilikan Lawson di Jepang", event_en: "Mitsubishi Corporation took over Lawson ownership in Japan" },
      { year: "2011", event_id: "Lawson resmi masuk Indonesia melalui PT Midi Utama Indonesia", event_en: "Lawson officially entered Indonesia through PT Midi Utama Indonesia" },
      { year: "2013", event_id: "Ekspansi ke berbagai kota besar Indonesia di luar Jabodetabek", event_en: "Expansion to various major Indonesian cities outside Jabodetabek" },
      { year: "2019", event_id: "Melampaui 300 gerai di Indonesia, dengan fokus produk Japan-style", event_en: "Surpassed 300 outlets in Indonesia, with focus on Japan-style products" },
      { year: "2024", event_id: "700+ gerai beroperasi dengan inovasi menu dan layanan digital", event_en: "700+ outlets operating with menu innovation and digital services" },
    ],
    features_id: ["Onigiri & Bento segar dibuat setiap hari","Lawson Station Coffee (kopi premium)","Konsep toko bergaya Jepang yang modern","Ready-to-eat: roti, sandwich, nikuman","Oden hangat (masakan Jepang tradisional)","Layanan pembayaran tagihan & digital","Menu eksklusif berkolaborasi dengan brand Jepang"],
    features_en: ["Fresh Onigiri & Bento made daily","Lawson Station Coffee (premium coffee)","Modern Japanese-style store concept","Ready-to-eat: bread, sandwiches, nikuman","Warm Oden (traditional Japanese food)","Bill payment & digital services","Exclusive menus in collaboration with Japanese brands"],
    visi_id: "Menjadi jaringan convenience store pilihan utama yang menghadirkan pengalaman berbelanja bergaya Jepang yang menyenangkan dan berkualitas bagi masyarakat Indonesia.",
    visi_en: "To become the preferred convenience store network delivering an enjoyable, quality Japanese-style shopping experience for Indonesian consumers.",
    social: { ig: "lawson_indonesia", twitter: "LawsonIndo", fb: "LawsonIndonesia" },
  },

  "CIRCLE K": {
    color: "#7c3aed", bg: "#f5f3ff", light: "#faf8ff",
    label: "Circle K",
    logo: "🟣",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80",
    imgFallback: "https://placehold.co/900x400/ede9fe/7c3aed?text=Circle+K",
    tagline_id: "Teman Setiamu, 24 Jam Non-Stop",
    tagline_en: "Your Best Buddy, 24/7",
    founded: "1951 (USA) · 1986 (Indonesia)",
    hq_id: "Tempe, Arizona, USA (Alimentation Couche-Tard)",
    hq_en: "Tempe, Arizona, USA (Alimentation Couche-Tard)",
    parent_id: "Alimentation Couche-Tard Inc. (Canada) — ACT",
    parent_en: "Alimentation Couche-Tard Inc. (Canada) — ACT",
    national: "300+ gerai (Indonesia)",
    national_en: "300+ outlets (Indonesia)",
    employees_id: "150.000+ karyawan (global)",
    employees_en: "150,000+ employees (global)",
    about_id: "Circle K adalah jaringan convenience store internasional asal Amerika Serikat yang didirikan pada 1951 oleh Fred Harvey di El Paso, Texas. Saat ini dimiliki oleh Alimentation Couche-Tard (ACT), perusahaan ritel Kanada, dan beroperasi di lebih dari 26 negara dengan 14.000+ gerai di seluruh dunia.\n\nCircle K masuk ke Indonesia sejak 1986 dan menjadi salah satu convenience store premium pertama di tanah air. Dikenal dengan konsep 24 jam non-stop, Circle K Indonesia menarget segmen anak muda dan konsumen urban dengan produk impor berkualitas, minuman Frozone/Polar Pop, dan suasana toko yang modern.",
    about_en: "Circle K is an international convenience store chain from the United States founded in 1951 by Fred Harvey in El Paso, Texas. Currently owned by Alimentation Couche-Tard (ACT), a Canadian retail company, operating in over 26 countries with 14,000+ stores worldwide.\n\nCircle K entered Indonesia in 1986 and became one of the first premium convenience stores in the country. Known for its 24-hour non-stop concept, Circle K Indonesia targets young people and urban consumers with quality imported products, Frozone/Polar Pop drinks, and a modern store atmosphere.",
    history: [
      { year: "1951", event_id: "Circle K didirikan oleh Fred Harvey di El Paso, Texas, Amerika Serikat", event_en: "Circle K founded by Fred Harvey in El Paso, Texas, USA" },
      { year: "1980", event_id: "Ekspansi besar-besaran ke seluruh Amerika Serikat dan Kanada", event_en: "Major expansion throughout USA and Canada" },
      { year: "1986", event_id: "Circle K resmi masuk Indonesia sebagai convenience store premium pertama", event_en: "Circle K officially entered Indonesia as one of the first premium convenience stores" },
      { year: "2003", event_id: "Alimentation Couche-Tard (Kanada) mengakuisisi Circle K secara global", event_en: "Alimentation Couche-Tard (Canada) acquired Circle K globally" },
      { year: "2012", event_id: "Rebranding dan modernisasi gerai Circle K di Indonesia", event_en: "Rebranding and modernization of Circle K outlets in Indonesia" },
      { year: "2016", event_id: "Couche-Tard global memiliki 14.000+ gerai di 26+ negara", event_en: "Couche-Tard globally operates 14,000+ stores in 26+ countries" },
      { year: "2024", event_id: "300+ gerai Circle K aktif di Indonesia dengan konsep toko modern 24 jam", event_en: "300+ active Circle K outlets in Indonesia with modern 24-hour store concept" },
    ],
    features_id: ["Beroperasi 24 jam, 7 hari seminggu","Frozone (minuman slushie ikonik)","Polar Pop (fountain drink kustomisasi)","Produk impor berkualitas dari USA & Eropa","Konsep toko modern bergaya internasional","Kemitraan global dengan brand internasional","Target pasar anak muda dan konsumen urban"],
    features_en: ["Operating 24 hours, 7 days a week","Frozone (iconic slushie drink)","Polar Pop (customizable fountain drink)","Quality imported products from USA & Europe","Modern international-style store concept","Global partnerships with international brands","Target market: young people & urban consumers"],
    visi_id: "Menjadi convenience store pilihan nomor satu untuk gaya hidup modern yang dinamis, dengan menghadirkan produk berkualitas internasional yang mudah dijangkau.",
    visi_en: "To be the number one preferred convenience store for dynamic modern lifestyles, by delivering quality international products within easy reach.",
    social: { ig: "circle_k_indonesia", twitter: "circlekID", fb: "CircleKIndonesia" },
  },
};

const GERAI_ORDER = ["INDOMARET","ALFAMART","YOMART","LAWSON","CIRCLE K"];

/* ─── Helper components ─────────────────────────────────────────────────── */
const IcoExt = ()=>(
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const IcoIG = ()=>(
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const IcoCheck = ()=>(
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─── Profile Detail ────────────────────────────────────────────────────── */
function ProfileDetail({ gerai, lang, allData }) {
  const p   = PROFILES[gerai];
  const web = GERAI_WEBSITES[gerai] || {};
  const t   = T[lang];
  const count = allData.filter(d=>d.gerai===gerai).length;
  const [tab, setTab] = useState("about"); // about | history | features

  if(!p) return null;

  const tabs = [
    { id:"about",    label: lang==="id"?"Tentang":"About"   },
    { id:"history",  label: lang==="id"?"Sejarah":"History" },
    { id:"features", label: lang==="id"?"Layanan":"Services"},
  ];

  return (
    <div className="profile-detail">
      {/* Hero image */}
      <div className="pd-hero">
        <img src={p.img} alt={p.label} className="pd-hero-img"
          onError={e=>{e.target.src=p.imgFallback;}}/>
        <div className="pd-hero-ov" style={{background:`linear-gradient(to top, ${p.color}dd 0%, rgba(0,0,0,0.3) 60%, transparent 100%)`}}>
          <div className="pd-hero-content">
            <span className="pd-logo">{p.logo}</span>
            <div>
              <h2 className="pd-name">{p.label}</h2>
              <p className="pd-tagline">"{lang==="id"?p.tagline_id:p.tagline_en}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div className="pd-meta" style={{borderTop:`3px solid ${p.color}`}}>
        {[
          { label: lang==="id"?"Didirikan":"Founded",     val: p.founded          },
          { label: lang==="id"?"Kantor Pusat":"HQ",       val: lang==="id"?p.hq_id:p.hq_en },
          { label: lang==="id"?"Induk Usaha":"Parent",    val: lang==="id"?p.parent_id:p.parent_en },
          { label: lang==="id"?"Gerai Nasional":"National",val: lang==="id"?p.national:p.national_en },
          { label: lang==="id"?"Gerai di Bandung":"In Bandung", val: `${count} gerai` },
          { label: lang==="id"?"Karyawan":"Employees",    val: lang==="id"?p.employees_id:p.employees_en },
        ].map((m,i)=>(
          <div key={i} className="pd-meta-item">
            <p className="pdm-label">{m.label}</p>
            <p className="pdm-val">{m.val}</p>
          </div>
        ))}
      </div>

      {/* Website actions */}
      <div className="pd-actions">
        <a href={web.official} target="_blank" rel="noopener noreferrer"
          className="pd-btn primary" style={{background:p.color}}>
          <IcoExt/> {t.promo_visit} — {web.label}
        </a>
        <a href={web.promo} target="_blank" rel="noopener noreferrer"
          className="pd-btn secondary" style={{borderColor:p.color, color:p.color}}>
          🏷️ {t.promo_visit_promo}
        </a>
        {web.app && (
          <a href={web.app} target="_blank" rel="noopener noreferrer"
            className="pd-btn app">
            📱 {t.promo_open_app}
          </a>
        )}
        {p.social.ig && (
          <a href={`https://instagram.com/${p.social.ig}`} target="_blank" rel="noopener noreferrer"
            className="pd-btn social" style={{borderColor:p.color,color:p.color}}>
            <IcoIG/> @{p.social.ig}
          </a>
        )}
      </div>

      {/* Content tabs */}
      <div className="pd-tabs">
        {tabs.map(tb=>(
          <button key={tb.id}
            className={`pd-tab ${tab===tb.id?"active":""}`}
            style={tab===tb.id?{borderBottomColor:p.color,color:p.color}:{}}
            onClick={()=>setTab(tb.id)}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="pd-content">
        {/* About */}
        {tab==="about" && (
          <div className="pd-about">
            {(lang==="id"?p.about_id:p.about_en).split('\n\n').map((para,i)=>(
              <p key={i} className="pd-para">{para}</p>
            ))}
            {/* Visi */}
            <div className="pd-visi" style={{borderLeft:`4px solid ${p.color}`, background:p.light}}>
              <p className="pdv-label">{lang==="id"?"Visi Perusahaan":"Company Vision"}</p>
              <p className="pdv-text">"{lang==="id"?p.visi_id:p.visi_en}"</p>
            </div>
          </div>
        )}

        {/* History */}
        {tab==="history" && (
          <div className="pd-history">
            <div className="timeline">
              {p.history.map((h,i)=>(
                <div key={i} className="tl-item">
                  <div className="tl-year" style={{background:p.color}}>{h.year}</div>
                  <div className="tl-line" style={{background:`${p.color}30`}}/>
                  <div className="tl-event">
                    {lang==="id"?h.event_id:h.event_en}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {tab==="features" && (
          <div className="pd-features">
            <div className="feat-grid">
              {(lang==="id"?p.features_id:p.features_en).map((f,i)=>(
                <div key={i} className="feat-item" style={{borderColor:`${p.color}30`,background:p.light}}>
                  <span className="feat-check" style={{color:p.color,background:p.bg}}>
                    <IcoCheck/>
                  </span>
                  <p>{f}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function PageProfile({ allData, lang }) {
  const [activeGerai, setActiveGerai] = useState("INDOMARET");
  const t = T[lang];

  return (
    <div className="profile-page">
      {/* Page header */}
      <div className="pp-header">
        <div className="pp-header-text">
          <h1>{lang==="id"?"Profil Jaringan Minimarket":"Minimarket Chain Profiles"}</h1>
          <p>{lang==="id"
            ?"Profil lengkap, sejarah, layanan, dan akses ke website resmi setiap jaringan minimarket di Kota Bandung"
            :"Complete profiles, history, services, and official website access for each minimarket chain in Bandung City"
          }</p>
        </div>
      </div>

      <div className="pp-body">
        {/* Sidebar gerai selector */}
        <div className="pp-sidebar">
          <p className="pp-sidebar-label">{lang==="id"?"Pilih Jaringan":"Select Chain"}</p>
          {GERAI_ORDER.map(g=>{
            const p = PROFILES[g];
            const cnt = allData.filter(d=>d.gerai===g).length;
            const active = activeGerai===g;
            return (
              <button key={g}
                className={`pp-gerai-btn ${active?"active":""}`}
                style={active?{background:p.bg,borderColor:p.color,borderLeftColor:p.color,borderLeftWidth:4}:{}}
                onClick={()=>setActiveGerai(g)}>
                <span className="ppgb-logo">{p.logo}</span>
                <div className="ppgb-text">
                  <p className="ppgb-name" style={active?{color:p.color}:{}}>{p.label}</p>
                  <p className="ppgb-count">{cnt} {lang==="id"?"gerai di Bandung":"stores in Bandung"}</p>
                </div>
                {active && <span className="ppgb-arrow" style={{color:p.color}}>›</span>}
              </button>
            );
          })}

          {/* Quick website links */}
          <div className="pp-quick-links">
            <p className="pp-sidebar-label" style={{marginTop:16}}>{lang==="id"?"Website Resmi":"Official Websites"}</p>
            {GERAI_ORDER.map(g=>{
              const p = PROFILES[g];
              const web = GERAI_WEBSITES[g];
              return (
                <a key={g} href={web?.official} target="_blank" rel="noopener noreferrer"
                  className="pp-web-link" style={{color:p.color}}>
                  <IcoExt/> {web?.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="pp-detail">
          <ProfileDetail gerai={activeGerai} lang={lang} allData={allData}/>
        </div>
      </div>
    </div>
  );
}
