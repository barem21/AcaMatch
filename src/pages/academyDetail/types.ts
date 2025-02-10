export interface AddressDto {
  address: string;
  detailAddress: string;
  postNum: string;
}

export interface Class {
  classId: number;
  className: string;
  classComment: string;
  classStartDate: string;
  classEndDate: string;
  classStartTime: string;
  classEndTime: string;
  classPrice: number;
  classDay: string | null;
  classCategoryName: string | null;
}

export interface Review {
  comment: string;
  star: number;
  createdAt: string;
  userId: number;
}

export interface AcademyResponse {
  resultMessage: string;
  resultData: {
    acaId: number;
    acaName: string;
    acaPic: string;
    address: string;
    acaPhone: string;
    teacherNum: number;
    comments: string;
    star: number;
    reviewCount: number;
    likeCount: number;
    isLiked: boolean;
    addressDto: AddressDto;
    classes: Class[];
    reviews: Review[];
  };
}
export interface AcademyData {
  acaId: number;
  acaName: string;
  acaPic: string;
  address: string;
  acaPhone: string;
  teacherNum: number;
  comments: string;
  star: number;
  reviewCount: number;
  likeCount: number;
  isLiked: boolean;
  addressDto: AddressDto;
  classes: Class[];
  reviews: Review[];
}
export interface MapPosition {
  lat: number;
  lng: number;
}

export interface KakaoMapProps {
  address: string;
  height?: string;
  level?: number;
}
export interface AcademyClass {
  classId: number;
  className: string;
  classComment: string;
  classStartDate: string;
  classEndDate: string;
  classStartTime: string;
  classEndTime: string;
  classPrice: number;
  classDay?: string; // 선택적 속성
  classCategoryName?: string; // 선택적 속성
}
export interface Review {
  userId: number;
  star: number;
  comment: string;
  createdAt: string;
  reviewId: number;
  nickName: string;
}
