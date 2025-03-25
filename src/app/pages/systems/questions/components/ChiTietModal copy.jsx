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
import FileUpload from '@/app/components/FileUpload';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import { useQuestionData } from '../hooks/useQuestionData';

const QUESTION_TYPES = [
  { value: 0, label: 'Chọn đáp án' },
  { value: 1, label: 'Điền đáp án' },
  { value: 2, label: 'Tự luận' },
  { value: 3, label: 'Tổ hợp câu hỏi' },
];

const DIFFICULTY_OPTIONS = [
  { value: 3, label: 'Dễ' },
  { value: 2, label: 'Vừa phải' },
  { value: 1, label: 'Khó' },
];

const PROGRAM_OPTIONS = [
  { value: 0, label: 'Câu hỏi thuộc chương trình học' },
  { value: 1, label: 'Câu hỏi thuộc đề thi' },
];

const ANSWER_TYPE_OPTIONS = [
  { value: 0, label: 'Một trong số các đáp án' },
  { value: 1, label: 'Toàn bộ đáp án, không sắp xếp' },
  { value: 2, label: 'Toàn bộ đáp án, có sắp xếp' },
];

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const parentId = dataModal?.parentId ?? null;

  const [form] = Form.useForm();

  const [btnLoading, setBtnLoading] = useState(false);
  const [typeVideo, setTypeVideo] = useState(0);
  const [typeAudio, setTypeAudio] = useState(0);

  const { loading, videoList, setVideoList, audioList, setAudioList, fetchQuestionData } = useQuestionData(form);

  // 5. Tối ưu useEffect
  useEffect(() => {
    if (!id && !parentId && !dataModal?.courseId) return;
    if (id) {
      fetchQuestionData(id);
    } else if (parentId) {
      fetchQuestionData(parentId, true);
    } else {
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
  }, [id, parentId, dataModal?.courseId]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const values = await form.validateFields();

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
      toast.error('Có lỗi xảy ra!');
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
                          <Form.Item label="Mã câu hỏi" name="codeId">
                            <Input placeholder="" />
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item label="Khoá học" name="course" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.courseId !== currentValues.courseId}>
                            {({ getFieldValue }) => (
                              <Form.Item label="Chủ đề" name="topic" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                              </Form.Item>
                            )}
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.topicId !== currentValues.topicId}>
                            {({ getFieldValue }) => (
                              <Form.Item label="Chương trình học" name="questionLevel" rules={[{ required: true, message: 'Không được để trống!' }]}>
                                <TDSelect
                                  showSearch
                                  reload
                                  placeholder=""
                                  fetchOptions={async keyword => {
                                    const res = await requestPOST(`api/v1/questionLevels/search`, {
                                      pageNumber: 1,
                                      pageSize: 1000,
                                      topicId: getFieldValue('topicId'),
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
                                      form.setFieldValue('questionLevelId', current?.id);
                                    } else {
                                      form.setFieldValue('questionLevelId', null);
                                    }
                                  }}
                                />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item label="Loại câu hỏi" name="type" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={0}>
                            <Select style={{ width: '100%' }} options={QUESTION_TYPES} />
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item label="Cấp độ" name="examArea">
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
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item label="Mức độ ưu tiên" name="sortOrder">
                            <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item label="Độ khó" name="difficulty" initialValue={3}>
                            <Select style={{ width: '100%' }} options={DIFFICULTY_OPTIONS} />
                          </Form.Item>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item label="Là câu hỏi thuộc" name="isProgram" initialValue={0}>
                            <Select style={{ width: '100%' }} options={PROGRAM_OPTIONS} />
                          </Form.Item>
                        </div>

                        <div className="col-xl-12 col-lg-12">
                          <Form.Item label="Tiêu đề tiếng anh" name={'titleEn'}>
                            <TDEditorNew
                              data={form.getFieldValue('titleEn') ? form.getFieldValue('titleEn') : ''}
                              onChange={value => {
                                form.setFieldValue('titleEn', value);
                              }}
                            />
                          </Form.Item>
                        </div>
                        <div className="col-xl-12 col-lg-12">
                          <Form.Item label="Tiêu đề" name={'title'}>
                            <TDEditorNew
                              data={form.getFieldValue('title') ? form.getFieldValue('title') : ''}
                              onChange={value => {
                                form.setFieldValue('title', value);
                              }}
                            />
                          </Form.Item>
                        </div>

                        <div className="col-xl-12 col-lg-12">
                          <Form.Item label="Nội dung">
                            <TDEditorNew
                              data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                              onChange={value => {
                                form.setFieldValue('content', value);
                              }}
                            />
                          </Form.Item>
                        </div>
                        <div className="col-xl-12 col-lg-12">
                          <Form.Item label="Gợi ý" name="suggestion">
                            <Input.TextArea rows={4} placeholder="" />
                          </Form.Item>
                        </div>
                        <div className="col-xl-12 col-lg-12">
                          <Form.Item label="Hướng dẫn giải">
                            <TDEditorNew
                              data={form.getFieldValue('solutionGuide') ? form.getFieldValue('solutionGuide') : ''}
                              onChange={value => {
                                form.setFieldValue('solutionGuide', value);
                              }}
                            />
                          </Form.Item>
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
                                  <Form.Item label="" name="answerReorderable" valuePropName="checked">
                                    <Checkbox>Đảo đáp án</Checkbox>
                                  </Form.Item>
                                </div>
                                <div className="col-xl-4 col-lg-6">
                                  <Form.Item label="" name="specialCharacters" valuePropName="checked">
                                    <Checkbox>Đáp án có ký tự đặc biệt</Checkbox>
                                  </Form.Item>
                                </div>
                                <div className="col-xl-4 col-lg-6">
                                  <Form.Item label="Số cột đáp án khi hiển thị" name="displayAnswerColumns" initialValue={1}>
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
                                  </Form.Item>
                                </div>
                                <div className="col-xl-12">
                                  <Form.Item label="Phương án">
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
                                                  <td className="pt-5">
                                                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.specialCharacters !== currentValues.specialCharacters}>
                                                      {({ getFieldValue }) =>
                                                        getFieldValue('specialCharacters') ? (
                                                          <Form.Item {...restField} name={[name, 'content']} noStyle valuePropName="data">
                                                            <TDEditorNew
                                                              data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                                                              onChange={value => {
                                                                form.setFieldValue(['answers', name, 'content'], value);
                                                              }}
                                                            />
                                                          </Form.Item>
                                                        ) : (
                                                          <Form.Item {...restField} name={[name, 'content']} noStyle>
                                                            <Input.TextArea rows={2} placeholder="Phương án" />
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
                                  </Form.Item>
                                </div>
                              </div>
                            ) : (
                              <div className="row">
                                <div className="col-xl-6 col-lg-6">
                                  <Form.Item label="Loại đáp án" name="answerType" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={0}>
                                    <Select style={{ width: '100%' }} options={ANSWER_TYPE_OPTIONS} />
                                  </Form.Item>
                                </div>
                                <div className="col-xl-12">
                                  <Form.Item label={'Đáp án'} name="answerString" initialValue={[]}>
                                    <TDInputTag />
                                  </Form.Item>
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
