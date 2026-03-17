import { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from "react";

/* ═══════════════════════════════════════════════════
   SKYN Controle de Insumos — v5
   Split Contexts · Snapshots · a11y · Optional Lots
   ═══════════════════════════════════════════════════ */

const CATEGORIES = [
  { id: "toxinas", label: "Toxinas", icon: "💉", color: "#8B5E6B", bg: "#F5E6EA" },
  { id: "preenchedores", label: "Preenchedores", icon: "✨", color: "#C4848E", bg: "#FCEEF0" },
  { id: "bioestimuladores", label: "Bioestimuladores", icon: "🧬", color: "#6B9B8A", bg: "#E8F4EF" },
  { id: "fios", label: "Fios", icon: "🧵", color: "#C4A67A", bg: "#F9F1E6" },
  { id: "descartaveis", label: "Descartáveis", icon: "🧤", color: "#7A9BAF", bg: "#E6F0F5" },
];

// ═══ PRODUCT CATALOG (ANVISA-aligned templates) ═══
const PRODUCT_CATALOG = [
  // Toxinas Botulínicas
  { id: "botox-50", brand: "Botox", maker: "Allergan", presentation: "50U", category: "toxinas", unit: "fr.", unitsPerPack: 1, regRef: "Toxina Botulínica Tipo A" },
  { id: "botox-100", brand: "Botox", maker: "Allergan", presentation: "100U", category: "toxinas", unit: "fr.", unitsPerPack: 1, regRef: "Toxina Botulínica Tipo A" },
  { id: "botox-200", brand: "Botox", maker: "Allergan", presentation: "200U", category: "toxinas", unit: "fr.", unitsPerPack: 1, regRef: "Toxina Botulínica Tipo A" },
  { id: "dysport-300", brand: "Dysport", maker: "Ipsen", presentation: "300U", category: "toxinas", unit: "fr.", unitsPerPack: 1, regRef: "Toxina Botulínica Tipo A" },
  { id: "dysport-500", brand: "Dysport", maker: "Ipsen", presentation: "500U", category: "toxinas", unit: "fr.", unitsPerPack: 1, regRef: "Toxina Botulínica Tipo A" },
  { id: "xeomin-100", brand: "Xeomin", maker: "Merz", presentation: "100U", category: "toxinas", unit: "fr.", unitsPerPack: 1, regRef: "Toxina Botulínica Tipo A" },
  { id: "xeomin-200", brand: "Xeomin", maker: "Merz", presentation: "200U", category: "toxinas", unit: "fr.", unitsPerPack: 1, regRef: "Toxina Botulínica Tipo A" },
  // Preenchedores — Ácido Hialurônico
  { id: "restylane-1ml", brand: "Restylane", maker: "Galderma", presentation: "Seringa 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 1, regRef: "Ácido Hialurônico" },
  { id: "restylane-lidocaina", brand: "Restylane Lidocaína", maker: "Galderma", presentation: "Seringa 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 1, regRef: "Ácido Hialurônico" },
  { id: "juvederm-ultra3", brand: "Juvéderm Ultra 3", maker: "Allergan", presentation: "Cx c/ 2 seringas 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 2, regRef: "Ácido Hialurônico" },
  { id: "juvederm-ultra4", brand: "Juvéderm Ultra 4", maker: "Allergan", presentation: "Cx c/ 2 seringas 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 2, regRef: "Ácido Hialurônico" },
  { id: "juvederm-voluma", brand: "Juvéderm Voluma", maker: "Allergan", presentation: "Cx c/ 2 seringas 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 2, regRef: "Ácido Hialurônico" },
  { id: "juvederm-volux", brand: "Juvéderm Volux", maker: "Allergan", presentation: "Cx c/ 2 seringas 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 2, regRef: "Ácido Hialurônico" },
  { id: "juvederm-volite", brand: "Juvéderm Volite", maker: "Allergan", presentation: "Cx c/ 2 seringas 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 2, regRef: "Ácido Hialurônico" },
  { id: "rennova-fill", brand: "Rennova Fill", maker: "Rennova", presentation: "Seringa 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 1, regRef: "Ácido Hialurônico" },
  { id: "rennova-ultra", brand: "Rennova Ultra Deep", maker: "Rennova", presentation: "Seringa 1.25mL", category: "preenchedores", unit: "un.", unitsPerPack: 1, regRef: "Ácido Hialurônico" },
  { id: "princess-filler", brand: "Princess Filler", maker: "Croma", presentation: "Seringa 1mL", category: "preenchedores", unit: "un.", unitsPerPack: 1, regRef: "Ácido Hialurônico" },
  // Bioestimuladores
  { id: "sculptra-1fr", brand: "Sculptra", maker: "Galderma", presentation: "Frasco 150mg", category: "bioestimuladores", unit: "fr.", unitsPerPack: 1, regRef: "Ácido Poli-L-Láctico" },
  { id: "radiesse-15ml", brand: "Radiesse", maker: "Merz", presentation: "Seringa 1.5mL", category: "bioestimuladores", unit: "un.", unitsPerPack: 1, regRef: "Hidroxiapatita de Cálcio" },
  { id: "radiesse-plus", brand: "Radiesse+", maker: "Merz", presentation: "Seringa 1.5mL c/ lidocaína", category: "bioestimuladores", unit: "un.", unitsPerPack: 1, regRef: "Hidroxiapatita de Cálcio" },
  { id: "ellanse-s", brand: "Ellansé S", maker: "Sinclair", presentation: "Seringa 1mL", category: "bioestimuladores", unit: "un.", unitsPerPack: 1, regRef: "Policaprolactona (PCL)" },
  { id: "ellanse-m", brand: "Ellansé M", maker: "Sinclair", presentation: "Seringa 1mL", category: "bioestimuladores", unit: "un.", unitsPerPack: 1, regRef: "Policaprolactona (PCL)" },
  // Fios de PDO
  { id: "fio-pdo-mono", brand: "Fio PDO Mono", maker: "Genérico", presentation: "Pct c/ 20 fios", category: "fios", unit: "pct.", unitsPerPack: 20, regRef: "Fio de Polidioxanona" },
  { id: "fio-pdo-espiculado", brand: "Fio PDO Espiculado", maker: "Genérico", presentation: "Pct c/ 10 fios", category: "fios", unit: "pct.", unitsPerPack: 10, regRef: "Fio de Polidioxanona" },
  { id: "fio-pdo-mola", brand: "Fio PDO Mola", maker: "Genérico", presentation: "Pct c/ 10 fios", category: "fios", unit: "pct.", unitsPerPack: 10, regRef: "Fio de Polidioxanona" },
  { id: "silhouette-soft", brand: "Silhouette Soft", maker: "Sinclair", presentation: "Cx c/ 8 cones", category: "fios", unit: "cx.", unitsPerPack: 8, regRef: "Fio de Ácido Poliláctico" },
  // Descartáveis
  { id: "agulha-30g", brand: "Agulha 30G", maker: "Genérico", presentation: "Cx c/ 100", category: "descartaveis", unit: "cx.", unitsPerPack: 100, regRef: "Agulha Hipodérmica" },
  { id: "agulha-27g", brand: "Agulha 27G", maker: "Genérico", presentation: "Cx c/ 100", category: "descartaveis", unit: "cx.", unitsPerPack: 100, regRef: "Agulha Hipodérmica" },
  { id: "canula-22g", brand: "Cânula 22G x 50mm", maker: "Genérico", presentation: "Un.", category: "descartaveis", unit: "un.", unitsPerPack: 1, regRef: "Cânula Flexível" },
  { id: "canula-25g", brand: "Cânula 25G x 38mm", maker: "Genérico", presentation: "Un.", category: "descartaveis", unit: "un.", unitsPerPack: 1, regRef: "Cânula Flexível" },
  { id: "luva-proc-p", brand: "Luva Procedimento P", maker: "Genérico", presentation: "Cx c/ 100", category: "descartaveis", unit: "cx.", unitsPerPack: 100, regRef: "Luva de Procedimento" },
  { id: "luva-proc-m", brand: "Luva Procedimento M", maker: "Genérico", presentation: "Cx c/ 100", category: "descartaveis", unit: "cx.", unitsPerPack: 100, regRef: "Luva de Procedimento" },
  { id: "gaze-esteril", brand: "Gaze Estéril", maker: "Genérico", presentation: "Pct c/ 10", category: "descartaveis", unit: "pct.", unitsPerPack: 10, regRef: "Gaze Estéril" },
  { id: "anestesico-topico", brand: "Anestésico Tópico (Lidocaína 4%)", maker: "Genérico", presentation: "Bisnaga 30g", category: "descartaveis", unit: "un.", unitsPerPack: 1, regRef: "Anestésico Tópico" },
];

const KEY = "skyn-inventory-v7";
const PREFS_KEY = "skyn-prefs-v7";
const DEFAULT_PROS = ["Carol", "Lara", "Jennifer", "Luane"];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtDate = (ts) => new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtDateShort = (ts) => new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
const fmtExpiry = (d) => { if (!d) return ""; const dt = new Date(d); return dt.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }); };
const fmtBRL = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0); return d.getTime(); };
const daysUntil = (dateStr) => { if (!dateStr) return Infinity; return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000); };

// ═══ CONTEXTS (split: data vs UI) ═══
const InvCtx = createContext(null);
const UICtx = createContext(null);
function useInv() { return useContext(InvCtx); }
function useUI() { return useContext(UICtx); }

// ═══ VALIDATION ═══
function validateData(raw) {
  try {
    const d = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!d || !Array.isArray(d.items) || !Array.isArray(d.movements)) return null;
    const items = d.items.filter(i => i && typeof i.id === "string" && typeof i.name === "string");
    items.forEach(i => {
      if (!Array.isArray(i.batches)) i.batches = [];
      if (typeof i.currentQty !== "number") i.currentQty = 0;
      if (typeof i.unitsPerPack !== "number") i.unitsPerPack = 1;
      if (typeof i.costPrice !== "number") i.costPrice = 0;
      if (!i.presentation) i.presentation = "";
      if (!i.maker) i.maker = "";
      if (!i.regRef) i.regRef = "";
    });
    const movements = d.movements.filter(m => m && typeof m.id === "string");
    const professionals = Array.isArray(d.professionals) ? d.professionals : [...DEFAULT_PROS];
    return { items, movements, professionals };
  } catch { return null; }
}

// ═══ BATCH HELPERS ═══
function calcQty(item) {
  if (!item.batches || item.batches.length === 0) return item.currentQty;
  return item.batches.reduce((s, b) => s + (b.qty || 0), 0);
}
function fifoOut(batches, qty) {
  const sorted = [...batches].sort((a, b) => {
    if (!a.expiryDate && !b.expiryDate) return (a.createdAt || 0) - (b.createdAt || 0);
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });
  let rem = qty;
  const remaining = [];
  const consumed = [];
  for (const b of sorted) {
    if (rem <= 0) { remaining.push(b); continue; }
    const take = Math.min(b.qty, rem);
    consumed.push({ batchId: b.id, lot: b.lot || "", expiryDate: b.expiryDate || "", consumed: take });
    rem -= take;
    if (b.qty > take) remaining.push({ ...b, qty: b.qty - take });
  }
  return { remaining, consumed };
}

// ═══ FADEIN ═══
function FadeIn({ children, delay = 0, style = {} }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ ...style, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)" }}>{children}</div>;
}

// ═══ MAIN APP ═══
export default function App() {
  const [data, setData] = useState({ items: [], movements: [], professionals: [...DEFAULT_PROS] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [dark, setDark] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);

  // UI state (separate context)
  const [view, setView] = useState("dashboard");
  const [selCat, setSelCat] = useState(null);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [histSearch, setHistSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const v = validateData(raw);
        if (v) setData(v);
        else setShowOnboard(true);
      } else {
        setShowOnboard(true);
      }
    } catch (e) { console.error("Load:", e); setShowOnboard(true); }
    try {
      const p = localStorage.getItem(PREFS_KEY);
      if (p) { const prefs = JSON.parse(p); if (prefs.dark) setDark(true); }
    } catch {}
    setLoading(false);
  }, []);

  const toggleDark = useCallback(() => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ dark: next })); } catch {}
  }, [dark]);

  const flash = useCallback((msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); }, []);

  const persist = useCallback((nd) => {
    setData(nd);
    try { localStorage.setItem(KEY, JSON.stringify(nd)); }
    catch (e) { console.error("Save:", e); flash("⚠ Falha no salvamento!", "error"); }
  }, [flash]);

  const addPro = useCallback((name) => {
    if (!name.trim() || data.professionals.includes(name.trim())) return;
    persist({ ...data, professionals: [...data.professionals, name.trim()] });
    flash("Profissional adicionada!");
  }, [data, persist, flash]);

  const removePro = useCallback((name) => {
    persist({ ...data, professionals: data.professionals.filter(p => p !== name) });
  }, [data, persist]);

  const addItem = useCallback((item) => {
    const newItem = { ...item, id: uid(), createdAt: Date.now(), batches: item.batches || [] };
    newItem.currentQty = calcQty(newItem);
    persist({ ...data, items: [...data.items, newItem] });
    setModal(null); flash("Insumo cadastrado!");
  }, [data, persist, flash]);

  const updateItem = useCallback((u) => {
    u.currentQty = calcQty(u);
    persist({ ...data, items: data.items.map(i => i.id === u.id ? { ...i, ...u } : i) });
    setModal(null); flash("Insumo atualizado!");
  }, [data, persist, flash]);

  const deleteItem = useCallback((id) => {
    persist({ ...data, items: data.items.filter(i => i.id !== id), movements: data.movements.filter(m => m.itemId !== id) });
    setModal(null); flash("Removido", "warn");
  }, [data, persist, flash]);

  const addMovement = useCallback((itemId, qty, type, note, batchInfo, byPro) => {
    const item = data.items.find(i => i.id === itemId);
    if (!item) return;
    const stock = calcQty(item);
    if (type === "out" && qty > stock) { flash(`Estoque insuficiente! Disponível: ${stock} ${item.unit}`, "error"); return; }

    // Snapshot with ANVISA audit trail + professional
    const mov = { id: uid(), itemId, qty, type, note, date: Date.now(), _name: item.name, _cat: item.category, _pres: item.presentation || "", _cost: item.costPrice || 0, _by: byPro || "", consumedLots: [] };

    let updatedItem;
    if (type === "in") {
      let batches = [...(item.batches || [])];
      if (batchInfo?.lot || batchInfo?.expiryDate) {
        batches.push({ id: uid(), qty, lot: batchInfo.lot || "", expiryDate: batchInfo.expiryDate || "", createdAt: Date.now() });
      }
      const newQty = (item.batches?.length > 0 || batches.length > (item.batches?.length || 0)) ? batches.reduce((s, b) => s + b.qty, 0) : item.currentQty + qty;
      updatedItem = { ...item, batches, currentQty: newQty };
    } else {
      let batches = [...(item.batches || [])];
      if (batches.length > 0) {
        const { remaining, consumed } = fifoOut(batches, qty);
        mov.consumedLots = consumed;
        updatedItem = { ...item, batches: remaining, currentQty: remaining.reduce((s, b) => s + b.qty, 0) };
      } else {
        updatedItem = { ...item, currentQty: Math.max(0, item.currentQty - qty) };
      }
    }

    const items = data.items.map(i => i.id === itemId ? updatedItem : i);
    persist({ ...data, items, movements: [mov, ...data.movements] });
    setModal(null); flash(type === "in" ? `+${qty} entrada` : `-${qty} saída`);
  }, [data, persist, flash]);

  // Expiry alerts
  const expiryAlerts = useMemo(() => {
    const results = [];
    data.items.forEach(item => {
      (item.batches || []).forEach(b => {
        const d = daysUntil(b.expiryDate);
        if (d <= 30 && d !== Infinity) results.push({ item, batch: b, days: d });
      });
    });
    return results.sort((a, b) => a.days - b.days);
  }, [data.items]);

  const alerts = useMemo(() => data.items.filter(i => calcQty(i) <= i.minQty), [data.items]);
  const alertSet = useMemo(() => new Set(alerts.map(a => a.id)), [alerts]);
  const totalCapital = useMemo(() => data.items.reduce((s, i) => s + calcQty(i) * (i.costPrice || 0), 0), [data.items]);

  const invValue = useMemo(() => ({ data, alerts, alertSet, expiryAlerts, totalCapital, addItem, updateItem, deleteItem, addMovement, addPro, removePro, flash, persist }), [data, alerts, alertSet, expiryAlerts, totalCapital, addItem, updateItem, deleteItem, addMovement, addPro, removePro, flash, persist]);
  const uiValue = useMemo(() => ({ view, setView, selCat, setSelCat, modal, setModal, search, setSearch, histSearch, setHistSearch, dark, toggleDark }), [view, selCat, modal, search, histSearch, dark, toggleDark]);

  // Dark mode color map
  const bg = dark ? "linear-gradient(180deg, #1A1520 0%, #141018 100%)" : "linear-gradient(180deg, #FAF7F5 0%, #F3EDE8 100%)";
  const textPrimary = dark ? "#F0E8E4" : "#3D2B33";

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: dark ? "#1A1520" : "#FAF7F5" }}>
      <div style={{ width: 28, height: 28, border: "2.5px solid #E8DDD6", borderTopColor: "#8B5E6B", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <p style={{ color: "#BBA89E", marginTop: 14, fontFamily: ff, fontSize: 13, letterSpacing: 1 }}>Carregando...</p>
    </div>
  );

  return (
    <InvCtx.Provider value={invValue}>
      <UICtx.Provider value={uiValue}>
        <div style={{ fontFamily: ff, minHeight: "100vh", background: bg, maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 90, transition: "background 0.4s ease" }}>
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: dark ? 0.02 : 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", padding: "10px 24px", borderRadius: 40, color: "#fff", fontWeight: 600, fontSize: 13, fontFamily: ff, zIndex: 300, boxShadow: "0 8px 32px rgba(139,94,107,0.25)", animation: "toastIn 0.4s cubic-bezier(.4,0,.2,1)", background: toast.type === "error" ? "#C4848E" : toast.type === "warn" ? "#C4A67A" : "#6B9B8A", letterSpacing: 0.3 }}>{toast.msg}</div>}
          {showOnboard && <Onboarding onDone={() => setShowOnboard(false)} />}
          <Header />
          <Nav />
          <main style={{ padding: "20px 18px", position: "relative", zIndex: 1 }}>
            {view === "dashboard" && <DashboardView />}
            {view === "stock" && <StockView />}
            {view === "history" && <HistoryView />}
            {view === "settings" && <SettingsView />}
          </main>
          <Modals />
        </div>
      </UICtx.Provider>
    </InvCtx.Provider>
  );
}

