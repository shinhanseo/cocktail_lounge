// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

axios.defaults.withCredentials = true;

export default function Login() {
  const [form, setForm] = useState({ login_id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [fieldErr, setFieldErr] = useState({});
  const navigate = useNavigate();

  const setUser = useAuthStore((s) => s.setUser);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setMsg("");
    setFieldErr((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.login_id.trim()) e.login_id = "아이디를 입력하세요.";
    if (!form.password) e.password = "비밀번호를 입력하세요.";
    setFieldErr(e);
    return Object.keys(e).length > 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (validate()) return;

    try {
      setLoading(true);
      setMsg("");

      const res = await axios.post("http://localhost:4000/api/login", form, {
        withCredentials: true,
      });

      setUser(res.data.user);

      navigate("/");
    } catch (error) {
      const serverMsg =
        error?.response?.data?.message ||
        (error?.message?.includes("Network")
          ? "서버와 연결할 수 없습니다."
          : "아이디 또는 비밀번호가 올바르지 않습니다.");
      setMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="w-100 h-75 border border-white/10 text-white bg-white/5 rounded-4xl">
        <p className="font-bold text-3xl text-[#17BEBB] text-center pt-5">
          Login
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
    </main>
  );
}
