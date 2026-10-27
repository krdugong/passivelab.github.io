#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const base = 'https://psvl.kr/nomorenarrowroom/';
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/hotels.js'), 'utf8'), context);
const hotels = Array.from(context.window.NMNR_HOTELS);
const slug = h => h.id.replaceAll('_', '-');
const url = route => base + route;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number.isFinite(n) ? String(n) : '확인 중';
const newest = list => list.map(h => h.verifiedAt).filter(Boolean).sort().at(-1) || '';
const sizeText = m => !Number.isFinite(m) ? '객실 면적 확인 중' : m <= 15 ? '2인이 큰 캐리어를 펼치면 동선이 빠듯할 수 있습니다.' : m < 20 ? '2인 이용 시 캐리어를 펼칠 자리를 배치도와 함께 확인하세요.' : m < 25 ? '2인과 캐리어 2개를 고려할 때 비교적 여유 있는 면적입니다.' : '후쿠오카 도심 호텔에서 넓은 편으로 볼 수 있는 면적입니다.';
const bathText = h => h.bath ? h.bathLabel : /확인 안 됨/.test(h.bathLabel) ? '대욕장 정보 확인 필요' : '대욕장 없음';
const areaRoute = area => area === '하카타' ? 'fukuoka/hakata/' : area === '텐진' ? 'fukuoka/tenjin/' : 'fukuoka/nakasu/';
const itemRoute = h => 'hotel/' + slug(h) + '/';
const json = object => JSON.stringify(object).replace(/</g, '\\u003c');
const a = (route, label, extra='') => `<a href="${url(route)}"${extra}>${esc(label)}</a>`;
const crumb = (items, page) => `<nav class="crumb" aria-label="현재 위치">${items.map(x => a(x[0], x[1])).join('<span aria-hidden="true">›</span>')}<span aria-hidden="true">›</span><span>${esc(page)}</span></nav>`;
const schemas = (route, trail, extra=[]) => [
  {'@context':'https://schema.org','@type':'WebPage',name:trail.at(-1)[1],url:url(route),inLanguage:'ko',dateModified:extra.date || undefined},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:trail.map(([r,name],i)=>({'@type':'ListItem',position:i+1,name,item:url(r)}))},
  ...(extra.entities || [])
];
function shell({route,title,description,h1,eyebrow,lead,body,trail,date,entities=[]}) {
  const structured = schemas(route,trail,{date,entities});
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${url(route)}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url(route)}">
<link rel="stylesheet" href="${base}assets/seo.css">
<script type="application/ld+json">${json(structured)}</script>
<script src="${base}assets/seo.js" defer></script></head>
<body><a class="skip" href="#main">본문으로 바로가기</a>
<header class="site-head"><div class="container head-inner"><a class="logo" href="${base}index.html">NoMoreNarrowRoom<small>방 크기와 대욕장으로 고르는 일본 호텔</small></a><nav aria-label="주요 메뉴">${a('fukuoka/','후쿠오카')}${a('fukuoka/hakata/','하카타')}${a('fukuoka/tenjin/','텐진')}${a('simulator.html','캐리어 시뮬레이션')}</nav></div></header>
<main id="main" class="container">${crumb(trail.slice(0,-1),trail.at(-1)[1])}
<section class="hero"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(h1)}</h1><p class="lead">${esc(lead)}</p><p class="updated">자료 최종 확인 <time datetime="${date}">${date}</time> · 객실별 확인일은 상세 페이지에 표시</p></section>
${body}</main><footer class="site-foot"><div class="container"><p>객실 면적은 2인 투숙 가능한 기본 객실 중 확인된 가장 작은 타입 기준입니다. 실제 동선은 침대·가구 배치와 캐리어 크기에 따라 달라집니다.</p><p>예약 링크 일부는 제휴 링크이며 예약 시 운영자에게 수수료가 지급될 수 있습니다. 객실 타입과 대욕장 운영 조건은 예약 전 다시 확인하세요.</p></div></footer></body></html>`;
}
function card(h) {
  return `<article class="hotel-card" data-area="${esc(h.area)}" data-room="${Number.isFinite(h.minRoom2Pax)?h.minRoom2Pax:''}" data-bath="${h.bath?'yes':/확인 안 됨/.test(h.bathLabel)?'unknown':'no'}" data-name="${esc(h.name)}"><div class="card-main"><p class="card-area">${esc(h.area)} · ${esc(h.roomType)}</p><h3>${a(itemRoute(h),h.name)}</h3><p>${esc(h.reviewNote || '객실 면적과 대욕장을 비교해 보세요.')}</p></div><dl class="facts"><div><dt>기본 객실</dt><dd>${fmt(h.minRoom2Pax)}㎡</dd></div><div><dt>대욕장</dt><dd>${esc(bathText(h))}</dd></div></dl><p class="card-foot">${a(itemRoute(h),'방 크기·접근성 자세히 보기 →')}</p></article>`;
}
function filters(list) {
  return `<form class="filters" id="hotelFilters" role="search" hidden><label>지역<select name="area"><option value="all">전체</option><option value="하카타">하카타</option><option value="텐진">텐진</option><option value="나카스">나카스</option></select></label><label>최소 면적<select name="room"><option value="0">전체</option><option value="16">16㎡ 이상</option><option value="20">20㎡ 이상</option><option value="25">25㎡ 이상</option></select></label><label>대욕장<select name="bath"><option value="all">전체</option><option value="yes">있음</option><option value="no">없음</option></select></label><label>호텔명<input name="query" type="search" placeholder="호텔 이름 검색"></label><button type="reset">초기화</button></form><p id="filterCount" role="status" aria-live="polite">전체 ${list.length}곳</p>`;
}
function linkRow() {
  return `<nav class="quick-links" aria-label="후쿠오카 비교 바로가기">${a('fukuoka/','후쿠오카 전체')}${a('fukuoka/hakata/','하카타 호텔')}${a('fukuoka/tenjin/','텐진 호텔')}${a('fukuoka/nakasu/','나카스 호텔')}${a('fukuoka/20sqm/','20㎡ 이상')}${a('fukuoka/bath/','대욕장 있는 호텔')}</nav>`;
}
function listPage({route,title,description,h1,eyebrow,lead,opening,list,trail,map=false}) {
  const date = newest(list);
  const items = {'@context':'https://schema.org','@type':'ItemList',name:h1,itemListElement:list.map((h,i)=>({'@type':'ListItem',position:i+1,name:h.name,url:url(itemRoute(h))}))};
  const mapBlock = map ? `<section class="map-section" aria-labelledby="mapTitle"><div class="section-head"><h2 id="mapTitle">호텔 위치 지도</h2><p>호텔 점을 선택하면 객실 정보와 상세 페이지를 볼 수 있습니다. 지도 없이도 아래 목록을 이용할 수 있습니다.</p></div><div id="hotelMap" class="map" data-points="${esc(json(list.map(h=>({name:h.name,area:h.area,lat:h.location?.lat,lng:h.location?.lng,room:h.minRoom2Pax,bath:h.bath?'yes':/확인 안 됨/.test(h.bathLabel)?'unknown':'no',route:itemRoute(h)}))))}"></div></section>` : '';
  const body = `${linkRow()}<section class="intro-copy"><h2>어떤 호텔이 맞을까요?</h2><p>${esc(opening)}</p><p>면적은 캐리어를 펼칠 여유를 가늠하는 출발점입니다. 같은 20㎡라도 침대와 욕실 배치에 따라 실제 사용 공간은 다릅니다.</p></section>${mapBlock}<section class="listing" aria-labelledby="listTitle"><div class="section-head"><h2 id="listTitle">${esc(h1)} · ${list.length}곳</h2><p>기본 객실 면적과 대욕장을 먼저 비교하고 상세 페이지에서 확인 근거와 역 접근성 메모를 살펴보세요.</p></div>${filters(list)}<div class="card-grid" id="hotelCards">${list.map(card).join('')}</div><p class="empty" id="emptyMessage" hidden>조건에 맞는 호텔이 없습니다. 필터를 넓혀 보세요.</p></section><section class="method"><h2>비교 기준</h2><p>면적은 2인 투숙 가능한 기본 객실 중 확인된 가장 작은 타입을 사용합니다. 대욕장은 객실 욕조와 구분합니다. 역 접근성 메모는 일부 이용 후기를 참고한 정성 정보이며 도보 시간을 검증하지 않은 곳은 분 단위로 표시하지 않습니다.</p></section>`;
  return shell({route,title,description,h1,eyebrow,lead,body,trail,date,entities:[items]});
}
function hotelPage(h) {
  const route=itemRoute(h), area=h.area, city='후쿠오카';
  const title=`${h.name} 객실 크기 ${fmt(h.minRoom2Pax)}㎡·대욕장 | NoMoreNarrowRoom`;
  const description=`${h.name}의 2인 기본 객실 ${fmt(h.minRoom2Pax)}㎡, ${bathText(h)}. ${h.reviewNote || '역 접근성과 객실 선택 기준을 확인하세요.'} 객실 타입과 자료 확인일을 비교하세요.`;
  const areaHotels=hotels.filter(x=>x.area===area&&x.id!==h.id).sort((a,b)=>Math.abs((a.minRoom2Pax||0)-(h.minRoom2Pax||0))-Math.abs((b.minRoom2Pax||0)-(h.minRoom2Pax||0))).slice(0,3);
  const sources=`<ul class="source-list"><li>면적·대욕장 확인 기록: ${esc(h.verification)} · <time datetime="${h.verifiedAt}">${h.verifiedAt}</time></li>${h.officialSourceUrl?`<li><a href="${esc(h.officialSourceUrl)}" rel="noopener" target="_blank">객실 자료 ↗</a></li>`:''}${h.bathSourceUrl?`<li><a href="${esc(h.bathSourceUrl)}" rel="noopener" target="_blank">대욕장 자료 ↗</a></li>`:''}${h.reviewSourceUrl?`<li><a href="${esc(h.reviewSourceUrl)}" rel="noopener" target="_blank">접근성·체감 메모에 참고한 후기 ↗</a> · ${esc(h.reviewCheckedAt)}</li>`:''}</ul>`;
  const bathCopy = h.bath ? `기록된 시설은 ${h.bathLabel}입니다. 이용 조건과 운영 시간은 예약 전에 확인하세요.` : `현재 자료에는 ${h.bathLabel}으로 기록돼 있습니다. 대욕장이 중요하다면 같은 지역 호텔도 비교하세요.`;
  const body=`<div class="detail-layout"><article class="detail-main"><section class="fact-panel"><div><span>2인 기본 객실</span><strong>${fmt(h.minRoom2Pax)}㎡</strong><small>${esc(h.roomType)}</small></div><div><span>대욕장</span><strong>${esc(h.bath?'있음':/확인 안 됨/.test(h.bathLabel)?'확인 필요':'없음')}</strong><small>${esc(h.bathLabel)}</small></div><div><span>지역</span><strong>${esc(area)}</strong><small>후쿠오카</small></div></section><section class="prose"><h2>캐리어를 펼칠 공간</h2><p>${esc(sizeText(h.minRoom2Pax))} 면적만으로 펼친 캐리어의 실제 자리를 확정할 수 없으므로, 예약할 객실의 사진과 배치도를 함께 확인하세요.</p><p><a href="${base}simulator.html?area=${encodeURIComponent(h.minRoom2Pax)}">이 면적으로 캐리어 시뮬레이션 해보기 →</a></p><h2>대욕장과 이동 동선</h2><p>${esc(bathCopy)}</p><p>${esc(h.reviewNote || '역 접근성은 선택한 교통편과 출구에 따라 달라집니다.')}</p><p class="muted">위 이동 동선 메모는 후기를 참고한 요약입니다. 역 출구별 도보 시간은 별도로 검증되지 않았습니다.</p><h2>누구에게 맞을까요?</h2><p>${esc(h.bath ? (h.minRoom2Pax>=20?'넓은 객실과 대욕장을 함께 우선하는 2인 여행에 비교할 만합니다.':'객실은 아담해도 하루 끝에 대욕장을 이용하고 싶은 여행에 비교할 만합니다.') : (h.minRoom2Pax>=20?'대욕장보다 객실 여유를 우선하는 2인 여행에 비교할 만합니다.':'짐이 적고 위치나 이동 동선을 먼저 고려하는 여행에 비교할 만합니다.'))}</p><h2>자료와 확인일</h2>${sources}<p class="muted">선택한 객실 타입의 면적·대욕장 운영 시간은 예약 전 숙소 페이지에서 재확인하세요.</p>${h.tripUrl?`<p><a class="cta" href="${esc(h.tripUrl)}" rel="sponsored noopener" target="_blank">날짜별 객실·요금 확인 ↗</a></p>`:''}</section></article><aside class="detail-side"><h2>같은 지역의 다른 호텔</h2>${areaHotels.map(x=>`<p>${a(itemRoute(x),x.name)}<small>${fmt(x.minRoom2Pax)}㎡ · ${esc(bathText(x))}</small></p>`).join('')}<p>${a(areaRoute(area),area+' 호텔 전체 보기 →')}</p></aside></div>`;
  const hotelSchema={'@context':'https://schema.org','@type':'Hotel',name:h.name,url:url(route),address:{'@type':'PostalAddress',addressLocality:city,addressRegion:area,addressCountry:'JP'},additionalProperty:[{'@type':'PropertyValue',name:'2인 기본 객실 최소 면적',value:Number.isFinite(h.minRoom2Pax)?h.minRoom2Pax:undefined,unitCode:'MTK'}],...(h.bath?{amenityFeature:[{'@type':'LocationFeatureSpecification',name:'대욕장',value:true}]}:{})};
  return shell({route,title,description,h1:h.name+' 객실 크기·대욕장',eyebrow:area.toUpperCase()+' HOTEL GUIDE',lead:`${h.roomType} ${fmt(h.minRoom2Pax)}㎡ · ${bathText(h)} · ${area} 이동 동선을 함께 비교합니다.`,body,trail:[['index.html','홈'],['fukuoka/','후쿠오카'],[areaRoute(area),area],[route,h.name]],date:h.verifiedAt,entities:[hotelSchema]});
}
function write(route,html) {const file=path.join(root,route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html+'\n');}
const pages=[];
function add(config){write(config.route,listPage(config));pages.push([config.route,newest(config.list)]);}
const trail=(route,name)=>[['index.html','홈'],['fukuoka/','후쿠오카'],[route,name]];
add({route:'fukuoka/',title:'후쿠오카 호텔 방 크기·대욕장 비교 30곳 | NoMoreNarrowRoom',description:'후쿠오카 호텔 30곳의 2인 기본 객실 면적과 대욕장 여부를 비교합니다. 하카타·텐진·나카스 위치, 캐리어 공간, 역 접근성 메모를 확인하세요.',h1:'후쿠오카 호텔 방 크기·대욕장 비교',eyebrow:'FUKUOKA HOTEL GUIDE',lead:'하카타·텐진·나카스 호텔 30곳의 기본 객실 면적과 대욕장을 한눈에 살펴보세요.',opening:'하카타는 철도와 공항 이동, 텐진은 쇼핑과 시내 동선, 나카스는 두 지역 사이 이동을 고려할 때 살펴볼 지역입니다. 객실 면적과 대욕장 여부를 먼저 좁힌 뒤 실제 위치를 지도에서 확인하세요.',list:hotels,trail:[['index.html','홈'],['fukuoka/','후쿠오카']],map:true});
for (const [area,en,opening] of [['하카타','hakata','하카타역과 버스터미널을 중심으로 이동하는 일정이라면 역 접근성 메모를 먼저 보세요. 역 가까운 호텔도 13~15㎡ 객실이 있어 짐이 많다면 면적을 함께 비교해야 합니다.'],['텐진','tenjin','쇼핑과 식사 동선을 우선한다면 텐진 호텔을 살펴보세요. 텐진 중심부 접근성과 객실 면적, 대욕장 여부를 함께 비교하면 선택이 쉬워집니다.'],['나카스','nakasu','하카타와 텐진 사이를 오가는 일정이라면 나카스 호텔을 살펴보세요. 대욕장 여부와 기본 객실 면적의 차이를 먼저 비교하고 위치를 확인하세요.']]) {
 const list=hotels.filter(h=>h.area===area),route='fukuoka/'+en+'/';
 add({route,title:`${area} 호텔 객실 크기·대욕장 비교 ${list.length}곳 | NoMoreNarrowRoom`,description:`${area} 호텔 ${list.length}곳의 2인 기본 객실 면적, 캐리어 공간, 대욕장 여부와 역 접근성 메모를 비교하세요.`,h1:`${area} 호텔 객실 크기 비교`,eyebrow:en.toUpperCase()+' AREA GUIDE',lead:`${area} 호텔 ${list.length}곳에서 좁은 객실을 피하고 원하는 온욕시설을 찾아보세요.`,opening,list,trail:trail(route,area),map:true});
}
for(const [sub,name,predicate,opening] of [['20sqm','20㎡ 이상',h=>h.minRoom2Pax>=20,'2인 여행에서 캐리어를 펼칠 공간이 중요하다면 20㎡ 이상부터 비교해 보세요. 실제 동선은 객실 배치와 침대 크기에 따라 달라집니다.'],['bath','대욕장 있는',h=>h.bath,'하루 끝에 대욕장을 이용하고 싶다면 시설이 확인된 호텔을 모아 비교하세요. 운영 시간과 이용 조건은 호텔마다 다릅니다.']]){
 const list=hotels.filter(predicate),route='fukuoka/'+sub+'/';
 add({route,title:`후쿠오카 ${name} 호텔 ${list.length}곳 비교 | NoMoreNarrowRoom`,description:`후쿠오카 ${name} 호텔 ${list.length}곳의 기본 객실 면적, 지역과 역 접근성 메모를 비교합니다. 캐리어 공간과 대욕장 조건을 함께 확인하세요.`,h1:`후쿠오카 ${name} 호텔`,eyebrow:'FUKUOKA BY NEED',lead:`여행 조건에 맞는 후쿠오카 호텔 ${list.length}곳을 모았습니다.`,opening,list,trail:trail(route,name+' 호텔'),map:false});
}
for (const h of hotels){const route=itemRoute(h);write(route,hotelPage(h));pages.push([route,h.verifiedAt]);}
const xmlEsc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[['index.html',newest(hotels)],...pages].map(([r,d])=>`  <url><loc>${xmlEsc(url(r))}</loc><lastmod>${d}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
fs.writeFileSync(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
console.log(`Generated ${pages.length} static pages and sitemap.xml from ${hotels.length} hotels`);
