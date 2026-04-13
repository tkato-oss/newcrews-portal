import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ============================================================
// NaviCrew Admin Console — MVP
// Lambda API直結の管理画面
// ============================================================

const IS_DEV = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
// Dev: Vite proxy → Lambda direct, Prod: Vercel serverless function proxy (API key is server-side only)
const API_BASE = IS_DEV ? "/navi-api" : "";
const API_KEY = IS_DEV ? (import.meta.env.VITE_NAVI_API_KEY || "") : ""; // Prod uses server-side proxy, no key needed

const C = {
  rose: "#c9728a", sage: "#7d9e83", amber: "#c4956a", sky: "#7ba3c4",
  lavender: "#a48bb5", coral: "#d4887a", text: "#3d3330", textMid: "#6b5e59",
  textSoft: "#8a7d78", textFaint: "#b5aba6", borderSoft: "#e8ddd5",
  bg: "#fdf5f8", bgCard: "rgba(255,255,255,0.85)", white: "#fff",
};

const FONT = {
  heading: "'Cormorant Garamond', serif",
  body: "'Noto Sans JP', sans-serif",
  ui: "'Jost', sans-serif",
};

// ============================================================
// API Helper
// ============================================================
async function api(path, payload) {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY; // Dev only; Prod uses server-side proxy
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers,
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ============================================================
// localStorage hook
// ============================================================
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      if (s !== null) return JSON.parse(s);
    } catch {}
    return typeof initial === "function" ? initial() : initial;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ============================================================
// Main App
// ============================================================
export default function AdminApp() {
  const [tab, setTab] = useState("dashboard");
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchKnowledge = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/api/navi/history", {});
      setKnowledge(Array.isArray(data) ? data : []);
      setLastFetch(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKnowledge(); }, [fetchKnowledge]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getTime() - 7 * 86400000);
    const todayItems = knowledge.filter(k => new Date(k.createdAt) >= today);
    const weekItems = knowledge.filter(k => new Date(k.createdAt) >= week);
    const escalated = knowledge.filter(k => k.status === "escalated");
    const resolved = knowledge.filter(k => k.status === "resolved");
    const byBot = knowledge.filter(k => k.answeredBy === "bot");
    const byKato = knowledge.filter(k => k.answeredBy === "kato");
    const crewCounts = {};
    knowledge.forEach(k => {
      const name = k.crewName || "不明";
      crewCounts[name] = (crewCounts[name] || 0) + 1;
    });
    return {
      total: knowledge.length, todayCount: todayItems.length, weekCount: weekItems.length,
      escalatedCount: escalated.length, resolvedCount: resolved.length,
      botCount: byBot.length, katoCount: byKato.length, crewCounts,
    };
  }, [knowledge]);

  const tabs = [
    { id: "dashboard", label: "ダッシュボード", icon: "📊" },
    { id: "knowledge", label: "ナレッジ管理", icon: "📚" },
    { id: "settings", label: "設定", icon: "⚙️" },
    { id: "logs", label: "ログ・分析", icon: "📈" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fdf5f8, #fce8ee 40%, #f5edf8 80%, #fdf9f5)", fontFamily: FONT.body }}>
      {/* Header */}
      <header style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.borderSoft}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sky}, ${C.lavender})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧚</div>
          <div>
            <div style={{ fontSize: 10, color: C.sky, letterSpacing: "0.22em", fontFamily: FONT.ui, fontWeight: 400, textTransform: "uppercase" }}>NaviCrew Admin</div>
            <div style={{ fontSize: 18, fontFamily: FONT.heading, fontWeight: 500, fontStyle: "italic", color: C.text }}>Management Console</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {lastFetch && <span style={{ fontSize: 11, color: C.textFaint, fontFamily: FONT.ui }}>Last sync: {lastFetch.toLocaleTimeString("ja-JP")}</span>}
          <button onClick={fetchKnowledge} disabled={loading} style={{ padding: "6px 16px", borderRadius: 12, border: `1px solid ${C.borderSoft}`, background: C.white, color: C.textMid, cursor: "pointer", fontSize: 12, fontFamily: FONT.body, fontWeight: 500 }}>
            {loading ? "読み込み中..." : "🔄 更新"}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav style={{ display: "flex", gap: 4, padding: "12px 24px 0", background: "transparent" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", borderRadius: "14px 14px 0 0", border: `1px solid ${tab === t.id ? C.borderSoft : "transparent"}`,
            borderBottom: "none", background: tab === t.id ? "rgba(255,255,255,0.85)" : "transparent",
            color: tab === t.id ? C.text : C.textSoft, cursor: "pointer", fontSize: 13, fontFamily: FONT.body, fontWeight: tab === t.id ? 600 : 400,
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{t.icon}</span> {t.label}
            {t.id === "knowledge" && stats.escalatedCount > 0 && (
              <span style={{ background: "#dc2626", color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 8, fontFamily: FONT.ui }}>{stats.escalatedCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ background: "rgba(255,255,255,0.85)", margin: "0 24px 24px", borderRadius: "0 14px 14px 14px", border: `1px solid ${C.borderSoft}`, minHeight: "calc(100vh - 160px)", padding: 24 }}>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
            API接続エラー: {error} <button onClick={fetchKnowledge} style={{ marginLeft: 8, padding: "2px 10px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", cursor: "pointer", fontSize: 12, color: "#dc2626" }}>再試行</button>
          </div>
        )}
        {tab === "dashboard" && <DashboardTab stats={stats} knowledge={knowledge} loading={loading} />}
        {tab === "knowledge" && <KnowledgeTab knowledge={knowledge} onRefresh={fetchKnowledge} />}
        {tab === "settings" && <SettingsTab />}
        {tab === "logs" && <LogsTab knowledge={knowledge} stats={stats} />}
      </main>
    </div>
  );
}

