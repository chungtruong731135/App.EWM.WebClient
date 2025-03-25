/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Empty, Tag } from 'antd';

import * as actionsModal from '@/setup/redux/modal/Actions';

import { useNavigate, useParams } from 'react-router-dom';
import { FILE_URL, requestPOST } from '@/utils/baseAPI';
import HeaderTitle from '@/app/components/HeaderTitle';
import dayjs from 'dayjs';
import ModalComment from './components/ModalComment';
import { handleImage } from '@/utils/utils';
const DATA_CHAR = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const RenderItemInfo = ({ title, value }) => (
  <div className="col-xl-4 col-lg-6">
    <div className="row mb-3">
      <div className="col-xl-4 col-lg-6">
        <span className="fw-bold text-gray-600 fs-5">{title}:</span>
      </div>
      <div className="col-xl-8 col-lg-6">
        <span className="fw-semibold fs-5 text-dark">{value}</span>
      </div>
    </div>
  </div>
);
const RenderAnswer = ({ type, answerString }) => {
  var answerArr = [];
  if (type == 1 && answerString) {
    let temp = [];
    try {
      temp = JSON.parse(answerString);
      if (typeof temp != 'object') {
        temp = [temp];
      }
    } catch (e) {
      console.log(e);
    }
    answerArr = temp?.length > 0 ? temp : [answerString];
  }
  {
    type == 1 && answerArr?.length > 0 ? (
      <span>
        {answerArr?.map((i, ind) => (
          <Tag key={ind} className="ms-2 px-2 py-1">
            <span className="fw-semibold fs-5">{i}</span>
          </Tag>
        ))}
      </span>
    ) : (
      <span className="fw-semibold ms-2 fs-5">{answerString}</span>
    );
  }
};
const RenderItemQuestion = ({ item, index, answer }) => {
  const [dataChild, setDataChild] = useState([]);
  const [answerArr, setAnswerArr] = useState([]);
  var ansIndex = item?.answers?.findIndex(i => i.id == answer?.answerId);
  const check = answer?.isCorrect ? true : false;
  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(`api/v1/questions/search`, { pageNumber: 1, pageSize: 100, parentId: item?.questionId });
      setDataChild(res?.data ?? null);
    };
    if (item?.questionType == 3) {
      fetchData();
    } else if (item?.questionType == 1 && item?.questionAnswerString) {
      let temp = [];
      try {
        temp = JSON.parse(item?.questionAnswerString);
        if (typeof temp != 'object') {
          temp = [temp];
        }
      } catch (e) {
        console.log(e);
      }
      setAnswerArr(temp?.length > 0 ? temp : [item?.questionAnswerString]);
    }

    return () => {};
  }, [item]);
  return (
    <div key={index} className="border mb-5">
      <div className={`flex-grow-1 p-3 border-bottom ${check ? 'bg-light-success' : 'bg-light-danger'}`}>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="fs-3 fw-bold ">Câu {index + 1}</div>
        </div>
        {/* <div className="">
                      <span>Số thứ tự:</span>
                      <span className="ms-2 fs-4 fw-semibold">
                        {item?.order}
                      </span>
                    </div> */}
        <div className="">
          <span>Điểm trong bài thi:</span>
          <span className="ms-2 fs-4 fw-semibold">{item?.score}</span>
        </div>
      </div>
      <div className="flex-grow-1 p-5 border-bottom">
        <div
          className="fw-semibold fs-6 text-gray-600"
          dangerouslySetInnerHTML={{
            __html: item?.questionTitle,
          }}
        />
        <div
          className="fw-semibold fs-6"
          dangerouslySetInnerHTML={{
            __html: item?.questionTitleEn,
          }}
        />
        {item?.questionContent ? (
          <div
            dangerouslySetInnerHTML={{
              __html: item?.questionContent,
            }}
          />
        ) : (
          <></>
        )}
      </div>
      <div className="flex-grow-1">
        {item?.questionType == 3 && dataChild?.length > 0 ? (
          <div className="p-3">
            {dataChild?.map((quest, ind) => (
              <div className="border mb-5" key={Math.random().toString()}>
                <div className="flex-grow-1 p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="fs-3 fw-bold ">
                      Câu {index + 1}.{ind + 1}
                    </div>
                  </div>
                  {/* <div className="">
                    <span>Số thứ tự:</span>
                    <span className="ms-2 fs-4 fw-semibold">{quest?.order}</span>
                  </div> */}
                  <div className="">
                    <span>Điểm trong bài thi:</span>
                    <span className="ms-2 fs-4 fw-semibold">{quest?.score}</span>
                  </div>
                </div>
                <div className="flex-grow-1 p-5 border-bottom">
                  <div className="fw-semibold fs-6 text-gray-600" dangerouslySetInnerHTML={{ __html: quest?.title }} />
                  <div
                    className="fw-semibold fs-6"
                    dangerouslySetInnerHTML={{
                      __html: quest?.titleEn,
                    }}
                  />
                  {quest?.questionContent || quest?.content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: quest?.questionContent || quest?.content,
                      }}
                    />
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex-grow-1">
                  {quest?.questionType == 0 && quest?.answers?.length > 0 ? (
                    <div className="d-flex flex-column ">
                      {quest?.answers?.map((ans, ind) => (
                        <div key={ind} className="p-5 border-bottom d-flex align-items-center">
                          <div className={`mx-3 w-30px h-30px d-flex align-items-center justify-content-center ${ans?.isRight ? 'border border-success rounded-circle' : ''}`}>
                            <span className="fs-6  fw-semibold">{DATA_CHAR[ind]}</span>
                          </div>
                          <div className="ms-2" dangerouslySetInnerHTML={{ __html: ans?.content }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5">
                      Đáp án: <RenderAnswer type={item?.questionType} answerString={item?.questionAnswerString} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : item?.questionType == 0 && item?.answers?.length > 0 ? (
          <div className="d-flex flex-column ">
            {item?.answers?.map((ans, ind) => (
              <div className="p-5 border-bottom d-flex align-items-center">
                <div className={`mx-3 w-30px h-30px d-flex align-items-center justify-content-center ${ans?.isRight ? 'border border-success rounded-circle' : ''}`}>
                  <span className="fs-6  fw-semibold">{DATA_CHAR[ind]}</span>
                </div>
                <div
                  className="ms-2"
                  dangerouslySetInnerHTML={{
                    __html: ans?.content,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 border-bottom">
            Đáp án câu hỏi:
            {item?.questionType == 1 && answerArr?.length > 0 ? (
              <span>
                {answerArr?.map((i, ind) => (
                  <Tag key={ind} className="ms-2 px-2 py-1">
                    <span className="fw-semibold fs-5">{i}</span>
                  </Tag>
                ))}
              </span>
            ) : (
              <span className="fw-semibold ms-2 fs-5">{item?.questionAnswerString}</span>
            )}
          </div>
        )}
        <div className={`p-5 ${check ? 'text-info' : 'text-danger'}`}>
          Đáp án của bạn: <span className="fw-semibold ms-2 fs-5">{item?.questionType == 0 ? DATA_CHAR[ansIndex] : answer?.answerString}</span>
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const random = useSelector(state => state.modal.random);

  const { studentTestId } = useParams();

  const [dataDetail, setDataDetail] = useState(null);
  const [dataQuestion, setDataQuestion] = useState([]);
  const [dataAnswer, setDataAnswer] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [fileAnswer, setFileAnswer] = useState([]);

  useEffect(() => {
    const fetchData = async d => {
      const res = await requestPOST(`api/v1/classsessiontests/chi-tiet-bai-cua-hoc-sinh`, { id: studentTestId });
      var _data = res?.data ?? null;
      setDataDetail(_data);
      setDataQuestion(_data?.questions ?? []);
      setDataAnswer(_data?.userExamAnswers ?? []);
      setFileList(handleImage(_data?.teacherFiles ?? '', FILE_URL));
      setFileAnswer(handleImage(_data?.files ?? '', FILE_URL));
    };
    if (studentTestId) {
      fetchData();
    }
  }, [studentTestId, random]);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-3">
        <div className="px-3 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fa fa-arrow-left fs-2 text-gray-600"></i>
            </a>
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{'Chi tiết bài làm của học sinh'}</h3>
          </div>
          <div className="card-toolbar">
            <a
              className="btn btn-primary btn-sm btn-active-color-primary d-flex align-items-center py-2 me-2"
              data-toggle="m-tooltip"
              title="Lưu"
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({
                    comment: dataDetail?.comment,
                    teacherFiles: dataDetail?.teacherFiles,
                    score: dataDetail?.score,
                    testId: studentTestId,
                  })
                );
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <i className="fas fa-comment-alt fs-4 text-white"></i>
              <span className="fw-bold text-white ms-1 fs-5">Nhận xét</span>
            </a>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9 p-5">
        <HeaderTitle title={'Nhận xét của giáo viên'} />
        <div className="p-3">
          <div className="d-flex mb-3">
            <span className="fw-bold text-gray-600 fs-5  w-150px">Nhận xét:</span>
            <span
              className="flex-grow-1 fs-5"
              dangerouslySetInnerHTML={{
                __html: dataDetail?.comment,
              }}
            />
          </div>
          <div className="d-flex mb-3">
            <span className="fw-bold text-gray-600 fs-5  w-150px">Đính kèm:</span>
            <div className="">
              {fileList?.length > 0 ? (
                fileList?.map((item, index) => (
                  <a key={index} href={item?.url} target="_blank" className="d-flex align-item-center p-2">
                    <div className="text-primary fs-5 fw-600">
                      <span className="fas fa-file  me-5"></span>
                      {item?.name}
                    </div>
                  </a>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        <HeaderTitle title={'Thông tin'} />
        <div className="row p-3">
          <RenderItemInfo title={'Học sinh'} value={dataDetail?.studentFullName} />
          <RenderItemInfo title={'Tài khoản'} value={dataDetail?.studentUserName} />
          <RenderItemInfo title={'Thời gian bắt đầu'} value={dataDetail?.startTime ? dayjs(dataDetail?.startTime).format('DD/MM/YYYY HH:mm') : ''} />
          <RenderItemInfo title={'Thời gian kết thúc'} value={dataDetail?.finishTime ? dayjs(dataDetail?.finishTime).format('DD/MM/YYYY HH:mm') : ''} />
          <RenderItemInfo title={'Số câu trả lời đúng'} value={dataDetail?.rightCount} />
          <RenderItemInfo title={'Số câu trả lời sai'} value={dataDetail?.wrongCount} />
          {dataDetail?.classSessionTestQuestionType == 0 ? (
            <RenderItemInfo title={'Điểm số'} value={`${dataDetail?.score ?? ''}/${dataDetail?.classSessionTestTotalScore ?? ''}`} />
          ) : (
            <RenderItemInfo title={'Điểm số'} value={`${dataDetail?.score ?? ''}`} />
          )}

          {/* <RenderItemInfo title={""} value={dataDetail?.studentFullName} /> */}
        </div>
        <HeaderTitle title={'Bài làm'} />

        {dataDetail?.classSessionTestQuestionType == 0 ? (
          dataQuestion?.length > 0 ? (
            <div className="p-3">
              {dataQuestion?.map((item, index) => (
                <RenderItemQuestion key={Math.random().toString()} item={item} index={index} answer={dataAnswer?.find(i => i.questionId == item?.questionId)} />
              ))}
            </div>
          ) : (
            <Empty />
          )
        ) : dataDetail?.answerStr || fileAnswer?.length > 0 ? (
          <div className="p-3">
            <div className="d-flex mb-3">
              <span className="fw-bold text-gray-600 fs-5  w-150px">Trả lời:</span>
              <span
                className="flex-grow-1 fs-5"
                dangerouslySetInnerHTML={{
                  __html: dataDetail?.answerStr,
                }}
              />
            </div>
            <div className="d-flex mb-3">
              <span className="fw-bold text-gray-600 fs-5  w-150px">Đính kèm:</span>
              <div className="">
                {fileAnswer?.length > 0 ? (
                  fileAnswer?.map((item, index) => (
                    <a key={index} href={item?.url} target="_blank" className="d-flex align-item-center p-2">
                      <div className="text-primary fs-5 fw-600">
                        <span className="fas fa-file  me-5"></span>
                        {item?.name}
                      </div>
                    </a>
                  ))
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Empty />
        )}
      </div>
      <ModalComment />
    </>
  );
};

export default UsersPage;
