import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* 區域列：觸控滑、滑鼠拖曳、滾輪、左右箭頭都能捲動 */
export default function ChipRail({ options, value, counts, onPick, label }) {
  const ref = useRef(null);
  const drag = useRef({ down: null, moved: false });
  const [edge, setEdge] = useState({ l: false, r: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ l: el.scrollLeft > 2, r: el.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", update);
    update();
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  // 選到的區域如果被切掉一半，捲到中間
  useLayoutEffect(() => {
    const el = ref.current;
    const act = el?.querySelector('[aria-pressed="true"]');
    if (act && (act.offsetLeft < el.scrollLeft || act.offsetLeft + act.offsetWidth > el.scrollLeft + el.clientWidth)) {
      el.scrollTo({ left: act.offsetLeft - (el.clientWidth - act.offsetWidth) / 2, behavior: "smooth" });
    }
    update();
  }, [value, counts, update]);

  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { down: { x: e.clientX, left: ref.current.scrollLeft }, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.down.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      ref.current.classList.add("dragging");
      ref.current.setPointerCapture(e.pointerId);
    }
    if (d.moved) ref.current.scrollLeft = d.down.left - dx;
  };
  const endDrag = () => {
    drag.current.down = null;
    ref.current?.classList.remove("dragging");
  };
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  };
  const nudge = (dir) => ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.6, behavior: "smooth" });

  return (
    <div className={"rail" + (edge.l ? " can-l" : "") + (edge.r ? " can-r" : "")}>
      <button className="rail-btn l" type="button" tabIndex={-1} aria-label="往左捲動區域" onClick={() => nudge(-1)}>
        <i className="bi bi-chevron-left" />
      </button>
      <div
        ref={ref}
        className="chips"
        role="group"
        aria-label={label}
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {options.map((a) => (
          <button key={a} className="chip" aria-pressed={a === value} onClick={() => onPick(a)}>
            {a}
            {counts && <span style={{ opacity: 0.7 }}> {counts[a] ?? 0}</span>}
          </button>
        ))}
      </div>
      <button className="rail-btn r" type="button" tabIndex={-1} aria-label="往右捲動區域" onClick={() => nudge(1)}>
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
}
