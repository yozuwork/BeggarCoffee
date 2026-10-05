import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AREAS, CAFES, CAFE_BY_ID, matches } from "./lib/cafes.js";
import {
  loadFavs, saveFavs, loadPhotos, savePhoto, removePhoto,
  loadPrefs, savePrefs, compressImage, requestPersist
} from "./lib/storage.js";
import CafeCard from "./components/CafeCard.jsx";
import ChipRail from "./components/ChipRail.jsx";
import Pager from "./components/Pager.jsx";
import PhotoSheet from "./components/PhotoSheet.jsx";
import { useInstallPrompt, useOnline, useMediaQuery } from "./lib/pwa.js";
import { hideSplash } from "./lib/splash.js";

const ALL = "全部";
const OPTIONS = [ALL, ...AREAS];

/* 照片（Blob 或網址）→ 可以放進 <img> 的網址；Blob 會轉成 object URL，換掉時釋放 */
function usePhotoUrls(photos) {
  const cache = useRef(new Map());
  return useMemo(() => {
    const next = new Map();
    const out = {};
    for (const [id, v] of Object.entries(photos)) {
      if (typeof v === "string") out[id] = v;
      else {
        const prev = cache.current.get(id);
        const u = prev && prev.blob === v ? prev.url : URL.createObjectURL(v);
        next.set(id, { blob: v, url: u });
        out[id] = u;
      }
    }
    for (const [id, p] of cache.current) if (next.get(id)?.url !== p.url) URL.revokeObjectURL(p.url);
    cache.current = next;
    return out;
  }, [photos]);
}

function useToast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const t = useRef();
  const toast = useCallback((m) => {
    setMsg(m);
    setShow(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setShow(false), 1600);
  }, []);
  return [msg, show, toast];
}

