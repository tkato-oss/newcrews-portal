import { useState, useEffect, useMemo } from "react";

// ============================================================
// クライアントデータ
// ============================================================
const CLIENTS_DATA = [
  { id:"1",  name:"YTJ",                       crew:["髙橋 尚希","目黒 彩"],           status:"進行中", kpiStatus:"確認済み", sheetUrl:"https://docs.google.com/spreadsheets/d/1PV8YkmSqtS-w2QiMLUzVXq6CkW2Ps4uKgTsKl4jHOAE/edit" },
  { id:"2",  name:"ブロードリンク",              crew:["髙橋 尚希","木嶋渚","伊藤千加","緑川真理"], status:"進行中", kpiStatus:"確認済み", sheetUrl:"" },
  { id:"3",  name:"SEPTA",                     crew:["小野陽子","中村 拓生"],           status:"要対応", kpiStatus:"要確認",  sheetUrl:"" },
  { id:"4",  name:"平松建築",                   crew:["髙橋 尚希"],                    status:"要対応", kpiStatus:"要確認",  sheetUrl:"" },
  { id:"5",  name:"歌の手帖",                   crew:["内藤 美由紀"],                   status:"進行中", kpiStatus:"要確認",  sheetUrl:"" },
  { id:"6",  name:"日本生命",                   crew:["小野陽子","目黒 彩"],             status:"進行中", kpiStatus:"要確認",  sheetUrl:"" },
  { id:"7",  name:"nobitel",                    crew:["木嶋渚"],                       status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"8",  name:"ファッションニュース通信社",   crew:["内藤 美由紀"],                   status:"停滞",   kpiStatus:"未確認",  sheetUrl:"" },
  { id:"9",  name:"新星コーポレィション",         crew:["伊藤千加"],                     status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"10", name:"LiftFunction",              crew:["中村 拓生"],                    status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"11", name:"アビヅ",                     crew:["青木碧"],                       status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"12", name:"島田クリニック",              crew:["緑川真理"],                     status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"13", name:"PLUS",                       crew:["内藤 美由紀"],                   status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"14", name:"BP&Co",                      crew:["中村 拓生"],                    status:"停滞",   kpiStatus:"未確認",  sheetUrl:"" },
  { id:"15", name:"インパクトサークル",           crew:["内田真佐美"],                   status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"16", name:"hajimari",                   crew:["目黒 彩"],                      status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"17", name:"本陣水越株式会社",             crew:["伊藤千加"],                     status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"18", name:"ニッティグリッティ",           crew:["内田真佐美"],                   status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"19", name:"カシワバラ・グラウンド",       crew:["内藤 美由紀"],                   status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"20", name:"AJIOKA",                     crew:["白川亜美"],                     status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"21", name:"ラブリー株式会社",             crew:["青木碧"],                       status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"22", name:"三宮オイル",                  crew:["高瀬実季"],                     status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"23", name:"P.S.Ace株式会社",             crew:["内田真佐美"],                   status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"24", name:"未知株式会社",                 crew:["高瀬実季"],                     status:"停滞",   kpiStatus:"未確認",  sheetUrl:"" },
  { id:"25", name:"アルバイトタイムス",           crew:["白川亜美"],                     status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
  { id:"26", name:"カチタス",                    crew:["高瀬実季","青木碧"],             status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
];

// ============================================================
// 詳細データのデフォルト＆シード
// ============================================================
function CLIENT_DETAILS_DEFAULT() {
  return {
    lastMtgDate: "",
    mtgSummary: "",
    nextActions: [],
    concerns: "",
    automationStatus: "未着手",
    automatableTasks: [],
    workflowPlan: "未設計",
    slackChannel: "",
    knowledge: "",
    tldvHistory: [],
  };
}

const CLIENT_DETAILS_SEED = {
  "1": { lastMtgDate:"2026-03-10", mtgSummary:"採用サイトの月次レポート確認。応募数は前月比+12%。LP改善の提案を実施。", nextActions:["LP改善案の最終確認","来月のKPI目標設定"], concerns:"応募単価がやや上昇傾向", automationStatus:"実装中", automatableTasks:["月次レポート自動生成","応募データ集計"], workflowPlan:"tldv → 議事録AI解析 → Slack通知 → レポート自動生成", slackChannel:"#proj-ytj", knowledge:"", tldvHistory:[] },
  "2": { lastMtgDate:"2026-03-08", mtgSummary:"IT機器回収業務の進捗確認。新規取引先3社追加。", nextActions:["新規取引先へのオンボーディング資料作成","回収スケジュール最適化"], concerns:"繁忙期の人員確保", automationStatus:"検証中", automatableTasks:["回収スケジュール通知","在庫レポート"], workflowPlan:"", slackChannel:"#proj-broadlink", knowledge:"", tldvHistory:[] },
  "3": { lastMtgDate:"2026-03-05", mtgSummary:"コンサル案件の方向性すり合わせ。クライアント側の意思決定が遅延中。", nextActions:["意思決定促進のための資料作成","代替案の提示"], concerns:"意思決定の遅延によるスケジュール圧迫", automationStatus:"未着手", automatableTasks:[], workflowPlan:"", slackChannel:"", knowledge:"", tldvHistory:[] },
  "4": { lastMtgDate:"2026-02-28", mtgSummary:"建築プロジェクトの広報支援。SNS運用の改善提案。", nextActions:["Instagram投稿スケジュール策定","施工事例の撮影手配"], concerns:"写真素材の不足", automationStatus:"未着手", automatableTasks:["SNS投稿スケジューリング"], workflowPlan:"", slackChannel:"", knowledge:"", tldvHistory:[] },
  "8": { lastMtgDate:"2026-01-20", mtgSummary:"業界紙の販促支援。反応率が低迷中。", nextActions:["ターゲット再定義","テスト施策の企画"], concerns:"予算縮小の可能性", automationStatus:"未着手", automatableTasks:[], workflowPlan:"", slackChannel:"", knowledge:"", tldvHistory:[] },
  "14":{ lastMtgDate:"2026-02-15", mtgSummary:"コンサル業務の定例。進捗が停滞気味。", nextActions:["課題の再整理","担当者ミーティング設定"], concerns:"先方担当者の異動", automationStatus:"未着手", automatableTasks:[], workflowPlan:"", slackChannel:"", knowledge:"", tldvHistory:[] },
  "24":{ lastMtgDate:"2026-02-01", mtgSummary:"Webサイト改善プロジェクト。デザイン方針で合意が取れず停滞。", nextActions:["デザイン案の再提出","ステークホルダーMTG調整"], concerns:"方針が定まらないまま時間が経過", automationStatus:"未着手", automatableTasks:[], workflowPlan:"", slackChannel:"", knowledge:"", tldvHistory:[] },
};

// ============================================================
// カラーパレット
// ============================================================
const C = {
  bg:        "#f8f5f0",
  bgCard:    "#ffffff",
  bgSub:     "#f4f0eb",
  border:    "#e8e0d5",
  borderSoft:"#ede8e0",
  text:      "#2d2520",
  textMid:   "#7a6e65",
  textSoft:  "#b0a398",
  accent:    "#8b7355",
  accentLt:  "#c4a882",
  pink:      "#c9728a",
  pinkLight: "#fce8ee",
  pinkSoft:  "#e8a8b8",
  sage:      "#6b8f71",
  sageLight: "#e8f0e9",
  amber:     "#c17f3a",
  amberLight:"#fdf0e0",
  rose:      "#b5545e",
  roseLight: "#fbeaeb",
  slate:     "#8a9aaa",
  slateLight:"#edf1f5",
};

// ============================================================
// 共通スタイル定数
// ============================================================
const inS = { width:"100%", background:C.bgSub, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:13, fontFamily:"inherit" };
const taS = { width:"100%", background:C.bgSub, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", color:C.text, fontSize:13, resize:"vertical", fontFamily:"inherit", lineHeight:1.7, outline:"none", boxSizing:"border-box" };
const txS = { margin:0, fontSize:13, color:C.textMid, lineHeight:1.8 };

// ============================================================
// ステータス設定
// ============================================================
const STATUS_CFG = {
  "進行中": { color:C.sage,  bg:C.sageLight  },
  "要対応": { color:C.amber, bg:C.amberLight },
  "停滞":   { color:C.rose,  bg:C.roseLight  },
  "完了":   { color:C.slate, bg:C.slateLight },
};
const AUTO_CFG = {
  "未着手": { color:C.slate, bg:C.slateLight },
  "検証中": { color:C.amber, bg:C.amberLight },
  "実装中": { color:"#5b7ec4", bg:"#eef2fb" },
  "完了":   { color:C.sage,  bg:C.sageLight  },
};

// ============================================================
// Badge コンポーネント
// ============================================================
function Badge({ label, cfg, small }) {
  const c = (cfg||{})[label] || { color:C.slate, bg:C.slateLight };
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,
      padding: small?"1px 7px":"2px 9px",
      borderRadius:20, fontSize: small?9:10, fontWeight:600,
      color:c.color, background:c.bg,
      border:`1px solid ${c.color}40`,
      letterSpacing:"0.04em", fontFamily:"'Jost',sans-serif"
    }}>
      <span style={{width:4,height:4,borderRadius:"50%",background:c.color,flexShrink:0}}/>
      {label}
    </span>
  );
}

