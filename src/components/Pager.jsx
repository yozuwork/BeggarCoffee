export default function Pager({ total, page, perPage, onGo, label = "分頁" }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (total <= perPage) return null;
  const go = (p) => {
    onGo(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && i !== 1 && i !== pages && Math.abs(i - page) > 1) {
      if (i === 2 || i === pages - 1) items.push(<span key={"e" + i} aria-hidden="true">…</span>);
      continue;
    }
    items.push(
      <button key={i} aria-current={i === page ? "page" : undefined} onClick={() => go(i)}>
        {i}
      </button>
    );
  }
  return (
    <nav className="pager" aria-label={label}>
      <button disabled={page <= 1} aria-label="上一頁" onClick={() => go(page - 1)}>‹</button>
      {items}
      <button disabled={page >= pages} aria-label="下一頁" onClick={() => go(page + 1)}>›</button>
    </nav>
  );
}
