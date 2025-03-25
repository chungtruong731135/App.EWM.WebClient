import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, Tabs, InputNumber, Radio } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
// import MathType from "@wiris/mathtype-ckeditor5/src/plugin";
import TDEditorNew from '@/app/components/TDEditorNew';
import TDInputTag from '@/app/components/TDInputTag';
import { handleImage } from '@/utils/utils';
import FileUpload from '@/app/components/FileUpload';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';

import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const parentId = dataModal?.parentId ?? null;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [videoList, setVideoList] = useState([]);
  const [typeVideo, setTypeVideo] = useState(0);
  const [audioList, setAudioList] = useState([]);
  const [typeAudio, setTypeAudio] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/questions/${id}`);
      var _data = res?.data ?? null;
      if (_data) {
        _data.course = {
          value: _data?.courseId,
          label: _data?.courseTitle,
        };
        _data.topic = {
          value: _data?.topicId,
          label: _data?.topicName,
        };
        _data.questionLevel = {
          value: _data?.questionLevelId,
          label: _data?.questionLevelName,
        };
        _data.examArea = {
          value: _data?.examAreaId,
          label: _data?.examAreaName,
        };
        if (_data?.type == 1) {
          let temp = [];
          try {
            temp = JSON.parse(_data.answerString);
            if (typeof temp != 'object') {
              temp = [temp];
            }
          } catch (e) {
            console.log(e);
          }
          _data.answerString = temp?.length > 0 ? temp : [];
        }
        setVideoList(handleImage(_data?.videoUrl ?? '', FILE_URL));
        setAudioList(handleImage(_data?.attachmentAudio ?? '', FILE_URL));
        form.setFieldsValue(_data);
      }
      setLoading(false);
    };

    const fetchDataParent = async _parentId => {
      setLoading(true);
      const res = await requestGET(`api/v1/questions/${_parentId}`);
      var _data = res?.data ?? null;
      var _formData = {};
      if (_data) {
        _formData.course = {
          value: _data?.courseId,
          label: _data?.courseTitle,
        };
        _formData.topic = {
          value: _data?.topicId,
          label: _data?.topicName,
        };
        _formData.questionLevel = {
          value: _data?.questionLevelId,
          label: _data?.questionLevelName,
        };
        _formData.examArea = {
          value: _data?.examAreaId,
          label: _data?.examAreaName,
        };

        _formData.courseId = _data?.courseId;
        _formData.topicId = _data?.topicId;
        _formData.questionLevelId = _data?.questionLevelId;
        _formData.examAreaId = _data?.examAreaId;

        form.setFieldsValue(_formData);
      }
      setLoading(false);
    };

    if (id) {
      fetchData();
    } else if (parentId) {
      fetchDataParent(parentId);
    } else if (dataModal?.courseId) {
      form.setFieldsValue({
        questionLevelId: dataModal?.questionLevelId,
        questionLevel: {
          value: dataModal?.questionLevelId,
          label: dataModal?.questionLevelName,
        },
        course: {
          value: dataModal?.courseId,
          label: dataModal?.courseTitle,
        },
        topic: {
          value: dataModal?.topicId,
          label: dataModal?.topicName,
        },
      });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };
      if (body?.type == 0 && body?.answers?.length > 0) {
        var temp = [];
        body?.answers?.map((i, ind) => {
          i.ordinal = ind + 1;
          i.isRight = i?.isRight ?? false;
          temp.push(i);
        });
        body.answers = temp;
        body.answerString = null;
      } else if (body?.type == 1) {
        body.answerString = JSON.stringify(body?.answerString);
        body.answers = null;
      } else {
        body.answers = null;
      }
      if (typeVideo == 0) {
        let arrVideo = [];
        videoList?.forEach(i => {
          if (i?.response) {
            arrVideo.push(i?.response?.data[0]?.url);
          } else {
            arrVideo.push(i?.path);
          }
        });

        body.videoUrl = arrVideo?.join('##');
      }

      if (typeAudio == 0) {
        let arrAudio = [];
        audioList?.forEach(i => {
          if (i?.response) {
            arrAudio.push(i?.response?.data[0]?.url);
          } else {
            arrAudio.push(i?.path);
          }
        });

        body.attachmentAudio = arrAudio?.join('##');
      }

      if (id) {
        body.id = id;
      }
      if (parentId) {
        body.parentId = parentId;
      }
      const res = id ? await requestPUT_NEW(`api/v1/questions/${id}`, body) : await requestPOST_NEW(`api/v1/questions`, body);

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
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
    setBtnLoading(false);
  };
  const onFinishFailed = error => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
  };

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{dataModal?.id ? 'Chi tiết' : 'Thêm mới'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
              <Tabs
                defaultActiveKey="1"
                type="card"
                items={[
                  {
                    label: `Câu hỏi`,
                    key: '1',
                    children: (
                      <div className="row">
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Mã câu hỏi" name="codeId">
                            <Input placeholder="" />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Khoá học" name="course" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                                } else {
                                  form.setFieldValue('courseId', null);
                                }
                                form.setFieldValue('topic', null);
                                form.setFieldValue('topicId', null);
                                form.setFieldValue('questionLevel', null);
                                form.setFieldValue('questionLevelId', null);
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.courseId !== currentValues.courseId}>
                            {({ getFieldValue }) => (
                              <FormItem label="Chủ đề" name="topic" rules={[{ required: true, message: 'Không được để trống!' }]}>
                                <TDSelect
                                  reload
                                  showSearch
                                  placeholder=""
                                  fetchOptions={async keyword => {
                                    const res = await requestPOST(`api/v1/topics/search`, {
                                      pageNumber: 1,
                                      pageSize: 1000,
                                      courseId: getFieldValue('courseId'),
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
                                      form.setFieldValue('topicId', current?.id);
                                    } else {
                                      form.setFieldValue('topicId', null);
                                    }
                                    form.setFieldValue('questionLevel', null);
                                    form.setFieldValue('questionLevelId', null);
                                  }}
                                />
                              </FormItem>
                            )}
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.topicId !== currentValues.topicId}>
                            {({ getFieldValue }) => (
                              <FormItem label="Chương trình học" name="questionLevel" rules={[{ required: true, message: 'Không được để trống!' }]}>
                                <TDSelect
                                  showSearch
                                  reload
                                  placeholder=""
                                  fetchOptions={async keyword => {
                                    const res = await requestPOST(`api/v1/questionLevels/search`, {
                                      pageNumber: 1,
                                      pageSize: 1000,
                                      topicId: getFieldValue('topicId'),
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
                                      form.setFieldValue('questionLevelId', current?.id);
                                    } else {
                                      form.setFieldValue('questionLevelId', null);
                                    }
                                  }}
                                />
                              </FormItem>
                            )}
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Loại câu hỏi" name="type" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={0}>
                            <Select
                              style={{ width: '100%' }}
                              options={[
                                {
                                  value: 0,
                                  label: 'Chọn đáp án',
                                },
                                {
                                  value: 1,
                                  label: 'Điền đáp án',
                                },
                                {
                                  value: 2,
                                  label: 'Tự luận',
                                },
                                parentId == null
                                  ? {
                                      value: 3,
                                      label: 'Tổ hợp câu hỏi',
                                    }
                                  : {},
                              ]}
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
                                } else {
                                  form.setFieldValue('examAreaId', null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Mức độ ưu tiên" name="sortOrder">
                            <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Độ khó" name="difficulty" initialValue={3}>
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
                        </div>

                        <div className="col-xl-12 col-lg-12">
                          <FormItem label="Tiêu đề tiếng anh" name={'titleEn'}>
                            <TDEditorNew
                              data={form.getFieldValue('titleEn') ? form.getFieldValue('titleEn') : ''}
                              onChange={value => {
                                form.setFieldValue('titleEn', value);
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-12 col-lg-12">
                          <FormItem label="Tiêu đề" name={'title'}>
                            <TDEditorNew
                              data={form.getFieldValue('title') ? form.getFieldValue('title') : ''}
                              onChange={value => {
                                form.setFieldValue('title', value);
                              }}
                            />
                          </FormItem>
                        </div>

                        <div className="col-xl-12 col-lg-12">
                          <FormItem label="Nội dung">
                            <TDEditorNew
                              data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                              onChange={value => {
                                form.setFieldValue('content', value);
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-12 col-lg-12">
                          <FormItem label="Gợi ý" name="suggestion">
                            <TextArea rows={4} placeholder="" />
                          </FormItem>
                        </div>
                        <div className="col-xl-12 col-lg-12">
                          <FormItem label="Hướng dẫn giải">
                            <TDEditorNew
                              data={form.getFieldValue('solutionGuide') ? form.getFieldValue('solutionGuide') : ''}
                              onChange={value => {
                                form.setFieldValue('solutionGuide', value);
                              }}
                            />
                          </FormItem>
                        </div>

                        <div className="col-xl-12">
                          <Form.Item label="Video hướng dẫn giải">
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
                            <Form.Item name="videoUrl">
                              <Input placeholder="" />
                            </Form.Item>
                          )}
                        </div>

                        <div className="col-xl-12">
                          <Form.Item label="File Audio">
                            <Radio.Group onChange={e => setTypeAudio(e.target.value)} value={typeAudio}>
                              <Radio value={0}>Đính kèm</Radio>
                              <Radio value={1}>Đường dẫn</Radio>
                            </Radio.Group>
                          </Form.Item>
                          {typeAudio == 0 ? (
                            <Form.Item>
                              <FileUpload
                                maxCount={1}
                                URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/audio`}
                                fileList={audioList}
                                onChange={e => {
                                  if (e?.file?.status === 'error') {
                                    toast.warning('Dung lượng quá lớn');
                                  }
                                  setAudioList(e.fileList);
                                }}
                                headers={{
                                  Authorization: `Bearer ${token}`,
                                }}
                              />
                            </Form.Item>
                          ) : (
                            <Form.Item name="attachmentAudio">
                              <Input placeholder="" />
                            </Form.Item>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: `Đáp án`,
                    key: '2',
                    children: (
                      <div className="min-h-300px">
                        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                          {({ getFieldValue }) =>
                            getFieldValue('type') == 3 ? (
                              <></>
                            ) : getFieldValue('type') == 0 ? (
                              <div className="row">
                                <div className="col-xl-4 col-lg-6">
                                  <FormItem label="" name="answerReorderable" valuePropName="checked">
                                    <Checkbox>Đảo đáp án</Checkbox>
                                  </FormItem>
                                </div>
                                <div className="col-xl-4 col-lg-6">
                                  <FormItem label="" name="specialCharacters" valuePropName="checked">
                                    <Checkbox>Đáp án có ký tự đặc biệt</Checkbox>
                                  </FormItem>
                                </div>
                                <div className="col-xl-4 col-lg-6">
                                  <FormItem label="Số cột đáp án khi hiển thị" name="displayAnswerColumns" initialValue={1}>
                                    <Select
                                      style={{ width: '100%' }}
                                      options={[
                                        {
                                          value: 1,
                                          label: '1',
                                        },
                                        {
                                          value: 2,
                                          label: '2',
                                        },
                                      ]}
                                    />
                                  </FormItem>
                                </div>
                                <div className="col-xl-12">
                                  <FormItem label="Phương án">
                                    <Form.List name="answers">
                                      {(fields, { add, remove }) => (
                                        <>
                                          <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                                            <thead>
                                              <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                                                <th>STT</th>
                                                <th>Nội dung</th>

                                                <th>Là đáp án đúng</th>
                                                <th></th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {fields.map(({ key, name, ...restField }, index) => (
                                                <tr key={key}>
                                                  <td className="w-50px text-center pt-5">{index + 1}</td>
                                                  <td>
                                                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.specialCharacters !== currentValues.specialCharacters}>
                                                      {({ getFieldValue }) =>
                                                        getFieldValue('specialCharacters') ? (
                                                          <FormItem {...restField} name={[name, 'content']} noStyle valuePropName="data">
                                                            <TDEditorNew
                                                              data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                                                              onChange={value => {
                                                                form.setFieldValue(['answers', name, 'content'], value);
                                                              }}
                                                            />
                                                          </FormItem>
                                                        ) : (
                                                          <Form.Item {...restField} name={[name, 'content']} noStyle>
                                                            <TextArea rows={2} placeholder="Phương án" />
                                                          </Form.Item>
                                                        )
                                                      }
                                                    </Form.Item>
                                                  </td>

                                                  <td className="w-150px text-center  pt-5">
                                                    <Form.Item {...restField} name={[name, 'isRight']} valuePropName="checked" noStyle>
                                                      <Checkbox placeholder="Là câu trả lời đúng" defaultChecked={false} />
                                                    </Form.Item>
                                                  </td>
                                                  <td className="w-50px  pt-5">
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
                                  </FormItem>
                                </div>
                              </div>
                            ) : (
                              <div className="row">
                                <div className="col-xl-6 col-lg-6">
                                  <FormItem label="Loại đáp án" name="answerType" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={0}>
                                    <Select
                                      style={{ width: '100%' }}
                                      options={[
                                        {
                                          value: 0,
                                          label: 'Một trong số các đáp án',
                                        },
                                        {
                                          value: 1,
                                          label: 'Toàn bộ đáp án, không sắp xếp',
                                        },
                                        {
                                          value: 2,
                                          label: 'Toàn bộ đáp án, có sắp xếp',
                                        },
                                      ]}
                                    />
                                  </FormItem>
                                </div>
                                <div className="col-xl-12">
                                  <FormItem label={'Đáp án'} name="answerString" initialValue={[]}>
                                    <TDInputTag />
                                  </FormItem>
                                </div>
                              </div>
                            )
                          }
                        </Form.Item>
                      </div>
                    ),
                    disabled: form.getFieldValue('type') == 3,
                  },
                ]}
              />
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
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