// ============================================================
// [A] Dashboard Tab
// ============================================================
function DashboardTab({ stats, knowledge, loading }) {
  const recentEscalated = knowledge.filter(k => k.status === "escalated").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const recentQuestions = [...knowledge].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const statCards = [
    { label: "総ナレッジ数", value: stats.total, color: C.sky, icon: "📚" },
    { label: "今日の質問", value: stats.todayCount, color: C.sage, icon: "💬" },
    { label: "今週の質問", value: stats.weekCount, color: C.amber, icon: "📅" },
    { label: "未回答（エスカレ）", value: stats.escalatedCount, color: stats.escalatedCount > 0 ? "#dc2626" : C.sage, icon: "🚨" },
    { label: "AI回答数", value: stats.botCount, color: C.lavender, icon: "🤖" },
    { label: "加藤回答数", value: stats.katoCount, color: C.rose, icon: "👤" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontFamily: FONT.heading, fontStyle: "italic", color: C.text, margin: "0 0 20px", fontWeight: 500 }}>Overview</h2>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.textSoft, fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: FONT.ui }}>{loading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      {/* Escalated Items */}
      {recentEscalated.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, color: "#dc2626", fontWeight: 600, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>🚨 未回答のエスカレーション ({stats.escalatedCount}件)</h3>
          {recentEscalated.map(k => (
            <div key={k.id} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{k.question}</span>
                <span style={{ fontSize: 10, color: C.textFaint, fontFamily: FONT.ui, whiteSpace: "nowrap", marginLeft: 12 }}>{new Date(k.createdAt).toLocaleString("ja-JP")}</span>
              </div>
              <div style={{ fontSize: 11, color: C.textSoft }}>質問者: {k.crewName || "不明"} | AI仮回答: {(k.aiAnswer || k.answer || "").substring(0, 80)}...</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Questions */}
      <div>
        <h3 style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: "0 0 12px" }}>最近の質問</h3>
        <div style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f8f4f0" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: C.textSoft, borderBottom: `1px solid ${C.borderSoft}` }}>日時</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: C.textSoft, borderBottom: `1px solid ${C.borderSoft}` }}>質問者</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: C.textSoft, borderBottom: `1px solid ${C.borderSoft}` }}>質問</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: C.textSoft, borderBottom: `1px solid ${C.borderSoft}` }}>ステータス</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: C.textSoft, borderBottom: `1px solid ${C.borderSoft}` }}>回答者</th>
              </tr>
            </thead>
            <tbody>
              {recentQuestions.map(k => (
                <tr key={k.id} style={{ borderBottom: `1px solid ${C.borderSoft}20` }}>
                  <td style={{ padding: "10px 14px", color: C.textFaint, fontFamily: FONT.ui, whiteSpace: "nowrap", fontSize: 11 }}>{new Date(k.createdAt).toLocaleString("ja-JP")}</td>
                  <td style={{ padding: "10px 14px", color: C.textMid, whiteSpace: "nowrap" }}>{k.crewName || "不明"}</td>
                  <td style={{ padding: "10px 14px", color: C.text, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.question}</td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge status={k.status} /></td>
                  <td style={{ padding: "10px 14px", color: C.textSoft, fontSize: 11 }}>{k.answeredBy === "kato" ? "👤 加藤" : "🤖 AI"}</td>
                </tr>
              ))}
              {recentQuestions.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: C.textFaint }}>まだデータがありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// [B] Knowledge Tab
// ============================================================
function KnowledgeTab({ knowledge, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const filtered = useMemo(() => {
    let items = [...knowledge];
    if (filter === "escalated") items = items.filter(k => k.status === "escalated");
    else if (filter === "resolved") items = items.filter(k => k.status === "resolved");
    else if (filter === "kato") items = items.filter(k => k.answeredBy === "kato");
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(k => (k.question || "").toLowerCase().includes(q) || (k.answer || "").toLowerCase().includes(q) || (k.crewName || "").toLowerCase().includes(q));
    }
    return items.sort((a, b) => {
      if (a.status === "escalated" && b.status !== "escalated") return -1;
      if (a.status !== "escalated" && b.status === "escalated") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [knowledge, filter, search]);

  const handleResolve = async (id) => {
    if (!editAnswer.trim()) return;
    setSaving(true);
    try {
      await api("/api/navi/resolve", { id, katoAnswer: editAnswer.trim() });
      setEditingId(null);
      setEditAnswer("");
      await onRefresh();
    } catch (e) {
      alert("保存エラー: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    setSaving(true);
    try {
      await api("/api/navi/import", { items: [{ question: newQ.trim(), answer: newA.trim(), crewName: "admin" }] });
      setNewQ(""); setNewA(""); setShowAdd(false);
      await onRefresh();
    } catch (e) {
      alert("追加エラー: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    try {
      const lines = importText.trim().split("\n").filter(l => l.includes("\t") || l.includes(","));
      const items = lines.map(line => {
        const [question, answer] = line.includes("\t") ? line.split("\t") : line.split(",").map(s => s.trim());
        return { question: question?.trim(), answer: answer?.trim(), crewName: "admin-import" };
      }).filter(i => i.question && i.answer);
      if (items.length === 0) { alert("インポートデータが不正です。TSV/CSV形式で入力してください。"); return; }
      const result = await api("/api/navi/import", { items });
      alert(`${result.imported || items.length}件インポートしました`);
      setImportText(""); setShowImport(false);
      await onRefresh();
    } catch (e) {
      alert("インポートエラー: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (ids) => {
    if (!confirm(`${ids.length}件のナレッジを削除しますか？この操作は取り消せません。`)) return;
    setDeleting(true);
    try {
      await api("/api/navi/delete", { ids: Array.from(ids) });
      setSelectedIds(new Set());
      await onRefresh();
    } catch (e) {
      alert("削除エラー: " + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const escalatedCount = knowledge.filter(k => k.status === "escalated").length;
  const katoCount = knowledge.filter(k => k.answeredBy === "kato").length;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 質問・回答・質問者で検索..." style={{ flex: "1 1 200px", padding: "9px 14px", borderRadius: 12, border: `1px solid ${C.borderSoft}`, background: C.white, color: C.text, fontSize: 13, fontFamily: FONT.body, outline: "none" }} />
        <div style={{ display: "flex", gap: 4 }}>
          {[["all", "すべて", knowledge.length], ["escalated", "要回答", escalatedCount], ["resolved", "回答済", knowledge.length - escalatedCount], ["kato", "加藤回答", katoCount]].map(([key, label, count]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "7px 14px", borderRadius: 10, fontSize: 11, cursor: "pointer", fontFamily: FONT.body, fontWeight: 500,
              background: filter === key ? `linear-gradient(135deg, ${C.sky}, #8db5d4)` : C.white,
              border: `1px solid ${filter === key ? "transparent" : C.borderSoft}`,
              color: filter === key ? "#fff" : C.textSoft, transition: "all 0.2s",
            }}>
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setShowAdd(true)} style={{ padding: "8px 18px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.sage}, #6d9073)`, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>➕ ナレッジ追加</button>
        <button onClick={() => setShowImport(true)} style={{ padding: "8px 18px", borderRadius: 12, border: `1px solid ${C.borderSoft}`, background: C.white, color: C.textMid, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>📥 CSV一括インポート</button>
        {selectedIds.size > 0 && (
          <button onClick={() => handleDelete(selectedIds)} disabled={deleting} style={{ padding: "8px 18px", borderRadius: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            🗑️ 選択削除 ({selectedIds.size}件)
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: C.textFaint, alignSelf: "center", fontFamily: FONT.ui }}>{filtered.length}件表示</span>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ background: "#f0fdf4", border: `1px solid #bbf7d0`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.sage, marginBottom: 10 }}>ナレッジ手動追加</div>
          <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="質問を入力..." style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, marginBottom: 8, fontSize: 13, fontFamily: FONT.body, boxSizing: "border-box", outline: "none" }} />
          <textarea value={newA} onChange={e => setNewA(e.target.value)} placeholder="回答を入力..." rows={3} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, marginBottom: 10, fontSize: 13, fontFamily: FONT.body, resize: "vertical", boxSizing: "border-box", outline: "none", lineHeight: 1.7 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setShowAdd(false); setNewQ(""); setNewA(""); }} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "none", color: C.textSoft, cursor: "pointer", fontSize: 12 }}>キャンセル</button>
            <button onClick={handleAdd} disabled={!newQ.trim() || !newA.trim() || saving} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: newQ.trim() && newA.trim() ? `linear-gradient(135deg, ${C.sage}, #6d9073)` : "#eee", color: newQ.trim() && newA.trim() ? "#fff" : C.textFaint, cursor: newQ.trim() && newA.trim() ? "pointer" : "default", fontSize: 12, fontWeight: 600 }}>追加する</button>
          </div>
        </div>
      )}

      {/* Import Form */}
      {showImport && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.sky, marginBottom: 6 }}>CSV/TSV 一括インポート</div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>1行1件。「質問(TABまたはカンマ)回答」の形式で入力してください。</div>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder={"有給の申請方法は？\t有給申請はSlackの#申請チャンネルから行えます\n交通費の精算方法は？\t経費精算システムにログインして申請してください"} rows={6} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #bfdbfe", fontSize: 12, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box", outline: "none", lineHeight: 1.8 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "none", color: C.textSoft, cursor: "pointer", fontSize: 12 }}>キャンセル</button>
            <button onClick={handleBulkImport} disabled={!importText.trim() || importing} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: importText.trim() ? `linear-gradient(135deg, ${C.sky}, #5a8ab5)` : "#eee", color: importText.trim() ? "#fff" : C.textFaint, cursor: importText.trim() ? "pointer" : "default", fontSize: 12, fontWeight: 600 }}>{importing ? "インポート中..." : "インポート実行"}</button>
          </div>
        </div>
      )}

      {/* Knowledge List */}
      <div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: C.textFaint, fontSize: 13 }}>
            {search ? "検索結果がありません" : filter === "escalated" ? "未回答のエスカレーションはありません ✨" : "ナレッジがまだありません"}
          </div>
        ) : filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(k => (
          <div key={k.id} style={{ background: C.white, border: `1px solid ${k.status === "escalated" ? "#fecaca" : C.borderSoft}`, borderRadius: 14, padding: "14px 18px", marginBottom: 8, transition: "all 0.2s" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <input type="checkbox" checked={selectedIds.has(k.id)} onChange={() => toggleSelect(k.id)} style={{ marginTop: 4, cursor: "pointer", accentColor: C.sky }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <StatusBadge status={k.status} />
                  <span style={{ fontSize: 10, color: C.textFaint, fontFamily: FONT.ui }}>{new Date(k.createdAt).toLocaleString("ja-JP")}</span>
                  <span style={{ fontSize: 10, color: C.textSoft }}>by {k.crewName || "不明"}</span>
                  <span style={{ fontSize: 10, color: C.textFaint }}>{k.answeredBy === "kato" ? "👤 加藤回答" : "🤖 AI回答"}</span>
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 8 }}>{k.question}</div>

                {/* AI Answer */}
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(123,163,196,0.08)", marginBottom: 6, fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
                  <span style={{ fontSize: 10, color: C.sky, fontWeight: 600 }}>AI回答：</span><br />
                  {k.aiAnswer || k.answer}
                </div>

                {/* Kato Answer */}
                {k.answeredBy === "kato" && k.katoAnswer && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(125,158,131,0.08)", fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
                    <span style={{ fontSize: 10, color: C.sage, fontWeight: 600 }}>加藤回答（ナレッジ化済）：</span><br />
                    {k.katoAnswer}
                  </div>
                )}

                {/* Resolve form for escalated */}
                {k.status === "escalated" && (
                  editingId === k.id ? (
                    <div style={{ marginTop: 8 }}>
                      <textarea value={editAnswer} onChange={e => setEditAnswer(e.target.value)} placeholder="正式回答を入力...（ナレッジとして蓄積されます）" rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.rose}40`, background: "rgba(255,255,255,0.9)", color: C.text, fontSize: 13, fontFamily: FONT.body, resize: "vertical", lineHeight: 1.7, outline: "none", boxSizing: "border-box" }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={() => { setEditingId(null); setEditAnswer(""); }} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "none", color: C.textSoft, cursor: "pointer", fontSize: 12 }}>キャンセル</button>
                        <button onClick={() => handleResolve(k.id)} disabled={!editAnswer.trim() || saving} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: editAnswer.trim() ? `linear-gradient(135deg, ${C.sage}, #6d9073)` : "#eee", color: editAnswer.trim() ? "#fff" : C.textFaint, cursor: editAnswer.trim() ? "pointer" : "default", fontSize: 12, fontWeight: 600 }}>{saving ? "保存中..." : "回答してナレッジ化する"}</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(k.id); setEditAnswer(k.aiAnswer || k.answer || ""); }} style={{ marginTop: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.rose}40`, background: `linear-gradient(135deg, rgba(201,114,138,0.08), rgba(201,114,138,0.04))`, color: C.rose, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✏️ 回答する</button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.borderSoft}` }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.borderSoft}`, background: page === 0 ? "#f5f0ed" : C.white, color: page === 0 ? C.textFaint : C.textMid, cursor: page === 0 ? "default" : "pointer", fontSize: 12 }}>← 前へ</button>
            <span style={{ fontSize: 12, color: C.textSoft, fontFamily: FONT.ui }}>{page + 1} / {Math.ceil(filtered.length / PAGE_SIZE)}</span>
            <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE) - 1, p + 1))} disabled={(page + 1) * PAGE_SIZE >= filtered.length} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.borderSoft}`, background: (page + 1) * PAGE_SIZE >= filtered.length ? "#f5f0ed" : C.white, color: (page + 1) * PAGE_SIZE >= filtered.length ? C.textFaint : C.textMid, cursor: (page + 1) * PAGE_SIZE >= filtered.length ? "default" : "pointer", fontSize: 12 }}>次へ →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// [C] Settings Tab
// ============================================================
function SettingsTab() {
  const [settings, setSettings] = useLocalStorage("nc_admin_settings", {
    personality: "温かく親しみやすい。Crewの名前を呼び、質問してくれたこと自体を肯定する。困っているCrewには寄り添い、「困ったら一人で抱えず、すぐ相談」を体現する。",
    tone: "丁寧だけどフレンドリー。絵文字を適度に使い、冷たい事務的な回答は絶対にしない。",
    prohibited: "単価・報酬額の公開チャンネルでの開示\n人事・契約情報の無断開示\n他のCrewの個人情報",
    escalationRules: "金額・単価に関する質問\n人事・契約に関する質問\nナレッジにヒットしない質問\nユーザーが「加藤に確認して」と明示した場合",
    escalationTarget: "加藤（@U08H0A48A2G）",
    responseChannels: "#navicrew-knowledge, DM, @NaviCrewメンション",
  });
  const [saved, setSaved] = useState(false);

  const updateField = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { key: "personality", label: "NaviCrewの性格・人格", placeholder: "NaviCrewの性格設定...", rows: 4, icon: "🧚" },
    { key: "tone", label: "応答トーン", placeholder: "回答のトーン...", rows: 2, icon: "💬" },
    { key: "prohibited", label: "禁止事項", placeholder: "禁止事項（1行1項目）...", rows: 3, icon: "🚫" },
    { key: "escalationRules", label: "エスカレーション条件", placeholder: "エスカレすべき条件（1行1項目）...", rows: 4, icon: "🚨" },
    { key: "escalationTarget", label: "エスカレーション先", placeholder: "通知先...", rows: 1, icon: "📩" },
    { key: "responseChannels", label: "応答チャンネル", placeholder: "応答するチャンネル...", rows: 1, icon: "📢" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontFamily: FONT.heading, fontStyle: "italic", color: C.text, margin: 0, fontWeight: 500 }}>Settings</h2>
        <button onClick={handleSave} style={{ padding: "8px 24px", borderRadius: 12, border: "none", background: saved ? `linear-gradient(135deg, ${C.sage}, #6d9073)` : `linear-gradient(135deg, ${C.sky}, #5a8ab5)`, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.3s" }}>
          {saved ? "✓ 保存しました" : "💾 保存"}
        </button>
      </div>
      <div style={{ fontSize: 12, color: C.textSoft, marginBottom: 20, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10 }}>
        ℹ️ 現在の設定はブラウザに保存されます。SaaS版ではサーバー側に永続化されます。
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {fields.map(f => (
          <div key={f.key} style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: "16px 20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              <span>{f.icon}</span> {f.label}
            </label>
            <textarea value={settings[f.key]} onChange={e => updateField(f.key, e.target.value)} placeholder={f.placeholder} rows={f.rows} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: "#fafaf8", color: C.text, fontSize: 13, fontFamily: FONT.body, resize: "vertical", lineHeight: 1.7, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// [D] Logs & Analytics Tab
// ============================================================
function LogsTab({ knowledge, stats }) {
  const [view, setView] = useState("timeline");

  // Crew ranking
  const crewRanking = useMemo(() => {
    return Object.entries(stats.crewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [stats.crewCounts]);

  // Daily counts (last 14 days)
  const dailyCounts = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const count = knowledge.filter(k => (k.createdAt || "").startsWith(key)).length;
      days.push({ date: key, label: `${d.getMonth() + 1}/${d.getDate()}`, count });
    }
    return days;
  }, [knowledge]);

  const maxDailyCount = Math.max(...dailyCounts.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["timeline", "タイムライン"], ["crew", "Crew別分析"], ["daily", "日別推移"]].map(([key, label]) => (
          <button key={key} onClick={() => setView(key)} style={{
            padding: "8px 18px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontWeight: 500,
            background: view === key ? `linear-gradient(135deg, ${C.sky}, #8db5d4)` : C.white,
            border: `1px solid ${view === key ? "transparent" : C.borderSoft}`,
            color: view === key ? "#fff" : C.textSoft,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {view === "timeline" && (
        <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
          {knowledge.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50).map(k => (
            <div key={k.id} style={{ display: "flex", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.borderSoft}20` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: k.status === "escalated" ? "#dc2626" : C.sage, marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: C.textFaint, fontFamily: FONT.ui }}>{new Date(k.createdAt).toLocaleString("ja-JP")}</span>
                  <span style={{ fontSize: 11, color: C.textSoft }}>{k.crewName || "不明"}</span>
                  <StatusBadge status={k.status} />
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{k.question}</div>
                <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4, lineHeight: 1.6 }}>{(k.katoAnswer || k.answer || "").substring(0, 120)}{(k.katoAnswer || k.answer || "").length > 120 ? "..." : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crew Analysis */}
      {view === "crew" && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "0 0 16px" }}>質問数ランキング（Crew別）</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {crewRanking.map(([name, count], i) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: "12px 16px" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: i < 3 ? `linear-gradient(135deg, ${C.amber}, ${C.coral})` : "#f0ece8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i < 3 ? "#fff" : C.textSoft, fontFamily: FONT.ui }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: 500 }}>{name}</span>
                <div style={{ flex: 2, height: 8, background: "#f0ece8", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(count / crewRanking[0][1]) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.sky}, ${C.lavender})`, borderRadius: 4, transition: "width 0.5s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.sky, fontFamily: FONT.ui, minWidth: 32, textAlign: "right" }}>{count}</span>
              </div>
            ))}
            {crewRanking.length === 0 && <div style={{ textAlign: "center", padding: 24, color: C.textFaint }}>データがありません</div>}
          </div>
        </div>
      )}

      {/* Daily Chart */}
      {view === "daily" && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "0 0 16px" }}>直近14日間の質問数推移</h3>
          <div style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180 }}>
              {dailyCounts.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.sky, fontFamily: FONT.ui }}>{d.count || ""}</span>
                  <div style={{ width: "100%", maxWidth: 36, height: `${Math.max((d.count / maxDailyCount) * 140, 2)}px`, background: d.count > 0 ? `linear-gradient(180deg, ${C.sky}, ${C.lavender})` : "#f0ece8", borderRadius: "6px 6px 0 0", transition: "height 0.5s" }} />
                  <span style={{ fontSize: 9, color: C.textFaint, fontFamily: FONT.ui }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textSoft }}>14日間合計</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.sky, fontFamily: FONT.ui }}>{dailyCounts.reduce((s, d) => s + d.count, 0)}</div>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textSoft }}>日平均</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.sage, fontFamily: FONT.ui }}>{(dailyCounts.reduce((s, d) => s + d.count, 0) / 14).toFixed(1)}</div>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textSoft }}>最多日</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.amber, fontFamily: FONT.ui }}>{Math.max(...dailyCounts.map(d => d.count))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Shared Components
// ============================================================
function StatusBadge({ status }) {
  const styles = {
    escalated: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "要回答" },
    resolved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "回答済" },
  };
  const st = styles[status] || styles.resolved;
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontWeight: 600 }}>{st.label}</span>;
}
