const CACHE='umunota-shell-v2';
const SHELL=['/','/manifest.webmanifest','/umunota-icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>undefined));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('push',event=>{
  let data={title:'UMUNOTA',body:'You have a new update.',href:'/dashboard',icon:'/umunota-icon.svg',badge:'/umunota-icon.svg'};
  try{if(event.data)data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:data.icon||'/umunota-icon.svg',badge:data.badge||'/umunota-icon.svg',data:{href:data.href||'/dashboard'},tag:data.href||'umunota-update',renotify:true}));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();const href=event.notification.data?.href||'/dashboard';
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{for(const client of clients){if('focus'in client){client.navigate(href);return client.focus()}}return self.clients.openWindow(href)}));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match('/')));
    return;
  }
  if(url.pathname==='/manifest.webmanifest'||url.pathname==='/umunota-icon.svg'){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  }
});
