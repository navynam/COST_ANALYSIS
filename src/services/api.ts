import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

/** 매핑 서비스용 axios 인스턴스 */
export const mappingAxios = axios.create({
  baseURL: process.env.REACT_APP_MAPPING_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

/** parsing 서비스에서 사용하는 별칭 */
export const baseApi = api;

export default api;
