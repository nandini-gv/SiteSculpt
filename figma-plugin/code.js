figma.showUI(__html__,{width:360,height:390});
figma.ui.onmessage=async(msg)=>{
 if(msg.type!=="IMPORT")return;
 await figma.loadFontAsync({family:"Inter",style:"Regular"});
 await figma.loadFontAsync({family:"Inter",style:"Bold"});
 const d=msg.data||{};const frame=figma.createFrame();frame.name=d.title||"WebExtract capture";frame.resize(1440,Math.max(600,Math.min(5000,Number(d.rootStyles?.height?.replace("px",""))||900)));frame.layoutMode="VERTICAL";frame.primaryAxisSizingMode="AUTO";frame.counterAxisSizingMode="FIXED";frame.itemSpacing=12;frame.paddingTop=24;frame.paddingBottom=24;frame.paddingLeft=24;frame.paddingRight=24;frame.fills=[{type:"SOLID",color:{r:1,g:1,b:1}}];
 const addText=(value,size=14,weight="Regular")=>{const t=figma.createText();t.characters=String(value).slice(0,3000);t.fontSize=size;t.fontName={family:"Inter",style:weight};t.fills=[{type:"SOLID",color:{r:.12,g:.13,b:.14}}];t.textAutoResize="HEIGHT";t.resize(1360,Math.max(24,t.height));frame.appendChild(t);};
 if(d.title)addText(d.title,26,"Bold");
 if(d.url)addText(d.url,10,"Regular");
 if(d.text){const lines=String(d.text).split("\n").map(x=>x.trim()).filter(Boolean).slice(0,80);for(const line of lines)addText(line,14,"Regular");}
 const els=Array.isArray(d.elements)?d.elements.slice(0,100):[];
 for(const el of els){if(el.text){addText(el.text,Math.min(24,Math.max(11,parseInt(el.styles?.fontSize)||14)), "Regular");}}
 if(!d.text&&!els.length&&d.html)addText("HTML captured. Text/layout summary was not available in this import.",13);
 figma.currentPage.appendChild(frame);figma.viewport.scrollAndZoomIntoView([frame]);figma.ui.postMessage({type:"DONE",count:els.length+1});
};