import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber, Radio } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import FileUpload from '@/app/components/FileUpload';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';
import ImageUpload from '@/app/components/ImageUpload';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import { handleImage } from '@/utils/utils';
import { Exam_LoaiDeThi } from '@/app/data/datas';
import TDEditorNew from '@/app/components/TDEditorNew';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const modalExamState = useSelector(state => state.modal.modalExamState);

  const dataModal = modalExamState?.modalData ?? null;
  const modalVisible = modalExamState?.modalVisible ?? false;

  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [image, setImage] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [videoPreview, setVideoPreview] = useState([]);
  const [typeVideo, setTypeVideo] = useState(0);
  const [typeVideoPreView, setTypeVideoPreView] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/exams/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.examinat = {
          value: _data?.examinatId,
          label: _data?.examinatTitle,
        };

        _data.topic = {
          value: _data?.topicId,
          label: _data?.topicName,
        };
        _data.questionLevel = {
          value: _data?.questionLevelId,
          label: _data?.questionLevelName,
        };
        _data.examArea = _data.examArea
          ? {
              ..._data.examArea,
              value: _data?.examAreaId,
              label: _data?.examAreaName,
            }
          : null;
        _data.course = {
          value: _data?.courseId,
          label: _data?.courseTitle,
        };
        _data.config = _data.config ? JSON.parse(_data.config) : [];

        if (_data?.tournaments) {
          let temp = [];

          (_data?.tournaments ?? []).map((i, index) => {
            temp.push({
              value: i.id,
              label: i.name,
            });
          });
          _data.tournaments = temp;
        } else {
          _data.tournaments = [];
        }

        if (_data?.gradeIds?.length > 0) {
          let temp = [];
          let tmpIds = _data?.gradeIds?.split('##');
          let tmpNames = _data?.gradeNames?.split('##');
          tmpIds?.map((i, index) => {
            temp.push({
              value: i,
              label: tmpNames[index],
            });
          });
          _data.grades = temp;
        }
        setImage(handleImage(_data?.avatar ?? '', FILE_URL));
        setFileList(handleImage(_data?.file ?? '', FILE_URL));
        setFilePreview(handleImage(_data?.previewFile ?? '', FILE_URL));
        setVideoList(handleImage(_data?.sourceVideo ?? '', FILE_URL));
        setVideoPreview(handleImage(_data?.previewVideo ?? '', FILE_URL));

        form.setFieldsValue(_data);
      }
      setLoading(false);
    };
    if (id) {
      fetchData();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(
      actionsModal.setModalExamState({
        modalVisible: false,
        modalData: null,
      })
    );
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };
      let arrImage = [];
      image.forEach(i => {
        if (i?.response) {
          arrImage.push(i.response.data[0].url);
        } else {
          arrImage.push(i?.path);
        }
      });

      body.avatar = arrImage?.join('##');

      if (fileList?.length > 0) {
        let item = fileList[0];
        body.file = item?.response?.data[0]?.url || item?.path;
      } else {
        body.file = null;
      }
      if (filePreview?.length > 0) {
        let item = filePreview[0];
        body.previewFile = item?.response?.data[0]?.url || item?.path;
      } else {
        body.previewFile = null;
      }
      if (typeVideo == 0) {
        let item = videoList?.length > 0 ? videoList[0] : null;
        body.sourceVideo = item?.response?.data[0]?.url || item?.path;
      }
      if (typeVideoPreView == 0) {
        let item = videoPreview?.length > 0 ? videoList[0] : null;
        body.previewVideo = item?.response?.data[0]?.url || item?.path;
      }

      if (body?.grades?.length > 0) {
        body.gradeIds = body?.grades?.map(i => i.value)?.join('##');
      } else {
        body.gradeIds = null;
      }
      if (body?.config?.length > 0) {
        let config = body?.config;
        config.map(i => delete i.topic);
        body.config = JSON.stringify(config);
      } else {
        body.config = null;
      }

      if (body?.tournaments) {
        body.tournamentIds = body?.tournaments?.map(i => i.value)?.join('##');
      } else {
        body.tournamentIds = null;
      }

      if (id) {
        body.id = id;
      }
      const res = id ? await requestPUT_NEW(`api/v1/exams/${id}`, body) : await requestPOST_NEW(`api/v1/exams`, body);

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        toast.error('Thất bại, vui lòng thử lại! ');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setBtnLoading(false);
  };
  const onFinishFailed = error => {
    console.log(error);
  };
  const handleSubmit = () => {
    /* if (type == true) {
      form.setFieldValue('checkDongBo', true);
    } else {
      form.setFieldValue('checkDongBo', false);
    } */
    form.submit();
  };

  const handleDongBo = () => {
    form.setFieldValue('checkDongBo', true);
    form.submit();
  };

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tiêu đề" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input
                      placeholder=""
                      onChange={e => {
                        if (!id) {
                          form.setFieldValue('code', removeAccents(e.target.value));
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mã" name="code">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại đề thi" name="type" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={1}>
                    <Select
                      style={{ width: '100%' }}
                      options={Exam_LoaiDeThi}
                      onChange={() => {
                        form.setFieldValue('config', []);
                      }}
                    />
                  </FormItem>
                </div>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) =>
                    getFieldValue('type') == 0 ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Khoá học"
                            name="course"
                            rules={[
                              {
                                required: true,
                                message: 'Không được để trống!',
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courses/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
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
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('courseId', current?.id);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                } else {
                                  form.setFieldValue('courseId', null);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Chủ đề"
                            name="topic"
                            rules={[
                              {
                                required: true,
                                message: 'Không được để trống!',
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/topics/search`, {
                                  pageNumber: 1,
                                  pageSize: 100,
                                  keyword: keyword,
                                  courseId: getFieldValue('courseId'),
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
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('topicId', current?.id);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                } else {
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Chương trình học"
                            name="questionLevel"
                            rules={[
                              {
                                required: true,
                                message: 'Không được để trống!',
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/questionLevels/search`, {
                                  pageNumber: 1,
                                  pageSize: 100,
                                  keyword: keyword,
                                  courseId: getFieldValue('courseId'),
                                  topicId: getFieldValue('topicId'),
                                });
                                return res?.data?.map(item => ({
                                  ...item,
                                  label: `${item.name} - ${item?.topicName} - ${item?.courseTitle}`,
                                  value: item.id,
                                }));
                              }}
                              style={{
                                width: '100%',
                                height: 'auto',
                              }}
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('questionLevelId', current?.id);
                                } else {
                                  form.setFieldValue('questionLevelId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : getFieldValue('type') == 1 ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Kỳ thi"
                            name="examinat"
                            rules={[
                              {
                                required: true,
                                message: 'Không được để trống!',
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/examinats/search`, {
                                  pageNumber: 1,
                                  pageSize: 100,
                                  keyword: keyword,
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
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('examinatId', current?.id);
                                  form.setFieldValue('courseId', null);
                                  form.setFieldValue('course', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('questionLevelId', null);
                                  form.setFieldValue('questionLevel', null);
                                } else {
                                  form.setFieldValue('examinatId', null);
                                  form.setFieldValue('courseId', null);
                                  form.setFieldValue('course', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('questionLevelId', null);
                                  form.setFieldValue('questionLevel', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Khối lớp" name="grades">
                            <TDSelect
                              reload
                              mode="multiple"
                              placeholder=""
                              fetchOptions={async () => {
                                const res = await requestPOST(`api/v1/categories/search`, {
                                  pageNumber: 1,
                                  pageSize: 100,
                                  categoryGroupCode: 'KhoiLop',
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
                              onChange={() => {}}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Khoá học"
                            name="course"
                            rules={[
                              {
                                required: true,
                                message: 'Không được để trống!',
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courses/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
                                  examinatId: getFieldValue('examinatId'),
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
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('courseId', current?.id);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                } else {
                                  form.setFieldValue('courseId', null);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Cấp độ" name="examArea">
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/examAreas/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
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
                                height: 'auto',
                              }}
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('examAreaId', current?.id);
                                  current?.duration && form.setFieldValue('duration', current?.duration);
                                  current?.totalQuestion && form.setFieldValue('totalQuestion', current?.totalQuestion);
                                  current?.totalScore && form.setFieldValue('totalScore', current?.totalScore);
                                } else {
                                  form.setFieldValue('examAreaId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : getFieldValue('type') == 2 ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Khoá học"
                            name="course"
                            rules={[
                              {
                                required: true,
                                message: 'Không được để trống!',
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courses/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
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
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('courseId', current?.id);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                } else {
                                  form.setFieldValue('courseId', null);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : getFieldValue('type') == 2 ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Khoá học"
                            name="course"
                            rules={[
                              {
                                required: true,
                                message: 'Không được để trống!',
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courses/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
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
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue('courseId', current?.id);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                } else {
                                  form.setFieldValue('courseId', null);
                                  form.setFieldValue('topic', null);
                                  form.setFieldValue('topicId', null);
                                  form.setFieldValue('questionLevel', null);
                                  form.setFieldValue('questionLevelId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.examinatId !== currentValues.examinatId}>
                  {({ getFieldValue }) => (
                    <div className="col-xl-6 col-lg-6">
                      <FormItem label="Thuộc vòng thi" name="tournaments">
                        <TDSelect
                          reload
                          mode="multiple"
                          placeholder=""
                          fetchOptions={async keyword => {
                            const res = await requestPOST(`api/v1/categories/search`, {
                              pageNumber: 1,
                              pageSize: 1000,
                              categoryGroupCode: 'VongThi',
                              relationshipId: getFieldValue('courseId'),
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
                  )}
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) =>
                    getFieldValue('type') == 2 || getFieldValue('type') == 3 ? (
                      <div className="col-xl-6 col-lg-6">
                        <FormItem label=" " name="isAutomatic" valuePropName="checked" initialValue={false} style={{ marginBottom: 10 }}>
                          <Checkbox>Đề sinh tự động</Checkbox>
                        </FormItem>
                      </div>
                    ) : (
                      <></>
                    )
                  }
                </Form.Item>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thứ tự" name="sortOrder">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thời gian làm bài" name="duration" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} addonAfter="Phút" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tổng số câu hỏi" name="totalQuestion">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tổng điểm" name="totalScore">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isAutomatic !== currentValues.isAutomatic}>
                  {({ getFieldValue }) =>
                    getFieldValue('isAutomatic') ? (
                      <div className="col-xl-12">
                        <Form.List name="config">
                          {(fields, { add, remove }) => (
                            <>
                              <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                                <thead>
                                  <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                                    <th>Chuyên đề</th>
                                    <th>Số lượng câu hỏi</th>
                                    <th>Độ khó</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fields.map(({ key, name, ...restField }, index) => (
                                    <tr key={key}>
                                      <td>
                                        <Form.Item
                                          {...restField}
                                          name={[name, 'topic']}
                                          noStyle
                                          initialValue={{
                                            label: form.getFieldValue(['config', name, 'topicName']),
                                            value: form.getFieldValue(['config', name, 'topicId']),
                                          }}
                                        >
                                          <TDSelect
                                            reload
                                            showSearch
                                            placeholder=""
                                            fetchOptions={async keyword => {
                                              const res = await requestPOST(`api/v1/topics/search`, {
                                                pageNumber: 1,
                                                pageSize: 100,
                                                type: 3,
                                                keyword: keyword,
                                                courseId: form.getFieldValue('courseId'),
                                              });
                                              return res?.data?.map(item => ({
                                                ...item,
                                                label: item?.name,
                                                value: item.id,
                                              }));
                                            }}
                                            style={{
                                              width: '100%',
                                              height: 'auto',
                                            }}
                                            onChange={(value, current) => {
                                              if (value) {
                                                form.setFieldValue(['config', name, 'topicId'], current?.id);
                                                form.setFieldValue(['config', name, 'topicName'], current?.name);
                                              } else {
                                                form.setFieldValue(['config', name, 'topicId'], null);
                                                form.setFieldValue(['config', name, 'topicName'], null);
                                              }
                                            }}
                                          />
                                        </Form.Item>
                                      </td>

                                      <td className="w-xl-250px text-center ">
                                        <FormItem
                                          name={[name, 'amount']}
                                          rules={[
                                            {
                                              required: true,
                                              message: 'Không được để trống!',
                                            },
                                          ]}
                                        >
                                          <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                        </FormItem>
                                      </td>
                                      <td className="w-xl-200px w-lg-150px text-center ">
                                        <FormItem name={[name, 'difficulty']}>
                                          <Select
                                            style={{ width: '100%' }}
                                            options={[
                                              {
                                                value: 3,
                                                label: 'Dễ',
                                              },
                                              {
                                                value: 2,
                                                label: 'Vừa phải',
                                              },
                                              {
                                                value: 1,
                                                label: 'Khó',
                                              },
                                            ]}
                                          />
                                        </FormItem>
                                      </td>
                                      <td className="w-50px">
                                        <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                                          <i className="fas fa-minus-circle fs-3"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <Form.Item>
                                <button type="button" className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" data-kt-stepper-action="next" onClick={() => add()}>
                                  Thêm
                                  <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                                    <span className="path1" />
                                    <span className="path2" />
                                  </i>{' '}
                                </button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </div>
                    ) : (
                      <></>
                    )
                  }
                </Form.Item>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="description">
                    {/* <TextArea rows={4} placeholder="" /> */}
                    <TDEditorNew
                      data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                      onChange={value => {
                        form.setFieldValue(['answers', name, 'content'], value);
                      }}
                    />
                  </FormItem>
                </div>

                <div className="col-xl-6">
                  <FormItem label="Ảnh đại diện">
                    <ImageUpload
                      URL={`${API_URL}/api/v1/attachments/public`}
                      fileList={image}
                      onChange={e => setImage(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <FormItem label="" name="isGroupQuestions" valuePropName="checked" style={{ marginBottom: 10 }}>
                    <Checkbox>Là đề có nhóm câu hỏi</Checkbox>
                  </FormItem>
                  <FormItem label="" name="isFree" valuePropName="checked" style={{ marginBottom: 10 }}>
                    <Checkbox>Miễn phí</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <FormItem label="" name="isActive" valuePropName="checked" style={{ marginBottom: 10 }}>
                    <Checkbox>Hoạt động</Checkbox>
                  </FormItem>
                  <FormItem label="" name="isTrial" valuePropName="checked" style={{ marginBottom: 10 }}>
                    <Checkbox>Cho phép học thử</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Link sang hệ thống khác" name="examLink">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="File tài liệu">
                    <FileUpload
                      maxCount={1}
                      URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                      fileList={fileList}
                      onChange={e => {
                        if (e?.fileList?.length > 0) {
                          let item = e?.fileList[0];
                          form.setFieldValue('capacity', item?.size);
                        }
                        setFileList(e.fileList);
                      }}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="File tài liệu xem trước">
                    <FileUpload
                      maxCount={1}
                      URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                      fileList={filePreview}
                      onChange={e => setFilePreview(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Video">
                    <Radio.Group onChange={e => setTypeVideo(e.target.value)} value={typeVideo}>
                      <Radio value={0}>Đính kèm</Radio>
                      <Radio value={1}>Đường dẫn</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {typeVideo == 0 ? (
                    <Form.Item>
                      <FileUpload
                        maxCount={1}
                        accept="video/*"
                        URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/videos`}
                        fileList={videoList}
                        onChange={e => {
                          if (e?.file?.status === 'error') {
                            toast.warning('Dung lượng quá lớn');
                          }
                          setVideoList(e.fileList);
                        }}
                        headers={{
                          Authorization: `Bearer ${token}`,
                        }}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="sourceVideo">
                      <Input placeholder="" />
                    </Form.Item>
                  )}
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Video xem trước">
                    <Radio.Group onChange={e => setTypeVideoPreView(e.target.value)} value={typeVideoPreView}>
                      <Radio value={0}>Đính kèm</Radio>
                      <Radio value={1}>Đường dẫn</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {typeVideoPreView == 0 ? (
                    <Form.Item>
                      <FileUpload
                        maxCount={1}
                        accept="video/*"
                        URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/videos`}
                        fileList={videoPreview}
                        onChange={e => {
                          if (e?.file?.status === 'error') {
                            toast.warning('Dung lượng quá lớn');
                          }
                          setVideoPreview(e.fileList);
                        }}
                        headers={{
                          Authorization: `Bearer ${token}`,
                        }}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="previewVideo">
                      <Input placeholder="" />
                    </Form.Item>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {id ? (
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-success rounded-1 py-2 px-5  ms-2" onClick={handleDongBo} disabled={btnLoading}>
              <i className="fa fa-refresh me-2"></i>
              {'Lưu và đồng bộ lại cấu trúc câu hỏi theo cấp độ'}
            </Button>
          </div>
        ) : (
          <></>
        )}
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
            <i className="fa fa-save me-2"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times me-2"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
