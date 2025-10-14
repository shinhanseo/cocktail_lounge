import search from "@/assets/search.svg";

export default function HeaderSearch() {
  return (
    <>
      <form className="flex justify-center relative">
        <input
          type="search"
          placeholder="오늘의 한잔을 찾아보세요."
          className="w-150 h-10 
      bg-white rounded-4xl border-2 
      border-black/50 px-4 pr-10
      text-gray-900 placeholder-gray-500"
        ></input>
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
        >
          <img src={search} className="w-5 h-5 text-gray-500"></img>
        </button>
      </form>
    </>
  );
}
