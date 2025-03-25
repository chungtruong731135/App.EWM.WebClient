import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Spin, Empty, Popconfirm, Tag } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW, requestDELETE } from '@/utils/baseAPI';
import ModalAddQuestions from '../exams/components/ModalAddQuestions';
import ModalEditScore from '../exams/components/ModalEditScore';
import ModalEditQuestion from '../questions/components/ChiTietModal';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import RenderItemQuestion from '../exams/components/RenderItemQuestion';
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
const QuestionLevelItemsQuestionPage = props => {
  const { currentVariation } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalVisible = useSelector(state => state.modal.modalVisible);

  const { questionLevelItemId } = useParams();
  const [dataSearch, setDataSearch] = useState(null);
  const [dataQuestion, setDataQuestion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalQuestionsVisible, setModalQuestionsVisible] = useState(false);
  const [modalEditScoreVisible, setModalEditScoreVisible] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await requestPOST(`api/v1/examquestionorders/search-all`, {
        pageNumber: 1,
        pageSize: 1000,
        examVariationId: currentId,
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
    if (refreshing && currentId) {
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/questionlevelitems/${id}`);
      var _data = res?.data ?? {};
      setDataSearch({
        course: {
          label: _data?.courseTitle,
          value: _data?.courseId,
        },
        questionLevel: {
          label: _data?.questionLevelName,
          value: _data?.questionLevelId,
        },
      });
    };
    if (questionLevelItemId) {
      setCurrentId(questionLevelItemId);
      fetchData(questionLevelItemId);
      setRefreshing(true);
    }
  }, [questionLevelItemId]);

  const handleAddData = async dataSelect => {
    if (dataSelect?.length) {
      try {
        await Promise.all(
          dataSelect.map(async (i, index) => {
            var body = {
              examVariationId: currentId,
              questionId: i?.questionId,
              order: i?.order,
              score: i?.score,
            };
            const res = await requestPOST(`api/v1/examquestionorders`, body);
          })
        );
        toast.success('Thao tác thành công!');
      } catch (error) {}
      setRefreshing(true);
    }
  };
  const handleReplaceQuest = async (questId, item) => {
    var tempItem = dataQuestion.find(i => i.questionId == questId);
    var body = {
      id: tempItem?.id,
      questionId: item?.questionId,
      order: tempItem?.order,
      score: tempItem?.score,
    };
    const res = await requestPUT_NEW(`api/v1/examquestionorders/${tempItem?.id}`, body);
    if (res?.status === 200) {
      toast.success('Thao tác thành công!');
      setRefreshing(true);
    } else {
      toast.error('Thất bại, vui lòng thử lại! ');
    }
  };
  // const handleEditScore1 = newData => {
  //   var _data = [...dataQuestion];
  //   if (newData?.parentId) {
  //     var ind = _data.findIndex(i => i.questionId == newData?.parentId);
  //     var child = _data[ind];
  //     child?.children?.map(i => {
  //       if (i?.questionId == newData?.questionId) {
  //         i.score = newData?.score;
  //         i.scoreNull = newData?.scoreNull;
  //         i.scoreWrong = newData?.scoreWrong;
  //         i.order = newData?.order;
  //       }
  //     });
  //     child.score = _.sumBy(child?.children, 'score');
  //     child.scoreNull = _.sumBy(child?.children, 'scoreNull');
  //     child.scoreWrong = _.sumBy(child?.children, 'scoreWrong');

  //   } else {
  //     _data?.map(i => {
  //       if (i?.questionId == newData?.questionId) {
  //         i.score = newData?.score;
  //         i.scoreNull = newData?.scoreNull;
  //         i.scoreWrong = newData?.scoreWrong;
  //         i.order = newData?.order;
  //       }
  //     });
  //   }

  // };
  const handleEditScore = async newData => {
    var tempItem = dataQuestion.find(i => i.questionId == newData?.questionId);
    var body = {
      id: newData?.id,
      questionId: newData?.questionId,
      order: newData?.order,
      score: newData?.score,
      parentId: newData?.parentId ?? null,
    };

    const res = await requestPUT_NEW(`api/v1/examquestionorders/${tempItem?.id}`, body);
    if (res?.status === 200) {
      toast.success('Thao tác thành công!');
      setRefreshing(true);
    } else {
      toast.error('Thất bại, vui lòng thử lại! ');
    }
  };
  const handleDeleteQuest = async deleteId => {
    var tempItem = dataQuestion.find(i => i.questionId == deleteId);
    var res = await requestDELETE(`api/v1/examquestionorders/${tempItem?.id}`);
    if (res) {
      toast.success('Thao tác thành công!');
      setRefreshing(true);
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  return (
    <div className="card card-xl-stretch mb-xl-3">
      <div className="card-header d-flex align-items-center justify-content-between px-5 min-h-60px">
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
          <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{'Danh sách câu hỏi'}</h3>
        </div>
        <div className="card-toolbar">
          {/* <a
            className="btn btn-info btn-sm btn-active-color-primary d-flex align-items-center py-2 me-2"
            data-toggle="m-tooltip"
            title="Lưu"
            onClick={onFinish}
          >
            <i className="fas fa-save fs-4 text-white"></i>
            <span className="fw-bold text-white ms-1 fs-5">Lưu</span>
          </a> */}

          <a
            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
            data-toggle="m-tooltip"
            title="Thêm câu hỏi"
            onClick={() => {
              dispatch(actionsModal.setDataModal({ type: 'checkbox' }));
              setModalQuestionsVisible(true);
            }}
          >
            <i className="fas fa-plus fs-4 p-0"></i>
          </a>
        </div>
      </div>
      <div className="card-body p-5">
        <Spin spinning={isLoading}>
          {dataQuestion?.length > 0 ? (
            <div>
              {dataQuestion?.map((item, index) => (
                <RenderItemQuestion key={index} item={item} index={index} setModalEditScoreVisible={setModalEditScoreVisible} setModalQuestionsVisible={setModalQuestionsVisible} handleDeleteQuest={handleDeleteQuest} />
              ))}
            </div>
          ) : (
            <Empty />
          )}
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
          dataSearch={dataSearch}
        />
      ) : (
        <></>
      )}
      {modalEditScoreVisible ? <ModalEditScore modalVisible={modalEditScoreVisible} setModalVisible={setModalEditScoreVisible} onSubmit={handleEditScore} /> : <></>}
      {modalVisible ? <ModalEditQuestion /> : <></>}
    </div>
  );
};

export default QuestionLevelItemsQuestionPage;
