/* 啟動畫面（index.html 的 #splash）：資料讀好後淡出。
   每次開啟 App 的第一次至少顯示 1.5 秒；同一個分頁重新整理只等資料，不再刻意停留。點一下可略過。 */
const KEY = "yozu-cafe-splashed";
const start = performance.now();

let minMs = 1500;
try {
  if (sessionStorage.getItem(KEY)) minMs = 0;
  sessionStorage.setItem(KEY, "1");
} catch {}

let done = false;
function remove() {
  if (done) return;
  done = true;
  const el = document.getElementById("splash");
  if (!el) return;
  el.classList.add("hide");
  setTimeout(() => el.remove(), 600);
}

document.getElementById("splash")?.addEventListener("click", remove);

export function hideSplash() {
  const wait = Math.max(0, minMs - (performance.now() - start));
  setTimeout(remove, wait);
}
