export type ArchiveEdition = {
  year: string;
  issue: string;
  title: string;
  tagline: string;
  description: string;
  date: string;
  venue: string;
  graduates: number;
  teams: number;
  keywords: string[];
  accent: string;
  status: "current" | "sample";
};

export const archiveEditions: ArchiveEdition[] = [
  {
    year: "2026", issue: "012", title: "FRAMING NOW",
    tagline: "지금의 시선을, 작품으로 프레이밍하다.",
    description: "각자의 시선으로 지금을 포착하고, 기획과 제작의 과정을 하나의 프레임 안에 기록하는 포트폴리오형 졸업 쇼케이스입니다.",
    date: "2026.10.21—10.23", venue: "미래창조관 3층 상상플러스",
    graduates: 41, teams: 9, keywords: ["FIND", "FRAME", "SHOW"], accent: "#f15a24", status: "current",
  },
  {
    year: "2025", issue: "011", title: "NEXT SCENE",
    tagline: "다음 장면을 만드는 새로운 시선.",
    description: "완성된 결과물 너머의 다음 가능성을 조명하고, 창작자의 성장 과정과 실무 역량을 하나의 장면으로 연결합니다.",
    date: "2025.10.22—10.24", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 39, teams: 10, keywords: ["SCENE", "STORY", "NEXT"], accent: "#3f64e8", status: "sample",
  },
  {
    year: "2024", issue: "010", title: "LAYERS",
    tagline: "겹쳐진 감각, 확장되는 이야기.",
    description: "서로 다른 매체와 감각이 층층이 쌓이는 과정을 통해 콘텐츠가 만들어 내는 입체적인 경험을 탐색합니다.",
    date: "2024.11.18—11.20", venue: "미래창조관 3층 상상플러스 · 일부 확인",
    graduates: 42, teams: 11, keywords: ["LAYER", "MIX", "EXPAND"], accent: "#7a5af8", status: "sample",
  },
  {
    year: "2023", issue: "009", title: "SHIFT",
    tagline: "익숙한 장면을 새롭게 전환하다.",
    description: "익숙한 시선과 사용 방식을 전환해 디지털 환경에서 발견되는 새로운 관계와 경험을 제안합니다.",
    date: "2023.11.15—11.17", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 38, teams: 9, keywords: ["CHANGE", "VIEW", "MOVE"], accent: "#de4d5f", status: "sample",
  },
  {
    year: "2022", issue: "008", title: "INTERFACE",
    tagline: "사람과 미디어가 만나는 경계.",
    description: "사람, 기술, 콘텐츠가 맞닿는 접점을 관찰하고 더 자연스럽고 의미 있는 상호작용의 방식을 설계합니다.",
    date: "2022.11.09—11.11", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 40, teams: 10, keywords: ["HUMAN", "MEDIA", "LINK"], accent: "#168a76", status: "sample",
  },
  {
    year: "2021", issue: "007", title: "BOUNDLESS",
    tagline: "화면 너머의 가능성을 연결하다.",
    description: "물리적 공간과 디지털 화면의 경계를 넘어 콘텐츠가 확장될 수 있는 다양한 형식과 가능성을 실험합니다.",
    date: "2021.11.10—11.12", venue: "온·오프라인 전시 · 예시",
    graduates: 37, teams: 9, keywords: ["OPEN", "SPACE", "BEYOND"], accent: "#2d7dd2", status: "sample",
  },
  {
    year: "2020", issue: "006", title: "UNMUTED",
    tagline: "멈춘 일상 속 선명해진 목소리.",
    description: "변화한 일상 속에서 발견한 개인의 목소리를 영상과 디지털 콘텐츠로 기록하고 다시 연결합니다.",
    date: "2020.11.18—11.20", venue: "온라인 졸업전시 · 예시",
    graduates: 35, teams: 8, keywords: ["VOICE", "RECORD", "ONLINE"], accent: "#e35b34", status: "sample",
  },
  {
    year: "2019", issue: "005", title: "NEW WAVE",
    tagline: "새로운 감각이 흐름이 되는 순간.",
    description: "다양한 창작 언어가 만나 하나의 흐름을 만들고, 새로운 미디어 세대의 감각과 태도를 보여줍니다.",
    date: "2019.11.13—11.15", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 36, teams: 9, keywords: ["WAVE", "SENSE", "FLOW"], accent: "#227c9d", status: "sample",
  },
  {
    year: "2018", issue: "004", title: "CONNECT : ON",
    tagline: "콘텐츠로 관계를 연결하다.",
    description: "온라인과 오프라인, 제작자와 관람자, 정보와 경험 사이를 잇는 콘텐츠의 연결 방식을 탐구합니다.",
    date: "2018.11.14—11.16", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 34, teams: 8, keywords: ["CONNECT", "ON", "TOGETHER"], accent: "#ef8354", status: "sample",
  },
  {
    year: "2017", issue: "003", title: "TRIANGLE",
    tagline: "세 개의 점이 만드는 하나의 방향.",
    description: "기획, 디자인, 기술의 세 축이 서로 연결되며 완성되는 미디어콘텐츠의 제작 구조를 시각화합니다.",
    date: "2017.11.15—11.17", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 33, teams: 8, keywords: ["PLAN", "DESIGN", "TECH"], accent: "#db3a34", status: "sample",
  },
  {
    year: "2016", issue: "002", title: "PIXEL & MOTION",
    tagline: "이미지가 움직임이 되는 과정.",
    description: "픽셀에서 시작한 이미지가 영상, 인터랙션, 공간으로 움직이며 확장되는 제작 과정을 담아냅니다.",
    date: "2016.11.16—11.18", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 31, teams: 7, keywords: ["PIXEL", "MOTION", "MEDIA"], accent: "#4f6d7a", status: "sample",
  },
  {
    year: "2015", issue: "001", title: "BEGIN, AGAIN",
    tagline: "시작을 기록하고 다음을 그리다.",
    description: "배움의 과정을 하나의 기록으로 정리하고, 창작자로서 새롭게 출발하는 졸업생들의 첫 장면을 담습니다.",
    date: "2015.11.18—11.20", venue: "서원대학교 교내 전시장 · 예시",
    graduates: 30, teams: 7, keywords: ["BEGIN", "RECORD", "NEXT"], accent: "#5c677d", status: "sample",
  },
];

export const findEdition = (year: string) => archiveEditions.find((edition) => edition.year === year);
