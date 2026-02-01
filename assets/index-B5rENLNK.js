(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function r(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(e){if(e.ep)return;e.ep=!0;const n=r(e);fetch(e.href,n)}})();const C="https://story-api.dicoding.dev/v1";async function O(o,t){return(await fetch(`${C}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:o,password:t})})).json()}async function q(o){return(await fetch(`${C}/stories`,{headers:{Authorization:`Bearer ${o}`}})).json()}async function S(o,t){const r=new FormData;return Object.entries(t).forEach(([e,n])=>n&&r.append(e,n)),(await fetch(`${C}/stories`,{method:"POST",headers:{Authorization:`Bearer ${o}`},body:r})).json()}async function $(o,t,r){return(await fetch("https://story-api.dicoding.dev/v1/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:o,email:t,password:r})})).json()}function P(o){localStorage.setItem("token",o)}function w(){return localStorage.getItem("token")}function M(){return!!w()}function R(){localStorage.clear(),location.hash="/login"}const U={render(){return`
      <h1>Login</h1>

      <form id="loginForm">
        <label for="email">
          Email
          <input type="email" id="email" required />
        </label>

        <label for="password">
          Password
          <input type="password" id="password" required />
        </label>

        <button type="submit">Login</button>

        <p id="message" aria-live="polite"></p>
      </form>

      <p>
        Belum punya akun?
        <a href="#/register">Register</a>
      </p>
    `},async afterRender(){const o=document.getElementById("loginForm"),t=document.getElementById("message");o.addEventListener("submit",async r=>{r.preventDefault();const a=document.getElementById("email").value,e=document.getElementById("password").value;t.textContent="Sedang login...";const n=await O(a,e);if(n.error){t.textContent=n.message;return}P(n.loginResult.token),t.textContent="Login berhasil!",location.hash="/home"})}},F={render(){return`
      <h1>Register Akun</h1>

      <form id="registerForm">
        <label>
          Nama
          <input type="text" id="name" required />
        </label>

        <label>
          Email
          <input type="email" id="email" required />
        </label>

        <label>
          Password
          <input type="password" id="password" required minlength="8" />
        </label>

        <button type="submit">Register</button>
        <p id="message" aria-live="polite"></p>

        <p>
          Sudah punya akun?
          <a href="#/login">Login</a>
        </p>
      </form>
    `},async afterRender(){const o=document.getElementById("registerForm"),t=document.getElementById("message");o.onsubmit=async r=>{r.preventDefault();const a=document.getElementById("name").value,e=document.getElementById("email").value,n=document.getElementById("password").value;t.textContent="Mendaftarkan akun...";const s=await $(a,e,n);if(s.error){t.textContent=s.message;return}t.textContent="Registrasi berhasil! Silakan login.",setTimeout(()=>{location.hash="/login"},1200)}}};let k,x;function N(o){k?x.clearLayers():(k=L.map("map").setView([-2.5,118],5),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(k),x=L.layerGroup().addTo(k)),o.forEach(t=>{if(t.lat&&t.lon){const r=new Date(t.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}),a=`
        <div class="map-popup">
          <img
            src="${t.photoUrl}"
            alt="Foto cerita oleh ${t.name}"
            style="width:100%; border-radius:6px; margin-bottom:8px;"
          />
          <h3>${t.name}</h3>
          <p style="font-size:0.85rem; color:#555;">${r}</p>
          <p>${t.description}</p>
        </div>
      `;L.marker([t.lat,t.lon]).bindPopup(a).addTo(x)}})}const _="stories-db",h="stories",z=2,y="story-queue",v=()=>new Promise((o,t)=>{const r=indexedDB.open(_,z);r.onerror=a=>{console.error("Database error:",a.target.error),t("Error opening database")},r.onsuccess=a=>{o(a.target.result)},r.onupgradeneeded=a=>{const e=a.target.result;e.objectStoreNames.contains(h)||(e.createObjectStore(h,{keyPath:"id"}),console.log("Created stories store")),e.objectStoreNames.contains(y)||(e.createObjectStore(y,{keyPath:"queueId",autoIncrement:!0}),console.log("Created queue store"))}}),D=async o=>{if(!o||!Array.isArray(o)||o.length===0)return console.warn("No stories to save"),!1;try{const a=(await v()).transaction(h,"readwrite").objectStore(h);await new Promise((e,n)=>{const s=a.clear();s.onsuccess=()=>e(),s.onerror=d=>n(d)});for(const e of o)await new Promise((n,s)=>{const d=a.add(e);d.onsuccess=()=>n(),d.onerror=u=>{console.error("Error adding story:",u,e),s(u)}});return!0}catch(t){return console.error("Error saving stories to IndexedDB:",t),!1}},H=async()=>{try{const r=(await v()).transaction(h,"readonly").objectStore(h);return new Promise((a,e)=>{const n=r.getAll();n.onsuccess=()=>a(n.result||[]),n.onerror=s=>{console.error("Error getting stories:",s),e(s)}})}catch(o){return console.error("Error getting stories from IndexedDB:",o),[]}},G=(o,t)=>{const r=async()=>{try{console.log("Melakukan sinkronisasi data dengan server...");const a=await t(o);a&&a.listStory&&(await D(a.listStory)?(console.log("Data berhasil disinkronkan"),window.dispatchEvent(new CustomEvent("stories-synced",{detail:{stories:a.listStory}}))):console.error("Gagal menyimpan data sinkronisasi"))}catch(a){console.error("Gagal sinkronisasi:",a)}};navigator.onLine&&r(),window.addEventListener("online",()=>{console.log("Koneksi internet tersedia. Memulai sinkronisasi..."),r()})},j=async()=>{try{const r=(await v()).transaction(y,"readonly").objectStore(y);return new Promise((a,e)=>{const n=r.getAll();n.onsuccess=()=>a(n.result||[]),n.onerror=s=>{console.error("Error getting queued stories:",s),e(s)}})}catch(o){return console.error("Error retrieving from queue:",o),[]}},K=async o=>{try{console.log("Menyimpan cerita ke queue...");const a=(await v()).transaction(y,"readwrite").objectStore(y),e={...o,isDraft:!0,queuedAt:new Date().toISOString()};return new Promise((n,s)=>{const d=a.add(e);d.onsuccess=()=>{console.log("Cerita berhasil ditambahkan ke queue:",d.result),n({success:!0,id:d.result})},d.onerror=u=>{var c;console.error("Error adding to queue:",u),n({success:!1,error:((c=u.target.error)==null?void 0:c.message)||"Unknown error"})}})}catch(t){return console.error("Error pada addToStoryQueue:",t),{success:!1,error:t.message}}},I=async()=>{try{const o=await H(),t=await j();console.log("Server stories:",o.length),console.log("Queued stories:",t.length);const r=[];for(const e of t)try{if(!e.photo||!e.photo.data){console.warn("Invalid photo data in queue item:",e);continue}const n=new Blob([e.photo.data],{type:e.photo.type||"image/jpeg"}),s=URL.createObjectURL(n);r.push({id:`local-${e.queueId}`,name:"Cerita Lokal",description:e.description,photoUrl:s,createdAt:e.queuedAt,lat:e.lat,lon:e.lon,isOffline:!0})}catch(n){console.error("Error formatting queue item:",n)}const a=[...o,...r];return console.log("Combined stories total:",a.length),a}catch(o){return console.error("Error getting all stories:",o),[]}},A=async(o,t)=>{if(navigator.onLine)try{const e=(await v()).transaction(y,"readwrite").objectStore(y),n=await j();console.log(`Processing ${n.length} queued stories`);for(const s of n)try{if(!s.photo||!s.photo.data){console.warn("Invalid photo data in queue item - skipping:",s);continue}const{description:d,photo:u,lat:c,lon:i}=s,l=new Blob([u.data],{type:u.type||"image/jpeg"}),p=new File([l],u.name||"photo.jpg",{type:u.type||"image/jpeg",lastModified:u.lastModified||Date.now()}),m=await t(o,{description:d,photo:p,lat:c,lon:i});m.error?console.error(`Failed to send queued story: ${s.queueId}`,m.message):(await new Promise((g,b)=>{const f=e.delete(s.queueId);f.onsuccess=()=>{console.log(`Story from queue successfully sent: ${s.queueId}`),g()},f.onerror=T=>b(T)}),window.dispatchEvent(new CustomEvent("queued-story-processed",{detail:{success:!0,queueId:s.queueId}})))}catch(d){console.error(`Error processing queue item ${s.queueId}:`,d)}}catch(r){console.error("Error processing story queue:",r)}},W={async render(){return`
      <section class="home-container">
        <h1>Daftar Cerita</h1>
        <div id="connection-status"></div>

        <div class="story-controls" style="margin-bottom:12px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
          <input 
            type="text" id="searchInput" 
            placeholder="Cari cerita..." 
            style="padding:6px 10px; border-radius:4px; border:1px solid #ccc;" 
          />

          <select id="sortSelect" style="padding:6px 10px; border-radius:4px; border:1px solid #ccc;">
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>
        </div>

        <div id="map" class="map-container" style="height:400px; margin-bottom:12px;"></div>

        <ul id="list" class="story-list"></ul>
      </section>
    `},async afterRender(){const o=document.getElementById("list"),t=document.getElementById("searchInput"),r=document.getElementById("sortSelect"),a=document.getElementById("connection-status");let e=[];const n=w(),s=(c,i)=>[...c].sort((l,p)=>i==="asc"?new Date(l.createdAt)-new Date(p.createdAt):new Date(p.createdAt)-new Date(l.createdAt)),d=()=>{navigator.onLine?a.innerHTML=`<div style="background:#e7f7e7; color:#2e7d32; padding:8px; border-radius:4px; margin-bottom:10px;">
          Online - Data telah disinkronkan</div>`:a.innerHTML=`<div style="background:#ffebee; color:#c62828; padding:8px; border-radius:4px; margin-bottom:10px;">
          Offline - Menampilkan data lokal</div>`};d(),window.addEventListener("online",d),window.addEventListener("offline",d);const u=c=>{if(o.innerHTML="",!c||c.length===0){o.innerHTML="<p>Tidak ada cerita tersedia.</p>";return}c.forEach(i=>{try{const l=i.isOffline?'<span style="background:#ff9800;color:white;padding:2px 6px;border-radius:10px;font-size:12px;margin-left:5px;">Offline</span>':"",p=new Date(i.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});o.innerHTML+=`
            <li class="story-item">
              <img src="${i.photoUrl}" alt="Foto cerita oleh ${i.name}" class="story-image"/>
              <div class="story-content">
                <h2>${i.name} ${l}</h2>
                <p class="story-date">${p}</p>
                <p class="story-description">${i.description}</p>
              </div>
            </li>
          `}catch(l){console.error("Error rendering story:",l,i)}});try{const i=c.filter(l=>l&&l.lat&&l.lon);i.length>0&&N(i)}catch(i){console.error("Error initializing map:",i)}};try{if(e=await I()||[],u(e),navigator.onLine)try{const c=await q(n);if(c&&c.listStory){console.log("Received server stories:",c.listStory.length),await D(c.listStory),e=await I()||[],console.log("Final merged stories count:",e.length);const i=t.value.toLowerCase(),l=e.filter(m=>m.name.toLowerCase().includes(i)||m.description.toLowerCase().includes(i)),p=s(l,r.value);u(p)}}catch(c){console.error("Error fetching stories from server:",c),u(e)}}catch(c){console.error("Error fetching stories:",c),o.innerHTML="<p>Gagal memuat cerita. Silakan periksa koneksi internet Anda.</p>"}G(n,q),window.addEventListener("stories-synced",async c=>{e=await I()||[];const i=t.value.toLowerCase(),l=e.filter(m=>m.name.toLowerCase().includes(i)||m.description.toLowerCase().includes(i)),p=s(l,r.value);u(p),d()}),t.addEventListener("input",()=>{const c=t.value.toLowerCase(),i=e.filter(p=>p.name.toLowerCase().includes(c)||p.description.toLowerCase().includes(c)),l=s(i,r.value);u(l)}),r.addEventListener("change",()=>{const c=t.value.toLowerCase(),i=e.filter(p=>p.name.toLowerCase().includes(c)||p.description.toLowerCase().includes(c)),l=s(i,r.value);u(l)})}},V={async render(){return`
      <h1>Tambah Cerita</h1>

      <form id="addForm">
        <h2>Detail Cerita</h2>

        <label>
          Deskripsi
          <textarea id="description" required></textarea>
        </label>

        <label>
          Gambar
          <input type="file" id="photo" accept="image/*" required />
        </label>

        <button type="button" id="openCamera">Ambil dari Kamera</button>

        <video id="video" autoplay style="display:none; width:100%"></video>
        <button type="button" id="capture" style="display:none">Ambil Foto</button>
        <canvas id="canvas" style="display:none"></canvas>

        <h2>Lokasi Cerita</h2>
        <div id="map" style="height:300px; margin-top:1rem"></div>
        <p id="locationInfo">Klik peta untuk memilih lokasi</p>

        <button type="submit">Kirim Cerita</button>
        <p id="message" aria-live="polite"></p>
        <div id="debug-info" style="margin-top:20px; font-size:12px;"></div>
      </form>
    `},async afterRender(){const o=w();if(!o){location.hash="/login";return}navigator.onLine&&A(o,S),window.addEventListener("online",()=>{A(o,S)});const t=L.map("map").setView([-2.5,118],5);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(t);let r=null,a=null,e=null;t.on("click",i=>{r=i.latlng.lat,a=i.latlng.lng,e&&t.removeLayer(e),e=L.marker([r,a]).addTo(t),document.getElementById("locationInfo").textContent=`Lokasi: ${r.toFixed(5)}, ${a.toFixed(5)}`});const n=document.getElementById("video"),s=document.getElementById("canvas"),d=document.getElementById("photo");let u=null;document.getElementById("openCamera").onclick=async()=>{try{u=await navigator.mediaDevices.getUserMedia({video:!0}),n.srcObject=u,n.style.display="block",document.getElementById("capture").style.display="inline-block"}catch(i){console.error("Error accessing camera:",i),alert("Tidak dapat mengakses kamera: "+i.message)}},document.getElementById("capture").onclick=()=>{s.width=n.videoWidth,s.height=n.videoHeight,s.getContext("2d").drawImage(n,0,0),s.toBlob(i=>{const l=new File([i],"camera.jpg",{type:"image/jpeg"}),p=new DataTransfer;p.items.add(l),d.files=p.files}),u&&u.getTracks().forEach(i=>i.stop()),n.style.display="none",document.getElementById("capture").style.display="none"};const c=()=>{document.getElementById("description").value="",d.value=null,e&&(t.removeLayer(e),e=null),r=null,a=null,document.getElementById("locationInfo").textContent="Klik peta untuk memilih lokasi"};document.getElementById("addForm").onsubmit=async i=>{i.preventDefault();const l=document.getElementById("description").value,p=d.files[0],m=document.getElementById("message");if(document.getElementById("debug-info"),!l||!p){m.textContent="Deskripsi dan gambar wajib diisi";return}if(m.textContent="Mengirim cerita...",navigator.onLine)try{const g=await S(o,{description:l,photo:p,lat:r,lon:a});if(g.error){m.textContent=g.message||"Gagal mengirim cerita";return}m.textContent="Cerita berhasil ditambahkan! Anda dapat menambahkan cerita lagi.",c()}catch(g){console.error("Error sending story:",g),m.textContent="Terjadi kesalahan: "+(g.message||"Unknown error")}else try{const g=new FileReader;g.onload=async b=>{try{const f={name:p.name||"photo.jpg",type:p.type||"image/jpeg",data:b.target.result,lastModified:p.lastModified||Date.now()};console.log("Photo object created:",{name:f.name,type:f.type,size:f.data.byteLength}),(await K({description:l,photo:f,lat:r,lon:a})).success?(m.textContent="Cerita disimpan dan akan dikirim saat online! Anda dapat menambahkan cerita lagi.",c()):m.textContent="Gagal menyimpan cerita untuk pengiriman nanti."}catch(f){console.error("Error dalam callback reader:",f),m.textContent="Terjadi kesalahan saat memproses gambar: "+(f.message||"Unknown error")}},g.onerror=b=>{var f;m.textContent="Gagal memproses file gambar: "+(((f=b.target.error)==null?void 0:f.message)||"Unknown error")},g.readAsArrayBuffer(p)}catch(g){console.error("Error saving to queue:",g),m.textContent="Terjadi kesalahan saat menyimpan cerita: "+(g.message||"Unknown error")}}}},E={BASE_URL:"https://story-api.dicoding.dev/v1",VAPID_PUBLIC_KEY:"BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"},Q={async render(){return'<div id="detail"></div>'},async afterRender({id:o}){const t=w(),r=await fetch(`${E.BASE_URL}/stories/${o}`,{headers:{Authorization:`Bearer ${t}`}}),{story:a}=await r.json();document.getElementById("detail").innerHTML=`
      <h2>${a.name}</h2>
      <img src="${a.photoUrl}" width="300"/>
      <p>${a.description}</p>
    `}},B={"/login":U,"/register":F,"/home":W,"/add":V,"/detail/:id":Q};function J(o){const t="=".repeat((4-o.length%4)%4),r=(o+t).replace(/-/g,"+").replace(/_/g,"/"),a=atob(r);return Uint8Array.from([...a].map(e=>e.charCodeAt(0)))}async function Y(){const o=document.getElementById("notifToggle");if(!o)return;const t=await navigator.serviceWorker.ready,r=w(),a=await t.pushManager.getSubscription();o.checked=!!a,o.onchange=async()=>{if(o.checked){if(await Notification.requestPermission()!=="granted"){o.checked=!1;return}const n=await t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:J(E.VAPID_PUBLIC_KEY)});(await(await fetch(`${E.BASE_URL}/notifications/subscribe`,{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({endpoint:n.endpoint,keys:n.toJSON().keys})})).json()).error===!1?o.checked=!0:(await n.unsubscribe(),o.checked=!1)}else{const e=await t.pushManager.getSubscription();if(!e)return;(await(await fetch(`${E.BASE_URL}/notifications/subscribe`,{method:"DELETE",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({endpoint:e.endpoint})})).json()).error===!1?(await e.unsubscribe(),o.checked=!1):o.checked=!0}}}class X{constructor(){this.main=document.getElementById("main"),this.nav=document.getElementById("nav")}renderNav(){const t=M();this.nav.innerHTML=`
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:12px 20px;
      border-bottom:1px solid #eaeaea;
    ">
      <div style="display:flex; align-items:center; gap:16px;">
        ${t?`
              <a href="#/home" style="text-decoration:none;color:#333;font-weight:500;">
                Home
              </a>

              <a href="#/add" style="text-decoration:none;color:#333;font-weight:500;">
                Tambah
              </a>

              <label style="
                display:flex;
                align-items:center;
                gap:6px;
                cursor:pointer;
                font-size:14px;
                color:#444;
              ">
                <input type="checkbox" id="notifToggle" />
                <span>Notifikasi</span>
              </label>
            `:`
              <a href="#/login" style="text-decoration:none;color:#333;font-weight:500;">
                Login
              </a>
            `}
      </div>

      ${t?`
            <button id="logoutBtn" style="
              padding:6px 14px;
              border:none;
              border-radius:6px;
              background:#ef4444;
              color:white;
              cursor:pointer;
              font-weight:500;
            ">
              Logout
            </button>
          `:""}
    </div>
  `;const r=document.getElementById("logoutBtn");r&&r.addEventListener("click",R)}async render(){const t=location.hash.slice(1)||"/login";let r=B[t],a={};if(!r)for(const n of Object.keys(B)){if(!n.includes(":"))continue;const s=n.split("/"),d=t.split("/");if(s.length!==d.length)continue;let u=!0;const c={};if(s.forEach((i,l)=>{i.startsWith(":")?c[i.slice(1)]=d[l]:i!==d[l]&&(u=!1)}),u){r=B[n],a=c;break}}if(!r){location.hash="/home";return}this.renderNav();const e=async()=>{var n;this.main.innerHTML=await r.render(a),await((n=r.afterRender)==null?void 0:n.call(r,a)),Y()};document.startViewTransition?document.startViewTransition(e):await e()}}document.addEventListener("DOMContentLoaded",async()=>{if("serviceWorker"in navigator)try{await navigator.serviceWorker.register("/sw.js"),console.log("Service Worker registered")}catch(t){console.error("Service Worker gagal",t)}const o=new X;o.render(),window.addEventListener("hashchange",()=>{o.render()})});
