import"./style-B6hkL934.js";const E="",Q=window.location.host,k=document.getElementById("app"),c="kbd kbd-xl text-base sm:text-xl text-pink-200 bg-black h-20",re="kbd kbd-xl text-base sm:text-xl text-pink-200 bg-black h-20",se="kbd kbd-xl text-base sm:text-xl text-pink-200 bg-black font-bold w-16 sm:w-[73px] h-20",X=15;let f=null,u=null,K=!1,_=!1,G=!1,b=null,N=null,L=Promise.resolve(),F=!1,T=null,R=null,q=[];function C(t){return{...t,players:t.players.map(e=>({...e,gameScore:typeof e.gameScore=="number"?e.gameScore:0,totalScore:typeof e.totalScore=="number"?e.totalScore:0})),currentTurn:t.currentTurn?{...t.currentTurn,gameScore:typeof t.currentTurn.gameScore=="number"?t.currentTurn.gameScore:0,totalScore:typeof t.currentTurn.totalScore=="number"?t.currentTurn.totalScore:0}:null}}function ae(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function oe(){return localStorage.getItem("refactor-recent-room-name")}function U(t,e){localStorage.setItem("refactor-recent-room",t),localStorage.setItem("refactor-recent-room-name",e)}function A(){return new URLSearchParams(window.location.search).get("room")}function w(){const t=localStorage.getItem("refactor-chat-user");if(t)return JSON.parse(t);const e={username:`Player${Math.floor(Math.random()*900+100)}`,userId:crypto.randomUUID()};return localStorage.setItem("refactor-chat-user",JSON.stringify(e)),e}function O(t){const e=t.trim().slice(0,X);if(!e)throw new Error("Username is required");const n=w(),r={username:e,userId:n.userId};return localStorage.setItem("refactor-chat-user",JSON.stringify(r)),r}function ie(t,e){const n=localStorage.getItem("refactor-room-memberships"),r=n?JSON.parse(n):{};r[t]=e,localStorage.setItem("refactor-room-memberships",JSON.stringify(r))}function y(t){const e=localStorage.getItem("refactor-room-memberships");return e?JSON.parse(e)[t]??null:null}function le(t,e=!1){const n=w(),r=ae(t),s=!e&&t?`<p class="mt-2 text-sm italic text-black/70">Recent room: <span class="font-bold">${r}</span></p>`:"";return`
    <div id="toastContainer" class="toast toast-top toast-center z-50"></div>
    <div class="flex flex-col gap-6">
      <div class="bg-transparent p-1 sm:p-4 flex flex-row items-center justify-start">
        <h1 class="text-2xl sm:text-4xl font-bold text-center text-black italic mx-auto">WORDLE</h1>
      </div>

      <div class="bg-white/70 border border-black rounded-md p-6 text-center text-black w-full">
        <p class="text-lg font-bold">Multiplayer</p>
        <p class="mt-2 italic">${e?"Choose your username and join the room you were invited to.":"Create a room or join an existing one with your chosen username."}</p>
        ${s}
        <div class="mt-6 flex flex-col gap-6 justify-center items-center">
          <label class="floating-label">
            <input
              id="username-input"
              class="input input-bordered input-xs sm:input-sm md:input-md lg:input-lg xl:input-xl bg-white text-black"
              value="${n.username}"
              placeholder="Username"
              maxlength="${X}"
              type="text" />
            <span class="bg-white rounded-lg border border-pink-300 p-1 italic">Username</span>
          </label>
          <div class="flex flex-col gap-3 justify-center items-center mx-auto">
          <label class="floating-label w-full">
            <input
              id="room-id-input"
              class="input input-bordered bg-white text-center input-xs sm:input-sm md:input-md lg:input-lg xl:input-xl text-black"
              value="${r}"
              placeholder="Room name"
              ${e?"readonly":""} />
            <span class="bg-white rounded-lg border border-pink-300 p-1 italic">Room Name</span>
          </label>
          ${e?"":'<button id="create-room-btn" class="btn bg-black text-pink-300 mx-auto">Create New Room</button>'}
            <button id="open-room-btn" class="btn bg-black text-pink-300">${e?"Join Room":"Join Existing Room"}</button>
          </div>
        </div>
        <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="../multi_player_refactor/" class="btn bg-black text-pink-300 w-36 mx-auto">Reset</a>
        </div>
      </div>
    </div>
  `}function ce(){let t="";for(let e=0;e<6;e++)for(let n=0;n<5;n++)t+=`
        <div
          id="cell-${e}-${n}"
          class="word-row bg-black row-start-${e+1} w-[56px] h-[56px] sm:w-16 sm:h-16 flex items-center border-2 sm:border-3 border-white justify-center text-3xl sm:text-4xl font-bold text-pink-300"
        ></div>
      `;return t}function de(){return`
    <div id="toastContainer" class="toast toast-top toast-center z-50"></div>

    <div class="bg-transparent p-1 sm:p-4 flex flex-row items-center justify-start">
      <h1 class="text-2xl font-bold text-center text-black italic sm:hidden ml-1">WORDLE</h1>
      <h1 class="text-2xl sm:text-4xl font-bold text-center text-black italic mx-auto hidden sm:flex">WORDLE</h1>
    </div>

    <div id="chatBar" class="collapse bg-white absolute right-2 top-2 w-24 sm:w-80 text-pink-300 z-50">
      <input id="arrowBar" type="checkbox" />
      <div class="collapse-title text-xl font-medium">
        <div class="flex flex-row justify-start lg:justify-between">
          <div class="flex items-center gap-2">
            <span>Chat</span>
            <span
              id="unreadChatIndicator"
              class="unread-chat-indicator hidden"
              role="status"
              aria-label="Unread chat message"
              title="Unread chat message"
            ></span>
          </div>
          <div id="arrowDown" class="text-xl font-bold">&#9660;</div>
          <div id="arrowUp" class="text-xl font-bold hidden">&#9650;</div>
        </div>
      </div>
      <div class="collapse-content">
        <div id="textMessages" class="flex w-full pb-2 h-80 flex-col overflow-y-scroll flex-grow-0"></div>
        <div class="flex flex-row justify-end mt-auto gap-2">
          <input id="textMessageInput" type="text" placeholder="message..." class="input input-bordered w-[220px] bg-transparent" />
          <div id="sendTextBtn" class="btn w-16 bg-white text-pink-300 border-none hover:btn-pink hover:text-white">Send</div>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center py-4 gap-2 sm:w-3/4 lg:w-1/2  2xl:w-1/3 mx-auto">
      <span class="text-black italic font-bold">Players:</span>
  <!--    <div id="userTurn" class="mt-3 min-h-8 rounded-md bg-white/80 px-4 py-2 text-xl text-black font-bold"></div> -->
      <div id="playerQueue" class="mt-3 flex flex-col gap-2 w-full max-w-xs"></div>
    </div>

    <div id="mainTainer" class="grid grid-rows-6 grid-cols-5 place-items-center mx-auto gap-none sm:gap-1 w-fit">
      ${ce()}
    </div>

    <div class="w-full pt-2 sm:mt-10">
      <div class="my-1 flex justify-center gap-[1px] sm:gap-1 sm:text-xl font-bold select-none">
        <kbd data-key="Q" class="${c}">Q</kbd>
        <kbd data-key="W" class="${c}">W</kbd>
        <kbd data-key="E" class="${c}">E</kbd>
        <kbd data-key="R" class="${c}">R</kbd>
        <kbd data-key="T" class="${c}">T</kbd>
        <kbd data-key="Y" class="${c}">Y</kbd>
        <kbd data-key="U" class="${c}">U</kbd>
        <kbd data-key="I" class="${c}">I</kbd>
        <kbd data-key="O" class="${c}">O</kbd>
        <kbd data-key="P" class="${c}">P</kbd>
      </div>
      <div class="my-1 flex w-full justify-center gap-[1px] sm:gap-1 sm:text-xl font-bold select-none">
        <kbd data-key="A" class="${c}">A</kbd>
        <kbd data-key="S" class="${c}">S</kbd>
        <kbd data-key="D" class="${c}">D</kbd>
        <kbd data-key="F" class="${c}">F</kbd>
        <kbd data-key="G" class="${c}">G</kbd>
        <kbd data-key="H" class="${c}">H</kbd>
        <kbd data-key="J" class="${c}">J</kbd>
        <kbd data-key="K" class="${c}">K</kbd>
        <kbd data-key="L" class="${c}">L</kbd>
      </div>
      <div class="my-1 flex w-full justify-center gap-[1px] sm:gap-1 sm:text-xl font-bold select-none">
        <kbd id="enter" class="${re}">Enter</kbd>
        <kbd data-key="Z" class="${c}">Z</kbd>
        <kbd data-key="X" class="${c}">X</kbd>
        <kbd data-key="C" class="${c}">C</kbd>
        <kbd data-key="V" class="${c}">V</kbd>
        <kbd data-key="B" class="${c}">B</kbd>
        <kbd data-key="N" class="${c}">N</kbd>
        <kbd data-key="M" class="${c}">M</kbd>
        <kbd id="backspace" class="${se}">&lBarr;</kbd>
      </div>
    </div>

    <div id="gameStatusPanel" class="mt-4 mb-24 bg-white/80 border border-black rounded-md p-4 text-black lg:w-1/2 mx-auto"></div>

    <dialog id="gameOverModal" class="modal text-black">
      <div class="modal-box bg-white border-4 border-pink-200">
        <h3 id="gameOverModalTitle" class="text-xl font-bold text-green-400">Game Over</h3>
        <p class="py-4">The word was: <span class="text-2xl sm:text-4xl text-pink-200 font-bold" id="gameOverWord"></span>!</p>
        <p class="text-lg font-bold text-green-400">Definition:</p>
        <p id="gameOverDefinition" class="py-1"></p>
        <div class="mt-4">
          <div class="font-bold text-black mb-2">Final Scores</div>
          <div id="modalScoreList" class="flex flex-col gap-2"></div>
        </div>
        <div class="mt-4">
          <div class="font-bold text-black mb-2">Restart Confirmations</div>
        <div id="modalResetVoteList" class="flex flex-col gap-2"></div>
        </div>
        <div class="mt-4 flex flex-col sm:flex-row gap-3">
          <label class="label cursor-pointer justify-start gap-4">
            <input id="modal-reset-vote-checkbox" type="checkbox" class="checkbox border-pink-300 [--chkbg:theme(colors.pink.300)] [--chkfg:black]" />
            <span class="label-text text-black">Vote To Restart Game</span>
          </label>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn bg-white text-black border-4 border-pink-200 hover:text-pink-200">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  `}function B(t=oe()??"",e=!1){k&&(N=null,b=null,k.className="bg-transparent w-full min-h-screen sm:w-3/4 mx-auto p-0 sm:p-1 pb-10",k.innerHTML=le(t,e),fe())}function me(){k&&(k.className="bg-transparent w-full min-h-screen sm:w-3/4 mx-auto p-0 sm:p-1 pb-10",k.innerHTML=de(),Le(),ve(),Ee(),Ie(),$e())}function S(t){k&&(k.className="bg-transparent w-full min-h-screen sm:w-3/4 mx-auto p-4 sm:p-6",k.innerHTML=`
    <div class="bg-white/80 border border-red-600 rounded-md p-6 text-center text-black">
      <h1 class="text-xl font-bold text-red-600">Refactor Multiplayer</h1>
      <p class="mt-3">${t}</p>
      <div class="mt-6">
        <a href="../multi_player_refactor/" class="btn bg-black text-pink-300">Back To Refactor</a>
      </div>
    </div>
  `)}function P(t){const e="word-row w-[56px] h-[56px] sm:w-16 sm:h-16 flex items-center border-2 sm:border-3 justify-center text-3xl sm:text-4xl font-bold";switch(t){case"correct":return`${e} bg-green-200 border-green-200 text-black`;case"present":return`${e} bg-yellow-200 border-yellow-200 text-black`;case"miss":return`${e} bg-slate-500 border-slate-500 text-white`;default:return`${e} bg-black border-white text-pink-300`}}function Z(t,e){const n=t==="ENTER"?"kbd kbd-xl bg-black text-pink-200 h-20":t==="BACKSPACE"?"kbd kbd-xl bg-black text-pink-200 font-bold w-16 sm:w-[73px] h-20":"kbd kbd-xl bg-black text-pink-200 h-20";return e==="correct"?`${n} bg-green-200 text-black`:e==="present"?`${n} bg-yellow-200 text-black`:e==="miss"?`${n} bg-slate-500 text-white`:n}function ue(t,e){var a;const n=b;b=t,J();const r=document.getElementById("userTurn");r&&(r.textContent=$(t.status)?"Game Over":((a=t.currentTurn)==null?void 0:a.username)??"Waiting..."),Re(t),t.board.rows.forEach((i,o)=>{const l=(e==null?void 0:e.revealRowIndex)===o;i.cells.forEach((d,m)=>{var h,v;const p=document.getElementById(`cell-${o}-${m}`);if(!p)return;const x=((v=(h=n==null?void 0:n.board.rows[o])==null?void 0:h.cells[m])==null?void 0:v.letter)??"";l?(p.className=P("empty"),p.innerHTML=d.letter||""):(p.className=P(d.status),p.innerHTML=d.letter||""),d.letter!==x&&d.letter&&(p.classList.add("animate-pulse"),window.setTimeout(()=>p.classList.remove("animate-pulse"),250))})}),Array.from(document.querySelectorAll(".kbd")).forEach(i=>{var d,m;const o=((d=i.dataset.key)==null?void 0:d.toUpperCase())??(i.id==="enter"?"ENTER":i.id==="backspace"?"BACKSPACE":((m=i.textContent)==null?void 0:m.trim().toUpperCase())??"");if(!o)return;const l=o==="ENTER"||o==="BACKSPACE"?void 0:t.board.keyboard[o];(e==null?void 0:e.revealRowIndex)==null?(i.className=Z(o,l),i.style.color=l==="correct"||l==="present"?"black":l==="miss"?"white":""):(o==="ENTER"||o==="BACKSPACE")&&(i.style.color="")}),(e==null?void 0:e.revealRowIndex)!=null&&(L=L.then(()=>ke(t,e.revealRowIndex))),he(t),Te(t),Me(t)}async function ee(t){const e=await fetch(`${E}/api/rooms/${t}`);if(!e.ok)throw new Error(`Failed to load room snapshot (${e.status})`);return C(await e.json())}async function be(t){const e=new URLSearchParams({roomName:t}),n=await fetch(`${E}/api/rooms/by-name?${e}`);if(!n.ok)throw new Error(`Failed to load room snapshot (${n.status})`);return C(await n.json())}async function j(t,e){const n=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:e?JSON.stringify(e):void 0});if(!n.ok){const r=await n.text();throw new Error(r||`Request failed (${n.status})`)}return C(await n.json())}function D(t,e,n){const r=n.players.find(s=>s.username===e);r&&ie(t,r.playerId)}function fe(){var t,e;(t=document.getElementById("create-room-btn"))==null||t.addEventListener("click",async()=>{var n,r;try{const s=document.getElementById("username-input"),a=O((s==null?void 0:s.value)??""),i=(r=(n=document.getElementById("room-id-input"))==null?void 0:n.value)==null?void 0:r.trim();if(!i){g("Enter a room name.");return}const o=await j(`${E}/api/rooms`,{roomName:i,hostUsername:a.username});D(o.roomId,a.username,o),U(o.roomId,o.roomName),window.history.replaceState({},"",`${window.location.pathname}?room=${o.roomId}`),I(o)}catch(s){const a=s instanceof Error?s.message:"Unable to create room";if(a.toLowerCase().includes("already exists")||a.includes("(409)")){g("That room already exists, try another name");return}g(a.toLowerCase().includes("room name")?a:"Unable to create room right now.")}}),(e=document.getElementById("open-room-btn"))==null||e.addEventListener("click",async()=>{var n,r;try{const s=document.getElementById("username-input"),a=O((s==null?void 0:s.value)??""),i=(r=(n=document.getElementById("room-id-input"))==null?void 0:n.value)==null?void 0:r.trim(),o=A();if(!i&&!o)throw new Error("Room name is required");const l=i?await be(i):await ee(o),d=l.roomId,m=y(d),x=(m?l.players.some(h=>h.playerId===m):!1)?l:await j(`${E}/api/rooms/${d}/join`,{username:a.username});D(x.roomId,a.username,x),U(x.roomId,x.roomName),window.history.replaceState({},"",`${window.location.pathname}?room=${x.roomId}`),I(x)}catch(s){const a=s instanceof Error?s.message:"Unable to open room";if(a.includes("(404)")){g("That room does not exist. Click Create Room instead.");return}if(a.toLowerCase().includes("room is full")){g("That room is full.");return}if(a.toLowerCase().includes("username already exists")){g("That username is already taken in this room.");return}g("Unable to join that room right now.")}})}function g(t){const e=document.getElementById("toastContainer");if(!e)return;const n=document.createElement("div");n.className="alert border border-red-500 bg-white text-red-500 shadow-lg",n.innerHTML=`<span class="font-bold">${t}</span>`,e.appendChild(n),window.setTimeout(()=>{n.remove()},4e3)}function I(t){N!==t.roomId&&(me(),N=t.roomId,pe(t.roomId),xe(t.roomId),b=null);const n=ge(b,t);ue(t,{revealRowIndex:n}),console.log("Multiplayer room word:",t.debugWord)}function pe(t){if(f&&f.readyState===WebSocket.OPEN){if(new URL(f.url).searchParams.get("room")===t)return;f.close()}const e=w(),n=window.location.protocol==="https:"?"wss":"ws";f=new WebSocket(`${n}://${Q}/ws/chat?room=${t}`),f.addEventListener("open",()=>{f==null||f.send(JSON.stringify({type:"join",username:e.username,userId:e.userId,message:`${e.username} joined the room`}))}),f.addEventListener("message",r=>{const s=JSON.parse(r.data);Se(s),Ue(s)})}function xe(t){if(u&&u.readyState===WebSocket.OPEN){if(new URL(u.url).searchParams.get("room")===t)return;u.close()}const e=y(t);if(!e)return;const n=window.location.protocol==="https:"?"wss":"ws";u=new WebSocket(`${n}://${Q}/ws/game?room=${t}&userId=${encodeURIComponent(e)}`),u.addEventListener("message",r=>{const s=JSON.parse(r.data);s.snapshot=C(s.snapshot),I(s.snapshot),s.type==="invalidGuess"&&window.setTimeout(()=>Ce(s.snapshot),0),s.pointsAwarded>0&&s.scoringUsername&&Ae(s.scoringUsername,s.pointsAwarded)})}function ge(t,e){if(!t)return null;for(let n=0;n<e.board.rows.length;n++){const r=t.board.rows[n],s=e.board.rows[n],a=r.cells.every(l=>l.status==="empty"),i=s.cells.some(l=>l.status!=="empty"),o=s.cells.every((l,d)=>l.letter===r.cells[d].letter);if(a&&i&&o)return n}return null}async function ke(t,e){const n=t.board.rows[e];for(let r=0;r<n.cells.length;r++){const s=n.cells[r],a=document.getElementById(`cell-${e}-${r}`);a&&(a.classList.add("box"),await we(500),a.className=P(s.status),a.innerHTML=s.letter||"",a.classList.remove("box"),ye(s))}}function ye(t){const e=W(t.letter);e&&(e.className=Z(t.letter,t.status),e.style.color=t.status==="correct"||t.status==="present"?"black":t.status==="miss"?"white":"")}function we(t){return new Promise(e=>{window.setTimeout(e,t)})}function he(t){if(document.querySelectorAll(".current-cell-spinner").forEach(o=>{o.classList.remove("current-cell-spinner")}),document.querySelectorAll(".current-cell-trace").forEach(o=>{o.remove()}),$(t.status))return;const e=t.board.activeRowIndex,n=t.board.rows[e];if(!n)return;const r=n.cells.findIndex(o=>!o.letter),s=r>=0?r:n.cells.length-1,a=document.getElementById(`cell-${e}-${s}`);if(!a)return;a.classList.add("current-cell-spinner");const i=document.createElement("span");i.className="current-cell-trace",i.setAttribute("aria-hidden","true"),i.innerHTML=`
    <svg viewBox="0 0 72 72" preserveAspectRatio="none">
      <rect x="3" y="3" width="66" height="66"></rect>
    </svg>
  `,a.appendChild(i)}function ve(){K||(document.addEventListener("mousedown",t=>{const e=t.target;e!=null&&e.classList.contains("kbd")&&M()&&e.classList.add("bg-pink-200")}),document.addEventListener("mouseup",t=>{const e=t.target;e!=null&&e.classList.contains("kbd")&&e.classList.remove("bg-pink-200")}),document.addEventListener("keydown",t=>{var r;const e=t.target;if((e==null?void 0:e.id)==="textMessageInput"||(e==null?void 0:e.id)==="username-input"||(e==null?void 0:e.id)==="room-id-input"||!M())return;const n=H(t.key);n&&((r=W(n))==null||r.classList.add("bg-pink-200"))}),document.addEventListener("keyup",t=>{var r;const e=t.target;if((e==null?void 0:e.id)==="textMessageInput"||(e==null?void 0:e.id)==="username-input"||(e==null?void 0:e.id)==="room-id-input"||!M())return;const n=H(t.key);n&&((r=W(n))==null||r.classList.remove("bg-pink-200"))}),K=!0)}function Ee(){G||(document.addEventListener("keydown",t=>{const e=t.target;if((e==null?void 0:e.id)==="textMessageInput"||(e==null?void 0:e.id)==="username-input"||(e==null?void 0:e.id)==="room-id-input")return;const n=H(t.key);n&&z(n)}),document.addEventListener("click",t=>{var r;const e=t.target;if(!(e!=null&&e.classList.contains("kbd")))return;const n=((r=e.dataset.key)==null?void 0:r.toUpperCase())??(e.id==="enter"?"ENTER":e.id==="backspace"?"BACKSPACE":null);n&&z(n)}),G=!0)}function z(t){var r;if(!u||u.readyState!==WebSocket.OPEN||!b)return;const e=b.roomId,n=y(e);if(!(!n||((r=b.currentTurn)==null?void 0:r.playerId)!==n)){if(t==="ENTER"){J(),u.send(JSON.stringify({type:"submit",userId:n,letter:""}));return}if(t==="BACKSPACE"){J(),u.send(JSON.stringify({type:"backspace",userId:n,letter:""}));return}u.send(JSON.stringify({type:"append",userId:n,letter:t}))}}function H(t){const e=t.toUpperCase();return e==="BACKSPACE"?"BACKSPACE":e==="ENTER"?"ENTER":e.length===1&&e>="A"&&e<="Z"?e:null}function W(t){return Array.from(document.querySelectorAll(".kbd")).find(e=>{var r;const n=(r=e.dataset.key)==null?void 0:r.toUpperCase();return n?n===t:e.id.toUpperCase()===t})}function J(){document.querySelectorAll(".kbd").forEach(t=>{t.classList.remove("bg-pink-200")})}function Ie(){_||(document.addEventListener("click",t=>{const e=t.target;(e==null?void 0:e.id)==="sendTextBtn"&&V()}),document.addEventListener("keydown",t=>{const e=t.target;(e==null?void 0:e.id)==="textMessageInput"&&t.key==="Enter"&&V()}),_=!0)}function $e(){F||(document.addEventListener("click",async t=>{const e=t.target;if(e){if(e.id==="copy-room-link-btn"){if(!b)return;const n=`${window.location.origin}/multi_player_refactor/?room=${b.roomId}`;try{await navigator.clipboard.writeText(n);const r=e.textContent;e.textContent="Copied",window.setTimeout(()=>{e.textContent=r??"Copy Room Link"},1200)}catch{S("Unable to copy room link")}return}if(e.id==="update-username-btn"){try{if(!b||!u||u.readyState!==WebSocket.OPEN)return;const n=y(b.roomId);if(!n)return;const r=w(),s=window.prompt("Update your username",r.username);if(s==null)return;const a=O(s);u.send(JSON.stringify({type:"renameUser",userId:n,letter:"",username:a.username}))}catch(n){S(n instanceof Error?n.message:"Unable to update username")}return}if(e.id==="inline-reset-vote-checkbox"||e.id==="modal-reset-vote-checkbox"){const n=e;try{if(!b||!u||u.readyState!==WebSocket.OPEN)return;const r=y(b.roomId);if(!r)return;u.send(JSON.stringify({type:"resetVote",userId:r,letter:"",confirmed:n.checked}))}catch(r){S(r instanceof Error?r.message:"Unable to update reset vote")}}}}),F=!0)}function V(){var r;const t=document.getElementById("textMessageInput"),e=(r=t==null?void 0:t.value)==null?void 0:r.trim();if(!f||f.readyState!==WebSocket.OPEN||!t||!e)return;const n=w();f.send(JSON.stringify({type:"chat",username:n.username,userId:n.userId,message:e})),t.value=""}function Se(t){var l,d;const e=document.getElementById("textMessages");if(!e)return;const n=w(),r=t.userId===n.userId,s=((l=document.getElementById("arrowBar"))==null?void 0:l.checked)??!1;t.type==="chat"&&!r&&!s&&((d=document.getElementById("unreadChatIndicator"))==null||d.classList.remove("hidden"));const a=t.type==="join"||t.type==="leave"?"chat-bubble bg-white text-pink-300 border border-pink-300":r?"chat-bubble bg-pink-300 text-white":"chat-bubble bg-green-300 text-white",i=t.type==="join"||t.type==="leave"?"chat chat-center":r?"chat chat-start":"chat chat-end",o=document.createElement("div");o.innerHTML=`
    <div class="${i}">
      <div class="${a}"><span class="font-bold">${t.username}</span>: ${t.message}</div>
    </div>
  `,e.appendChild(o),e.scrollTo(0,e.scrollHeight)}function Le(){var t,e;(t=document.querySelector(".collapse"))==null||t.addEventListener("click",()=>{var n;(n=document.getElementById("sendTextBtn"))==null||n.classList.toggle("fadeIn")}),(e=document.getElementById("arrowBar"))==null||e.addEventListener("change",n=>{var a,i,o;const r=n.target,s=r.parentElement;s&&(window.innerWidth<1024&&(s.classList.contains("w-24")?s.classList.replace("w-24","w-80"):s.classList.replace("w-80","w-24")),(a=document.getElementById("arrowUp"))==null||a.classList.toggle("hidden"),(i=document.getElementById("arrowDown"))==null||i.classList.toggle("hidden"),r.checked&&((o=document.getElementById("unreadChatIndicator"))==null||o.classList.add("hidden")))})}function Ce(t){const e=t.board.activeRowIndex;for(let n=0;n<t.wordLength;n++){const r=document.getElementById(`cell-${e}-${n}`);r==null||r.classList.add("animate-wiggle"),window.setTimeout(()=>r==null?void 0:r.classList.remove("animate-wiggle"),1e3)}}function Te(t){const e=document.getElementById("gameStatusPanel");if(!e)return;const n=t.players.filter(m=>t.resetConfirmedPlayerIds.includes(m.playerId)).map(m=>m.username),r=y(t.roomId),s=r?t.resetConfirmedPlayerIds.includes(r):!1,a=$(t.status),i=t.status==="COMPLETED"?"Solved!":t.status==="FAILED"?"Out Of Guesses":"Restart Game",o=t.status==="COMPLETED"?"The puzzle was solved.":t.status==="FAILED"?"The room ran out of rows.":"",l=a&&t.wordDefinition.length?t.wordDefinition.map(m=>`<span class="italic">${ne(m)}</span>`).join("<br>"):"",d=n.length?n.join(", "):"No confirmations yet";e.innerHTML=`
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="text-xl font-bold">${i}</div>
        ${o?`<div>${o}</div>`:""}
        ${a?`<div><span class="font-bold">Word:</span> ${t.revealedWord??"Unknown"}</div>`:""}
        ${a?`<div><div class="font-bold">Definition</div><div>${l||"Definition unavailable"}</div></div>`:""}
        <div>
          <div class="font-bold">Vote To Restart Game</div>
          <div>${d}</div>
          <div id="inlineResetVoteList" class="mt-2 flex flex-col gap-1"></div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <label class="label cursor-pointer justify-start gap-4">
            <input id="inline-reset-vote-checkbox" type="checkbox" class="checkbox border-pink-300 bg-white [--chkbg:theme(colors.pink.300)] [--chkfg:black]" ${s?"checked":""} />
            <span class="label-text text-black">Vote To Restart Game</span>
          </label>
        </div>
      </div>
      <div class="flex flex-col gap-2 sm:ml-auto sm:w-auto sm:items-end justify-center">
        <button id="copy-room-link-btn" class="btn btn-static btn-sm bg-white px-3 text-black border border-black">Copy Room Link</button>
        <button id="update-username-btn" class="btn btn-static btn-sm bg-white px-3 text-black border border-black">Update Username</button>
        <a href="../multi_player_refactor/" class="btn btn-static btn-sm bg-black text-pink-300">Leave Room</a>
      </div>
    </div>
  `,te(t)}function $(t){return t==="COMPLETED"||t==="FAILED"}function M(){var e;if(!b)return!1;const t=y(b.roomId);return!!(t&&((e=b.currentTurn)==null?void 0:e.playerId)===t)}function Re(t){var i;const e=document.getElementById("playerQueue");if(!e)return;const n=[...t.players].sort((o,l)=>o.turnOrder-l.turnOrder);e.className="mt-3 flex w-full flex-col gap-2";const r=R;e.innerHTML=n.map((o,l)=>{var x;const d=((x=t.currentTurn)==null?void 0:x.playerId)===o.playerId,m=n.findIndex(h=>{var v;return h.playerId===((v=t.currentTurn)==null?void 0:v.playerId)}),p=l===m?"Current":l===(m+1)%n.length?"Next":"";return`
      <div data-player-pill="${o.playerId}" class="flex items-center justify-between rounded-md border px-4 py-2 transition-all duration-500 ease-out overflow-hidden ${d?"border-pink-300 bg-white shadow-sm opacity-100":"border-black bg-white/70 opacity-70"}">
        <span class="min-w-0 truncate font-bold text-lg p-4 ${d?"text-pink-300":"text-black"}">${o.username}</span>
        <div class="ml-4 flex shrink-0 items-center gap-3">
          <span class="text-xs font-bold text-black p-4">${o.gameScore} game • ${o.totalScore} total</span>
          ${p?`<span class="rounded-full p-4 text-[11px] font-semibold uppercase tracking-[0.18em] ${d?"bg-pink-100 text-black":" text-black"}">${p}</span>`:""}
        </div>
      </div>
    `}).join("");const s=((i=t.currentTurn)==null?void 0:i.playerId)??null;if(!(n.map(o=>o.playerId).join("|")!==q.join("|"))&&s&&r&&s!==r){const o=document.querySelector(`[data-player-pill="${r}"]`),l=document.querySelector(`[data-player-pill="${s}"]`);o==null||o.animate([{opacity:1,transform:"scale(1)",filter:"brightness(1)"},{opacity:.7,transform:"scale(1)",filter:"brightness(0.98)"}],{duration:1500,easing:"cubic-bezier(0.22, 1, 0.36, 1)"}),l==null||l.animate([{opacity:.7,transform:"scale(1)",filter:"brightness(0.98)"},{opacity:1,transform:"scale(1)",filter:"brightness(1)"}],{duration:1500,easing:"cubic-bezier(0.22, 1, 0.36, 1)"})}if(s&&s!==R){const o=document.querySelector(`[data-player-pill="${s}"]`);o==null||o.animate([{opacity:.3,transform:"translateY(4px)"},{opacity:1,transform:"translateY(0)"}],{duration:1500,easing:"cubic-bezier(0.22, 1, 0.36, 1)"})}R=s,q=n.map(o=>o.playerId)}function Be(t){const n=[...t.players].sort((s,a)=>a.gameScore-s.gameScore||a.totalScore-s.totalScore||s.turnOrder-a.turnOrder).map((s,a)=>`
    <div class="flex items-center justify-between rounded-md border ${a===0?"border-pink-300 bg-white":"border-black bg-white/70"}">
      <div class="flex items-center gap-3 p-3">
        <span class="text-sm font-bold p-2 ${a===0?"text-pink-300":"text-black"}">#${a+1}</span>
        <span class="font-bold text-black">${s.username}</span>
      </div>
      <div class="p-2 text-right">
        <div class="text-sm font-bold text-black">${s.gameScore} game pts</div>
        <div class="text-xs text-black/70">${s.totalScore} total pts</div>
      </div>
    </div>
  `).join(""),r=document.getElementById("modalScoreList");r&&(r.innerHTML=n)}function te(t){const e=t.players.map(s=>`
      <label class="label cursor-default justify-start gap-4">
        <input type="checkbox" class="checkbox border-pink-300 bg-white [--chkbg:theme(colors.pink.300)] [--chkfg:black]" ${t.resetConfirmedPlayerIds.includes(s.playerId)?"checked":""} disabled />
        <span class="label-text text-black">${s.username}</span>
      </label>
    `).join(""),n=document.getElementById("inlineResetVoteList");n&&(n.innerHTML=e);const r=document.getElementById("modalResetVoteList");r&&(r.innerHTML=e)}function Me(t){const e=document.getElementById("gameOverModal");if(!e)return;const n=document.getElementById("gameOverModalTitle"),r=document.getElementById("gameOverWord"),s=document.getElementById("gameOverDefinition"),a=document.getElementById("modal-reset-vote-checkbox"),i=y(t.roomId);n&&(n.textContent=t.status==="COMPLETED"?"You got it!":t.status==="FAILED"?"Nice try!":"Restart Game"),r&&(r.textContent=t.revealedWord??t.status),s&&(s.innerHTML=t.wordDefinition.length?t.wordDefinition.map(l=>`<span class="italic">${ne(l)}</span>`).join(" "):"Definition unavailable"),a&&i&&(a.checked=t.resetConfirmedPlayerIds.includes(i)),te(t),Be(t);const o=`${t.roomId}:${t.status}:${t.revealedWord??""}`;$(t.status)&&o!==T&&(L=L.then(async()=>{t.status==="COMPLETED"&&Ne(),e.open||e.showModal()}),T=o),$(t.status)||(T=null,e.open&&e.close())}function Ne(){if(!confetti)return;const t=15*1e3,e=Date.now()+t,n={startVelocity:30,spread:360,ticks:60,zIndex:0},r=window.setInterval(()=>{const s=e-Date.now();if(s<=0){window.clearInterval(r);return}const a=50*(s/t);confetti({...n,particleCount:a,origin:{x:Y(.1,.3),y:Math.random()-.2}}),confetti({...n,particleCount:a,origin:{x:Y(.7,.9),y:Math.random()-.2}})},250)}function Y(t,e){return Math.random()*(e-t)+t}function Ue(t){if(t.type!=="join"&&t.type!=="leave")return;const e=w();if(t.userId===e.userId)return;const n=document.getElementById("toastContainer");if(!n)return;const r=document.createElement("div");r.className="alert bg-white border border-pink-300 text-pink-300 shadow-lg",r.innerHTML=`<span>${t.type==="join"?`<span class="text-black">${t.username}</span> has entered the game`:`<span class="text-black">${t.username}</span> has left the game`}</span>`,n.appendChild(r),window.setTimeout(()=>{r.remove()},2750)}function Ae(t,e){const n=document.getElementById("toastContainer");if(!n)return;const r=document.createElement("div");r.className="alert border-2 border-pink-300 bg-white text-black shadow-lg",r.innerHTML=`
    <div class="flex items-center">
      <span class="font-bold">${t}&nbsp;</span>
      <span class="text-xl font-extrabold">+</span>
      <span class="text-xl font-extrabold text-green-300">${e}</span>
      <span class="font-bold">&nbsp;points!</span>
    </div>
  `,n.appendChild(r),window.setTimeout(()=>{r.remove()},2600)}function ne(t){const e=t.trim();if(!e)return e;const n=e.endsWith(".")?e:`${e}.`;return`${n.charAt(0).toUpperCase()}${n.slice(1)}`}async function Oe(){try{const t=A();if(!t){B();return}const e=w(),n=y(t),r=await ee(t);if(U(t,r.roomName),n&&r.players.some(i=>i.playerId===n)){I(r);return}if(!r.players.some(a=>a.username.toLowerCase()===e.username.toLowerCase())){const a=await j(`${E}/api/rooms/${t}/join`,{username:e.username});D(a.roomId,e.username,a),I(a);return}B(r.roomName,!0),g("That room is already using your saved username. Update it to join.")}catch(t){const e=t instanceof Error?t.message:"Unknown error";if(e.includes("(404)")){B("",!!A()),g("That room no longer exists.");return}S(e)}}Oe();
