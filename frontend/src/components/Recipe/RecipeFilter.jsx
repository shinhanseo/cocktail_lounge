// frontend/src/components/Recipe/RecipeFilter.jsx
import { useSearchParams } from "react-router-dom";

const BASE_OPTIONS = [
  "진",
  "보드카",
  "럼",
  "위스키",
  "데킬라",
  "리큐어",
  "와인",
  "논알콜",
];
const TASTE_OPTIONS = [
  "달콤",
  "상큼",
  "탄산",
  "소금림",
  "라임",
  "민트",
  "비터",
  "새콤",
  "크랜베리",
  "스파클링",
  "진저비어",
  "과일",
  "오렌지",
  "커피",
];

export default function RecipeFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const bases = (searchParams.get("bases") ?? "")
    .split(",")
    .filter((v) => v.length > 0);

  const tastes = (searchParams.get("tastes") ?? "")
    .split(",")
    .filter((v) => v.length > 0);

  const updateParams = (updater) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next);
  };

  const toggleArrayParam = (key, value) => {
    updateParams((next) => {
      const current = (next.get(key) ?? "")
        .split(",")
        .filter((v) => v.length > 0);

      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      if (updated.length === 0) next.delete(key);
      else next.set(key, updated.join(","));
    });
  };

  const toggleBase = (v) => toggleArrayParam("bases", v);
  const toggleTaste = (v) => toggleArrayParam("tastes", v);

  const clearFilters = () => {
    updateParams((next) => {
      next.delete("bases");
      next.delete("tastes");
    });
  };

  return (
    <aside className="md:w-64 w-full border border-white/10 rounded-2xl p-5 md:top-24 h-fit">
      {/* 제목 */}
      <h3 className="text-white font-bold text-lg mb-5">필터</h3>

      {/* 기주 */}
      <FilterSection title="기주">
        {BASE_OPTIONS.map((base) => (
          <CheckboxRow
            key={base}
            label={base}
            checked={bases.includes(base)}
            onToggle={() => toggleBase(base)}
          />
        ))}
      </FilterSection>

      {/* 맛 */}
      <FilterSection title="맛">
        {TASTE_OPTIONS.map((taste) => (
          <CheckboxRow
            key={taste}
            label={taste}
            checked={tastes.includes(taste)}
            onToggle={() => toggleTaste(taste)}
          />
        ))}
      </FilterSection>

      {(bases.length > 0 || tastes.length > 0) && (
        <button
          onClick={clearFilters}
          className="mt-4 w-full text-xs border border-white/30 rounded-full py-1 text-white/70 hover:bg-white/10"
        >
          필터 초기화
        </button>
      )}
    </aside>
  );
}

/* ----------------- 서브 컴포넌트 ----------------- */

function FilterSection({ title, children }) {
  return (
    <section className="mb-6">
      <p className="text-xs text-white/60 mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function CheckboxRow({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 w-full py-1 text-sm text-white/80 hover:text-white"
    >
      {/* 네모 체크박스 */}
      <span
        className={`h-4 w-4 rounded-[4px] border border-white/40 flex items-center justify-center
          ${checked ? "bg-white" : "bg-transparent"}`}
      >
        {checked && <span className="h-2 w-2 rounded-[2px] bg-black" />}
      </span>

      <span className="truncate">{label}</span>
    </button>
  );
}
