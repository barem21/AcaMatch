import { atom } from "recoil";

interface UserInfo {
  name: string;
  roleId: string | null | number;
  userId: string | null | number;
}

export const userInfo = atom<UserInfo>({
  key: "userInfo",
  default: {
    name: "",
    roleId: "",
    userId: null,
  },
});

export default userInfo;
