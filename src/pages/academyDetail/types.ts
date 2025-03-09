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
  reviewId: number;
  reviewComment: string;
  reviewStar: number;
  reviewCreatedAt: string;
  reviewUpdatedAt: string;
  reviewUserId: number;
  reviewUserNickName: string;
  reviewClassName: string;
  joinClassId: number;
  banReview: number;
  reviewPics?: string[]; // 미디어 리뷰용
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
    generalReviews: Review[]; // reviews -> generalReviews
    mediaReviews: Review[]; // 추가
    generalReviewCount: number; // 추가
    mediaReviewCount: number; // 추가
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
  generalReviews: Review[]; // reviews -> generalReviews
  mediaReviews: Review[]; // 추가
  generalReviewCount: number; // 추가
  mediaReviewCount: number; // 추가
  books?: {
    bookId: number;
    bookName: string;
    bookWriter: string;
    bookPublisher: string;
    bookPrice: number;
    bookPic?: string;
  }[];
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
