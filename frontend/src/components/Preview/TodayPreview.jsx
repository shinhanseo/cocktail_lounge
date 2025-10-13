export default function TodayPreview() {
  return (
    <section
      className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
             shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
             transition-shadow duration-300"
    >
      <h2 className="text-xl font-bold mb-2">컨텐츠 프리뷰</h2>
      <div className="flex gap-6 justify-center mt-24">
        <div className="bg-white/10 rounded-2xl p-4 w-[200px] hover:scale-105 transition-all text-center">
          업데이트 예정
        </div>
      </div>
    </section>
  );
}
