// frontend/src/components/Recipe/AiCocktailsRecipe.jsx
//-------------------------------------------------------------
// AI 칵테일 상세보기 (일반 레시피 상세페이지 구조와 동일하게 재배치)
//-------------------------------------------------------------

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Trash } from "lucide-react";
import CommonModal from "@/components/CommonModal";

export default function AiCocktailsRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openDeleteDone, setOpenDeleteDone] = useState(false);
  const [openDeleteFail, setOpenDeleteFail] = useState(false);
  const [deleteFailMsg, setDeleteFailMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
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

  const doDelete = async () => {
    try {
      await axios.delete(`/api/gemeni/save/${id}`, {
        withCredentials: true,
      });
      setOpenDeleteConfirm(false);
      setOpenDeleteDone(true);
    } catch (err) {
      console.log(err);
      setDeleteFailMsg(
        err?.response?.data?.error || "삭제 도중 오류가 발생했습니다."
      );
      setOpenDeleteFail(true);
    }
  };

  const handleBack = () => navigate("/mypage/myaicocktails");

  if (loading)
    return (
      <article className="max-w-4xl mx-auto mt-12 p-12 text-white bg-white/5 border border-white/10 rounded-2xl animate-pulse">
        불러오는 중...
      </article>
    );

  if (error)
    return <div className="text-red-400 text-center mt-10">{error}</div>;

  if (!recipe)
    return (
      <div className="text-white text-center mt-10">레시피가 없습니다.</div>
    );

  return (
    <article
      className="
        text-white max-w-4xl mx-auto flex flex-col md:flex-row gap-8
        border border-white/10 bg-white/5 rounded-2xl p-8 md:p-12 mt-12
        shadow-[0_6px_20px_rgba(0,0,0,.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
        transition duration-300 backdrop-blur
      "
    >
      {/* ---------------- 좌측 정보 영역 ---------------- */}
      <div className="flex-1 mr-0 md:mr-8">
        <button
          onClick={handleBack}
          className="text-sm text-white/70 hover:text-white hover:font-bold hover:cursor-pointer"
        >
          ← 마이페이지로
        </button>

        {/* 제목 + 삭제 */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
            {recipe.name}
          </h1>

          <button
            className="bg-white/50 hover:bg-white/30 px-3 py-1 rounded-lg text-white hover:scale-105 hover:cursor-pointer mt-2"
            onClick={() => setOpenDeleteConfirm(true)}
          >
            <Trash size={20} />
          </button>
        </div>

        {/* 도수 */}
        {recipe.abv && (
          <p className="text-white/70 mt-2 mb-4">도수: {recipe.abv}%</p>
        )}

        {/* 코멘트 */}
        {recipe.comment && (
          <p
            className="mt-4 mb-8 text-center text-base text-white/90 bg-black/20 
                        p-4 rounded-xl border border-white/10 shadow"
          >
            “{recipe.comment}”
          </p>
        )}

        {/* 요청 조건 */}
        {(recipe.taste?.length > 0 || recipe.keywords?.length > 0) && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">요청 조건</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.taste?.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/40 text-xs text-cyan-200"
                >
                  #{t}
                </span>
              ))}
              {recipe.keywords?.map((k, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/40 text-xs text-emerald-200"
                >
                  #{k}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="my-6 h-px bg-white/20"></div>

        {/* 재료 */}
        {recipe.ingredient?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">재료</h2>
            <ul className="pl-5 space-y-2 list-disc marker:text-white/60">
              {recipe.ingredient.map((ing, idx) => (
                <li key={idx} className="text-white/90">
                  <span className="font-semibold">{ing.item}</span> —{" "}
                  {ing.volume}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="my-6 h-px bg-white/20"></div>

        {/* 만드는 법 */}
        {recipe.step?.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2">만드는 법</h2>
            <ol className="pl-5 space-y-2 list-decimal marker:text-white/60">
              {recipe.step.map((s, idx) => (
                <li key={idx} className="text-white/90 leading-relaxed">
                  {s}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {/* ---------------- 우측 이미지 영역 ---------------- */}
      <aside className="w-full md:w-64 shrink-0">
        <div
          className="rounded-xl overflow-hidden border border-white/10 bg-black/20
                     shadow-[0_8px_24px_rgba(0,0,0,.45)]"
        >
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="object-cover w-full h-72 md:h-[340px]"
          />
        </div>

        {/* 코멘트 (보조 Box) */}
        {recipe.comment && (
          <p className="text-center mt-4 text-gray-300 px-3 py-2 bg-white/10 rounded-xl text-sm border border-white/10">
            {recipe.comment}
          </p>
        )}
      </aside>

      {/* ---------------- 모달 ---------------- */}
      <CommonModal
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        title="정말 삭제하시겠습니까?"
        message="삭제하면 되돌릴 수 없습니다."
        cancelText="취소"
        confirmText="삭제"
        confirmVariant="danger"
        onConfirm={doDelete}
      />

      <CommonModal
        open={openDeleteDone}
        onClose={() => {
          setOpenDeleteDone(false);
          navigate("/mypage/myaicocktails");
        }}
        title="삭제 완료!"
        message="레시피가 삭제되었습니다."
        cancelText="목록으로"
      />

      <CommonModal
        open={openDeleteFail}
        onClose={() => setOpenDeleteFail(false)}
        title="삭제 실패"
        message={deleteFailMsg}
        cancelText="닫기"
      />
    </article>
  );
}
