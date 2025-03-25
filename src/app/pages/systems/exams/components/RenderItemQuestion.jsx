import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Tag, Popconfirm } from 'antd';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST } from '@/utils/baseAPI';
const DATA_CHAR = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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
  return type == 1 && answerArr?.length > 0 ? (
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
};

const RenderItemQuestion = ({ item, index, setModalEditScoreVisible, setModalQuestionsVisible, handleDeleteQuest }) => {
  const dispatch = useDispatch();
  const [dataChild, setDataChild] = useState();
  const [answerArr, setAnswerArr] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(`api/v1/questions/search`, { pageNumber: 1, pageSize: 100, parentId: item?.questionId });
      var _data = res?.data ?? [];
      _data?.map(i => {
        i.questionId = i?.id;
        delete i.id;
      });
      _data = _.orderBy(_data, ['order'], ['asc']);
      setDataChild(_data);
      item.children = _data;
    };
    if (item?.questionType == 3) {
      if (item?.children?.length > 0) {
        setDataChild(_.orderBy(item?.children, ['order'], ['asc']));
      } else {
        fetchData();
      }
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
    // if (item?.type == 1 && item?.questionAnswerString) {
    //   let temp = [];
    //   try {
    //     temp = JSON.parse(item?.questionAnswerString);
    //     if (typeof temp != 'object') {
    //       temp = [temp];
    //     }
    //   } catch (e) {
    //     console.log(e);
    //   }
    //   setAnswerArr(temp?.length > 0 ? temp : [item?.questionAnswerString]);
    // }
    return () => {};
  }, [item]);
  return (
    <div className="border mb-5 d-flex flex-column">
      <div className="flex-grow-1 p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="fs-3 fw-bold ">Câu {index + 1}</div>
          <div className="ms-2">
            <a
              className="btn btn-bg-light btn-icon btn-sm btn-active-color-primary me-2"
              data-toggle="m-tooltip"
              title="Sửa câu hỏi"
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({
                    id: item?.questionId,
                  })
                );
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <i className="fas fa-edit p-0"></i>
            </a>
            <a
              className="btn btn-bg-light btn-icon btn-sm btn-active-color-primary me-2"
              data-toggle="m-tooltip"
              title={item?.questionType == 3 ? 'Sửa số thứ tự' : 'Sửa điểm'}
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({
                    id: item?.id,
                    questionId: item?.questionId,
                    score: item?.score,
                    scoreNull: item?.scoreNull,
                    scoreWrong: item?.scoreWrong,
                    order: item?.order,
                    questType: item?.questionType,
                  })
                );
                setModalEditScoreVisible(true);
              }}
            >
              <i className="fas fa-pencil-alt p-0"></i>
            </a>
            <a
              className="btn btn-bg-light btn-icon btn-sm btn-active-color-primary me-2"
              data-toggle="m-tooltip"
              title="Đổi câu hỏi"
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({
                    type: 'radio',
                    questId: item?.questionId,
                  })
                );
                setModalQuestionsVisible(true);
              }}
            >
              <i className="fas fa-sync p-0"></i>
            </a>
            <Popconfirm
              title="Xoá câu hỏi?"
              onConfirm={() => {
                handleDeleteQuest(item?.questionId);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn btn-danger btn-icon btn-sm me-2" data-toggle="m-tooltip" title="Xoá câu hỏi">
                <i className="fas fa-times p-0"></i>
              </a>
            </Popconfirm>
          </div>
        </div>
        <div className="">
          <span>Số thứ tự:</span>
          <span className="ms-2 fs-4 fw-semibold">{item?.order}</span>
        </div>
        {item?.questionType != 3 && (
          <div className="">
            <span>Điểm trong bài thi:</span>
            <span className="ms-2 fs-4 fw-semibold">{item?.score}</span>
          </div>
        )}
      </div>
      <div className="flex-grow-1 p-5 border-bottom">
        <div className="fw-semibold fs-6 text-gray-600" dangerouslySetInnerHTML={{ __html: item?.questionTitle }} />
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
      <div className="flex-grow-1 p-3 border-bottom">
        <div className="">
          <span>Hướng dẫn:</span>
        </div>
        {item?.questionSolutionGuide ? (
          <div
            className="mt-3"
            dangerouslySetInnerHTML={{
              __html: item?.questionSolutionGuide,
            }}
          />
        ) : (
          <></>
        )}
      </div>
      <div className="flex-grow-1">
        {item?.questionType == 3 && dataChild?.length > 0 ? (
          <div className="p-3">
            {_.orderBy(dataChild, ['order'], ['asc'])?.map((quest, ind) => (
              <div className="border mb-5 d-flex flex-column" key={Math.random().toString()}>
                <div className="flex-grow-1 p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="fs-3 fw-bold ">
                      Câu {index + 1}.{ind + 1}
                    </div>
                    <div className="ms-2">
                      <a
                        className="btn btn-bg-light btn-icon btn-sm btn-active-color-primary me-2"
                        data-toggle="m-tooltip"
                        title="Sửa câu hỏi"
                        onClick={() => {
                          dispatch(
                            actionsModal.setDataModal({
                              id: quest?.questionId,
                            })
                          );
                          dispatch(actionsModal.setModalVisible(true));
                        }}
                      >
                        <i className="fas fa-edit p-0"></i>
                      </a>
                      <a
                        className="btn btn-bg-light btn-icon btn-sm btn-active-color-primary me-2"
                        data-toggle="m-tooltip"
                        title="Sửa điểm"
                        onClick={() => {
                          dispatch(
                            actionsModal.setDataModal({
                              id: quest?.id,
                              questionId: quest?.questionId,
                              score: quest?.score,
                              scoreNull: quest?.scoreNull,
                              scoreWrong: quest?.scoreWrong,
                              order: quest?.order,
                              parentId: item?.questionId,
                            })
                          );
                          setModalEditScoreVisible(true);
                        }}
                      >
                        <i className="fas fa-pencil-alt p-0"></i>
                      </a>
                    </div>
                  </div>
                  <div className="">
                    <span>Số thứ tự:</span>
                    <span className="ms-2 fs-4 fw-semibold">{quest?.order}</span>
                  </div>
                  <div className="">
                    <span>Điểm trong bài thi:</span>
                    <span className="ms-2 fs-4 fw-semibold">{quest?.score}</span>
                  </div>
                </div>
                <div className="flex-grow-1 p-5 border-bottom">
                  <div className="fw-semibold fs-6 text-gray-600" dangerouslySetInnerHTML={{ __html: quest?.title || quest?.questionTitle }} />
                  <div
                    className="fw-semibold fs-6"
                    dangerouslySetInnerHTML={{
                      __html: quest?.titleEn || quest?.questionTitleEn,
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
                    <div className="d-flex flex-column " key={Math.random().toString()}>
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
                      Đáp án: <RenderAnswer type={quest?.questionType} answerString={quest?.questionAnswerString} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : item?.questionType == 0 && item?.answers?.length > 0 ? (
          <div className="d-flex flex-column ">
            {item?.answers?.map((ans, ind) => (
              <div className="p-5 border-bottom d-flex align-items-center" key={Math.random().toString()}>
                <div className={`mx-3 w-30px h-30px d-flex align-items-center justify-content-center ${ans?.isRight ? 'border border-success rounded-circle' : ''}`}>
                  <span className="fs-6  fw-semibold">{DATA_CHAR[ind]}</span>
                </div>
                <div className="ms-2" dangerouslySetInnerHTML={{ __html: ans?.content }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5">
            Đáp án:{' '}
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
      </div>
    </div>
  );
};

export default RenderItemQuestion;
