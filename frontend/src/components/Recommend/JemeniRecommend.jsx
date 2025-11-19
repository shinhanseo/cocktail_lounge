import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import GuideModal from "@/components/Recommend/GuideModal";

export default function JemeniRecommend() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  // 입력 폼 상태
  const [requirements, setRequirements] = useState({
    baseSpirit: "",
    rawTaste: "",
    rawKeywords: "",
    abv: "",
  });

  // 가이드 상태 관리
  const [openGuide, setOpenGuide] = useState(false);

  // 레시피 결과
  const [recipe, setRecipe] = useState(null);

  // 로딩 / 에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 저장 관련 상태
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // 레시피를 생성할 때 사용된 "요청 조건" 스냅샷
  const [requestTags, setRequestTags] = useState({
    taste: "",
    keywords: "",
    abv: "",
  });

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequirements((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 제출 (레시피 생성)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecipe(null);
    setSaveMessage("");

    if (!isLoggedIn) {
      alert("로그인을 하셔야 해당 기능이 이용가능합니다.");
      navigate("/login");
      setLoading(false);
      return;
    }

    if (!requirements.baseSpirit && !requirements.rawTaste) {
      setError("맛 또는 기주 중 하나는 입력해야 합니다.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        baseSpirit: requirements.baseSpirit,
        rawTaste: requirements.rawTaste,
        rawKeywords: requirements.rawKeywords,
        abv: requirements.abv,
      };

      const res = await axios.post(
        "http://localhost:4000/api/gemeni", // ← 레시피 생성 라우터
        payload,
        { withCredentials: true }
      );

      // 이 시점의 요청 조건을 스냅샷으로 고정
      setRequestTags({
        taste: requirements.rawTaste,
        keywords: requirements.rawKeywords,
        abv: requirements.abv,
      });

      setRecipe(res.data.recipe);
    } catch (err) {
      console.error("API 호출 오류:", err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        "서버 연결에 문제가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 레시피 저장
  const handleSave = async () => {
    if (!isLoggedIn) {
      alert("로그인을 하셔야 레시피를 저장할 수 있습니다.");
      navigate("/login");
      return;
    }

    if (!recipe) {
      alert("저장할 레시피가 없습니다.");
      return;
    }

    try {
      setSaveLoading(true);
      setSaveMessage("");

      const payload = {
        name: recipe.name,
        ingredient: recipe.ingredient, // [{ item, volume }, ...]
        step: recipe.step, // string 또는 string[]
        comment: recipe.comment,
        base: recipe.ingredient?.[0]?.item,
        rawTaste: requestTags.taste,
        rawKeywords: requestTags.keywords,
        abv: requestTags.abv,
      };

      const res = await axios.post(
        "http://localhost:4000/api/gemeni/save",
        payload,
        { withCredentials: true }
      );

      alert("AI 레시피가 저장되었습니다.");
      setSaveMessage(
        res.data?.message || "마이페이지에 레시피가 저장되었습니다."
      );
    } catch (err) {
      console.error("레시피 저장 오류:", err);
      const msg =
        err.response?.data?.error || "레시피 저장 중 오류가 발생했습니다.";
      setSaveMessage(msg);
      alert(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
      {/* 상단 타이틀 섹션 */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center rounded-full border border-button bg-button px-3 py-1 text-xs font-medium text-white">
          🍸 AI 칵테일 바텐더
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          나만의 <span className="text-button"> 칵테일 레시피</span> 생성기
        </h2>
        <p className="mt-3 text-sm md:text-base text-gray-300">
          기주, 맛, 키워드를 입력하면 Ai가 바텐더처럼 레시피를 만들어줍니다.
        </p>
        <button
          type="button"
          onClick={() => setOpenGuide(true)}
          className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] text-gray-200 hover:bg-white/10 hover:border-button hover:text-white transition"
        >
          📖 맞춤 칵테일 가이드 보기
        </button>
      </div>

      {/* 메인 2열 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* 왼쪽: 입력 카드 */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md p-5 md:p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              기주(Base Spirit)
            </label>
            <input
              type="text"
              name="baseSpirit"
              value={requirements.baseSpirit}
              onChange={handleChange}
              placeholder="예: Gin, Vodka, Rum"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              원하는 맛(Taste)
            </label>
            <input
              type="text"
              name="rawTaste"
              value={requirements.rawTaste}
              onChange={handleChange}
              placeholder="쉼표로 구분: 상큼, 달콤, 쌉싸름"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              추가 재료/키워드(Keywords)
            </label>
            <input
              type="text"
              name="rawKeywords"
              value={requirements.rawKeywords}
              onChange={handleChange}
              placeholder="쉼표로 구분: 레몬, 민트, 토닉워터"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              도수 (alcohol by volume, ABV)
            </label>
            <input
              type="text"
              name="abv"
              value={requirements.abv}
              onChange={handleChange}
              placeholder="도수 입력(숫자만 입력해주세요)"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent"
            />
          </div>

          {/* 에러 메시지 (폼 안쪽) */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
              🚫 {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg bg-button hover:bg-button-hover hover:cursor-pointer disabled:opacity-60"
          >
            {loading ? "🍹 레시피 생성 중..." : "칵테일 추천받기"}
          </button>

          <p className="mt-1 text-[11px] text-gray-400">
            * 기주 또는 맛 중 하나만 적어도 괜찮아요. 둘 다 적으면 더
            정교해집니다.{" "}
            <p className="mt-1 text-[11px] text-gray-400">
              * 요청하신 기주와 풍미 조건을 충족하기 위해 도수(ABV)는 일부
              달라질 수 있습니다.
            </p>
          </p>
        </form>

        {/* 오른쪽: 결과 카드 */}
        <div className="w-full bg-white/5 border border-button rounded-2xl shadow-xl backdrop-blur-md p-5 md:p-6 min-h-[260px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span>🍸 추천 레시피</span>
              {recipe && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-button border text-[10px] font-semibold ">
                  AI Generated
                </span>
              )}
            </h3>

            {/* 레시피 저장 버튼 (레시피 있을 때만) */}
            {recipe && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="text-[11px] px-3 py-1 rounded-full border border-button text-white bg-button hover:bg-button-hover hover:cursor-pointer transition disabled:opacity-60"
              >
                {saveLoading ? "저장 중..." : "마이페이지에 저장"}
              </button>
            )}
          </div>

          {/* 상태별 렌더링 */}
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-300 gap-2">
              <LoaderCircle className="w-5 h-5 animate-spin animate-pulse" />
              <span>Ai가 레시피를 만들고 있어요..</span>
            </div>
          )}

          {!loading && !recipe && !error && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
              <p>왼쪽에 기주와 맛을 입력하고</p>
              <p className="mt-1">✨ [칵테일 추천받기] 버튼을 눌러보세요.</p>
            </div>
          )}

          {!loading && recipe && (
            <div className="space-y-4 text-sm md:text-[15px] text-gray-100">
              {/* 칵테일 이름 */}
              <div>
                <h4 className="text-2xl font-extrabold text-button drop-shadow-md mb-1">
                  {recipe.name}
                </h4>
                <p className="text-xs text-gray-300">
                  기주 :{" "}
                  <span className="text-white font-semibold">
                    {recipe.ingredient?.[0]?.item
                      ? requirements.baseSpirit
                        ? recipe.ingredient[0].item
                        : `${recipe.ingredient[0].item} (AI가 자동 선택)`
                      : "AI가 자동 선택"}
                  </span>
                </p>
                <p className="text-xs text-gray-300 mt-4">
                  도수 : {recipe.abv}%
                </p>
              </div>

              {/* 재료 목록 */}
              <div>
                <p className="font-semibold mb-1 text-gray-200">재료</p>
                <ul className="list-disc list-inside ml-3 space-y-0.5 text-[13px]">
                  {recipe.ingredient?.map((item, index) => (
                    <li key={index}>
                      <span className="font-medium text-white">
                        {item.item}
                      </span>
                      <span className="text-gray-300"> - {item.volume}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 제조 과정 */}
              <div>
                <p className="font-semibold mb-1 text-gray-200">제조 방법</p>
                <p className="whitespace-pre-wrap text-[13px] text-gray-100 leading-relaxed">
                  {recipe.step}
                </p>
              </div>

              {/* 한줄 코멘트 */}
              <div>
                <p className="font-semibold mb-1 text-gray-200">한줄 맛 표현</p>
                <p className="whitespace-pre-wrap text-[13px] text-gray-100 leading-relaxed">
                  {recipe.comment}
                </p>
              </div>

              {/* 맛/키워드 태그: "요청 당시 스냅샷" 기준 */}
              {(requestTags.taste || requestTags.keywords) && (
                <div className="pt-1 border-t border-white/10 mt-2">
                  <p className="text-[11px] text-gray-400 mb-1">요청 조건</p>
                  <div className="flex flex-wrap gap-1.5">
                    {requestTags.taste &&
                      requestTags.taste
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((t, idx) => (
                          <span
                            key={`taste-${idx}`}
                            className="px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/40 text-[11px] text-cyan-200"
                          >
                            #{t}
                          </span>
                        ))}

                    {requestTags.keywords &&
                      requestTags.keywords
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((k, idx) => (
                          <span
                            key={`kw-${idx}`}
                            className="px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/40 text-[11px] text-cyan-200"
                          >
                            #{k}
                          </span>
                        ))}
                  </div>
                </div>
              )}

              {/* 저장 결과 메시지 */}
              {saveMessage && (
                <p className="text-[11px] text-gray-300 mt-1">{saveMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <GuideModal open={openGuide} onClose={() => setOpenGuide(false)} />
    </div>
  );
}
