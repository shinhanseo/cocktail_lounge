// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import naverLogin from "@/assets/naver.svg";

axios.defaults.withCredentials = true;

// 로그인 페이지
export default function Login() {
  const [form, setForm] = useState({ login_id: "", password: "" }); // 로그인 폼
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [msg, setMsg] = useState("");
  const [fieldErr, setFieldErr] = useState({}); // 필드 에러
  const navigate = useNavigate();

  const setUser = useAuthStore((s) => s.setUser); // 사용자 정보 설정

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value })); // 입력값 업데이트
    setMsg("");
    setFieldErr((p) => ({ ...p, [name]: "" })); // 필드 에러 초기화
  };

  const validate = () => {
    const e = {}; // 에러 객체
    if (!form.login_id.trim()) e.login_id = "아이디를 입력하세요.";
    if (!form.password) e.password = "비밀번호를 입력하세요.";
    setFieldErr(e); // 필드 에러 설정
    return Object.keys(e).length > 0; // 에러 객체의 키 개수가 0보다 크면 true, 아니면 false
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 처리
    const next = encodeURIComponent("/");
    window.location.href = `http://localhost:4000/api/oauth/google?next=${next}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (validate()) return;

    try {
      setLoading(true); // 로딩 상태 업데이트
      setMsg("");

      const res = await axios.post("http://localhost:4000/api/login", form, {
        withCredentials: true,
      });

      setUser(res.data.user); // 사용자 정보 설정

      navigate("/"); // 루트 페이지로 이동
    } catch (error) {
      const serverMsg =
        error?.response?.data?.message ||
        (error?.message?.includes("Network")
          ? "서버와 연결할 수 없습니다."
          : "아이디 또는 비밀번호가 올바르지 않습니다.");
      setMsg(serverMsg); // 서버 메시지 설정
    } finally {
      setLoading(false); // 로딩 상태 초기화
    }
  };

  return (
    <main>
      <div className="w-[320px] h-[280px] border border-white/10 text-white bg-white/5 rounded-4xl">
        {" "}
        {/* 로그인 폼 컨테이너 */}
        <p className="font-bold text-3xl text-[#17BEBB] text-center pt-5">
          Login {/* 로그인 폼 제목 */}
        </p>
        {msg && (
          <div className="text-center text-red-300 mt-3 text-sm">{msg}</div>
        )}
        <form
          className="text-center mt-4 text-gray-900 placeholder-gray-500"
          onSubmit={onSubmit}
          noValidate
        >
          <div>
            <input
              type="text"
              name="login_id"
              placeholder="아이디를 입력하세요."
              className="bg-white w-60 h-10 pl-3 rounded"
              value={form.login_id}
              onChange={onChange}
              autoComplete="username"
            />
            {fieldErr.login_id && (
              <div className="text-xs text-red-300 mt-1">
                {fieldErr.login_id}
              </div>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요."
              className="bg-white mt-5 w-60 h-10 pl-3 rounded"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
            />
            {fieldErr.password && (
              <div className="text-xs text-red-300 mt-1">
                {fieldErr.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`text-white w-60 h-10 bg-button mt-4 rounded-2xl hover:bg-button-hover hover:cursor-pointer ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "처리 중..." : "로그인 하기"}
          </button>
        </form>
        <div className="text-white text-center text-sm mt-2 mb-4">
          회원이 아니신가요?{" "}
          <span className="text-button hover:cursor-pointer hover:text-button-hover">
            <Link to="/signup">회원가입하기</Link>
          </span>
        </div>
      </div>

      {/* Oauth 관련 인터페이스스 */}
      <div className="text-white text-center mt-2 mb-4 font-bold text-xl mt-6">
        간편 로그인
      </div>
      <div className="flex justify-center gap-4 border-t border-white/10 pt-4">
        {/* 구글 */}
        <button
          onClick={handleGoogleLogin}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow flex items-center space-x-3 hover:cursor-pointer hover:scale-105 transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            className="w-7 h-7"
          />
        </button>

        {/* 네이버 */}
        <button
          //onClick={handleGoogleLogin}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow flex items-center space-x-3 hover:cursor-pointer hover:scale-105 transition"
        >
          <img src={naverLogin} alt="Naver logo" className="w-7 h-7" />
        </button>
      </div>
    </main>
  );
}
