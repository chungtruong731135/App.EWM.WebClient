import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input, Select, Spin, DatePicker, Checkbox } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import * as actionsModal from '@/setup/redux/modal/Actions';

import { requestGET, requestPOST_NEW, requestPUT_NEW } from '@/utils/baseAPI';

import ModalAddUser from './components/ModalAddUser';
import DanhSachNguoiDungKhaoSat from './components/DanhSachNguoiDungKhaoSat';

const FormItem = Form.Item;

const { TextArea } = Input;

const QuestionLevelItemsQuestionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { surveyId, surveyTemplateId } = useParams();

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [modalAddUsersVisible, setModalAddUsersVisible] = useState(false);
  const [dataSurveyTemplate, setDataSurveyTemplate] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await requestGET(`api/v1/surveys/${surveyId}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.startDate = _data?.startDate ? dayjs(_data?.startDate) : null;
        _data.endDate = _data?.endDate ? dayjs(_data?.endDate) : null;

        setQuestions(_data?.questions ?? []);
        form.setFieldsValue({ ..._data });
      }
      setIsLoading(false);
    };

    if (surveyId) {
      fetchData();
    }
  }, [surveyId]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestGET(`api/v1/surveytemplates/${surveyTemplateId}`);
      setDataSurveyTemplate(res?.data ?? null);
    };

    if (surveyTemplateId) {
      fetchData();
    }
  }, [surveyTemplateId]);

  const handleAddData = async values => {
    const res = await requestPOST_NEW(`api/v1/surveys/add-users`, { surveyId: surveyId, users: values });

    if (res.status === 200) {
      toast.success('Thao tác thành công!');
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const onFinish = async () => {
    try {
      await form.validateFields();
      const formData = form.getFieldsValue(true);
      if (surveyId) {
        formData.id = surveyId;
      }
      if (surveyTemplateId) {
        formData.surveyTemplateId = surveyTemplateId;
      }

      const res = surveyId ? await requestPUT_NEW(`api/v1/surveys/${surveyId}`, formData) : await requestPOST_NEW(`api/v1/surveys`, formData);

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
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const onFinishFailed = error => {
    console.log(error);
  };

  return (
    <>
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
            <h3 className="card-title fw-bolder text-header-td fs-2 ">{'Đợt khảo sát ' + (form.getFieldValue('name') || '')}</h3>
          </div>
          <div className="card-toolbar">
            <a className="btn btn-sm btn-primary " title="Lưu" onClick={onFinish}>
              <i className="fas fa-save me-2"></i>
              <span className="">Lưu</span>
            </a>
          </div>
        </div>
        <div className="card-body p-5">
          <Spin spinning={isLoading}>
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Tên khảo sát" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Trạng thái" name="status" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Chưa bắt đầu',
                        },
                        {
                          value: 1,
                          label: 'Đang hoạt động',
                        },
                        {
                          value: 2,
                          label: 'Đã kết thúc',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Hoạt động</Checkbox>
                  </FormItem>
                </div>

                {/*                 <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày kết thúc" name="endDate">
                    <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} disabledDate={dataSurveyTemplate?.startDate ? d => d.isAfter(dayjs(dataSurveyTemplate?.endDate).format('YYYY-MM-DD')) : false} />
                  </FormItem>
                </div> */}
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày bắt đầu" name="startDate">
                    <DatePicker
                      format={'DD/MM/YYYY'}
                      style={{ width: '100%' }}
                      onChange={e => {
                        console.log(e);
                        if (e.isAfter(form.getFieldValue('endDate'))) {
                          form.setFieldsValue({ endDate: null });
                        }
                      }}
                      disabledDate={current => {
                        return (
                          (dataSurveyTemplate?.startDate ? current.isBefore(dayjs(dataSurveyTemplate?.startDate).format('YYYY-MM-DD')) : null) ||
                          (dataSurveyTemplate?.endDate ? current.isAfter(dayjs(dataSurveyTemplate?.endDate).format('YYYY-MM-DD')) : null)
                        );
                      }}
                    />
                  </FormItem>
                </div>
                <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.startDate !== currentValues.startDate}>
                  {({ getFieldValue }) => (
                    <div className="col-xl-6 col-lg-6">
                      <FormItem label="Ngày kết thúc" name="endDate">
                        <DatePicker
                          format={'DD/MM/YYYY'}
                          style={{ width: '100%' }}
                          disabledDate={current => {
                            return (
                              (getFieldValue('startDate') ? current.isBefore(getFieldValue('startDate').format('YYYY-MM-DD')) : null) ||
                              (dataSurveyTemplate?.startDate ? current.isBefore(dayjs(dataSurveyTemplate?.startDate).format('YYYY-MM-DD')) : null) ||
                              (dataSurveyTemplate?.endDate ? current.isAfter(dayjs(dataSurveyTemplate?.endDate).format('YYYY-MM-DD')) : null)
                            );
                          }}
                        />
                      </FormItem>
                    </div>
                  )}
                </FormItem>

                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Ghi chú" name="description">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                {surveyId ? (
                  <div className="col-xl-12">
                    <div className="card-header d-flex align-items-center justify-content-between px-0 min-h-60px">
                      <div className="d-flex align-items-center">
                        <span className="card-title fw-bolder text-header-td text-primary fs-3 mb-0">{'Danh sách người dùng tham gia khảo sát'}</span>
                      </div>
                      <div className="card-toolbar">
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setModalAddUsersVisible(true);
                          }}
                        >
                          <span>
                            <i className="fas fa-plus me-2"></i>
                            <span className="">Thêm người dùng</span>
                          </span>
                        </a>
                      </div>
                    </div>
                    <div className="card-body card-dashboard px-3 py-3">
                      <DanhSachNguoiDungKhaoSat surveyId={surveyId} questions={questions} surveyTemplate={dataSurveyTemplate} />
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </Form>
          </Spin>
        </div>
      </div>
      {modalAddUsersVisible ? (
        <ModalAddUser modalVisible={modalAddUsersVisible} setModalVisible={setModalAddUsersVisible} handleAddData={handleAddData} dataSource={dataSurveyTemplate} notInIds={[]} surveyTemplateId={surveyTemplateId} />
      ) : (
        <></>
      )}
    </>
  );
};

export default QuestionLevelItemsQuestionPage;