// ═══ HEADER ═══
function Header() {
  const { alerts, data, flash } = useInv();
  const { setView, setSelCat, dark, toggleDark } = useUI();
  const [showExport, setShowExport] = useState(false);

  const exportCSV = (from, to) => {
    const h = "Nome,Categoria,Unidade,Qtd Atual,Qtd Mínima,Custo Un.,Status\n";
    const r = data.items.map(i => `"${i.name}","${getCat(i.category).label}","${i.unit}",${calcQty(i)},${i.minQty},${i.costPrice || 0},${calcQty(i) <= i.minQty ? "BAIXO" : "OK"}`).join("\n");
    let movs = data.movements;
    if (from) movs = movs.filter(m => m.date >= from);
    if (to) movs = movs.filter(m => m.date <= to + 86400000);
    const mh = "\n\nMovimentações" + (from || to ? ` (${from ? fmtDateShort(from) : "início"} a ${to ? fmtDateShort(to) : "hoje"})` : "") + "\nData,Insumo,Tipo,Qtd,Profissional,Lotes Consumidos,Obs\n";
    const mr = movs.map(m => { const lots = (m.consumedLots || []).map(l => `${l.lot || "s/l"}:${l.consumed}`).join("; "); return `"${fmtDate(m.date)}","${m._name || "—"}","${m.type === "in" ? "Entrada" : "Saída"}",${m.qty},"${m._by || ""}","${lots}","${m.note || ""}"` }).join("\n");
    const blob = new Blob(["\uFEFF" + h + r + mh + mr], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `skyn-estoque-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    flash("CSV exportado!"); setShowExport(false);
  };

  return (
    <>
      <header style={{ position: "relative", padding: "28px 24px 22px", background: "linear-gradient(135deg, #2C1E24 0%, #3D2B33 50%, #2A2430 100%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,132,142,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,155,138,0.1) 0%, transparent 70%)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ fontFamily: display, fontSize: 32, fontWeight: 300, margin: 0, letterSpacing: 8, color: "#F5E6EA", lineHeight: 1 }}>SKYN</h1>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#C4848E", margin: "6px 0 0", letterSpacing: 3, textTransform: "uppercase", fontFamily: ff }}>Controle de Insumos</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {alerts.length > 0 && (
              <button onClick={() => { setView("stock"); setSelCat(null); }} aria-label={`${alerts.length} alertas de estoque baixo`} style={{ background: "rgba(196,166,122,0.15)", border: "1px solid rgba(196,166,122,0.3)", borderRadius: 20, padding: "5px 14px", fontSize: 13, cursor: "pointer", fontFamily: ff, fontWeight: 600, color: "#C4A67A", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C4A67A", animation: "pulse 2s infinite" }} />{alerts.length}
              </button>
            )}
            <button onClick={toggleDark} aria-label={dark ? "Modo claro" : "Modo escuro"} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "7px 11px", fontSize: 14, cursor: "pointer", color: "#C4848E", backdropFilter: "blur(8px)" }}>{dark ? "☀" : "☾"}</button>
            <button onClick={() => setShowExport(true)} aria-label="Exportar relatório CSV" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "7px 11px", fontSize: 14, cursor: "pointer", color: "#C4848E", backdropFilter: "blur(8px)" }}>↓</button>
          </div>
        </div>
      </header>
      {showExport && <ExportModal onExport={exportCSV} onClose={() => setShowExport(false)} />}
    </>
  );
}

function ExportModal({ onExport, onClose }) {
  const [mode, setMode] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return (
    <Overlay onClose={onClose}>
      <h3 style={mTitle}>Exportar CSV</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["all", "period"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, background: mode === m ? "#8B5E6B" : "transparent", color: mode === m ? "#fff" : "#8B5E6B", borderColor: mode === m ? "#8B5E6B" : "#8B5E6B33" }}>{m === "all" ? "Tudo" : "Por período"}</button>
        ))}
      </div>
      {mode === "period" && (
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}><Label>De</Label><input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputS} /></div>
          <div style={{ flex: 1 }}><Label>Até</Label><input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputS} /></div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={cancelS}>Cancelar</button>
        <button onClick={() => { const f = from ? new Date(from).getTime() : null; const t = to ? new Date(to).getTime() : null; onExport(f, t); }} style={primaryS}>Exportar</button>
      </div>
    </Overlay>
  );
}

// ═══ NAV ═══
function Nav() {
  const { view, setView, setSelCat, setSearch, setHistSearch, dark } = useUI();
  const navBg = dark ? "rgba(26,21,32,0.85)" : "rgba(255,255,255,0.7)";
  const navBorder = dark ? "rgba(139,94,107,0.12)" : "rgba(139,94,107,0.08)";
  const activeColor = dark ? "#C4848E" : "#8B5E6B";
  const inactiveColor = dark ? "#6B5A64" : "#BBA89E";
  return (
    <nav style={{ display: "flex", background: navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${navBorder}`, position: "sticky", top: 0, zIndex: 20, transition: "background 0.4s" }} role="tablist">
      {[{ id: "dashboard", label: "Painel", icon: "◈" }, { id: "stock", label: "Estoque", icon: "◉" }, { id: "history", label: "Histórico", icon: "◎" }, { id: "settings", label: "Config", icon: "◇" }].map(t => (
        <button key={t.id} role="tab" aria-selected={view === t.id} aria-label={t.label} onClick={() => { setView(t.id); setSelCat(null); setSearch(""); setHistSearch(""); }}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "12px 0 10px", border: "none", background: "none", cursor: "pointer", fontFamily: ff, transition: "all 0.3s cubic-bezier(.16,1,.3,1)", color: view === t.id ? activeColor : inactiveColor, borderBottom: view === t.id ? `2px solid ${activeColor}` : "2px solid transparent" }}>
          <span style={{ fontSize: 16, fontWeight: 300, fontFamily: display, transition: "all 0.3s cubic-bezier(.16,1,.3,1)", transform: view === t.id ? "scale(1.15)" : "scale(1)" }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ═══ DASHBOARD ═══
function DashboardView() {
  const { data, alerts, expiryAlerts, totalCapital } = useInv();
  const { setView, setSelCat, setModal } = useUI();
  const [period, setPeriod] = useState(30);
  const cutoff = daysAgo(period);
  const outs = useMemo(() => data.movements.filter(m => m.type === "out" && m.date >= cutoff), [data.movements, cutoff]);
  const totalOut = outs.reduce((s, m) => s + m.qty, 0);
  const cons = {}; outs.forEach(m => { cons[m.itemId] = (cons[m.itemId] || 0) + m.qty; });
  const top = Object.entries(cons).map(([id, qty]) => ({ item: data.items.find(i => i.id === id), qty })).filter(x => x.item).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const mx = top[0]?.qty || 1;
  const cats = CATEGORIES.map(c => ({ ...c, n: data.items.filter(i => i.category === c.id).length, q: data.items.filter(i => i.category === c.id).reduce((s, i) => s + calcQty(i), 0) }));

  return (
    <div>
      {/* Summary row: 3 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <FadeIn><Glass style={{ textAlign: "center", padding: "20px 12px" }}>
          <div style={{ fontSize: 36, fontWeight: 200, color: "#3D2B33", fontFamily: display, lineHeight: 1 }}>{data.items.length}</div>
          <div style={summLbl}>Insumos</div>
        </Glass></FadeIn>
        <FadeIn delay={60}><Glass style={{ textAlign: "center", padding: "20px 12px", borderColor: alerts.length > 0 ? "rgba(196,166,122,0.4)" : undefined }}>
          <div style={{ fontSize: 36, fontWeight: 200, color: alerts.length > 0 ? "#C4A67A" : "#BBA89E", fontFamily: display, lineHeight: 1 }}>{alerts.length}</div>
          <div style={summLbl}>Alertas</div>
        </Glass></FadeIn>
      </div>
      {/* Capital Imobilizado */}
      <FadeIn delay={90}>
        <Glass style={{ padding: "16px 18px", marginBottom: 16, background: "linear-gradient(135deg, rgba(139,94,107,0.04), rgba(107,155,138,0.04))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: "#8B5E6B", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontFamily: ff }}>Capital Imobilizado</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: "#3D2B33", fontFamily: display, lineHeight: 1 }}>{fmtBRL(totalCapital)}</div>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(139,94,107,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💰</div>
          </div>
          <div style={{ fontSize: 10, color: "#BBA89E", marginTop: 8, fontFamily: ff }}>Soma de (qtd × custo unitário) de todo estoque</div>
        </Glass>
      </FadeIn>

      {/* Expiry alerts */}
      {expiryAlerts.length > 0 && (
        <FadeIn delay={80}>
          <Sec style={{ color: "#C4848E" }}>Vencimento Próximo</Sec>
          <Glass style={{ padding: 14 }}>
            {expiryAlerts.slice(0, 4).map((ea, idx) => {
              const cat = getCat(ea.item.category);
              const expired = ea.days <= 0;
              return (
                <div key={ea.batch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: idx < Math.min(expiryAlerts.length, 4) - 1 ? "1px solid rgba(139,94,107,0.06)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#3D2B33", fontFamily: ff }}>{ea.item.name}</div>
                      <div style={{ fontSize: 10, color: "#BBA89E", fontFamily: ff }}>{ea.batch.lot ? `Lote ${ea.batch.lot} · ` : ""}{ea.batch.qty} {ea.item.unit}</div>
                    </div>
                  </div>
                  <div style={{ background: expired ? "#C4848E" : ea.days <= 7 ? "#C4A67A" : "#7A9BAF", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 12, fontFamily: ff, letterSpacing: 0.3 }}>
                    {expired ? "VENCIDO" : `${ea.days}d`}
                  </div>
                </div>
              );
            })}
          </Glass>
        </FadeIn>
      )}

      {/* Consumption */}
      <FadeIn delay={120}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: expiryAlerts.length > 0 ? 16 : 0 }}>
          <Sec>Consumo</Sec>
          <div style={{ display: "flex", background: "rgba(139,94,107,0.06)", borderRadius: 20, padding: 3 }}>
            {[7, 30].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: "4px 14px", borderRadius: 18, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, background: period === p ? "#fff" : "transparent", color: period === p ? "#8B5E6B" : "#BBA89E", boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.06)" : "none", transition: "all 0.25s" }}>{p}d</button>
            ))}
          </div>
        </div>
        <Glass style={{ padding: 18 }}>
          {top.length === 0 ? <p style={{ color: "#D4C5BE", fontSize: 13, textAlign: "center", margin: "8px 0", fontFamily: ff }}>Sem saídas no período</p> : <>
            <div style={{ fontSize: 12, color: "#BBA89E", marginBottom: 14, fontFamily: ff }}><span style={{ fontSize: 28, fontWeight: 200, color: "#3D2B33", fontFamily: display }}>{totalOut}</span><span style={{ marginLeft: 6 }}>unidades</span></div>
            {top.map(({ item, qty }, idx) => { const cat = getCat(item.category); return (
              <div key={item.id} style={{ marginBottom: idx < top.length - 1 ? 12 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, fontFamily: ff, color: "#5A4550" }}>{cat.icon} {item.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: ff, color: cat.color }}>{qty}</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: "rgba(139,94,107,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${(qty / mx) * 100}%`, background: `linear-gradient(90deg, ${cat.color}88, ${cat.color})`, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
                </div>
              </div>
            ); })}
          </>}
        </Glass>
      </FadeIn>

      {/* Categories */}
      <FadeIn delay={200}>
        <Sec style={{ marginTop: 24 }}>Categorias</Sec>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {cats.map((c, idx) => (
            <FadeIn key={c.id} delay={240 + idx * 50}>
              <button onClick={() => { setSelCat(c.id); setView("stock"); }} style={{ width: "100%", padding: "16px 12px", borderRadius: 16, border: "1px solid rgba(139,94,107,0.06)", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", cursor: "pointer", fontFamily: ff, textAlign: "center", transition: "all 0.25s", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{c.icon}</div>
                <span style={{ fontWeight: 600, fontSize: 12, color: "#3D2B33" }}>{c.label}</span>
                <span style={{ fontSize: 11, color: "#BBA89E" }}>{c.n} · {c.q} un.</span>
              </button>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {/* Low stock */}
      {alerts.length > 0 && (
        <FadeIn delay={500}>
          <Sec style={{ marginTop: 24, color: "#C4A67A" }}>Estoque Baixo</Sec>
          {alerts.map((item, idx) => { const cat = getCat(item.category); const q = calcQty(item); return (
            <FadeIn key={item.id} delay={520 + idx * 40}>
              <button onClick={() => setModal({ type: "move", payload: { item, defaultType: "in" } })} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(196,166,122,0.2)", background: "rgba(249,241,230,0.5)", cursor: "pointer", fontFamily: ff, textAlign: "left", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat.icon}</div>
                  <div><div style={{ fontWeight: 600, fontSize: 14, color: "#3D2B33" }}>{item.name}</div><div style={{ fontSize: 11, color: "#BBA89E", marginTop: 1 }}>{cat.label} · {item.unit}</div></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 200, fontSize: 26, color: q === 0 ? "#C4848E" : "#C4A67A", fontFamily: display, lineHeight: 1 }}>{q}</div>
                  <div style={{ fontSize: 9, color: "#BBA89E", letterSpacing: 0.5, marginTop: 3 }}>mín {item.minQty}</div>
                </div>
              </button>
            </FadeIn>
          ); })}
        </FadeIn>
      )}
    </div>
  );
}

// ═══ STOCK ═══
function StockView() {
  const { data, alertSet } = useInv();
  const { selCat, setSelCat, search, setSearch, setModal } = useUI();
  const [expandedId, setExpandedId] = useState(null);
  const scrollRef = useRef(null);
  const [showFade, setShowFade] = useState(false);

  const items = useMemo(() => data.items
    .filter(i => (!selCat || i.category === selCat) && (!search || i.name.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => { const d = (alertSet.has(a.id) ? 0 : 1) - (alertSet.has(b.id) ? 0 : 1); return d || a.name.localeCompare(b.name); })
  , [data.items, selCat, search, alertSet]);

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const ck = () => setShowFade(el.scrollWidth > el.clientWidth && el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    ck(); el.addEventListener("scroll", ck, { passive: true }); return () => el.removeEventListener("scroll", ck);
  }, []);

  const hasSearch = search.length > 0;
  const noResults = items.length === 0 && (hasSearch || selCat);
  const emptyList = items.length === 0 && !hasSearch && !selCat;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#BBA89E", pointerEvents: "none" }}>⌕</span>
          <input type="text" placeholder="Buscar insumo..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Buscar insumo"
            style={{ width: "100%", padding: "11px 14px 11px 36px", borderRadius: 14, border: "1px solid rgba(139,94,107,0.1)", fontSize: 14, fontFamily: ff, outline: "none", background: "rgba(255,255,255,0.7)", boxSizing: "border-box", color: "#3D2B33" }} />
        </div>
        <button onClick={() => setModal({ type: "add" })} aria-label="Cadastrar novo insumo" style={{ background: "linear-gradient(135deg, #8B5E6B, #A0707E)", color: "#fff", border: "none", borderRadius: 14, padding: "11px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: ff, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(139,94,107,0.2)" }}>+ Novo</button>
      </div>

      <div style={{ position: "relative" }}>
        <div ref={scrollRef} style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 14, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
          <Chip active={!selCat} onClick={() => setSelCat(null)}>Todos</Chip>
          {CATEGORIES.map(c => <Chip key={c.id} active={selCat === c.id} color={c.color} onClick={() => setSelCat(selCat === c.id ? null : c.id)}>{c.icon} {c.label}</Chip>)}
        </div>
        {showFade && <div style={{ position: "absolute", right: 0, top: 0, bottom: 14, width: 40, background: "linear-gradient(90deg, transparent, #F6F1ED)", pointerEvents: "none" }} />}
      </div>

      {emptyList && <EmptyState icon="📦" title="Nenhum insumo cadastrado" sub="Toque em '+ Novo' para começar" />}
      {noResults && <EmptyState icon="🔍" title="Nenhum resultado" sub={hasSearch ? `Nada para "${search}"` : `Nenhum item em ${getCat(selCat).label}`} />}

      {items.map((item, idx) => {
        const cat = getCat(item.category); const q = calcQty(item); const isAlert = alertSet.has(item.id); const open = expandedId === item.id;
        const hasBatches = item.batches?.length > 0;
        return (
          <FadeIn key={item.id} delay={idx * 30}>
            <Glass style={{ marginBottom: 8, padding: 0, borderLeft: `3px solid ${isAlert ? "#C4A67A" : cat.color + "30"}`, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "12px 14px 12px 16px" }}>
                <button onClick={() => setExpandedId(open ? null : item.id)} aria-label={`${item.name}, ${q} ${item.unit}`} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, border: "none", background: "none", cursor: "pointer", fontFamily: ff, textAlign: "left", padding: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#3D2B33", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#BBA89E", marginTop: 1 }}>
                      {cat.label} · {item.unit}
                      {item.presentation && <span style={{ color: "#94877E" }}> · {item.presentation}</span>}
                      {hasBatches && <span style={{ color: "#7A9BAF", marginLeft: 4 }}>· {item.batches.length} lote{item.batches.length > 1 ? "s" : ""}</span>}
                    </div>
                    {item.costPrice > 0 && <div style={{ fontSize: 9, color: "#8B5E6B", marginTop: 2, fontWeight: 500 }}>{fmtBRL(item.costPrice)}/un.</div>}
                    {/* Semaphore micro-bar */}
                    {(() => { const pct = item.minQty > 0 ? Math.min(100, (q / item.minQty) * 100) : 100; return (
                      <div style={{ height: 2, borderRadius: 2, background: "rgba(139,94,107,0.05)", overflow: "hidden", marginTop: 4, width: "70%" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: q === 0 ? "#C4848E" : pct < 70 ? "#C4A67A" : "#6B9B8A", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
                      </div>
                    ); })()}
                  </div>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setModal({ type: "move", payload: { item, defaultType: "out" } })} aria-label={`Registrar saída de ${item.name}`} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(139,94,107,0.1)", background: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↑</button>
                  <div style={{ textAlign: "right", minWidth: 36 }}>
                    <div style={{ fontWeight: 200, fontSize: 24, fontFamily: display, lineHeight: 1, color: q === 0 ? "#C4848E" : isAlert ? "#C4A67A" : "#3D2B33" }}>{q}</div>
                    {isAlert && <div style={{ fontSize: 8, color: "#C4A67A", fontWeight: 700, letterSpacing: 1, marginTop: 3, textTransform: "uppercase" }}>baixo</div>}
                  </div>
                </div>
              </div>
              {open && (
                <div style={{ animation: "fadeSlide 0.25s ease" }}>
                  {/* Conversion factor */}
                  {(item.unitsPerPack || 1) > 1 && (
                    <div style={{ padding: "6px 16px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12 }}>🔄</span>
                      <span style={{ fontSize: 10, color: "#7A9BAF", fontFamily: ff, fontWeight: 600 }}>1 embalagem = {item.unitsPerPack} {item.unit}</span>
                    </div>
                  )}
                  {/* Batch list */}
                  {hasBatches && (
                    <div style={{ padding: "0 16px 8px" }}>
                      {item.batches.sort((a, b) => { if (!a.expiryDate) return 1; if (!b.expiryDate) return -1; return new Date(a.expiryDate) - new Date(b.expiryDate); }).map(b => {
                        const d = daysUntil(b.expiryDate);
                        const expired = d <= 0 && b.expiryDate;
                        const soon = d > 0 && d <= 30;
                        return (
                          <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", marginBottom: 2, borderRadius: 8, background: expired ? "#FDF2F233" : soon ? "#F9F1E633" : "rgba(139,94,107,0.02)", fontSize: 11, fontFamily: ff }}>
                            <span style={{ color: "#5A4550" }}>{b.lot ? `Lote ${b.lot}` : "Sem lote"} · {b.qty} {item.unit}</span>
                            {b.expiryDate && <span style={{ color: expired ? "#C4848E" : soon ? "#C4A67A" : "#BBA89E", fontWeight: 600, fontSize: 10 }}>{expired ? "VENCIDO" : `val ${fmtExpiry(b.expiryDate)}`}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", flexWrap: "wrap" }}>
                    <APill color="#6B9B8A" onClick={() => setModal({ type: "move", payload: { item, defaultType: "in" } })}>↓ Entrada</APill>
                    <APill color="#8B5E6B" onClick={() => setModal({ type: "move", payload: { item, defaultType: "out" } })}>↑ Saída</APill>
                    <APill color="#BBA89E" onClick={() => setModal({ type: "edit", payload: item })}>✎ Editar</APill>
                    <APill color="#C4848E" onClick={() => setModal({ type: "delete", payload: item })}>✕</APill>
                  </div>
                </div>
              )}
            </Glass>
          </FadeIn>
        );
      })}
    </div>
  );
}

// ═══ HISTORY (uses snapshot _name/_cat) ═══
function HistoryView() {
  const { data } = useInv();
  const { histSearch, setHistSearch } = useUI();
  const movements = useMemo(() => data.movements.filter(m => {
    if (!histSearch) return true;
    const name = m._name || data.items.find(i => i.id === m.itemId)?.name || "";
    return name.toLowerCase().includes(histSearch.toLowerCase()) || m.note?.toLowerCase().includes(histSearch.toLowerCase());
  }).slice(0, 80), [data, histSearch]);
  const hasSearch = histSearch.length > 0;

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#BBA89E", pointerEvents: "none" }}>⌕</span>
        <input type="text" placeholder="Buscar movimentação..." value={histSearch} onChange={e => setHistSearch(e.target.value)} aria-label="Buscar movimentação"
          style={{ width: "100%", padding: "11px 14px 11px 36px", borderRadius: 14, border: "1px solid rgba(139,94,107,0.1)", fontSize: 14, fontFamily: ff, outline: "none", background: "rgba(255,255,255,0.7)", boxSizing: "border-box", color: "#3D2B33" }} />
      </div>
      <Sec>Movimentações</Sec>
      {movements.length === 0 ? <EmptyState icon={hasSearch ? "🔍" : "📋"} title={hasSearch ? "Nenhum resultado" : "Sem movimentações"} sub={hasSearch ? `Nada para "${histSearch}"` : "Registre entradas e saídas"} /> :
        movements.map((m, idx) => {
          // Use snapshot fields, fallback to live data for old records
          const name = m._name || data.items.find(i => i.id === m.itemId)?.name || "Item removido";
          const catId = m._cat || data.items.find(i => i.id === m.itemId)?.category || "toxinas";
          const cat = getCat(catId);
          const isIn = m.type === "in";
          const lots = m.consumedLots || [];
          return (
            <FadeIn key={m.id} delay={idx * 20}>
              <Glass style={{ marginBottom: 6, padding: "11px 16px", borderLeft: `3px solid ${cat.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isIn ? "#E8F4EF" : "#F5E6EA", fontSize: 13, fontFamily: display, fontWeight: 300, color: isIn ? "#6B9B8A" : "#C4848E" }}>{isIn ? "↓" : "↑"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#3D2B33", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                      <div style={{ fontSize: 10, color: "#BBA89E", marginTop: 2 }}>{fmtDate(m.date)}{m._by ? <span style={{ color: "#8B5E6B", fontWeight: 600 }}> · {m._by}</span> : ""}{m.note ? ` · ${m.note}` : ""}</div>
                      {lots.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                          {lots.map((l, li) => (
                            <span key={li} style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: "rgba(139,94,107,0.06)", color: "#8B5E6B", letterSpacing: 0.2, fontFamily: ff }}>
                              {l.lot || "s/lote"}: −{l.consumed}{l.expiryDate ? ` (${fmtExpiry(l.expiryDate)})` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontWeight: 200, fontSize: 20, fontFamily: display, color: isIn ? "#6B9B8A" : "#C4848E", flexShrink: 0, marginLeft: 8 }}>{isIn ? "+" : "−"}{m.qty}</span>
                </div>
              </Glass>
            </FadeIn>
          );
        })}
    </div>
  );
}

// ═══ MODALS ROUTER ═══
function Modals() {
  const { addItem, updateItem, deleteItem, addMovement } = useInv();
  const { modal, setModal, selCat } = useUI();
  if (!modal) return null;
  switch (modal.type) {
    case "add": return <ItemForm onSave={addItem} onClose={() => setModal(null)} defaultCat={selCat} />;
    case "edit": return <ItemForm item={modal.payload} onSave={updateItem} onClose={() => setModal(null)} />;
    case "move": return <MoveModal item={modal.payload.item} defaultType={modal.payload.defaultType} onSave={addMovement} onClose={() => setModal(null)} />;
    case "delete": return <DeleteModal item={modal.payload} onConfirm={() => deleteItem(modal.payload.id)} onClose={() => setModal(null)} />;
    default: return null;
  }
}

// ═══ OVERLAY (focus trap + escape) ═══
function Overlay({ children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    // Focus trap
    const el = ref.current; if (!el) return;
    const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (first) first.focus();
    const trap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    el.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", handler); el.removeEventListener("keydown", trap); };
  }, [onClose]);

  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(44,30,36,0.45)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "overlayIn 0.25s ease" }}>
      <div ref={ref} onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg, #FDFAF8 0%, #F7F2EE 100%)", borderRadius: "24px 24px 0 0", padding: "28px 22px 36px", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", animation: "sheetUp 0.35s cubic-bezier(.4,0,.2,1)", boxShadow: "0 -8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E8DDD6", margin: "0 auto 20px" }} />
        {children}
      </div>
    </div>
  );
}

// ═══ ITEM FORM (Catalog-powered autocomplete) ═══
function ItemForm({ item, onSave, onClose, defaultCat }) {
  const [mode, setMode] = useState(item ? "custom" : "catalog"); // catalog | custom
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Form fields (auto-filled from catalog or manual)
  const [name, setName] = useState(item?.name || "");
  const [cat, setCat] = useState(item?.category || defaultCat || "toxinas");
  const [unit, setUnit] = useState(item?.unit || "un.");
  const [presentation, setPresentation] = useState(item?.presentation || "");
  const [unitsPerPack, setUnitsPerPack] = useState(item?.unitsPerPack?.toString() || "1");
  const [curQty, setCurQty] = useState(item?.currentQty?.toString() || "0");
  const [minQty, setMinQty] = useState(item?.minQty?.toString() || "5");
  const [regRef, setRegRef] = useState(item?.regRef || "");
  const [maker, setMaker] = useState(item?.maker || "");
  const [costPrice, setCostPrice] = useState(item?.costPrice?.toString() || "");

  const inputRef = useRef(null);

  // Fuzzy search catalog
  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return PRODUCT_CATALOG.filter(p =>
      p.brand.toLowerCase().includes(q) ||
      p.maker.toLowerCase().includes(q) ||
      p.presentation.toLowerCase().includes(q) ||
      p.regRef.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const selectFromCatalog = (prod) => {
    setSelectedProduct(prod);
    setName(`${prod.brand} ${prod.presentation}`);
    setCat(prod.category);
    setUnit(prod.unit);
    setPresentation(prod.presentation);
    setUnitsPerPack(String(prod.unitsPerPack));
    setRegRef(prod.regRef);
    setMaker(prod.maker);
    setQuery(prod.brand);
    setShowResults(false);
  };

  const clearCatalog = () => {
    setSelectedProduct(null);
    setName(""); setCat(defaultCat || "toxinas"); setUnit("un.");
    setPresentation(""); setUnitsPerPack("1"); setRegRef(""); setMaker("");
    setQuery("");
  };

  const save = () => {
    if (!name.trim()) return;
    onSave({
      ...(item || {}),
      name: name.trim(),
      category: cat,
      unit,
      presentation,
      unitsPerPack: Math.max(1, parseInt(unitsPerPack) || 1),
      regRef,
      maker,
      catalogId: selectedProduct?.id || item?.catalogId || null,
      currentQty: Math.max(0, parseInt(curQty) || 0),
      minQty: Math.max(0, parseInt(minQty) || 0),
      costPrice: Math.max(0, parseFloat(costPrice) || 0),
      batches: item?.batches || [],
    });
  };

  const upp = parseInt(unitsPerPack) || 1;

  return (
    <Overlay onClose={onClose}>
      <h3 style={mTitle}>{item ? "Editar Insumo" : "Novo Insumo"}</h3>

      {/* Mode toggle (only for new items) */}
      {!item && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[{ id: "catalog", label: "Catálogo ANVISA" }, { id: "custom", label: "Personalizado" }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); if (m.id === "custom") clearCatalog(); }}
              style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all 0.25s", letterSpacing: 0.3, background: mode === m.id ? "#8B5E6B" : "transparent", color: mode === m.id ? "#fff" : "#8B5E6B", borderColor: mode === m.id ? "#8B5E6B" : "#8B5E6B33" }}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Catalog search */}
      {mode === "catalog" && !item && (
        <div style={{ marginBottom: 14 }}>
          <Label>Buscar Produto</Label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#BBA89E", pointerEvents: "none" }}>⌕</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowResults(true); if (selectedProduct) { setSelectedProduct(null); setName(""); } }}
                onFocus={() => setShowResults(true)}
                placeholder="Ex: Botox, Juvéderm, Sculptra..."
                aria-label="Buscar produto no catálogo"
                style={{ ...inputS, paddingLeft: 34, background: selectedProduct ? "#E8F4EF" : "rgba(255,255,255,0.5)" }}
              />
              {selectedProduct && (
                <button onClick={clearCatalog} aria-label="Limpar seleção" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6B9B8A", fontSize: 16, fontWeight: 700 }}>✕</button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {showResults && results.length > 0 && !selectedProduct && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#FDFAF8", borderRadius: "0 0 14px 14px", border: "1.5px solid rgba(139,94,107,0.12)", borderTop: "none", maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                {results.map(p => {
                  const cat = getCat(p.category);
                  return (
                    <button key={p.id} onClick={() => selectFromCatalog(p)}
                      style={{ width: "100%", padding: "10px 14px", border: "none", borderBottom: "1px solid rgba(139,94,107,0.04)", background: "none", cursor: "pointer", fontFamily: ff, textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(139,94,107,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{cat.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#3D2B33", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.brand}</div>
                        <div style={{ fontSize: 10, color: "#BBA89E", marginTop: 1 }}>{p.maker} · {p.presentation}{p.unitsPerPack > 1 ? ` (${p.unitsPerPack} un./emb.)` : ""}</div>
                      </div>
                      <span style={{ fontSize: 9, color: "#7A9BAF", fontWeight: 600, flexShrink: 0, letterSpacing: 0.3 }}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {showResults && query.length >= 2 && results.length === 0 && !selectedProduct && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#FDFAF8", borderRadius: "0 0 14px 14px", border: "1.5px solid rgba(139,94,107,0.12)", borderTop: "none", padding: "12px 14px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#BBA89E", fontFamily: ff, margin: 0 }}>Produto não encontrado</p>
                <button onClick={() => { setMode("custom"); setQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: ff, fontSize: 12, color: "#8B5E6B", fontWeight: 600, marginTop: 4, padding: 0 }}>Cadastrar manualmente →</button>
              </div>
            )}
          </div>

          {/* Selected product summary */}
          {selectedProduct && (
            <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(107,155,138,0.06)", border: "1px solid rgba(107,155,138,0.12)", animation: "fadeSlide 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#3D2B33", fontFamily: ff }}>{selectedProduct.brand}</div>
                  <div style={{ fontSize: 11, color: "#BBA89E", fontFamily: ff, marginTop: 2 }}>{selectedProduct.maker} · {selectedProduct.presentation}</div>
                </div>
                <span style={{ fontSize: 9, color: "#6B9B8A", fontWeight: 600, background: "#E8F4EF", padding: "3px 8px", borderRadius: 8, letterSpacing: 0.3, fontFamily: ff }}>ANVISA</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <MiniTag label="Categoria" value={getCat(selectedProduct.category).label} />
                <MiniTag label="Unidade" value={selectedProduct.unit} />
                <MiniTag label="Ref." value={selectedProduct.regRef} />
                {selectedProduct.unitsPerPack > 1 && <MiniTag label="Un./Emb." value={`${selectedProduct.unitsPerPack}`} accent />}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual fields (always shown for custom, or when editing) */}
      {(mode === "custom" || item) && (
        <>
          <Label>Nome</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Botox 100U" autoFocus={mode === "custom"} />
        </>
      )}

      {/* Editable fields — pre-filled from catalog but editable */}
      {(selectedProduct || mode === "custom" || item) && (
        <>
          <Label>Categoria</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)} style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all 0.2s", background: cat === c.id ? c.color : "transparent", color: cat === c.id ? "#fff" : c.color, borderColor: cat === c.id ? c.color : c.color + "44" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Label>Unidade de Consumo</Label>
              <select value={unit} onChange={e => setUnit(e.target.value)} style={inputS} aria-label="Unidade de medida">
                {["un.", "cx.", "pct.", "fr.", "amp.", "ml", "par"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <Label>Un./Embalagem</Label>
              <Input type="number" value={unitsPerPack} onChange={e => setUnitsPerPack(e.target.value)} min="1" />
            </div>
          </div>

          {/* Conversion explainer */}
          {upp > 1 && (
            <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(122,155,175,0.08)", border: "1px solid rgba(122,155,175,0.12)", marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔄</span>
              <p style={{ fontSize: 11, color: "#5A4550", fontFamily: ff, margin: 0 }}>
                Cada entrada de <strong>1 embalagem</strong> converte para <strong>{upp} {unit}</strong> no estoque ativo
              </p>
            </div>
          )}

          {(mode === "custom" || item) && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Label>Apresentação</Label><Input value={presentation} onChange={e => setPresentation(e.target.value)} placeholder="Ex: Seringa 1mL" /></div>
              <div style={{ flex: 1 }}><Label>Fabricante</Label><Input value={maker} onChange={e => setMaker(e.target.value)} placeholder="Ex: Allergan" /></div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            {!item && <div style={{ flex: 1 }}><Label>Qtd Inicial ({unit})</Label><Input type="number" value={curQty} onChange={e => setCurQty(e.target.value)} min="0" /></div>}
            <div style={{ flex: 1 }}><Label>Qtd Mínima ({unit})</Label><Input type="number" value={minQty} onChange={e => setMinQty(e.target.value)} min="0" /></div>
            <div style={{ flex: 1 }}><Label>Custo Un. (R$)</Label><Input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" /></div>
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onClose} style={cancelS}>Cancelar</button>
        <button onClick={save} disabled={!name.trim()} style={{ ...primaryS, opacity: name.trim() ? 1 : 0.5 }}>{item ? "Salvar" : "Cadastrar"}</button>
      </div>
    </Overlay>
  );
}

// Mini info tag for catalog summary
function MiniTag({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span style={{ fontSize: 8, color: "#BBA89E", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", fontFamily: ff }}>{label}</span>
      <span style={{ fontSize: 11, color: accent ? "#6B9B8A" : "#5A4550", fontWeight: accent ? 700 : 500, fontFamily: ff }}>{value}</span>
    </div>
  );
}

// ═══ MOVE MODAL (with optional batch + unit conversion) ═══
function MoveModal({ item, defaultType, onSave, onClose }) {
  const { data } = useInv();
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [type, setType] = useState(defaultType);
  const [lot, setLot] = useState("");
  const [expiry, setExpiry] = useState("");
  const [showBatch, setShowBatch] = useState(false);
  const [entryMode, setEntryMode] = useState("units");
  const [byPro, setByPro] = useState("");

  const numQty = Math.max(1, parseInt(qty) || 1);
  const stock = calcQty(item);
  const upp = item.unitsPerPack || 1;
  const hasConversion = upp > 1;

  const effectiveQty = (type === "in" && entryMode === "packs" && hasConversion) ? numQty * upp : numQty;
  const overStock = type === "out" && effectiveQty > stock;

  const save = () => {
    if (overStock) return;
    const batchInfo = (type === "in" && showBatch && (lot || expiry)) ? { lot, expiryDate: expiry } : null;
    onSave(item.id, effectiveQty, type, note.trim(), batchInfo, byPro);
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={mTitle}>{type === "in" ? "Entrada" : "Saída"} — {item.name}</h3>
      <p style={{ fontSize: 13, color: "#BBA89E", fontFamily: ff, margin: "0 0 4px" }}>Estoque atual: <strong style={{ color: "#3D2B33" }}>{stock} {item.unit}</strong>
        {item.batches?.length > 0 && <span style={{ color: "#7A9BAF" }}> · {item.batches.length} lote{item.batches.length > 1 ? "s" : ""}</span>}
      </p>
      {item.presentation && <p style={{ fontSize: 11, color: "#BBA89E", fontFamily: ff, margin: "0 0 14px" }}>{item.maker ? `${item.maker} · ` : ""}{item.presentation}</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["in", "out"].map(t => (
          <button key={t} onClick={() => { setType(t); setEntryMode("units"); }} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all 0.25s", background: type === t ? (t === "in" ? "#6B9B8A" : "#8B5E6B") : "transparent", color: type === t ? "#fff" : (t === "in" ? "#6B9B8A" : "#8B5E6B"), borderColor: type === t ? (t === "in" ? "#6B9B8A" : "#8B5E6B") : (t === "in" ? "#6B9B8A33" : "#8B5E6B33") }}>
            {t === "in" ? "↓ Entrada" : "↑ Saída"}
          </button>
        ))}
      </div>

      {/* Entry mode toggle for products with conversion */}
      {type === "in" && hasConversion && (
        <div style={{ marginBottom: 14 }}>
          <Label>Modo de entrada</Label>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setEntryMode("packs")} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1.5px solid", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all 0.2s", background: entryMode === "packs" ? "#7A9BAF" : "transparent", color: entryMode === "packs" ? "#fff" : "#7A9BAF", borderColor: entryMode === "packs" ? "#7A9BAF" : "#7A9BAF33" }}>
              📦 Embalagens
            </button>
            <button onClick={() => setEntryMode("units")} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1.5px solid", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all 0.2s", background: entryMode === "units" ? "#7A9BAF" : "transparent", color: entryMode === "units" ? "#fff" : "#7A9BAF", borderColor: entryMode === "units" ? "#7A9BAF" : "#7A9BAF33" }}>
              🔢 Unidades ({item.unit})
            </button>
          </div>
        </div>
      )}

      <Label>Quantidade {type === "in" && entryMode === "packs" && hasConversion ? "(embalagens)" : `(${item.unit})`}</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setQty(String(Math.max(1, numQty - 1)))} aria-label="Diminuir quantidade" style={qtyS}>−</button>
        <input type="number" value={qty} onChange={e => setQty(e.target.value)} aria-label="Quantidade" style={{ ...inputS, textAlign: "center", fontSize: 26, fontWeight: 200, fontFamily: display, flex: 1, borderColor: overStock ? "#C4848E55" : undefined }} min="1" />
        <button onClick={() => setQty(String(numQty + 1))} aria-label="Aumentar quantidade" style={qtyS}>+</button>
      </div>

      {/* Conversion preview */}
      {type === "in" && entryMode === "packs" && hasConversion && (
        <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(122,155,175,0.06)", border: "1px solid rgba(122,155,175,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔄</span>
          <div style={{ fontFamily: ff }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3D2B33" }}>{numQty} emb. × {upp} = <span style={{ color: "#6B9B8A" }}>{effectiveQty} {item.unit}</span></div>
            <div style={{ fontSize: 10, color: "#BBA89E", marginTop: 1 }}>Serão adicionadas {effectiveQty} unidades ao estoque</div>
          </div>
        </div>
      )}

      {overStock && <p style={{ color: "#C4848E", fontSize: 12, fontFamily: ff, margin: "6px 0 0", fontWeight: 600 }}>⚠ Estoque insuficiente (disponível: {stock})</p>}

      {/* Optional batch for entries */}
      {type === "in" && (
        <div style={{ marginTop: 14 }}>
          <button onClick={() => setShowBatch(!showBatch)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: ff, fontSize: 12, color: "#7A9BAF", fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ transform: showBatch ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>▸</span>
            Informar lote e validade (opcional)
          </button>
          {showBatch && (
            <div style={{ display: "flex", gap: 12, marginTop: 8, animation: "fadeSlide 0.2s ease" }}>
              <div style={{ flex: 1 }}><Label>Lote</Label><Input value={lot} onChange={e => setLot(e.target.value)} placeholder="Ex: AB1234" /></div>
              <div style={{ flex: 1 }}><Label>Validade</Label><input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} style={inputS} aria-label="Data de validade" /></div>
            </div>
          )}
        </div>
      )}

      {/* FIFO preview for exits */}
      {type === "out" && item.batches?.length > 0 && !overStock && numQty > 0 && (
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(139,94,107,0.03)", border: "1px solid rgba(139,94,107,0.06)" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#8B5E6B", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: ff }}>Saída FIFO (mais próximo do vencimento primeiro)</div>
          {(() => {
            const sorted = [...item.batches].sort((a, b) => {
              if (!a.expiryDate && !b.expiryDate) return (a.createdAt || 0) - (b.createdAt || 0);
              if (!a.expiryDate) return 1; if (!b.expiryDate) return -1;
              return new Date(a.expiryDate) - new Date(b.expiryDate);
            });
            let rem = effectiveQty;
            return sorted.map(b => {
              if (rem <= 0) return null;
              const take = Math.min(b.qty, rem); rem -= take;
              return (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: ff, padding: "2px 0", color: "#5A4550" }}>
                  <span>{b.lot ? `Lote ${b.lot}` : "Sem lote"}{b.expiryDate ? ` · val ${fmtExpiry(b.expiryDate)}` : ""}</span>
                  <span style={{ fontWeight: 700, color: "#C4848E" }}>−{take}</span>
                </div>
              );
            }).filter(Boolean);
          })()}
        </div>
      )}

      {/* Professional selector */}
      {data.professionals?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Label>Profissional</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.professionals.map(p => (
              <button key={p} onClick={() => setByPro(byPro === p ? "" : p)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all 0.2s", letterSpacing: 0.3, background: byPro === p ? "#8B5E6B" : "transparent", color: byPro === p ? "#fff" : "#8B5E6B", borderColor: byPro === p ? "#8B5E6B" : "rgba(139,94,107,0.15)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <Label>Observação (opcional)</Label>
      <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Compra fornecedor" />

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onClose} style={cancelS}>Cancelar</button>
        <button onClick={save} disabled={overStock} style={{ ...primaryS, background: overStock ? "#D4C5BE" : type === "in" ? "linear-gradient(135deg,#6B9B8A,#7DAF9C)" : "linear-gradient(135deg,#8B5E6B,#A0707E)", cursor: overStock ? "not-allowed" : "pointer" }}>Confirmar</button>
      </div>
    </Overlay>
  );
}

// ═══ DELETE MODAL ═══
function DeleteModal({ item, onConfirm, onClose }) {
  const { data } = useInv();
  const movCount = data.movements.filter(m => m.itemId === item.id).length;
  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: "#F5E6EA", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>✕</div>
        <h3 style={{ ...mTitle, textAlign: "center" }}>Remover insumo?</h3>
        <p style={{ fontSize: 14, color: "#BBA89E", fontFamily: ff, margin: "0 0 8px" }}><strong style={{ color: "#3D2B33" }}>{item.name}</strong> será permanentemente removido.</p>
        {movCount > 0 && (
          <div style={{ background: "#FDF2F2", borderRadius: 12, padding: "10px 14px", margin: "12px 0 6px", border: "1px solid #F5E6EA" }}>
            <p style={{ fontSize: 13, color: "#C4848E", fontFamily: ff, margin: 0, fontWeight: 600 }}>⚠ {movCount} movimentação{movCount > 1 ? "ões" : ""} será{movCount > 1 ? "ão" : ""} apagada{movCount > 1 ? "s" : ""}</p>
            <p style={{ fontSize: 11, color: "#BBA89E", fontFamily: ff, margin: "4px 0 0" }}>Dados contábeis serão perdidos permanentemente</p>
          </div>
        )}
        <p style={{ fontSize: 12, color: "#C4848E", fontFamily: ff, margin: "8px 0 24px" }}>Esta ação não pode ser desfeita.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={cancelS}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...primaryS, background: "linear-gradient(135deg,#C4848E,#B0707A)" }}>Sim, remover</button>
        </div>
      </div>
    </Overlay>
  );
}

// ═══ SETTINGS VIEW ═══
function SettingsView() {
  const { data, addPro, removePro } = useInv();
  const { dark, toggleDark } = useUI();
  const [newPro, setNewPro] = useState("");

  const handleAdd = () => {
    if (newPro.trim()) { addPro(newPro.trim()); setNewPro(""); }
  };

  return (
    <div>
      <Sec>Aparência</Sec>
      <FadeIn>
        <Glass style={{ padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: dark ? "#F0E8E4" : "#3D2B33", fontFamily: ff }}>Modo Escuro</div>
              <div style={{ fontSize: 11, color: "#BBA89E", marginTop: 2, fontFamily: ff }}>Reduz brilho para uso noturno</div>
            </div>
            <button onClick={toggleDark} aria-label="Toggle dark mode"
              style={{ width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer", position: "relative", background: dark ? "linear-gradient(135deg,#8B5E6B,#A0707E)" : "rgba(139,94,107,0.15)", transition: "background 0.3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: "#fff", position: "absolute", top: 3, left: dark ? 27 : 3, transition: "left 0.3s cubic-bezier(.16,1,.3,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
            </button>
          </div>
        </Glass>
      </FadeIn>

      <Sec style={{ marginTop: 24 }}>Profissionais</Sec>
      <FadeIn delay={60}>
        <Glass style={{ padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#BBA89E", marginBottom: 12, fontFamily: ff }}>Equipe que pode registrar movimentações</div>

          {/* List */}
          {(data.professionals || []).map((p, idx) => (
            <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < data.professionals.length - 1 ? "1px solid rgba(139,94,107,0.06)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `hsl(${idx * 47 + 340}, 30%, ${dark ? "30%" : "92%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: dark ? "#F0E8E4" : "#5A4550", fontFamily: ff }}>{p.charAt(0)}</div>
                <span style={{ fontWeight: 600, fontSize: 14, color: dark ? "#F0E8E4" : "#3D2B33", fontFamily: ff }}>{p}</span>
              </div>
              <button onClick={() => { if (confirm(`Remover ${p}?`)) removePro(p); }} aria-label={`Remover ${p}`}
                style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(196,132,142,0.15)", background: "transparent", cursor: "pointer", fontSize: 12, color: "#C4848E", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ))}

          {/* Add new */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Input value={newPro} onChange={e => setNewPro(e.target.value)} placeholder="Nome da profissional"
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              style={{ flex: 1 }} />
            <button onClick={handleAdd} disabled={!newPro.trim()}
              style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: newPro.trim() ? "linear-gradient(135deg,#8B5E6B,#A0707E)" : "rgba(139,94,107,0.1)", color: newPro.trim() ? "#fff" : "#BBA89E", fontWeight: 600, fontSize: 13, cursor: newPro.trim() ? "pointer" : "not-allowed", fontFamily: ff, transition: "all 0.2s" }}>+</button>
          </div>
        </Glass>
      </FadeIn>

      <FadeIn delay={120}>
        <Sec style={{ marginTop: 24 }}>Sobre</Sec>
        <Glass style={{ padding: "16px 18px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: display, fontSize: 24, fontWeight: 300, letterSpacing: 6, color: dark ? "#C4848E" : "#8B5E6B", marginBottom: 4 }}>SKYN</div>
            <div style={{ fontSize: 11, color: "#BBA89E", fontFamily: ff }}>Controle de Insumos v7</div>
            <div style={{ fontSize: 10, color: "#BBA89E", fontFamily: ff, marginTop: 8 }}>Catálogo ANVISA · FIFO · Rastreabilidade</div>
          </div>
        </Glass>
      </FadeIn>
    </div>
  );
}

// ═══ ONBOARDING ═══
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "💉", title: "Catálogo ANVISA", desc: "35 produtos pré-cadastrados com marcas, apresentações e conversão de embalagem automática." },
    { icon: "🔄", title: "FIFO Inteligente", desc: "Saídas consomem automaticamente os lotes mais próximos do vencimento, com rastreabilidade completa." },
    { icon: "👥", title: "Multi-profissional", desc: "Registre quem realizou cada movimentação. Gerencie a equipe em Configurações." },
    { icon: "📊", title: "Gestão Completa", desc: "Capital imobilizado, alertas de estoque, validade, exportação CSV e modo escuro." },
  ];
  const cur = steps[step];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(44,30,36,0.6)", backdropFilter: "blur(12px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "overlayIn 0.3s ease" }}>
      <div style={{ background: "linear-gradient(180deg, #FDFAF8, #F5F0EB)", borderRadius: 24, padding: "36px 28px 28px", width: "calc(100% - 48px)", maxWidth: 380, textAlign: "center", animation: "sheetUp 0.4s cubic-bezier(.16,1,.3,1)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(139,94,107,0.06)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 16, transition: "all 0.3s" }}>{cur.icon}</div>
        <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 300, color: "#3D2B33", margin: "0 0 8px", letterSpacing: 0.5 }}>{cur.title}</h3>
        <p style={{ fontSize: 14, color: "#BBA89E", fontFamily: ff, margin: "0 0 24px", lineHeight: 1.6 }}>{cur.desc}</p>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? "#8B5E6B" : "rgba(139,94,107,0.15)", transition: "all 0.3s cubic-bezier(.16,1,.3,1)" }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ ...cancelS, flex: 1 }}>Voltar</button>
          )}
          <button onClick={() => { if (step < steps.length - 1) setStep(step + 1); else onDone(); }}
            style={{ ...primaryS, flex: 2 }}>
            {step < steps.length - 1 ? "Próximo" : "Começar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ SHARED ═══
function Glass({ children, style = {} }) {
  const { dark } = useUI();
  const base = dark
    ? { background: "rgba(40,30,42,0.6)", border: "1px solid rgba(255,255,255,0.06)" }
    : { background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.25)" };
  return <div style={{ ...base, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 16, padding: 16, boxShadow: "0 1px 12px rgba(0,0,0,0.02), 0 0 0 1px rgba(139,94,107,0.03) inset", transition: "background 0.4s, border 0.4s", ...style }}>{children}</div>;
}
function Sec({ children, style = {} }) { return <div style={{ fontSize: 11, fontWeight: 600, color: "#8B5E6B", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px", fontFamily: ff, ...style }}>{children}</div>; }
function Chip({ children, active, color, onClick }) { return <button onClick={onClick} style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.25s", background: active ? (color || "#8B5E6B") : "rgba(255,255,255,0.6)", color: active ? "#fff" : (color || "#8B5E6B"), borderColor: active ? (color || "#8B5E6B") : "rgba(139,94,107,0.15)" }}>{children}</button>; }
function APill({ children, color, onClick }) { return <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, background: color + "18", color, transition: "all 0.2s" }}>{children}</button>; }
function Label({ children }) { return <div style={{ fontSize: 10, fontWeight: 600, color: "#8B5E6B", display: "block", margin: "14px 0 6px", letterSpacing: 1.5, fontFamily: ff, textTransform: "uppercase" }}>{children}</div>; }
function Input(props) { return <input {...props} style={{ ...inputS, ...(props.style || {}) }} />; }
function EmptyState({ icon, title, sub }) { return <div style={{ textAlign: "center", padding: "48px 0" }}><div style={{ width: 64, height: 64, borderRadius: 20, background: "#F5E6EA", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 12 }}>{icon}</div><p style={{ color: "#8B5E6B", fontFamily: ff, fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{title}</p><p style={{ color: "#BBA89E", fontFamily: ff, fontSize: 13, margin: 0 }}>{sub}</p></div>; }

const ff = "'Outfit', 'Helvetica Neue', sans-serif";
const display = "'Cormorant Garamond', Georgia, serif";
const summLbl = { fontSize: 10, color: "#BBA89E", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 6, fontFamily: ff };
const inputS = { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(139,94,107,0.12)", fontSize: 15, fontFamily: ff, outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.5)", color: "#3D2B33", transition: "border-color 0.2s" };
const mTitle = { fontSize: 20, fontWeight: 300, color: "#3D2B33", margin: "0 0 8px", fontFamily: display, letterSpacing: 0.5 };
const cancelS = { flex: 1, padding: 13, borderRadius: 14, border: "1.5px solid rgba(139,94,107,0.12)", background: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: ff, color: "#BBA89E" };
const primaryS = { flex: 2, padding: 13, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#8B5E6B,#A0707E)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 4px 16px rgba(139,94,107,0.2)" };
const qtyS = { width: 48, height: 48, borderRadius: 14, border: "1.5px solid rgba(139,94,107,0.12)", background: "rgba(255,255,255,0.5)", fontSize: 22, cursor: "pointer", fontFamily: display, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300, color: "#3D2B33" };

if (typeof document !== "undefined" && !document.getElementById("skyn-v6")) {
  const s = document.createElement("style"); s.id = "skyn-v6";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes overlayIn{from{opacity:0}to{opacity:1}}
    @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
    input[type=number]{-moz-appearance:textfield}
    ::-webkit-scrollbar{display:none}
    input:focus,select:focus{border-color:rgba(139,94,107,.4)!important;box-shadow:0 0 0 3px rgba(139,94,107,.06)!important}
    button{transition:all .2s cubic-bezier(.16,1,.3,1)}
    button:active{transform:scale(.97)!important}
    button:hover{filter:brightness(1.02)}
  `;
  document.head.appendChild(s);
}
