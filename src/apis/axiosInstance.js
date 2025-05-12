import axios from 'axios';
import { refreshAccessToken } from '@apis/refreshTokenUtil';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // API 기본 URL을 환경 변수에서 가져옴
  //withCredentials: true, // 쿠키를 포함한 요청 허용
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 Access Token을 가져와 Authorization 헤더에 추가
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token이 만료된 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          throw new Error('새로운 Access Token을 받지 못했습니다.');
        }

        // 새로운 Access Token을 헤더에 추가
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청을 다시 보냄
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);

        // 토큰 갱신 실패 시, 로컬 스토리지에서 토큰 제거 및 로그아웃 처리
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
