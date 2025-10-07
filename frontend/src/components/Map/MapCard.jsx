import { useEffect, useRef } from "react";

const CENTERS = {
  인천: { lat: 37.4562557, lng: 126.7052062, zoom: 12 },
  서울: { lat: 37.5665851, lng: 126.9782038, zoom: 10 },
  부산: { lat: 35.179992, lng: 129.076815, zoom: 9 },
  경상도: { lat: 35.2378276, lng: 128.6919111, zoom: 9 },
  전라도: { lat: 34.8162186, lng: 126.4629242, zoom: 7 },
  제주: { lat: 33.4892792, lng: 126.4983426, zoom: 9 },
  충청도: { lat: 36.6591506, lng: 126.6729607, zoom: 9 },
  경기도: { lat: 37.2893482, lng: 127.0535102, zoom: 9 },
  강원도: { lat: 37.8853984, lng: 127.7297758, zoom: 9 },
};

function getCenterFor(key) {
  if (!key) return null; // ← 방어코드 추가
  const direct = CENTERS[key];
  if (direct) return direct;
  const found = Object.keys(CENTERS).find((k) => key.includes(k));
  return found ? CENTERS[found] : null;
}

export default function MapCard({
  height = 500,
  width = 1000,
  selectedBar = null,
  centerKey = "인천", // ← 기본값은 문자열
  bars = [], // ← 부모에서 전달한 목록만 사용
}) {
  const mapRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markersRef = useRef([]);
  const mapInstanceRef = useRef(null);

  const lat_home = 37.5076183;
  const lng_home = 126.7382614;

  useEffect(() => {
    const { naver } = window;
    if (!mapRef.current || !naver) return;

    // 지도 생성
    const desired = getCenterFor(centerKey);
    const centerLatLng = desired
      ? new naver.maps.LatLng(desired.lat, desired.lng)
      : new naver.maps.LatLng(lat_home, lng_home);

    const map = new naver.maps.Map(mapRef.current, {
      center: centerLatLng,
      zoom: desired?.zoom ?? 12,
    });
    mapInstanceRef.current = map;

    infoWindowRef.current = new naver.maps.InfoWindow({
      backgroundColor: "#111827",
      borderColor: "#fff",
    });

    // 마커 추가 (전달받은 bars만)
    markersRef.current = [];
    bars.forEach((bar) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(bar.lat, bar.lng),
        map,
        title: bar.name,
      });

      markersRef.current.push({ marker, bar });

      naver.maps.Event.addListener(marker, "click", () => {
        const content = `
          <div class="p-3 min-w-[200px] text-white text-sm bg-[#111827] border border-white rounded-md">
            <div class="font-bold text-base mb-1">${bar.name}</div>
            <div class="mb-1">📍 ${bar.address}</div>
            <div class="mb-1">☎ ${bar.phone}</div>
            <div class="mb-2">${bar.desc}</div>
            <a href="${bar.website}" target="_blank" rel="noopener"
               class="text-teal-400 hover:font-bold">네이버지도에서 보기</a>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      });
    });

    const clickListener = naver.maps.Event.addListener(map, "click", () => {
      infoWindowRef.current.close();
    });

    //cleanup: 리스너, 마커 정리
    return () => {
      if (naver && map) {
        naver.maps.Event.removeListener(clickListener);
      }
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [centerKey, bars]); // ← 지역/목록 바뀌면 재생성

  // 선택된 바로 포커스 이동
  useEffect(() => {
    if (
      selectedBar &&
      markersRef.current.length > 0 &&
      infoWindowRef.current &&
      mapInstanceRef.current
    ) {
      const markerData = markersRef.current.find(
        (item) => item.bar.id === selectedBar.id
      );
      if (markerData) {
        const { marker, bar } = markerData;
        const { naver } = window;
        const barPosition = new naver.maps.LatLng(bar.lat, bar.lng);
        mapInstanceRef.current.setCenter(barPosition);
        mapInstanceRef.current.setZoom(14);
        const content = `
          <div class="p-3 min-w-[200px] text-white text-sm bg-[#111827] border border-white rounded-md">
            <div class="font-bold text-base mb-1">${bar.name}</div>
            <div class="mb-1">📍 ${bar.address}</div>
            <div class="mb-1">☎ ${bar.phone ? bar.phone : "전화번호 없음"}</div>
            <div class="mb-2">${bar.desc}</div>
            <a href="${bar.website}" target="_blank" rel="noopener"
               class="text-title hover:font-bold">네이버지도에서 보기</a>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      }
    }
  }, [selectedBar]);

  return (
    <div>
      <div
        ref={mapRef}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }}
        className="rounded-2xl overflow-hidden mx-auto"
      />
    </div>
  );
}
