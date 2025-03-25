import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Spin, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, requestPUT_NEW, requestDELETE } from '@/utils/baseAPI';
import ModalAddQuestions from './ModalAddQuestions';
import ModalEditScore from './ModalEditScore';
import ModalEditQuestion from '../../questions/components/ChiTietModal';
import RenderItemQuestion from './RenderItemQuestion';
import ModalExamSkill from './ModalExamSkill';
import ModalExamPart from './ModalExamPart';
import { useQuestionData } from '../hooks/useQuestionData';
const RenderDataQuestion = props => {
  const dispatch = useDispatch();
  const { examId, isGroupQuestions } = props;

  const currentVariation = useSelector(state => state.modal.currentVariation);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const modalExamSkillState = useSelector(state => state.modal.modalExamSkillState);
  const modalExamPartState = useSelector(state => state.modal.modalExamPartState);
  const modalExamSkillVisible = modalExamSkillState?.modalVisible ?? false;
  const modalExamPartVisible = modalExamPartState?.modalVisible ?? false;
  const [modalQuestionsVisible, setModalQuestionsVisible] = useState(false);
  const [modalEditScoreVisible, setModalEditScoreVisible] = useState(false);

  const [dataIndex, setDataIndex] = useState([]);

  const { dataQuestion, setDataQuestion, isLoading, dataSkillPart, setRefreshing } = useQuestionData(examId, currentVariation, isGroupQuestions);

  useEffect(() => {
    if (dataQuestion?.length > 0 && dataSkillPart?.length > 0) {
      var temp = [];
      var start = 0;
      dataSkillPart?.map(skill => {
        skill?.parts?.map(part => {
          let count = _.sumBy(dataQuestion, i => i?.partId == part?.id);
          temp.push({
            partId: part?.id,
            index: start,
          });
          start = start + count;
        });
      });
      setDataIndex(temp);
    }

    return () => {};
  }, [dataQuestion, dataSkillPart]);

  const handleAddData = dataSelect => {
    var temp = [...dataQuestion];
    temp = temp.concat(dataSelect);
    temp = _.orderBy(temp, ['order'], ['asc']);
    setDataQuestion(temp);
  };
  const handleReplaceQuest = (questId, item) => {
    var temp = [...dataQuestion];
    var ind = temp.findIndex(i => i.questionId == questId);
    temp.splice(ind, 1, item);
    setDataQuestion(temp);
  };
  const handleEditScore = newData => {
    var _data = [...dataQuestion];
    if (newData?.parentId) {
      var ind = _data.findIndex(i => i.questionId == newData?.parentId);
      var child = _data[ind];
      var children = child?.children ?? [];
      children?.map(i => {
        if (i?.questionId == newData?.questionId) {
          i.score = newData?.score;
          i.scoreNull = newData?.scoreNull;
          i.scoreWrong = newData?.scoreWrong;
          i.order = newData?.order;
        }
      });
      child.children = _.orderBy(children, ['order'], ['asc']);
      child.score = _.sumBy(children, 'score');
      child.scoreNull = _.sumBy(children, 'scoreNull');
      child.scoreWrong = _.sumBy(children, 'scoreWrong');
      _data.splice(ind, 1, child);
    } else {
      _data?.map(i => {
        if (i?.questionId == newData?.questionId) {
          i.score = newData?.score;
          i.scoreNull = newData?.scoreNull;
          i.scoreWrong = newData?.scoreWrong;
          i.order = newData?.order;
        }
      });
    }
    _data = _.orderBy(_data, ['order'], ['asc']);
    setDataQuestion(_data);
  };
  const handleDeleteQuest = questId => {
    var _data = [...dataQuestion];
    setDataQuestion(_data?.filter(i => i.questionId !== questId));
  };
  const handleDeleteVariation = async () => {
    var res = await requestDELETE(`api/v1/examvariations/${currentVariation.id}`);
    if (res) {
      toast.success('Thao tác thành công!');
      dispatch(actionsModal.setCurrentVariation(null));
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };
  const handleDeleteSkill = async skillId => {
    var res = await requestDELETE(`api/v1/examskillparts/skill/${skillId}`);
    if (res) {
      toast.success('Thao tác thành công!');
      setRefreshing(Math.random());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const onFinish = async () => {
    if (dataQuestion?.length > 0) {
      var listQuest = [];
      dataQuestion?.map(i => {
        listQuest.push({
          id: i?.id ?? null,
          order: i?.order ?? 0,
          score: i?.score ?? 0,
          scoreWrong: i?.scoreWrong ?? 0,
          scoreNull: i?.scoreNull ?? 0,
          questionId: i?.questionId,
          skillId: i?.skillId ?? null, //Nghe noi doc viet
          partId: i?.partId ?? null, //nhom cau hoi
        });
        var children = i?.children ?? [];
        if (children?.length > 0) {
          children?.map(child => {
            listQuest.push({
              id: child?.id ?? null,
              order: child?.order ?? 0,
              score: child?.score ?? 0,
              scoreWrong: child?.scoreWrong ?? 0,
              scoreNull: child?.scoreNull ?? 0,
              questionId: child?.questionId,
              skillId: child?.skillId ?? null, //Nghe noi doc viet
              partId: child?.partId ?? null, //nhom cau hoi
              parentId: i?.questionId,
            });
          });
        }
      });
    }
    var body = {
      code: currentVariation?.code,
      examId: examId,
      isDefault: currentVariation?.isDefault,
      isScoreQuestion: currentVariation?.isScoreQuestion,
      examQuestionOrders: listQuest,
      id: currentVariation?.id,
    };
    if (currentVariation?.id) {
      body.id = currentVariation?.id;
    }
    const res = currentVariation?.id ? await requestPUT_NEW(`api/v1/examvariations/${currentVariation?.id}`, body) : await requestPOST_NEW(`api/v1/examvariations`, body);

    if (res?.status === 200) {
      toast.success('Thao tác thành công!');
      setRefreshing(Math.random());
    } else {
      const errors = Object.values(res?.data?.errors ?? {});
      let final_arr = [];
      errors.forEach(item => {
        final_arr = _.concat(final_arr, item);
      });
      toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' '));
    }
  };
  const getQuestionIndex = (partId, index) => {
    var temp = dataIndex?.find(i => i?.partId == partId);

    return temp?.index + index;
  };
  return (
    <div className="">
      <div className="card-header d-flex align-items-center justify-content-between px-5 min-h-60px">
        <div className="card-title fs-3 mb-0">
          Đề: <span className="fw-bold text-primary ms-2">{currentVariation?.code ?? currentVariation?.id}</span>
        </div>
        <div className="card-toolbar">
          <a className="btn btn-info btn-sm btn-active-color-primary d-flex align-items-center py-2 me-2" data-toggle="m-tooltip" title="Lưu" onClick={onFinish}>
            <i className="fas fa-save fs-4 text-white" />
            <span className="fw-bold text-white ms-1 fs-5">Lưu</span>
          </a>
          <a
            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
            data-toggle="m-tooltip"
            title="Tải xuống"
            onClick={() => {
              toast.info('Chức năng đang cập nhật!');
            }}
          >
            <i className="fas fa-download fs-5 p-0 me-1" />
            <span className="ms-1 fs-7">Tải xuống</span>
          </a>
          <a
            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
            data-toggle="m-tooltip"
            title="Chỉnh sửa"
            onClick={() => {
              dispatch(actionsModal.setModalExamVariationState({ modalVisible: true, modalData: currentVariation }));
            }}
          >
            <i className="fas fa-edit fs-5 p-0 me-1" />
            <span>Chỉnh sửa</span>
          </a>
          {currentVariation?.id && !currentVariation?.isDefault ? (
            <Popconfirm
              title="Xoá mã đề?"
              onConfirm={() => {
                handleDeleteVariation();
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn  btn-secondary btn-sm btn-active-color-primary me-2" data-toggle="m-tooltip" title="Xoá mã đề">
                <i className="fas fa-trash text-danger fs-5 p-0 me-1" />
                <span>Xoá mã đề</span>
              </a>
            </Popconfirm>
          ) : (
            <></>
          )}
          {isGroupQuestions ? (
            <a
              className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
              data-toggle="m-tooltip"
              title="Thêm kỹ năng"
              onClick={() => {
                dispatch(actionsModal.setModalExamSkillState({ modalVisible: true, modalData: { examId: examId } }));
              }}
            >
              <i className="bi bi-bookmark-plus-fill fs-5 p-0 me-1" />
              <span>Thêm kỹ năng</span>
            </a>
          ) : (
            <a
              className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
              data-toggle="m-tooltip"
              title="Thêm câu hỏi"
              onClick={() => {
                dispatch(actionsModal.setDataModal({ type: 'checkbox' }));
                setModalQuestionsVisible(true);
              }}
            >
              <i className="fas fa-plus fs-5 p-0 me-1" />
              <span>Thêm câu hỏi</span>
            </a>
          )}
        </div>
      </div>
      <div className="card-body p-5">
        <Spin spinning={isLoading}>
          {dataSkillPart?.length > 0 ? (
            <div className="mb-5">
              {dataSkillPart?.map((skill, index) => (
                <div key={index} className="mb-3">
                  <div className="card-header p-0 min-h-50px">
                    <div className="card-title fs-3 m-0">
                      <i className="bi bi-bookmark-fill fs-5 p-0 me-1" /> <span className="fw-bold text-primary ms-2">{skill?.name}</span>
                    </div>
                    <div className="card-toolbar">
                      <a
                        className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
                        data-toggle="m-tooltip"
                        title="Sửa kỹ năng"
                        onClick={() => {
                          dispatch(actionsModal.setModalExamSkillState({ modalVisible: true, modalData: skill }));
                        }}
                      >
                        <i className="fas fa-edit fs-5 p-0 me-1" />
                        <span>Sửa</span>
                      </a>

                      <a
                        className="btn  btn-secondary btn-sm btn-active-color-light me-2"
                        data-toggle="m-tooltip"
                        title="Thêm nhóm câu hỏi"
                        onClick={() => {
                          dispatch(actionsModal.setModalExamPartState({ modalVisible: true, modalData: { examId: examId, skillId: skill?.id } }));
                        }}
                      >
                        <i className="bi bi-patch-plus fs-5 p-0 me-1" />
                        <span>Thêm nhóm câu hỏi</span>
                      </a>
                      <Popconfirm
                        title="Xoá nhóm câu hỏi?"
                        onConfirm={() => {
                          handleDeleteSkill(skill?.id);
                        }}
                        okText="Xoá"
                        cancelText="Huỷ"
                      >
                        <a className="btn btn-danger btn-sm btn-active-color-light me-2" data-toggle="m-tooltip" title="Xoá câu hỏi">
                          <i className="fas fa-trash p-0 me-1" />
                          <span>Xoá</span>
                        </a>
                      </Popconfirm>
                    </div>
                  </div>
                  {skill?.parts?.map((part, ind) => (
                    <div key={ind} className="mb-3">
                      <div className="card-header p-0  min-h-55px">
                        <div className="card-title fs-3 m-0 flex-column py-2">
                          <i className="bi bi-patch fs-5 p-0 me-1" /> <span className="fs-4 ms-2">{part?.name}</span>
                          {part?.attachmentAudio ? <audio src={part?.attachmentAudio} controls className="h-30px mt-2" /> : <></>}
                        </div>
                        <div className="card-toolbar">
                          <a
                            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
                            data-toggle="m-tooltip"
                            title="Sửa nhóm câu hỏi"
                            onClick={() => {
                              dispatch(actionsModal.setModalExamPartState({ modalVisible: true, modalData: part }));
                            }}
                          >
                            <i className="fas fa-edit fs-5 p-0 me-1" />
                            <span>Sửa</span>
                          </a>

                          <a
                            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
                            data-toggle="m-tooltip"
                            title="Thêm câu hỏi"
                            onClick={() => {
                              dispatch(actionsModal.setDataModal({ type: 'checkbox', partId: part?.id }));
                              setModalQuestionsVisible(true);
                            }}
                          >
                            <i className="fas fa-plus fs-5 p-0 me-1" />
                            <span>Thêm câu hỏi</span>
                          </a>
                        </div>
                      </div>
                      <div className="px-3 pt-3">
                        {dataQuestion
                          ?.filter(i => i.partId == part?.id)
                          ?.map((item, _ind) => (
                            <RenderItemQuestion
                              key={_ind}
                              item={item}
                              index={getQuestionIndex(part?.id, _ind)}
                              setModalEditScoreVisible={setModalEditScoreVisible}
                              setModalQuestionsVisible={setModalQuestionsVisible}
                              handleDeleteQuest={handleDeleteQuest}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
          <div>
            {dataQuestion
              ?.filter(i => !i?.partId)
              ?.map((item, index) => (
                <RenderItemQuestion key={index} item={item} index={index} setModalEditScoreVisible={setModalEditScoreVisible} setModalQuestionsVisible={setModalQuestionsVisible} handleDeleteQuest={handleDeleteQuest} />
              ))}
          </div>
        </Spin>
      </div>
      {modalQuestionsVisible ? (
        <ModalAddQuestions
          modalVisible={modalQuestionsVisible}
          setModalVisible={setModalQuestionsVisible}
          handleAddData={handleAddData}
          handleReplaceQuest={handleReplaceQuest}
          notInIds={dataQuestion?.map(i => i.questionId)}
          maxOrder={_.maxBy(dataQuestion, 'order')?.order}
        />
      ) : (
        <></>
      )}
      {modalEditScoreVisible ? <ModalEditScore modalVisible={modalEditScoreVisible} setModalVisible={setModalEditScoreVisible} onSubmit={handleEditScore} /> : <></>}
      {modalExamSkillVisible ? <ModalExamSkill /> : <></>}

      {modalExamPartVisible ? <ModalExamPart /> : <></>}
      {modalVisible ? <ModalEditQuestion /> : <></>}
    </div>
  );
};

export default RenderDataQuestion;
