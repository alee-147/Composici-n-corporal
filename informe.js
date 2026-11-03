/* antropometria — informe PDF (jsPDF, vectorial, A4) */
(function(){
const C={acc:[15,118,110],accL:[230,244,242],acc2:[20,184,166],ink:[23,32,42],mut:[91,102,115],line:[226,230,235],zebra:[247,249,250],warn:[180,83,9],ok:[21,128,61],bad:[185,28,28]};
const TIS={piel:[251,191,36],adip:[245,158,11],musc:[15,118,110],hueso:[148,163,184],resid:[94,234,212]};
const PW=210,PH=297,MX=15,CW=PW-2*MX,BOTTOM=280;

// jsPDF usa WinAnsi: reemplazamos símbolos fuera de ese juego
function T(s){return String(s??'').replace(/Σ/g,'S').replace(/−/g,'-').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/±/g,'+/-').replace(/π/g,'pi').replace(/²/g,'2').replace(/³/g,'3').replace(/∛/g,'').replace(/→/g,'->').replace(/[^\x00-\xFF–—•…‘’“”€]/g,'');}

function withState(rec,fn){const sv=S;S=rec;try{return fn()}finally{S=sv}}

/* ---------- Logo del profesional ---------- */
window.cargarLogo=function(file){
  if(!file)return;const r=new FileReader();
  r.onload=()=>{const img=new Image();img.onload=()=>{
    const k=Math.min(1,400/Math.max(img.width,img.height));const c=document.createElement('canvas');
    c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    const g=c.getContext('2d');g.drawImage(img,0,0,c.width,c.height);
    DB.prof.logo=c.toDataURL('image/png');DB.prof.logoW=c.width;DB.prof.logoH=c.height;persist();logoUI();
  };img.src=r.result};r.readAsDataURL(file);
};
window.quitarLogo=function(){delete DB.prof.logo;persist();logoUI()};
window.logoUI=function(){const i=document.getElementById('logoprev'),d=document.getElementById('logodel');if(!i)return;
  const L=DB.prof&&DB.prof.logo;i.style.display=L?'block':'none';d.style.display=L?'inline-block':'none';if(L)i.src=L;};

/* ---------- Generación ---------- */
window.pdfActual=function(){generar(JSON.parse(JSON.stringify(S)))};
window.pdfDe=function(id){const e=DB.evals.find(x=>x.id===id);if(e)generar(JSON.parse(JSON.stringify(e)))};

function generar(rec){
  if(!window.jspdf){toast('No se pudo cargar el generador de PDF. Revisa que jspdf.umd.min.js esté en el repositorio.');return}
  const R=withState(rec,calc),V=id=>withState(rec,()=>val(id));
  const doc=new jspdf.jsPDF({unit:'mm',format:'a4'});
  const P=DB.prof||{},d=rec.datos||{};
  let y=0;
  const font=(st,sz,col)=>{doc.setFont('helvetica',st);doc.setFontSize(sz);doc.setTextColor(...(col||C.ink))};
  const txt=(s,x,yy,o)=>doc.text(T(s),x,yy,o||{});
  const fill=c=>doc.setFillColor(...c),draw=c=>doc.setDrawColor(...c);
  const ensure=h=>{if(y+h>BOTTOM){doc.addPage();y=18;}};
  const sec=(t,need=0)=>{ensure(16+need);y+=4;font('bold',10.5,C.acc);txt(t.toUpperCase(),MX,y);draw(C.acc);doc.setLineWidth(0.5);doc.line(MX,y+1.8,MX+CW,y+1.8);y+=7;};
  const fecha=s=>{if(!s)return'';const [a,m,dd]=s.split('-');return `${dd}-${m}-${a}`};

  /* Encabezado */
  fill(C.acc);doc.rect(0,0,PW,34,'F');fill(C.acc2);doc.rect(0,34,PW,1.2,'F');
  let tx=MX;
  if(P.logo){const h=20,w=Math.min(40,h*(P.logoW||1)/(P.logoH||1));fill([255,255,255]);doc.roundedRect(MX,7,w+4,h+4,2,2,'F');
    try{doc.addImage(P.logo,'PNG',MX+2,9,w,h)}catch(e){};tx=MX+w+10;}
  font('bold',17,[255,255,255]);txt('Informe antropométrico',tx,15);
  font('normal',9.5,[220,245,241]);txt(`Protocolo ISAK  ·  Evaluación del ${fecha(d.fecha)||'-'}`,tx,22);
  font('bold',10,[255,255,255]);txt(P.nombre||'',PW-MX,13,{align:'right'});
  font('normal',8.5,[220,245,241]);
  [[P.titulo,P.isak?('ISAK '+P.isak.replace(/^ISAK\s*/i,'')):''].filter(Boolean).join(' · '),P.centro,P.contacto].filter(Boolean).forEach((l,i)=>txt(l,PW-MX,18.5+i*4.6,{align:'right'}));
  y=46;

  /* Datos del evaluado */
  font('bold',15);txt(d.nombre||'Evaluado',MX,y);
  if(d.deporte){font('normal',9.5,C.mut);txt(d.deporte,MX+CW,y,{align:'right'});}
  y+=6;
  const imc=R.imc;
  const info=[['Sexo',d.sexo==='F'?'Femenino':'Masculino'],['Edad',d.edad?d.edad+' años':'-'],['Masa corporal',V('masa')!=null?f(V('masa'),1)+' kg':'-'],['Talla',V('talla')!=null?f(V('talla'),1)+' cm':'-'],['IMC',imc!=null?f(imc,1)+' kg/m²':'-']];
  fill(C.zebra);doc.roundedRect(MX,y,CW,15,2,2,'F');
  const cw=CW/info.length;
  info.forEach(([l,v],i)=>{font('normal',7,C.mut);txt(l.toUpperCase(),MX+4+i*cw,y+5.5);font('bold',10.5);txt(v,MX+4+i*cw,y+11.5)});
  y+=21;

  /* Indicadores */
  sec('Indicadores principales');
  const kp=[
    ['Suma 6 pliegues',R.s6!=null?f(R.s6,1)+' mm':'-','Tríc, subesc, supraesp, abd, muslo, pant.'],
    ['Suma 8 pliegues',R.s8!=null?f(R.s8,1)+' mm':'-','Suma 6 + bíceps + cresta ilíaca'],
    ['% grasa',R.pgRef!=null?f(R.pgRef,1)+' %':'-',R.eqName?'Ecuación de '+R.eqName:''],
    ['Masa muscular esquelética',R.mmeLee!=null?f(R.mmeLee,1)+' kg':'-',R.mmePct!=null?f(R.mmePct,1)+' % de la masa (Lee 2000)':'Lee 2000'],
    ['Índice cintura / talla',R.ict!=null?f(R.ict,2):'-',R.ict!=null?(R.ict>=0.5?'>= 0,5: riesgo cardiometabólico':'< 0,5: bajo punto de corte'):''],
    ['Índice cintura / cadera',R.icc!=null?f(R.icc,2):'-',R.icc!=null?((d.sexo==='F'?R.icc>0.85:R.icc>0.90)?'Sobre punto de corte OMS':'Bajo punto de corte OMS'):'']];
  const kw=(CW-8)/3,kh=19;
  kp.forEach((k,i)=>{const cx=MX+(i%3)*(kw+4),cy=y+Math.floor(i/3)*(kh+4);
    fill(C.accL);doc.roundedRect(cx,cy,kw,kh,2,2,'F');fill(C.acc);doc.rect(cx,cy+3,0.9,kh-6,'F');
    font('normal',7.5,C.mut);txt(k[0],cx+4,cy+5.5);font('bold',14);txt(k[1],cx+4,cy+12.5);font('normal',6.8,C.mut);txt(k[2],cx+4,cy+16.8);});
  y+=2*(kh+4)+1;

  /* Somatotipo */
  sec('Somatotipo Heath-Carter',72);
  const y0=y;
  if(R.sx!=null){
    const comps=[['Endomorfia',R.endo,'adiposidad relativa'],['Mesomorfia',R.meso,'robustez músculo-esquelética'],['Ectomorfia',R.ecto,'linealidad relativa']];
    comps.forEach(([n,v,dsc],i)=>{const yy=y+i*12;font('normal',9,C.mut);txt(n,MX,yy+4);font('normal',7,C.mut);txt(dsc,MX,yy+8);
      font('bold',13);txt(f(v,1),MX+48,yy+6,{align:'right'});
      fill(C.zebra);doc.roundedRect(MX+52,yy+2.5,40,3.2,1.6,1.6,'F');fill(C.acc);doc.roundedRect(MX+52,yy+2.5,Math.max(1.5,Math.min(40,v/9*40)),3.2,1.6,1.6,'F');});
    y+=38;
    fill(C.accL);doc.roundedRect(MX,y,92,17,2,2,'F');
    font('bold',12,C.acc);txt(`${f(R.endo,1)} – ${f(R.meso,1)} – ${f(R.ecto,1)}`,MX+4,y+7);
    font('bold',9.5);txt(R.sclass,MX+4,y+13);
    font('normal',7.5,C.mut);txt(`X = ${f(R.sx,2)}   Y = ${f(R.sy,2)}`,MX+88,y+13,{align:'right'});
    somatocarta(doc,rec,R,MX+100,y0-2,80);
    y=Math.max(y+22,y0+72);
  } else {font('normal',9,C.mut);txt('Datos insuficientes para calcular el somatotipo.',MX,y+4);y+=10;}

  /* Composición corporal */
  sec('Composición corporal',20);
  const W=V('masa'),kg=p=>p!=null&&W?f(W*p/100,1):'-';
  const rows=[];
  if(R.pgDW!=null)rows.push(['% grasa — Durnin & Womersley (Siri)',f(R.pgDW,1)+' %',kg(R.pgDW),'Adultos 16–72 años',R.eqRef==='dw']);
  if(R.pgWi!=null)rows.push(['% grasa — Withers 1987 (Siri)',f(R.pgWi,1)+' %',kg(R.pgWi),'Hombres deportistas',R.eqRef==='wi']);
  if(R.pgSl!=null)rows.push(['% grasa — Slaughter 1988',f(R.pgSl,1)+' %',kg(R.pgSl),'8–18 años',R.eqRef==='sl']);
  if(R.mlgRef!=null)rows.push([`Masa libre de grasa (${R.eqName})`,'',f(R.mlgRef,1),'',false]);
  if(R.mmeLee!=null)rows.push(['Masa muscular esquelética — Lee 2000',f(R.mmePct,1)+' %',f(R.mmeLee,1),'Adultos; criterio RM',false]);
  if(rows.length)tabla(doc,()=>y,v=>y=v,['Método','%','kg','Aplicación'],[78,24,22,56],rows.map(r=>r.slice(0,4)),{align:['left','right','right','left'],hl:rows.map(r=>r[4])},ensure);
  else{font('normal',9,C.mut);txt('Datos insuficientes.',MX,y+4);y+=8;}
  if(R.eqName){font('italic',7.2,C.mut);ensure(6);txt('Fila destacada: ecuación de referencia según edad y sexo. Las ecuaciones de 2 componentes tienen un error típico de 3–5 puntos de % grasa.',MX,y+3.5);y+=7;}

  /* Kerr */
  if(R.kerr){
    sec('Fraccionamiento en 5 componentes (Kerr 1988)',48);
    const K=R.kerr,items=[['Piel','piel'],['Adiposo','adip'],['Muscular','musc'],['Óseo','hueso'],['Residual','resid']];
    ensure(40);
    let bx=MX;items.forEach(([n,k])=>{const w=K[k]/K.tot*CW;fill(TIS[k]);doc.rect(bx,y,w,7,'F');
      if(w>14){font('bold',7.5,k==='musc'?[255,255,255]:C.ink);txt(f(K[k]/K.tot*100,0)+'%',bx+w/2,y+4.8,{align:'center'})}bx+=w});
    y+=11;
    tabla(doc,()=>y,v=>y=v,['Tejido','kg (bruto)','% del total','kg ajustado'],[60,40,40,40],
      items.map(([n,k])=>[n,f(K[k],1),f(K[k]/K.tot*100,1)+' %',f(K[k]*K.k,1)]).concat([['Suma',f(K.tot,1),'',f(W,1)]]),
      {align:['left','right','right','right'],sw:items.map(i=>TIS[i[1]]),boldLast:true},ensure);
    ensure(8);font('normal',8,C.mut);
    txt(`Diferencia masa estimada vs real: ${f(K.dif,1)} % ${Math.abs(K.dif)<=5?'(aceptable, dentro de ±5 %)':'(fuera de ±5 %: interpretar con cautela)'}   ·   Índice músculo/óseo: ${f(K.imo,2)}`,MX,y+3.5);y+=8;
  }

  /* BIA */
  const B=rec.bia||{};const pgB=num(B.pg)??(num(B.mg)!=null&&W?num(B.mg)/W*100:null);
  if(pgB!=null||num(B.mm)!=null){
    sec('Comparación con bioimpedancia',20);
    const mg=num(B.mg)??(pgB!=null&&W?W*pgB/100:null),mm=num(B.mm);
    const dl=(a,b,u)=>a!=null&&b!=null?((b-a>0?'+':'')+f(b-a,1)+u):'-';
    const br=[[`% grasa (${R.eqName||'antropometría'})`,R.pgRef!=null?f(R.pgRef,1)+' %':'-',pgB!=null?f(pgB,1)+' %':'-',dl(R.pgRef,pgB,' %')],
      ['Masa grasa',R.mgRef!=null?f(R.mgRef,1)+' kg':'-',mg!=null?f(mg,1)+' kg':'-',dl(R.mgRef,mg,' kg')]];
    if(B.tipo==='mme')br.push(['Músculo esquelético',R.mmeLee!=null?f(R.mmeLee,1)+' kg':'-',mm!=null?f(mm,1)+' kg':'-',dl(R.mmeLee,mm,' kg')]);
    else if(B.tipo==='mlg')br.push(['Masa libre de grasa',R.mlgRef!=null?f(R.mlgRef,1)+' kg':'-',mm!=null?f(mm,1)+' kg':'-',dl(R.mlgRef,mm,' kg')]);
    else if(mm!=null)br.push(['Masa magra blanda (BIA)','no comparable',f(mm,1)+' kg','-']);
    if(num(B.af)!=null)br.push(['Ángulo de fase','',f(num(B.af),1)+'°','']);
    if(num(B.act)!=null)br.push(['Agua corporal total','',f(num(B.act),1)+' L','']);
    tabla(doc,()=>y,v=>y=v,['Variable','Antropometría','BIA','Diferencia (BIA − antropo)'],[62,38,34,46],br,{align:['left','right','right','right']},ensure);
  }

  /* Mediciones */
  sec('Mediciones (valor final ISAK)');
  const grp=[['Básicas','basic'],['Pliegues cutáneos (mm)','skin'],['Perímetros (cm)','girth'],['Diámetros (cm)','br']];
  const cols=[[],[]];
  grp.forEach(([t,g],gi)=>{const ms=M.filter(m=>m.g===g&&V(m.id)!=null);if(!ms.length)return;
    const col=gi<2?0:1;cols[col].push({t,ms})});
  const colW=(CW-8)/2;
  const hCol=c=>c.reduce((p,b)=>p+8+b.ms.length*5.2,0);
  ensure(Math.min(120,Math.max(hCol(cols[0]),hCol(cols[1]))));
  const ys=y;let yEnd=y;
  cols.forEach((c,ci)=>{let yy=ys;const x=MX+ci*(colW+8);
    c.forEach(b=>{if(yy+8>BOTTOM){doc.addPage();yy=18;}
      font('bold',8.5,C.acc);txt(b.t,x,yy+3);yy+=5.5;
      b.ms.forEach((m,i)=>{if(yy+5.2>BOTTOM){doc.addPage();yy=18;}
        if(i%2===0){fill(C.zebra);doc.rect(x,yy-0.2,colW,5.2,'F')}
        font('normal',8.3);txt(m.n,x+2,yy+3.5);font('bold',8.3);txt(f(V(m.id),1),x+colW-2,yy+3.5,{align:'right'});yy+=5.2});
      yy+=2.5;});
    yEnd=Math.max(yEnd,yy);});
  y=yEnd;

  /* Proporcionalidad */
  const prop=[];
  if(R.icormico!=null)prop.push(['Índice córmico',f(R.icormico,1)]);
  if(R.enverRel!=null)prop.push(['Envergadura relativa',f(R.enverRel,3)]);
  if(R.pcBrazo!=null)prop.push(['Perímetro corregido brazo',f(R.pcBrazo,1)+' cm']);
  if(R.pcMuslo!=null)prop.push(['Perímetro corregido muslo medio',f(R.pcMuslo,1)+' cm']);
  if(R.pcPan!=null)prop.push(['Perímetro corregido pantorrilla',f(R.pcPan,1)+' cm']);
  if(R.amb!=null)prop.push(['Área muscular del brazo',f(R.amb,1)+' cm²']);
  if(prop.length){sec('Proporcionalidad e índices');
    const half=Math.ceil(prop.length/2);ensure(half*5.4+2);
    prop.forEach((p,i)=>{const ci=i<half?0:1,ri=i<half?i:i-half,x=MX+ci*(colW+8),yy=y+ri*5.4;
      if(ri%2===0){fill(C.zebra);doc.rect(x,yy-0.2,colW,5.4,'F')}
      font('normal',8.3);txt(p[0],x+2,yy+3.6);font('bold',8.3);txt(p[1],x+colW-2,yy+3.6,{align:'right'})});
    y+=half*5.4+2;}

  /* Evolución */
  const nm=(d.nombre||'').trim().toLowerCase();
  const hist=DB.evals.filter(e=>(e.datos.nombre||'').trim().toLowerCase()===nm&&e.res).map(e=>e.id===rec.id?Object.assign({},e,{res:withState(rec,snapshot)}):e);
  if(rec.id==null||!hist.find(e=>e.id===rec.id))hist.push({datos:d,res:withState(rec,snapshot)});
  hist.sort((a,b)=>(a.datos.fecha||'').localeCompare(b.datos.fecha||''));
  if(hist.length>=2){
    sec('Evolución',50);
    const last=hist.slice(-8);
    ensure(48);
    const ch={x:MX,y:y,w:CW,h:34};
    serie(doc,ch,last.map(e=>({l:fecha(e.datos.fecha).slice(0,5)+'-'+(e.datos.fecha||'').slice(2,4),v:e.res.s6})),'Suma 6 pliegues (mm)');
    y+=ch.h+6;
    const pg=r=>r.pgRef??r.pgDW;
    const er=last.map(e=>{const r=e.res;return[fecha(e.datos.fecha),f(r.masa,1),f(r.s6,1),f(pg(r),1),f(r.mmeLee,1),f(r.cin,1)]});
    const a=hist[0].res,b=hist[hist.length-1].res,dl=(p,q,dd=1)=>p!=null&&q!=null?((q-p>0?'+':'')+f(q-p,dd)):'-';
    er.push(['Cambio total',dl(a.masa,b.masa),dl(a.s6,b.s6),dl(pg(a),pg(b)),dl(a.mmeLee,b.mmeLee),dl(a.cin,b.cin)]);
    tabla(doc,()=>y,v=>y=v,['Fecha','Masa (kg)','Suma 6 (mm)','% grasa','MME (kg)','Cintura (cm)'],[35,29,29,29,29,29],er,{align:['left','right','right','right','right','right'],boldLast:true},ensure);
  }

  /* Observaciones */
  if((d.notas||'').trim()){
    sec('Observaciones');
    font('normal',9);const lines=doc.splitTextToSize(T(d.notas),CW);
    lines.forEach(l=>{ensure(5);doc.text(l,MX,y+3.5);y+=4.6});y+=2;
  }

  /* Firma */
  ensure(26);y+=14;
  draw(C.mut);doc.setLineWidth(0.3);doc.line(PW-MX-70,y,PW-MX,y);
  font('bold',9);txt(P.nombre||'Evaluador',PW-MX-35,y+4.5,{align:'center'});
  font('normal',7.5,C.mut);txt([P.titulo,P.isak?'ISAK '+P.isak.replace(/^ISAK\s*/i,''):''].filter(Boolean).join(' · '),PW-MX-35,y+8.5,{align:'center'});
  font('italic',7,C.mut);
  doc.splitTextToSize(T('Métodos: protocolo ISAK; valor final = media de 2 o mediana de 3 tomas. Somatotipo Heath-Carter; % grasa por densidad (Siri); masa muscular esquelética según Lee et al. 2000; 5 componentes según Kerr 1988. Las estimaciones de composición corporal son predicciones poblacionales; para el seguimiento individual se recomienda comparar sumatorias de pliegues.'),CW-80).forEach((l,i)=>doc.text(l,MX,y-6+i*3.4));

  /* Pie de página */
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){doc.setPage(i);draw(C.line);doc.setLineWidth(0.3);doc.line(MX,287,PW-MX,287);
    font('normal',7,C.mut);txt(`${d.nombre||''}  ·  ${fecha(d.fecha)}  ·  Generado con antropometria`,MX,291.5);txt(`Página ${i} de ${n}`,PW-MX,291.5,{align:'right'});}

  const name=`Informe_${(d.nombre||'evaluado').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w-]+/g,'_')}_${d.fecha||''}.pdf`;
  try{const blob=doc.output('blob');const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
  catch(e){try{doc.save(name)}catch(_){window.open(doc.output('bloburl'))}}
}

/* ---------- Tabla genérica ---------- */
function tabla(doc,gy,sy,head,w,rows,o,ensure){
  o=o||{};const rh=6,al=o.align||[];
  const hdr=()=>{let y=gy();doc.setFillColor(...C.accL);doc.rect(MX,y,CW,rh,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(7.8);doc.setTextColor(...C.acc);
    let x=MX;head.forEach((h,i)=>{const r=al[i]==='right';doc.text(T(h),r?x+w[i]-2:x+2,y+4.1,{align:r?'right':'left'});x+=w[i]});sy(y+rh);};
  ensure(rh*2);hdr();
  rows.forEach((row,ri)=>{
    const last=o.boldLast&&ri===rows.length-1;
    if(gy()+rh>BOTTOM){doc.addPage();sy(18);hdr();}
    let y=gy();
    if(o.hl&&o.hl[ri]){doc.setFillColor(...C.accL);doc.rect(MX,y,CW,rh,'F');doc.setFillColor(...C.acc);doc.rect(MX,y,0.9,rh,'F');}
    else if(ri%2===1){doc.setFillColor(...C.zebra);doc.rect(MX,y,CW,rh,'F');}
    if(last){doc.setDrawColor(...C.line);doc.setLineWidth(0.3);doc.line(MX,y,MX+CW,y);}
    let x=MX;
    row.forEach((c,i)=>{const r=al[i]==='right';
      doc.setFont('helvetica',(last||(i===0&&o.hl&&o.hl[ri]))?'bold':'normal');doc.setFontSize(8.3);doc.setTextColor(...(i===3&&head.length===4&&!r?C.mut:C.ink));
      let xx=r?x+w[i]-2:x+2;
      if(i===0&&o.sw&&o.sw[ri]){doc.setFillColor(...o.sw[ri]);doc.roundedRect(x+2,y+1.6,2.8,2.8,0.6,0.6,'F');xx+=4.5;}
      let s=T(c);while(doc.getTextWidth(s)>w[i]-3&&s.length>3)s=s.slice(0,-2)+'…';
      doc.text(s,xx,y+4.1,{align:r?'right':'left'});x+=w[i]});
    sy(y+rh);});
  sy(gy()+2);
}

/* ---------- Somatocarta vectorial ---------- */
function somatocarta(doc,rec,R,bx,by,bw){
  const x0=-9,x1=9,y0=-10,y1=16,sx=bw/(x1-x0),sy=sx/Math.sqrt(3),bh=(y1-y0)*sy;
  const X=x=>bx+(x-x0)*sx,Y=y=>by+(y1-y)*sy;
  doc.setFillColor(...C.zebra);doc.roundedRect(bx,by,bw,bh,2,2,'F');
  doc.setDrawColor(...C.line);doc.setLineWidth(0.15);
  for(let x=-8;x<=8;x+=2)doc.line(X(x),by,X(x),by+bh);
  for(let y=-10;y<=16;y+=2)doc.line(bx,Y(y),bx+bw,Y(y));
  const vE=[-7,-7],vM=[0,14],vC=[7,-7];
  const curve=(a,b,c)=>{const pts=[];for(let t=0;t<=1.0001;t+=0.05){const u=1-t;pts.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}
    for(let i=1;i<pts.length;i++)doc.line(X(pts[i-1][0]),Y(pts[i-1][1]),X(pts[i][0]),Y(pts[i][1]));};
  doc.setDrawColor(...C.mut);doc.setLineWidth(0.35);
  curve(vE,vM,[-6.2,5.5]);curve(vM,vC,[6.2,5.5]);curve(vC,vE,[0,-10]);
  doc.setLineWidth(0.2);doc.setLineDashPattern([1,1],0);
  [vE,vM,vC].forEach(p=>doc.line(X(0),Y(0),X(p[0]),Y(p[1])));doc.setLineDashPattern([],0);
  doc.setFont('helvetica','bold');doc.setFontSize(6.5);doc.setTextColor(...C.mut);
  doc.text('ENDOMORFIA',X(-8.6),Y(-8.8));doc.text('MESOMORFIA',X(0),Y(15.2),{align:'center'});doc.text('ECTOMORFIA',X(8.6),Y(-8.8),{align:'right'});
  const nm=(rec.datos.nombre||'').trim().toLowerCase();
  const prev=DB.evals.filter(e=>e.id!==rec.id&&(e.datos.nombre||'').trim().toLowerCase()===nm&&e.res&&e.res.sx!=null)
    .sort((a,b)=>(a.datos.fecha||'').localeCompare(b.datos.fecha||''));
  doc.setFillColor(...C.mut);prev.forEach(e=>doc.circle(X(e.res.sx),Y(e.res.sy),1.1,'F'));
  doc.setFillColor(...C.acc);doc.setDrawColor(255,255,255);doc.setLineWidth(0.5);doc.circle(X(R.sx),Y(R.sy),1.9,'FD');
  if(prev.length){doc.setFont('helvetica','normal');doc.setFontSize(6.3);doc.setTextColor(...C.mut);
    doc.setFillColor(...C.acc);doc.circle(bx+3.5,by+4,1.2,'F');doc.text('Actual',bx+5.5,by+5);
    doc.setFillColor(...C.mut);doc.circle(bx+3.5,by+8,0.9,'F');doc.text('Previas',bx+5.5,by+9);}
}

/* ---------- Serie temporal ---------- */
function serie(doc,b,pts,titulo){
  const v=pts.map(p=>p.v).filter(x=>x!=null);if(v.length<2)return;
  let lo=Math.min(...v),hi=Math.max(...v);const pad=Math.max(2,(hi-lo)*0.2);lo-=pad;hi+=pad;
  const AX=b.x+12,L=b.x+20,Rr=b.x+b.w-10,Tp=b.y+10,Bt=b.y+b.h-6;
  const X=i=>pts.length===1?(L+Rr)/2:L+i*(Rr-L)/(pts.length-1),Y=x=>Bt-(x-lo)/(hi-lo)*(Bt-Tp);
  doc.setFillColor(...C.zebra);doc.roundedRect(b.x,b.y,b.w,b.h,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...C.mut);doc.text(T(titulo),b.x+3,b.y+4);
  doc.setDrawColor(...C.line);doc.setLineWidth(0.15);doc.setFont('helvetica','normal');doc.setFontSize(6.5);
  for(let k=0;k<=3;k++){const val=lo+k*(hi-lo)/3,yy=Y(val);doc.line(AX,yy,b.x+b.w-4,yy);doc.text(f(val,0),AX-2,yy+1,{align:'right'})}
  doc.setDrawColor(...C.acc);doc.setLineWidth(0.7);
  let prev=null;pts.forEach((p,i)=>{if(p.v==null)return;if(prev)doc.line(X(prev.i),Y(prev.v),X(i),Y(p.v));prev={i,v:p.v}});
  pts.forEach((p,i)=>{doc.setFont('helvetica','normal');doc.setFontSize(6.3);doc.setTextColor(...C.mut);doc.text(T(p.l),X(i),Bt+4,{align:'center'});
    if(p.v==null)return;doc.setFillColor(...C.acc);doc.setDrawColor(255,255,255);doc.setLineWidth(0.4);doc.circle(X(i),Y(p.v),1.2,'FD');
    doc.setFont('helvetica','bold');doc.setFontSize(6.5);doc.setTextColor(...C.ink);doc.text(f(p.v,1),X(i),Y(p.v)-2.2,{align:'center'})});
}

logoUI();
})();
