// src/pages/SignUp.jsx
// -------------------------------------------------------------
// 👤 SignUp
// - 회원가입 폼(UI + 클라이언트 유효성 검사)
// - email 필드 UI/검증 추가
// - 입력별 인라인 에러 메시지 + 최종 제출 전 전체 검사
// -------------------------------------------------------------

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";
import api from "@/lib/api";

// 간단한 정규식들
const ID_RE = /^[a-zA-Z0-9_]{4,20}$/; // 영문/숫자/밑줄 4~20자
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/; // 8자 이상, 영문+숫자+특수문자
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 기본 이메일 패턴
const BIRTH_RE = /^\d{8}$/; // YYYYMMDD (8자리)
const PHONE_RE = /^\d{9,15}$/; // 숫자 9~15자리(하이픈 제외)

export default function SignUp() {
  const navigate = useNavigate();

  // --- 폼 상태 ---
  const [form, setForm] = useState({
    id: "", // 아이디(= login_id)
    password: "", // 비밀번호
    email: "", // 이메일 추가
    name: "", // 이름
    birthday: "", // 생년월일(YYYYMMDD)
    phone: "", // 전화번호(숫자만)
  });

  const [loading, setLoading] = useState(false);

  // --- 인라인 에러 상태 (필드별 메시지) ---
  const [err, setErr] = useState({
    id: "",
    password: "",
    email: "",
    name: "",
    birthday: "",
    phone: "",
  });

  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openFailModal, setOpenFailModal] = useState(false);
  const [failMsg, setFailMsg] = useState("");

  // --- 단일 필드 유효성 검사 & 에러메시지 세팅 ---
  const validateField = (name, value) => {
    let message = "";

    if (name === "id") {
      if (value && !ID_RE.test(value)) {
        message = "아이디는 4~20자 영문/숫자/밑줄만 가능합니다.";
      }
    }

    if (name === "password") {
      if (value && !PW_RE.test(value)) {
        message = "8자 이상, 영문·숫자·특수문자를 포함해야 합니다.";
      }
    }

    if (name === "email") {
      if (value && !EMAIL_RE.test(value)) {
        message = "올바른 이메일 형식이 아닙니다.";
      }
    }

    if (name === "name") {
      if (value !== undefined && value.trim().length === 0) {
        message = "이름을 입력하세요.";
      }
    }

    if (name === "birthday") {
      if (value && !BIRTH_RE.test(value)) {
        message = "생년월일은 YYYYMMDD 형식의 8자리 숫자여야 합니다.";
      }
    }

    if (name === "phone") {
      if (value && !PHONE_RE.test(value)) {
        message = "전화번호는 숫자 9~15자리여야 합니다. (- 제외)";
      }
    }

    setErr((p) => ({ ...p, [name]: message }));
    return message === "";
  };

  // --- 전체 유효성 검사 (submit 직전) ---
  const validateAll = () => {
    const results = {
      id: form.id && ID_RE.test(form.id),
      password: form.password && PW_RE.test(form.password),
      email: form.email && EMAIL_RE.test(form.email),
      name: !!form.name.trim(),
      birthday: form.birthday && BIRTH_RE.test(form.birthday),
      phone: form.phone && PHONE_RE.test(form.phone),
    };
    return Object.values(results).every(Boolean);
  };

  // --- 입력 핸들러 (전화/생일은 숫자만 허용) ---
  const onChange = (e) => {
    const { name, value } = e.target;

    let next = value;
    if (name === "phone" || name === "birthday") {
      next = value.replace(/\D/g, ""); // 숫자 외 제거
    }

    setForm((prev) => ({ ...prev, [name]: next }));
    // 인라인 즉시 검증
    validateField(name, next);
  };

  // --- 제출 ---
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      setInfoMsg("입력값을 확인해 주세요.");
      setOpenInfoModal(true);
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/signup", {
        login_id: form.id,
        password: form.password,
        email: form.email,
        name: form.name,
        birthday: form.birthday,
        phone: form.phone,
      });

      setOpenSuccessModal(true);
    } catch (error) {
      const msg = error.response?.data?.message || "회원가입에 실패했습니다.";
      setFailMsg(msg);
      setOpenFailModal(true);
    } finally {
      setLoading(false);
    }
  };

  // --- 렌더 ---
  return (
    <main>
      <div className="w-100 h-135 border border-white/10 text-white bg-white/5 rounded-4xl mt-12">
        <p className="font-bold text-3xl text-title text-center pt-5 mb-3">
          회원가입
        </p>

        {/* 회원가입 폼 */}
        <form
          className="text-gray-900 placeholder-gray-500"
          onSubmit={onSubmit}
          noValidate
        >
          {/* 아이디 */}
          <div className="flex flex-col items-start mx-10">
            <label htmlFor="id" className="block font-bold text-white">
              아이디
            </label>
            <input
              id="id"
              type="text"
              name="id"
              placeholder="아이디"
              value={form.id}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
              autoComplete="username"
            />
            <div className="text-xs text-button">{err.id}</div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col items-start mx-10">
            <label htmlFor="password" className="block font-bold text-white">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
              autoComplete="new-password"
            />
            <div className="text-xs text-button">{err.password}</div>
          </div>

          {/* 이메일 */}
          <div className="flex flex-col items-start mx-10">
            <label htmlFor="email" className="block font-bold text-white">
              이메일
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="example@domain.com"
              value={form.email}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
              autoComplete="email"
              inputMode="email"
            />
            <div className="text-xs text-button">{err.email}</div>
          </div>

          {/* 이름 */}
          <div className="flex flex-col items-start mx-10">
            <label htmlFor="name" className="block font-bold text-white">
              이름
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="이름"
              value={form.name}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
              autoComplete="name"
            />
            <div className="text-xs text-button">{err.name}</div>
          </div>

          {/* 생년월일 */}
          <div className="flex flex-col items-start mx-10">
            <label htmlFor="birthday" className="block font-bold text-white">
              생년월일
            </label>
            <input
              id="birthday"
              type="text"
              name="birthday"
              placeholder="생년월일 8자리 (예: 20010101)"
              value={form.birthday}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
              inputMode="numeric"
              maxLength={8}
            />
            <div className="text-xs text-button">{err.birthday}</div>
          </div>

          {/* 전화번호 */}
          <div className="flex flex-col items-start mx-10">
            <label htmlFor="phone" className="block font-bold text-white">
              전화번호
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="숫자만 입력 (- 제외)"
              value={form.phone}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
              inputMode="numeric"
              maxLength={15}
            />
            <div className="text-xs text-button">{err.phone}</div>
          </div>

          {/* 제출 버튼 */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`text-white w-60 h-10 bg-button mt-4 rounded-2xl hover:bg-button-hover hover:cursor-pointer hover:font-bold ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "처리 중..." : "회원 가입"}
            </button>
          </div>
        </form>
      </div>

      <CommonModal
        open={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        title="알림"
        message={infoMsg}
        cancelText="확인"
      />

      <CommonModal
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
        title="회원가입 완료!"
        message="로그인 페이지로 이동할까요?"
        cancelText="닫기"
        confirmText="로그인 하러가기"
        onConfirm={() => {
          setOpenSuccessModal(false);
          navigate("/login");
        }}
      />

      <CommonModal
        open={openFailModal}
        onClose={() => setOpenFailModal(false)}
        title="회원가입 실패"
        message={failMsg}
        cancelText="닫기"
      />
    </main>
  );
}
