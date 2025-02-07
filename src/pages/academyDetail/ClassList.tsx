import { AcademyClass } from "./types";
import DOMPurify from "dompurify";

interface ClassListProps {
  classes: AcademyClass[];
}

const ClassList = ({ classes }: ClassListProps) => {
  return (
    <div className="flex flex-col justify-center items-center mt-[12px] w-[930px] mx-auto mb-[50px]">
      {classes ? (
        classes.map(classItem => (
          <div
            key={classItem.classId}
            className="w-full mb-[24px] p-[24px] border rounded-[8px]"
          >
            <h2 className="text-[24px] font-bold mb-[24px]">
              {classItem.className}
            </h2>

            <div className="flex flex-col gap-[24px] text-[16px]">
              {/* 강좌 기간 */}
              <div>
                <h3 className="font-bold mb-[8px]">강좌 기간</h3>
                <p>
                  {new Date(classItem.classStartDate).toLocaleDateString(
                    "ko-KR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                  {" ~ "}
                  {new Date(classItem.classEndDate).toLocaleDateString(
                    "ko-KR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>

              {/* 강좌 소개 */}
              <div>
                <h3 className="font-bold mb-[8px]">강좌 소개</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(classItem.classComment),
                  }}
                  className="whitespace-pre-line"
                >
                  {/* {classItem.classComment} */}
                </p>
              </div>

              {/* 수강 연령대 */}
              {classItem.classCategoryName && (
                <div>
                  <h3 className="font-bold mb-[8px]">수강 연령대</h3>
                  <p>{classItem.classCategoryName}</p>
                </div>
              )}

              {/* 요일 및 시간 */}
              <div>
                <h3 className="font-bold mb-[8px]">요일 및 시간</h3>
                <p>
                  {classItem.classDay && `${classItem.classDay}, `}
                  {classItem.classStartTime.slice(0, 5)} ~{" "}
                  {classItem.classEndTime.slice(0, 5)}
                </p>
              </div>

              {/* 가격 */}
              <div>
                <h3 className="font-bold mb-[8px]">가격</h3>
                <p>{classItem.classPrice.toLocaleString()}원</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>등록한 강좌가 없습니다.</div>
      )}
    </div>
  );
};

export default ClassList;
