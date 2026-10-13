// Service Worker(ビルドのときに vite.config.js が、保存の名前とファイルの一覧を入れて sw.js を作る)
//   ・最初に全部のファイルを保存 → 2回目からは保存したものをすぐ出す(回線が遅くても即起動・オフラインでも開ける)
//   ・新しい版は裏で保存しておき、アプリが「更新する」を押したら切り替える(勝手には切り替えない)
const CACHE = 'gks-0.10.0-d2cf4a150f';
const ASSETS = ["./","./assets/pink-laugh-CosY9Jbn.png","./assets/blue-wave-DH-KlseN.png","./assets/pink-please-3T5r-tzQ.png","./assets/pink-hmm-B1EnGF_z.png","./assets/blue-happy-BWvMW-ye.png","./assets/pink-surprise-BO0LXUme.png","./assets/title-demo-aYXuj_u2.png","./assets/demo-template-W0geZvv7.xlsx","./assets/index-CsIutdJ8.css","./assets/index-BjmUzd0X.js","./assets/ExcelFileDataSource-kqlZqdTw.js","./assets/GraphDataSource-_awupIX8.js","./assets/tableCodec-286dCIpa.js","./assets/exportLetter-Cy7stb9N.js","./assets/xlsxForm-cv1Paf7C.js","./assets/xlsxTables-CgmvFy_1.js","./assets/browser-COtC1niR.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];

self.addEventListener('install', (e) => {
  // ブラウザの一時保存(HTTP キャッシュ)を使わず、必ずサーバーから取り直す(古い index.html を保存しないため)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('gks-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // ほかのサイト(本番の Microsoft Graph など)はそのまま
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then((c) => c.match('./')).then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(
    caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) c.put(req, res.clone());
      return res;
    }))),
  );
});
