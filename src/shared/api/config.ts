// 백엔드 API 사용 여부 자동 판단
// - localhost:3000 (개발) + 백엔드 실행 중 → true
// - GitHub Pages 등 정적 배포 → false (localStorage/mock 사용)
export const USE_API = window.location.hostname === 'localhost' && window.location.port === '3000';
