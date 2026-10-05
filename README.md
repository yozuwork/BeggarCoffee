# 咖啡收藏簿 · 台北（React + PWA）

台北 8 個捷運生活圈、118 間咖啡廳的查詢與收藏。可安裝到手機主畫面，離線也能用。

網站：https://yozuwork.github.io/BeggarCoffee/

## 指令

```bash
npm install       # 第一次
npm run dev       # 開發（http://localhost:5173）
npm run build     # 打包到 dist/
npm run preview   # 用打包後的版本測試 PWA（http://localhost:4173）
npm run deploy    # 打包並發布到 GitHub Pages（gh-pages 分支）
npm run icons     # 重新產生 public/icons/ 的 App 圖示（需要 Python + Pillow）
```

Service Worker 只在 `build` 後的版本生效。要在手機上安裝，`dist/` 必須放在 **HTTPS** 網址（或 localhost）。

## 資料存在哪

| 資料 | 位置 |
|---|---|
| 收藏 | IndexedDB `yozu-cafe` → `kv` → `favs` |
| 自訂照片（上傳的存 Blob、貼的網址存字串） | IndexedDB `yozu-cafe-photos` → `photos` |
| 目前分頁、選的區域 | localStorage `yozu-cafe-prefs` |
| App 本體、字體、圖示 | Service Worker 預快取 |
| 看過的店家照片 | Service Worker 快取 `cafe-photos`（最多 300 張、60 天） |

第一次收藏或上傳照片時，會向瀏覽器申請「持久保存」，空間不足時比較不會被自動清掉。清除瀏覽器網站資料會一併刪除。

## 結構

```
src/
  data/cafes.json        店家資料（cafeandcowork 67 間、cafenomad 50 間、博客來 1 間）
  lib/cafes.js           區域、排序、主題照片、地圖連結
  lib/storage.js         IndexedDB / localStorage 讀寫、圖片壓縮
  lib/pwa.js             安裝按鈕、離線偵測
  components/            CafeCard、ChipRail（可滑動區域列）、Pager、PhotoSheet、CoverArt
  assets/fonts/          jf open 粉圓 2.1
```

## 版面與啟動畫面

| 寬度 | 版面 |
|---|---|
| 600px 以下（手機） | 2 欄、底部導覽列、每頁 15 間 |
| 600–899px（平板） | 3 欄、底部導覽列、每頁 15 間 |
| 900px 以上（電腦） | 4～5 欄、上方分頁、搜尋框與區域並排、每頁 20 間 |

啟動畫面寫在 `index.html` 的 `#splash`，直式螢幕用 `public/splash/md-loading.webp`、橫式用 `pc-loading.webp`。
每次開啟至少顯示 1.5 秒（同一分頁重新整理不再停留），點一下可略過；邏輯在 `src/lib/splash.js`。
原始 PNG 放在 `design/`；換圖時把新圖轉成 WebP 放到 `public/splash/` 即可。

`cafe-collection-v1.2.html` 是改成 React 前的單一檔案版本，保留作參考。
