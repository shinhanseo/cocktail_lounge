## 🍹 Cocktail Lounge: 칵테일 레시피 창조와 소통의 플랫폼

> 칵테일 레시피의 경계를 허물고, 애호가들이 정보를 교환하며 함께 성장하는 커뮤니티 & AI 플랫폼입니다.

Cocktail Lounge는 **React + Express** 기반의 풀스택 서비스로, **Gemini AI**를 활용한 혁신적인 레시피 생성 기능을 핵심으로 합니다. 사용자는 자신만의 칵테일을 만들고, 전국 바 정보를 탐색하며, 활발한 커뮤니티 활동을 즐길 수 있습니다.

---

## 🚀 Tech Stack

| 구분             | 기술 스택                 | 주요 목적 및 사용처                          |
| :--------------- | :------------------------ | :------------------------------------------- |
| **Frontend**     | **React** + **Vite**      | 빠르고 반응성 높은 UI 구축                   |
| **Styling**      | **Tailwind CSS**          | 네온 감성의 모던하고 깔끔한 디자인 구현      |
| **Backend**      | **Node.js** + **Express** | RESTful API 구축 및 서버 로직 처리           |
| **Database**     | **PostgreSQL**            | 구조화된 데이터(레시피, 게시글, 사용자) 관리 |
| **File Storage** | **AWS S3**                | 이미지 및 첨부 파일 저장 및 안정적인 관리    |
| **AI/ML**        | **Google Gemini**         | 맞춤형 칵테일 레시피 및 추천 생성            |
| **Image Gen**    | **Hugging Face (FLUX)**   | 생성된 레시피의 시각화 이미지 자동 생성      |
| **Auth**         | **JWT (Access/Refresh)**  | 안전하고 효율적인 사용자 인증 및 세션 관리   |

---

## 📌 주요 기능 (Core Features)

### I. 🤖 AI 바텐더

사용자의 취향에 맞춰 세상에 없는 칵테일을 창조합니다.

- **맞춤 레시피 생성:** **기주, 맛, 도수, 키워드**를 입력하면 Gemini AI가 즉시 레시피를 생성하고 FLUX 모델로 **이미지를 자동 시각화**합니다.
- **바텐더 챗:** 대화형 인터페이스를 통해 AI 바텐더에게 레시피를 요청하고 추천받습니다.
- **마이페이지 저장** : 2가지 방식의 바텐더를 통해 생성된 레시피와 이미지를 마이페이지에 저장합니다.

### II. 💬 커뮤니티 및 소통 (Community & Communication)

사용자 간 정보 교류를 활성화하는 기능입니다.

- **게시글 CRUD:** 글 작성, 조회, 수정, 삭제 기능.
- **고급 에디터:** **TipTap 에디터**를 활용하여 풍부하고 직관적인 본문 작성 환경 제공. (S3를 활용한 파일 첨부 기능 확장 예정)
- **소셜 기능:** 게시글 **좋아요** 및 **댓글/대댓글 CRUD** 기능 제공.
- **정렬:** **최신순, 좋아요순, 댓글순** 등 다양한 정렬 옵션.
- **태그 시스템:** 태그 기반 검색 및 분류 지원.

### III. 🗺️ 지역 바 탐색 및 북마크 (Bar Search & Bookmark)

전국 칵테일 바 정보를 쉽게 찾고 관리합니다.

- **네이버 지도 연동:** 전국 9개 지역별 바 위치를 **지도 마커**로 정확하게 표시합니다.
- **바 북마크:** 원하는 바를 북마크하여 마이페이지에서 쉽게 확인 및 관리합니다.

### IV. 🍸칵테일 도감

50여가지의 칵테일 레시피를 확인할 수 있습니다.

- **레시피 탐색:** 50여 개의 기본 레시피 제공 및 **도수/좋아요/최신순** 정렬 기능.
- **북마크:** 마음에 드는 레시피에 **좋아요**를 표시하여 마이페이지에서 관리합니다.

### V. 🔐 인증 및 검색 (Auth & Search)

보안과 편의성을 최우선으로 설계된 사용자 시스템입니다.

- **통합 로그인:** 일반 회원가입 외 **Google, Naver, Kakao Oauth**를 통한 간편 로그인 지원.
- **보안 인증:** \*\*Access Token (15분)\*\*과 \*\*Refresh Token (7일)\*\*을 분리하여 보안을 강화하고 사용자 편의성을 높였습니다.
- **통합 검색:**
  - **게시글:** 제목, 본문, 태그를 기준으로 검색.
  - **칵테일:** 이름, 태그, 코멘트를 기준으로 검색.
- **마이페이지:** 내 정보, 활동 기록(게시글, 댓글, 좋아요 목록) 및 닉네임 수정 기능 제공.

---

## 🛠️ Installation & Run

### A. Prerequisites

- Node.js (LTS 버전 권장)
- PostgreSQL 설치 및 실행
- AWS S3 버킷 설정 (ACCESS_KEY, SECRET_KEY, BUCKET_NAME 필요)
- Gemini API Key, Hugging Face Token, Naver Map API Key 발급

### B. Setup

```bash
# 1. Clone Repository
git clone https://github.com/shinhanseo/cocktail_lounge.git
cd cocktail_lounge

# 2. Setup Environment Variables (.env 파일 생성 및 값 설정)
# (backend와 frontend 모두 설정 필요)

# 3. Backend Setup
cd backend
npm install
# PostgreSQL DB 생성 및 테이블 초기화
npm run start # 또는 npm run dev

# 4. Frontend Setup
cd ../frontend
npm install
npm run dev
```

### C. Access

- **Frontend**: `http://localhost:5173/` (Vite 기본 포트)
- **Backend**: `http://localhost:3000/` (Express 기본 포트)
