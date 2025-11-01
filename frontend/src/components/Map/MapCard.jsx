// frontend/src/components/Map/MapCard.jsx
// -------------------------------------------------------------
// 🗺️ MapCard
// - Naver 지도 위에 전달된 bars 목록을 마커로 표시
// - 지역(centerKey) 변경 시 해당 중심/줌으로 재생성
// - selectedBar가 바뀌면 해당 마커로 카메라 이동 + InfoWindow 오픈
// -------------------------------------------------------------

import { useEffect, useRef } from "react";

// 지역별 기본 중심 좌표/줌
const CENTERS = {
  인천: { lat: 37.4562557, lng: 126.7052062, zoom: 12 },
  서울: { lat: 37.5665851, lng: 126.9782038, zoom: 10 },
  부산: { lat: 35.179992, lng: 129.076815, zoom: 9 },
  경상도: { lat: 35.2378276, lng: 128.6919111, zoom: 9 },
  전라도: { lat: 34.8162186, lng: 126.4629242, zoom: 9 },
  제주: { lat: 33.4892792, lng: 126.4983426, zoom: 9 },
  충청도: { lat: 36.6591506, lng: 126.6729607, zoom: 9 },
  경기도: { lat: 37.2893482, lng: 127.0535102, zoom: 9 },
  강원도: { lat: 37.8853984, lng: 127.7297758, zoom: 9 },
};

// 키(예: '서울', '경기도 수원시' 등)로 중심 찾기
function getCenterFor(key) {
  if (!key) return null; // 방어 코드
  const direct = CENTERS[key];
  if (direct) return direct;
  // '경기도 수원시'처럼 포함 관계일 때 매칭
  const found = Object.keys(CENTERS).find((k) => key.includes(k));
  return found ? CENTERS[found] : null;
}

export default function MapCard({
  height = 500, // px 또는 css 단위 문자열
  width = 1000, // px 또는 css 단위 문자열
  selectedBar = null, // 포커스할 바 객체(선택 시 카메라 이동)
  centerKey = "인천", // 초기 중심 지역 키
  bars = [], // 마커로 표시할 바 목록 [{id, name, lat, lng, ...}]
}) {
  // --- DOM/지도/마커/인포윈도우 참조 ---
  const mapRef = useRef(null); // 지도를 렌더링할 div
  const infoWindowRef = useRef(null); // 단일 InfoWindow (재사용)
  const markersRef = useRef([]); // [{ marker, bar }] 형태로 저장
  const mapInstanceRef = useRef(null); // naver.maps.Map 인스턴스

  // 홈(기본) 좌표 (centerKey가 매칭 실패 시 사용)
  const lat_home = 37.5076183;
  const lng_home = 126.7382614;

  // --- 지도 생성 & 마커 세팅 ---
  useEffect(() => {
    const { naver } = window;
    if (!mapRef.current || !naver) return;

    // 중심 좌표 결정
    const desired = getCenterFor(centerKey);
    const centerLatLng = desired
      ? new naver.maps.LatLng(desired.lat, desired.lng)
      : new naver.maps.LatLng(lat_home, lng_home);

    // 지도 인스턴스 생성
    const map = new naver.maps.Map(mapRef.current, {
      center: centerLatLng,
      zoom: desired?.zoom ?? 12,
    });
    mapInstanceRef.current = map;

    // 공용 InfoWindow (스타일 커스텀)
    infoWindowRef.current = new naver.maps.InfoWindow({
      backgroundColor: "#111827",
      borderColor: "#fff",
    });

    // 기존 마커 초기화 후 재생성
    markersRef.current = [];
    bars.forEach((bar) => {
      // 마커 생성
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(bar.lat, bar.lng),
        map,
        title: bar.name,
      });

      markersRef.current.push({ marker, bar });

      // 마커 클릭 시 InfoWindow 오픈
      naver.maps.Event.addListener(marker, "click", () => {
        const content = `
          <div class="p-3 min-w-[200px] text-white text-sm bg-[#111827] border border-white rounded-md">
            <div class="font-bold text-base mb-1">${bar.name}</div>
            <div class="mb-1">📍 ${bar.address ?? ""}</div>
            <div class="mb-1">☎ ${bar.phone ? bar.phone : "전화번호 없음"}</div>
            <div class="mb-2">${bar.desc ?? ""}</div>
            <a href="${bar.website || "#"}" target="_blank" rel="noopener"
               class="text-teal-400 hover:font-bold">네이버지도에서 보기</a>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      });
    });

    // 지도 클릭 시 InfoWindow 닫기
    const clickListener = naver.maps.Event.addListener(map, "click", () => {
      infoWindowRef.current.close();
    });

    // --- cleanup: 리스너/마커/지도 참조 해제 ---
    return () => {
      if (naver && map) {
        naver.maps.Event.removeListener(clickListener);
      }
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [centerKey, bars]); // 지역/목록 변경 시 새로 생성

  // --- 선택된 바로 카메라 이동 + InfoWindow 오픈 ---
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

        // 카메라 이동/줌
        mapInstanceRef.current.setCenter(barPosition);
        mapInstanceRef.current.setZoom(14);

        // InfoWindow 컨텐츠 후 오픈
        const content = `
          <div class="p-3 min-w-[200px] text-white text-sm bg-[#111827] border border-white rounded-md">
            <div class="font-bold text-base mb-1">${bar.name}</div>
            <div class="mb-1">📍 ${bar.address ?? ""}</div>
            <div class="mb-1">☎ ${bar.phone ? bar.phone : "전화번호 없음"}</div>
            <div class="mb-2">${bar.desc ?? ""}</div>
            <a href="${bar.website || "#"}" target="_blank" rel="noopener"
               class="text-title hover:font-bold">네이버지도에서 보기</a>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      }
    }
  }, [selectedBar]);

  // --- 렌더 (지도를 담을 엘리먼트만 출력) ---
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
