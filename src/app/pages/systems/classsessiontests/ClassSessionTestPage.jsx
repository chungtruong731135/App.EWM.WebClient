import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Select, Spin, InputNumber, Empty, DatePicker, Tag, Checkbox } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import { handleImage } from '@/utils/utils';
import FileUpload from '@/app/components/FileUpload';

import ModalAddQuestions from '../exams/components/ModalAddQuestions';
import ModalAddExams from './components/ModalAddExams';
import ModalEditScore from '../exams/components/ModalEditScore';
import ModalEditQuestion from '../questions/components/ChiTietModal';
import RenderItemQuestion from '../exams/components/RenderItemQuestion';

const FormItem = Form.Item;

const { TextArea } = Input;

const QuestionLevelItemsQuestionPage = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = authHelper.getAuth();

  const modalVisible = useSelector(state => state.modal.modalVisible);

  const { courseId, classSessionId, classSessionTestId } = useParams();

  const [form] = Form.useForm();
  const [dataSearch, setDataSearch] = useState(null);
  const [dataQuestion, setDataQuestion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalQuestionsVisible, setModalQuestionsVisible] = useState(false);
  const [modalEditScoreVisible, setModalEditScoreVisible] = useState(false);

  const [modalAddExamVisible, setModalAddExamVisible] = useState(false);

  const [currentId, setCurrentId] = useState(null);
  const [fileList, setFileList] = useState(null);

  useEffect(() => {
    const fetchData = async id => {
      setIsLoading(true);
      const resData = await requestGET(`api/v1/classsessiontests/${id}`);
      var _data = resData?.data;
      _data.startTime = _data?.startTime ? dayjs(_data?.startTime) : null;
      _data.endTime = _data?.endTime ? dayjs(_data?.endTime) : null;
      setFileList(handleImage(_data?.files ?? '', FILE_URL));
      form.setFieldsValue(_data);
      const res = await requestPOST(`api/v1/examquestionorders/search-all`, {
        pageNumber: 1,
        pageSize: 1000,
        examVariationId: id,
        orderBy: ['Order desc'],
      });
      setDataQuestion(res?.data ?? []);
      setIsLoading(false);
    };
    if (classSessionTestId) {
      fetchData(classSessionTestId);
      setCurrentId(classSessionTestId);
    }
  }, [classSessionId, classSessionTestId]);

  const handleAddData = dataSelect => {
    var temp = [...dataQuestion];
    temp = temp.concat(dataSelect);
    temp = _.orderBy(temp, ['order'], ['asc']);
    setDataQuestion(temp);
  };

  const handleAddExam = async dataExam => {
    form.setFieldsValue({
      duration: dataExam?.duration,
      totalScore: dataExam?.totalScore,
      title: dataExam?.title,
    });

    const res = await requestPOST(`api/v1/exams/list-question-default`, {
      pageNumber: 1,
      pageSize: 1000,
      examId: dataExam?.id,
    });
    var temp = [...dataQuestion];
    temp = temp.concat(res?.data ?? []);
    temp = _.orderBy(temp, ['order'], ['asc']);
    setDataQuestion(temp);

    setModalAddExamVisible(false);
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
  const onFinish = async () => {
    const formData = form.getFieldsValue(true);
    var body = {
      ...formData,
      classSessionId: classSessionId,
    };
    if (body?.questionType == 1) {
      let arrFile = [];
      fileList?.map(i => {
        if (i?.response) {
          arrFile.push(i?.response?.data[0]?.url);
        } else {
          arrFile.push(i?.path);
        }
      });
      body.files = arrFile?.join('##');
    } else if (dataQuestion?.length > 0) {
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
      body.examQuestionOrders = listQuest;
    }

    if (currentId) {
      body.id = currentId;
    }
    const res = currentId ? await requestPUT_NEW(`api/v1/classsessiontests/${currentId}`, body) : await requestPOST_NEW(`api/v1/classsessiontests`, body);

    if (res?.status === 200) {
      toast.success('Thao tác thành công!');
      navigate(-1);
    } else {
      const errors = Object.values(res?.data?.errors ?? {});
      let final_arr = [];
      errors.forEach(item => {
        final_arr = _.concat(final_arr, item);
      });
      toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' '));
    }
  };
  const onFinishFailed = error => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
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
          <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{form.getFieldValue('title') || 'Bài kiểm tra'}</h3>
        </div>
        <div className="card-toolbar">
          <a className="btn btn-info btn-sm btn-active-color-primary d-flex align-items-center py-2 me-2" data-toggle="m-tooltip" title="Lưu" onClick={handleSubmit}>
            <i className="fas fa-save fs-4 text-white"></i>
            <span className="fw-bold text-white ms-1 fs-5">Lưu</span>
          </a>
          {/* <a
            className="btn  btn-secondary btn-sm btn-active-color-primary me-2"
            data-toggle="m-tooltip"
            title="Thêm câu hỏi"
            onClick={() => {
              dispatch(actionsModal.setDataModal({ type: "checkbox" }));
              setModalQuestionsVisible(true);
            }}
          >
            <i className="fas fa-plus fs-4 p-0"></i>
          </a> */}
        </div>
      </div>
      <div className="card-body p-5">
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
            <div className="row">
              <div className="col-xl-4 col-lg-6">
                <FormItem label="Tên bài kiểm tra" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-4 col-lg-6">
                <FormItem label="Loại bài kiểm tra" name="type" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={1}>
                  <Select
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: 0,
                        label: 'Bài tập trên lớp',
                      },
                      {
                        value: 1,
                        label: 'Bài tập về nhà',
                      },
                    ]}
                  />
                </FormItem>
              </div>
              <div className="col-xl-4 col-lg-6">
                <FormItem label="Số thứ tự bài kiểm tra" name="sortOrder">
                  <InputNumber placeholder="" min={0} />
                </FormItem>
              </div>
              <div className="col-xl-4 col-lg-6">
                <FormItem label="Thời gian làm bài" name="duration">
                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} addonAfter="Phút" />
                </FormItem>
              </div>
              <div className="col-xl-4 col-lg-6">
                <FormItem label="Thời gian bắt đầu" name="startTime">
                  <DatePicker showTime={true} format={'DD/MM/YYYY HH:mm'} />
                </FormItem>
              </div>
              <div className="col-xl-4 col-lg-6">
                <FormItem
                  label="Thời gian kết thúc"
                  name="endTime"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('startTime') < value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu!'));
                      },
                    }),
                  ]}
                >
                  <DatePicker showTime={true} format={'DD/MM/YYYY HH:mm'} />
                </FormItem>
              </div>

              <div className="col-xl-12">
                <FormItem label="Mô tả" name="description">
                  <TextArea rows={3} placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-6">
                <FormItem label="Tổng điểm" name="totalScore">
                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-6">
                <FormItem label="Loại câu hỏi" name="questionType" initialValue={0} rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Select
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: 0,
                        label: 'Câu hỏi trên hệ thống',
                      },
                      {
                        value: 1,
                        label: 'Câu hỏi qua file',
                      },
                    ]}
                    onChange={() => {
                      setFileList(null);
                      setDataQuestion([]);
                    }}
                  />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-6">
                <FormItem label="Trạng thái" name="status" initialValue={0}>
                  <Select
                    disabled
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: 0,
                        label: 'Chưa bắt đầu',
                      },
                      {
                        value: 1,
                        label: 'Đang diễn ra',
                      },
                      {
                        value: 2,
                        label: 'Đã kết thúc',
                      },
                    ]}
                  />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-6">
                <FormItem label=" " name="isPublic" valuePropName="checked">
                  <Checkbox>Không sử dụng</Checkbox>
                </FormItem>
              </div>
            </div>
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.questionType !== currentValues.questionType}>
              {({ getFieldValue }) =>
                getFieldValue('questionType') == 1 ? (
                  <div className="col-xl-12">
                    <Form.Item label="File câu hỏi">
                      <FileUpload
                        URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                        fileList={fileList}
                        onChange={e => setFileList(e.fileList)}
                        headers={{
                          Authorization: `Bearer ${token}`,
                        }}
                      />
                    </Form.Item>
                  </div>
                ) : (
                  <div className="col-xl-12">
                    <div className="card-header d-flex align-items-center justify-content-between px-0 min-h-60px">
                      <div className="d-flex align-items-center">
                        <span className="card-title fw-bolder text-header-td text-primary fs-3 mb-0">{'Danh sách câu hỏi'}</span>
                      </div>
                      <div className="card-toolbar">
                        <a
                          className="btn btn-primary btn-sm py-2 me-2"
                          onClick={() => {
                            setModalAddExamVisible(true);
                          }}
                        >
                          <span>
                            <i className="fas fa-plus me-2"></i>
                            <span className="">Thêm từ đề thi có sẵn</span>
                          </span>
                        </a>
                        <a
                          className="btn btn-primary btn-sm py-2 me-2"
                          onClick={() => {
                            dispatch(actionsModal.setDataModal({ type: 'checkbox' }));
                            setModalQuestionsVisible(true);
                          }}
                        >
                          <span>
                            <i className="fas fa-plus me-2"></i>
                            <span className="">Thêm từ ngân hàng câu hỏi</span>
                          </span>
                        </a>
                      </div>
                    </div>

                    {dataQuestion?.length > 0 ? (
                      <div>
                        {dataQuestion?.map((item, index) => (
                          <RenderItemQuestion key={index} item={item} index={index} setModalEditScoreVisible={setModalEditScoreVisible} setModalQuestionsVisible={setModalQuestionsVisible} handleDeleteQuest={handleDeleteQuest} />
                        ))}
                      </div>
                    ) : (
                      <Empty />
                    )}
                  </div>
                )
              }
            </Form.Item>
          </Form>
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
      {modalAddExamVisible ? <ModalAddExams modalVisible={modalAddExamVisible} setModalVisible={setModalAddExamVisible} handleAddData={handleAddExam} dataSearch={dataSearch} /> : <></>}
      {modalEditScoreVisible ? <ModalEditScore modalVisible={modalEditScoreVisible} setModalVisible={setModalEditScoreVisible} onSubmit={handleEditScore} /> : <></>}
      {modalVisible ? <ModalEditQuestion /> : <></>}
    </div>
  );
};

export default QuestionLevelItemsQuestionPage;
