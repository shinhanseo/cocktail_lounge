import BarCity from "@/components/Map/BarCity";

export default function Map() {
  return (
    <div>
      <div className="text-white text-xl text-center mt-12">
        내 주변의 분위기 좋은 Bar를 찾아보세요!
      </div>
      <BarCity />
    </div>
  );
}