export default function App() {
  const prefs = useMemo(loadPrefs, []);
  const [tab, setTab] = useState(prefs.tab === "fav" ? "fav" : "search");
  const [area, setArea] = useState(OPTIONS.includes(prefs.area) ? prefs.area : ALL);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [favArea, setFavArea] = useState(ALL);
  const [favPage, setFavPage] = useState(1);
  const [favs, setFavs] = useState(() => new Set());
  const [photos, setPhotos] = useState({});
  const [ready, setReady] = useState(false);
  const [sheetId, setSheetId] = useState(null);
  const [toastMsg, toastShow, toast] = useToast();
  const photoUrls = usePhotoUrls(photos);
  const online = useOnline();
  const [canInstall, install] = useInstallPrompt();
  // 電腦版（寬螢幕）每頁 20 張，剛好排滿 4 或 5 欄；手機 2 欄每頁 15 張
  const desktop = useMediaQuery("(min-width: 900px)");
  const PER_PAGE = desktop ? 20 : 15;

  // 從 IndexedDB 讀回收藏與照片
  useEffect(() => {
    Promise.all([loadFavs(), loadPhotos()]).then(([f, p]) => {
      setFavs(new Set(f.filter((id) => CAFE_BY_ID[id])));
      setPhotos(p);
      setReady(true);
      hideSplash();
    });
  }, []);

  useEffect(() => savePrefs({ tab, area }), [tab, area]);

  const favsRef = useRef(favs);
  favsRef.current = favs;
  const toggleFav = useCallback(
    (id) => {
      const prev = favsRef.current;
      const next = new Set(prev);
      const name = CAFE_BY_ID[id].name;
      if (next.has(id)) {
        next.delete(id);
        toast(`已取消收藏「${name}」`);
      } else {
        next.add(id);
        toast(`已加入收藏「${name}」`);
        if (prev.size === 0) requestPersist();
      }
      favsRef.current = next;
      setFavs(next);
      saveFavs(next);
    },
    [toast]
  );

  const setPhoto = async (id, value) => {
    try {
      await savePhoto(id, value);
      setPhotos((p) => ({ ...p, [id]: value }));
      requestPersist();
      return true;
    } catch {
      toast("儲存空間不足，請先移除幾張圖片");
      return false;
    }
  };

  /* 查詢頁 */
  const query = q.trim().toLowerCase();
  const list = useMemo(() => CAFES.filter((c) => (area === ALL || c.area === area) && matches(c, query)), [area, query]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const curPage = Math.min(page, pages);

  /* 收藏頁 */
  const favAll = useMemo(() => CAFES.filter((c) => favs.has(c.id)), [favs]);
  const favCounts = useMemo(() => {
    const c = { [ALL]: favAll.length };
    AREAS.forEach((a) => (c[a] = favAll.filter((x) => x.area === a).length));
    return c;
  }, [favAll]);
  const favList = favArea === ALL ? favAll : favAll.filter((c) => c.area === favArea);
  const favPages = Math.max(1, Math.ceil(favList.length / PER_PAGE));
  const curFavPage = Math.min(favPage, favPages);

  const switchTab = (t) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };
  const resetSearch = () => {
    setQ("");
    setArea(ALL);
    setPage(1);
  };

  const renderGrid = (items) => (
    <div className="grid">
      {items.map((c) => (
        <CafeCard
          key={c.id}
          cafe={c}
          fav={favs.has(c.id)}
          photo={photoUrls[c.id]}
          onToggleFav={toggleFav}
          onEditPhoto={setSheetId}
        />
      ))}
    </div>
  );

  const sheetCafe = sheetId && CAFE_BY_ID[sheetId];

  const tabs = (
    <>
      <button className="tab" aria-current={tab === "search" ? "page" : undefined} onClick={() => switchTab("search")}>
        <span className="ic"><i className="bi bi-search" aria-hidden="true" /></span>
        查詢
      </button>
      <button className="tab" aria-current={tab === "fav" ? "page" : undefined} onClick={() => switchTab("fav")}>
        <span className="ic">
          <i className="bi bi-bookmark" aria-hidden="true" />
          <i className="bi bi-bookmark-fill" aria-hidden="true" />
          {favs.size > 0 && <span className="count">{favs.size > 99 ? "99+" : favs.size}</span>}
        </span>
        我的收藏
      </button>
    </>
  );

  return (
    <>
      <div className="app">
        <header className="top">
          <h1 className="brand">
            {tab === "search" ? "丐幫找咖啡" : "我的收藏"}
            <small>{tab === "search" ? `台北市 · 8 個捷運生活圈 · ${CAFES.length} 間` : "想再去一次的那幾間"}</small>
          </h1>
          <div className="top-actions">
            {desktop && <nav className="top-tabs" aria-label="主選單">{tabs}</nav>}
            {canInstall && (
              <button className="install" onClick={install}>
                <i className="bi bi-download" aria-hidden="true" /> 安裝
              </button>
            )}
            <div className="stamp" aria-hidden="true">
              <div><b>台北</b>CAFÉ</div>
            </div>
          </div>
        </header>

        {!online && (
          <div className="offline" role="status">
            <i className="bi bi-wifi-off" aria-hidden="true" /> 目前離線：清單與收藏都能看，沒看過的照片會先顯示插畫
          </div>
        )}

        {tab === "search" ? (
          <section>
            <div className="toolbar">
            <label className="search">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                type="search"
                placeholder="搜尋店名、街道或特色（如：插座）"
                autoComplete="off"
                aria-label="搜尋咖啡廳"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
              {q && (
                <button className="clear" type="button" aria-label="清除搜尋" onClick={(e) => { e.preventDefault(); setQ(""); setPage(1); }}>
                  <i className="bi bi-x-circle-fill" />
                </button>
              )}
            </label>
            <ChipRail options={OPTIONS} value={area} onPick={(a) => { setArea(a); setPage(1); }} label="選擇區域" />
            </div>
            <div className="result-line">
              <span>共 <strong>{list.length}</strong> 間咖啡廳</span>
              <span>{list.length ? `第 ${curPage} / ${pages} 頁` : ""}</span>
            </div>
            {renderGrid(list.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE))}
            {!list.length && (
              <div className="empty">
                <i className="bi bi-cup-hot big" aria-hidden="true" />
                <h2>找不到符合的咖啡廳</h2>
                <p>換個關鍵字，或把區域切回「全部」再試一次。</p>
                <button className="go" onClick={resetSearch}>清除條件</button>
              </div>
            )}
            <Pager total={list.length} page={curPage} perPage={PER_PAGE} onGo={setPage} />
          </section>
        ) : (
          <section>
            {favAll.length > 0 && (
              <ChipRail options={OPTIONS} value={favArea} counts={favCounts} onPick={(a) => { setFavArea(a); setFavPage(1); }} label="收藏區域篩選" />
            )}
            <div className="result-line">
              <span>{favAll.length ? <>已收藏 <strong>{favAll.length}</strong> 間</> : ""}</span>
              <span>{favList.length > PER_PAGE ? `第 ${curFavPage} / ${favPages} 頁` : ""}</span>
            </div>
            {renderGrid(favList.slice((curFavPage - 1) * PER_PAGE, curFavPage * PER_PAGE))}
            {ready && !favAll.length && (
              <div className="empty">
                <i className="bi bi-bookmark-heart big" aria-hidden="true" />
                <h2>收藏簿還是空的</h2>
                <p>在查詢頁點卡片右上角的愛心，<br />喜歡的咖啡廳就會收進這裡。</p>
                <button className="go" onClick={() => switchTab("search")}>去找咖啡廳</button>
              </div>
            )}
            {favAll.length > 0 && !favList.length && (
              <div className="empty">
                <h2>這個區域還沒有收藏</h2>
                <p>切換到其他區域看看。</p>
              </div>
            )}
            <Pager total={favList.length} page={curFavPage} perPage={PER_PAGE} onGo={setFavPage} label="收藏分頁" />
            {favAll.length > 0 && (
              <p className="storage-note">
                收藏和自訂照片存在這台裝置的瀏覽器裡，離線也看得到。<br />清除瀏覽器資料會一併刪除。
              </p>
            )}
          </section>
        )}
      </div>

      {!desktop && (
        <nav className="nav" aria-label="主選單">
          <div className="nav-in">{tabs}</div>
        </nav>
      )}

      <div className={"toast" + (toastShow ? " show" : "")} role="status" aria-live="polite">{toastMsg}</div>

      {sheetCafe && (
        <PhotoSheet
          key={sheetId}
          cafe={sheetCafe}
          current={photos[sheetId]}
          onClose={() => setSheetId(null)}
          onUrl={async (u) => {
            if (await setPhoto(sheetId, u)) toast("已套用圖片網址");
            setSheetId(null);
          }}
          onUpload={async (file) => {
            const id = sheetId;
            setSheetId(null);
            if (!file.type.startsWith("image/")) return toast("請選擇圖片檔");
            try {
              const blob = await compressImage(file);
              if (await setPhoto(id, blob)) toast("已更新圖片");
            } catch {
              toast("這張圖片無法讀取，請換一張");
            }
          }}
          onRemove={async () => {
            const id = sheetId;
            setSheetId(null);
            await removePhoto(id).catch(() => {});
            setPhotos(({ [id]: _, ...rest }) => rest);
            toast("已移除圖片");
          }}
        />
      )}
    </>
  );
}
