import { useAuthStore } from "@/store/useAuthStore";

export default function InfoMe() {
  const user = useAuthStore((s) => s.user);

  return (
    <div
      className="bg-[#1a1b26] text-white border border-white/10 bg-white/5 rounded-4xl p-8 w-[350px] h-fit "
      style={{
        width: "700px",
        minWidth: "700px",
        maxWidth: "700px",
      }}
    >
      <h2 className="text-xl font-semibold mb-6 text-center border-b border-white/10 pb-3">
        내 정보
      </h2>

      {user ? (
        <div className="space-y-5">
          {/* 이름 */}
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">이름</span>
            <span className="font-medium">{user.name}</span>
          </div>

          {/* 아이디 */}
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">아이디</span>
            <span className="font-semibold text-white">{user.login_id}</span>
          </div>

          {/* 수정 버튼 */}
          <div className="flex justify-center mt-6">
            <button
              className="px-6 py-2 rounded-lg bg-button hover:bg-button-hover hover:cursor-pointer transition text-white font-semibold shadow-md"
              onClick={() => alert("정보 수정 페이지는 준비 중입니다.")}
            >
              정보 수정
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-6">로그인이 필요합니다.</p>
      )}
    </div>
  );
}
