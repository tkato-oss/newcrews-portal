import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ============================================================
// ① localStorage カスタムフック
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
// クライアントデータ
// ============================================================
// ※ Excelマスター（NC事業_KPIマスターシート.xlsx）準拠
const CLIENTS_DATA = [
  { id:"1",  name:"YTJ",                       crew:["髙橋 尚希","目黒 彩"],                      status:"進行中", kpiStatus:"確認済み", sheetUrl:"https://docs.google.com/spreadsheets/d/1PV8YkmSqtS-w2QiMLUzVXq6CkW2Ps4uKgTsKl4jHOAE/edit?gid=1123724246#gid=1123724246" },
  { id:"2",  name:"ブロードリンク",              crew:["髙橋 尚希","木嶋渚","伊藤千加","緑川真理"],   status:"進行中", kpiStatus:"確認済み", sheetUrl:"https://docs.google.com/spreadsheets/d/1v-h283YedGznJ0VOwVE2okWcwP42BmbxhRa1d4Ru7ac/edit?gid=780891447#gid=780891447" },
  { id:"3",  name:"SEPTA",                     crew:["小野陽子","中村 拓生"],                      status:"要対応", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/19v6wGZlvAR30wZWe_AkV_WmE0MPaxKzYwa-lz6frCac/edit?gid=1919493548#gid=1919493548" },
  { id:"4",  name:"平松建築",                   crew:["髙橋 尚希"],                                status:"要対応", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/16N1f_kXgDk92iOmeQpasxlEeqhksxlSMZUSNx3fPXsY/edit?gid=172076145#gid=172076145" },
  { id:"5",  name:"歌の手帖",                   crew:["内藤 美由紀"],                               status:"進行中", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1CDV9XEG4WacVHPpNpivrlEiIKbIUZ7GsmMjEGfRtRNs/edit?gid=942398408#gid=942398408" },
  { id:"6",  name:"日本生命",                   crew:["青木碧"],                                   status:"進行中", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/13Niux_kNyo3aPBFe97a7t5FbNu8p9vZVjsUcwWeUJ4o/edit?gid=1436503274#gid=1436503274" },
  { id:"7",  name:"nobitel",                    crew:["佐川真菜"],                                 status:"進行中", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1TCxU0iy_5wrm8-2nM_9IETL8DVxjkC2JvFrMI89hptw/edit?gid=2089342560#gid=2089342560" },
  { id:"8",  name:"ファッションニュース通信社",   crew:["青木碧","内田真佐美"],                        status:"停滞",   kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1Y95F39UbYtDoV3TsTMCy5pktK17YqQtpIjZ7WDFadS4/edit?gid=376900462#gid=376900462" },
  { id:"9",  name:"新星コーポレィション",         crew:["内藤 美由紀"],                               status:"進行中", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1WdfpZPjuJj6c9KsQMsJe9vE-vUGvF3Tr0V8R2ytkXRU/edit?gid=1669623430#gid=1669623430" },
  { id:"10", name:"LiftFunction",              crew:["木村多和"],                                  status:"進行中", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1y--CuJQ1f47VJvt2Y7xH_lemRBIusv2FKe1guHCBy08/edit" },
  { id:"11", name:"アビヅ",                     crew:["仲野すえみ"],                                status:"進行中", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/122mzToSbUSRG6hWE1it1fQMwvqxVNUj6vxkVDXo7PVk/edit" },
  { id:"12", name:"島田クリニック",              crew:["筧尋子"],                                   status:"進行中", kpiStatus:"要確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/19DJ-Ohnfh4DBDXyJ7dpPt91Pss3WiTjEtuTf_GH15iw/edit" },
  { id:"13", name:"PLUS",                       crew:["内藤 美由紀"],                               status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1AJ1lgPdjsE3p2q5aVjnPUABbfMDBYrzNngRLt6FfkBU/edit?gid=936856200#gid=936856200" },
  { id:"14", name:"BP&Co",                      crew:["中村 拓生"],                                status:"停滞",   kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1lGCysQDSum2ijNmlB608qrSE_mC9U9xIZraUbNiNwE0/edit?gid=56394643#gid=56394643" },
  { id:"15", name:"インパクトサークル",           crew:["内田真佐美"],                                status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1ra2ZXs-Zmbx1Ar3axRxjl9EB6AAD0i70aE1WiuUIif0/edit" },
  { id:"16", name:"hajimari",                   crew:["目黒 彩"],                                  status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1H1e7GtoPVRfv-TFZWNQDsZcb2HrEIg5G9KR2kZEwIOo/edit?gid=1003019972#gid=1003019972" },
  { id:"17", name:"本陣水越株式会社",             crew:["伊藤千加"],                                 status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1lYlqOyZ-YnJ-IIdLSjjN9vsym8-Uq-IsPStP04ZWaZY/edit" },
  { id:"18", name:"ニッティグリッティ",           crew:["内田真佐美"],                                status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1qqJ7N1sVNiNHUQh8boMgSJTXHIIXy95fU-mR0IenADU/edit" },
  { id:"19", name:"カシワバラ・グラウンド",       crew:["内藤 美由紀"],                               status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1RofDoA9bk836-JE6RtJan7C8NXQDnbCt-UAmUM_UPrk/edit?gid=921552437#gid=921552437" },
  { id:"20", name:"AJIOKA",                     crew:["白川亜美"],                                 status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/11YF0RY6lcIoYnOl6P4iFOVLjTyKefCZzSrlULmjJJsI/edit?gid=2039324880#gid=2039324880" },
  { id:"21", name:"ラブリー株式会社",             crew:["青木碧"],                                   status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1YDV56jq88WPIu9yhOsOzjfAsZwPUf36WHz6LaK5KEhw/edit?gid=376900462#gid=376900462" },
  { id:"22", name:"三宮オイル",                  crew:["高瀬実季"],                                 status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1UPsDC2KjBazrVTAQEUVxwhQ3OBXWRj2cabcV0tzqdT8/edit?gid=149579709#gid=149579709" },
  { id:"23", name:"P.S.Ace株式会社",             crew:["内田真佐美"],                                status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1VLdnoANNcvzXUJL-G1Tt-hnxP40XBJSa70jAUxisz9s/edit" },
  { id:"24", name:"未知株式会社",                 crew:["高瀬実季"],                                 status:"停滞",   kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/10q2n-s-6Wcu-mVVIhcfT_XdxqZVduC44U45z6TaO6kQ/edit?gid=1547414282#gid=1547414282" },
  { id:"25", name:"アルバイトタイムス",           crew:["白川亜美"],                                 status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1mfBic3oxYIrtxvdvHMZI9nHDtcqvNRV07q7jtRA0Vmg/edit" },
  { id:"26", name:"カチタス",                    crew:["伊藤千加"],                                 status:"進行中", kpiStatus:"未確認",  sheetUrl:"https://docs.google.com/spreadsheets/d/1tG10U9JD8eKCiceAmRQf4aqF3YIRV_u0Cm45TGDBddo/edit?gid=2020779194#gid=2020779194" },
  { id:"27", name:"スカラ",                      crew:[],                                           status:"進行中", kpiStatus:"未確認",  sheetUrl:"" },
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
    contactMethod: "",
    contactAddress: "",
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
// Crewメンバー一覧（クライアントデータから自動抽出）
// ============================================================
const CREW_MEMBERS = [...new Set([...CLIENTS_DATA.flatMap(c => c.crew), "川澄あさみ", "SV"])].sort();

// ============================================================
// 季節テーマ
// ============================================================
function getSeasonTheme() {
  const m = new Date().getMonth(); // 0-11
  if (m >= 2 && m <= 4) return { // 春（3-5月）
    name:"spring", label:"Spring",
    gradient:"linear-gradient(160deg, #fdf9f5 0%, #fce8ee 30%, #f0ebf5 60%, #fdf9f5 100%)",
    portalGrad:"linear-gradient(135deg, #faf7f4 0%, #fdf5f0 40%, #f5f0f8 70%, #faf7f4 100%)",
    petalHues:[[340,55,75],[320,45,78],[280,35,80],[30,50,82],[160,30,78],[200,30,80]],
    bokeh1:"rgba(201,114,138,0.12)", bokeh2:"rgba(184,169,201,0.10)", bokeh3:"rgba(212,163,115,0.10)",
  };
  if (m >= 5 && m <= 7) return { // 夏（6-8月）
    name:"summer", label:"Summer",
    gradient:"linear-gradient(160deg, #f5f9fd 0%, #e8f4f0 30%, #fdf5e8 60%, #f5f9fd 100%)",
    portalGrad:"linear-gradient(135deg, #f5f9fd 0%, #edf5f0 40%, #fdf8f0 70%, #f5f9fd 100%)",
    petalHues:[[45,60,75],[180,40,75],[200,50,78],[330,40,80],[120,40,72],[280,30,80]],
    bokeh1:"rgba(100,180,160,0.10)", bokeh2:"rgba(218,192,130,0.10)", bokeh3:"rgba(130,180,218,0.10)",
  };
  if (m >= 8 && m <= 10) return { // 秋（9-11月）
    name:"autumn", label:"Autumn",
    gradient:"linear-gradient(160deg, #fdf9f2 0%, #fdf0e5 30%, #f5ece0 60%, #fdf9f2 100%)",
    portalGrad:"linear-gradient(135deg, #fdf9f2 0%, #fdf5e8 40%, #f8efe5 70%, #fdf9f2 100%)",
    petalHues:[[20,60,70],[35,55,72],[350,45,75],[45,50,76],[10,50,68],[280,25,75]],
    bokeh1:"rgba(212,140,90,0.12)", bokeh2:"rgba(180,120,80,0.10)", bokeh3:"rgba(201,114,138,0.08)",
  };
  return { // 冬（12-2月）
    name:"winter", label:"Winter",
    gradient:"linear-gradient(160deg, #f5f5fa 0%, #eef0f8 30%, #f8f0f5 60%, #f5f5fa 100%)",
    portalGrad:"linear-gradient(135deg, #f5f5fa 0%, #eef0f8 40%, #f5f0f6 70%, #f5f5fa 100%)",
    petalHues:[[220,30,82],[260,25,80],[340,30,82],[200,20,85],[180,20,80],[300,20,82]],
    bokeh1:"rgba(160,170,200,0.10)", bokeh2:"rgba(184,169,201,0.10)", bokeh3:"rgba(201,114,138,0.08)",
  };
}

const SEASON = getSeasonTheme();

// ============================================================
// 週替わりメッセージ（手書き便箋カード用）
// ============================================================
const WEEKLY_MESSAGES = [
  { casual: "CEZANNEの眉マスカラ、コスパ最強なので試してみて🤍",           thanks: "いつも、本当にありがとう。" },
  { casual: "疲れた日は少しいいチョコを自分へのご褒美に🍫",                thanks: "毎日よくやってくれています。心から感謝しています。" },
  { casual: "週末に近所の花屋さんへぜひ。100円の花1本でも部屋が変わります🌼", thanks: "あなたの存在が、チームの温かさそのものです。" },
  { casual: "もうすぐ桜🌸 お花見できたら教えてね！",                       thanks: "あなたと同じチームでいられること、誇りに思っています。" },
  { casual: "寝る前30分だけスマホを置いてみて。翌朝の目覚めが全然違いますよ！", thanks: "今日も一日、本当にお疲れさまでした。" },
  { casual: "目のストレッチ、一緒にやりましょう👁️ ぐるっと回して、上下左右。", thanks: "画面に向かう毎日、ありがとう。" },
  { casual: "秋はサツマイモラテが飲みたくなりますよね🍠",                   thanks: "今日も本当にお疲れさまでした。" },
  { casual: "GUのパジャマ、今めちゃくちゃいい素材のが出てて…🐻",           thanks: "ちゃんと休んでね。無理しすぎないで。" },
  { casual: "コンビニのホットスナック、マヨネーズかけると謎においしいです笑",  thanks: "今週もありがとうございました！" },
  { casual: "お風呂上がりにヴァセリンをリップに塗るだけで、翌朝ぷるぷるになります✨", thanks: "週末ゆっくり休んでくださいね！" },
  { casual: "今日も1日、本当にありがとうございました！",                    thanks: "あなたがいてくれるおかげで、毎日前に進めています。" },
  { casual: "加藤が寂しがるのでたまには連絡してやってください笑",             thanks: "本当にいつもありがとう🤍" },
  { casual: "韓国コスメのROM&NDのリップ、発色が本当にきれい！",             thanks: "ゆっくり休んでね。いつもお疲れさま。" },
];

function getWeeklyMessage() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
  return { ...WEEKLY_MESSAGES[weekNum % WEEKLY_MESSAGES.length], weekNum: weekNum + 1 };
}

// ============================================================
// ④ お知らせデータ（初期値）
// ============================================================
const INITIAL_NOTIFICATIONS = [
  { id:1, date:"2026-03-18", title:"🎉 ポータルが新しくなりました！",
    body:"担当クライアント表示・ナレッジ共有フィード・加藤ログなど新機能が追加されました。ぜひ使ってみてください！", isNew:true },
  { id:2, date:"2026-03-15", title:"📋 3月の稼働報告書について",
    body:"3月分の稼働報告書の提出期限は月末です。不明点はいつでも加藤まで連絡してください！", isNew:false },
  { id:3, date:"2026-03-10", title:"💡 tldv連携の使い方",
    body:"MTG後はtldvをポータルにインポートするだけで、AIが自動で議事録とネクストアクションを生成します。ぜひ活用してみてね！", isNew:false },
];

// 手書き便箋カードコンポーネント
function LetterCard() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 400); return () => clearTimeout(t); }, []);
  const msg = getWeeklyMessage();

  // 植物SVG（右上装飾）
  const BotanicalSVG = () => (
    <svg viewBox="0 0 72 82" width={58} height={66} style={{display:"block"}}>
      {/* 花びら6枚 */}
      {[0,60,120,180,240,300].map((deg,i) => (
        <ellipse key={i} cx={36} cy={16} rx={6} ry={11}
          fill={i%2===0?"#f2b8cb":"#d4a8c8"} opacity={0.75}
          transform={`rotate(${deg} 36 28)`}/>
      ))}
      {/* 花の中心 */}
      <circle cx={36} cy={28} r={6} fill="#f5d4a8" opacity={0.9}/>
      {/* 茎 */}
      <path d="M36 34 Q38 54 34 72" stroke="#a8c890" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
      {/* 葉 */}
      <ellipse cx={28} cy={52} rx={10} ry={4} fill="#b0d09a" opacity={0.7} transform="rotate(-28 28 52)"/>
      <ellipse cx={42} cy={62} rx={10} ry={4} fill="#b0d09a" opacity={0.65} transform="rotate(22 42 62)"/>
    </svg>
  );

  return (
    <div style={{
      position:"relative",
      background:"linear-gradient(150deg, #fffdf5 0%, #fff9ee 55%, #fffbf5 100%)",
      border:"1px solid #e8d2ba",
      borderRadius:18,
      padding:"26px 30px 22px 30px",
      marginBottom:16,
      overflow:"hidden",
      boxShadow:"0 6px 28px rgba(180,130,80,0.10), 0 1px 4px rgba(180,130,80,0.06)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition:"opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* 罫線（便箋風） */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          position:"absolute", left:28, right:28,
          top: 58 + i * 26,
          height:1,
          background:"rgba(210,185,158,0.28)",
          pointerEvents:"none",
        }}/>
      ))}
      {/* 植物装飾（右上） */}
      <div style={{position:"absolute",top:10,right:14,opacity:0.6,pointerEvents:"none"}}>
        <BotanicalSVG/>
      </div>
      {/* メッセージ本文 */}
      <div style={{position:"relative",zIndex:1,paddingRight:68}}>
        <p style={{
          fontFamily:"'Yomogi', cursive",
          fontSize:15,
          color:"#4a3c30",
          lineHeight:2.0,
          margin:"0 0 8px",
          letterSpacing:"0.04em",
          wordBreak:"break-all",
        }}>
          {msg.casual}
        </p>
        <p style={{
          fontFamily:"'Yomogi', cursive",
          fontSize:14,
          color:C.rose,
          lineHeight:1.9,
          margin:0,
          letterSpacing:"0.04em",
        }}>
          {msg.thanks}
        </p>
      </div>
      {/* 週番号（右下・控えめ） */}
      <div style={{
        position:"absolute", bottom:11, right:16,
        fontSize:9, color:"#c8b4a0",
        fontFamily:"'Jost',sans-serif",
        letterSpacing:"0.16em",
        fontWeight:300,
      }}>
        Week {msg.weekNum} ✦
      </div>
    </div>
  );
}

// ============================================================
// ② 「今週の加藤」カードコンポーネント
// ============================================================
function KatoLogCard({ katoLog }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      marginBottom:28,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition:"all 0.8s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* セクションヘッダー */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:3,height:16,borderRadius:2,background:"linear-gradient(180deg,#c9728a,#b8a9c9)"}}/>
          <span style={{fontSize:10,fontWeight:600,color:"#c9728a",letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>今週の加藤</span>
          <span style={{fontSize:8,color:"#b8aaa0",fontFamily:"'Jost',sans-serif",fontWeight:300,letterSpacing:"0.06em"}}>— 加藤の動きをオープンに</span>
        </div>
        <span style={{fontSize:9,color:"#d4c8be",fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",fontWeight:300}}>Updated {katoLog.updated}</span>
      </div>
      {/* 2×2グリッド */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {katoLog.items.map((item, i) => (
          <div key={item.type}
            style={{background:item.bg,border:`1px solid ${item.color}22`,borderRadius:16,padding:"16px 18px",
              transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
              animation:`fadeInUp 0.4s ease ${0.1+i*0.09}s both`,
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${item.color}18`;e.currentTarget.style.borderColor=`${item.color}40`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=`${item.color}22`;}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:16}}>{item.icon}</span>
                <span style={{fontSize:9,fontWeight:600,color:item.color,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{item.label}</span>
              </div>
              {item.status && (
                <span style={{fontSize:8,fontWeight:600,padding:"2px 8px",borderRadius:8,letterSpacing:"0.04em",fontFamily:"'Jost',sans-serif",
                  color: item.status.includes("構築中") ? "#c9728a" : item.color,
                  background: item.status.includes("構築中") ? "#fce8ee" : `${item.color}18`,
                }}>{item.status}</span>
              )}
            </div>
            <p style={{margin:0,fontSize:11.5,color:"#7a6e65",lineHeight:1.85,fontFamily:"'Noto Sans JP',sans-serif",fontWeight:300,whiteSpace:"pre-line"}}>
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ④ 通知ベルコンポーネント
// ============================================================
function NotificationBell({ notifications, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unreadCount = notifications.filter(n => n.isNew).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{position:"relative",flexShrink:0}}>
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) onMarkAllRead(); }}
        style={{
          width:36, height:36, borderRadius:"50%",
          background: unreadCount > 0 ? `linear-gradient(135deg,${C.roseLight},#fff)` : "rgba(255,255,255,0.6)",
          border:`1px solid ${unreadCount > 0 ? C.rose+"40" : C.borderSoft}`,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative", transition:"all 0.25s", backdropFilter:"blur(8px)",
          boxShadow: unreadCount > 0 ? `0 4px 12px ${C.rose}20` : "none",
        }}
        onMouseEnter={e=>e.currentTarget.style.background=`linear-gradient(135deg,${C.roseLight},#fff)`}
        onMouseLeave={e=>e.currentTarget.style.background=unreadCount>0?`linear-gradient(135deg,${C.roseLight},#fff)`:"rgba(255,255,255,0.6)"}
      >
        <span style={{fontSize:15}}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position:"absolute", top:-3, right:-3,
            width:17, height:17, borderRadius:"50%",
            background:`linear-gradient(135deg,${C.rose},${C.roseSoft})`,
            color:"#fff", fontSize:9, fontWeight:700,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'Jost',sans-serif",
            boxShadow:`0 2px 6px ${C.rose}50`,
            animation:"softPulse 2s ease-in-out infinite",
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 10px)", right:0,
          width:320, maxHeight:420, overflowY:"auto",
          background:"rgba(255,255,255,0.96)", backdropFilter:"blur(20px)",
          border:`1px solid ${C.borderSoft}`, borderRadius:18,
          boxShadow:"0 20px 60px rgba(61,51,48,0.14)",
          zIndex:300, animation:"scaleIn 0.22s cubic-bezier(0.4,0,0.2,1)",
          transformOrigin:"top right",
        }}>
          <div style={{padding:"14px 18px 12px", borderBottom:`1px solid ${C.borderSoft}`, display:"flex", alignItems:"center", gap:8}}>
            <div style={{width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${C.rose},${C.roseSoft})`}}/>
            <span style={{fontSize:10,fontWeight:600,color:C.rose,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",flex:1}}>お知らせ</span>
            <span style={{fontSize:9,color:C.textFaint,fontFamily:"'Jost',sans-serif"}}>{notifications.length}件</span>
          </div>
          {notifications.length === 0
            ? <div style={{padding:"24px 18px",color:C.textFaint,fontSize:12,textAlign:"center"}}>お知らせはありません</div>
            : notifications.map((n, i) => (
                <div key={n.id} style={{
                  padding:"13px 18px",
                  borderBottom: i < notifications.length-1 ? `1px solid ${C.borderSoft}` : "none",
                  background: n.isNew ? `linear-gradient(135deg,${C.rosePale},rgba(255,255,255,0.95))` : "transparent",
                }}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:4}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.4}}>{n.title}</div>
                    {n.isNew && <span style={{fontSize:8,fontWeight:700,color:C.rose,background:C.roseLight,padding:"2px 7px",borderRadius:6,fontFamily:"'Jost',sans-serif",flexShrink:0,whiteSpace:"nowrap"}}>NEW</span>}
                  </div>
                  <div style={{fontSize:11,color:C.textMid,lineHeight:1.75}}>{n.body}</div>
                  <div style={{fontSize:9,color:C.textFaint,fontFamily:"'Jost',sans-serif",marginTop:5}}>{n.date}</div>
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}

// ============================================================
// 新規営業モード
// ============================================================
function SalesModal({ onClose, crewName, onSave }) {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const saveHistory = () => {
    if (!result || result.error) return;
    onSave({ id: Date.now(), company, contact, crewName, savedAt: new Date().toISOString(), ...result });
    setSaved(true);
  };

  const parse = async () => {
    if (!text.trim() || !company.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method:"POST", headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({type:"claude", payload:{
          model:"claude-opus-4-5", max_tokens:1500,
          system:`商談の文字起こしを解析してJSONのみ返してください（コードブロック不要）:\n{"date":"YYYY-MM-DD","summary":"商談の要点2-3文","nextActions":["アクション1（担当と期日付き）","アクション2"],"concerns":"内部メモ用の懸念点（先方には見せない）"}`,
          messages:[{role:"user",content:`先方会社: ${company}\n先方担当者: ${contact}\n\n以下の商談記録を解析:\n\n${text}`}]
        }})
      });
      const data = await res.json();
      const raw = data.content.find(b=>b.type==="text")?.text||"{}";
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch(e) { setResult({error:"解析に失敗しました"}); }
    setLoading(false);
  };

  const printPDF = () => {
    const date = result.date || new Date().toISOString().slice(0,10);
    const na = (result.nextActions||[]).map(a=>`<li style="margin-bottom:6px;">${a}</li>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:'Noto Sans JP',Arial,sans-serif;color:#333;margin:0;padding:40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #c9728a;padding-bottom:16px;margin-bottom:24px;}
  .brand{font-size:11px;color:#c9728a;letter-spacing:0.15em;font-weight:600;}
  .title{font-size:22px;font-weight:700;color:#3d3330;margin-top:4px;}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;}
  td{padding:8px 12px;border:1px solid #ddd;font-size:13px;}
  td:first-child{background:#fdf6f8;font-weight:600;width:120px;color:#c9728a;}
  h3{font-size:13px;font-weight:700;color:#c9728a;letter-spacing:0.08em;border-left:3px solid #c9728a;padding-left:8px;margin:20px 0 10px;}
  p{font-size:13px;line-height:1.8;margin:0 0 16px;padding-left:12px;}
  ul{margin:0;padding-left:24px;}
  li{font-size:13px;line-height:1.8;}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center;}
</style></head><body>
<div class="header">
  <div><div class="brand">PORTAMENT</div><div class="title">商談議事録</div></div>
  <div style="text-align:right;font-size:11px;color:#999;">${date}</div>
</div>
<table>
  <tr><td>先方会社</td><td>${company}</td></tr>
  <tr><td>先方担当者</td><td>${contact||"—"}</td></tr>
  <tr><td>PORTAMENT担当</td><td>${crewName||"—"}</td></tr>
  <tr><td>商談日</td><td>${date}</td></tr>
</table>
<h3>📋 商談サマリー</h3>
<p>${result.summary||""}</p>
<h3>✅ ネクストアクション</h3>
<ul>${na}</ul>
<div class="footer">株式会社PORTAMENT &nbsp;|&nbsp; 担当: ${crewName||""}</div>
</body></html>`;
    const win = window.open("","_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(()=>{ win.print(); }, 500);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(61,51,48,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(12px)",animation:"fadeIn 0.3s ease"}}>
      <div style={{background:"rgba(255,255,255,0.95)",backdropFilter:"blur(20px)",border:`1px solid ${C.borderSoft}`,borderRadius:24,width:"100%",maxWidth:600,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(61,51,48,0.12)",animation:"scaleIn 0.35s ease"}}>
        {/* ヘッダー */}
        <div style={{padding:"28px 32px 20px",borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0}}>
          <button onClick={onClose} style={{position:"absolute",marginLeft:510,marginTop:-12,background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18,fontFamily:"serif"}} onMouseEnter={e=>e.target.style.color=C.rose} onMouseLeave={e=>e.target.style.color=C.textSoft}>✕</button>
          <div style={{fontSize:9,fontWeight:600,color:"#5b7fc4",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:6,fontFamily:"'Jost',sans-serif"}}>Sales Visit</div>
          <h3 style={{color:C.text,margin:"0 0 4px",fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:500}}>新規営業モード</h3>
          <Ornament width={80} style={{marginTop:10,justifyContent:"flex-start"}}/>
        </div>
        {/* ボディ */}
        <div style={{padding:"20px 32px",overflowY:"auto",flex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:C.textSoft,fontWeight:600,marginBottom:5,letterSpacing:"0.06em"}}>先方会社名 *</div>
              <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="例：スカラ株式会社" style={{...taS,padding:"10px 12px"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:C.textSoft,fontWeight:600,marginBottom:5,letterSpacing:"0.06em"}}>先方担当者名</div>
              <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="例：富沢様" style={{...taS,padding:"10px 12px"}}/>
            </div>
          </div>
          <div style={{fontSize:10,color:C.textSoft,fontWeight:600,marginBottom:5,letterSpacing:"0.06em"}}>商談記録（tldv文字起こし）*</div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="商談の文字起こしテキストをここに貼り付け..." style={{...taS,height:130,marginBottom:12}}/>
          {result && !result.error && (
            <div style={{background:"#f0f7f1",border:"1px solid #7d9e8330",borderRadius:12,padding:18,marginBottom:12}}>
              <div style={{color:C.sage,fontSize:11,fontWeight:700,marginBottom:10,letterSpacing:"0.08em"}}>✓ 解析完了 — 議事録プレビュー</div>
              {[["📅 日付",result.date],["📋 サマリー",result.summary],["✅ ネクストアクション",result.nextActions?.join(" / ")],].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} style={{fontSize:12,color:C.textMid,marginBottom:6}}><span style={{color:C.textSoft,fontWeight:600}}>{k}：</span>{v}</div>
              ))}
              {result.concerns && <div style={{marginTop:10,padding:"8px 12px",background:"#fff8f0",borderRadius:8,border:"1px solid #e8a87c30"}}><span style={{fontSize:10,color:"#e8a87c",fontWeight:700}}>🔒 内部メモ（PDF非表示）：</span><span style={{fontSize:12,color:C.textMid}}>{result.concerns}</span></div>}
            </div>
          )}
          {result?.error && <div style={{color:C.coral,fontSize:12,margin:"12px 0"}}>{result.error}</div>}
        </div>
        {/* フッター */}
        <div style={{padding:"16px 32px",borderTop:`1px solid ${C.borderSoft}`,display:"flex",gap:10,flexShrink:0}}>
          <button onClick={parse} disabled={loading||!text.trim()||!company.trim()} style={{flex:2,background:loading?C.bgSub:`linear-gradient(135deg,#5b7fc4,#7a9fd4)`,border:"none",borderRadius:12,color:loading?C.textSoft:"#fff",padding:"13px 0",cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:600,transition:"all 0.3s"}}>
            {loading?"解析中 ...":"AIで解析する"}
          </button>
          {result&&!result.error&&<button onClick={printPDF} style={{flex:2,background:`linear-gradient(135deg,${C.sage},#6d9073)`,border:"none",borderRadius:12,color:"#fff",padding:"13px 0",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 16px rgba(125,158,131,0.2)"}}>📄 PDF出力</button>}
          {result&&!result.error&&<button onClick={saveHistory} disabled={saved} style={{flex:1,background:saved?"#e0e0e0":`linear-gradient(135deg,#c9728a,#e8a8b8)`,border:"none",borderRadius:12,color:saved?C.textSoft:"#fff",padding:"13px 0",cursor:saved?"default":"pointer",fontSize:13,fontWeight:600}}>{saved?"✓ 保存済":"💾 履歴保存"}</button>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ⑥ 加藤さん専用 Admin パネル
// ============================================================
function AdminPanel({ onClose, katoLog, setKatoLog, notifications, setNotifications, quickLinks, setQuickLinks, crewStartDates, setCrewStartDates }) {
  const [tab, setTab] = useState("notif");
  const [newNotif, setNewNotif] = useState({ title:"", body:"" });
  const [newLink, setNewLink] = useState({ label:"", icon:"🔗", url:"", color:C.rose });

  const btnStyle = (from, to) => ({
    background:`linear-gradient(135deg,${from},${to||from})`, border:"none", borderRadius:10,
    color:"#fff", padding:"8px 18px", cursor:"pointer", fontSize:11, fontWeight:600,
    letterSpacing:"0.04em", fontFamily:"'Jost',sans-serif", boxShadow:`0 4px 14px ${from}30`,
    display:"inline-block",
  });

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(61,51,48,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(14px)",animation:"fadeIn 0.3s ease"}}>
      <div style={{background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",border:`1px solid ${C.borderSoft}`,borderRadius:24,width:"100%",maxWidth:560,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(61,51,48,0.14)",animation:"scaleIn 0.32s ease",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.borderSoft}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:`linear-gradient(135deg,${C.rosePale},#fff)`}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,color:C.rose,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:4}}>Admin Panel</div>
            <h3 style={{margin:0,fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,fontStyle:"italic",color:C.text}}>加藤さん専用 管理画面</h3>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color=C.rose} onMouseLeave={e=>e.target.style.color=C.textSoft}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",padding:"0 16px",borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0,overflowX:"auto"}}>
          {[["notif","🔔 お知らせ"],["kato","📊 加藤ログ"],["links","🔗 リンク"],["dates","📅 入社日"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              padding:"12px 14px",background:"none",border:"none",whiteSpace:"nowrap",
              borderBottom:`2px solid ${tab===id?C.rose:"transparent"}`,
              color:tab===id?C.rose:C.textSoft,
              cursor:"pointer",fontSize:11,fontWeight:tab===id?600:400,
              letterSpacing:"0.04em",transition:"all 0.25s",fontFamily:"'Jost',sans-serif",
            }}>{label}</button>
          ))}
        </div>
        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {/* お知らせタブ */}
          {tab==="notif" && (
            <div>
              <div style={{marginBottom:18,background:C.roseLight,border:`1px solid ${C.rose}25`,borderRadius:14,padding:"16px 18px"}}>
                <div style={{fontSize:10,fontWeight:600,color:C.rose,marginBottom:10,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>新しいお知らせを追加</div>
                <input value={newNotif.title} onChange={e=>setNewNotif({...newNotif,title:e.target.value})} placeholder="タイトル" style={{...inS,marginBottom:8}}/>
                <textarea value={newNotif.body} onChange={e=>setNewNotif({...newNotif,body:e.target.value})} placeholder="内容を入力..." style={{...taS,marginBottom:10}} rows={2}/>
                <button onClick={()=>{
                  if(!newNotif.title.trim()||!newNotif.body.trim()) return;
                  setNotifications(prev=>[{id:Date.now(),date:new Date().toISOString().slice(0,10),title:newNotif.title,body:newNotif.body,isNew:true},...prev]);
                  setNewNotif({title:"",body:""});
                }} style={btnStyle(C.rose,C.roseSoft)}>追加する</button>
              </div>
              {notifications.map((n,i) => (
                <div key={n.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.borderSoft}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:3}}>{n.title}</div>
                    <div style={{fontSize:11,color:C.textMid,lineHeight:1.6}}>{n.body}</div>
                    <div style={{fontSize:9,color:C.textFaint,fontFamily:"'Jost',sans-serif",marginTop:4}}>{n.date}</div>
                  </div>
                  <button onClick={()=>setNotifications(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",fontSize:14,flexShrink:0,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color=C.coral} onMouseLeave={e=>e.target.style.color=C.textFaint}>✕</button>
                </div>
              ))}
              {notifications.length===0 && <div style={{color:C.textFaint,fontSize:12,textAlign:"center",padding:"20px 0"}}>お知らせはありません</div>}
            </div>
          )}
          {/* 加藤ログタブ */}
          {tab==="kato" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:11,color:C.textMid,marginBottom:2,lineHeight:1.7}}>各カードの内容・ステータスを編集できます。保存は自動です。</div>
              {katoLog.items.map((item,i) => (
                <div key={item.type} style={{background:item.bg,border:`1px solid ${item.color}25`,borderRadius:14,padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:15}}>{item.icon}</span>
                    <span style={{fontSize:10,fontWeight:600,color:item.color,letterSpacing:"0.1em",fontFamily:"'Jost',sans-serif"}}>{item.label}</span>
                  </div>
                  <input value={item.status||""} onChange={e=>{
                    const items=[...katoLog.items]; items[i]={...items[i],status:e.target.value};
                    setKatoLog({...katoLog,items,updated:new Date().toISOString().slice(0,10)});
                  }} placeholder="ステータス（例: 進行中 / 🔥 構築中）" style={{...inS,marginBottom:8,fontSize:11}}/>
                  <textarea value={item.content} onChange={e=>{
                    const items=[...katoLog.items]; items[i]={...items[i],content:e.target.value};
                    setKatoLog({...katoLog,items,updated:new Date().toISOString().slice(0,10)});
                  }} style={{...taS,fontSize:11}} rows={3}/>
                </div>
              ))}
            </div>
          )}

          {/* クイックリンクタブ */}
          {tab==="links" && (
            <div>
              <div style={{marginBottom:16,background:C.skyLight,border:`1px solid ${C.sky}25`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{fontSize:10,fontWeight:600,color:C.sky,marginBottom:10,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>新しいリンクを追加</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <input value={newLink.icon} onChange={e=>setNewLink({...newLink,icon:e.target.value})} placeholder="アイコン（絵文字）" style={{...inS,fontSize:11}}/>
                  <input value={newLink.label} onChange={e=>setNewLink({...newLink,label:e.target.value})} placeholder="ラベル名" style={{...inS,fontSize:11}}/>
                </div>
                <input value={newLink.url} onChange={e=>setNewLink({...newLink,url:e.target.value})} placeholder="URL（https://...）" style={{...inS,marginBottom:8,fontSize:11}}/>
                <button onClick={()=>{
                  if(!newLink.label.trim()||!newLink.url.trim()) return;
                  setQuickLinks(prev=>[...prev,{id:Date.now(),...newLink}]);
                  setNewLink({label:"",icon:"🔗",url:"",color:C.rose});
                }} style={{...btnStyle(C.sky,"#8db5d4")}}>追加する</button>
              </div>
              {quickLinks.map((link,i)=>(
                <div key={link.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.borderSoft}`}}>
                  <span style={{fontSize:18,flexShrink:0}}>{link.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text}}>{link.label}</div>
                    <div style={{fontSize:10,color:C.textFaint,fontFamily:"'Jost',sans-serif"}}>{link.url}</div>
                  </div>
                  <button onClick={()=>setQuickLinks(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",fontSize:14,transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color=C.coral} onMouseLeave={e=>e.target.style.color=C.textFaint}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* 入社日タブ */}
          {tab==="dates" && (
            <div>
              <div style={{fontSize:11,color:C.textMid,marginBottom:16,lineHeight:1.7,background:C.roseLight,borderRadius:12,padding:"12px 14px"}}>
                各Crewの入社日を設定すると、ダッシュボードに「NewCrewsに参加して○日」が表示されます🌸
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {CREW_MEMBERS.map(name=>(
                  <div key={name} style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:12,color:C.text,fontWeight:500,minWidth:100,flexShrink:0}}>{name}</span>
                    <input type="date" value={crewStartDates[name]||""} onChange={e=>{
                      setCrewStartDates(prev=>({...prev,[name]:e.target.value}));
                    }} style={{...inS,flex:1,fontSize:11}}/>
                    {crewStartDates[name] && (
                      <span style={{fontSize:10,color:C.rose,fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>
                        {Math.floor((new Date()-new Date(crewStartDates[name]))/(1000*60*60*24))}日
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ② 「今週の加藤」アクティビティログ ※ 毎週加藤さんが更新
// ============================================================
const KATO_LOG = {
  updated: "2026-03-18",
  items: [
    { type:"sales",      label:"営業・商談",    icon:"📊", color:"#c9964c", bg:"#fdf3e5", status:"進行中",
      content:"IT系スタートアップ2社と初回商談。来週中に提案書を作成予定。NewCrews横展開の可能性も検討中。" },
    { type:"meeting",    label:"クライアントMTG", icon:"🤝", color:"#7ba3c4", bg:"#edf2fb", status:"確定済み",
      content:"今週：YTJ月次定例・カチタス進捗確認\n来週：ブロードリンク四半期レビュー予定" },
    { type:"automation", label:"自動化構築中",  icon:"⚙️", color:"#b8a9c9", bg:"#f0ebf5", status:"🔥 構築中",
      content:"tldv→議事録AI解析→Slack自動通知の汎用テンプレ化を進行中。完成したらすぐ共有します！" },
    { type:"focus",      label:"今週の注力",    icon:"✨", color:"#c9728a", bg:"#fce8ee", status:"",
      content:"NewCrewsポータルの情報共有基盤づくり。みんなが毎日使いたくなるツールにしていきます！" },
  ],
};

// ============================================================
// 気分スタンプ設定
// ============================================================
const MOODS = [
  { emoji:"😊", label:"快調",       color:"#fdf3e5", accent:"#c9964c" },
  { emoji:"😐", label:"普通",       color:"#f6f1ec", accent:"#b8aaa0" },
  { emoji:"😮‍💨", label:"しんどい",  color:"#f0ebf5", accent:"#b8a9c9" },
  { emoji:"🔥", label:"やる気満々", color:"#fce8ee", accent:"#c9728a" },
  { emoji:"🌿", label:"おだやか",   color:"#e8f0e9", accent:"#7d9e83" },
];

const MOOD_MESSAGES = {
  "😊": "今日も最高の一日にしよう！✨",
  "😐": "無理せず、自分のペースでいこう。",
  "😮‍💨": "しんどい日もある。それでも今日もありがとう🤍",
  "🔥": "その熱量、最高です！全力で応援してる！",
  "🌿": "そのおだやかさが、チームを支えてくれています。",
};

// ============================================================
// クイックリンク初期データ
// ============================================================
const DEFAULT_QUICK_LINKS = [
  { id:1, label:"tldv",            icon:"🎙️", url:"https://tldv.io",           color:"#c9728a" },
  { id:2, label:"Notion",          icon:"📝", url:"https://notion.so",         color:"#b8a9c9" },
  { id:3, label:"Slack",           icon:"💬", url:"https://slack.com",         color:"#7ba3c4" },
  { id:4, label:"Googleドライブ",  icon:"📂", url:"https://drive.google.com",  color:"#c9964c" },
  { id:5, label:"スプレッドシート",icon:"📊", url:"https://sheets.google.com", color:"#7d9e83" },
  { id:6, label:"Chatwork",        icon:"💬", url:"https://www.chatwork.com",  color:"#c97272" },
];

// ============================================================
// Crew入社日デフォルト（管理画面で更新可）
// ============================================================
const DEFAULT_CREW_START_DATES = Object.fromEntries(
  CREW_MEMBERS.map(name => [name, "2024-04-01"])
);

// ============================================================
// ③④ ナレッジ共有フィード（自動化ネタ・アップセル情報）
// ============================================================
const SHARED_FEED_SEED = [
  { id:1, author:"加藤", date:"2026-03-18", type:"automation", client:"全般", autoStatus:"🔥 構築中",
    title:"tldv → 議事録 → Slack 汎用テンプレ",
    body:"tldvの文字起こし→Claude解析→議事録自動生成→Slack通知のフローをテンプレ化中。完成次第、全案件に展開予定。",
    tags:["tldv","Claude","Slack","汎用化"] },
  { id:2, author:"加藤", date:"2026-03-15", type:"automation", client:"全般", autoStatus:"📋 計画中",
    title:"月次レポート自動生成（全クライアント共通）",
    body:"KPIスプシ→自動集計→PDF生成→メール送信の一気通貫フローを計画中。実現すれば月8時間の工数削減見込み。",
    tags:["スプシ","PDF","工数削減"] },
  { id:3, author:"内藤 美由紀", date:"2026-03-14", type:"automation", client:"PLUS", autoStatus:"✅ 完成",
    title:"議事録 → Notionタスク自動生成フロー",
    body:"tldv文字起こし→Claude解析→Notionタスク自動生成。精度90%以上達成。他クライアントにも展開可能！",
    tags:["tldv","Notion","AI活用"] },
  { id:4, author:"木嶋渚", date:"2026-03-16", type:"automation", client:"ブロードリンク", autoStatus:"✅ 完成",
    title:"回収スケジュール自動通知",
    body:"Googleカレンダー＋Slack連携で回収日を自動通知。手動連絡が不要に。他社への横展開が可能。",
    tags:["Slack","GCal","テンプレート化"] },
  { id:5, author:"髙橋 尚希", date:"2026-03-17", type:"upsell", client:"YTJ",
    title:"採用LP A/Bテスト追加提案",
    body:"LP改善をきっかけにA/Bテスト運用の追加提案が可能。月額＋5万円の追加受注見込み。先方の反応も良好。",
    tags:["LP改善","追加提案"] },
  { id:6, author:"小野陽子", date:"2026-03-15", type:"upsell", client:"日本生命",
    title:"SNS運用レポート自動化ニーズ",
    body:"月次SNSレポートに毎回2時間かかっているとのこと。自動化ツール導入の提案余地あり。予算感も前向き。",
    tags:["レポート自動化","工数削減"] },
  { id:7, author:"中村 拓生", date:"2026-03-13", type:"insight", client:"全般",
    title:"MTG頻度と満足度の相関",
    body:"月2回以上MTGを実施しているクライアントは解約率が大幅に低い傾向。停滞案件は月1回以下が多い。",
    tags:["分析","顧客満足度"] },
];

const FEED_TYPE_CFG = {
  upsell:     { label:"📈 アップセル", color:"#c9964c", bg:"#fdf3e5" },
  automation: { label:"⚙️ 自動化",    color:"#7ba3c4", bg:"#edf2fb" },
  insight:    { label:"💡 インサイト", color:"#b8a9c9", bg:"#f0ebf5" },
};
const AUTO_STATUS_CFG = {
  "🔥 構築中": { color:"#c9728a", bg:"#fce8ee" },
  "✅ 完成":   { color:"#7d9e83", bg:"#e8f0e9" },
  "📋 計画中": { color:"#c9964c", bg:"#fdf3e5" },
};

// ============================================================
// カラーパレット — ローズゴールド × ラベンダー × クリーム
// ============================================================
const C = {
  // ベース
  bg:         "#faf7f4",
  bgWarm:     "#fdf9f5",
  bgCard:     "rgba(255,255,255,0.72)",
  bgCardSolid:"#ffffff",
  bgSub:      "#f6f1ec",
  bgGlass:    "rgba(255,255,255,0.55)",
  // ボーダー
  border:     "#ece4db",
  borderSoft: "#f0e9e2",
  borderGlow: "rgba(201,114,138,0.2)",
  // テキスト
  text:       "#3d3330",
  textMid:    "#7a6e65",
  textSoft:   "#b8aaa0",
  textFaint:  "#d4c8be",
  // アクセント
  rose:       "#c9728a",
  roseSoft:   "#e8a8b8",
  roseLight:  "#fce8ee",
  rosePale:   "#fdf2f5",
  roseGold:   "#d4a373",
  // サブカラー
  lavender:   "#b8a9c9",
  lavLight:   "#f0ebf5",
  sage:       "#7d9e83",
  sageLight:  "#e8f0e9",
  amber:      "#c9964c",
  amberLight: "#fdf3e5",
  coral:      "#c97272",
  coralLight: "#fbeaeb",
  sky:        "#7ba3c4",
  skyLight:   "#edf2fb",
};

// ============================================================
// 共通スタイル定数
// ============================================================
const inS = { width:"100%", background:C.bgSub, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", transition:"border-color 0.2s" };
const taS = { width:"100%", background:C.bgSub, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", color:C.text, fontSize:13, resize:"vertical", fontFamily:"inherit", lineHeight:1.8, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };
const txS = { margin:0, fontSize:13, color:C.textMid, lineHeight:1.9 };

// ============================================================
// ステータス設定
// ============================================================
const STATUS_CFG = {
  "進行中": { color:C.sage,  bg:C.sageLight  },
  "要対応": { color:C.amber, bg:C.amberLight },
  "停滞":   { color:C.coral, bg:C.coralLight },
  "完了":   { color:C.lavender, bg:C.lavLight },
};
const AUTO_CFG = {
  "未着手": { color:C.textSoft, bg:C.bgSub },
  "検証中": { color:C.amber, bg:C.amberLight },
  "実装中": { color:C.sky, bg:C.skyLight },
  "完了":   { color:C.sage, bg:C.sageLight },
};

// ============================================================
// グローバルCSS
// ============================================================
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Jost:ital,wght@0,200;0,300;0,400;0,500;0,600;1,300;1,400&family=Noto+Sans+JP:wght@200;300;400;500;600&family=Yomogi&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { margin:0; padding:0; overflow:hidden; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
  ::-webkit-scrollbar-thumb:hover { background:${C.roseSoft}; }
  input:focus,textarea:focus,select:focus { outline:none!important; border-color:${C.roseSoft}!important; }
  input::placeholder,textarea::placeholder { color:${C.textFaint}; }

  @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
  @keyframes floatSlow { 0%,100%{transform:translateY(0) scale(1)} 33%{transform:translateY(-12px) scale(1.03)} 66%{transform:translateY(6px) scale(0.97)} }
  @keyframes breathe { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.08)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes petalFall {
    0%   { transform:translateY(-10vh) translateX(0) rotate(0deg); opacity:0; }
    10%  { opacity:1; }
    90%  { opacity:0.8; }
    100% { transform:translateY(110vh) translateX(80px) rotate(360deg); opacity:0; }
  }
  @keyframes cursorBlink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
  @keyframes softPulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,114,138,0.3)} 50%{box-shadow:0 0 0 16px rgba(201,114,138,0)} }
  @keyframes lineExpand { from{width:0;opacity:0} to{width:100px;opacity:1} }
  @keyframes gradientShift {
    0%   { background-position:0% 50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0% 50%; }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow: 0 0 20px rgba(201,114,138,0.08); }
    50%     { box-shadow: 0 0 40px rgba(201,114,138,0.15); }
  }
  @keyframes moodPop {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.35) rotate(-8deg); }
    60%  { transform: scale(1.2) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  @keyframes moodConfirm {
    0%   { opacity:0; transform: translateY(8px) scale(0.9); }
    100% { opacity:1; transform: translateY(0) scale(1); }
  }
  @keyframes linkHover {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-3px); }
  }
`;

// ============================================================
// Badge コンポーネント
// ============================================================
function Badge({ label, cfg, small }) {
  const c = (cfg||{})[label] || { color:C.textSoft, bg:C.bgSub };
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,
      padding: small?"2px 8px":"3px 11px",
      borderRadius:20, fontSize: small?9:10, fontWeight:600,
      color:c.color, background:c.bg,
      border:`1px solid ${c.color}30`,
      letterSpacing:"0.05em", fontFamily:"'Jost',sans-serif",
      backdropFilter:"blur(4px)",
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:c.color,flexShrink:0,boxShadow:`0 0 6px ${c.color}40`}}/>
      {label}
    </span>
  );
}

// ============================================================
// SCard — グラスモーフィズムカード
// ============================================================
function SCard({ title, badge, children, fullWidth }) {
  return (
    <div style={{
      background:C.bgCard,
      backdropFilter:"blur(12px)",
      border:`1px solid ${C.borderSoft}`,
      borderRadius:16,
      padding:"20px 22px",
      gridColumn:fullWidth?"1/-1":"auto",
      boxShadow:"0 2px 12px rgba(61,51,48,0.04), 0 0 0 1px rgba(255,255,255,0.5) inset",
      transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
    }}
    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(201,114,138,0.08), 0 0 0 1px rgba(255,255,255,0.6) inset";e.currentTarget.style.transform="translateY(-2px)";}}
    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(61,51,48,0.04), 0 0 0 1px rgba(255,255,255,0.5) inset";e.currentTarget.style.transform="translateY(0)";}}
    >
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${C.rose},${C.roseSoft})`}}/>
          <span style={{fontSize:10,fontWeight:600,color:C.rose,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{title}</span>
        </div>
        {badge && typeof badge==="string" && <span style={{fontSize:10,color:C.textSoft,fontFamily:"'Jost',sans-serif",fontWeight:300}}>{badge}</span>}
        {badge && typeof badge!=="string" && badge}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// 花びらパーティクル — 季節で色が変わる
// ============================================================
const PETAL_COLORS = SEASON.petalHues.map(([h,s,l]) => ({
  color: `hsla(${h},${s}%,${l}%,0.45)`,
  shadow: `hsla(${h},${s}%,${l}%,0.2)`,
}));

// 花びらの形状バリエーション（CSS border-radius）
const PETAL_SHAPES = [
  "50% 0 50% 50%",      // 丸い花びら
  "60% 10% 50% 40%",    // 少しいびつな花びら
  "45% 5% 55% 45%",     // 細長い花びら
  "50% 0% 50% 50% / 80% 0% 60% 50%", // 桜の花びら風
  "40% 10% 60% 40%",    // 楕円花びら
];

function PetalParticles({ count = 24 }) {
  const petals = useMemo(() =>
    Array.from({length:count}, (_,i) => {
      const colorSet = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      const shape = PETAL_SHAPES[Math.floor(Math.random() * PETAL_SHAPES.length)];
      const size = 7 + Math.random() * 14;
      return {
        id: i,
        left: Math.random() * 100,
        size,
        aspectRatio: 0.6 + Math.random() * 0.4,
        duration: 10 + Math.random() * 14,
        delay: Math.random() * 12,
        color: colorSet.color,
        shadow: colorSet.shadow,
        shape,
        rotate: Math.floor(Math.random() * 360),
        swayAmount: 40 + Math.random() * 80,
      };
    })
  , [count]);

  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <style>{petals.map(p => `
        @keyframes petalDance${p.id} {
          0%   { transform:translateY(-5vh) translateX(0px) rotate(${p.rotate}deg) scale(1); opacity:0; }
          8%   { opacity:1; }
          25%  { transform:translateY(25vh) translateX(${p.swayAmount * 0.6}px) rotate(${p.rotate + 90}deg) scale(0.95); }
          50%  { transform:translateY(50vh) translateX(-${p.swayAmount * 0.3}px) rotate(${p.rotate + 200}deg) scale(1.05); }
          75%  { transform:translateY(75vh) translateX(${p.swayAmount}px) rotate(${p.rotate + 300}deg) scale(0.9); }
          92%  { opacity:0.7; }
          100% { transform:translateY(108vh) translateX(${p.swayAmount * 0.5}px) rotate(${p.rotate + 400}deg) scale(0.85); opacity:0; }
        }
      `).join("")}</style>
      {petals.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.left}%`,
          top:"-3%",
          width:p.size,
          height:p.size * p.aspectRatio,
          background:p.color,
          borderRadius:p.shape,
          animation:`petalDance${p.id} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          filter:`blur(${p.size > 14 ? 1.5 : 0.5}px)`,
          boxShadow:`0 2px 8px ${p.shadow}`,
        }}/>
      ))}
    </div>
  );
}

// ============================================================
// 装飾オーナメント（ダイヤ + ライン）
// ============================================================
function Ornament({ color = C.rose, width = 120, style: s }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:0.6,...s}}>
      <div style={{height:1,width:width/2,background:`linear-gradient(to right,transparent,${color})`}}/>
      <span style={{color,fontSize:7,lineHeight:1}}>&#x2726;</span>
      <div style={{height:1,width:width/2,background:`linear-gradient(to left,transparent,${color})`}}/>
    </div>
  );
}

// ============================================================
// tldv 解析モーダル
// ============================================================
// Word形式でダウンロードするヘルパー
function downloadAsWord(result, clientName) {
  const date = result.date || new Date().toISOString().slice(0,10);
  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset='UTF-8'></head><body style='font-family:MS Mincho,serif;font-size:11pt;line-height:1.8;'>
<h2 style='text-align:center;border-bottom:2px solid #333;padding-bottom:8px;'>議事録</h2>
<table style='width:100%;border-collapse:collapse;margin-bottom:16px;'>
  <tr><td style='width:120px;font-weight:bold;padding:4px 8px;border:1px solid #999;'>クライアント</td><td style='padding:4px 8px;border:1px solid #999;'>${clientName}</td></tr>
  <tr><td style='font-weight:bold;padding:4px 8px;border:1px solid #999;'>日付</td><td style='padding:4px 8px;border:1px solid #999;'>${date}</td></tr>
</table>
<h3 style='border-left:4px solid #c9728a;padding-left:8px;'>📋 サマリー</h3>
<p style='margin-left:16px;'>${result.summary||''}</p>
<h3 style='border-left:4px solid #7d9e83;padding-left:8px;'>✅ ネクストアクション</h3>
<ul>${(result.nextActions||[]).map(a=>`<li>${a}</li>`).join('')}</ul>
${result.concerns?`<h3 style='border-left:4px solid #e8a87c;padding-left:8px;'>⚠️ 懸念事項</h3><p style='margin-left:16px;'>${result.concerns}</p>`:''}
${result.automationHints?.length?`<h3 style='border-left:4px solid #9b8ec4;padding-left:8px;'>🤖 自動化ヒント</h3><ul>${result.automationHints.map(a=>`<li>${a}</li>`).join('')}</ul>`:''}
</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${date}_${clientName}_議事録.doc`; a.click();
  URL.revokeObjectURL(url);
}

function TldvModal({ onClose, onParsed, clientName }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const parse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method:"POST", headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({type:"claude",payload:{
          model:"claude-opus-4-5", max_tokens:1500,
          system:`BPO・業務自動化コンサル会社PORTAMENTの担当者として、会議録を詳細に解析してJSONのみ返してください（コードブロック不要）。
以下のフォーマットで出力：
{
  "date": "YYYY-MM-DD（会議日付。不明ならtodayの日付）",
  "summary": "会議の要点を2〜3文で簡潔に",
  "nextActions": ["担当者名（不明なら先方/弊社）: アクション内容（期日付き）"],
  "concerns": "内部共有用の懸念点・リスク（先方には見せない）",
  "automationHints": ["自動化・効率化できそうな業務を具体的に"],
  "clientNeeds": "クライアントの本質的なニーズ・課題（1〜2文）",
  "workflowPlan": "提案できる自動化フローの概要（あれば）",
  "automatableTasks": ["自動化対象の業務リスト"]
}
数値・固有名詞・期日は原文から正確に抽出。不明な項目は空文字や空配列。`,
          messages:[{role:"user",content:`以下の会議録を解析:\n\n${text}`}]
        }})
      });
      const data = await res.json();
      const raw = data.content.find(b=>b.type==="text")?.text||"{}";
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch(e) { setResult({error:"解析に失敗しました"}); }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(61,51,48,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(12px)",animation:"fadeIn 0.3s ease"}}>
      <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",border:`1px solid ${C.borderSoft}`,borderRadius:24,width:"100%",maxWidth:580,padding:40,position:"relative",boxShadow:"0 32px 80px rgba(61,51,48,0.12)",animation:"scaleIn 0.35s ease"}}>
        <button onClick={onClose} style={{position:"absolute",top:20,right:22,background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18,fontFamily:"serif",transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color=C.rose} onMouseLeave={e=>e.target.style.color=C.textSoft}>&#x2715;</button>
        <div style={{fontSize:9,fontWeight:600,color:C.rose,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:6,fontFamily:"'Jost',sans-serif"}}>tldv Import</div>
        <h3 style={{color:C.text,margin:"0 0 4px",fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:500}}>議事録インポート</h3>
        <Ornament width={80} style={{margin:"10px 0 16px",justifyContent:"flex-start"}}/>
        <p style={{color:C.textMid,margin:"0 0 20px",fontSize:12,lineHeight:1.7}}>文字起こしテキストを貼り付けると、AIが自動で解析します。</p>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="会議の文字起こしテキストをここに貼り付け..." style={{...taS,height:140}}/>
        {result && !result.error && (
          <div style={{background:C.sageLight,border:`1px solid ${C.sage}30`,borderRadius:12,padding:18,margin:"16px 0"}}>
            <div style={{color:C.sage,fontSize:11,fontWeight:700,marginBottom:10,letterSpacing:"0.08em"}}>&#x2713; 解析完了</div>
            {[["日付",result.date],["サマリー",result.summary],["ネクスト",result.nextActions?.join(" / ")],result.automationHints?.length?["自動化ヒント",result.automationHints?.join("、")]:null].filter(Boolean).map(([k,v])=>(
              <div key={k} style={{fontSize:12,color:C.textMid,marginBottom:4}}><span style={{color:C.textSoft,fontWeight:500}}>{k}：</span>{v}</div>
            ))}
          </div>
        )}
        {result?.error && <div style={{color:C.coral,fontSize:12,margin:"12px 0"}}>{result.error}</div>}
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={parse} disabled={loading||!text.trim()} style={{flex:1,background:loading?C.bgSub:`linear-gradient(135deg,${C.rose},${C.roseSoft})`,border:"none",borderRadius:12,color:loading?C.textSoft:"#fff",padding:"13px 0",cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:600,letterSpacing:"0.04em",transition:"all 0.3s",boxShadow:loading?"none":"0 4px 16px rgba(201,114,138,0.2)"}}>
            {loading?"解析中 ...":"AIで解析する"}
          </button>
          {result&&!result.error&&<button onClick={()=>downloadAsWord(result,clientName||"クライアント")} style={{flex:1,background:`linear-gradient(135deg,#5b7fc4,#7a9fd4)`,border:"none",borderRadius:12,color:"#fff",padding:"13px 0",cursor:"pointer",fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(91,127,196,0.2)"}}>📄 Word保存</button>}
          {result&&!result.error&&<button onClick={()=>{onParsed(result);onClose();}} style={{flex:1,background:`linear-gradient(135deg,${C.sage},#6d9073)`,border:"none",borderRadius:12,color:"#fff",padding:"13px 0",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 16px rgba(125,158,131,0.2)"}}>ポータルに反映</button>}
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
        const res = await fetch(GAS_URL, {
          method:"POST", headers:{"Content-Type":"text/plain"},
          body: JSON.stringify({type:"claude", payload:{
            model:"claude-opus-4-5", max_tokens:1500,
            system:"BPO会社PORTAMENTの担当者として、クライアント向けの丁寧な月次業務報告メールを件名＋本文の形式で作成してください。温かみがありながらもプロフェッショナルなトーンで。",
            messages:[{role:"user",content:`クライアント: ${client.name}\n担当Crew: ${client.crew.join("、")}\n直近MTG: ${detail.lastMtgDate||"未設定"}\nMTGサマリー: ${detail.mtgSummary||"定期確認実施"}\nネクストアクション: ${detail.nextActions?.join("、")||"なし"}\n懸念事項: ${detail.concerns||"特になし"}\n自動化進捗: ${detail.automationStatus}\n\n上記の情報をもとに、月次業務報告メールを作成してください。`}]
          }})
        });
        const data = await res.json();
        setReport(data.content.find(b=>b.type==="text")?.text||"生成に失敗しました");
        setStep("preview");
      } catch { setReport("エラーが発生しました。"); setStep("preview"); }
      setLoading(false);
    })();
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(61,51,48,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(12px)",animation:"fadeIn 0.3s ease"}}>
      <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",border:`1px solid ${C.borderSoft}`,borderRadius:24,width:"100%",maxWidth:660,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(61,51,48,0.12)",animation:"scaleIn 0.35s ease"}}>
        <div style={{padding:"28px 32px 20px",borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0,position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:20,right:24,background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18}} onMouseEnter={e=>e.target.style.color=C.rose} onMouseLeave={e=>e.target.style.color=C.textSoft}>&#x2715;</button>
          <div style={{fontSize:9,fontWeight:600,color:C.amber,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:4,fontFamily:"'Jost',sans-serif"}}>Monthly Report</div>
          <h3 style={{margin:0,fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:C.text}}>{client.name}</h3>
          <Ornament width={80} color={C.amber} style={{margin:"10px 0 0",justifyContent:"flex-start"}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"24px 32px"}}>
          {loading
            ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:180,flexDirection:"column",gap:14}}>
                <div style={{width:32,height:32,border:`2px solid ${C.borderSoft}`,borderTop:`2px solid ${C.amber}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
                <div style={{color:C.textSoft,fontSize:13,fontFamily:"'Jost',sans-serif"}}>レポートを生成しています</div>
              </div>
            : step==="sent"
              ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:180,gap:12}}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:C.sageLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>&#x2713;</div>
                  <div style={{color:C.sage,fontSize:18,fontWeight:500,fontFamily:"'Cormorant Garamond',serif"}}>送付完了</div>
                  <div style={{color:C.textMid,fontSize:13}}>{client.name} への月次レポートを送付しました</div>
                </div>
              : <div style={{color:C.text,fontSize:13,lineHeight:2,whiteSpace:"pre-wrap",fontFamily:"'Noto Sans JP',sans-serif"}}>{report}</div>
          }
        </div>
        {step==="preview" && !loading && (
          <div style={{padding:"18px 32px",borderTop:`1px solid ${C.borderSoft}`,display:"flex",gap:10,flexShrink:0}}>
            <button onClick={()=>navigator.clipboard.writeText(report)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:12,color:C.textMid,padding:"11px",cursor:"pointer",fontSize:12,transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.rose} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>コピー</button>
            <button onClick={()=>setStep("sent")} style={{flex:2,background:`linear-gradient(135deg,${C.amber},#d8a85a)`,border:"none",borderRadius:12,color:"#fff",padding:"11px",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 16px rgba(201,150,76,0.2)"}}>確認済み・送付する</button>
          </div>
        )}
        {step==="sent" && <div style={{padding:"18px 32px",borderTop:`1px solid ${C.borderSoft}`,flexShrink:0}}><button onClick={onClose} style={{width:"100%",background:C.bgSub,border:"none",borderRadius:12,color:C.textMid,padding:"11px",cursor:"pointer",fontSize:12,transition:"all 0.2s"}}>閉じる</button></div>}
      </div>
    </div>
  );
}

// ============================================================
// 提案書生成モーダル
// ============================================================
function mdToHtml(md) {
  if (!md) return "";
  let html = md
    // code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_,c)=>`<pre><code>${c.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`)
    // tables
    .replace(/(\|.+\|\n)(\|[-| :]+\|\n)((\|.+\|\n?)+)/g, (_, head, _sep, body) => {
      const headCells = head.trim().replace(/^\||\|$/g,"").split("|").map(c=>`<th>${c.trim()}</th>`).join("");
      const bodyRows = body.trim().split("\n").map(row=>{
        const cells = row.replace(/^\||\|$/g,"").split("|").map(c=>`<td>${c.trim()}</td>`).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<table><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    })
    // blockquotes
    .replace(/^> (.+)$/gm, (_,t)=>`<blockquote>${t}</blockquote>`)
    // hr
    .replace(/^---+$/gm, "<hr>")
    // headings
    .replace(/^### (.+)$/gm, (_,t)=>`<h3>${t}</h3>`)
    .replace(/^## (.+)$/gm, (_,t)=>`<h2>${t}</h2>`)
    .replace(/^# (.+)$/gm, (_,t)=>`<h1>${t}</h1>`)
    // bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, (_,t)=>`<strong><em>${t}</em></strong>`)
    .replace(/\*\*(.+?)\*\*/g, (_,t)=>`<strong>${t}</strong>`)
    .replace(/\*(.+?)\*/g, (_,t)=>`<em>${t}</em>`)
    // lists (handle nested - prefix)
    .replace(/^[ \t]*[-・]\s+(.+)$/gm, (_,t)=>`<li>${t}</li>`)
    // wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, m=>`<ul>${m}</ul>`)
    // remove stray | lines (single-pipe lines not part of tables)
    .replace(/^\|[^|]*\|?\s*$/gm, "")
    // remove standalone ↓ and 、、、 lines
    .replace(/^[↓、。…]+\s*$/gm, "")
    // paragraphs (remaining lines not already wrapped in HTML tags)
    .replace(/^(?!<(?:h[1-6]|ul|li|table|thead|tbody|tr|th|td|pre|code|blockquote|hr|p)).+/gm, t=>`<p>${t}</p>`)
    // clean up empty p tags
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/(<p>\s*)+(<\/p>\s*)+/g, "");
  return html;
}

function printProposalPDF(clientName, proposal) {
  const today = new Date().toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric"});
  const bodyHtml = mdToHtml(proposal);
  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Noto Sans JP',Arial,sans-serif;color:#2d2520;background:#fff;padding:0;}
  .cover{background:linear-gradient(135deg,#2d2520 0%,#4a3830 60%,#6b5a52 100%);color:#fff;padding:60px 56px 50px;min-height:200px;position:relative;overflow:hidden;}
  .cover::before{content:"";position:absolute;top:-40px;right:-40px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,0.04);}
  .cover::after{content:"";position:absolute;bottom:-60px;right:80px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.03);}
  .brand{font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:12px;font-weight:500;}
  .doc-type{font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9b8a8;margin-bottom:8px;font-weight:600;}
  .cover h1{font-size:28px;font-weight:700;line-height:1.3;margin-bottom:20px;color:#fff;}
  .cover-meta{display:flex;gap:32px;margin-top:28px;}
  .cover-meta div{font-size:11px;color:rgba(255,255,255,0.65);}
  .cover-meta span{display:block;font-size:13px;color:#fff;font-weight:500;margin-top:3px;}
  .accent-bar{height:4px;background:linear-gradient(90deg,#c9728a,#7ba3c4,#7d9e83);margin:0;}
  .body{padding:48px 56px;}
  h1{font-size:22px;font-weight:700;color:#2d2520;border-bottom:2px solid #c9728a;padding-bottom:10px;margin:36px 0 16px;}
  h2{font-size:17px;font-weight:700;color:#2d2520;border-left:4px solid #7ba3c4;padding-left:12px;margin:30px 0 14px;}
  h3{font-size:14px;font-weight:700;color:#4a3830;margin:22px 0 10px;padding:6px 12px;background:#f8f4f2;border-radius:6px;}
  p{font-size:13px;line-height:1.9;color:#3d3330;margin-bottom:10px;padding-left:4px;}
  ul{margin:8px 0 14px 24px;}
  li{font-size:13px;line-height:1.85;color:#3d3330;margin-bottom:4px;}
  table{width:100%;border-collapse:collapse;margin:16px 0 24px;font-size:12px;}
  th{background:#2d2520;color:#fff;padding:10px 14px;text-align:left;font-weight:600;font-size:11px;letter-spacing:0.05em;}
  td{padding:9px 14px;border-bottom:1px solid #e8e0dc;color:#3d3330;}
  tr:nth-child(even) td{background:#faf7f5;}
  tr:last-child td{font-weight:700;background:#f0ebe8;}
  pre{background:#f4f0ed;border-left:3px solid #7ba3c4;border-radius:0 8px 8px 0;padding:16px 18px;margin:14px 0;overflow-x:auto;}
  code{font-family:'Courier New',monospace;font-size:11.5px;color:#3d3330;line-height:1.7;white-space:pre;}
  blockquote{border-left:3px solid #e8a87c;padding:10px 16px;background:#fdf8f4;border-radius:0 8px 8px 0;margin:14px 0;font-size:12.5px;color:#7a6057;font-style:italic;}
  hr{border:none;border-top:1px solid #e8e0dc;margin:28px 0;}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #e8e0dc;display:flex;justify-content:space-between;align-items:center;}
  .footer-brand{font-size:11px;color:#a89080;letter-spacing:0.12em;}
  .footer-page{font-size:10px;color:#c0b0a0;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{margin:0;}}
</style></head><body>
<div class="cover">
  <div class="brand">PORTAMENT — Business Process Automation</div>
  <div class="doc-type">Automation Proposal</div>
  <h1>${clientName} 様<br>業務自動化提案書</h1>
  <div class="cover-meta">
    <div>作成日<span>${today}</span></div>
    <div>作成者<span>株式会社PORTAMENT</span></div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">
${bodyHtml}
<div class="footer">
  <div class="footer-brand">株式会社PORTAMENT &nbsp;|&nbsp; Business Process Automation</div>
  <div class="footer-page">Confidential</div>
</div>
</div>
</body></html>`;
  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(()=>win.print(), 800);
}

function ProposalModal({ client, detail, onClose }) {
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState("");

  useEffect(()=>{
    (async()=>{
      try {
        const res = await fetch(GAS_URL, {
          method:"POST", headers:{"Content-Type":"text/plain"},
          body: JSON.stringify({type:"claude", payload:{
            model:"claude-opus-4-5", max_tokens:2000,
            system:`あなたはPORTAMENT（BPO・業務自動化コンサル会社）の上級コンサルタントです。
クライアントの課題を深く理解し、説得力のある提案書を以下の5段構成で作成してください。

【厳守ルール】
- 冒頭にタイトル・作成日・作成者などのヘッダー情報は一切書かない（表紙は別途出力される）
- 時給は必ず2,000円で統一すること（他の金額は使用しない）
- フロー図・ステップはコードブロックや縦棒（|）を使わず、番号付きリストと箇条書きのみで表現
- 「、、、」「↓」などの記号・区切り文字は使用しない

【必須フォーマット】

## 1. 現状課題の定義
- 具体的な業務課題を箇条書きで3〜5項目
- できる限り定量的に表現（例：週〇時間、月〇件）

## 2. 現状コストの試算 ※時給2,000円換算
- 見出しは必ず「## 2. 現状コストの試算 ※時給2,000円換算」とすること（注釈は見出しに含める）
- 課題による時間・人件費コストを表形式で提示（時給2,000円で統一）
- 月次・年次での換算を含める
- 表の後に「> ※時給2,000円換算」は書かない（見出しに含まれているため）

## 3. 解決策の提案
- 案件ごとに以下の構造で記載すること：

### 案件名
**自動化フロー**
Step 1: 〇〇
Step 2: 〇〇
Step 3: 〇〇
（縦に1行ずつ。横並びにしない）

**各ステップの詳細**
① 〇〇（Step 1に対応）
【As-Is】現状の課題を具体的・定量的に記載
【To-Be】PORTAMENTによる解決策を記載

② 〇〇（Step 2に対応）
【As-Is】...
【To-Be】...

- 自動化フローのStep行は必ず縦並び（1行に1Step）で記載
- 各ステップの詳細では【As-Is】と【To-Be】を必ず対で記載すること
- コードブロックや縦棒（|）は使わない

## 4. 導入効果（ROI）
- 初期費用・月額費用・運用費用などのコスト項目は一切記載しない
- 以下の3項目のみを案件ごとに表形式で提示：
  - 削減工数（月〇時間、〇%削減）
  - 月間削減コスト（時給2,000円換算）
  - 年間削減コスト（時給2,000円換算）

## 5. 導入ステップ（3ヶ月ロードマップ）
- Phase1（1ヶ月目）：ヒアリング・設計
- Phase2（2ヶ月目）：開発・テスト
- Phase3（3ヶ月目）：本番稼働・安定化

数値は会議情報から推測して具体的に記載。不明な場合は合理的な仮定値を使用し（※仮定値）と注記。`,
            messages:[{role:"user",content:`【クライアント情報】
会社名: ${client.name}
業種・規模: ${client.industry||"不明"}
担当クルー: ${client.crew?.join("、")||"未定"}

【ヒアリング済み情報】
自動化可能業務: ${detail.automatableTasks?.join("、")||"ヒアリング必要"}
業務フロー案: ${detail.workflowPlan||"未設計"}
直近MTGサマリー: ${detail.mtgSummary||"なし"}
懸念事項: ${detail.concerns||"特になし"}
自動化ヒント: ${detail.automationHints?.join("、")||"なし"}
KPI状況: ${detail.kpiStatus||"未設定"}

上記情報をもとに、5段構成の提案書を作成してください。数値は積極的に推測・算出してください。`}]
          }})
        });
        const data = await res.json();
        setProposal(data.content.find(b=>b.type==="text")?.text||"生成に失敗しました");
      } catch { setProposal("エラーが発生しました。"); }
      setLoading(false);
    })();
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(61,51,48,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(12px)",animation:"fadeIn 0.3s ease"}}>
      <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",border:`1px solid ${C.borderSoft}`,borderRadius:24,width:"100%",maxWidth:700,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(61,51,48,0.12)",animation:"scaleIn 0.35s ease"}}>
        <div style={{padding:"28px 32px 20px",borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0,position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:20,right:24,background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18}} onMouseEnter={e=>e.target.style.color=C.rose} onMouseLeave={e=>e.target.style.color=C.textSoft}>&#x2715;</button>
          <div style={{fontSize:9,fontWeight:600,color:C.sky,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:4,fontFamily:"'Jost',sans-serif"}}>Automation Roadmap</div>
          <h3 style={{margin:0,fontSize:20,fontFamily:"'Cormorant Garamond',serif",fontWeight:500,color:C.text}}>{client.name} — 自動化提案書</h3>
          <Ornament width={80} color={C.sky} style={{margin:"10px 0 0",justifyContent:"flex-start"}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"24px 32px"}}>
          {loading
            ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:180,flexDirection:"column",gap:14}}>
                <div style={{width:32,height:32,border:`2px solid ${C.borderSoft}`,borderTop:`2px solid ${C.sky}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
                <div style={{color:C.textSoft,fontSize:13,fontFamily:"'Jost',sans-serif"}}>提案書を生成しています</div>
              </div>
            : <div style={{color:C.text,fontSize:13,lineHeight:2,whiteSpace:"pre-wrap",fontFamily:"'Noto Sans JP',sans-serif"}}>{proposal}</div>
          }
        </div>
        {!loading && proposal && (
          <div style={{padding:"18px 32px",borderTop:`1px solid ${C.borderSoft}`,display:"flex",gap:10,flexShrink:0}}>
            <button onClick={()=>navigator.clipboard.writeText(proposal)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:12,color:C.textMid,padding:"11px",cursor:"pointer",fontSize:12,transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.sky} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>コピー</button>
            <button onClick={()=>printProposalPDF(client.name,proposal)} style={{flex:2,background:`linear-gradient(135deg,#5b7fc4,#7a9fd4)`,border:"none",borderRadius:12,color:"#fff",padding:"11px",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 16px rgba(91,127,196,0.2)"}}>📄 PDF出力</button>
            <button onClick={onClose} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:12,color:C.textMid,padding:"11px",cursor:"pointer",fontSize:12,transition:"all 0.2s"}}>完了</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 気分スタンプカード
// ============================================================
function MoodStampCard({ crewName }) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `nc_mood_${(crewName||"guest").replace(/\s/g,"")}_${today}`;
  const [mood, setMood] = useLocalStorage(key, null);
  const [popped, setPopped] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 600); return () => clearTimeout(t); }, []);

  const select = (m) => {
    setPopped(m.emoji);
    setTimeout(() => { setMood(m); setPopped(null); }, 420);
  };

  return (
    <div style={{
      background:"rgba(255,255,255,0.65)", backdropFilter:"blur(12px)",
      border:`1px solid ${C.borderSoft}`, borderRadius:18, padding:"18px 22px",
      marginBottom:16, overflow:"hidden",
      boxShadow:"0 2px 12px rgba(61,51,48,0.04)",
      opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(12px)",
      transition:"opacity 0.7s ease, transform 0.7s ease",
    }}>
      {!mood ? (
        <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${C.amber},${C.rose})`}}/>
            <span style={{fontSize:10,fontWeight:600,color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>Today's Mood</span>
            <span style={{fontSize:9,color:C.textFaint,fontFamily:"'Jost',sans-serif",fontWeight:300}}>— 今日の気分を教えて</span>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {MOODS.map(m => (
              <button key={m.emoji} onClick={() => select(m)} style={{
                display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                background:popped===m.emoji?m.color:`linear-gradient(135deg,${m.color},rgba(255,255,255,0.8))`,
                border:`1px solid ${m.accent}25`,borderRadius:14,padding:"12px 14px",
                cursor:"pointer",transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
                animation:popped===m.emoji?"moodPop 0.42s cubic-bezier(0.4,0,0.2,1) forwards":"none",
                boxShadow:`0 2px 8px ${m.accent}10`,
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 20px ${m.accent}20`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 2px 8px ${m.accent}10`;}}
              >
                <span style={{fontSize:22,lineHeight:1}}>{m.emoji}</span>
                <span style={{fontSize:9,color:m.accent,fontWeight:600,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>{m.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",animation:"moodConfirm 0.5s ease both"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{
              width:48,height:48,borderRadius:"50%",
              background:`linear-gradient(135deg,${MOODS.find(m=>m.emoji===mood.emoji)?.color||C.roseLight},rgba(255,255,255,0.9))`,
              border:`1.5px solid ${MOODS.find(m=>m.emoji===mood.emoji)?.accent||C.rose}30`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
              boxShadow:`0 4px 16px ${MOODS.find(m=>m.emoji===mood.emoji)?.accent||C.rose}15`,
            }}>{mood.emoji}</div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:3}}>
                今日は<span style={{color:MOODS.find(m=>m.emoji===mood.emoji)?.accent||C.rose}}>「{mood.label}」</span>ですね
              </div>
              <div style={{
                fontFamily:"'Yomogi',cursive",fontSize:12,color:C.textMid,lineHeight:1.7,
              }}>{MOOD_MESSAGES[mood.emoji]}</div>
            </div>
          </div>
          <button onClick={()=>setMood(null)} style={{
            background:"none",border:`1px solid ${C.borderSoft}`,borderRadius:8,
            color:C.textFaint,cursor:"pointer",fontSize:10,padding:"4px 10px",
            fontFamily:"'Jost',sans-serif",transition:"all 0.2s",flexShrink:0,
          }} onMouseEnter={e=>e.currentTarget.style.borderColor=C.rose} onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderSoft}>変更</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// クイックリンクカード
// ============================================================
function QuickLinksCard({ links, isMobile }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 700); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      marginBottom:28,
      opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(12px)",
      transition:"opacity 0.7s ease, transform 0.7s ease",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${C.sky},${C.lavender})`}}/>
        <span style={{fontSize:10,fontWeight:600,color:C.sky,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>Quick Links</span>
        <span style={{fontSize:9,color:C.textFaint,fontFamily:"'Jost',sans-serif",fontWeight:300}}>— よく使うツール</span>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {links.map((link) => (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{
            display:"flex",alignItems:"center",gap:8,
            background:"rgba(255,255,255,0.65)",backdropFilter:"blur(8px)",
            border:`1px solid ${link.color}25`,borderRadius:14,
            padding:"10px 16px",textDecoration:"none",
            transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
            boxShadow:`0 2px 8px ${link.color}10`,
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.background=`linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.8))`;e.currentTarget.style.borderColor=`${link.color}50`;e.currentTarget.style.boxShadow=`0 8px 20px ${link.color}18`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.background="rgba(255,255,255,0.65)";e.currentTarget.style.borderColor=`${link.color}25`;e.currentTarget.style.boxShadow=`0 2px 8px ${link.color}10`;}}
          >
            <span style={{fontSize:16,lineHeight:1}}>{link.icon}</span>
            <span style={{fontSize:11,fontWeight:500,color:link.color,fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap"}}>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ウェルカム画面
// ============================================================
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "おはようございます";
  if (h >= 12 && h < 18) return "おつかれさまです";
  return "今日もお疲れさまでした";
}

function WelcomeScreen({ onEnter }) {
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState("");
  const fullText = "Welcome to NewCrews";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== 2) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(iv);
    }, 55);
    return () => clearInterval(iv);
  }, [phase]);

  const handleEnter = useCallback(() => {
    setPhase(3);
    setTimeout(onEnter, 800);
  }, [onEnter]);

  const ready = typedText.length >= fullText.length;

  return (
    <div onClick={phase >= 2 ? handleEnter : undefined} style={{
      position:"fixed", inset:0, zIndex:9999,
      background: phase === 0
        ? "#3d3330"
        : SEASON.gradient,
      backgroundSize: "200% 200%",
      animation: phase >= 1 ? "gradientShift 12s ease infinite" : "none",
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", cursor: phase >= 2 ? "pointer" : "default",
      transition:"all 1s cubic-bezier(0.4,0,0.2,1)",
      opacity: phase === 3 ? 0 : 1,
      transform: phase === 3 ? "scale(1.05)" : "scale(1)",
      overflow:"hidden",
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* 花びらパーティクル — 色とりどり */}
      {phase >= 1 && <PetalParticles count={30} />}

      {/* ボケ背景（季節カラー） */}
      {phase >= 1 && <>
        <div style={{position:"absolute",width:280,height:280,left:"10%",top:"15%",background:`radial-gradient(circle,${SEASON.bokeh1} 0%,transparent 70%)`,borderRadius:"50%",animation:"breathe 8s ease-in-out infinite",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:350,height:350,right:"5%",top:"20%",background:`radial-gradient(circle,${SEASON.bokeh2} 0%,transparent 70%)`,borderRadius:"50%",animation:"breathe 10s ease-in-out 1s infinite",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:220,height:220,left:"40%",bottom:"15%",background:`radial-gradient(circle,${SEASON.bokeh3} 0%,transparent 70%)`,borderRadius:"50%",animation:"breathe 9s ease-in-out 2s infinite",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:180,height:180,left:"65%",top:"60%",background:`radial-gradient(circle,${SEASON.bokeh1.replace("0.12","0.08")} 0%,transparent 70%)`,borderRadius:"50%",animation:"breathe 11s ease-in-out 0.5s infinite",pointerEvents:"none"}}/>
      </>}

      {/* コンテンツ */}
      <div style={{
        position:"relative", zIndex:1, textAlign:"center",
        opacity: phase >= 1 ? 1 : 0,
        transition:"opacity 1s ease 0.3s",
      }}>
        {/* PORTAMENT ラベル */}
        <div style={{
          fontSize:11, fontWeight:300, color:C.rose,
          letterSpacing:"0.35em", textTransform:"uppercase",
          marginBottom:20,
          fontFamily:"'Jost',sans-serif",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(12px)",
          transition:"all 0.7s ease 0.2s",
        }}>
          PORTAMENT
        </div>

        {/* Welcome to NewCrews */}
        <h1 style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize: 52, fontWeight: 400, fontStyle:"italic",
          color:C.text,
          margin:"0 0 8px",
          lineHeight:1.2,
          minHeight:"1.2em",
          letterSpacing:"0.03em",
        }}>
          {phase >= 2 && (
            <>
              <span style={{color:C.rose}}>
                {typedText.slice(0, 11)}
              </span>
              <span style={{color:C.text}}>
                {typedText.slice(11)}
              </span>
              {typedText.length < fullText.length && (
                <span style={{
                  display:"inline-block", width:2, height:"0.75em",
                  background:C.rose, marginLeft:3, verticalAlign:"baseline",
                  animation:"cursorBlink 0.8s step-end infinite",
                }}/>
              )}
            </>
          )}
        </h1>

        {/* ライン装飾 */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          gap:12, margin:"22px 0 28px",
          opacity: ready ? 1 : 0,
          transition:"opacity 0.8s ease",
        }}>
          <div style={{
            height:1, background:`linear-gradient(to right, transparent, ${C.rose})`,
            animation: ready ? "lineExpand 1s ease forwards" : "none",
          }}/>
          <span style={{color:C.rose, fontSize:8, letterSpacing:"0.2em"}}>&#x2726;</span>
          <div style={{
            height:1, background:`linear-gradient(to left, transparent, ${C.rose})`,
            animation: ready ? "lineExpand 1s ease forwards" : "none",
          }}/>
        </div>

        {/* 時間帯の挨拶 */}
        <p style={{
          fontFamily:"'Noto Sans JP','Jost',sans-serif",
          fontSize:15, color:C.textMid, fontWeight:300,
          margin:"0 0 44px",
          letterSpacing:"0.12em",
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(14px)",
          transition:"all 0.8s ease 0.3s",
        }}>
          {getGreeting()}
        </p>

        {/* はじめるボタン */}
        <div style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(18px)",
          transition:"all 0.8s ease 0.6s",
        }}>
          <button onClick={(e) => { e.stopPropagation(); handleEnter(); }} style={{
            fontFamily:"'Jost','Noto Sans JP',sans-serif",
            fontSize:13, fontWeight:400,
            color:"#fff",
            background:`linear-gradient(135deg, ${C.rose} 0%, ${C.roseSoft} 50%, ${C.lavender} 100%)`,
            backgroundSize:"200% 200%",
            animation:"softPulse 3s ease-in-out infinite, gradientShift 6s ease infinite",
            border:"none",
            borderRadius:40,
            padding:"14px 52px",
            cursor:"pointer",
            letterSpacing:"0.15em",
            boxShadow:"0 8px 32px rgba(201,114,138,0.25)",
            transition:"all 0.3s ease",
          }}>
            はじめる
          </button>
          <div style={{
            fontSize:10, color:C.textFaint, marginTop:18,
            letterSpacing:"0.08em",
            fontFamily:"'Jost',sans-serif",
            fontWeight:300,
          }}>
            click anywhere to enter
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Crew選択画面
// ============================================================
function CrewSelectScreen({ onSelect }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const containerRef = useRef(null);

  const cards = useMemo(() =>
    CREW_MEMBERS.map((name, i) => {
      const angle = (i / CREW_MEMBERS.length) * 360;
      const rad = (angle * Math.PI) / 180;
      return {
        name,
        entryX: Math.round(Math.cos(rad) * 280),
        entryY: Math.round(Math.sin(rad) * 220 - 40),
        entryRotate: ((i * 41) % 80) - 40,
        entryDelay: 40 + i * 55,
        floatDuration: 3.0 + (i % 4) * 0.7,
        floatDelay: 1.2 + (i * 0.22) % 1.0,
        floatY: 5 + (i % 4),
        floatRot: 1.5 + (i % 3) * 0.9,
      };
    })
  , []);

  // Web Animations APIで確実にエントリアニメーションを起動
  useEffect(() => {
    if (!containerRef.current) return;
    const wrappers = containerRef.current.querySelectorAll('.nc-card-wrap');
    wrappers.forEach((el, i) => {
      const c = cards[i];
      if (!c) return;
      el.animate(
        [
          { transform: `translate(${c.entryX}px,${c.entryY}px) rotate(${c.entryRotate}deg) scale(0.08)`, opacity: 0 },
          { transform: `translate(${-c.entryX*0.05}px,${-c.entryY*0.05}px) rotate(${c.entryRotate*-0.1}deg) scale(1.08)`, opacity: 1, offset: 0.62 },
          { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        ],
        {
          duration: 1000,
          delay: c.entryDelay,
          easing: 'cubic-bezier(0.34,1.56,0.64,1)',
          fill: 'both',
        }
      );
    });
  }, [cards]);

  const floatCSS = cards.map((c, i) => `
    @keyframes cardFloat${i} {
      0%,100% { transform: translateY(0) rotate(0deg); }
      35%     { transform: translateY(-${c.floatY}px) rotate(${c.floatRot}deg); }
      70%     { transform: translateY(${c.floatY*0.5}px) rotate(-${c.floatRot*0.6}deg); }
    }
  `).join('');

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9998,
      background:"linear-gradient(160deg,#fdf5f8 0%,#fce8ee 25%,#f5edf8 55%,#fdf5f0 80%,#fdf9f5 100%)",
      backgroundSize:"200% 200%",
      animation:"gradientShift 14s ease infinite, fadeIn 0.5s ease both",
      display:"flex",alignItems:"center",justifyContent:"center",
      flexDirection:"column",
    }}>
      <style>{GLOBAL_CSS + floatCSS}</style>
      <PetalParticles count={24} />

      <div style={{position:"absolute",width:400,height:400,left:"-8%",top:"-8%",background:"radial-gradient(circle,rgba(201,114,138,0.13) 0%,transparent 65%)",borderRadius:"50%",animation:"breathe 9s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:340,height:340,right:"-5%",top:"25%",background:"radial-gradient(circle,rgba(184,169,201,0.11) 0%,transparent 65%)",borderRadius:"50%",animation:"breathe 11s ease-in-out 1.5s infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:280,height:280,left:"28%",bottom:"-8%",background:"radial-gradient(circle,rgba(212,163,115,0.09) 0%,transparent 65%)",borderRadius:"50%",animation:"breathe 13s ease-in-out 0.8s infinite",pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",padding:"0 16px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontSize:10,fontWeight:300,color:"#c9728a",letterSpacing:"0.42em",textTransform:"uppercase",marginBottom:16,fontFamily:"'Jost',sans-serif",animation:"fadeInUp 0.5s ease 0.05s both",opacity:0.8}}>
          PORTAMENT NewCrews
        </div>
        <h2 style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:30,fontWeight:400,fontStyle:"italic",
          background:"linear-gradient(135deg,#c9728a,#d4a373)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          margin:"0 0 4px",letterSpacing:"0.04em",lineHeight:1.4,
          animation:"fadeInUp 0.5s ease 0.12s both",
        }}>
          あなたのお名前を選んでください
        </h2>
        <Ornament width={110} style={{margin:"14px auto 24px",animation:"fadeInUp 0.5s ease 0.2s both"}}/>

        {/* カードグリッド */}
        <div ref={containerRef} style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:14,maxWidth:700}}>
          {cards.map((c, i) => (
            // 層1: Web Animations APIがエントリを担当（nc-card-wrapクラスで参照）
            <div key={c.name} className="nc-card-wrap" style={{flexShrink:0}}>
              {/* 層2: ふわふわ浮遊（CSS animation） */}
              <div style={{
                animation:`cardFloat${i} ${c.floatDuration}s ease-in-out ${c.floatDelay}s infinite`,
              }}>
                {/* 層3: ホバースケール + ビジュアル */}
                <button
                  onClick={() => onSelect(c.name)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    width:104, height:104,
                    borderRadius:"50%",
                    background: hoveredIdx === i
                      ? "linear-gradient(135deg,#c9728a 0%,#e8a8b8 55%,#b8a9c9 100%)"
                      : "linear-gradient(145deg,rgba(255,255,255,0.92) 0%,rgba(252,232,240,0.82) 100%)",
                    border: hoveredIdx === i
                      ? "2px solid rgba(255,255,255,0.4)"
                      : "2px solid rgba(201,114,138,0.22)",
                    cursor:"pointer",
                    display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",
                    gap:3,
                    fontSize:12,
                    fontWeight: hoveredIdx === i ? 600 : 400,
                    color: hoveredIdx === i ? "#fff" : "#7a6e65",
                    fontFamily:"'Noto Sans JP',sans-serif",
                    letterSpacing:"0.03em",
                    lineHeight:1.45,
                    textAlign:"center",
                    padding:"0 10px",
                    wordBreak:"keep-all",
                    backdropFilter:"blur(18px)",
                    boxShadow: hoveredIdx === i
                      ? "0 18px 44px rgba(201,114,138,0.38), 0 0 0 5px rgba(201,114,138,0.10)"
                      : "0 6px 22px rgba(201,114,138,0.15), 0 0 0 1px rgba(255,255,255,0.75) inset",
                    transform: hoveredIdx === i ? "scale(1.18)" : "scale(1)",
                    transition:"transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, background 0.28s ease",
                  }}
                >
                  <span style={{fontSize:14,lineHeight:1,opacity:hoveredIdx===i?1:0.55,transition:"opacity 0.25s"}}>{c.name==="SV"?"💼":"🌸"}</span>
                  <span>{c.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:28,fontSize:9,color:"#c9728a",letterSpacing:"0.2em",fontFamily:"'Jost',sans-serif",fontWeight:300,animation:"fadeInUp 0.5s ease 1.5s both",opacity:0.45}}>
          ✦ &nbsp; select your name &nbsp; ✦
        </div>
      </div>
    </div>
  );
}

// ============================================================
// App ラッパー
// ============================================================
export default function App() {
  const [phase, setPhase] = useState("welcome"); // welcome → crewSelect → portal
  const [crewName, setCrewName] = useState(null);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {/* Crew選択画面はWelcomeの裏に先に描画し、Welcomeフェードアウトで見えるようにする */}
      {(phase === "welcome" || phase === "crewSelect") && (
        <CrewSelectScreen onSelect={(name) => { setCrewName(name); setPhase("portal"); }} />
      )}
      {phase === "welcome" && (
        <WelcomeScreen onEnter={() => setPhase("crewSelect")} />
      )}
      {phase === "portal" && (
        <Portal crewName={crewName} />
      )}
    </>
  );
}

// ============================================================
// メインポータル
// ============================================================

// ============================================================
// ⑤ 日替わりクイズデータ
// ============================================================
const QUIZ_DATA = [
  { id:1, day:"月", category:"Excel",   q:"セル内で改行するショートカットは？",              choices:["Ctrl + Enter","Alt + Enter","Shift + Enter","Tab + Enter"], answer:1, tip:"Alt + Enter でセル内改行！報告書作成時に大活躍します。" },
  { id:2, day:"火", category:"Chrome",  q:"直前に閉じたタブを復元するショートカットは？",    choices:["Ctrl + Z","Ctrl + Shift + T","Ctrl + T","Ctrl + W"],           answer:1, tip:"Ctrl + Shift + T で誤って閉じたタブを復活！何回でも遡れます。" },
  { id:3, day:"水", category:"スプシ",  q:"書式なしペーストするショートカットは？",          choices:["Ctrl + V","Ctrl + Shift + V","Ctrl + Alt + V","Ctrl + D"],     answer:1, tip:"Ctrl + Shift + V で書式崩れとおさらば！データ整理の必須テクです。" },
  { id:4, day:"木", category:"Windows", q:"デスクトップを一瞬で表示するショートカットは？",  choices:["Alt + D","Ctrl + D","Win + D","Win + M"],                       answer:2, tip:"Win + D でデスクトップ表示！もう一度押すと元に戻ります。" },
  { id:5, day:"金", category:"Slack",   q:"Slackで未読メッセージに一発で飛ぶショートカットは？", choices:["Ctrl + J","Ctrl + Shift + A","Ctrl + K","Ctrl + F"],       answer:1, tip:"Ctrl + Shift + A で全未読を一覧表示！朝イチの確認が爆速に。" },
  { id:6, day:"土", category:"Excel",   q:"選択範囲に同じ値を一括入力するショートカットは？", choices:["Ctrl + Enter","Ctrl + D","Ctrl + R","Ctrl + Shift + Enter"],  answer:0, tip:"範囲選択→値入力→Ctrl + Enter で一括入力！大量データ処理に効きます。" },
  { id:7, day:"日", category:"Chrome",  q:"Chromeのアドレスバーに一発フォーカスするショートカットは？", choices:["Ctrl + E","Ctrl + L","Alt + D","Ctrl + L と Alt + D 両方OK"], answer:3, tip:"Ctrl + L でも Alt + D でもOK！地味に毎日数秒節約できます。" },
];
const QUIZ_CAT_C = {
  "Excel":   { bg:"#10793F", text:"#fff" },
  "Chrome":  { bg:"#E8453C", text:"#fff" },
  "スプシ":  { bg:"#0F9D58", text:"#fff" },
  "Windows": { bg:"#0078D7", text:"#fff" },
  "Slack":   { bg:"#611F69", text:"#fff" },
};

// ─── クイズ: 正解エフェクト ───
function QuizStarBurst({ show }) {
  if (!show) return null;
  const items = Array.from({ length: 28 }).map((_, i) => {
    const angle = (i / 28) * 360;
    const dist = 140 + Math.random() * 200;
    const size = 7 + Math.random() * 14;
    const dx = Math.cos((angle * Math.PI) / 180) * dist;
    const dy = Math.sin((angle * Math.PI) / 180) * dist;
    const colors = ["#c9728a","#e8a8b8","#b8a9c9","#d4a373","#7ba3c4","#FFD700","#fce8ee"];
    const color = colors[i % colors.length];
    return { dx, dy, size, color, delay: Math.random() * 0.25 };
  });
  const burstCSS = `@keyframes qBurstOut {
    0%   { opacity:1; transform:translate(-50%,-50%) scale(0); }
    50%  { opacity:1; }
    100% { opacity:0; transform:translate(calc(-50% + var(--qdx)),calc(-50% + var(--qdy))) scale(1) rotate(180deg); }
  }`;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
      <style>{burstCSS}</style>
      {items.map((it,i) => (
        <div key={i} style={{
          position:"absolute",left:"50%",top:"50%",
          width:it.size,height:it.size,
          borderRadius:i%3===0?"50%":i%3===1?"2px":"0",
          backgroundColor:it.color,
          "--qdx":`${it.dx}px`,"--qdy":`${it.dy}px`,
          animation:`qBurstOut 1.0s ${it.delay}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
          opacity:0,
        }}/>
      ))}
    </div>
  );
}

// ─── クイズ: PERFECT WEEKセレブレーション ───
function QuizCelebration({ show, onDone }) {
  useEffect(() => {
    if (show) { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }
  }, [show, onDone]);
  if (!show) return null;
  const confettiColors = ["#c9728a","#e8a8b8","#b8a9c9","#d4a373","#FFD700","#7ba3c4","#fce8ee","#7d9e83"];
  return (
    <div style={{position:"fixed",inset:0,zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",
      background:"radial-gradient(ellipse at center,rgba(61,51,48,0.88) 0%,rgba(61,51,48,0.95) 100%)",
      animation:"fadeIn 0.4s ease-out",
    }}>
      <style>{`
        @keyframes qCelebDrop { 0%{transform:translateY(-40px) scale(0) rotate(-30deg);opacity:0;} 60%{transform:translateY(5px) scale(1.2) rotate(5deg);opacity:1;} 100%{transform:translateY(0) scale(1) rotate(0);opacity:1;} }
        @keyframes qCelebText { from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
        @keyframes qShimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes qConfetti { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1;} 100%{transform:translateY(110vh) rotate(720deg);opacity:0;} }
      `}</style>
      {Array.from({length:50}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",top:0,left:`${Math.random()*100}%`,
          width:`${4+Math.random()*8}px`,height:`${4+Math.random()*8}px`,
          backgroundColor:confettiColors[i%confettiColors.length],
          borderRadius:i%2===0?"50%":"1px",
          animation:`qConfetti ${2+Math.random()*3}s ${Math.random()*2}s linear forwards`,opacity:0,
        }}/>
      ))}
      <div style={{textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:28}}>
          {[0,1,2,3,4].map(i=>(
            <span key={i} style={{
              fontSize:52,display:"inline-block",
              animation:`qCelebDrop 0.6s ${0.2+i*0.14}s cubic-bezier(0.34,1.56,0.64,1) both`,
              filter:"drop-shadow(0 0 12px rgba(255,215,0,0.8))",
            }}>⭐</span>
          ))}
        </div>
        <div style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:40,fontWeight:700,letterSpacing:4,fontStyle:"italic",
          background:"linear-gradient(90deg,#FFD700,#c9728a,#FFD700,#c9728a,#FFD700)",
          backgroundSize:"200% auto",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          animation:"qCelebText 0.8s 1.2s ease-out both,qShimmer 2s 1.5s linear infinite",
        }}>🎉 PERFECT WEEK! 🎉</div>
        <p style={{
          color:"rgba(255,255,255,0.75)",fontSize:15,marginTop:14,
          fontFamily:"'Noto Sans JP',sans-serif",
          animation:"qCelebText 0.8s 1.6s ease-out both",opacity:0,
        }}>★5つ達成！今週のショートカットマスター🌸</p>
      </div>
    </div>
  );
}


// ============================================================
// ④ NaviCrew Bot — 社内問い合わせAIアシスタント
// ============================================================
const SLACK_CHANNEL_ID = "C0AE03HRML5";
const NAVI_CHANNEL_ID  = "C0AMU9B2RCK";   // #navicrew-knowledge
const GAS_URL = "https://script.google.com/macros/s/AKfycbwJKXMDM0lnIgKljfBVr0LzFRK5nOMRX-FISLqsBL_1oiVj5WNiY3FFuotkD-Xqg5P-Ow/exec";
const SLACK_KATO_ID    = "U08H0A48A2G";

// NaviCrew Bot チャットモーダル（Crew向け）
function NaviCrewBotModal({ crewName, onClose, knowledge, onAddHistory }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role:"bot", text:"こんにちは！NaviCrewです。\n業務のことや社内ルールなど、なんでも聞いてください。\n回答できないものは加藤さんに確認します。", ts: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages(m=>[...m, { role:"user", text:q, ts:Date.now() }]);
    setLoading(true);
    try {
      // ナレッジコンテキスト構築
      const knowledgeCtx = (knowledge||[])
        .filter(k=>k.status==="resolved" && k.answer)
        .map(k=>`Q: ${k.question}\nA: ${k.answer}`)
        .join("\n---\n");

      const res = await fetch(GAS_URL, {
        method:"POST", headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({type:"claude", payload:{
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`あなたはPORTAMENT（BPO・業務自動化コンサル会社）の社内アシスタント「NaviCrew」です。
社員からの質問に丁寧・簡潔に回答してください。

【ナレッジベース（過去のQ&A）】
${knowledgeCtx || "まだナレッジがありません。"}

【回答ルール】
1. ナレッジベースに該当する情報がある場合、それを参照して正確に回答してください。
2. ナレッジにない場合でも、一般的なビジネス知識で回答可能なら回答してください。
3. 社内固有の情報（給与・人事・契約内容など）で確信がない場合は、回答の末尾に必ず以下を追加：
   [ESCALATE]
4. 回答は簡潔に。3〜5文程度。敬語で温かみのあるトーンで。
5. [ESCALATE]タグは回答の最後の行に単独で記載すること。`,
          messages:[{role:"user",content:q}]
        }})
      });
      const data = await res.json();
      const raw = data.content?.find(b=>b.type==="text")?.text || "申し訳ありません、エラーが発生しました。";
      const needsEscalation = raw.includes("[ESCALATE]");
      const answer = raw.replace(/\[ESCALATE\]/g,"").trim();

      // 履歴に追加
      const entry = {
        id: Date.now(),
        question: q,
        answer: answer,
        aiAnswer: answer,
        crewName: crewName,
        createdAt: new Date().toISOString(),
        status: needsEscalation ? "escalated" : "resolved",
        answeredBy: "bot",
        katoAnswer: "",
      };
      onAddHistory(entry);

      // エスカレ時はSlack通知
      if (needsEscalation) {
        setMessages(m=>[...m, {
          role:"bot", text: answer + "\n\n⚠️ この回答は確認が必要です。加藤さんに確認中です...", ts:Date.now(), escalated:true
        }]);
        // Slack通知
        console.log("🧚 NaviCrew エスカレ送信開始");
        fetch(GAS_URL, {
          method:"POST", headers:{"Content-Type":"text/plain"},
          body: JSON.stringify({
            type:"slack",
            payload:{
              channel: NAVI_CHANNEL_ID,
              username: "NaviCrew",
              icon_emoji: ":fairy:",
              text: `🚨 NaviCrew エスカレーション`,
              blocks: [
                { type:"header", text:{ type:"plain_text", text:"🚨 NaviCrew エスカレーション", emoji:true }},
                { type:"section", fields:[
                  { type:"mrkdwn", text:`*質問者*\n${crewName||"不明"}` },
                  { type:"mrkdwn", text:`*日時*\n${new Date().toLocaleString("ja-JP")}` },
                ]},
                { type:"section", text:{ type:"mrkdwn", text:`*💬 質問*\n${q}` }},
                { type:"section", text:{ type:"mrkdwn", text:`*🤖 AI仮回答*\n${answer.slice(0,300)}` }},
                { type:"context", elements:[{ type:"mrkdwn", text:`<@${SLACK_KATO_ID}> ポータルで正式回答をお願いします 🧚` }]},
              ]
            }
          })
        }).then(r=>r.json()).then(d=>console.log("🧚 Slack応答:",d)).catch(e=>console.error("🧚 Slack送信エラー:",e));
      } else {
        setMessages(m=>[...m, { role:"bot", text:answer, ts:Date.now() }]);
      }
    } catch(e) {
      setMessages(m=>[...m, { role:"bot", text:"エラーが発生しました。もう一度お試しください。", ts:Date.now() }]);
    }
    setLoading(false);
  };

  const msgStyle = (role) => ({
    maxWidth:"82%",
    padding:"12px 16px",
    borderRadius: role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: role==="user" ? `linear-gradient(135deg,${C.rose},${C.roseSoft})` : "rgba(255,255,255,0.85)",
    color: role==="user" ? "#fff" : C.text,
    fontSize:13, lineHeight:1.75,
    fontFamily:"'Noto Sans JP',sans-serif",
    whiteSpace:"pre-wrap",
    boxShadow: role==="user" ? `0 2px 10px ${C.rose}20` : "0 1px 6px rgba(0,0,0,0.04)",
    alignSelf: role==="user" ? "flex-end" : "flex-start",
  });

  return (
    <div style={{position:"fixed",inset:0,zIndex:8000,background:"rgba(61,51,48,0.45)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.2s ease"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"100%",maxWidth:520,height:"min(680px,85vh)",background:"linear-gradient(160deg,#fdf5f8,#fce8ee 40%,#f5edf8 80%,#fdf9f5)",borderRadius:24,border:`1px solid ${C.borderSoft}`,boxShadow:"0 24px 64px rgba(201,114,138,0.18)",display:"flex",flexDirection:"column",overflow:"hidden",animation:"fadeInUp 0.3s ease"}}>
        {/* ヘッダー */}
        <div style={{padding:"18px 24px 14px",borderBottom:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.rose},${C.lavender})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🧚</div>
            <div>
              <div style={{fontSize:10,color:C.rose,letterSpacing:"0.22em",fontFamily:"'Jost',sans-serif",fontWeight:400,textTransform:"uppercase"}}>NaviCrew Bot</div>
              <div style={{fontSize:16,fontFamily:"'Cormorant Garamond',serif",fontWeight:400,fontStyle:"italic",color:C.text}}>社内アシスタント</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.7)",cursor:"pointer",color:C.textSoft,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {/* チャット領域 */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
              {m.role==="bot" && <div style={{fontSize:9,color:C.textFaint,marginBottom:3,fontFamily:"'Jost',sans-serif"}}>NaviCrew</div>}
              <div style={msgStyle(m.role)}>
                {m.text}
                {m.escalated && <div style={{marginTop:8,padding:"6px 10px",borderRadius:8,background:"rgba(201,114,138,0.1)",border:`1px solid ${C.rose}20`,fontSize:11,color:C.rose}}>🔔 加藤さんにSlack通知済み</div>}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:"flex",alignItems:"flex-start",flexDirection:"column"}}>
              <div style={{fontSize:9,color:C.textFaint,marginBottom:3,fontFamily:"'Jost',sans-serif"}}>NaviCrew</div>
              <div style={{...msgStyle("bot"),display:"flex",gap:4,padding:"14px 20px"}}>
                <span style={{animation:"pulse 1.2s infinite",animationDelay:"0s"}}>.</span>
                <span style={{animation:"pulse 1.2s infinite",animationDelay:"0.2s"}}>.</span>
                <span style={{animation:"pulse 1.2s infinite",animationDelay:"0.4s"}}>.</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>

        {/* 入力エリア */}
        <div style={{padding:"12px 20px 16px",borderTop:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.5)",flexShrink:0}}>
          <div style={{display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask();}}} placeholder="質問を入力..." style={{flex:1,padding:"11px 16px",borderRadius:16,border:`1px solid ${input?C.rose+"40":C.borderSoft}`,background:"rgba(255,255,255,0.8)",color:C.text,fontSize:13,fontFamily:"'Noto Sans JP',sans-serif",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box"}}/>
            <button onClick={ask} disabled={!input.trim()||loading} style={{width:42,height:42,borderRadius:"50%",border:"none",background:input.trim()?`linear-gradient(135deg,${C.rose},${C.roseSoft})`:"rgba(255,255,255,0.5)",color:input.trim()?"#fff":C.textFaint,cursor:input.trim()?"pointer":"default",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:input.trim()?`0 4px 12px ${C.rose}25`:"none"}}>
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 日替わりクイズカード ───
function DailyQuizCard({ quizStats, setQuizStats }) {
  const today = new Date();
  const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const quiz = QUIZ_DATA[dayIndex];
  const catColor = QUIZ_CAT_C[quiz.category] || { bg:"#c9728a", text:"#fff" };
  const days = ["月","火","水","木","金","土","日"];

  // 週リセット判定（月曜0時）
  const getWeekKey = () => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - (d.getDay()===0?6:d.getDay()-1));
    return d.toISOString().slice(0,10);
  };
  const weekKey = getWeekKey();

  // 今日すでに回答済みか
  const todayKey = today.toISOString().slice(0,10);
  const alreadyAnswered = quizStats.lastDay === todayKey;

  const [selected, setSelected] = useState(alreadyAnswered ? quizStats.lastSelected : null);
  const [answered, setAnswered] = useState(alreadyAnswered);
  const [showBurst, setShowBurst] = useState(false);
  const [showCeleb, setShowCeleb] = useState(false);
  const [open, setOpen] = useState(false);

  // 週リセット
  const stars = quizStats.weekKey === weekKey ? quizStats.stars : 0;
  const streak = quizStats.weekKey === weekKey ? quizStats.streak : 0;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === quiz.answer;
    const newStars = correct ? Math.min(stars + 1, 7) : stars;
    const newStreak = correct ? streak + 1 : 0;
    setQuizStats({ stars: newStars, streak: newStreak, weekKey, lastDay: todayKey, lastSelected: idx });
    if (correct) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1400);
      if (newStars >= 5) setTimeout(() => setShowCeleb(true), 700);
    }
  };

  const isCorrect = selected === quiz.answer;
  const currentStars = quizStats.weekKey === weekKey ? quizStats.stars : 0;

  const quizCSS = `
    @keyframes qSlideIn { from{opacity:0;transform:translateX(-10px);} to{opacity:1;transform:translateX(0);} }
    @keyframes qTipReveal { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
    @keyframes qCorrectPulse { 0%{box-shadow:0 0 0 0 rgba(125,158,131,0.4);} 70%{box-shadow:0 0 0 10px rgba(125,158,131,0);} 100%{box-shadow:0 0 0 0 rgba(125,158,131,0);} }
    @keyframes qWrongShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
    @keyframes qStarPop { 0%{transform:scale(1);} 50%{transform:scale(1.5);} 100%{transform:scale(1);} }
  `;

  return (
    <>
      <style>{quizCSS}</style>
      <QuizStarBurst show={showBurst}/>
      <QuizCelebration show={showCeleb} onDone={() => setShowCeleb(false)}/>

      <div style={{marginBottom:28,animation:"fadeInUp 0.6s ease 0.5s both"}}>
        {/* セクションヘッダー */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:3,height:16,borderRadius:2,background:`linear-gradient(180deg,${C.amber},${C.rose})`}}/>
          <span style={{fontSize:10,fontWeight:600,color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>Daily Quiz</span>
          <span style={{fontSize:9,color:C.textFaint,fontFamily:"'Jost',sans-serif",fontWeight:300}}>— 今日のショートカット</span>
          {/* 今日回答済みバッジ */}
          {alreadyAnswered && (
            <span style={{fontSize:9,background:isCorrect?"rgba(125,158,131,0.12)":"rgba(239,68,68,0.08)",
              color:isCorrect?C.sage:"#e07070",padding:"2px 8px",borderRadius:10,
              border:`1px solid ${isCorrect?"rgba(125,158,131,0.3)":"rgba(239,68,68,0.2)"}`,
              fontFamily:"'Jost',sans-serif",fontWeight:500,
            }}>{isCorrect?"✓ 正解済み":"✗ 回答済み"}</span>
          )}
        </div>

        {/* クイズカード */}
        <div style={{
          background:"rgba(255,255,255,0.65)",backdropFilter:"blur(14px)",
          borderRadius:20,border:`1px solid ${C.borderSoft}`,
          boxShadow:"0 4px 24px rgba(201,114,138,0.08)",
          overflow:"hidden",
        }}>
          {/* カードヘッダー（クリックで開閉） */}
          <div
            onClick={() => setOpen(o => !o)}
            style={{
              padding:"18px 22px",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              borderBottom: open ? `1px solid ${C.borderSoft}` : "none",
              transition:"background 0.2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.4)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {/* 星プログレス（コンパクト） */}
              <div style={{display:"flex",gap:3}}>
                {days.map((d,i) => {
                  const filled = i < currentStars;
                  const isToday = i === dayIndex;
                  const justEarned = answered && isCorrect && i === currentStars - 1;
                  return (
                    <div key={d} style={{
                      width:26,height:26,borderRadius:8,
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                      gap:1,
                      background: filled
                        ? "linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,165,0,0.1))"
                        : isToday ? `${C.roseLight}` : "rgba(255,255,255,0.3)",
                      border: isToday ? `1.5px solid ${C.rose}40` : `1px solid ${C.borderSoft}`,
                      animation: justEarned ? "qStarPop 0.5s ease-out" : "none",
                      transition:"all 0.3s",
                    }}>
                      <span style={{fontSize:10,lineHeight:1}}>{filled ? "⭐" : "☆"}</span>
                    </div>
                  );
                })}
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:C.text,fontFamily:"'Noto Sans JP',sans-serif"}}>
                  {days[dayIndex]}曜日のクイズ
                  <span style={{
                    marginLeft:8,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:12,
                    backgroundColor:catColor.bg,color:catColor.text,
                  }}>{quiz.category}</span>
                </div>
                <div style={{fontSize:10,color:C.textSoft,marginTop:2,fontFamily:"'Jost',sans-serif",fontWeight:300}}>
                  {currentStars >= 5 ? "🏆 PERFECT WEEK達成！" : `あと ${Math.max(0,5-currentStars)}問 で PERFECT WEEK`}
                  {streak > 1 && <span style={{marginLeft:8,color:C.amber}}>🔥 {streak}日連続</span>}
                </div>
              </div>
            </div>
            <div style={{
              width:28,height:28,borderRadius:"50%",
              background:`linear-gradient(135deg,${C.roseLight},rgba(255,255,255,0.9))`,
              border:`1px solid ${C.rose}30`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:13,color:C.rose,transition:"transform 0.25s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}>▾</div>
          </div>

          {/* クイズ本体（開いた時のみ表示） */}
          {open && (
            <div style={{padding:"20px 22px"}}>
              {/* 問題文 */}
              <div style={{
                fontSize:16,fontWeight:600,color:C.text,lineHeight:1.65,
                marginBottom:20,fontFamily:"'Noto Sans JP',sans-serif",
              }}>{quiz.q}</div>

              {/* 選択肢 */}
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:16}}>
                {quiz.choices.map((ch, i) => {
                  const isThis = selected === i;
                  const isAns = i === quiz.answer;
                  let bg = "rgba(255,255,255,0.55)";
                  let border = `1px solid ${C.borderSoft}`;
                  let textColor = C.textMid;
                  let anim = `qSlideIn 0.35s ${0.08+i*0.07}s ease-out both`;

                  if (answered) {
                    if (isAns) {
                      bg = "rgba(125,158,131,0.12)";
                      border = "2px solid rgba(125,158,131,0.5)";
                      textColor = C.sage;
                      anim = "qCorrectPulse 1s ease-out";
                    } else if (isThis && !isAns) {
                      bg = "rgba(239,68,68,0.07)";
                      border = "2px solid rgba(239,68,68,0.35)";
                      textColor = "#d07070";
                      anim = "qWrongShake 0.45s ease-out";
                    } else {
                      bg = "rgba(255,255,255,0.3)";
                      textColor = C.textFaint;
                    }
                  }

                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={answered}
                      style={{
                        display:"flex",alignItems:"center",gap:12,
                        width:"100%",padding:"12px 16px",borderRadius:12,
                        background:bg,border,color:textColor,
                        cursor:answered?"default":"pointer",
                        fontSize:13,fontWeight:500,fontFamily:"'Noto Sans JP',sans-serif",
                        textAlign:"left",
                        transition:"all 0.2s ease",
                        animation:anim,
                        backdropFilter:"blur(8px)",
                      }}
                      onMouseEnter={e=>{ if(!answered){ e.currentTarget.style.background="rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor=`${C.rose}40`; }}}
                      onMouseLeave={e=>{ if(!answered){ e.currentTarget.style.background="rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor=C.borderSoft; }}}
                    >
                      <span style={{
                        width:26,height:26,borderRadius:7,flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:11,fontWeight:700,
                        background: answered && isAns ? "rgba(125,158,131,0.15)"
                          : answered && isThis && !isAns ? "rgba(239,68,68,0.1)"
                          : `${C.roseLight}`,
                        color: answered && isAns ? C.sage
                          : answered && isThis && !isAns ? "#d07070"
                          : C.rose,
                        fontFamily:"'Jost',sans-serif",
                      }}>
                        {answered && isAns ? "✓" : answered && isThis && !isAns ? "✗" : String.fromCharCode(65+i)}
                      </span>
                      <span>{ch}</span>
                    </button>
                  );
                })}
              </div>

              {/* 結果 & ヒント */}
              {answered && (
                <div style={{
                  borderRadius:14,padding:"16px 18px",
                  background: isCorrect
                    ? "linear-gradient(135deg,rgba(125,158,131,0.08),rgba(125,158,131,0.03))"
                    : "linear-gradient(135deg,rgba(239,68,68,0.06),rgba(239,68,68,0.02))",
                  border:`1px solid ${isCorrect?"rgba(125,158,131,0.2)":"rgba(239,68,68,0.15)"}`,
                  animation:"qTipReveal 0.45s ease-out",
                }}>
                  <div style={{fontSize:14,fontWeight:700,color:isCorrect?C.sage:"#d07070",marginBottom:8}}>
                    {isCorrect ? "🎉 正解！★ GET!" : "😢 残念…！次こそ★をGETしよう！"}
                  </div>
                  <div style={{
                    fontSize:12,color:C.textMid,lineHeight:1.75,
                    padding:"10px 14px",borderRadius:10,
                    background:"rgba(255,255,255,0.55)",backdropFilter:"blur(6px)",
                  }}>
                    💡 {quiz.tip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// NaviCrew 管理画面（加藤向け）
function NaviCrewAdminModal({ onClose, knowledge, onUpdateKnowledge }) {
  const [filter, setFilter] = useState("all"); // all | escalated | resolved
  const [editingId, setEditingId] = useState(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = (knowledge||[]).filter(k => {
    if (filter==="escalated") return k.status==="escalated";
    if (filter==="resolved") return k.status==="resolved";
    return true;
  }).sort((a,b) => {
    if (a.status==="escalated" && b.status!=="escalated") return -1;
    if (a.status!=="escalated" && b.status==="escalated") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const escalatedCount = (knowledge||[]).filter(k=>k.status==="escalated").length;

  const handleResolve = (id) => {
    if (!editAnswer.trim()) return;
    setSaving(true);
    const updated = (knowledge||[]).map(k =>
      k.id===id ? { ...k, katoAnswer:editAnswer.trim(), answer:editAnswer.trim(), status:"resolved", answeredBy:"kato", resolvedAt:new Date().toISOString() } : k
    );
    onUpdateKnowledge(updated);
    setEditingId(null);
    setEditAnswer("");
    setSaving(false);
  };

  const statusBadge = (s) => {
    const styles = {
      escalated: { bg:"#fef2f2", color:"#dc2626", border:"#fecaca", label:"要回答" },
      resolved:  { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", label:"回答済" },
    };
    const st = styles[s] || styles.resolved;
    return <span style={{fontSize:10,padding:"2px 8px",borderRadius:8,background:st.bg,color:st.color,border:`1px solid ${st.border}`,fontWeight:600}}>{st.label}</span>;
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:8000,background:"rgba(61,51,48,0.45)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.2s ease"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"100%",maxWidth:700,height:"min(750px,90vh)",background:"linear-gradient(160deg,#fdf5f8,#fce8ee 40%,#f5edf8 80%,#fdf9f5)",borderRadius:24,border:`1px solid ${C.borderSoft}`,boxShadow:"0 24px 64px rgba(201,114,138,0.18)",display:"flex",flexDirection:"column",overflow:"hidden",animation:"fadeInUp 0.3s ease"}}>
        {/* ヘッダー */}
        <div style={{padding:"18px 24px 14px",borderBottom:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.sky},${C.lavender})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🧚</div>
            <div>
              <div style={{fontSize:10,color:C.sky,letterSpacing:"0.22em",fontFamily:"'Jost',sans-serif",fontWeight:400,textTransform:"uppercase"}}>NaviCrew Admin</div>
              <div style={{fontSize:16,fontFamily:"'Cormorant Garamond',serif",fontWeight:400,fontStyle:"italic",color:C.text}}>ナレッジ管理 {escalatedCount>0&&<span style={{fontSize:12,color:"#dc2626",fontFamily:"'Jost',sans-serif",fontStyle:"normal"}}>({escalatedCount}件 要回答)</span>}</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.7)",cursor:"pointer",color:C.textSoft,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {/* フィルタ */}
        <div style={{padding:"12px 24px",display:"flex",gap:8,flexShrink:0,borderBottom:`1px solid ${C.borderSoft}20`}}>
          {[["all","すべて"],["escalated","要回答"],["resolved","回答済"]].map(([key,label])=>(
            <button key={key} onClick={()=>setFilter(key)} style={{padding:"5px 14px",borderRadius:14,fontSize:11,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",fontWeight:500,background:filter===key?`linear-gradient(135deg,${C.sky},#8db5d4)`:"rgba(255,255,255,0.7)",border:`1px solid ${filter===key?"transparent":C.borderSoft}`,color:filter===key?"#fff":C.textSoft,transition:"all 0.2s"}}>
              {label} {key==="escalated"&&escalatedCount>0&&`(${escalatedCount})`}
            </button>
          ))}
          <div style={{flex:1}}/>
          <div style={{fontSize:11,color:C.textFaint,alignSelf:"center",fontFamily:"'Jost',sans-serif"}}>全{(knowledge||[]).length}件</div>
        </div>

        {/* 一覧 */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 24px"}}>
          {filtered.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 0",color:C.textFaint,fontSize:13}}>
              {filter==="escalated" ? "エスカレ案件はありません ✨" : "まだ質問履歴がありません"}
            </div>
          ) : filtered.map(k=>(
            <div key={k.id} style={{background:"rgba(255,255,255,0.8)",border:`1px solid ${k.status==="escalated"?"#fecaca":C.borderSoft}`,borderRadius:14,padding:16,marginBottom:10,transition:"all 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    {statusBadge(k.status)}
                    <span style={{fontSize:10,color:C.textFaint,fontFamily:"'Jost',sans-serif"}}>{new Date(k.createdAt).toLocaleString("ja-JP")}</span>
                    <span style={{fontSize:10,color:C.textSoft}}>by {k.crewName||"不明"}</span>
                  </div>
                  <div style={{fontSize:13,color:C.text,fontWeight:600,fontFamily:"'Noto Sans JP',sans-serif"}}>{k.question}</div>
                </div>
              </div>
              {/* AI仮回答 */}
              <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(123,163,196,0.08)",marginBottom:8,fontSize:12,color:C.textMid,lineHeight:1.7}}>
                <span style={{fontSize:10,color:C.sky,fontWeight:600}}>AI回答：</span><br/>
                {k.aiAnswer || k.answer}
              </div>
              {/* 加藤の回答 or 入力欄 */}
              {k.status==="escalated" ? (
                editingId===k.id ? (
                  <div style={{marginTop:8}}>
                    <textarea value={editAnswer} onChange={e=>setEditAnswer(e.target.value)} placeholder="正式回答を入力... （ナレッジとして蓄積されます）" rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${C.rose}40`,background:"rgba(255,255,255,0.9)",color:C.text,fontSize:13,fontFamily:"'Noto Sans JP',sans-serif",resize:"vertical",lineHeight:1.7,outline:"none",boxSizing:"border-box"}}/>
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <button onClick={()=>{setEditingId(null);setEditAnswer("");}} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${C.borderSoft}`,background:"none",color:C.textSoft,cursor:"pointer",fontSize:12}}>キャンセル</button>
                      <button onClick={()=>handleResolve(k.id)} disabled={!editAnswer.trim()||saving} style={{flex:2,padding:"9px",borderRadius:10,border:"none",background:editAnswer.trim()?`linear-gradient(135deg,${C.sage},#6d9073)`:"#eee",color:editAnswer.trim()?"#fff":C.textFaint,cursor:editAnswer.trim()?"pointer":"default",fontSize:12,fontWeight:600}}>回答してナレッジ化する</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>{setEditingId(k.id);setEditAnswer(k.aiAnswer||k.answer||"");}} style={{marginTop:4,padding:"8px 16px",borderRadius:10,border:`1px solid ${C.rose}40`,background:`linear-gradient(135deg,rgba(201,114,138,0.08),rgba(201,114,138,0.04))`,color:C.rose,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.2s"}}>✏️ 回答する</button>
                )
              ) : k.answeredBy==="kato" && k.katoAnswer ? (
                <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(125,158,131,0.08)",fontSize:12,color:C.textMid,lineHeight:1.7}}>
                  <span style={{fontSize:10,color:C.sage,fontWeight:600}}>加藤回答（ナレッジ化済）：</span><br/>
                  {k.katoAnswer}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Portal({ crewName }) {
  // ① localStorage永続化
  const [detailsState, setDetailsState] = useLocalStorage("nc_details", () => {
    const base = {};
    CLIENTS_DATA.forEach(c => { base[c.id] = CLIENT_DETAILS_SEED[c.id] || CLIENT_DETAILS_DEFAULT(); });
    return base;
  });
  const [showNaviBot, setShowNaviBot] = useState(false);
  const [showNaviAdmin, setShowNaviAdmin] = useState(false);
  const [naviKnowledge, setNaviKnowledge] = useLocalStorage("nc_navi_knowledge", []);
  const [showSales, setShowSales] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [salesHistory, setSalesHistory] = useLocalStorage("nc_sales_history", []);
  const [quizStats, setQuizStats] = useLocalStorage("nc_quiz", { stars:0, streak:0, weekKey:"", lastDay:"", lastSelected:null });
  const [sharedFeed, setSharedFeed] = useLocalStorage("nc_feed", SHARED_FEED_SEED);
  const [katoLog, setKatoLog] = useLocalStorage("nc_katolog", KATO_LOG);
  const [notifications, setNotifications] = useLocalStorage("nc_notifs", INITIAL_NOTIFICATIONS);
  const [quickLinks, setQuickLinks] = useLocalStorage("nc_quicklinks", DEFAULT_QUICK_LINKS);
  const [crewStartDates, setCrewStartDates] = useLocalStorage("nc_startdates", DEFAULT_CREW_START_DATES);

  const [clientsState] = useState(CLIENTS_DATA);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [editMode, setEditMode] = useState(false);
  const [editDetail, setEditDetail] = useState(null);
  const [showTldv, setShowTldv] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("すべて");
  const [portalReady, setPortalReady] = useState(false);
  const [newFeedPost, setNewFeedPost] = useState({ type:"upsell", client:"", title:"", body:"", tags:"", autoStatus:"🔥 構築中" });
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [feedFilter, setFeedFilter] = useState("all");

  // ② モバイル対応
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ⑥ Admin パネル（ロゴを5回クリックで開く）
  const [showAdmin, setShowAdmin] = useState(false);
  const adminClickCount = useRef(0);
  const adminClickTimer = useRef(null);

  const firstName = crewName ? crewName.split(/[\s　]/).pop() || crewName : "";

  // ③⑤ 自分の担当クライアント
  const myClients = crewName
    ? clientsState.filter(c => c.crew.some(n => n === crewName || n.replace(/\s/g,"") === crewName.replace(/\s/g,"")))
    : [];

  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  // SV選択時は新規営業モードを自動で開く
  useEffect(() => {
    if (crewName === "SV") setShowSales(true);
  }, [crewName]);

  // ② モバイルリサイズ監視
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ⑥ Adminパネル開閉（ロゴ5回クリック）
  const handleAdminClick = useCallback(() => {
    adminClickCount.current++;
    if (adminClickTimer.current) clearTimeout(adminClickTimer.current);
    adminClickTimer.current = setTimeout(() => { adminClickCount.current = 0; }, 2000);
    if (adminClickCount.current >= 5) {
      adminClickCount.current = 0;
      setShowAdmin(true);
    }
  }, []);

  // ④ 全通知を既読にする
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  }, [setNotifications]);

  const detail = selected
    ? (editMode ? editDetail : (detailsState[selected.id] || CLIENT_DETAILS_DEFAULT()))
    : CLIENT_DETAILS_DEFAULT();

  const filtered = clientsState.filter(c => {
    const m = c.name.includes(search) || c.crew.some(cr=>cr.includes(search));
    const s = filterStatus==="すべて" || c.status===filterStatus;
    return m && s;
  });

  const startEdit = () => { setEditDetail(JSON.parse(JSON.stringify(detailsState[selected.id]||CLIENT_DETAILS_DEFAULT()))); setEditMode(true); };
  const saveEdit = () => { setDetailsState(prev=>({...prev,[selected.id]:editDetail})); setEditMode(false); };
  const handleTldvParsed = (r) => {
    console.log("=== handleTldvParsed 呼び出し ===", r);
    console.log("selected:", selected?.name, "detail.slackChannel:", detail.slackChannel);
    setDetailsState(prev=>({...prev,[selected.id]:{...prev[selected.id],
      lastMtgDate:r.date||prev[selected.id].lastMtgDate,
      mtgSummary:r.summary||prev[selected.id].mtgSummary,
      nextActions:r.nextActions?.length?r.nextActions:prev[selected.id].nextActions,
      concerns:r.concerns||prev[selected.id].concerns,
      tldvHistory:[...(prev[selected.id].tldvHistory||[]),r]
    }}));
    // NaviCrew として担当Slackチャンネルに議事録通知（未設定時は #delivery-crew へ）
    const ch = detail.slackChannel || "C0865EFGSCV";
    {
      const naText = (r.nextActions||[]).map(a=>`• ${a}`).join("\n");
      fetch(GAS_URL, {
        method:"POST", headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({
          type:"slack",
          payload:{
            channel: ch,
            text: `📋 ${selected.name}のMTG議事録が更新されました`,
            blocks:[
              {type:"header", text:{type:"plain_text", text:`📋 ${selected.name} - MTG議事録`, emoji:true}},
              {type:"section", fields:[
                {type:"mrkdwn", text:`*📅 日付*\n${r.date||"不明"}`},
                {type:"mrkdwn", text:`*👤 担当Crew*\n${crewName||"不明"}`}
              ]},
              {type:"section", text:{type:"mrkdwn", text:`*📌 サマリー*\n${r.summary||"なし"}`}},
              {type:"section", text:{type:"mrkdwn", text:`*✅ ネクストアクション*\n${naText||"なし"}`}},
              ...(r.concerns?[{type:"section", text:{type:"mrkdwn", text:`*⚠️ 懸念事項*\n${r.concerns}`}}]:[]),
              ...(r.automationHints?.length?[{type:"section", text:{type:"mrkdwn", text:`*⚙️ 自動化ヒント*\n${r.automationHints.join("、")}`}}]:[]),
              {type:"context", elements:[{type:"mrkdwn", text:`_NaviCrew · NewCrews Portal · ${crewName}が解析_`}]}
            ]
          }
        })
      }).then(r=>r.text()).then(t=>console.log("Slack通知結果:",t)).catch(e=>console.warn("NaviCrew Slack通知失敗:",e));
    }
    // Gドライブに議事録を自動格納
    fetch(GAS_URL, {
      method:"POST", headers:{"Content-Type":"text/plain"},
      body: JSON.stringify({
        type:"drive",
        payload:{
          clientName: selected.name,
          date: r.date || new Date().toISOString().slice(0,10),
          summary: r.summary||"",
          nextActions: r.nextActions||[],
          concerns: r.concerns||"",
          automationHints: r.automationHints||[],
          crewName: crewName||""
        }
      })
    }).catch(e=>console.warn("Gドライブ保存失敗:",e));
  };
  const addAction = () => {
    if (!newAction.trim()) return;
    setDetailsState(prev=>({...prev,[selected.id]:{...prev[selected.id],nextActions:[...(prev[selected.id].nextActions||[]),newAction.trim()]}}));
    setNewAction("");
  };
  const removeAction = (i) => setDetailsState(prev=>({...prev,[selected.id]:{...prev[selected.id],nextActions:prev[selected.id].nextActions.filter((_,idx)=>idx!==i)}}));

  const stats = { total:clientsState.length, active:clientsState.filter(c=>c.status==="進行中").length, alert:clientsState.filter(c=>c.status==="要対応").length, stalled:clientsState.filter(c=>c.status==="停滞").length };

  // ボタンスタイル生成
  const btnOutline = (color=C.rose) => ({
    background:"none",border:`1px solid ${color}40`,borderRadius:10,
    color,padding:"8px 14px",cursor:"pointer",fontSize:11,fontWeight:500,
    letterSpacing:"0.03em",transition:"all 0.25s",fontFamily:"'Jost',sans-serif",
  });
  const btnFill = (from,to) => ({
    background:`linear-gradient(135deg,${from},${to||from})`,border:"none",borderRadius:10,
    color:"#fff",padding:"8px 18px",cursor:"pointer",fontSize:11,fontWeight:600,
    letterSpacing:"0.04em",transition:"all 0.25s",fontFamily:"'Jost',sans-serif",
    boxShadow:`0 4px 14px ${from}30`,
  });

  return (
    <div style={{
      display:"flex",height:"100vh",
      background:SEASON.portalGrad,
      fontFamily:"'Jost','Noto Sans JP',sans-serif",color:C.text,overflow:"hidden",
      opacity:portalReady?1:0, transition:"opacity 0.6s ease",
    }}>
      {/* 背景装飾 */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",width:400,height:400,right:"-5%",top:"-10%",background:"radial-gradient(circle,rgba(201,114,138,0.06) 0%,transparent 70%)",borderRadius:"50%",animation:"breathe 12s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:350,height:350,left:"-5%",bottom:"-5%",background:"radial-gradient(circle,rgba(184,169,201,0.05) 0%,transparent 70%)",borderRadius:"50%",animation:"breathe 14s ease-in-out 2s infinite"}}/>
      </div>

      {/* ② モバイルオーバーレイ */}
      {isMobile && sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(61,51,48,0.18)",zIndex:49,backdropFilter:"blur(2px)"}}/>
      )}

      {/* ===== サイドバー ===== */}
      <div style={{
        width:280,
        background:"rgba(253,249,245,0.92)",
        backdropFilter:"blur(20px)",
        borderRight:`1px solid ${C.borderSoft}`,
        display:"flex",flexDirection:"column",flexShrink:0,
        animation:"slideInLeft 0.6s ease forwards",
        ...(isMobile ? {
          position:"fixed", top:0, left:sidebarOpen ? 0 : -288, height:"100vh",
          zIndex:50, transition:"left 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: sidebarOpen ? "6px 0 28px rgba(61,51,48,0.12)" : "none",
        } : { position:"relative", zIndex:1 }),
      }}>
        {/* デコライン */}
        <div style={{position:"absolute",top:0,right:0,bottom:0,width:1,background:`linear-gradient(180deg,${C.rose}20,${C.lavender}15,transparent)`}}/>

        {/* ロゴ */}
        <div style={{padding:"32px 24px 22px",borderBottom:`1px solid ${C.borderSoft}`}}>
          <div style={{marginBottom:20}} onClick={handleAdminClick}>
            <div style={{fontSize:9,fontWeight:400,color:C.rose,letterSpacing:"0.28em",textTransform:"uppercase",marginBottom:6,fontFamily:"'Jost',sans-serif",cursor:"default",userSelect:"none"}}>PORTAMENT</div>
            <div style={{fontSize:24,fontFamily:"'Cormorant Garamond',serif",fontWeight:400,fontStyle:"italic",color:C.text,lineHeight:1.1}}>NewCrews</div>
            <div style={{fontSize:10,color:C.textFaint,marginTop:6,letterSpacing:"0.1em",fontWeight:300}}>Operations Portal</div>
          </div>
          <Ornament width={100} style={{marginBottom:16}}/>
          {/* ステータスサマリー */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{l:"進行中",v:stats.active,c:C.sage},{l:"要対応",v:stats.alert,c:C.amber},{l:"停滞",v:stats.stalled,c:C.coral},{l:"合計",v:stats.total,c:C.rose}].map(s=>(
              <div key={s.l} style={{
                background:"rgba(255,255,255,0.6)",backdropFilter:"blur(8px)",
                borderRadius:10,padding:"10px 12px",
                border:`1px solid ${C.borderSoft}`,
                transition:"all 0.25s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.9)";e.currentTarget.style.borderColor=`${s.c}40`;}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.6)";e.currentTarget.style.borderColor=C.borderSoft;}}
              >
                <div style={{fontSize:22,fontWeight:500,color:s.c,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:9,color:C.textSoft,marginTop:3,letterSpacing:"0.06em",fontWeight:400}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 検索・フィルター */}
        <div style={{padding:"14px 18px 10px",borderBottom:`1px solid ${C.borderSoft}`}}>
          <div style={{position:"relative",marginBottom:10}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="企業名・Crew名 で検索"
              style={{width:"100%",background:"rgba(255,255,255,0.5)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 12px 9px 32px",color:C.text,fontSize:11,fontFamily:"inherit",backdropFilter:"blur(4px)"}}/>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.textFaint,pointerEvents:"none"}}>&#x1F50D;</span>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {["すべて","進行中","要対応","停滞"].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{
                padding:"3px 10px",borderRadius:14,fontSize:9,cursor:"pointer",fontWeight:500,letterSpacing:"0.04em",
                background:filterStatus===s?`linear-gradient(135deg,${C.rose},${C.roseSoft})`:"rgba(255,255,255,0.4)",
                border:`1px solid ${filterStatus===s?"transparent":C.border}`,
                color:filterStatus===s?"#fff":C.textSoft,transition:"all 0.25s",
                fontFamily:"'Jost',sans-serif",
                boxShadow:filterStatus===s?"0 2px 8px rgba(201,114,138,0.2)":"none",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* クライアント一覧 */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
          {filtered.map((c,idx) => {
            const cfg = STATUS_CFG[c.status]||STATUS_CFG["進行中"];
            const isSelected = selected?.id===c.id;
            return (
              <div key={c.id} onClick={()=>{setSelected(c);setEditMode(false);setActiveTab("detail");}}
                style={{
                  padding:"12px 22px 12px 20px",cursor:"pointer",
                  borderLeft:`3px solid ${isSelected?C.rose:"transparent"}`,
                  background:isSelected?"rgba(255,255,255,0.7)":"transparent",
                  transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  animation:`fadeInUp 0.3s ease ${idx*0.03}s both`,
                }}
                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background="rgba(255,255,255,0.4)";}}
                onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background="transparent";}}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:isSelected?600:400,color:isSelected?C.text:C.textMid,transition:"all 0.2s"}}>{c.name}</span>
                  <span style={{width:6,height:6,borderRadius:"50%",background:cfg.color,flexShrink:0,boxShadow:`0 0 6px ${cfg.color}30`}}/>
                </div>
                <div style={{fontSize:10,color:C.textFaint,fontWeight:300}}>{c.crew[0]}{c.crew.length>1?` +${c.crew.length-1}`:""}</div>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div style={{padding:"16px 22px",borderTop:`1px solid ${C.borderSoft}`}}>
          <button onClick={()=>setShowSales(true)} style={{
            width:"100%",marginBottom:12,padding:"11px 0",borderRadius:12,
            background:`linear-gradient(135deg,#5b7fc4,#7a9fd4)`,
            border:"none",color:"#fff",cursor:"pointer",
            fontSize:12,fontWeight:600,letterSpacing:"0.06em",
            boxShadow:"0 4px 16px rgba(91,127,196,0.25)",
            transition:"all 0.25s",fontFamily:"'Noto Sans JP',sans-serif",
            display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            💼 新規営業モード
          </button>
          <button onClick={()=>setShowSalesHistory(true)} style={{
            width:"100%",marginBottom:12,padding:"9px 0",borderRadius:12,
            background:"rgba(91,127,196,0.08)",border:`1px solid rgba(91,127,196,0.2)`,
            color:"#5b7fc4",cursor:"pointer",fontSize:11,fontWeight:600,
            transition:"all 0.25s",fontFamily:"'Noto Sans JP',sans-serif",
          }}>
            🗂 商談履歴{salesHistory.length>0&&` (${salesHistory.length})`}
          </button>
          {crewName==="SV" && (
            <button onClick={()=>setShowNaviAdmin(true)} style={{
              width:"100%",marginBottom:12,padding:"9px 0",borderRadius:12,
              background:naviKnowledge.filter(k=>k.status==="escalated").length>0?"rgba(220,38,38,0.08)":"rgba(123,163,196,0.08)",
              border:`1px solid ${naviKnowledge.filter(k=>k.status==="escalated").length>0?"#fecaca":"rgba(123,163,196,0.2)"}`,
              color:naviKnowledge.filter(k=>k.status==="escalated").length>0?"#dc2626":C.sky,
              cursor:"pointer",fontSize:11,fontWeight:600,
              transition:"all 0.25s",fontFamily:"'Noto Sans JP',sans-serif",
            }}>
              🧚 NaviCrew管理{naviKnowledge.filter(k=>k.status==="escalated").length>0&&` (${naviKnowledge.filter(k=>k.status==="escalated").length}件)`}
            </button>
          )}
          <Ornament width={80} style={{marginBottom:8}}/>
          <div style={{fontSize:9,color:C.textFaint,textAlign:"center",letterSpacing:"0.12em",fontWeight:300}}>
            PORTAMENT Inc. — NC Operations
          </div>
        </div>
      </div>

      {/* ===== メインエリア ===== */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:1,
        animation:"fadeIn 0.5s ease 0.2s both",
        ...(isMobile ? { width:"100vw" } : {}),
      }}>

        {/* ===== ダッシュボードモード ===== */}
        {!selected && (
          <div style={{flex:1,overflowY:"auto",padding:isMobile?"24px 16px":"44px 40px"}}>
            <div style={{maxWidth:920,margin:"0 auto"}}>
              {/* パーソナライズド挨拶ヘッダー */}
              <div style={{marginBottom:36,animation:"fadeInUp 0.6s ease 0.3s both"}}>
                {/* トップ行: ハンバーガー + タイトル + ベル */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {/* ② ハンバーガーボタン（モバイルのみ） */}
                    {isMobile && (
                      <button onClick={()=>setSidebarOpen(true)} style={{
                        width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.6)",
                        border:`1px solid ${C.borderSoft}`,cursor:"pointer",display:"flex",
                        alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,
                        backdropFilter:"blur(8px)",transition:"all 0.2s",
                      }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.9)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.6)"}>☰</button>
                    )}
                    <div style={{fontSize:10,fontWeight:400,color:C.rose,letterSpacing:"0.25em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>PORTAMENT</div>
                    <span style={{fontSize:9,color:C.lavender,letterSpacing:"0.1em",fontFamily:"'Jost',sans-serif",background:C.lavLight,padding:"2px 8px",borderRadius:10,fontWeight:500}}>{SEASON.label}</span>
                  </div>
                  {/* ④ 通知ベル */}
                  <NotificationBell notifications={notifications} onMarkAllRead={markAllRead}/>
                </div>
                <h1 style={{margin:0,fontSize:isMobile?28:36,fontFamily:"'Cormorant Garamond',serif",fontWeight:400,fontStyle:"italic",color:C.text,lineHeight:1.3}}>
                  <span style={{color:C.rose}}>{getGreeting()}</span>
                  {firstName && <span style={{color:C.textSoft}}>、{firstName}さん</span>}
                </h1>
                <Ornament width={100} style={{margin:"14px 0",justifyContent:"flex-start"}}/>
                {/* ④ NaviCrew Bot ボタン */}
                <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
                  <button onClick={() => setShowNaviBot(true)} style={{
                    display:"inline-flex",alignItems:"center",gap:8,
                    padding:"9px 20px",borderRadius:20,
                    background:`linear-gradient(135deg,rgba(201,114,138,0.1),rgba(184,169,201,0.1))`,
                    border:`1px solid ${C.rose}30`,
                    color:C.rose,cursor:"pointer",
                    fontSize:12,fontWeight:500,fontFamily:"'Noto Sans JP',sans-serif",
                    letterSpacing:"0.04em",
                    backdropFilter:"blur(8px)",
                    transition:"all 0.25s",
                    boxShadow:`0 2px 12px ${C.rose}10`,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`linear-gradient(135deg,rgba(201,114,138,0.18),rgba(184,169,201,0.15))`;e.currentTarget.style.boxShadow=`0 4px 18px ${C.rose}20`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,rgba(201,114,138,0.1),rgba(184,169,201,0.1))`;e.currentTarget.style.boxShadow=`0 2px 12px ${C.rose}10`;}}
                  >
                    <span style={{fontSize:15}}>🧚</span>
                    NaviCrewに質問する
                  </button>
                  {crewName==="SV" && naviKnowledge.filter(k=>k.status==="escalated").length>0 && (
                    <button onClick={() => setShowNaviAdmin(true)} style={{
                      display:"inline-flex",alignItems:"center",gap:6,
                      padding:"9px 16px",borderRadius:20,
                      background:`linear-gradient(135deg,rgba(220,38,38,0.08),rgba(220,38,38,0.04))`,
                      border:"1px solid #fecaca",
                      color:"#dc2626",cursor:"pointer",
                      fontSize:11,fontWeight:600,fontFamily:"'Noto Sans JP',sans-serif",
                      animation:"pulse 2s infinite",
                    }}>
                      🚨 {naviKnowledge.filter(k=>k.status==="escalated").length}件 要回答
                    </button>
                  )}
                </div>
                {/* 週替わり手書きメッセージカード */}
                <LetterCard/>
                {/* 気分スタンプ */}
                <MoodStampCard crewName={crewName}/>
                {/* ② 今週の加藤 */}
                <KatoLogCard katoLog={katoLog}/>
                {/* 入社○日目カウンター + 日付 */}
                <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                  <p style={{margin:"0",fontSize:13,color:C.textSoft,letterSpacing:"0.05em",fontWeight:300}}>
                    {new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'})} &#x2726; {stats.total} clients
                  </p>
                  {crewName && crewStartDates[crewName] && (() => {
                    const days = Math.floor((new Date() - new Date(crewStartDates[crewName])) / (1000*60*60*24));
                    return days > 0 ? (
                      <span style={{
                        fontSize:11,fontFamily:"'Jost',sans-serif",fontWeight:400,
                        color:C.rose,background:C.roseLight,
                        padding:"3px 12px",borderRadius:20,
                        border:`1px solid ${C.rose}25`,
                        letterSpacing:"0.04em",
                      }}>
                        🌸 NewCrewsに参加して <strong>{days}</strong> 日
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* クイックリンク */}
              <QuickLinksCard links={quickLinks} isMobile={isMobile}/>
              {/* ⑤ 日替わりクイズ */}
              <DailyQuizCard quizStats={quizStats} setQuizStats={setQuizStats}/>

              {/* ③⑤ あなたの担当クライアント */}
              {myClients.length > 0 && (
                <div style={{marginBottom:28,animation:"fadeInUp 0.6s ease 0.42s both"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{width:3,height:16,borderRadius:2,background:`linear-gradient(180deg,${C.rose},${C.lavender})`}}/>
                    <span style={{fontSize:10,fontWeight:600,color:C.rose,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>My Clients</span>
                    <span style={{fontSize:9,color:C.textFaint,fontFamily:"'Jost',sans-serif",fontWeight:300}}>— あなたの担当</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                    {myClients.map((c,i) => {
                      const cfg = STATUS_CFG[c.status]||STATUS_CFG["進行中"];
                      return (
                        <div key={c.id} onClick={()=>{setSelected(c);setActiveTab("detail");}}
                          style={{
                            background:`linear-gradient(135deg,${C.roseLight},rgba(255,255,255,0.9))`,
                            border:`1.5px solid ${C.rose}30`,borderRadius:14,padding:"14px 16px",cursor:"pointer",
                            transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
                            boxShadow:`0 4px 16px ${C.rose}10`,
                            animation:`fadeInUp 0.3s ease ${0.42+i*0.06}s both`,
                          }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.rose}60`;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 10px 28px ${C.rose}18`;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=`${C.rose}30`;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 4px 16px ${C.rose}10`;}}
                        >
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                            <span style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.3}}>{c.name}</span>
                            <span style={{width:7,height:7,borderRadius:"50%",background:cfg.color,flexShrink:0,marginTop:3,boxShadow:`0 0 8px ${cfg.color}40`}}/>
                          </div>
                          <Badge label={c.status} cfg={STATUS_CFG} small/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ステータスカード */}
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:14,marginBottom:32,animation:"fadeInUp 0.6s ease 0.45s both"}}>
                {[
                  {l:"進行中",v:stats.active,c:C.sage,icon:"&#x25CF;",grad:`linear-gradient(135deg,${C.sageLight},#fff)`},
                  {l:"要対応",v:stats.alert,c:C.amber,icon:"&#x25B2;",grad:`linear-gradient(135deg,${C.amberLight},#fff)`},
                  {l:"停滞",v:stats.stalled,c:C.coral,icon:"&#x25A0;",grad:`linear-gradient(135deg,${C.coralLight},#fff)`},
                  {l:"合計",v:stats.total,c:C.rose,icon:"&#x2726;",grad:`linear-gradient(135deg,${C.roseLight},#fff)`},
                ].map(s=>(
                  <div key={s.l} style={{
                    background:s.grad,
                    backdropFilter:"blur(8px)",
                    borderRadius:18,padding:"22px 20px",
                    border:`1px solid ${C.borderSoft}`,
                    boxShadow:"0 2px 12px rgba(61,51,48,0.03)",
                    transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 32px ${s.c}15`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(61,51,48,0.03)";}}
                  >
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                      <span style={{color:s.c,fontSize:10}} dangerouslySetInnerHTML={{__html:s.icon}}/>
                      <span style={{fontSize:10,color:C.textSoft,letterSpacing:"0.1em",fontWeight:500,textTransform:"uppercase"}}>{s.l}</span>
                    </div>
                    <div style={{fontSize:38,fontWeight:500,color:s.c,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* 要対応リスト */}
              {clientsState.filter(c=>c.status==="要対応"||c.status==="停滞").length > 0 && (
                <div style={{marginBottom:28,animation:"fadeInUp 0.6s ease 0.6s both"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div style={{width:3,height:16,borderRadius:2,background:`linear-gradient(180deg,${C.amber},${C.coral})`}}/>
                    <span style={{fontSize:10,fontWeight:600,color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>Attention Required</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {clientsState.filter(c=>c.status==="要対応"||c.status==="停滞").map((c,i)=>{
                      const d = detailsState[c.id]||CLIENT_DETAILS_DEFAULT();
                      const cfg = STATUS_CFG[c.status];
                      return (
                        <div key={c.id} onClick={()=>{setSelected(c);setActiveTab("detail");}}
                          style={{
                            background:"rgba(255,255,255,0.65)",backdropFilter:"blur(8px)",
                            border:`1px solid ${C.borderSoft}`,borderRadius:14,padding:"16px 20px",cursor:"pointer",
                            display:"flex",alignItems:"center",justifyContent:"space-between",
                            transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
                            boxShadow:"0 2px 8px rgba(61,51,48,0.03)",
                            animation:`fadeInUp 0.4s ease ${0.65+i*0.08}s both`,
                          }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=`${cfg.color}50`;e.currentTarget.style.transform="translateX(4px)";e.currentTarget.style.boxShadow=`0 4px 16px ${cfg.color}10`;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.borderSoft;e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(61,51,48,0.03)";}}
                        >
                          <div style={{display:"flex",alignItems:"center",gap:16}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:cfg.color,flexShrink:0,boxShadow:`0 0 8px ${cfg.color}30`}}/>
                            <div>
                              <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{c.name}</div>
                              <div style={{fontSize:10,color:C.textFaint,fontWeight:300}}>{c.crew[0]}{c.crew.length>1?` +${c.crew.length-1}`:""}</div>
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            {d.concerns && d.concerns!=="特になし" && <span style={{fontSize:10,color:C.amber,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:400}}>{d.concerns}</span>}
                            <Badge label={c.status} cfg={STATUS_CFG} small/>
                            <span style={{fontSize:12,color:C.textFaint}}>&#x203A;</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 全クライアント一覧 */}
              <div style={{animation:"fadeInUp 0.6s ease 0.8s both"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:3,height:16,borderRadius:2,background:`linear-gradient(180deg,${C.rose},${C.roseSoft})`}}/>
                  <span style={{fontSize:10,fontWeight:600,color:C.rose,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>All Clients</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:10}}>
                  {clientsState.map((c,i)=>{
                    const cfg = STATUS_CFG[c.status]||STATUS_CFG["進行中"];
                    return (
                      <div key={c.id} onClick={()=>{setSelected(c);setActiveTab("detail");}}
                        style={{
                          background:"rgba(255,255,255,0.55)",backdropFilter:"blur(8px)",
                          border:`1px solid ${C.borderSoft}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",
                          transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
                          boxShadow:"0 1px 6px rgba(61,51,48,0.02)",
                          animation:`fadeInUp 0.3s ease ${0.85+i*0.02}s both`,
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.rose}40`;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(201,114,138,0.08)";e.currentTarget.style.background="rgba(255,255,255,0.8)";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.borderSoft;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 1px 6px rgba(61,51,48,0.02)";e.currentTarget.style.background="rgba(255,255,255,0.55)";}}
                      >
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <span style={{fontSize:12,fontWeight:500,color:C.text}}>{c.name}</span>
                          <span style={{width:6,height:6,borderRadius:"50%",background:cfg.color,flexShrink:0,boxShadow:`0 0 6px ${cfg.color}25`}}/>
                        </div>
                        <div style={{fontSize:10,color:C.textFaint,fontWeight:300}}>{c.crew[0]}{c.crew.length>1?` +${c.crew.length-1}`:""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===== ③④ ナレッジ共有フィード ===== */}
              <div style={{marginTop:32,animation:"fadeInUp 0.6s ease 1s both"}}>
                {/* ヘッダー＋タブフィルター */}
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:3,height:16,borderRadius:2,background:`linear-gradient(180deg,${C.lavender},${C.sky})`}}/>
                      <span style={{fontSize:10,fontWeight:600,color:C.lavender,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>Team Knowledge</span>
                      <span style={{fontSize:8,color:C.textFaint,fontFamily:"'Jost',sans-serif",fontWeight:300,letterSpacing:"0.06em"}}>— 自動化ネタ・アップセル情報</span>
                    </div>
                    <button onClick={()=>setShowFeedForm(!showFeedForm)} style={{
                      background:showFeedForm?"none":`linear-gradient(135deg,${C.lavender},${C.sky})`,
                      border:showFeedForm?`1px solid ${C.border}`:"none",
                      borderRadius:10,color:showFeedForm?C.textMid:"#fff",
                      padding:"6px 14px",cursor:"pointer",fontSize:10,fontWeight:500,
                      fontFamily:"'Jost',sans-serif",transition:"all 0.25s",
                    }}>
                      {showFeedForm?"キャンセル":"+ 共有する"}
                    </button>
                  </div>
                  {/* タブフィルター */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {[
                      {key:"all",    label:"すべて"},
                      {key:"automation", label:"⚙️ 自動化"},
                      {key:"upsell",     label:"📈 アップセル"},
                      {key:"insight",    label:"💡 インサイト"},
                    ].map(tab=>(
                      <button key={tab.key} onClick={()=>setFeedFilter(tab.key)} style={{
                        padding:"4px 14px",borderRadius:20,fontSize:10,cursor:"pointer",fontWeight:500,
                        fontFamily:"'Jost',sans-serif",transition:"all 0.2s",
                        background: feedFilter===tab.key ? C.lavender : "transparent",
                        color: feedFilter===tab.key ? "#fff" : C.textSoft,
                        border: feedFilter===tab.key ? `1px solid ${C.lavender}` : `1px solid ${C.border}`,
                      }}>{tab.label}</button>
                    ))}
                  </div>
                </div>

                {/* 投稿フォーム */}
                {showFeedForm && (
                  <div style={{
                    background:"rgba(255,255,255,0.7)",backdropFilter:"blur(10px)",
                    border:`1px solid ${C.borderSoft}`,borderRadius:16,padding:"20px 22px",marginBottom:14,
                    animation:"scaleIn 0.3s ease both",
                  }}>
                    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                      {Object.entries(FEED_TYPE_CFG).map(([key, cfg]) => (
                        <button key={key} onClick={()=>setNewFeedPost({...newFeedPost, type:key})} style={{
                          padding:"4px 12px",borderRadius:10,fontSize:10,cursor:"pointer",fontWeight:500,
                          background:newFeedPost.type===key?cfg.bg:"transparent",
                          border:`1px solid ${newFeedPost.type===key?cfg.color+"40":C.border}`,
                          color:newFeedPost.type===key?cfg.color:C.textSoft,
                          fontFamily:"'Jost',sans-serif",transition:"all 0.2s",
                        }}>{cfg.label}</button>
                      ))}
                    </div>
                    {/* 自動化ステータス選択（automation選択時のみ） */}
                    {newFeedPost.type==="automation" && (
                      <div style={{display:"flex",gap:6,marginBottom:10}}>
                        {Object.entries(AUTO_STATUS_CFG).map(([key,cfg])=>(
                          <button key={key} onClick={()=>setNewFeedPost({...newFeedPost,autoStatus:key})} style={{
                            padding:"3px 10px",borderRadius:8,fontSize:10,cursor:"pointer",fontWeight:500,
                            fontFamily:"'Jost',sans-serif",transition:"all 0.2s",
                            background:newFeedPost.autoStatus===key?cfg.bg:"transparent",
                            border:`1px solid ${newFeedPost.autoStatus===key?cfg.color+"50":C.border}`,
                            color:newFeedPost.autoStatus===key?cfg.color:C.textSoft,
                          }}>{key}</button>
                        ))}
                      </div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <input value={newFeedPost.client} onChange={e=>setNewFeedPost({...newFeedPost,client:e.target.value})} placeholder="関連クライアント" style={inS}/>
                      <input value={newFeedPost.tags} onChange={e=>setNewFeedPost({...newFeedPost,tags:e.target.value})} placeholder="タグ（カンマ区切り）" style={inS}/>
                    </div>
                    <input value={newFeedPost.title} onChange={e=>setNewFeedPost({...newFeedPost,title:e.target.value})} placeholder="タイトル" style={{...inS,marginBottom:8,fontWeight:500}}/>
                    <textarea value={newFeedPost.body} onChange={e=>setNewFeedPost({...newFeedPost,body:e.target.value})} placeholder="内容を入力..." style={{...taS,marginBottom:10}} rows={3}/>
                    <button onClick={()=>{
                      if(!newFeedPost.title.trim()||!newFeedPost.body.trim()) return;
                      setSharedFeed(prev=>[{
                        id:Date.now(), author:crewName||"Anonymous",
                        date:new Date().toISOString().slice(0,10),
                        type:newFeedPost.type, client:newFeedPost.client, title:newFeedPost.title,
                        body:newFeedPost.body, tags:newFeedPost.tags.split(",").map(t=>t.trim()).filter(Boolean),
                        autoStatus:newFeedPost.type==="automation"?newFeedPost.autoStatus:undefined,
                      },...prev]);
                      setNewFeedPost({type:"upsell",client:"",title:"",body:"",tags:"",autoStatus:"🔥 構築中"});
                      setShowFeedForm(false);
                    }} style={{
                      background:`linear-gradient(135deg,${C.lavender},${C.sky})`,
                      border:"none",borderRadius:10,color:"#fff",padding:"10px 24px",
                      cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Jost',sans-serif",
                      boxShadow:`0 4px 14px ${C.lavender}30`,
                    }}>投稿する</button>
                  </div>
                )}

                {/* フィード一覧 */}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {sharedFeed.filter(p=>feedFilter==="all"||p.type===feedFilter).map((post,i) => {
                    const typeCfg = FEED_TYPE_CFG[post.type] || FEED_TYPE_CFG.insight;
                    const autoStCfg = post.autoStatus ? (AUTO_STATUS_CFG[post.autoStatus]||null) : null;
                    return (
                      <div key={post.id} style={{
                        background: post.type==="automation" ? `linear-gradient(135deg,${typeCfg.bg},rgba(255,255,255,0.8))` : "rgba(255,255,255,0.6)",
                        backdropFilter:"blur(8px)",
                        border:`1px solid ${typeCfg.color}22`,
                        borderRadius:14,padding:"18px 20px",
                        transition:"all 0.25s",
                        animation:`fadeInUp 0.3s ease ${i*0.05}s both`,
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${typeCfg.color}44`;e.currentTarget.style.boxShadow=`0 6px 20px ${typeCfg.color}12`;e.currentTarget.style.transform="translateY(-1px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=`${typeCfg.color}22`;e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}
                      >
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{
                              background:typeCfg.bg,border:`1px solid ${typeCfg.color}30`,
                              borderRadius:8,padding:"3px 8px",fontSize:9,fontWeight:600,
                              color:typeCfg.color,fontFamily:"'Jost',sans-serif",
                            }}>
                              {typeCfg.label}
                            </span>
                            {/* 自動化ステータスバッジ */}
                            {autoStCfg && (
                              <span style={{fontSize:9,fontWeight:600,padding:"3px 8px",borderRadius:8,
                                color:autoStCfg.color,background:autoStCfg.bg,
                                fontFamily:"'Jost',sans-serif",border:`1px solid ${autoStCfg.color}30`,
                              }}>{post.autoStatus}</span>
                            )}
                            {post.client && <span style={{fontSize:10,color:C.textSoft,fontWeight:400}}>{post.client}</span>}
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:10,color:C.textFaint,fontFamily:"'Jost',sans-serif"}}>{post.date}</span>
                            <span style={{fontSize:10,color:C.textSoft,fontWeight:500}}>{post.author}</span>
                          </div>
                        </div>
                        <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:6}}>{post.title}</div>
                        <div style={{fontSize:12,color:C.textMid,lineHeight:1.8,marginBottom:8}}>{post.body}</div>
                        {post.tags?.length > 0 && (
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {post.tags.map((tag,ti) => (
                              <span key={ti} style={{fontSize:9,color:C.textSoft,background:C.bgSub,border:`1px solid ${C.borderSoft}`,borderRadius:8,padding:"2px 8px",fontFamily:"'Jost',sans-serif"}}>#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===== クライアント詳細モード ===== */}
        {selected && <>

        {/* トップバー */}
        <div style={{
          padding:"16px 28px 14px",
          borderBottom:`1px solid ${C.borderSoft}`,
          background:"rgba(255,255,255,0.6)",
          backdropFilter:"blur(16px)",
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,
          gap:16,minHeight:0,
          animation:"fadeInUp 0.4s ease both",
        }}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <button onClick={()=>{setSelected(null);setEditMode(false);}} style={{
                background:"rgba(255,255,255,0.5)",border:`1px solid ${C.borderSoft}`,
                borderRadius:8,color:C.textMid,cursor:"pointer",fontSize:14,padding:"4px 8px",
                transition:"all 0.2s",flexShrink:0,
              }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.rose;e.currentTarget.style.color=C.rose;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.borderSoft;e.currentTarget.style.color=C.textMid;}}>&#x2190;</button>
              <h1 style={{margin:0,fontSize:22,fontWeight:400,fontStyle:"italic",color:C.text,fontFamily:"'Cormorant Garamond',serif",whiteSpace:"nowrap"}}>{selected.name}</h1>
              <Badge label={selected.status} cfg={STATUS_CFG}/>
            </div>
            <div style={{display:"flex",gap:14,fontSize:11,color:C.textSoft,alignItems:"center",marginLeft:38,fontWeight:300,flexWrap:"wrap"}}>
              <span>担当 {selected.crew.join("、")}</span>
              {detail.lastMtgDate && <span>最終MTG {detail.lastMtgDate}</span>}
              {detail.slackChannel && <span style={{fontFamily:"'Jost',sans-serif",fontSize:10,background:"rgba(255,255,255,0.5)",padding:"2px 8px",borderRadius:6,color:C.textMid,border:`1px solid ${C.borderSoft}`}}>{detail.slackChannel}</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button onClick={()=>setShowTldv(true)} style={btnOutline(C.textMid)}>tldv</button>
            <button onClick={()=>setShowReport(true)} style={btnOutline(C.amber)}>レポート</button>
            <button onClick={()=>setShowProposal(true)} style={btnOutline(C.sky)}>提案書</button>
            {!editMode
              ? <button onClick={startEdit} style={btnFill(C.rose,C.roseSoft)}>編集</button>
              : <>
                  <button onClick={()=>setEditMode(false)} style={btnOutline(C.textMid)}>キャンセル</button>
                  <button onClick={saveEdit} style={btnFill(C.sage,"#6d9073")}>保存</button>
                </>
            }
          </div>
        </div>

        {/* タブ */}
        <div style={{display:"flex",padding:"0 32px",background:"rgba(255,255,255,0.4)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.borderSoft}`,flexShrink:0}}>
          {[["detail","案件詳細"],["automation","自動化"],["knowledge","ナレッジ"]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{
              padding:"13px 20px",background:"none",border:"none",
              borderBottom:`2px solid ${activeTab===id?C.rose:"transparent"}`,
              color:activeTab===id?C.rose:C.textSoft,
              cursor:"pointer",fontSize:11,fontWeight:activeTab===id?600:400,
              letterSpacing:"0.06em",transition:"all 0.25s",
              fontFamily:"'Jost',sans-serif",
            }}>{label}</button>
          ))}
        </div>

        {/* コンテンツ */}
        <div style={{flex:1,overflowY:"auto",padding:26,animation:"fadeInUp 0.4s ease 0.1s both"}}>

          {/* 案件詳細タブ */}
          {activeTab==="detail" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,maxWidth:1000}}>
              <SCard title="業務概要">
                {editMode
                  ? <textarea value={editDetail.mtgSummary||""} onChange={e=>setEditDetail({...editDetail,mtgSummary:e.target.value})} style={taS} rows={4}/>
                  : <p style={txS}>{detail.mtgSummary||"—"}</p>
                }
              </SCard>

              <SCard title="直近 MTG" badge={detail.lastMtgDate}>
                {editMode
                  ? <>
                      <input type="date" value={editDetail.lastMtgDate||""} onChange={e=>setEditDetail({...editDetail,lastMtgDate:e.target.value})} style={{...inS,marginBottom:12}}/>
                      <textarea value={editDetail.mtgSummary||""} onChange={e=>setEditDetail({...editDetail,mtgSummary:e.target.value})} style={taS} rows={2}/>
                    </>
                  : <p style={txS}>{detail.lastMtgDate?`${detail.lastMtgDate} 実施`:"未設定"}</p>
                }
              </SCard>

              <SCard title="ネクストアクション" fullWidth>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {(detail.nextActions||[]).map((a,i)=>(
                    <div key={i} style={{
                      display:"flex",alignItems:"center",gap:12,
                      background:"rgba(255,255,255,0.5)",backdropFilter:"blur(4px)",
                      borderRadius:10,padding:"11px 14px",
                      border:`1px solid ${C.borderSoft}`,
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.rose}30`}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderSoft}
                    >
                      <span style={{
                        width:22,height:22,borderRadius:6,
                        background:`linear-gradient(135deg,${C.roseLight},${C.lavLight})`,
                        border:`1px solid ${C.rose}20`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,color:C.rose,flexShrink:0,fontWeight:600,
                        fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"
                      }}>{i+1}</span>
                      <span style={{flex:1,fontSize:13,color:C.text}}>{a}</span>
                      <button onClick={()=>removeAction(i)} style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",fontSize:13,padding:"0 4px",transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color=C.coral} onMouseLeave={e=>e.target.style.color=C.textFaint}>&#x2715;</button>
                    </div>
                  ))}
                  {(detail.nextActions||[]).length===0 && <div style={{color:C.textFaint,fontSize:12,padding:"10px 0",fontWeight:300}}>アクションはありません</div>}
                  <div style={{display:"flex",gap:8,marginTop:6}}>
                    <input value={newAction} onChange={e=>setNewAction(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAction()} placeholder="新しいアクションを追加..." style={{...inS,flex:1}}/>
                    <button onClick={addAction} style={btnFill(C.rose,C.roseSoft)}>追加</button>
                  </div>
                </div>
              </SCard>

              <SCard title="懸念事項・メモ">
                {editMode
                  ? <textarea value={editDetail.concerns||""} onChange={e=>setEditDetail({...editDetail,concerns:e.target.value})} style={taS} rows={3}/>
                  : <p style={{...txS,color:(detail.concerns||"").includes("なし")||(detail.concerns||"")===""?C.textFaint:C.amber}}>{detail.concerns||"特になし"}</p>
                }
              </SCard>

              <SCard title="🐣 Slack通知チャンネル">
                {editMode
                  ? <input value={editDetail.slackChannel||""} onChange={e=>setEditDetail({...editDetail,slackChannel:e.target.value})} style={inS} placeholder="例: #proj-ytj"/>
                  : <p style={{...txS, fontFamily:"'Jost',sans-serif", fontSize:12}}>
                      {detail.slackChannel
                        ? <span style={{background:"rgba(255,255,255,0.6)",border:`1px solid ${C.borderSoft}`,borderRadius:8,padding:"4px 12px",color:C.textMid}}>{detail.slackChannel}</span>
                        : <span style={{color:C.textFaint}}>未設定（編集モードで追加できます）</span>
                      }
                    </p>
                }
              </SCard>

              <SCard title="📨 顧客連絡手段">
                {editMode ? (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <select value={editDetail.contactMethod||""} onChange={e=>setEditDetail({...editDetail,contactMethod:e.target.value})} style={{...inS,maxWidth:200}}>
                      <option value="">選択してください</option>
                      <option value="Slack">Slack</option>
                      <option value="Chatwork">Chatwork</option>
                      <option value="LINE WORKS">LINE WORKS</option>
                      <option value="Teams">Teams</option>
                      <option value="LINE">LINE</option>
                      <option value="メール">メール</option>
                      <option value="その他">その他</option>
                    </select>
                    <input value={editDetail.contactAddress||""} onChange={e=>setEditDetail({...editDetail,contactAddress:e.target.value})} style={inS} placeholder="送信先ID・メアド・URLなど"/>
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {detail.contactMethod
                      ? <>
                          <span style={{background:`linear-gradient(135deg,${C.roseLight},${C.lavLight})`,border:`1px solid ${C.rose}20`,borderRadius:8,padding:"4px 12px",fontSize:12,color:C.text,fontWeight:500,display:"inline-block",width:"fit-content"}}>{detail.contactMethod}</span>
                          {detail.contactAddress && <span style={{fontSize:12,color:C.textMid,fontFamily:"'Jost',sans-serif"}}>{detail.contactAddress}</span>}
                        </>
                      : <span style={{color:C.textFaint,fontSize:12}}>未設定（編集モードで追加できます）</span>
                    }
                  </div>
                )}
              </SCard>

              <SCard title="担当 Crew">
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
                  {selected.crew.map((name,i)=>(
                    <span key={i} style={{
                      background:`linear-gradient(135deg,${C.roseLight},${C.lavLight})`,
                      border:`1px solid ${C.rose}20`,borderRadius:10,padding:"6px 14px",
                      fontSize:12,color:C.text,fontWeight:500,
                    }}>
                      {name}
                    </span>
                  ))}
                </div>
              </SCard>

              <SCard title="稼働報告書">
                {selected.sheetUrl
                  ? <a href={selected.sheetUrl} target="_blank" rel="noopener noreferrer" style={{color:C.sky,fontSize:12,textDecoration:"none",display:"flex",alignItems:"center",gap:8,fontWeight:500,transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=C.rose} onMouseLeave={e=>e.currentTarget.style.color=C.sky}>
                      <span>&#x1F4CA;</span><span>スプレッドシートを開く</span><span style={{fontSize:10}}>&#x2192;</span>
                    </a>
                  : <p style={{...txS,color:C.textFaint}}>スプレッドシートURL未設定</p>
                }
              </SCard>
            </div>
          )}

          {/* 自動化タブ */}
          {activeTab==="automation" && (
            <div style={{maxWidth:800,display:"flex",flexDirection:"column",gap:16}}>
              <SCard title="自動化ステータス" badge={<Badge label={detail.automationStatus||"未着手"} cfg={AUTO_CFG}/>}>
                {editMode && (
                  <select value={editDetail.automationStatus||"未着手"} onChange={e=>setEditDetail({...editDetail,automationStatus:e.target.value})} style={{...inS,marginBottom:14,maxWidth:200}}>
                    {["未着手","検証中","実装中","完了"].map(o=><option key={o}>{o}</option>)}
                  </select>
                )}
                <div style={{fontSize:10,color:C.textSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,fontWeight:500}}>自動化可能業務</div>
                {editMode
                  ? <textarea value={(editDetail.automatableTasks||[]).join("\n")} onChange={e=>setEditDetail({...editDetail,automatableTasks:e.target.value.split("\n").filter(Boolean)})} style={taS} rows={4} placeholder="1行1タスクで入力"/>
                  : (detail.automatableTasks||[]).length > 0
                    ? <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                        {(detail.automatableTasks||[]).map((t,i)=><span key={i} style={{background:`linear-gradient(135deg,${C.skyLight},#fff)`,border:`1px solid ${C.sky}25`,borderRadius:10,padding:"5px 12px",fontSize:11,color:C.textMid,fontWeight:400}}>{t}</span>)}
                      </div>
                    : <p style={{...txS,color:C.textFaint}}>未登録</p>
                }
              </SCard>

              <SCard title="業務フロー設計">
                {editMode
                  ? <textarea value={editDetail.workflowPlan||""} onChange={e=>setEditDetail({...editDetail,workflowPlan:e.target.value})} style={taS} rows={5} placeholder="例: tldv → 議事録解析 → ネクストアクション自動生成 → Slack通知"/>
                  : <p style={{...txS,fontSize:12,fontFamily:(detail.workflowPlan||"")!=="未設計"?"'Jost',monospace":"inherit",background:(detail.workflowPlan||"")!=="未設計"?"rgba(255,255,255,0.5)":"transparent",padding:(detail.workflowPlan||"")!=="未設計"?"14px 16px":"0",borderRadius:10,border:(detail.workflowPlan||"")!=="未設計"?`1px solid ${C.borderSoft}`:"none"}}>{detail.workflowPlan||"未設計"}</p>
                }
              </SCard>

              <div style={{display:"flex",gap:12}}>
                <button onClick={()=>setShowProposal(true)} style={{...btnFill(C.rose,C.roseSoft),flex:1,padding:"14px 0",fontSize:13,borderRadius:14}}>自動化提案書を生成する</button>
              </div>
            </div>
          )}

          {/* ナレッジタブ */}
          {activeTab==="knowledge" && (
            <div style={{maxWidth:800}}>
              <SCard title="クライアントナレッジ">
                <p style={{fontSize:12,color:C.textMid,marginTop:0,marginBottom:16,lineHeight:1.8,fontWeight:300}}>業務手順・担当者の特徴・過去のトラブル事例を記録します。Crew Botが参照して自動回答に活用します。</p>
                {editMode
                  ? <textarea value={editDetail.knowledge||""} onChange={e=>setEditDetail({...editDetail,knowledge:e.target.value})} style={{...taS,minHeight:280}} placeholder={`【業務手順】\n1. 毎月5日までに稼働報告書を提出\n...\n\n【担当者の特徴】\n...\n\n【過去のトラブル・対処法】\n...`}/>
                  : <div style={{color:C.text,fontSize:13,lineHeight:2,whiteSpace:"pre-wrap",minHeight:180,background:"rgba(255,255,255,0.5)",backdropFilter:"blur(4px)",borderRadius:12,padding:"16px 18px",border:`1px solid ${C.borderSoft}`}}>
                      {detail.knowledge||<span style={{color:C.textFaint,fontWeight:300}}>まだナレッジが登録されていません。「編集」から追加してください。</span>}
                    </div>
                }
              </SCard>
              {!editMode && (detail.tldvHistory||[]).length > 0 && (
                <div style={{marginTop:16}}>
                  <SCard title={`tldv 議事録履歴（${(detail.tldvHistory||[]).length}件）`}>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {(detail.tldvHistory||[]).map((h,i)=>(
                        <div key={i} style={{background:"rgba(255,255,255,0.5)",backdropFilter:"blur(4px)",borderRadius:10,padding:"12px 16px",border:`1px solid ${C.borderSoft}`}}>
                          <div style={{fontSize:10,color:C.textFaint,marginBottom:5,fontFamily:"'Jost',sans-serif",fontWeight:300}}>{h.date}</div>
                          <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{h.summary}</div>
                        </div>
                      ))}
                    </div>
                  </SCard>
                </div>
              )}
            </div>
          )}
        </div>
        </>}
      </div>

      {/* モーダル */}
      {showTldv    && <TldvModal    onClose={()=>setShowTldv(false)}    onParsed={(r)=>{handleTldvParsed(r);setShowTldv(false);}} clientName={selected?.name||""}/>}
      {selected && showReport  && <ReportModal  client={selected} detail={detail}   onClose={()=>setShowReport(false)}/>}
      {selected && showProposal&& <ProposalModal client={selected} detail={detail}  onClose={()=>setShowProposal(false)}/>}
      {/* ④ NaviCrew Bot */}
      {showNaviBot && <NaviCrewBotModal crewName={crewName} onClose={()=>setShowNaviBot(false)} knowledge={naviKnowledge} onAddHistory={entry=>setNaviKnowledge(h=>[entry,...h])}/>}
      {showNaviAdmin && <NaviCrewAdminModal onClose={()=>setShowNaviAdmin(false)} knowledge={naviKnowledge} onUpdateKnowledge={setNaviKnowledge}/>}
      {/* 新規営業モード */}
      {showSales && <SalesModal crewName={crewName} onClose={()=>setShowSales(false)} onSave={entry=>{setSalesHistory(h=>[entry,...h]);}}/>}
      {/* 商談履歴 */}
      {showSalesHistory && (
        <div style={{position:"fixed",inset:0,background:"rgba(61,51,48,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(12px)"}}>
          <div style={{background:"rgba(255,255,255,0.95)",borderRadius:24,width:"100%",maxWidth:680,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(61,51,48,0.12)"}}>
            <div style={{padding:"24px 28px 16px",borderBottom:`1px solid ${C.borderSoft}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,fontWeight:600,color:"#5b7fc4",letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>Sales Visit</div>
                <h3 style={{margin:"4px 0 0",fontSize:18,color:C.text,fontFamily:"'Cormorant Garamond',serif",fontWeight:500}}>商談履歴</h3>
              </div>
              <button onClick={()=>setShowSalesHistory(false)} style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:18,fontFamily:"serif"}}>✕</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"16px 28px"}}>
              {salesHistory.length === 0
                ? <div style={{color:C.textFaint,fontSize:13,textAlign:"center",padding:"40px 0"}}>商談履歴はまだありません</div>
                : salesHistory.map(h=>(
                  <div key={h.id} style={{border:`1px solid ${C.borderSoft}`,borderRadius:14,padding:16,marginBottom:12,background:C.bgCard}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:C.text}}>{h.company}</div>
                        <div style={{fontSize:11,color:C.textSoft,marginTop:2}}>{h.contact&&`${h.contact} ／ `}{h.date} ／ 担当: {h.crewName}</div>
                      </div>
                      <button onClick={()=>{
                        const name = h.company;
                        if(window.confirm(`「${name}」をクライアント一覧に登録しますか？`)){
                          setClientsState(prev=>[...prev,{id:String(Date.now()),name,crew:[h.crewName||""],status:"進行中",kpiStatus:"未確認",sheetUrl:""}]);
                          alert("クライアントを登録しました！");
                        }
                      }} style={{background:`linear-gradient(135deg,${C.rose},${C.coral})`,border:"none",borderRadius:8,color:"#fff",padding:"5px 10px",cursor:"pointer",fontSize:10,fontWeight:600,flexShrink:0}}>
                        ✅ クライアント登録
                      </button>
                    </div>
                    <div style={{fontSize:12,color:C.textMid,lineHeight:1.7}}>{h.summary}</div>
                    {h.nextActions?.length>0&&<div style={{marginTop:8,fontSize:11,color:C.textSoft}}>→ {h.nextActions.join(" ／ ")}</div>}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
      {/* ⑥ 加藤さん専用 Admin パネル */}
      {showAdmin && (
        <AdminPanel
          onClose={()=>setShowAdmin(false)}
          katoLog={katoLog} setKatoLog={setKatoLog}
          notifications={notifications} setNotifications={setNotifications}
          quickLinks={quickLinks} setQuickLinks={setQuickLinks}
          crewStartDates={crewStartDates} setCrewStartDates={setCrewStartDates}
        />
      )}
    </div>
  );
}
