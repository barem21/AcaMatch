import { FiHome } from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaUserFriends,
  FaCreditCard,
  FaBullhorn,
  FaShieldAlt,
} from "react-icons/fa";

export interface MenuItem {
  type: "item";
  icon: JSX.Element;
  label: string;
  link: string;
  active: boolean;
  list?: SubMenuItem[];
}

export interface SubMenuItem {
  label: string;
  link: string;
  active: boolean;
  subList?: SubMenuItem[];
}

export interface Divider {
  type: "divider";
}

// 관리자용 메뉴 (roleId === 0)
export const adminMenuItems: (MenuItem | Divider)[] = [
  {
    type: "item",
    icon: <FiHome />,
    label: "대시보드",
    link: "/admin",
    active: false,
  },
  {
    type: "item",
    icon: <FaChalkboardTeacher />,
    label: "학원 관리",
    link: "/admin/academy",
    active: false,
    list: [
      {
        label: "학원 등록/수정/삭제",
        link: "/admin/academy",
        active: false,
      },
      {
        label: "학원 등록 요청",
        link: "/admin/academy?state=0",
        active: false,
      },
      {
        label: "학원 승인",
        link: "/admin/academy/arrow",
        active: false,
      },
      {
        label: "강의 관리",
        link: "/admin/academy/class",
        active: false,
      },
      {
        label: "프리미엄 학원 관리",
        link: "/admin/academy/premium",
        active: false,
      },
      {
        label: "프리미엄 학원 신청",
        link: "/admin/academy/premium-req",
        active: false,
      },
    ],
  },
  {
    type: "item",
    icon: <FaUserFriends />,
    label: "회원 관리",
    link: "/admin/member",
    active: false,
    list: [
      {
        label: "회원 목록",
        link: "/admin/member",
        active: false,
      },
      {
        label: "회원 정보",
        link: "/admin/member/info",
        active: false,
      },
    ],
  },
  { type: "divider" },
  {
    type: "item",
    icon: <FaCreditCard />,
    label: "결제 및 지출 관리",
    link: "/admin/paymentanager",
    active: false,
    list: [
      {
        label: "학원별 결제 내역",
        link: "/admin/paymentanager",
        active: false,
      },
      {
        label: "학원별 매출 정산",
        link: "/admin/acarevenue",
        active: false,
      },
    ],
  },
  {
    type: "item",
    icon: <FaBullhorn />,
    label: "공지 및 콘텐츠 관리",
    link: "/admin/notice-content",
    active: false,
    list: [
      {
        label: "공지사항 관리",
        link: "/admin/notice-content",
        subList: [
          {
            label: "공지사항 목록",
            link: "/admin/notice-content",
            active: false,
          },
          {
            label: "공지사항 보기",
            link: "/admin/notice-content/view",
            active: false,
          },
          {
            label: "공지사항 등록",
            link: "/admin/notice-content/add",
            active: false,
          },
          {
            label: "공지사항 수정",
            link: "/admin/notice-content/edit",
            active: false,
          },
        ],
        active: false,
      },
      {
        label: "팝업 관리",
        link: "/admin/popup-content",
        active: false,
      },
      {
        label: "배너관리",
        link: "/admin/banner-content",
        active: false,
      },
    ],
  },
  {
    type: "item",
    icon: <FaShieldAlt />,
    label: "사이트 운영 및 보안",
    link: "/admin/profile",
    active: false,
    list: [
      {
        label: "관리자 정보 수정",
        link: "/admin/profile",
        active: false,
      },
    ],
  },
];

// 학원용 메뉴 (roleId === 3)
export const academyMenuItems: (MenuItem | Divider)[] = [
  {
    type: "item",
    icon: <FiHome />,
    label: "대시보드",
    link: "/admin",
    active: false,
  },
  {
    type: "item",
    icon: <FaChalkboardTeacher />,
    label: "학원 관리",
    link: "/admin/academy",
    active: false,
    list: [
      {
        label: "학원 등록/수정/삭제",
        link: "/admin/academy",
        active: false,
      },
      {
        label: "강의 관리",
        link: "/admin/academy/class",
        active: false,
      },
    ],
  },
  {
    type: "item",
    icon: <FaUserFriends />,
    label: "회원 관리",
    link: "/admin/member",
    active: false,
    list: [
      {
        label: "회원 목록",
        link: "/admin/member",
        active: false,
      },
      {
        label: "회원 정보",
        link: "/admin/member/info",
        active: false,
      },
    ],
  },
  {
    type: "item",
    icon: <FaCreditCard />,
    label: "결제 및 지출 관리",
    link: "/admin/paymentanager",
    active: false,
  },
];

// roleId에 따라 메뉴 반환하는 함수
export const getMenuItems = (roleId: number) => {
  return roleId === 0 ? adminMenuItems : academyMenuItems;
};
