import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import axios from "axios";

export default function InfoMe() {
  const { user, setUser } = useAuthStore();

  //수정 모드
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    nickname: user?.nickname || "",
  });

  const handleSave = async () => {
    try {
      const res = await axios.put("http://localhost:4000/api/auth/me", form);
      setUser(res.data.user); // Zustand 전역 업데이트
      alert("수정이 완료되었습니다!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

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
            {editMode ? (
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-white/10 rounded-lg p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <span className="font-medium">{user.name}</span>
            )}
          </div>

          {/* 아이디 */}
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">아이디</span>
            <span className="font-semibold text-white">{user.login_id}</span>
          </div>

          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">닉네임</span>
            {editMode ? (
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="bg-white/10 rounded-lg p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <span className="font-medium">{user.nickname}</span>
            )}
          </div>

          {/* 수정 버튼 */}
          <div className="flex justify-center mt-6">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-lg bg-button hover:bg-button-hover text-white mr-3 hover:cursor-pointer"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white hover:cursor-pointer"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                className="px-6 py-2 rounded-lg bg-button hover:bg-button-hover text-white font-semibold shadow-md hover:cursor-pointer"
                onClick={() => setEditMode(true)}
              >
                정보 수정
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-6">로그인이 필요합니다.</p>
      )}
    </div>
  );
}
