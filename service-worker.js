const CACHE="matteos-finance-v2";
const ASSETS=[
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js",
  "./icons/metal-duck.svg"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))
    )
  );
  self.clients.claim();
});

async function patchedHtml(request){
  const response=await fetch(request,{cache:"no-store"});
  const html=await response.text();

  const patched=html
    .replaceAll("Matteo's Finanze","Matteo's Finance")
    .replace('href="icons/icon.svg"','href="icons/metal-duck.svg"')
    .replace(
      ".brand-icon svg{width:46px;height:46px}",
      ".brand-icon svg,.brand-icon img{width:46px;height:46px;object-fit:cover}"
    )
    .replace(
      /<template id="pigLogo">[\s\S]*?<\/template>/,
      '<template id="pigLogo"><img src="icons/metal-duck.svg" alt="Papero metallaro" style="width:100%;height:100%;object-fit:cover"></template>'
    );

  return new Response(patched,{
    status:response.status,
    statusText:response.statusText,
    headers:{
      "Content-Type":"text/html; charset=utf-8",
      "Cache-Control":"no-store"
    }
  });
}

self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  const isHtmlNavigation=
    event.request.mode==="navigate" ||
    url.pathname.endsWith("/index.html");

  if(isHtmlNavigation){
    event.respondWith(
      patchedHtml(event.request).catch(()=>caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request))
  );
});
