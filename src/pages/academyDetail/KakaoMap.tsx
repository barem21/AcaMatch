import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import styled from "@emotion/styled";

interface KakaoMapProps {
  address: string;
}

const MapContainer = styled.div`
  width: 100%;
  margin-bottom: 100px;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 450px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 100px;
`;

const KakaoMap = ({ address }: KakaoMapProps) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapPosition, setMapPosition] = useState({
    lat: 33.450701,
    lng: 126.570667,
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 33.450701,
    lng: 126.570667,
  });

  useEffect(() => {
    let isComponentMounted = true;

    console.log(window.kakao);
    console.log(import.meta.env.VITE_KKO_MAP_KEY);
    // if (!isMapLoaded || !address) return;

    // 기존에 카카오맵 스크립트가 있는지 확인
    if (!document.querySelector("script[src*='dapi.kakao.com']")) {
      const kakaoMapScript = document.createElement("script");
      kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KKO_MAP_KEY}&autoload=false&libraries=services`;
      kakaoMapScript.async = true;

      kakaoMapScript.onload = () => {
        if (window.kakao) {
          window.kakao.maps.load(() => {
            if (isComponentMounted) {
              setIsMapLoaded(true);

              if (address) {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.addressSearch(address, (result: any, status: any) => {
                  if (
                    status === window.kakao.maps.services.Status.OK &&
                    result[0]
                  ) {
                    const coords = new window.kakao.maps.LatLng(
                      parseFloat(result[0].y),
                      parseFloat(result[0].x),
                    );

                    setMapPosition({
                      lat: coords.getLat(),
                      lng: coords.getLng(),
                    });
                    setMarkerPosition({
                      lat: coords.getLat(),
                      lng: coords.getLng(),
                    });
                  }
                });
              }
            }
          });
        }
      };

      document.head.appendChild(kakaoMapScript);
    } else {
      // 이미 스크립트가 로드된 경우
      if (window.kakao && window.kakao.maps && address) {
        window.kakao.maps.load(() => {
          if (isComponentMounted) {
            setIsMapLoaded(true);

            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(address, (result: any, status: any) => {
              if (
                status === window.kakao.maps.services.Status.OK &&
                result[0]
              ) {
                const coords = new window.kakao.maps.LatLng(
                  parseFloat(result[0].y),
                  parseFloat(result[0].x),
                );

                setMapPosition({ lat: coords.getLat(), lng: coords.getLng() });
                setMarkerPosition({
                  lat: coords.getLat(),
                  lng: coords.getLng(),
                });
              }
            });
          }
        });
      }
    }

    return () => {
      isComponentMounted = false;
    };
  }, [address]);

  if (!address) return null;

  return (
    <MapContainer>
      {isMapLoaded ? (
        <Map
          center={mapPosition}
          style={{
            width: "100%",
            height: "450px",
          }}
          level={3}
        >
          <MapMarker position={markerPosition}></MapMarker>
        </Map>
      ) : (
        <LoadingContainer>지도를 불러오는 중...</LoadingContainer>
      )}
    </MapContainer>
  );
};

export default KakaoMap;
