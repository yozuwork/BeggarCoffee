import { useEffect, useRef, useState } from "react";

/* 設定店家圖片：上傳（存成 Blob）或貼網址 */
export default function PhotoSheet({ cafe, current, onUpload, onUrl, onRemove, onClose }) {
  const fileRef = useRef(null);
  const firstRef = useRef(null);
  const [url, setUrl] = useState(typeof current === "string" ? current : "");
  const [hint, setHint] = useState("");

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const applyUrl = () => {
    let u;
    try {
      u = new URL(url.trim());
    } catch {
      return setHint("請貼上完整網址，開頭是 https://");
    }
    if (!/^https?:$/.test(u.protocol)) return setHint("只支援 http 或 https 開頭的網址");
    setHint("檢查圖片中…");
    const test = new Image();
    test.referrerPolicy = "no-referrer";
    test.onload = () => onUrl(u.href);
    test.onerror = () =>
      setHint("這個網址的圖片載入不了。可能不是圖片直連（要 .jpg/.png 那種），改用上傳就一定可以。");
    test.src = u.href;
  };

  return (
    <div className="sheet-mask" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <h3 id="sheetTitle">店家圖片</h3>
        <p>{cafe.name}</p>
        <button ref={firstRef} className="primary" onClick={() => fileRef.current.click()}>
          <i className="bi bi-upload" /> 從手機上傳圖片
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files[0];
            e.target.value = "";
            if (f) onUpload(f);
          }}
        />
        <div className="url-row">
          <input
            type="url"
            inputMode="url"
            placeholder="或貼上圖片網址 https://…"
            aria-label="圖片網址"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
          />
          <button className="url-ok" onClick={applyUrl}>套用</button>
        </div>
        <p className="url-hint">{hint}</p>
        {current && (
          <button className="danger" onClick={onRemove}>
            <i className="bi bi-trash3" /> 移除自訂圖片
          </button>
        )}
        <button onClick={onClose}>取消</button>
      </div>
    </div>
  );
}
