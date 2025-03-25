import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Spin, Checkbox, InputNumber, DatePicker, Radio } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import TDEditorNew from '@/app/components/TDEditorNew';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL, requestPOST } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';
import TDModal from '@/app/components/TDModal';
import FileUpload from '@/app/components/FileUpload';

const FormItem = Form.Item;

const ModalItem = () => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const dataModal = useSelector(state => state.modal.courseDetail);
  const modalVisible = useSelector(state => state.modal.courseDetailModalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [typeFile, setTypeFile] = useState(0);
  const [typeVideo, setTypeVideo] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/courses/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.expirationDate = _data?.expirationDate ? dayjs(_data?.expirationDate) : null;
        _data.examination = _data?.examinatId
          ? {
              value: _data?.examinatId,
              label: _data?.examinatTitle,
            }
          : null;
        // _data.teacher = _data?.teacherId
        //   ? {
        //       value: _data?.teacherId,
        //       label: _data?.teacherName,
        //     }
        //   : null;
        _data.teacher = _data?.teacherId
          ? {
              value: _data?.teacherId,
              label: _data?.teacherName,
            }
          : null;
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

        if (_data?.courseActiveIds?.length > 0) {
          let temp = [];
          let tmpIds = _data?.courseActiveIds?.split('##');
          let tmpNames = _data?.courseActiveNames?.split('##');
          tmpIds?.map((i, index) => {
            temp.push({
              value: i,
              label: tmpNames[index],
            });
          });
          _data.courseActives = temp;
        }
        setVideoList(handleImage(_data?.guideVideo ?? '', FILE_URL));
        setImage(handleImage(_data?.avatar ?? '', FILE_URL));
        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };
    if (id) {
      fetchData();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setCourseDetailModalVisible(false));
    dispatch(actionsModal.setCourseDetail(null));
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

      if (typeVideo == 0) {
        let arrVideo = [];
        videoList?.forEach(i => {
          if (i?.response) {
            arrVideo.push(i?.response?.data[0]?.url);
          } else {
            arrVideo.push(i?.path);
          }
        });

        body.guideVideo = arrVideo?.join('##');
      }

      body.avatar = arrImage?.join('##');
      if (body?.grades?.length > 0) {
        body.gradeIds = body?.grades?.map(i => i.value)?.join('##');
      } else {
        body.gradeIds = null;
      }

      if (body?.courseActives?.length > 0) {
        body.courseActiveIds = body?.courseActives?.map(i => i.value)?.join('##');
      } else {
        body.courseActiveIds = null;
      }
      if (id) {
        body.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/courses/${id}`, body) : await requestPOST_NEW(`api/v1/courses`, body);

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        //toast.error('Thất bại, vui lòng thử lại!');
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
    <>
      <TDModal
        title={id ? 'Chi tiết khoá học' : 'Tạo mới khóa học'}
        show={modalVisible}
        fullscreen={'lg-down'}
        size={'xl'}
        onExited={handleCancel}
        keyboard={true}
        scrollable={true}
        onEscapeKeyDown={handleCancel}
        footer={
          <>
            <div className="d-flex justify-content-center  align-items-center">
              <button type="button" className="btn btn-sm btn-primary rounded-1 py-2 px-5 ms-2" onClick={handleSubmit} disabled={btnLoading}>
                <i className="fa fa-save me-2"></i>
                {id ? 'Lưu' : 'Tạo mới'}
              </button>
            </div>
            <div className="d-flex justify-content-center  align-items-center">
              <button type="button" className="btn btn-sm btn-secondary rounded-1 py-2 px-5 ms-2" onClick={handleCancel}>
                <i className="fa fa-times me-2"></i>Đóng
              </button>
            </div>
          </>
        }
      >
        <Spin spinning={loadding}>
          {!loadding && (
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
                  <FormItem label="Mã khoá học" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Kỳ thi" name="examination">
                    <TDSelect
                      reload
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/examinats/search`, {
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
                          form.setFieldValue('examinatId', current?.id);
                        } else {
                          form.setFieldValue('examinatId', null);
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
                          pageSize: 1000,
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
                      // onChange={(value, current) => {
                      //   if (value) {
                      //     form.setFieldValue("grades", current);
                      //   } else {
                      //     form.setFieldValue("grades", null);
                      //   }
                      // }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Khoá học kích hoạt cùng" name="courseActives">
                    <TDSelect
                      reload
                      showSearch
                      mode="multiple"
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/courses/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          type: 3,
                          keyword: keyword,
                        });
                        return res?.data?.map(item => ({
                          ...item,
                          label: `${item.type == 1 ? 'ONLINE - ' : ''}${item.title}`,
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
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giáo viên" name="teacher">
                    <TDSelect
                      reload
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/teachers/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return res?.data?.map(item => ({
                          ...item,
                          label: `${item.fullName}`,
                          value: item.id,
                        }));
                      }}
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('teacherId', current?.id);
                        } else {
                          form.setFieldValue('teacherId', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giá tiền" name="price">
                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giá khuyến mại" name="promotePrice">
                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isSpecial" valuePropName="checked" initialValue={false} style={{ marginBottom: 10 }}>
                    <Checkbox>Khoá học đặc biệt</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isEnableRoute" valuePropName="checked" initialValue={false} style={{ marginBottom: 10 }}>
                    <Checkbox>Khoá học áp dụng lộ trình</Checkbox>
                  </FormItem>
                </div>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isSpecial !== currentValues.isSpecial}>
                  {({ getFieldValue }) =>
                    getFieldValue('isSpecial') ? (
                      <div className="col-xl-12">
                        <Form.List name="tournamentRelationships">
                          {(fields, { add, remove }) => (
                            <>
                              <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                                <thead>
                                  <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                                    <th>Vòng thi</th>
                                    <th>Giá</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fields.map(({ key, name, ...restField }) => (
                                    <tr key={key}>
                                      <td>
                                        <Form.Item
                                          {...restField}
                                          name={[name, 'tournament']}
                                          noStyle
                                          initialValue={{
                                            label: form.getFieldValue(['tournamentRelationships', name, 'tournamentName']),
                                            value: form.getFieldValue(['tournamentRelationships', name, 'tournamentId']),
                                          }}
                                        >
                                          <TDSelect
                                            reload
                                            placeholder=""
                                            fetchOptions={async () => {
                                              const res = await requestPOST(`api/v1/categories/search`, {
                                                pageNumber: 1,
                                                pageSize: 100,
                                                categoryGroupCode: 'VongThi',
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
                                                form.setFieldValue(['tournamentRelationships', name, 'tournamentId'], current?.id);
                                                form.setFieldValue(['tournamentRelationships', name, 'tournamentName'], current?.name);
                                              } else {
                                                form.setFieldValue(['tournamentRelationships', name, 'tournamentId'], null);
                                                form.setFieldValue(['tournamentRelationships', name, 'tournamentName'], null);
                                              }
                                            }}
                                          />
                                        </Form.Item>
                                      </td>

                                      <td className="w-xl-250px text-center ">
                                        <FormItem
                                          name={[name, 'price']}
                                          rules={[
                                            {
                                              required: true,
                                              message: 'Không được để trống!',
                                            },
                                          ]}
                                        >
                                          <InputNumber min={0} placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
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
                                  <i className="ki-duotone ki-plus fs-3 ms-2" />
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

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày hết hạn khuyến mãi" name="expirationDate">
                    <DatePicker placeholder="" format={'DD/MM/YYYY'} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mức độ ưu tiên" name="sortOrder">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tổng điểm bài thi" name="totalScore">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="description">
                    <TDEditorNew
                      data={form && form.getFieldValue('description') ? form.getFieldValue('description') : ''}
                      onChange={value => {
                        form.setFieldValue('description', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Lợi ích" name="benefit">
                    <TDEditorNew
                      data={form.getFieldValue('benefit') ? form.getFieldValue('benefit') : ''}
                      onChange={value => {
                        form.setFieldValue('benefit', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mục tiêu" name="target">
                    <TDEditorNew
                      data={form.getFieldValue('target') ? form.getFieldValue('target') : ''}
                      onChange={value => {
                        form.setFieldValue('target', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Thời gian học" name="studyTime">
                    <TDEditorNew
                      data={form.getFieldValue('studyTime') ? form.getFieldValue('studyTime') : ''}
                      onChange={value => {
                        form.setFieldValue('studyTime', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Cấu trúc" name="structure">
                    <TDEditorNew
                      data={form.getFieldValue('structure') ? form.getFieldValue('structure') : ''}
                      onChange={value => {
                        form.setFieldValue('structure', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Hỗ trợ" name="support">
                    <TDEditorNew
                      data={form.getFieldValue('support') ? form.getFieldValue('support') : ''}
                      onChange={value => {
                        form.setFieldValue('support', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Hướng dẫn khai thác" name="guide">
                    <TDEditorNew
                      data={form.getFieldValue('guide') ? form.getFieldValue('guide') : ''}
                      onChange={value => {
                        form.setFieldValue('guide', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Đối tượng" name="doiTuong">
                    <Input.TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Yêu cầu đầu ra" name="yeuCauDauRa">
                    <Input.TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Yêu cầu đầu vào" name="yeuCauDauVao">
                    <Input.TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                {/* <div className="col-xl-12 col-lg-12">
                  <FormItem label="Hướng dẫn khai thác bằng video" name="guideVideo">
                    <Input
                      placeholder=""
                      onChange={e => {
                        form.setFieldValue('code', removeAccents(e.target.value));
                      }}
                    />
                  </FormItem>
                </div> */}
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
                    <Form.Item name="guideVideo">
                      <Input placeholder="" />
                    </Form.Item>
                  )}
                </div>
                <div className="col-xl-12 col-lg-12">
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

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isPublic" valuePropName="checked">
                    <Checkbox>Hiển thị trang chủ</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isActive" valuePropName="checked">
                    <Checkbox>Sử dụng</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isTrial" valuePropName="checked">
                    <Checkbox>Cho phép học thử</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isDisableForSale" valuePropName="checked">
                    <Checkbox>Ẩn khỏi danh sách kích hoạt khoá</Checkbox>
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </TDModal>
    </>
  );
};

export default ModalItem;
