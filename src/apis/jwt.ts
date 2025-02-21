import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { getCookie, setCookie, removeCookie } from "../utils/cookie";

// 응답 타입 정의
interface AccessTokenResponse {
  resultMessage: string;
  resultData: string;
}

// 요청 재시도를 위한 타입 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const jwtAxios: AxiosInstance = axios.create({
  withCredentials: true,
});

// Request Interceptor
const beforeReq = (config: CustomAxiosRequestConfig) => {
  const accessToken = getCookie("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

const failReq = (error: AxiosError) => {
  return Promise.reject(error);
};

jwtAxios.interceptors.request.use(beforeReq, failReq);

// Response Interceptor
const beforeRes = (response: AxiosResponse) => {
  return response;
};

const failRes = async (error: AxiosError) => {
  const originalRequest = error.config as CustomAxiosRequestConfig;

  // 500 에러인 경우 토큰 리프레시 시도
  if (error.response?.status === 500 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // 만료된 토큰 없이 리프레시 요청
      const response = await axios.get<AccessTokenResponse>(
        "/api/user/access-token",
        {
          withCredentials: true,
          headers: {
            Authorization: "", // 기존 Authorization 헤더 제거
          },
        },
      );

      if (response.data.resultData) {
        const newAccessToken = response.data.resultData;

        // 새 토큰 저장
        setCookie("accessToken", newAccessToken, { path: "/" });

        // 원래 요청의 헤더 업데이트
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 실패했던 요청 재시도
        return jwtAxios(originalRequest);
      }
    } catch (refreshError) {
      removeCookie("accessToken");
      // window.location.href = "/log-in";
      return Promise.reject(refreshError);
    }
  }

  // 401 에러 처리
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // 만료된 토큰 없이 리프레시 요청
      const response = await axios.get<AccessTokenResponse>(
        "/api/user/access-token",
        {
          withCredentials: true,
          headers: {
            Authorization: "", // 기존 Authorization 헤더 제거
          },
        },
      );

      if (response.data.resultData) {
        const newAccessToken = response.data.resultData;
        setCookie("accessToken", newAccessToken, { path: "/" });
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return jwtAxios(originalRequest);
      }
    } catch (refreshError) {
      removeCookie("accessToken");
      // window.location.href = '/log-in';
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

jwtAxios.interceptors.response.use(beforeRes, failRes);

// API 요청 메서드들
export const jwtApiRequest = {
  get: <T>(url: string, config = {}) => {
    return jwtAxios.get<T>(url, config);
  },

  post: <T>(url: string, data = {}, config = {}) => {
    return jwtAxios.post<T>(url, data, config);
  },

  put: <T>(url: string, data = {}, config = {}) => {
    return jwtAxios.put<T>(url, data, config);
  },

  delete: <T>(url: string, config = {}) => {
    return jwtAxios.delete<T>(url, config);
  },
};

export default jwtAxios;
