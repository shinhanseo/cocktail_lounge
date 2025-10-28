// 회원가입 페이지
import { useState } from "react";
import axios from "axios";

export default function SignUp() {
  const [form, setForm] = useState({
    id: "",
    password: "",
    name: "",
    birthday: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault(); // 새로고침 방지
    try {
      setLoading(true);
      // TODO: 실제 API 호출
      // await axios.post("http://localhost:4000/api/auth/signup", { ... });
      console.log("submit!", form);
      alert("제출 테스트: 콘솔 확인");
    } catch (err) {
      console.error(err);
      alert("에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main>
      <div className="w-100 h-120 border border-white/10 text-white bg-white/5 rounded-4xl mt-12">
        <p className="font-bold text-3xl text-[#17BEBB] text-center pt-5 mb-3">
          CockTail Rounge🍹
        </p>
        <form className="text-gray-900 placeholder-gray-500">
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
            ></input>
            <div className="text-xs text-red">
              아이디는 4~20자 영문/숫자/밑줄만 가능합니다.
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
            ></input>
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
            ></input>
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
            ></input>
          </div>

          {/* 전화번호 */}
          <div className="flex flex-col items-start mx-10">
            <label className="block font-bold text-white">전화번호</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="전화번호"
              value={form.phone}
              onChange={onChange}
              className="w-80 bg-white rounded-lg px-3 py-2"
            ></input>
          </div>

          {/* 회원가입 버튼 */}
          <div className="text-center">
            <input
              type="submit"
              value={"회원 가입"}
              className="text-white w-60 h-10 bg-button mt-4 rounded-2xl hover:bg-button-hover hover:cursor-pointer hover:font-bold"
            ></input>
          </div>
        </form>
      </div>
    </main>
  );
}
