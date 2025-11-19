// frontend/src/components/Recipe/AiCocktailsRecipe.jsx
// -------------------------------------------------------------
// 🤖 AI 칵테일 상세보기 (이미지 없이 재배치 버전)
// -------------------------------------------------------------

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Trash } from "lucide-react";

export default function AiCocktailsRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`/api/gemeni/save/${id}`, {
          withCredentials: true,
        });

        setRecipe(res.data || null);
      } catch (err) {
        console.error(err);
        setError("AI 레시피를 불러오는 도중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/gemeni/save/${id}`, {
        withCredentials: true,
      });
      alert("게시글이 삭제되었습니다.");
      navigate("/mypage/myaicocktails");
    } catch (err) {
      console.log(err);
      alert("삭제 도중 오류가 발생했습니다.");
    }
  };

  const handleBack = () => {
    navigate("/mypage/myaicocktails");
  };

  if (loading) {
    return (
      <article className="max-w-3xl mx-auto mt-12 rounded-2xl p-12 bg-white/5 border border-white/10 text-white shadow animate-pulse">
        불러오는 중...
      </article>
    );
  }

  if (error)
    return <div className="text-red-400 mt-12 text-center">{error}</div>;

  if (!recipe)
    return (
      <div className="text-white mt-12 text-center">레시피가 없습니다.</div>
    );

  return (
    <article
      className="text-white max-w-3xl mx-auto
                 border border-white/10 bg-white/5 rounded-2xl p-10 mt-12
                 shadow-[0_6px_20px_rgba(0,0,0,.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
                 transition-all duration-300 backdrop-blur"
    >
      {/* ---------------- 뒤로가기 ---------------- */}
      <button
        onClick={handleBack}
        className="text-sm text-white/70 hover:text-white hover:cursor-pointer"
      >
        ← 마이페이지로
      </button>

      {/* ---------------- 제목 및 삭제 버튼---------------- */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
          {recipe.name}
        </h1>

        <button
          className="bg-white/50 hover:bg-white/30 px-3 py-1 rounded-lg text-white hover:scale-105 hover:cursor-pointer mt-2"
          onClick={handleDelete}
        >
          <Trash size={20} />
        </button>
      </div>

      {/* 기주 + 저장일 */}
      <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/70">
        {recipe.base_spirit && (
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
            기주: {recipe.base_spirit}
          </span>
        )}
        {recipe.created_at && (
          <span className="text-xs">저장일: {recipe.created_at}</span>
        )}
      </div>

      {/* ---------------- 한줄 코멘트 ---------------- */}
      {recipe.comment && (
        <p
          className="mt-6 mb-8 text-center text-base text-white/90 bg-black/20 
                      p-4 rounded-xl border border-white/10 shadow"
        >
          “{recipe.comment}”
        </p>
      )}

      {recipe.abv && (
        <p className="text-white text-lg font-semibold mb-8">
          도수 : {recipe.abv}%
        </p>
      )}

      {/* ---------------- 요청 조건 ---------------- */}
      {(recipe.taste?.length > 0 || recipe.keywords?.length > 0) && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">요청 조건</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.taste?.map((t, idx) => (
              <span
                key={`taste-${idx}`}
                className="px-2 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/40 text-xs text-cyan-200"
              >
                #{t}
              </span>
            ))}
            {recipe.keywords?.map((k, idx) => (
              <span
                key={`kw-${idx}`}
                className="px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/40 text-xs text-emerald-200"
              >
                #{k}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- 재료 ---------------- */}
      {recipe.ingredient?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">재료</h2>
          <ul className="pl-5 space-y-2 list-disc marker:text-white/60">
            {recipe.ingredient.map((ing, i) => (
              <li key={i} className="text-white/90">
                <span className="font-semibold">{ing.item}</span> — {ing.volume}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------- 만드는 법 ---------------- */}
      {recipe.step && (
        <section>
          <h2 className="text-lg font-semibold mb-2">만드는 법</h2>
          <p
            className="whitespace-pre-wrap leading-relaxed text-white/90 text-sm 
                        bg-black/20 border border-white/10 p-4 rounded-xl shadow"
          >
            {recipe.step}
          </p>
        </section>
      )}
    </article>
  );
}
