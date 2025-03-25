import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, Select, Tabs, Popconfirm, DatePicker, InputNumber } from 'antd';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, requestPOST, FILE_URL } from '@/utils/baseAPI';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';
import TableList from '@/app/components/TableList';
import ModalAddUser from './ModalAddUser';
import TDModal from '@/app/components/TDModal';
import { CheckRole } from '@/utils/utils';
import { useAuth } from '@/app/modules/auth';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const dispatch = useDispatch();
  const dataModal = useSelector(state => state.modal.courseOnlineClassDetail);
  const modalVisible = useSelector(state => state.modal.courseOnlineClassDetailModalVisible);
  const id = dataModal?.id ?? null;
  const readOnly = dataModal?.readOnly ?? false;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [modalUserVisible, setModalUserVisible] = useState(false);
  const [size, setSize] = useState(50);
  const [offset, setOffset] = useState(1);
  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/courseclasses/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.course = _data?.courseId
          ? {
              value: _data?.courseId,
              label: _data?.courseTitle,
            }
          : null;
        _data.courseOnlineProgram = _data?.courseOnlineProgramId
          ? {
              value: _data?.courseOnlineProgramId,
              label: _data?.courseOnlineProgramName,
            }
          : null;
        _data.teacher = _data?.teacherId
          ? {
              value: _data?.teacherId,
              label: _data?.teacherFullName,
            }
          : null;
        _data.statusObj = _data?.statusId
          ? {
              value: _data?.statusId,
              label: _data?.statusName,
            }
          : null;
        _data.openingDay = _data?.openingDay ? dayjs(_data?.openingDay) : null;
        _data.endDay = _data?.endDay ? dayjs(_data?.endDay) : null;

        if (_data?.users?.length > 0) {
          let temp = [];
          _data?.users?.map((i, index) => {
            temp.push({
              ...i,
              user: {
                value: i?.userId,
                label: i?.fullName,
              },
            });
          });
          _data.users = temp;
        }

        if (_data?.courseClassActiveIds?.length > 0) {
          let temp = [];
          let tmpIds = _data?.courseClassActiveIds?.split('##');
          let tmpNames = _data?.courseClassActiveNames?.split('##');
          try {
            tmpIds?.map((i, index) => {
              temp.push({
                value: i,
                label: tmpNames[index],
              });
            });
          } catch (error) {}

          _data.courseClassActives = temp;
        }

        setDataTable(_data?.students ?? []);
        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };

    if (id) {
      fetchData();
    } else if (dataModal?.courseId) {
      form.setFieldsValue({
        courseId: dataModal?.courseId,
        course: {
          value: dataModal?.courseId,
          label: dataModal?.courseTitle,
        },
      });
    } else if (dataModal?.courseOnlineProgramId) {
      form.setFieldsValue({
        courseOnlineProgramId: dataModal?.courseOnlineProgramId,
        courseOnlineProgram: {
          value: dataModal?.courseOnlineProgramId,
          label: dataModal?.courseOnlineProgramName,
        },
      });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataModal]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setCourseOnlineClassDetailModalVisible(false));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);

      //formData.openingDay = formData.openingDay.format();

      var body = { ...formData };
      body.students = dataTable;
      if (id) {
        body.id = id;
      }

      if (body?.courseClassActives?.length > 0) {
        body.courseClassActiveIds = body?.courseClassActives?.map(i => i.value)?.join('##');
      } else {
        body.courseClassActiveIds = null;
      }

      const res = id ? await requestPUT_NEW(`api/v1/courseclasses/${id}`, body) : await requestPOST_NEW(`api/v1/courseclasses`, body);

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        toast.error('Thất bại, vui lòng thử lại!');
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
  const handleAddData = dataUser => {
    setDataTable(arr => [...arr, ...dataUser]);
  };
  const handleDeleteUser = deleteId => {
    var temp = [...dataTable];
    setDataTable(temp?.filter(i => i.userId != deleteId));
  };

  const RenderTabInfo = () => (
    <div className="row">
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Khoá học" name="course" rules={[{ required: true, message: 'Không được để trống!' }]}>
          <TDSelect
            reload
            showSearch
            placeholder=""
            disabled={dataModal?.courseId ? true : false}
            fetchOptions={async keyword => {
              const res = await requestPOST(`api/v1/courseonlines/search`, {
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
                form.setFieldValue('courseId', current?.id);
              } else {
                form.setFieldValue('courseId', null);
              }
            }}
          />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Chương trình tuyển sinh" name="courseOnlineProgram" rules={[{ required: true, message: 'Không được để trống!' }]}>
          <TDSelect
            reload
            showSearch
            placeholder=""
            fetchOptions={async keyword => {
              const res = await requestPOST(`api/v1/courseonlineprograms/search`, {
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
                form.setFieldValue('courseOnlineProgramId', current?.id);
              } else {
                form.setFieldValue('courseOnlineProgramId', null);
              }
            }}
          />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Tên lớp học" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
          <Input
            placeholder=""
            onChange={e => {
              form.setFieldValue('code', removeAccents(e.target.value));
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
        <FormItem label="Thời gian học" name="studyTime">
          <Input placeholder="" />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Lớp học được quyền khai thác" name="courseClassActives">
          <TDSelect
            showSearch
            reload
            mode="multiple"
            placeholder=""
            fetchOptions={async keyword => {
              const res = await requestPOST(`api/v1/courseclasses/search`, {
                keyword: keyword,
                pageNumber: 1,
                pageSize: 1000,
              });
              return res?.data?.map(item => ({
                ...item,
                label: `${item.courseTitle} - ${item.name}`,
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
        <FormItem label="Buổi học trong tuần" name="studyDay">
          <Input placeholder="" />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Nhóm hỗ trợ Zalo" name="zaloSupportGroup">
          <Input placeholder="" />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Địa chỉ" name="address">
          <Input placeholder="" />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Ngày khai giảng" name="openingDay">
          <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Ngày kết thúc khoá học" name="endDay">
          <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Trạng thái lớp học" name="statusObj">
          <TDSelect
            reload={true}
            showSearch
            placeholder=""
            fetchOptions={async keyword => {
              const res = await requestPOST(`api/v1/categories/search`, {
                pageNumber: 1,
                pageSize: 100,
                isActive: true,
                categoryGroupCode: 'TrangThaiLopHoc',
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
                form.setFieldValue('statusId', current?.id);
                form.setFieldValue('statusName', current?.name);
              } else {
                form.setFieldValue('statusId', null);
                form.setFieldValue('statusName', null);
              }
            }}
          />
        </FormItem>
      </div>

      <div className="col-xl-6 col-lg-6">
        <FormItem label="Số lượng học sinh tối đa" name="maxStudents">
          <InputNumber placeholder="" min={0} style={{ width: '100%' }} />
        </FormItem>
      </div>
      <div className="col-xl-6 col-lg-6">
        <FormItem label="Tên sheet trong GoogleDocs" name="sheetName">
          <Input placeholder="" />
        </FormItem>
      </div>
      <div className="col-xl-12">
        <FormItem label="Mô tả" name="description">
          <TextArea rows={4} placeholder="" />
        </FormItem>
      </div>
      <div className="col-xl-12">
        <FormItem label="Danh sách giảng viên/trợ giảng">
          <Form.List name="users">
            {(fields, { add, remove }) => (
              <>
                <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                  <thead>
                    <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                      <th>STT</th>
                      <th>Người dùng</th>
                      <th>Vai trò</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key}>
                        <td className="w-50px text-center pt-5">{index + 1}</td>
                        <td>
                          <Form.Item {...restField} name={[name, 'user']} noStyle>
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/users/search`, {
                                  pageNumber: 1,
                                  pageSize: 20,
                                  keyword: keyword,
                                  type: 3,
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
                                  form.setFieldValue(['users', name, 'userId'], current?.id);
                                } else {
                                  form.setFieldValue(['users', name, 'userId'], null);
                                }
                              }}
                              optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
                            />
                          </Form.Item>
                        </td>

                        <td className="w-150px text-center ">
                          <Form.Item {...restField} name={[name, 'type']} noStyle>
                            <Select
                              allowClear
                              placeholder="Chọn vai trò"
                              style={{ width: '100%' }}
                              options={[
                                {
                                  value: 0,
                                  label: 'Giảng viên',
                                },
                                {
                                  value: 1,
                                  label: 'Trợ giảng',
                                },
                              ]}
                            />
                          </Form.Item>
                        </td>
                        <td className="w-50px">
                          {readOnly ? (
                            <></>
                          ) : (
                            <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                              <i className="fas fa-minus-circle fs-3"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {readOnly ? (
                  <></>
                ) : (
                  <Form.Item>
                    <button type="button" className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" data-kt-stepper-action="next" onClick={() => add()}>
                      Thêm
                      <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                        <span className="path1" />
                        <span className="path2" />
                      </i>{' '}
                    </button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </FormItem>
      </div>
    </div>
  );
  const RenderTabStudent = () => (
    <div className="table-responsive  min-h-300px">
      {readOnly ? (
        <></>
      ) : (
        <div className="mb-3 d-flex justify-content-end">
          {CheckRole(currentUser?.permissions, ['Permissions.CourseClasses.ManageStudent']) ? (
            <button
              className="btn btn-primary btn-sm py-2"
              onClick={() => {
                setModalUserVisible(true);
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
          ) : (
            <></>
          )}
        </div>
      )}

      <TableList
        dataTable={dataTable}
        columns={columns}
        isPagination={true}
        offset={offset}
        setOffset={setOffset}
        size={size}
        setSize={setSize}
        // scroll={{
        //   y: 500,
        // }}
      />
    </div>
  );
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => {
        const nameArray = record.fullName && record.fullName.length > 1 ? record.fullName.match(/\S+/g) : ['A'];
        const lastName = nameArray[nameArray.length - 1];
        const firstChar = lastName.charAt(0);
        let arr = ['primary', 'success', 'danger', 'warning', 'info', 'muted'];
        const color = arr[index % arr.length];
        return (
          <>
            <div className="d-flex align-items-center">
              {/* begin:: Avatar */}
              <div className="symbol symbol-circle symbol-50px overflow-hidden me-3">
                <a href="#">
                  {record.imageUrl ? (
                    <div className="symbol-label">
                      <img
                        src={record.imageUrl.includes('https://') || record.imageUrl.includes('http://') ? record.imageUrl : FILE_URL + `${record.imageUrl.startsWith('/') ? record.imageUrl.substring(1) : record.imageUrl}`}
                        alt={record.fullName}
                        className="w-100"
                      />
                    </div>
                  ) : (
                    <div className={`symbol-label fs-3 bg-light-${color} text-${color}`}>{` ${firstChar.toUpperCase()} `}</div>
                  )}
                </a>
              </div>
              <div className="d-flex flex-column">
                <a href="#" className="text-gray-800 text-hover-primary mb-1 fw-bolder">
                  {record?.fullName}
                </a>
                <span>{record?.userName}</span>
              </div>
            </div>
          </>
        );
      },
    },
    {
      title: 'Tài khoản',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 80,
      render: (text, record) => {
        return (
          <div className="text-center">
            {readOnly ? (
              <></>
            ) : CheckRole(currentUser?.permissions, ['Permissions.CourseClasses.ManageStudent']) ? (
              <Popconfirm
                title="Xoá?"
                onConfirm={() => {
                  handleDeleteUser(record?.userId);
                }}
                okText="Xoá"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
                  <i className="fa fa-trash"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <>
      <TDModal
        title={id ? 'Chi tiết lớp học' : 'Tạo mới lớp học'}
        show={modalVisible}
        fullscreen={'lg-down'}
        size={'xl'}
        onExited={handleCancel}
        keyboard={true}
        scrollable={true}
        onEscapeKeyDown={handleCancel}
        footer={
          <>
            {CheckRole(currentUser?.permissions, ['Permissions.CourseClasses.Manage']) ? (
              <div className="d-flex justify-content-center  align-items-center">
                <button type="button" className="btn btn-sm btn-primary rounded-1 py-2 px-5 ms-2" onClick={handleSubmit} disabled={btnLoading}>
                  <i className="fa fa-save"></i>
                  {id ? 'Lưu' : 'Tạo mới'}
                </button>
              </div>
            ) : (
              <></>
            )}
            <div className="d-flex justify-content-center  align-items-center">
              <button type="button" className="btn btn-sm btn-secondary rounded-1 py-2 px-5 ms-2" onClick={handleCancel}>
                <i className="fa fa-times"></i>Đóng
              </button>
            </div>
          </>
        }
      >
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish} disabled={readOnly} initialValues={{ status: 0 }}>
              {/* <Tabs
                defaultActiveKey="1"
                type="card"
                items={[
                  {
                    label: `Thông tin`,
                    key: '1',
                    children: <RenderTabInfo />,
                  },
                  {
                    label: `Danh sách học sinh`,
                    key: '2',
                    children: <RenderTabStudent />,
                  },
                ]}
              /> */}
              <RenderTabInfo />
            </Form>
          )}
        </Spin>
      </TDModal>

      {modalUserVisible ? <ModalAddUser modalVisible={modalUserVisible} setModalVisible={setModalUserVisible} notInIds={dataTable?.map(i => i?.userId)} handleAddData={handleAddData} /> : <></>}
    </>
  );
};

export default ModalItem;