// ============================================================
// SCard コンポーネント
// ============================================================
function SCard({ title, badge, children, fullWidth }) {
  return (
    <div style={{background:C.bgCard,border:`1px solid ${C.borderSoft}`,borderRadius:12,padding:"16px 18px",gridColumn:fullWidth?"1/-1":"auto",boxShadow:"0 1px 4px rgba(45,37,32,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontSize:9,fontWeight:600,color:C.pink,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{title}</span>
        {badge && typeof badge==="string" && <span style={{fontSize:10,color:C.textSoft,fontFamily:"monospace"}}>{badge}</span>}
        {badge && typeof badge!=="string" && badge}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// tldv 解析モーダル
// ============================================================
function TldvModal({ onClose, onParsed }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const parse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`会議録を解析してJSONのみ返してください（コードブロック不要）:\n{"date":"YYYY-MM-DD","summary":"要点2-3文","nextActions":["アクション1","アクション2"],"concerns":"懸念点","automationHints":["自動化できそうな業務"]}`,
          messages:[{role:"user",content:`以下の会議録を解析:\n\n${text}`}]
        })
      });
      const data = await res.json();
      const raw = data.content.find(b=>b.type==="text")?.text||"{}";
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setResult({error:"解析に失敗しました"}); }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(45,37,32,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:580,padding:36,position:"relative",boxShadow:"0 24px 60px rgba(45,37,32,0.12)"}}>
        <button onClick={onClose} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18,fontFamily:"serif"}}>✕</button>
        <div style={{fontSize:10,fontWeight:700,color:C.pink,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>tldv Import</div>
        <h3 style={{color:C.text,margin:"0 0 4px",fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>議事録インポート</h3>
        <p style={{color:C.textMid,margin:"0 0 20px",fontSize:12}}>文字起こしテキストを貼り付けると、AIが自動で解析します。</p>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="会議の文字起こしテキストをここに貼り付け..." style={{width:"100%",height:140,background:C.bgSub,border:`1px solid ${C.border}`,borderRadius:10,padding:14,color:C.text,fontSize:13,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.7}}/>
        {result && !result.error && (
          <div style={{background:C.sageLight,border:`1px solid ${C.sage}40`,borderRadius:10,padding:16,margin:"14px 0"}}>
            <div style={{color:C.sage,fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:"0.06em"}}>解析完了</div>
            {[["日付",result.date],["サマリー",result.summary],["ネクスト",result.nextActions?.join(" / ")],result.automationHints?.length?["自動化ヒント",result.automationHints?.join("、")]:null].filter(Boolean).map(([k,v])=>(
              <div key={k} style={{fontSize:12,color:C.textMid,marginBottom:3}}><span style={{color:C.textSoft}}>{k}：</span>{v}</div>
            ))}
          </div>
        )}
        {result?.error && <div style={{color:C.rose,fontSize:12,margin:"10px 0"}}>{result.error}</div>}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={parse} disabled={loading||!text.trim()} style={{flex:1,background:loading?C.bgSub:`linear-gradient(135deg,${C.pink},${C.pinkSoft})`,border:"none",borderRadius:10,color:loading?C.textSoft:"#fff",padding:"11px 0",cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:600,letterSpacing:"0.03em"}}>
            {loading?"解析中 ...":"AIで解析する"}
          </button>
          {result&&!result.error&&<button onClick={()=>{onParsed(result);onClose();}} style={{flex:1,background:`linear-gradient(135deg,${C.sage},#5a7d60)`,border:"none",borderRadius:10,color:"#fff",padding:"11px 0",cursor:"pointer",fontSize:13,fontWeight:700}}>ポータルに反映</button>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 月次レポート生成モーダル
// ============================================================
function ReportModal({ client, detail, onClose }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState("");
  const [step, setStep] = useState("loading");

  useEffect(()=>{
    (async()=>{
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1000,
            system:"BPO会社PORTAMENTの担当者として、クライアント向けの丁寧な月次業務報告メールを件名＋本文の形式で作成してください。温かみがありながらもプロフェッショナルなトーンで。",
            messages:[{role:"user",content:`クライアント: ${client.name}\n担当Crew: ${client.crew.join("、")}\n直近MTG: ${detail.lastMtgDate||"未設定"}\nMTGサマリー: ${detail.mtgSummary||"定期確認実施"}\nネクストアクション: ${detail.nextActions?.join("、")||"なし"}\n懸念事項: ${detail.concerns||"特になし"}\n自動化進捗: ${detail.automationStatus}\n\n上記の情報をもとに、月次業務報告メールを作成してください。`}]
          })
        });
        const data = await res.json();
        setReport(data.content.find(b=>b.type==="text")?.text||"生成に失敗しました");
        setStep("preview");
      } catch { setReport("エラーが発生しました。"); setStep("preview"); }
      setLoading(false);
    })();
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(45,37,32,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:660,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 60px rgba(45,37,32,0.12)"}}>
        <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0,position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:18,right:22,background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18}}>✕</button>
          <div style={{fontSize:10,fontWeight:700,color:C.amber,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Monthly Report</div>
          <h3 style={{margin:0,fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:C.text}}>{client.name}</h3>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"22px 28px"}}>
          {loading
            ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:180,flexDirection:"column",gap:12}}>
                <div style={{width:28,height:28,border:`2px solid ${C.borderSoft}`,borderTop:`2px solid ${C.amber}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
                <div style={{color:C.textSoft,fontSize:13}}>レポートを生成しています</div>
              </div>
            : step==="sent"
              ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:180,gap:10}}>
                  <div style={{fontSize:40}}>✉️</div>
                  <div style={{color:C.sage,fontSize:16,fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>送付完了</div>
                  <div style={{color:C.textMid,fontSize:13}}>{client.name} への月次レポートを送付しました</div>
                </div>
              : <div style={{color:C.text,fontSize:13,lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"'Noto Sans JP',sans-serif"}}>{report}</div>
          }
        </div>
        {step==="preview" && !loading && (
          <div style={{padding:"16px 28px",borderTop:`1px solid ${C.borderSoft}`,display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>navigator.clipboard.writeText(report)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:10,color:C.textMid,padding:"10px",cursor:"pointer",fontSize:12}}>コピー</button>
            <button onClick={()=>setStep("sent")} style={{flex:2,background:`linear-gradient(135deg,${C.amber},#d4944a)`,border:"none",borderRadius:10,color:"#fff",padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700}}>確認済み・送付する</button>
          </div>
        )}
        {step==="sent" && <div style={{padding:"16px 28px",borderTop:`1px solid ${C.borderSoft}`,flexShrink:0}}><button onClick={onClose} style={{width:"100%",background:C.bgSub,border:"none",borderRadius:10,color:C.textMid,padding:"10px",cursor:"pointer",fontSize:12}}>閉じる</button></div>}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ============================================================
// 提案書生成モーダル
// ============================================================
function ProposalModal({ client, detail, onClose }) {
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState("");

  useEffect(()=>{
    (async()=>{
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1200,
            system:"PORTAMENTの業務自動化コンサルタントとして、クライアント向けの自動化提案書をMarkdown形式で作成してください。簡潔・具体的に。",
            messages:[{role:"user",content:`クライアント: ${client.name}\n自動化可能業務: ${detail.automatableTasks?.join("、")||"要ヒアリング"}\n業務フロー案: ${detail.workflowPlan||"未設計"}\nMTGサマリー: ${detail.mtgSummary||"なし"}\n\n以下を含む提案書を作成：\n1. 現状課題\n2. 自動化提案（具体的フロー）\n3. 導入効果（時間・コスト削減）\n4. 実装スケジュール（3ヶ月）\n5. 次のステップ`}]
          })
        });
        const data = await res.json();
        setProposal(data.content.find(b=>b.type==="text")?.text||"生成に失敗しました");
      } catch { setProposal("エラーが発生しました。"); }
      setLoading(false);
    })();
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(45,37,32,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:700,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 60px rgba(45,37,32,0.12)"}}>
        <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0,position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:18,right:22,background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18}}>✕</button>
          <div style={{fontSize:10,fontWeight:700,color:"#5b7ec4",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Automation Roadmap</div>
          <h3 style={{margin:0,fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:C.text}}>{client.name} — 自動化提案書</h3>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"22px 28px"}}>
          {loading
            ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:180,flexDirection:"column",gap:12}}>
                <div style={{width:28,height:28,border:`2px solid ${C.borderSoft}`,borderTop:"2px solid #5b7ec4",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
                <div style={{color:C.textSoft,fontSize:13}}>提案書を生成しています</div>
              </div>
            : <div style={{color:C.text,fontSize:13,lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"'Noto Sans JP',sans-serif"}}>{proposal}</div>
          }
        </div>
        {!loading && proposal && (
          <div style={{padding:"16px 28px",borderTop:`1px solid ${C.borderSoft}`,display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>navigator.clipboard.writeText(proposal)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:10,color:C.textMid,padding:"10px",cursor:"pointer",fontSize:12}}>コピー</button>
            <button onClick={onClose} style={{flex:2,background:"linear-gradient(135deg,#5b7ec4,#7696d8)",border:"none",borderRadius:10,color:"#fff",padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700}}>完了</button>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ============================================================
// メインポータル
// ============================================================
export default function Portal() {
  const [detailsState, setDetailsState] = useState(() => {
    const base = {};
    CLIENTS_DATA.forEach(c => { base[c.id] = CLIENT_DETAILS_SEED[c.id] || CLIENT_DETAILS_DEFAULT(); });
    return base;
  });
  const [clientsState, setClientsState] = useState(CLIENTS_DATA);
  const [selected, setSelected] = useState(CLIENTS_DATA[0]);
  const [activeTab, setActiveTab] = useState("detail");
  const [editMode, setEditMode] = useState(false);
  const [editDetail, setEditDetail] = useState(null);
  const [showTldv, setShowTldv] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("すべて");

  const detail = editMode ? editDetail : (detailsState[selected.id] || CLIENT_DETAILS_DEFAULT());

  const filtered = clientsState.filter(c => {
    const m = c.name.includes(search) || c.crew.some(cr=>cr.includes(search));
    const s = filterStatus==="すべて" || c.status===filterStatus;
    return m && s;
  });

  const startEdit = () => { setEditDetail(JSON.parse(JSON.stringify(detailsState[selected.id]||CLIENT_DETAILS_DEFAULT()))); setEditMode(true); };
  const saveEdit = () => { setDetailsState(prev=>({...prev,[selected.id]:editDetail})); setEditMode(false); };
  const handleTldvParsed = (r) => {
    setDetailsState(prev=>({...prev,[selected.id]:{...prev[selected.id],
      lastMtgDate:r.date||prev[selected.id].lastMtgDate,
      mtgSummary:r.summary||prev[selected.id].mtgSummary,
      nextActions:r.nextActions?.length?r.nextActions:prev[selected.id].nextActions,
      concerns:r.concerns||prev[selected.id].concerns,
      tldvHistory:[...(prev[selected.id].tldvHistory||[]),r]
    }}));
  };
  const addAction = () => {
    if (!newAction.trim()) return;
    setDetailsState(prev=>({...prev,[selected.id]:{...prev[selected.id],nextActions:[...(prev[selected.id].nextActions||[]),newAction.trim()]}}));
    setNewAction("");
  };
  const removeAction = (i) => setDetailsState(prev=>({...prev,[selected.id]:{...prev[selected.id],nextActions:prev[selected.id].nextActions.filter((_,idx)=>idx!==i)}}));

  const stats = { total:clientsState.length, active:clientsState.filter(c=>c.status==="進行中").length, alert:clientsState.filter(c=>c.status==="要対応").length, stalled:clientsState.filter(c=>c.status==="停滞").length };

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"'Jost','Noto Sans JP',sans-serif",color:C.text,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&family=Noto+Sans+JP:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        input:focus,textarea:focus,select:focus{outline:none!important}
        input::placeholder,textarea::placeholder{color:${C.textSoft}}
        button:hover{opacity:0.88;transition:opacity 0.15s}
      `}</style>

      {/* ===== サイドバー ===== */}
      <div style={{width:270,background:"#fdf9f5",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>

        {/* ロゴ */}
        <div style={{padding:"28px 22px 20px",borderBottom:`1px solid ${C.borderSoft}`}}>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:9,fontWeight:600,color:C.pink,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:4}}>PORTAMENT</div>
            <div style={{fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:C.text,lineHeight:1.1}}>NewCrews</div>
            <div style={{fontSize:10,color:C.textSoft,marginTop:4,letterSpacing:"0.08em"}}>Operations Portal</div>
          </div>
          {/* ステータスサマリー */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[{l:"進行中",v:stats.active,c:C.sage},{l:"要対応",v:stats.alert,c:C.amber},{l:"停滞",v:stats.stalled,c:C.rose},{l:"合計",v:stats.total,c:C.pink}].map(s=>(
              <div key={s.l} style={{background:C.bg,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.borderSoft}`}}>
                <div style={{fontSize:18,fontWeight:600,color:s.c,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:9,color:C.textSoft,marginTop:2,letterSpacing:"0.05em"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 検索・フィルター */}
        <div style={{padding:"12px 16px 8px",borderBottom:`1px solid ${C.borderSoft}`}}>
          <div style={{position:"relative",marginBottom:8}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="企業名・Crew名 で検索"
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px 7px 28px",color:C.text,fontSize:11}}/>
            <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:C.textSoft}}>&#x1F50D;</span>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["すべて","進行中","要対応","停滞"].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:"2px 8px",borderRadius:12,fontSize:9,cursor:"pointer",fontWeight:600,letterSpacing:"0.03em",
                background:filterStatus===s?C.pink:"transparent",
                border:`1px solid ${filterStatus===s?C.pink:C.border}`,
                color:filterStatus===s?"#fff":C.textSoft,transition:"all 0.15s"
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* クライアント一覧 */}
        <div style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
          {filtered.map(c=>{
            const cfg = STATUS_CFG[c.status]||STATUS_CFG["進行中"];
            const isSelected = selected.id===c.id;
            return (
              <div key={c.id} onClick={()=>{setSelected(c);setEditMode(false);setActiveTab("detail");}}
                style={{padding:"10px 20px 10px 18px",cursor:"pointer",
                  borderLeft:`2px solid ${isSelected?C.pink:"transparent"}`,
                  background:isSelected?C.bgCard:"transparent",
                  transition:"all 0.15s"
                }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:isSelected?600:400,color:isSelected?C.text:C.textMid}}>{c.name}</span>
                  <span style={{width:5,height:5,borderRadius:"50%",background:cfg.color,flexShrink:0}}/>
                </div>
                <div style={{fontSize:10,color:C.textSoft}}>{c.crew[0]}{c.crew.length>1?` +${c.crew.length-1}`:""}</div>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.borderSoft}`}}>
          <div style={{fontSize:9,color:C.textSoft,textAlign:"center",letterSpacing:"0.1em"}}>
            PORTAMENT Inc. — NC Operations
          </div>
        </div>
      </div>

      {/* ===== メインエリア ===== */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* トップバー */}
        <div style={{padding:"18px 28px 14px",borderBottom:`1px solid ${C.borderSoft}`,background:C.bgCard,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <h1 style={{margin:0,fontSize:22,fontWeight:500,color:C.text,fontFamily:"'Cormorant Garamond',serif"}}>{selected.name}</h1>
              <Badge label={selected.status} cfg={STATUS_CFG}/>
            </div>
            <div style={{display:"flex",gap:14,fontSize:11,color:C.textSoft,alignItems:"center"}}>
              <span>担当 {selected.crew.join("、")}</span>
              {detail.lastMtgDate && <span>最終MTG {detail.lastMtgDate}</span>}
              {detail.slackChannel && <span style={{fontFamily:"monospace",fontSize:10,background:C.bgSub,padding:"1px 6px",borderRadius:4,color:C.textMid}}>{detail.slackChannel}</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setShowTldv(true)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.textMid,padding:"7px 12px",cursor:"pointer",fontSize:11}}>tldv</button>
            <button onClick={()=>setShowReport(true)} style={{background:"none",border:`1px solid ${C.amber}60`,borderRadius:8,color:C.amber,padding:"7px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>レポート生成</button>
            <button onClick={()=>setShowProposal(true)} style={{background:"none",border:"1px solid #5b7ec460",borderRadius:8,color:"#5b7ec4",padding:"7px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>提案書生成</button>
            {!editMode
              ? <button onClick={startEdit} style={{background:`linear-gradient(135deg,${C.pink},${C.pinkSoft})`,border:"none",borderRadius:8,color:"#fff",padding:"7px 16px",cursor:"pointer",fontSize:11,fontWeight:600}}>編集</button>
              : <>
                  <button onClick={()=>setEditMode(false)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.textMid,padding:"7px 12px",cursor:"pointer",fontSize:11}}>キャンセル</button>
                  <button onClick={saveEdit} style={{background:`linear-gradient(135deg,${C.sage},#5a7d60)`,border:"none",borderRadius:8,color:"#fff",padding:"7px 16px",cursor:"pointer",fontSize:11,fontWeight:700}}>保存</button>
                </>
            }
          </div>
        </div>

        {/* タブ */}
        <div style={{display:"flex",padding:"0 28px",background:C.bgCard,borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0}}>
          {[["detail","案件詳細"],["automation","自動化"],["knowledge","ナレッジ"]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{padding:"11px 16px",background:"none",border:"none",
              borderBottom:`2px solid ${activeTab===id?C.pink:"transparent"}`,
              color:activeTab===id?C.pink:C.textSoft,
              cursor:"pointer",fontSize:11,fontWeight:activeTab===id?600:400,
              letterSpacing:"0.05em",transition:"all 0.15s"
            }}>{label}</button>
          ))}
        </div>

        {/* ===== コンテンツ ===== */}
        <div style={{flex:1,overflowY:"auto",padding:22}}>

          {/* 案件詳細タブ */}
          {activeTab==="detail" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,maxWidth:1000}}>

              {/* 業務概要 */}
              <SCard title="業務概要">
                {editMode
                  ? <textarea value={editDetail.mtgSummary||""} onChange={e=>setEditDetail({...editDetail,mtgSummary:e.target.value})} style={taS} rows={4}/>
                  : <p style={txS}>{detail.mtgSummary||"—"}</p>
                }
              </SCard>

              {/* 直近MTG */}
              <SCard title="直近 MTG" badge={detail.lastMtgDate}>
                {editMode
                  ? <>
                      <input type="date" value={editDetail.lastMtgDate||""} onChange={e=>setEditDetail({...editDetail,lastMtgDate:e.target.value})} style={{...inS,marginBottom:10}}/>
                      <textarea value={editDetail.mtgSummary||""} onChange={e=>setEditDetail({...editDetail,mtgSummary:e.target.value})} style={taS} rows={2}/>
                    </>
                  : <p style={txS}>{detail.lastMtgDate?`${detail.lastMtgDate} 実施`:"未設定"}</p>
                }
              </SCard>

              {/* ネクストアクション（全幅） */}
              <SCard title="ネクストアクション" fullWidth>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {(detail.nextActions||[]).map((a,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:C.bgSub,borderRadius:8,padding:"9px 12px",border:`1px solid ${C.borderSoft}`}}>
                      <span style={{width:18,height:18,borderRadius:5,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.textSoft,flexShrink:0,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>{i+1}</span>
                      <span style={{flex:1,fontSize:13,color:C.text}}>{a}</span>
                      <button onClick={()=>removeAction(i)} style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:12,padding:"0 4px"}}>✕</button>
                    </div>
                  ))}
                  {(detail.nextActions||[]).length===0 && <div style={{color:C.textSoft,fontSize:12,padding:"8px 0"}}>アクションはありません</div>}
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <input value={newAction} onChange={e=>setNewAction(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAction()} placeholder="新しいアクションを追加..." style={{...inS,flex:1}}/>
                    <button onClick={addAction} style={{background:`linear-gradient(135deg,${C.pink},${C.pinkSoft})`,border:"none",borderRadius:8,color:"#fff",padding:"7px 14px",cursor:"pointer",fontSize:11,fontWeight:600}}>追加</button>
                  </div>
                </div>
              </SCard>

              {/* 懸念事項 */}
              <SCard title="懸念事項・メモ">
                {editMode
                  ? <textarea value={editDetail.concerns||""} onChange={e=>setEditDetail({...editDetail,concerns:e.target.value})} style={taS} rows={3}/>
                  : <p style={{...txS,color:(detail.concerns||"").includes("なし")||(detail.concerns||"")===""?C.textSoft:C.amber}}>{detail.concerns||"特になし"}</p>
                }
              </SCard>

              {/* 担当Crew */}
              <SCard title="担当 Crew">
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:2}}>
                  {selected.crew.map((name,i)=>(
                    <span key={i} style={{background:C.bgSub,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 12px",fontSize:12,color:C.text,fontWeight:500}}>
                      {name}
                    </span>
                  ))}
                </div>
              </SCard>

              {/* スプレッドシート */}
              <SCard title="稼働報告書">
                {selected.sheetUrl
                  ? <a href={selected.sheetUrl} target="_blank" rel="noopener noreferrer" style={{color:"#5b7ec4",fontSize:12,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
                      <span>&#x1F4CA;</span><span>スプレッドシートを開く</span>
                    </a>
                  : <p style={{...txS,color:C.textSoft}}>スプレッドシートURL未設定</p>
                }
              </SCard>

            </div>
          )}

          {/* 自動化タブ */}
          {activeTab==="automation" && (
            <div style={{maxWidth:800,display:"flex",flexDirection:"column",gap:14}}>
              <SCard title="自動化ステータス" badge={<Badge label={detail.automationStatus||"未着手"} cfg={AUTO_CFG}/>}>
                {editMode && (
                  <select value={editDetail.automationStatus||"未着手"} onChange={e=>setEditDetail({...editDetail,automationStatus:e.target.value})} style={{...inS,marginBottom:12,maxWidth:200}}>
                    {["未着手","検証中","実装中","完了"].map(o=><option key={o}>{o}</option>)}
                  </select>
                )}
                <div style={{fontSize:10,color:C.textSoft,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>自動化可能業務</div>
                {editMode
                  ? <textarea value={(editDetail.automatableTasks||[]).join("\n")} onChange={e=>setEditDetail({...editDetail,automatableTasks:e.target.value.split("\n").filter(Boolean)})} style={taS} rows={4} placeholder="1行1タスクで入力"/>
                  : (detail.automatableTasks||[]).length > 0
                    ? <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {(detail.automatableTasks||[]).map((t,i)=><span key={i} style={{background:C.bgSub,border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,color:C.textMid}}>{t}</span>)}
                      </div>
                    : <p style={{...txS,color:C.textSoft}}>未登録</p>
                }
              </SCard>

              <SCard title="業務フロー設計">
                {editMode
                  ? <textarea value={editDetail.workflowPlan||""} onChange={e=>setEditDetail({...editDetail,workflowPlan:e.target.value})} style={taS} rows={5} placeholder="例: tldv → 議事録解析 → ネクストアクション自動生成 → Slack通知"/>
                  : <p style={{...txS,fontSize:12,fontFamily:(detail.workflowPlan||"")!=="未設計"?"monospace":"inherit",background:(detail.workflowPlan||"")!=="未設計"?C.bgSub:"transparent",padding:(detail.workflowPlan||"")!=="未設計"?"12px 14px":"0",borderRadius:8}}>{detail.workflowPlan||"未設計"}</p>
                }
              </SCard>

              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setShowProposal(true)} style={{flex:1,background:`linear-gradient(135deg,${C.pink},${C.pinkSoft})`,border:"none",borderRadius:10,color:"#fff",padding:"12px 0",cursor:"pointer",fontSize:13,fontWeight:600}}>自動化提案書を生成する</button>
              </div>
            </div>
          )}

          {/* ナレッジタブ */}
          {activeTab==="knowledge" && (
            <div style={{maxWidth:800}}>
              <SCard title="クライアントナレッジ">
                <p style={{fontSize:12,color:C.textMid,marginTop:0,marginBottom:14}}>業務手順・担当者の特徴・過去のトラブル事例を記録します。Crew Botが参照して自動回答に活用します。</p>
                {editMode
                  ? <textarea value={editDetail.knowledge||""} onChange={e=>setEditDetail({...editDetail,knowledge:e.target.value})} style={{...taS,minHeight:280}} placeholder={`【業務手順】\n1. 毎月5日までに稼働報告書を提出\n...\n\n【担当者の特徴】\n...\n\n【過去のトラブル・対処法】\n...`}/>
                  : <div style={{color:C.text,fontSize:13,lineHeight:1.9,whiteSpace:"pre-wrap",minHeight:180,background:C.bgSub,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.borderSoft}`}}>
                      {detail.knowledge||<span style={{color:C.textSoft}}>まだナレッジが登録されていません。「編集」から追加してください。</span>}
                    </div>
                }
              </SCard>
              {!editMode && (detail.tldvHistory||[]).length > 0 && (
                <div style={{marginTop:14}}>
                  <SCard title={`tldv 議事録履歴（${(detail.tldvHistory||[]).length}件）`}>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {(detail.tldvHistory||[]).map((h,i)=>(
                        <div key={i} style={{background:C.bgSub,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.borderSoft}`}}>
                          <div style={{fontSize:10,color:C.textSoft,marginBottom:4,fontFamily:"monospace"}}>{h.date}</div>
                          <div style={{fontSize:12,color:C.text}}>{h.summary}</div>
                        </div>
                      ))}
                    </div>
                  </SCard>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* モーダル */}
      {showTldv    && <TldvModal    onClose={()=>setShowTldv(false)}    onParsed={(r)=>{handleTldvParsed(r);setShowTldv(false);}}/>}
      {showReport  && <ReportModal  client={selected} detail={detail}   onClose={()=>setShowReport(false)}/>}
      {showProposal&& <ProposalModal client={selected} detail={detail}  onClose={()=>setShowProposal(false)}/>}
    </div>
  );
}
