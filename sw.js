// Service worker: เก็บตัวแอป (shell) ไว้ในเครื่องเพื่อเปิดเร็วและเปิดได้แม้ออฟไลน์ ส่วนราคาดึงสดจากอินเทอร์เน็ตเสมอ
// เปลี่ยนเลข CACHE ทุกครั้งที่แก้ไฟล์ เพื่อให้มือถือรับเวอร์ชันใหม่
const CACHE = 'us-stocks-v3-ictlab';
const CDN = 'https://cdn.jsdelivr.net/npm/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', CDN];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || (u.origin !== location.origin && r.url !== CDN)) return;   // API ราคา ไม่ผ่านแคช
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res.ok){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
