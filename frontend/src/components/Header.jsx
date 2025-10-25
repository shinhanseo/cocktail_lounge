import HeaderLogin from "@/components/Header/HeaderLogin";
import HeaderList from "@/components/Header/HeaderList";
import HeaderSearch from "@/components/Header/HeaderSerach";
import HeaderTitle from "@/components/Header/HeaderTitle";

export default function Header() {
  return (
    <header>
      <nav className="flex items-center justify-between text-white text-sm p-6 border-b border-white/10 bg-white/200">
        {/* 왼쪽 상단 웹 이름 */}
        <HeaderTitle />

        {/* 검색창 */}
        <HeaderSearch />

        {/* 기능 목록 */}
        <HeaderList />

        {/* 로그인 버튼 */}
        <HeaderLogin />
      </nav>
    </header>
  );
}
