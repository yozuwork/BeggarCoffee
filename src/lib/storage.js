/* 瀏覽器端資料：收藏、自訂照片存在 IndexedDB；介面偏好存在 localStorage */
import { createStore, get, set, del, entries } from "idb-keyval";

const db = createStore("yozu-cafe", "kv");
const photoDb = createStore("yozu-cafe-photos", "photos");

const FAV_KEY = "favs";
const LEGACY_FAV = "cafe-favs-v1";
const LEGACY_PHOTO = "cafe-photos-v1";

/* 收藏：Set<string> 的店家 id */
export async function loadFavs() {
  try {
    const saved = await get(FAV_KEY, db);
    if (Array.isArray(saved)) return saved;
    // 舊版單一 HTML 存在 localStorage 的收藏，第一次開啟時搬過來
    const legacy = JSON.parse(localStorage.getItem(LEGACY_FAV) || "[]");
    if (Array.isArray(legacy) && legacy.length) await set(FAV_KEY, legacy, db);
    return Array.isArray(legacy) ? legacy : [];
  } catch {
    return [];
  }
}
export function saveFavs(ids) {
  return set(FAV_KEY, [...ids], db).catch(() => {});
}

/* 自訂照片：上傳的存 Blob，貼網址的存字串 */
export async function loadPhotos() {
  try {
    const all = await entries(photoDb);
    if (!all.length) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_PHOTO) || "{}");
      for (const [id, v] of Object.entries(legacy || {})) {
        const val = v.startsWith("data:") ? await (await fetch(v)).blob() : v;
        await set(id, val, photoDb);
        all.push([id, val]);
      }
    }
    return Object.fromEntries(all);
  } catch {
    return {};
  }
}
export const savePhoto = (id, value) => set(id, value, photoDb);
export const removePhoto = (id) => del(id, photoDb);

/* 請瀏覽器把資料標為「持久保存」，空間不足時比較不會被清掉 */
export async function requestPersist() {
  try {
    if (navigator.storage?.persisted && !(await navigator.storage.persisted())) {
      return await navigator.storage.persist();
    }
    return true;
  } catch {
    return false;
  }
}

/* 介面偏好（目前分頁、區域）：小東西用 localStorage，讀不到就用預設值 */
const PREF_KEY = "yozu-cafe-prefs";
export function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || "{}") || {};
  } catch {
    return {};
  }
}
export function savePrefs(p) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {}
}

/* 上傳圖片先縮小再存，省空間 */
export function compressImage(file, max = 640) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * r);
      cv.height = Math.round(img.height * r);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.78);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject();
    };
    img.src = url;
  });
}
