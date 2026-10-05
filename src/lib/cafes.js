/* 店家資料
   cafeandcowork：cafeandcowork.com/zh-tw/taipei（5 分制綜合分數），依座標歸到最近捷運站（約 1km 內）
   cafenomad：cafenomad.tw 網友評分（7 項平均，至少 2 人評分，已排除標示停業的店家）
   博客來 Dream Plaza 為手動加入（無評分） */
import data from "../data/cafes.json";

export const AREAS = data.areas;

export const CAFES = [...data.cafes]
  .sort((a, b) => AREAS.indexOf(a.area) - AREAS.indexOf(b.area) || (b.rating ?? 0) - (a.rating ?? 0))
  .map((c, i) => ({ ...c, seed: i }));

export const CAFE_BY_ID = Object.fromEntries(CAFES.map((c) => [c.id, c]));

/* 沒有店家照片時用的咖啡廳主題照片（Unsplash） */
const STOCK = [
  "1501339847302-ac426a4a7cbb", "1554118811-1e0d58224f24", "1495474472287-4d71bcdd2085", "1509042239860-f550ce710b93",
  "1442512595331-e89e73853f31", "1453614512568-c4024d13c247", "1521017432531-fbd92d768814", "1445116572660-236099ec97a0",
  "1559925393-8be0ec4767c8", "1511920170033-f8396924c348", "1497935586351-b67a49e012bf", "1514432324607-a09d9b4aefdd",
  "1461023058943-07fcbe16d735", "1447933601403-0c6688de566e", "1498804103079-a6351b050096", "1525610553991-2bede1a236e2",
  "1600093463592-8e36ae95ef56", "1559496417-e7f25cb247f3", "1507133750040-4a8f57021571", "1534040385115-33dcb3acba5b",
  "1493857671505-72967e2e2760", "1517701604599-bb29b565090c", "1513267048331-5611cad62e41", "1556742049-0cfed4f6a45d"
];
export function stockImg(c) {
  return `https://images.unsplash.com/photo-${STOCK[(c.seed * 7) % STOCK.length]}?w=480&h=408&fit=crop&q=70`;
}

export function mapUrl(c) {
  return c.map || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("台北市 " + c.addr + " " + c.name);
}

export function matches(c, q) {
  if (!q) return true;
  return (c.name + c.addr + c.area + c.tags.join("")).toLowerCase().includes(q);
}
