import { useEffect, useMemo, useState } from "react";
import { Globe, Scan, Layers3, FileCode2, FileText, Figma, Download, ArrowUpRight, Monitor, Smartphone, Tablet, Plus, Search, Sparkles, FolderOpen, Settings2, Check, Loader2, ExternalLink, Code2, Trash2, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8787";
type Capture = {id:string;url:string;title:string;mode:string;status:string;createdAt:string; screenshot?:string; design?:any};
export default function App(){
 const [url,setUrl]=useState(""); const [mode,setMode]=useState<"full"|"selector">("full");
 const [viewport,setViewport]=useState<"desktop"|"tablet"|"mobile">("desktop");
 const [selector,setSelector]=useState(""); const [busy,setBusy]=useState(false);
 const [error,setError]=useState(""); const [captures,setCaptures]=useState<Capture[]>([]);
 const [active,setActive]=useState<Capture|null>(null); const [tab,setTab]=useState("overview");
 useEffect(()=>{fetch(`${API}/api/captures`).then(r=>r.ok?r.json():null).then(data=>{if(data?.captures){setCaptures(data.captures);if(data.captures[0])setActive(data.captures[0]);}}).catch(()=>{});},[]);

 const dimensions=useMemo(()=>({desktop:{width:1440,height:1000},tablet:{width:768,height:1024},mobile:{width:390,height:844}}[viewport]),[viewport]);
 async function capture(){
  setBusy(true);setError("");
  try{
   const res=await fetch(`${API}/api/capture`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,mode,selector:selector||undefined,viewport:dimensions})});
   const data=await res.json(); if(!res.ok) throw new Error(data.error||"Capture failed");
   const item:Capture={id:data.id||crypto.randomUUID(),url,title:data.title||new URL(url).hostname,mode,status:"Captured",createdAt:new Date().toLocaleString(),screenshot:data.screenshot,design:data.design};
   setCaptures(v=>[item,...v]);setActive(item);setTab("overview");
  }catch(e:any){setError(e.message||"Could not reach the capture API. Start the local API server first.");}
  finally{setBusy(false);}
 }
 async function exportFile(kind:string){
  if(!active)return;
  try{
   const res=await fetch(`${API}/api/export/${kind}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({capture:active.design,url:active.url})});
   if(!res.ok)throw new Error((await res.json()).error||"Export failed");
   if(kind==="pdf"){const blob=await res.blob();download(blob,`${slug(active.title)}.pdf`);}
   else if(kind==="json"){const blob=await res.blob();download(blob,`${slug(active.title)}-design.json`);}
   else {const blob=await res.blob();download(blob,`${slug(active.title)}-${kind}.zip`);}
  }catch(e:any){setError(e.message);}
 }
 function download(blob:Blob,name:string){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);}
 function slug(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"capture";}
 return <div className="app-shell">
  <aside className="sidebar">
   <div className="brand"><div className="brand-mark"><Layers3 size={19}/></div><div><b>SiteSculpt</b><span>DESIGN INTELLIGENCE</span></div></div>
   <div className="workspace-label">WORKSPACE</div>
   <button className="nav active"><FolderOpen size={17}/> Projects <span className="nav-count">1</span></button>
   <button className="nav"><Layers3 size={17}/> Components</button>
   <button className="nav"><Settings2 size={17}/> Settings</button>
   <div className="side-bottom"><div className="plan-card"><Sparkles size={16}/><b>Local MVP</b><p>Captures run on your machine. No AI usage.</p></div><div className="profile"><div className="avatar">W</div><div><b>Workspace</b><span>Personal project</span></div></div></div>
  </aside>
  <main className="main">
   <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>Website captures</b></div><div className="top-actions"><span className="status-dot"/> Local engine <button className="icon-btn"><Settings2 size={17}/></button></div></header>
   <div className="content">
    <section className="hero-row"><div><div className="eyebrow">WEBSITE → DESIGN WORKFLOW</div><h1>Extract any website.<br/><em>Make it yours.</em></h1><p className="subhead">Capture full pages or individual sections, inspect their design, and export production-ready references.</p></div><div className="hero-art"><div className="art-window"><div className="art-bar"><i/><i/><i/><span>example.com</span></div><div className="art-layout"><div className="art-nav"/><div className="art-hero"/><div className="art-grid"><i/><i/><i/></div></div><div className="scan-line"/></div><div className="float-tag"><Check size={13}/> Design captured</div></div></section>
    <section className="capture-card">
     <div className="section-heading"><div><span className="step">01</span><h2>Start with a URL</h2></div><span className="muted">Public websites you own or are authorized to inspect</span></div>
     <label className="field-label">WEBSITE ADDRESS</label><div className="url-input"><Globe size={18}/><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://yourwebsite.com"/>{url&&<button className="clear-btn" onClick={()=>setUrl("")}><X size={14}/></button>}</div>
     <div className="capture-options">
      <div className="option-group"><label className="field-label">CAPTURE MODE</label><div className="segmented"><button className={mode==="full"?"selected":""} onClick={()=>setMode("full")}><Monitor size={16}/> Entire page</button><button className={mode==="selector"?"selected":""} onClick={()=>setMode("selector")}><Scan size={16}/> CSS selector</button></div></div>
      <div className="option-group"><label className="field-label">VIEWPORT</label><div className="segmented viewport"><button className={viewport==="desktop"?"selected":""} onClick={()=>setViewport("desktop")}><Monitor size={15}/> Desktop</button><button className={viewport==="tablet"?"selected":""} onClick={()=>setViewport("tablet")}><Tablet size={15}/> Tablet</button><button className={viewport==="mobile"?"selected":""} onClick={()=>setViewport("mobile")}><Smartphone size={15}/> Mobile</button></div></div>
     </div>
     {mode==="selector"&&<div className="selector-box"><label className="field-label">CSS SELECTOR</label><input value={selector} onChange={e=>setSelector(e.target.value)} placeholder="e.g. main .hero, #product-grid, footer"/><small>Tip: use the Chrome extension to visually click a section on the live website.</small></div>}
     {error&&<div className="error">{error}</div>}
     <div className="capture-footer"><div className="capture-note"><span className="live-dot"/> Browser capture engine <span>·</span> AI disabled</div><button className="primary" disabled={busy||!url.trim()||(mode==="selector"&&!selector.trim())} onClick={capture}>{busy?<><Loader2 className="spin" size={17}/> Capturing…</>:<><Scan size={17}/> Extract design <ArrowUpRight size={16}/></>}</button></div>
    </section>
    <section className="workspace-grid">
     <div className="project-panel">
      <div className="panel-title"><div><span className="step">02</span><h2>Capture library</h2></div><div className="panel-actions"><span className="count">{captures.length} captures</span>{captures.length>0&&<button className="clear-all-btn" onClick={()=>{if(confirm(`Delete all ${captures.length} captures?`)){setCaptures([]);setActive(null);}}} title="Clear all captures"><Trash2 size={13}/></button>}</div></div>
      {captures.length===0?<div className="empty"><div className="empty-icon"><Globe size={23}/></div><b>Your captures will appear here</b><p>Start with a URL above. Your pages, sections and exports will be organized in this project.</p></div>:<div className="capture-list">{captures.map(c=><button className={`capture-row ${active?.id===c.id?"chosen":""}`} key={c.id} onClick={()=>{setActive(c);setTab("overview")}}><div className="capture-thumb"><FileCode2 size={20}/></div><div className="capture-meta"><b>{c.title}</b><span>{c.mode} · {c.createdAt}</span></div><span className="captured"><Check size={13}/> Ready</span></button>)}</div>}
     </div>
     <div className="export-panel">
      <div className="panel-title"><div><span className="step">03</span><h2>Export studio</h2></div></div>
      {!active?<div className="export-empty"><div className="export-icon"><Download size={22}/></div><b>Ready when you are</b><p>Select a capture to unlock its export formats.</p></div>:<><div className="selected-capture"><span className="selected-label">SELECTED CAPTURE</span><b>{active.title}</b><small>{active.url}</small></div><div className="export-list">
       {[{id:"html",name:"HTML + CSS",desc:"Page markup and styles",icon:FileCode2},{id:"pdf",name:"PDF document",desc:"Print-ready page capture",icon:FileText},{id:"json",name:"Design JSON",desc:"Structure, styles and tokens",icon:Code2},{id:"react",name:"React starter",desc:"Reusable component scaffold",icon:Code2}].map(x=><button className="export-item" key={x.id} onClick={()=>exportFile(x.id)}><x.icon size={18}/><span><b>{x.name}</b><small>{x.desc}</small></span><Download size={15}/></button>)}
       <div className="figma-note"><Figma size={18}/><div><b>Figma plugin export</b><small>Export design JSON, then import it using the WebExtract Figma plugin.</small></div><button onClick={()=>exportFile("json")}>Get JSON</button></div>
      </div></>}
     </div>
    </section>
    <footer>WEBEXTRACT MVP <span>·</span> Built for accurate visual capture, not source-code recovery <span>·</span><a href="https://playwright.dev/" target="_blank">Powered by Playwright <ExternalLink size={11}/></a></footer>
   </div>
  </main>
 </div>
}