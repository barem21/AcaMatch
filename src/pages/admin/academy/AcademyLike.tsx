import { useRecoilValue } from "recoil";
//import { getCookie } from "../../../utils/cookie";
import { message, Pagination } from "antd";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import jwtAxios from "../../../apis/jwt";
import userInfo from "../../../atoms/userInfo";

interface academyLikeListType {
  acaId: number;
  acaName: string;
  academyAllLikeCount: number;
  userId: number;
  userPic: string;
  nickName: string;
}

interface AcademyLikeList {
  [academyId: string]: academyLikeListType[]; // academyId를 key로 하는 LikedUser 배열
}

const mergedObj: AcademyLikeList = {}; // mergedObj의 타입을 정의

function AcademyLike() {
  const cookies = new Cookies();
  const [academyLikeList, setAcademyLikeList] = useState<academyLikeListType[]>(
    [],
  );
  const currentUserInfo = useRecoilValue(userInfo);
  const navigate = useNavigate();

  //학원 좋아요 전체목록 가져오기
  const getLikeList = async () => {
    try {
      const res = await jwtAxios.get(
        "/api/like/all-owned-academy-likes?page=1&size=20",
      );

      // 객체들을 하나로 합치기
      for (let i = 0; i < res.data.resultData.length; i++) {
        if (res.data.resultData[i].academyAllLikeCount > 0) {
          const likedUsers = res.data.resultData[i].likedUsers;
          mergedObj[res.data.resultData[i].academyId] = [
            ...(mergedObj[res.data.resultData[i].academyId] || []),
            ...likedUsers.map((user: academyLikeListType) => ({
              ...user,
              acaName: res.data.resultData[i].acaName, // academyId에 해당하는 acaName 추가
            })),
          ];
        }
      }
      /*
      let mergedObj = {};
      for (let i = 0; i < res.data.resultData.length; i++) {
        if (res.data.resultData[i].academyAllLikeCount > 0) {
          const likedUsers = res.data.resultData[i].likedUsers;
          mergedObj = {
            ...mergedObj,
            [res.data.resultData[i].academyId]: [
              ...(mergedObj[res.data.resultData[i].academyId] || []),
              ...likedUsers.map((user: any) => ({
                ...user, // 기존 속성 유지
                acaName: res.data.resultData[i].acaName, // academyId 추가
              })),
            ],
          };
        }
      }
      */
      //console.log(mergedObj.undefined);
      setAcademyLikeList(mergedObj.undefined);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLikeList();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!cookies.get("accessToken")) {
      navigate("/log-in");
      message.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  return (
    <div className="flex gap-5 w-full justify-center align-top">
      <div className="w-full">
        <h1 className="title-admin-font">
          좋아요 목록
          <p>학원 관리 &gt; 좋아요 목록</p>
        </h1>

        <div className="board-wrap">
          <div className="flex justify-between align-middle p-2 border-b bg-gray-100">
            <div className="flex items-center justify-center w-full">
              학원명 / 회원 닉네임
            </div>
            {/* <div className="flex items-center justify-center w-40">등록일</div>
            <div className="flex items-center justify-center w-40">
              삭제하기
            </div> */}
          </div>

          {academyLikeList === undefined && (
            <div className="p-4 text-center border-b">
              등록된 좋아요 학원이 없습니다.
            </div>
          )}
          {academyLikeList === null && (
            <div className="p-4 text-center border-b">
              등록된 좋아요 학원이 없습니다.
            </div>
          )}
          {academyLikeList?.length === 0 && (
            <div className="p-4 text-center border-b">
              등록된 좋아요 학원이 없습니다.
            </div>
          )}

          {academyLikeList?.map((item, index) => (
            <div
              key={index}
              className="loop-content flex justify-between align-middle p-6 border-b"
            >
              <div className="w-full">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center w-10 h-10 border rounded-full overflow-hidden">
                    <img
                      src={
                        item.userPic
                          ? `http://112.222.157.156:5223/pic/user/${item.userId}/${item.userPic}`
                          : "/aca_image_1.png"
                      }
                      className="max-w-fit max-h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.acaName}</div>
                    <div className="text-sm text-gray-500">{item.nickName}</div>
                  </div>
                </div>
              </div>
              {/*<div className="flex items-center justify-center w-40">
                2025-01-01
              </div>
              <div className="flex items-center justify-center w-40">
                <button className="small_line_button">삭제하기</button>
              </div>*/}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center m-6 mb-10">
          <Pagination
            defaultCurrent={1}
            total={academyLikeList?.length}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

export default AcademyLike;
