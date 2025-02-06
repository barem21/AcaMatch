// import { useState } from "react";

// const RandomImg: React.FC = () => {
//   const imageList = Array.from(
//     { length: 10 },
//     (_, i) => `default_academy${i + 1}.jpg`,
//   ); // 1~10까지 생성
//   const [selectedImages, setSelectedImages] = useState<Set<string>>(
//     new Set([imageList[0]]),
//   ); // 처음에는 1번 선택
//   const [currentImage, setCurrentImage] = useState<string>(imageList[0]); // 기본 이미지 설정

//   const getRandomImage = () => {
//     let availableImages = imageList.filter(img => !selectedImages.has(img));

//     // 모든 이미지를 사용했다면 초기화
//     if (availableImages.length === 0) {
//       setSelectedImages(new Set([imageList[0]])); // 다시 1번부터 시작
//       availableImages = imageList.slice(1); // 2번부터 10번까지 다시 사용 가능
//     }

//     // 랜덤 선택
//     const randomIndex = Math.floor(Math.random() * availableImages.length);
//     const selectedImage = availableImages[randomIndex];

//     // 선택된 이미지 저장 (새로운 Set으로 업데이트해야 리렌더링됨)
//     setSelectedImages(prev => new Set(prev).add(selectedImage));
//     setCurrentImage(selectedImage);
//   };

//   return <img src={currentImage} alt="Selected" width={300} height={200} />;
// };

// export default RandomImg;
