import { FiHome } from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaUserFriends,
  FaCreditCard,
  FaBullhorn,
  FaShieldAlt,
  FaUserGraduate,
  FaUserEdit,
} from "react-icons/fa";

export interface MenuItem {
  type: "item";
  icon: JSX.Element | null;
  label: string;
  link: string;
  active: boolean;
  expanded?: boolean;
  list?: SubMenuItem[];
}
// export interface MenuItem {
//   type?: "item";
//   icon: JSX.Element | null; // ✅ null을 허용
//   label: string;
//   link?: string;
//   active: boolean;
//   list?: { label: string; link: string; active: boolean }[];
// }

export interface SubMenuItem {
  label: string;
  link: string;
  active: boolean;
  expanded?: boolean;
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
        label: "학원 등록 승인",
        link: "/admin/arrow-list",
        active: false,
      },
      // {
      //   label: "강의 관리",
      //   link: "/admin/academy/class",
      //   active: false,
      // },
      {
        label: "프리미엄 학원 관리",
        link: "/admin/premium",
        active: false,
      },
      /*
      {
        label: "프리미엄 학원 신청",
        link: "/admin/academy/premium-req",
        active: false,
      },
      */
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
      /*
      {
        label: "회원 정보",
        link: "/admin/member/info",
        active: false,
      },
      */
    ],
  },
  { type: "divider" },
  {
    type: "item",
    icon: <FaCreditCard />,
    label: "결제 및 지출 관리",
    link: "/admin/paymentmanager",
    active: false,
    list: [
      {
        label: "학원별 결제 내역",
        link: "/admin/paymentmanager",
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
        label: "좋아요 목록",
        link: "/admin/academy/like",
        active: false,
      },
      {
        label: "학원 리뷰 목록",
        link: "/admin/academy/review",
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
        link: "/admin/profile",
        active: false,
      },
    ],
  },
  {
    type: "item",
    icon: <FaCreditCard />,
    label: "결제 및 지출 관리",
    link: "/admin/paymentmanager",
    active: false,
  },
];

// 강사용 메뉴 (roleId === 4)
export const teacherMenuItems: (MenuItem | Divider)[] = [
  {
    type: "item",
    icon: <FaChalkboardTeacher />,
    label: "강사 등록",
    link: "/admin/academy",
    active: false,
    list: [
      {
        label: "신청 내역",
        link: "/admin/teacher/list",
        active: false,
      },
      {
        label: "등록 신청",
        link: "/admin/teacher/add",
        active: false,
      },
    ],
  },
  {
    type: "item",
    icon: <FaUserGraduate />,
    label: "학생 관리",
    link: "",
    active: false,
    list: [
      {
        label: "출석 및 성적관리",
        link: "/admin/academy",
        active: false,
      },
      /*
      {
        label: "성적 관리",
        link: "/admin/academy",
        active: false,
      },
      */
    ],
  },
  {
    type: "item",
    icon: <FaUserEdit />,
    label: "강사 정보",
    link: "",
    active: false,
    list: [
      {
        label: "정보 수정",
        link: "/admin/profile",
        active: false,
      },
    ],
  },
];

// roleId에 따라 메뉴 반환하는 함수
export const getMenuItems = (
  roleId: string | number | null,
): (MenuItem | Divider)[] => {
  if (roleId === null) {
    return []; // roleId가 null인 경우 빈 배열 반환
  }

  // roleId를 숫자로 변환
  const role = typeof roleId === "string" ? parseInt(roleId, 10) : roleId;

  return role === 0
    ? adminMenuItems
    : role === 4
      ? teacherMenuItems
      : academyMenuItems;
};
