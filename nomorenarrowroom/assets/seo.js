'use strict';
const form = document.getElementById('hotelFilters');
if (form) {
  form.hidden = false;
  const cards = [...document.querySelectorAll('#hotelCards .hotel-card')];
  const count = document.getElementById('filterCount');
  const empty = document.getElementById('emptyMessage');
  const update = () => {
    const data = new FormData(form);
    const area = data.get('area'), room = Number(data.get('room')), bath = data.get('bath');
    const query = String(data.get('query') || '').trim().toLocaleLowerCase('ko');
    let visible = 0;
    for (const card of cards) {
      const match = (area === 'all' || card.dataset.area === area)
        && (!room || Number(card.dataset.room) >= room)
        && (bath === 'all' || card.dataset.bath === bath)
        && card.dataset.name.toLocaleLowerCase('ko').includes(query);
      card.hidden = !match;
      if (match) visible++;
    }
    count.textContent = `${visible}곳 / 전체 ${cards.length}곳`;
    empty.hidden = visible > 0;
    document.dispatchEvent(new CustomEvent('nmnr:filter', {detail: {area, room, bath, query}}));
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('reset', () => setTimeout(update, 0));
}
const mapElement = document.getElementById('hotelMap');
if (mapElement) {
  const points = JSON.parse(mapElement.dataset.points).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (points.length) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    css.crossOrigin = '';
    document.head.append(css);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      const map = L.map(mapElement, {scrollWheelZoom: false});
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '&copy; OpenStreetMap contributors'}).addTo(map);
      const markers = points.map(p => {
        const marker = L.circleMarker([p.lat, p.lng], {radius: 7, weight: 2, color: '#115d5b', fillColor: '#1c827e', fillOpacity: .9}).addTo(map);
        const detail = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = p.name;
        const meta = document.createElement('p');
        meta.textContent = `${p.area} · ${p.room}㎡`;
        const link = document.createElement('a');
        link.href = new URL(p.route, document.querySelector('.logo').href).href;
        link.textContent = '호텔 자세히 보기 →';
        detail.append(strong, meta, link);
        marker.bindPopup(detail);
        return {marker, point: p};
      });
      map.fitBounds(L.latLngBounds(markers.map(m => m.marker.getLatLng())).pad(.18), {maxZoom: 14});
      document.addEventListener('nmnr:filter', event => {
        const {area, room, bath, query} = event.detail;
        for (const {marker, point} of markers) {
          const show = (area === 'all' || point.area === area)
            && (!room || point.room >= room)
            && (bath === 'all' || point.bath === bath)
            && point.name.toLocaleLowerCase('ko').includes(query);
          if (show && !map.hasLayer(marker)) marker.addTo(map);
          if (!show && map.hasLayer(marker)) map.removeLayer(marker);
        }
      });
    };
    script.onerror = () => { mapElement.textContent = '지도를 불러오지 못했습니다. 아래 호텔 목록에서 위치별로 비교할 수 있습니다.'; };
    document.head.append(script);
  }
}
