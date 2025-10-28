// 회원가입 페이지
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id: "",
    password: "",
    name: "",
    birthday: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (
      !/^[a-zA-Z0-9_]{4,20}$/.test(form.id) ||
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(form.password) ||
      !form.name.trim() ||
      !/^\d{8}$/.test(form.birthday) ||
      !/^\d{9,15}$/.test(form.phone)
    ) {
      return true;
    }
    return false;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault(); // 새로고침 방지

    if (validate()) {
      alert("회원가입 형식을 지켜야 합니다.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:4000/api/signup", {
        login_id: form.id,
        password: form.password,
        name: form.name,
        birthday: form.birthday,
        phone: form.phone,
      });
      alert("회원가입 완료!");
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "회원가입에 실패했습니다.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="w-100 h-120 border border-white/10 text-white bg-white/5 rounded-4xl mt-12">
        <p className="font-bold text-3xl text-title text-center pt-5 mb-3">
          CockTail Rounge🍹
        </p>

        <form
          className="text-gray-900 placeholder-gray-500"
          onSubmit={onSubmit}
          noValidate
        >
          {/* 아이디 */}
          <div className="flex flex-col items-start mx-10">
            <label className="block font-bold text-white">아이디</label>
            <input
              id="id"
              type="text"
              name="id"
              placeholder="아이디"
              value={form.id}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
            />
            <div className="text-xs text-button">
              {form.id.length > 0 && !/^[a-zA-Z0-9_]{4,20}$/.test(form.id)
                ? "아이디는 4~20자 영문/숫자/밑줄만 가능합니다."
                : ""}
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col items-start mx-10">
            <label className="block font-bold text-white">비밀번호</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
            />
            <div className="text-xs text-button">
              {form.password.length > 0 &&
              !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(
                form.password
              )
                ? "8자 이상, 영문·숫자·특수문자를 포함해야 합니다."
                : ""}
            </div>
          </div>

          {/* 이름 */}
          <div className="flex flex-col items-start mx-10">
            <label className="block font-bold text-white">이름</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="이름"
              value={form.name}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
            />
          </div>

          {/* 생년월일 */}
          <div className="flex flex-col items-start mx-10">
            <label className="block font-bold text-white">생년월일</label>
            <input
              id="birthday"
              type="text"
              name="birthday"
              placeholder="생년월일 8자리"
              value={form.birthday}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
            />
            <div className="text-xs text-button">
              {form.birthday.length > 0 && !/^\d{8}$/.test(form.birthday)
                ? "생년월일은 YYYYMMDD 형식의 8자리 숫자여야 합니다."
                : ""}
            </div>
          </div>

          {/* 전화번호 */}
          <div className="flex flex-col items-start mx-10">
            <label className="block font-bold text-white">전화번호</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="전화번호 '-' 제외"
              value={form.phone}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
            />
            <div className="text-xs text-button">
              {form.phone.length > 0 && !/^\d{9,15}$/.test(form.phone)
                ? "전화번호는 숫자 9~15자리여야 합니다. (- 제외)"
                : ""}
            </div>
          </div>

          {/* 회원가입 버튼 */}
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
    </main>
  );
}
