import { memo, useEffect, useState } from "react";
import CoverArt from "./CoverArt.jsx";
import { mapUrl, stockImg } from "../lib/cafes.js";

/* 封面順序：自訂照片 → 店家照片 → 主題照片 → 插畫（前一張載入失敗就換下一張） */
function Cover({ cafe, photo }) {
  const sources = [photo, cafe.img, stockImg(cafe)].filter(Boolean);
  const key = sources.join("|");
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [key]);
  if (idx >= sources.length) return <CoverArt cafe={cafe} />;
  return (
    <img
      key={sources[idx]}
      src={sources[idx]}
      alt={`${cafe.name} 店家照片`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

function CafeCard({ cafe, fav, photo, onToggleFav, onEditPhoto }) {
  const [pop, setPop] = useState(0);
  return (
    <article className="card">
      <span className="pin" aria-hidden="true" />
      <div className="cover">
        <Cover cafe={cafe} photo={photo} />
        <button className="photo-btn" onClick={() => onEditPhoto(cafe.id)} aria-label={`設定 ${cafe.name} 的圖片`}>
          <i className="bi bi-camera" aria-hidden="true" />
        </button>
        <span className="badge">
          {cafe.area}
          {cafe.dist ? ` · ${cafe.dist}m` : ""}
        </span>
        <button
          key={pop}
          className={"fav" + (pop ? " pop" : "")}
          aria-pressed={fav}
          aria-label={`${fav ? "取消收藏" : "加入收藏"} ${cafe.name}`}
          onClick={() => {
            onToggleFav(cafe.id);
            setPop((n) => n + 1);
          }}
        >
          <i className="bi bi-heart" aria-hidden="true" />
          <i className="bi bi-heart-fill" aria-hidden="true" />
        </button>
      </div>
      <div className="body">
        <h3 className="name">{cafe.name}</h3>
        <p className="addr">
          <i className="bi bi-geo-alt-fill" aria-hidden="true" />
          {cafe.addr}
        </p>
        <div className="tags">
          {cafe.tags.map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
        <a className="btn" href={mapUrl(cafe)} target="_blank" rel="noopener noreferrer">
          <i className="bi bi-map" aria-hidden="true" />
          查看地圖
        </a>
        <div className="meta">
          <span>
            <i className="bi bi-star-fill" aria-hidden="true" /> {cafe.rating ? cafe.rating.toFixed(1) : "—"}
          </span>
          <span>{cafe.hours || "營業時間未知"}</span>
        </div>
        <div className="bar" role="img" aria-label={cafe.rating ? `評分 ${cafe.rating} / 5` : "尚無評分"}>
          <i style={{ width: `${((cafe.rating || 0) / 5) * 100}%` }} />
        </div>
      </div>
    </article>
  );
}

export default memo(CafeCard);
