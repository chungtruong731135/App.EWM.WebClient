import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input, Select, Spin, DatePicker, Checkbox } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';

import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';
import { Survey_SourceType } from '@/app/data/datas';

import ModalAddQuestions from '../survey-questions/components/ModalAddQuestions';
import RenderListQuestion from '../survey-questions/components/RenderListQuestion';

const FormItem = Form.Item;

const { TextArea } = Input;

const QuestionLevelItemsQuestionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [modalQuestionsVisible, setModalQuestionsVisible] = useState(false);

  const { surveyTemplateId } = useParams();

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [dataQuestion, setDataQuestion] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await requestGET(`api/v1/surveytemplates/${surveyTemplateId}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.startDate = _data?.startDate ? dayjs(_data?.startDate) : null;
        _data.endDate = _data?.endDate ? dayjs(_data?.endDate) : null;
        _data.surveyCategory = _data?.surveyCategoryId
          ? {
              value: _data?.surveyCategoryId ?? null,
              label: _data?.surveyCategoryName ?? null,
            }
          : null;

        setDataQuestion(_data?.questions ?? []);

        form.setFieldsValue({ ..._data });
      }
      setIsLoading(false);
    };

    if (surveyTemplateId) {
      fetchData();
    }
  }, [surveyTemplateId]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const formData = form.getFieldsValue(true);
      if (surveyTemplateId) {
        formData.id = surveyTemplateId;
      }

      if (formData?.sources?.length > 0) {
        formData.sourceIds = formData?.sources?.map(i => i.value)?.join('#');
      } else {
        formData.sourceIds = null;
      }
      if (formData?.supervisors?.length > 0) {
        formData.supervisorIds = formData?.supervisors?.map(i => i.value)?.join('#');
      } else {
        formData.supervisorIds = null;
      }

      var temp = [...dataQuestion];
      temp?.map((i, ind) => {
        i.order = ind + 1;
      });

      formData.questions = temp;

      const res = surveyTemplateId ? await requestPUT_NEW(`api/v1/surveytemplates/${surveyTemplateId}`, formData) : await requestPOST_NEW(`api/v1/surveytemplates`, formData);

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

  const handleAddData = dataSelect => {
    var temp = [...dataQuestion];
    temp = temp.concat(dataSelect);
    temp = _.orderBy(temp, ['order'], ['asc']);
    setDataQuestion(temp);
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
          <h3 className="card-title fw-bolder text-header-td fs-2 ">{'Nhóm khảo sát ' + (form.getFieldValue('name') || '')}</h3>
        </div>
        <div className="card-toolbar">
          {CheckRole(currentUser?.permissions, ['Permissions.Survey.Manage']) && (
            <a className="btn btn-sm btn-primary " title="Lưu" onClick={onFinish}>
              <i className="fas fa-save me-2"></i>
              <span className="">Lưu</span>
            </a>
          )}
        </div>
      </div>
      <div className="card-body p-5">
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Tên nhóm khảo sát" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Input placeholder="" />
                </FormItem>
              </div>

              <div className="col-xl-6 col-lg-6">
                <FormItem label="Mã" name="code">
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Loại khảo sát" name="surveyCategory">
                  <TDSelect
                    reload={true}
                    showSearch
                    placeholder=""
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/categories/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                        isActive: true,
                        categoryGroupCode: 'LoaiKhaoSat',
                        keyword: keyword,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    onChange={(value, current) => {
                      if (value) {
                        form.setFieldValue('surveyCategoryId', current?.id);
                        form.setFieldValue('surveyCategoryName', current?.name);
                      } else {
                        form.setFieldValue('surveyCategoryId', null);
                        form.setFieldValue('surveyCategoryName', null);
                      }
                    }}
                  />
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
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Ngày bắt đầu" name="startDate">
                  <DatePicker
                    format={'DD/MM/YYYY'}
                    style={{ width: '100%' }}
                    onChange={e => {
                      if (e.isAfter(form.getFieldValue('endDate'))) {
                        form.setFieldsValue({ endDate: null });
                      }
                    }}
                  />
                </FormItem>
              </div>
              <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.startDate !== currentValues.startDate}>
                {({ getFieldValue }) => (
                  <div className="col-xl-6 col-lg-6">
                    <FormItem label="Ngày kết thúc" name="endDate">
                      <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} disabledDate={getFieldValue('startDate') ? d => d.isBefore(dayjs(getFieldValue('startDate')).format('YYYY-MM-DD')) : false} />
                    </FormItem>
                  </div>
                )}
              </FormItem>
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Ghi chú" name="description">
                  <TextArea rows={4} placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Nguồn người dùng" name="sourceType" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Select
                    style={{ width: '100%' }}
                    options={Survey_SourceType}
                    onChange={() => {
                      form.setFieldValue('sources', null);
                    }}
                  />
                </FormItem>
              </div>
              <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.sourceType !== currentValues.sourceType}>
                {({ getFieldValue }) =>
                  getFieldValue('sourceType') == 'CourseOffline' ? (
                    <>
                      <div className="col-xl-6 col-lg-6">
                        <FormItem label="Khoá học" name="sources">
                          <TDSelect
                            reload
                            mode="multiple"
                            showSearch
                            placeholder=""
                            fetchOptions={async keyword => {
                              const res = await requestPOST(`api/v1/courses/search`, {
                                pageNumber: 1,
                                pageSize: 1000,
                                keyword: keyword,
                                isActive: true,
                                type: 0,
                              });
                              return res?.data?.map(item => ({
                                ...item,
                                label: `${item.title}`,
                                value: item.id,
                              }));
                            }}
                            style={{
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        </FormItem>
                      </div>
                    </>
                  ) : getFieldValue('sourceType') == 'CourseOnline' ? (
                    <>
                      <div className="col-xl-6 col-lg-6">
                        <FormItem label="Khoá học" name="sources">
                          <TDSelect
                            reload
                            mode="multiple"
                            showSearch
                            placeholder=""
                            fetchOptions={async keyword => {
                              const res = await requestPOST(`api/v1/courses/search`, {
                                pageNumber: 1,
                                pageSize: 1000,
                                keyword: keyword,
                                isActive: true,
                                type: 1,
                              });
                              return res?.data?.map(item => ({
                                ...item,
                                label: `${item.title}`,
                                value: item.id,
                              }));
                            }}
                            style={{
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        </FormItem>
                      </div>
                    </>
                  ) : getFieldValue('sourceType') == 'CourseClass' ? (
                    <>
                      <div className="col-xl-6 col-lg-6">
                        <FormItem label="Lớp học" name="sources">
                          <TDSelect
                            //fieldNames={{ label: 'name', value: 'id' }}
                            reload
                            mode="multiple"
                            showSearch
                            placeholder=""
                            fetchOptions={async keyword => {
                              const res = await requestPOST(`api/v1/courseclasses/search`, {
                                pageNumber: 1,
                                pageSize: 1000,
                                keyword: keyword,
                                isActive: true,
                              });
                              return res?.data?.map(item => ({
                                ...item,
                                label: `${item.name} - ${item?.courseTitle}`,
                                value: item.id,
                              }));
                            }}
                            style={{
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        </FormItem>
                      </div>
                    </>
                  ) : getFieldValue('sourceType') == 'OnlineProgram' ? (
                    <>
                      <div className="col-xl-6 col-lg-6">
                        <FormItem label="Chương trình tuyển sinh" name="sources">
                          <TDSelect
                            reload
                            mode="multiple"
                            showSearch
                            placeholder=""
                            fetchOptions={async keyword => {
                              const res = await requestPOST(`api/v1/courseonlineprograms/search`, {
                                pageNumber: 1,
                                pageSize: 1000,
                                keyword: keyword,
                                isActive: true,
                              });
                              return res?.data?.map(item => ({
                                ...item,
                                label: `${item.name}`,
                                value: item.id,
                              }));
                            }}
                            style={{
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        </FormItem>
                      </div>
                    </>
                  ) : (
                    <></>
                  )
                }
              </FormItem>
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Người phụ trách" name="supervisors">
                  <TDSelect
                    reload
                    mode="multiple"
                    showSearch
                    placeholder=""
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/users/search`, {
                        pageNumber: 1,
                        pageSize: 20,
                        advancedSearch: {
                          fields: ['name'],
                          keyword: keyword || null,
                        },
                        isActive: true,
                        keyword: keyword,
                        types: [0, 3, 4, 5],
                      });
                      return res.data.map(item => ({
                        ...item,
                        label: `${item.fullName}`,
                        value: item.id,
                      }));
                    }}
                    optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </FormItem>
              </div>
              <div className="col-xl-12">
                <div className="card-header d-flex align-items-center justify-content-between px-0 min-h-60px">
                  <div className="d-flex align-items-center">
                    <span className="card-title fw-bolder text-header-td text-primary fs-3 mb-0">{'Danh sách câu hỏi khảo sát'}</span>
                  </div>
                  <div className="card-toolbar">
                    <a
                      className="btn btn-primary btn-sm"
                      onClick={() => {
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
                <RenderListQuestion dataQuestion={dataQuestion} setDataQuestion={setDataQuestion} />
              </div>
            </div>
          </Form>
        </Spin>
      </div>
      {modalQuestionsVisible ? (
        <ModalAddQuestions modalVisible={modalQuestionsVisible} setModalVisible={setModalQuestionsVisible} handleAddData={handleAddData} notInIds={dataQuestion?.map(i => i.id)} maxOrder={_.maxBy(dataQuestion, 'order')?.order} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default QuestionLevelItemsQuestionPage;
