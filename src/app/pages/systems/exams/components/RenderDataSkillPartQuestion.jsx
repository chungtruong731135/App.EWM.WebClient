import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Spin, Empty, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestPOST_NEW, requestPUT_NEW, requestDELETE, HOST_API } from '@/utils/baseAPI';
import ModalAddQuestions from './ModalAddQuestions';
import ModalEditScore from './ModalEditScore';
import ModalEditQuestion from '../../questions/components/ChiTietModal';
import RenderItemQuestion from './RenderItemQuestion';
import ModalExamSkill from './ModalExamSkill';
import ModalExamPart from './ModalExamPart';
const DATA_CHAR = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const RenderDataQuestion = props => {
  const { currentVariation, setCurrentVariation, setModalVariationVisible, examId } = props;
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.modal.modalVisible);

  const [dataQuestion, setDataQuestion] = useState([]);
  const [dataSkillPart, setDataSkillPart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalQuestionsVisible, setModalQuestionsVisible] = useState(false);
  const [modalEditScoreVisible, setModalEditScoreVisible] = useState(false);
  const [dataIndex, setDataIndex] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await requestPOST(`api/v1/examquestionorders/search-all`, {
        pageNumber: 1,
        pageSize: 1000,
        examVariationId: currentVariation?.id,
        orderBy: ['Order desc'],
      });
      var _data = res?.data ?? [];
      if (_data?.length > 0) {
        setDataQuestion(_data);
      } else {
        setDataQuestion([]);
      }
      setIsLoading(false);
    };
    if (refreshing) {
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);
  useEffect(() => {
    if (currentVariation?.id && !refreshing) {
      setRefreshing(true);
    }

    return () => {};
  }, [currentVariation]);

  useEffect(() => {
    if (dataQuestion?.length > 0) {
      var temp = [];
      var start = 0;
      dataQuestion?.map((item, ind) => {
        temp.push({
          questId: item?.questionId,
          index: start,
        });
        start = start + item?.children?.length ?? 0;
      });
      setDataIndex(temp);
    }
    return () => {};
  }, [dataQuestion]);

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
      child?.children?.map(i => {
        if (i?.questionId == newData?.questionId) {
          i.score = newData?.score;
          i.scoreNull = newData?.scoreNull;
          i.scoreWrong = newData?.scoreWrong;
          i.order = newData?.order;
        }
      });
      child.score = _.sumBy(child?.children, 'score');
      child.scoreNull = _.sumBy(child?.children, 'scoreNull');
      child.scoreWrong = _.sumBy(child?.children, 'scoreWrong');
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
      setCurrentVariation(null);
      dispatch(actionsModal.setRandom());
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
      setRefreshing(true);
    } else {
      const errors = Object.values(res?.data?.errors ?? {});
      let final_arr = [];
      errors.forEach(item => {
        final_arr = _.concat(final_arr, item);
      });
      toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' '));
    }
  };
  const getQuestionIndex = (questId, index) => {
    var temp = dataIndex?.find(i => i?.questId == questId);

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
            <i className="fas fa-save fs-4 text-white"></i>
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
            <i className="fas fa-download fs-5 p-0 me-1"></i>
            <span className="ms-1 fs-7">Tải xuống</span>
          </a>
          <a
            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
            data-toggle="m-tooltip"
            title="Chỉnh sửa"
            onClick={() => {
              dispatch(actionsModal.setDataModal(currentVariation));
              setModalVariationVisible(true);
            }}
          >
            <i className="fas fa-edit fs-5 p-0 me-1"></i>
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
                <i className="fas fa-trash text-danger fs-5 p-0 me-1"></i>
                <span>Xoá mã đề</span>
              </a>
            </Popconfirm>
          ) : (
            <></>
          )}
          <a
            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
            data-toggle="m-tooltip"
            title="Thêm câu hỏi"
            onClick={() => {
              dispatch(actionsModal.setDataModal({ type: 'checkbox' }));
              setModalQuestionsVisible(true);
            }}
          >
            <i className="fas fa-plus fs-5 p-0 me-1"></i>
            <span>Thêm câu hỏi</span>
          </a>
        </div>
      </div>
      <div className="card-body p-5">
        <Spin spinning={isLoading}>
          {dataQuestion
            ?.filter(i => !i?.partId)
            ?.map((item, index) => (
              <RenderItemQuestion
                key={index}
                item={item}
                index={getQuestionIndex(item?.questionId, index)}
                setModalEditScoreVisible={setModalEditScoreVisible}
                setModalQuestionsVisible={setModalQuestionsVisible}
                handleDeleteQuest={handleDeleteQuest}
              />
            ))}
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
      {modalVisible ? <ModalEditQuestion /> : <></>}
    </div>
  );
};

export default RenderDataQuestion;
