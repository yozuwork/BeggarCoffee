/* 圖片載入失敗時的封面插畫 */
const PALETTES = [
  ["#c98f4a", "#6b4226", "#f5e6cf"], ["#8a5a3b", "#3b2418", "#efd9bc"], ["#d7b48a", "#7a4b2d", "#fff4e2"],
  ["#a8693c", "#2e1f16", "#f2dcc0"], ["#6f8a64", "#3d2a1d", "#efe4cc"], ["#b9573f", "#3b2418", "#f7e3cf"],
  ["#4f6b78", "#2e1f16", "#efe2cf"], ["#c7a26b", "#5a3a27", "#fff2dc"]
];
const INK = "#2e1f16";

function Art({ v, p }) {
  if (v === 0)
    return (
      <>
        <path d="M62 92h66l-7 52a8 8 0 0 1-8 7H77a8 8 0 0 1-8-7z" fill={p[2]} stroke={INK} strokeWidth="3" />
        <path d="M128 102c16 0 16 26 0 26" fill="none" stroke={INK} strokeWidth="3" />
        <ellipse cx="95" cy="92" rx="33" ry="7" fill={p[1]} stroke={INK} strokeWidth="3" />
        <path d="M85 80c-6-8 6-12 0-22M100 80c-6-8 6-12 0-22" fill="none" stroke={p[2]} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="95" cy="156" rx="48" ry="6" fill={INK} opacity=".25" />
      </>
    );
  if (v === 1)
    return (
      <>
        <circle cx="100" cy="102" r="50" fill={p[2]} stroke={INK} strokeWidth="3" />
        <circle cx="100" cy="102" r="36" fill={p[1]} stroke={INK} strokeWidth="3" />
        <path d="M100 120c-18-12-20-26-10-30 5-2 9 1 10 5 1-4 5-7 10-5 10 4 8 18-10 30z" fill={p[2]} />
        <path d="M150 102c14 0 14 18 0 18" fill="none" stroke={INK} strokeWidth="3" />
      </>
    );
  if (v === 2)
    return (
      <>
        <path d="M70 70h60l-30 40z" fill={p[2]} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="72" y="112" width="56" height="40" rx="8" fill={p[1]} stroke={INK} strokeWidth="3" opacity=".95" />
        <path d="M100 110v8" stroke={p[1]} strokeWidth="4" strokeLinecap="round" />
        <path d="M78 128h44" stroke={p[2]} strokeWidth="2.5" opacity=".6" />
      </>
    );
  return (
    <>
      <rect x="56" y="78" width="88" height="74" fill={p[2]} stroke={INK} strokeWidth="3" />
      <path d="M50 78h100l-8-18H58z" fill={p[1]} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 60v18M78 60v18M94 60v18M110 60v18M126 60v18M142 60v18" stroke={p[2]} strokeWidth="4" opacity=".7" />
      <rect x="88" y="104" width="24" height="48" fill={p[1]} stroke={INK} strokeWidth="3" />
      <rect x="64" y="96" width="18" height="20" fill="#fff8ec" stroke={INK} strokeWidth="2.5" />
      <rect x="118" y="96" width="18" height="20" fill="#fff8ec" stroke={INK} strokeWidth="2.5" />
    </>
  );
}

export default function CoverArt({ cafe }) {
  const s = cafe.seed;
  const p = PALETTES[s % PALETTES.length];
  return (
    <svg viewBox="0 0 200 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="200" height="170" fill={p[0]} />
      {Array.from({ length: 14 }, (_, k) => (
        <circle key={k} cx={(s * 37 + k * 53) % 200} cy={(s * 23 + k * 71) % 120} r={1.4 + (k % 3)} fill={p[2]} opacity=".35" />
      ))}
      <text x="172" y="44" textAnchor="middle" fontFamily="jf-openhuninn,sans-serif" fontSize="34" fontWeight="700" fill={p[1]} opacity=".55">
        {cafe.name.charAt(0)}
      </text>
      <Art v={s % 4} p={p} />
    </svg>
  );
}
