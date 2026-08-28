import"./style-Ch3AZ-Gy.js";const L="",Q=window.location.host,g=document.getElementById("app"),c="kbd text-base sm:text-xl text-pink-200 bg-black h-20",se="kbd text-base sm:text-xl text-pink-200 bg-black h-20",ae="kbd text-base sm:text-xl text-pink-200 bg-black font-bold w-16 sm:w-[73px] h-20",X=15;let f=null,m=null,_=!1,K=!1,G=!1,b=null,O=null,C=Promise.resolve(),F=!1,T=null,R=null,q=[];function J(e){return{...e,players:e.players.map(t=>({...t,gameScore:typeof t.gameScore=="number"?t.gameScore:0,totalScore:typeof t.totalScore=="number"?t.totalScore:0})),currentTurn:e.currentTurn?{...e.currentTurn,gameScore:typeof e.currentTurn.gameScore=="number"?e.currentTurn.gameScore:0,totalScore:typeof e.currentTurn.totalScore=="number"?e.currentTurn.totalScore:0}:null}}function Z(){return`room_${Math.random().toString(36).slice(2,11)}`}function oe(){return localStorage.getItem("refactor-recent-room")}function U(e){localStorage.setItem("refactor-recent-room",e)}function S(){return new URLSearchParams(window.location.search).get("room")}function y(){const e=localStorage.getItem("refactor-chat-user");if(e)return JSON.parse(e);const t={username:`Player${Math.floor(Math.random()*900+100)}`,userId:crypto.randomUUID()};return localStorage.setItem("refactor-chat-user",JSON.stringify(t)),t}function A(e){const t=e.trim().slice(0,X);if(!t)throw new Error("Username is required");const n=y(),r={username:t,userId:n.userId};return localStorage.setItem("refactor-chat-user",JSON.stringify(r)),r}function ie(e,t){const n=localStorage.getItem("refactor-room-memberships"),r=n?JSON.parse(n):{};r[e]=t,localStorage.setItem("refactor-room-memberships",JSON.stringify(r))}function k(e){const t=localStorage.getItem("refactor-room-memberships");return t?JSON.parse(t)[e]??null:null}function le(e,t=!1){const n=y(),r=!t&&e?`<p class="mt-2 text-sm italic text-black/70">Recent room: <span class="font-bold lowercase">${e}</span></p>`:"";return`
    <div id="toastContainer" class="toast toast-top toast-center z-50"></div>
    <div class="flex flex-col gap-6">
      <div class="bg-transparent p-1 sm:p-4 flex flex-row items-center justify-start">
        <h1 class="text-2xl sm:text-4xl font-bold text-center text-black italic mx-auto">WORDLE</h1>
      </div>

      <div class="bg-white/70 border border-black rounded-md p-6 text-center text-black w-full">
        <p class="text-lg font-bold">Multiplayer</p>
        <p class="mt-2 italic">${t?"Choose your username and join the room you were invited to.":"Create a room or join an existing one with your chosen username."}</p>
        ${r}
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
              class="input input-bordered bg-white text-center lowercase input-xs sm:input-sm md:input-md lg:input-lg xl:input-xl text-black ${t?"hidden":""}"
              value="${e}"
              placeholder="room id" />
            <span class="bg-white rounded-lg border border-pink-300 p-1 italic">Room Name</span>
          </label>
            ${t?`<div class="flex items-center justify-center rounded-md border border-black bg-white px-4 py-3 text-center font-bold lowercase">${e}</div>`:'<button id="create-room-btn" class="btn bg-black text-pink-300">Create New Room</button>'}
            <button id="open-room-btn" class="btn bg-black text-pink-300">${t?"Join Room":"Join Existing Room"}</button>
          </div>
        </div>
        <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="../multi_player_refactor/" class="btn bg-black text-pink-300 w-36 mx-auto">Reset</a>
        </div>
      </div>
    </div>
  `}function ce(){let e="";for(let t=0;t<6;t++)for(let n=0;n<5;n++)e+=`
        <div
          id="cell-${t}-${n}"
          class="word-row bg-black row-start-${t+1} w-[56px] h-[56px] sm:w-16 sm:h-16 flex items-center border-2 sm:border-3 border-white justify-center text-3xl sm:text-4xl font-bold text-pink-300"
        ></div>
      `;return e}function de(){return`
    <div id="toastContainer" class="toast toast-top toast-center z-50"></div>

    <div class="bg-transparent p-1 sm:p-4 flex flex-row items-center justify-start">
      <h1 class="text-2xl font-bold text-center text-black italic sm:hidden ml-1">WORDLE</h1>
      <h1 class="text-2xl sm:text-4xl font-bold text-center text-black italic mx-auto hidden sm:flex">WORDLE</h1>
    </div>

    <div id="chatBar" class="collapse bg-white absolute right-2 top-2 w-24 lg:w-80 text-pink-300">
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
        <kbd id="enter" class="${se}">Enter</kbd>
        <kbd data-key="Z" class="${c}">Z</kbd>
        <kbd data-key="X" class="${c}">X</kbd>
        <kbd data-key="C" class="${c}">C</kbd>
        <kbd data-key="V" class="${c}">V</kbd>
        <kbd data-key="B" class="${c}">B</kbd>
        <kbd data-key="N" class="${c}">N</kbd>
        <kbd data-key="M" class="${c}">M</kbd>
        <kbd id="backspace" class="${ae}">&lBarr;</kbd>
      </div>
    </div>

    <div id="gameStatusPanel" class="mt-4 bg-white/80 border border-black rounded-md p-4 text-black"></div>

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
  `}function M(e=oe()??Z(),t=!1){g&&(O=null,b=null,g.className="bg-transparent w-full min-h-screen sm:w-3/4 mx-auto p-0 sm:p-1 pb-10",g.innerHTML=le(e,t),be())}function ue(){g&&(g.className="bg-transparent w-full min-h-screen sm:w-3/4 mx-auto p-0 sm:p-1 pb-10",g.innerHTML=de(),Se(),he(),ve(),Ee(),Ie())}function E(e){g&&(g.className="bg-transparent w-full min-h-screen sm:w-3/4 mx-auto p-4 sm:p-6",g.innerHTML=`
    <div class="bg-white/80 border border-red-600 rounded-md p-6 text-center text-black">
      <h1 class="text-xl font-bold text-red-600">Refactor Multiplayer</h1>
      <p class="mt-3">${e}</p>
      <div class="mt-6">
        <a href="../multi_player_refactor/" class="btn bg-black text-pink-300">Back To Refactor</a>
      </div>
    </div>
  `)}function N(e){const t="word-row w-[56px] h-[56px] sm:w-16 sm:h-16 flex items-center border-2 sm:border-3 justify-center text-3xl sm:text-4xl font-bold";switch(e){case"correct":return`${t} bg-green-200 border-green-200 text-black`;case"present":return`${t} bg-yellow-200 border-yellow-200 text-black`;case"miss":return`${t} bg-slate-500 border-slate-500 text-white`;default:return`${t} bg-black border-white text-pink-300`}}function ee(e,t){const n=e==="ENTER"?"kbd bg-black text-pink-200 h-20":e==="BACKSPACE"?"kbd bg-black text-pink-200 font-bold w-16 sm:w-[73px] h-20":"kbd bg-black text-pink-200 h-20";return t==="correct"?`${n} bg-green-200 text-black`:t==="present"?`${n} bg-yellow-200 text-black`:t==="miss"?`${n} bg-slate-500 text-white`:n}function me(e,t){var a;const n=b;b=e,W();const r=document.getElementById("userTurn");r&&(r.textContent=$(e.status)?"Game Over":((a=e.currentTurn)==null?void 0:a.username)??"Waiting..."),Te(e),e.board.rows.forEach((i,o)=>{const l=(t==null?void 0:t.revealRowIndex)===o;i.cells.forEach((d,u)=>{var w,h;const p=document.getElementById(`cell-${o}-${u}`);if(!p)return;const x=((h=(w=n==null?void 0:n.board.rows[o])==null?void 0:w.cells[u])==null?void 0:h.letter)??"";l?(p.className=N("empty"),p.innerHTML=d.letter||""):(p.className=N(d.status),p.innerHTML=d.letter||""),d.letter!==x&&d.letter&&(p.classList.add("animate-pulse"),window.setTimeout(()=>p.classList.remove("animate-pulse"),250))})}),Array.from(document.querySelectorAll(".kbd")).forEach(i=>{var d,u;const o=((d=i.dataset.key)==null?void 0:d.toUpperCase())??(i.id==="enter"?"ENTER":i.id==="backspace"?"BACKSPACE":((u=i.textContent)==null?void 0:u.trim().toUpperCase())??"");if(!o)return;const l=o==="ENTER"||o==="BACKSPACE"?void 0:e.board.keyboard[o];(t==null?void 0:t.revealRowIndex)==null?(i.className=ee(o,l),i.style.color=l==="correct"||l==="present"?"black":l==="miss"?"white":""):(o==="ENTER"||o==="BACKSPACE")&&(i.style.color="")}),(t==null?void 0:t.revealRowIndex)!=null&&(C=C.then(()=>ge(e,t.revealRowIndex))),we(e),Ce(e),Me(e)}async function te(e){const t=await fetch(`${L}/api/rooms/${e}`);if(!t.ok)throw new Error(`Failed to load room snapshot (${t.status})`);return J(await t.json())}async function P(e,t){const n=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:t?JSON.stringify(t):void 0});if(!n.ok){const r=await n.text();throw new Error(r||`Request failed (${n.status})`)}return J(await n.json())}function j(e,t,n){const r=n.players.find(s=>s.username===t);r&&ie(e,r.playerId)}function be(){var e,t;(e=document.getElementById("create-room-btn"))==null||e.addEventListener("click",async()=>{try{const n=document.getElementById("username-input"),r=A((n==null?void 0:n.value)??""),s=Z(),a=await P(`${L}/api/rooms`,{roomId:s,hostUsername:r.username});j(a.roomId,r.username,a),U(a.roomId),window.history.replaceState({},"",`${window.location.pathname}?room=${a.roomId}`),I(a)}catch(n){E(n instanceof Error?n.message:"Unable to create room")}}),(t=document.getElementById("open-room-btn"))==null||t.addEventListener("click",async()=>{var n,r;try{const s=document.getElementById("username-input"),a=A((s==null?void 0:s.value)??""),i=(r=(n=document.getElementById("room-id-input"))==null?void 0:n.value)==null?void 0:r.trim(),o=S(),l=i||o;if(!l)throw new Error("Room ID is required");const d=k(l),u=await te(l),x=(d?u.players.some(w=>w.playerId===d):!1)?u:await P(`${L}/api/rooms/${l}/join`,{username:a.username});j(x.roomId,a.username,x),U(x.roomId),window.history.replaceState({},"",`${window.location.pathname}?room=${x.roomId}`),I(x)}catch(s){const a=s instanceof Error?s.message:"Unable to open room";if(a.includes("(404)")){v("That room does not exist. Click Create Room instead.");return}if(a.toLowerCase().includes("room is full")){v("That room is full.");return}if(a.toLowerCase().includes("username already exists")){v("That username is already taken in this room.");return}v("Unable to join that room right now.")}})}function v(e){const t=document.getElementById("toastContainer");if(!t)return;const n=document.createElement("div");n.className="alert border border-red-500 bg-white text-red-500 shadow-lg",n.innerHTML=`<span class="font-bold">${e}</span>`,t.appendChild(n),window.setTimeout(()=>{n.remove()},4e3)}function I(e){O!==e.roomId&&(ue(),O=e.roomId,fe(e.roomId),pe(e.roomId),b=null);const n=xe(b,e);me(e,{revealRowIndex:n}),console.log("Multiplayer room word:",e.debugWord)}function fe(e){if(f&&f.readyState===WebSocket.OPEN){if(new URL(f.url).searchParams.get("room")===e)return;f.close()}const t=y(),n=window.location.protocol==="https:"?"wss":"ws";f=new WebSocket(`${n}://${Q}/ws/chat?room=${e}`),f.addEventListener("open",()=>{f==null||f.send(JSON.stringify({type:"join",username:t.username,userId:t.userId,message:`${t.username} joined the room`}))}),f.addEventListener("message",r=>{const s=JSON.parse(r.data);$e(s),Oe(s)})}function pe(e){if(m&&m.readyState===WebSocket.OPEN){if(new URL(m.url).searchParams.get("room")===e)return;m.close()}const t=k(e);if(!t)return;const n=window.location.protocol==="https:"?"wss":"ws";m=new WebSocket(`${n}://${Q}/ws/game?room=${e}&userId=${encodeURIComponent(t)}`),m.addEventListener("message",r=>{const s=JSON.parse(r.data);s.snapshot=J(s.snapshot),I(s.snapshot),s.type==="invalidGuess"&&window.setTimeout(()=>Le(s.snapshot),0),s.pointsAwarded>0&&s.scoringUsername&&Ue(s.scoringUsername,s.pointsAwarded)})}function xe(e,t){if(!e)return null;for(let n=0;n<t.board.rows.length;n++){const r=e.board.rows[n],s=t.board.rows[n],a=r.cells.every(l=>l.status==="empty"),i=s.cells.some(l=>l.status!=="empty"),o=s.cells.every((l,d)=>l.letter===r.cells[d].letter);if(a&&i&&o)return n}return null}async function ge(e,t){const n=e.board.rows[t];for(let r=0;r<n.cells.length;r++){const s=n.cells[r],a=document.getElementById(`cell-${t}-${r}`);a&&(a.classList.add("box"),await ye(500),a.className=N(s.status),a.innerHTML=s.letter||"",a.classList.remove("box"),ke(s))}}function ke(e){const t=H(e.letter);t&&(t.className=ee(e.letter,e.status),t.style.color=e.status==="correct"||e.status==="present"?"black":e.status==="miss"?"white":"")}function ye(e){return new Promise(t=>{window.setTimeout(t,e)})}function we(e){if(document.querySelectorAll(".current-cell-spinner").forEach(o=>{o.classList.remove("current-cell-spinner")}),document.querySelectorAll(".current-cell-trace").forEach(o=>{o.remove()}),$(e.status))return;const t=e.board.activeRowIndex,n=e.board.rows[t];if(!n)return;const r=n.cells.findIndex(o=>!o.letter),s=r>=0?r:n.cells.length-1,a=document.getElementById(`cell-${t}-${s}`);if(!a)return;a.classList.add("current-cell-spinner");const i=document.createElement("span");i.className="current-cell-trace",i.setAttribute("aria-hidden","true"),i.innerHTML=`
    <svg viewBox="0 0 72 72" preserveAspectRatio="none">
      <rect x="3" y="3" width="66" height="66"></rect>
    </svg>
  `,a.appendChild(i)}function he(){_||(document.addEventListener("mousedown",e=>{const t=e.target;t!=null&&t.classList.contains("kbd")&&B()&&t.classList.add("bg-pink-200")}),document.addEventListener("mouseup",e=>{const t=e.target;t!=null&&t.classList.contains("kbd")&&t.classList.remove("bg-pink-200")}),document.addEventListener("keydown",e=>{var r;const t=e.target;if((t==null?void 0:t.id)==="textMessageInput"||(t==null?void 0:t.id)==="username-input"||(t==null?void 0:t.id)==="room-id-input"||!B())return;const n=D(e.key);n&&((r=H(n))==null||r.classList.add("bg-pink-200"))}),document.addEventListener("keyup",e=>{var r;const t=e.target;if((t==null?void 0:t.id)==="textMessageInput"||(t==null?void 0:t.id)==="username-input"||(t==null?void 0:t.id)==="room-id-input"||!B())return;const n=D(e.key);n&&((r=H(n))==null||r.classList.remove("bg-pink-200"))}),_=!0)}function ve(){G||(document.addEventListener("keydown",e=>{const t=e.target;if((t==null?void 0:t.id)==="textMessageInput"||(t==null?void 0:t.id)==="username-input"||(t==null?void 0:t.id)==="room-id-input")return;const n=D(e.key);n&&z(n)}),document.addEventListener("click",e=>{var r;const t=e.target;if(!(t!=null&&t.classList.contains("kbd")))return;const n=((r=t.dataset.key)==null?void 0:r.toUpperCase())??(t.id==="enter"?"ENTER":t.id==="backspace"?"BACKSPACE":null);n&&z(n)}),G=!0)}function z(e){var r;if(!m||m.readyState!==WebSocket.OPEN||!b)return;const t=b.roomId,n=k(t);if(!(!n||((r=b.currentTurn)==null?void 0:r.playerId)!==n)){if(e==="ENTER"){W(),m.send(JSON.stringify({type:"submit",userId:n,letter:""}));return}if(e==="BACKSPACE"){W(),m.send(JSON.stringify({type:"backspace",userId:n,letter:""}));return}m.send(JSON.stringify({type:"append",userId:n,letter:e}))}}function D(e){const t=e.toUpperCase();return t==="BACKSPACE"?"BACKSPACE":t==="ENTER"?"ENTER":t.length===1&&t>="A"&&t<="Z"?t:null}function H(e){return Array.from(document.querySelectorAll(".kbd")).find(t=>{var r;const n=(r=t.dataset.key)==null?void 0:r.toUpperCase();return n?n===e:t.id.toUpperCase()===e})}function W(){document.querySelectorAll(".kbd").forEach(e=>{e.classList.remove("bg-pink-200")})}function Ee(){K||(document.addEventListener("click",e=>{const t=e.target;(t==null?void 0:t.id)==="sendTextBtn"&&V()}),document.addEventListener("keydown",e=>{const t=e.target;(t==null?void 0:t.id)==="textMessageInput"&&e.key==="Enter"&&V()}),K=!0)}function Ie(){F||(document.addEventListener("click",async e=>{const t=e.target;if(t){if(t.id==="copy-room-link-btn"){if(!b)return;const n=`${window.location.origin}/multi_player_refactor/?room=${b.roomId}`;try{await navigator.clipboard.writeText(n);const r=t.textContent;t.textContent="Copied",window.setTimeout(()=>{t.textContent=r??"Copy Room Link"},1200)}catch{E("Unable to copy room link")}return}if(t.id==="update-username-btn"){try{if(!b||!m||m.readyState!==WebSocket.OPEN)return;const n=k(b.roomId);if(!n)return;const r=y(),s=window.prompt("Update your username",r.username);if(s==null)return;const a=A(s);m.send(JSON.stringify({type:"renameUser",userId:n,letter:"",username:a.username}))}catch(n){E(n instanceof Error?n.message:"Unable to update username")}return}if(t.id==="inline-reset-vote-checkbox"||t.id==="modal-reset-vote-checkbox"){const n=t;try{if(!b||!m||m.readyState!==WebSocket.OPEN)return;const r=k(b.roomId);if(!r)return;m.send(JSON.stringify({type:"resetVote",userId:r,letter:"",confirmed:n.checked}))}catch(r){E(r instanceof Error?r.message:"Unable to update reset vote")}}}}),F=!0)}function V(){var r;const e=document.getElementById("textMessageInput"),t=(r=e==null?void 0:e.value)==null?void 0:r.trim();if(!f||f.readyState!==WebSocket.OPEN||!e||!t)return;const n=y();f.send(JSON.stringify({type:"chat",username:n.username,userId:n.userId,message:t})),e.value=""}function $e(e){var l,d;const t=document.getElementById("textMessages");if(!t)return;const n=y(),r=e.userId===n.userId,s=((l=document.getElementById("arrowBar"))==null?void 0:l.checked)??!1;e.type==="chat"&&!r&&!s&&((d=document.getElementById("unreadChatIndicator"))==null||d.classList.remove("hidden"));const a=e.type==="join"||e.type==="leave"?"chat-bubble bg-white text-pink-300 border border-pink-300":r?"chat-bubble bg-pink-300 text-white":"chat-bubble bg-green-300 text-white",i=e.type==="join"||e.type==="leave"?"chat chat-center":r?"chat chat-start":"chat chat-end",o=document.createElement("div");o.innerHTML=`
    <div class="${i}">
      <div class="${a}"><span class="font-bold">${e.username}</span>: ${e.message}</div>
    </div>
  `,t.appendChild(o),t.scrollTo(0,t.scrollHeight)}function Se(){var e,t;(e=document.querySelector(".collapse"))==null||e.addEventListener("click",()=>{var n;(n=document.getElementById("sendTextBtn"))==null||n.classList.toggle("fadeIn")}),(t=document.getElementById("arrowBar"))==null||t.addEventListener("change",n=>{var a,i,o;const r=n.target,s=r.parentElement;s&&(window.innerWidth<1024&&(s.classList.contains("w-24")?s.classList.replace("w-24","w-80"):s.classList.replace("w-80","w-24")),(a=document.getElementById("arrowUp"))==null||a.classList.toggle("hidden"),(i=document.getElementById("arrowDown"))==null||i.classList.toggle("hidden"),r.checked&&((o=document.getElementById("unreadChatIndicator"))==null||o.classList.add("hidden")))})}function Le(e){const t=e.board.activeRowIndex;for(let n=0;n<e.wordLength;n++){const r=document.getElementById(`cell-${t}-${n}`);r==null||r.classList.add("animate-wiggle"),window.setTimeout(()=>r==null?void 0:r.classList.remove("animate-wiggle"),750)}}function Ce(e){const t=document.getElementById("gameStatusPanel");if(!t)return;const n=e.players.filter(u=>e.resetConfirmedPlayerIds.includes(u.playerId)).map(u=>u.username),r=k(e.roomId),s=r?e.resetConfirmedPlayerIds.includes(r):!1,a=$(e.status),i=e.status==="COMPLETED"?"Solved!":e.status==="FAILED"?"Out Of Guesses":"Restart Game",o=e.status==="COMPLETED"?"The puzzle was solved.":e.status==="FAILED"?"The room ran out of rows.":"",l=a&&e.wordDefinition.length?e.wordDefinition.map(u=>`<span class="italic">${re(u)}</span>`).join("<br>"):"",d=n.length?n.join(", "):"No confirmations yet";t.innerHTML=`
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="text-xl font-bold">${i}</div>
        ${o?`<div>${o}</div>`:""}
        ${a?`<div><span class="font-bold">Word:</span> ${e.revealedWord??"Unknown"}</div>`:""}
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
  `,ne(e)}function $(e){return e==="COMPLETED"||e==="FAILED"}function B(){var t;if(!b)return!1;const e=k(b.roomId);return!!(e&&((t=b.currentTurn)==null?void 0:t.playerId)===e)}function Te(e){var i;const t=document.getElementById("playerQueue");if(!t)return;const n=[...e.players].sort((o,l)=>o.turnOrder-l.turnOrder);t.className="mt-3 flex w-full flex-col gap-2";const r=R;t.innerHTML=n.map((o,l)=>{var x;const d=((x=e.currentTurn)==null?void 0:x.playerId)===o.playerId,u=n.findIndex(w=>{var h;return w.playerId===((h=e.currentTurn)==null?void 0:h.playerId)}),p=l===u?"Current":l===(u+1)%n.length?"Next":"";return`
      <div data-player-pill="${o.playerId}" class="flex items-center justify-between rounded-md border px-4 py-2 transition-all duration-500 ease-out overflow-hidden ${d?"border-pink-300 bg-white shadow-sm opacity-100":"border-black bg-white/70 opacity-70"}">
        <span class="min-w-0 truncate font-bold text-lg p-4 ${d?"text-pink-300":"text-black"}">${o.username}</span>
        <div class="ml-4 flex shrink-0 items-center gap-3">
          <span class="text-xs font-bold text-black p-4">${o.gameScore} game • ${o.totalScore} total</span>
          ${p?`<span class="rounded-full p-4 text-[10px] font-semibold uppercase tracking-[0.18em] ${d?"bg-pink-100 text-black":" text-black"}">${p}</span>`:""}
        </div>
      </div>
    `}).join("");const s=((i=e.currentTurn)==null?void 0:i.playerId)??null;if(!(n.map(o=>o.playerId).join("|")!==q.join("|"))&&s&&r&&s!==r){const o=document.querySelector(`[data-player-pill="${r}"]`),l=document.querySelector(`[data-player-pill="${s}"]`);o==null||o.animate([{opacity:1,transform:"scale(1)",filter:"brightness(1)"},{opacity:.7,transform:"scale(1)",filter:"brightness(0.98)"}],{duration:1500,easing:"cubic-bezier(0.22, 1, 0.36, 1)"}),l==null||l.animate([{opacity:.7,transform:"scale(1)",filter:"brightness(0.98)"},{opacity:1,transform:"scale(1)",filter:"brightness(1)"}],{duration:1500,easing:"cubic-bezier(0.22, 1, 0.36, 1)"})}if(s&&s!==R){const o=document.querySelector(`[data-player-pill="${s}"]`);o==null||o.animate([{opacity:.3,transform:"translateY(4px)"},{opacity:1,transform:"translateY(0)"}],{duration:1500,easing:"cubic-bezier(0.22, 1, 0.36, 1)"})}R=s,q=n.map(o=>o.playerId)}function Re(e){const n=[...e.players].sort((s,a)=>a.gameScore-s.gameScore||a.totalScore-s.totalScore||s.turnOrder-a.turnOrder).map((s,a)=>`
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
  `).join(""),r=document.getElementById("modalScoreList");r&&(r.innerHTML=n)}function ne(e){const t=e.players.map(s=>`
      <label class="label cursor-default justify-start gap-4">
        <input type="checkbox" class="checkbox border-pink-300 bg-white [--chkbg:theme(colors.pink.300)] [--chkfg:black]" ${e.resetConfirmedPlayerIds.includes(s.playerId)?"checked":""} disabled />
        <span class="label-text text-black">${s.username}</span>
      </label>
    `).join(""),n=document.getElementById("inlineResetVoteList");n&&(n.innerHTML=t);const r=document.getElementById("modalResetVoteList");r&&(r.innerHTML=t)}function Me(e){const t=document.getElementById("gameOverModal");if(!t)return;const n=document.getElementById("gameOverModalTitle"),r=document.getElementById("gameOverWord"),s=document.getElementById("gameOverDefinition"),a=document.getElementById("modal-reset-vote-checkbox"),i=k(e.roomId);n&&(n.textContent=e.status==="COMPLETED"?"You got it!":e.status==="FAILED"?"Nice try!":"Restart Game"),r&&(r.textContent=e.revealedWord??e.status),s&&(s.innerHTML=e.wordDefinition.length?e.wordDefinition.map(l=>`<span class="italic">${re(l)}</span>`).join(" "):"Definition unavailable"),a&&i&&(a.checked=e.resetConfirmedPlayerIds.includes(i)),ne(e),Re(e);const o=`${e.roomId}:${e.status}:${e.revealedWord??""}`;$(e.status)&&o!==T&&(C=C.then(async()=>{e.status==="COMPLETED"&&Be(),t.open||t.showModal()}),T=o),$(e.status)||(T=null,t.open&&t.close())}function Be(){if(!confetti)return;const e=15*1e3,t=Date.now()+e,n={startVelocity:30,spread:360,ticks:60,zIndex:0},r=window.setInterval(()=>{const s=t-Date.now();if(s<=0){window.clearInterval(r);return}const a=50*(s/e);confetti({...n,particleCount:a,origin:{x:Y(.1,.3),y:Math.random()-.2}}),confetti({...n,particleCount:a,origin:{x:Y(.7,.9),y:Math.random()-.2}})},250)}function Y(e,t){return Math.random()*(t-e)+e}function Oe(e){if(e.type!=="join"&&e.type!=="leave")return;const t=y();if(e.userId===t.userId)return;const n=document.getElementById("toastContainer");if(!n)return;const r=document.createElement("div");r.className="alert bg-white border border-pink-300 text-pink-300 shadow-lg",r.innerHTML=`<span>${e.type==="join"?`<span class="text-black">${e.username}</span> has entered the game`:`<span class="text-black">${e.username}</span> has left the game`}</span>`,n.appendChild(r),window.setTimeout(()=>{r.remove()},2750)}function Ue(e,t){const n=document.getElementById("toastContainer");if(!n)return;const r=document.createElement("div");r.className="alert border-2 border-pink-300 bg-white text-black shadow-lg",r.innerHTML=`
    <div class="flex items-center">
      <span class="font-bold">${e}&nbsp;</span>
      <span class="text-xl font-extrabold">+</span>
      <span class="text-xl font-extrabold text-green-300">${t}</span>
      <span class="font-bold">&nbsp;points!</span>
    </div>
  `,n.appendChild(r),window.setTimeout(()=>{r.remove()},2600)}function re(e){const t=e.trim();if(!t)return t;const n=t.endsWith(".")?t:`${t}.`;return`${n.charAt(0).toUpperCase()}${n.slice(1)}`}async function Ae(){try{const e=S();if(!e){M();return}const t=y(),n=k(e),r=await te(e);if(U(e),n&&r.players.some(i=>i.playerId===n)){I(r);return}if(!r.players.some(a=>a.username.toLowerCase()===t.username.toLowerCase())){const a=await P(`${L}/api/rooms/${e}/join`,{username:t.username});j(a.roomId,t.username,a),I(a);return}M(e,!0),v("That room is already using your saved username. Update it to join.")}catch(e){const t=e instanceof Error?e.message:"Unknown error";if(t.includes("(404)")){M(S()??void 0,!!S());return}E(t)}}Ae();
