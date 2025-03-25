/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm, Dropdown, Input, Form } from 'antd';
import clsx from 'clsx';

import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, FILE_URL, requestDELETE_NEW } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import ChiTietPermissionUserModal from './ChiTietPermissionUserModal';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';
import ModalDiscount from './ModalDiscount';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';
const FormItem = Form.Item;

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const modalVisible = useSelector(state => state.modal.modalVisible);
  const dataSearch = props?.dataSearch;
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);

  const [userHandle, setUserHandle] = useState(null);
  const [modalKhoiPhucMKVisible, setModalKhoiPhucMKVisible] = useState(false);
  const [modalCapQuyen, setModalCapQuyen] = useState(false);
  const [form] = Form.useForm();
  const [refreshing, setRefreshing] = useState(false);
  const [modalDiscountVisible, setModalDiscountVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/users/search`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
            },
            dataSearch
          )
        );
        setDataTable(res?.data ?? []);
        setCount(res?.totalCount ?? 0);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (refreshing) {
      fetchData();
      setRefreshing(false);
    }
    return () => {};
  }, [refreshing]);
  useEffect(() => {
    if (!refreshing) {
      setRefreshing(true);
    }
    return () => {};
  }, [offset, size, dataSearch, random]);
  useEffect(() => {
    setOffset(1);
    return () => {};
  }, [dataSearch]);

  const handleKhoiPhucMatKhau = item => {
    setUserHandle(item);
    form.resetFields();
    setModalKhoiPhucMKVisible(true);
  };

  const handleCancel = () => {
    setModalKhoiPhucMKVisible(false);
    setModalCapQuyen(false);
    setUserHandle(null);
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    let formData = form.getFieldsValue(true);
    formData.userName = userHandle?.userName ?? '';

    //console.log(formData);
    if (!formData.password || !formData.confirmPassword || formData.password != formData.confirmPassword) {
      toast.error('Thất bại, vui lòng nhập lại mật khẩu!');
      return;
    }
    var res = await requestPOST(`api/users/admin-reset-password`, formData);

    toast.success('Cập nhật thành công!');
    handleCancel();
  };

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        navigate(`/system/users/${item?.id}`);
        break;

      case 'delete':
        var res = await requestDELETE_NEW(`api/users/${item.id}`);
        if (res.status == 200) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error(res?.data?.exception ?? 'Thất bại, vui lòng thử lại!');
        }
        break;
      case 'edit-employee':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));
        break;
      case 'chiet-khau':
        dispatch(actionsModal.setDataModal(item));
        setModalDiscountVisible(true);
        break;
      case 'cap-quyen':
        setUserHandle(item);
        setModalCapQuyen(true);
        break;

      case 'toggle-status':
        await requestPOST(`api/users/${item.id}/toggle-status`, {
          activateUser: !item.isActive,
          userId: item.id,
        });

        toast.success('Thao tác thành công!');
        dispatch(actionsModal.setRandom());

        break;

      case 'cap-lai-mat-khau':
        handleKhoiPhucMatKhau(item);
        //setEditVanBan(true);
        break;

      default:
        break;
    }
  };

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
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
      title: 'Ngày tạo',
      dataIndex: 'createdOn',
      key: 'createdOn',
    },
    {
      title: 'Mã giới thiệu cá nhân',
      dataIndex: 'myRefCode',
      key: 'myRefCode',
    },
    {
      width: '10%',
      title: 'Trạng thái',
      render: (text, record, index) => {
        return (
          <>
            <div className={clsx('badge fw-bolder', `badge-light-${record.isActive ? 'success' : 'danger'}`)}>{record.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}</div>
          </>
        );
      },
      key: 'isActive',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 170,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Sửa thông tin"
              onClick={() => {
                handleButton(`edit-employee`, record);
              }}
            >
              <i className="fa fa-user-pen"></i>
            </a>

            {CheckRole(currentPermissions, ['Permissions.Users.Delete']) && (
              <Popconfirm
                title="Xoá?"
                onConfirm={() => {
                  handleButton(`delete`, record);
                }}
                okText="Xoá"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
                  <i className="fa fa-trash"></i>
                </a>
              </Popconfirm>
            )}
            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  {
                    key: 'cap-lai-mat-khau',
                    disabled: false,
                    label: (
                      <a
                        className="e-1 p-2 text-dark"
                        onClick={() => {
                          handleButton(`cap-lai-mat-khau`, record);
                        }}
                      >
                        <i className={`fa fa-key me-2`}></i>
                        {`Khôi phục mật khẩu`}
                      </a>
                    ),
                  },
                  record?.isActive
                    ? {
                        key: 'verifi-user',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              handleButton(`toggle-status`, record);
                            }}
                          >
                            <i className={`fa fa-user-lock me-2`}></i>
                            Dừng kích hoạt tài khoản
                          </a>
                        ),
                      }
                    : null,
                  !record?.isActive
                    ? {
                        key: 'verifi-user',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              handleButton(`toggle-status`, record);
                            }}
                          >
                            <i className={`fa fa-lock-open me-2`}></i>
                            Kích hoạt tài khoản
                          </a>
                        ),
                      }
                    : null,
                  CheckRole(currentPermissions, ['Permissions.Permissions.Manage'])
                    ? {
                        key: 'cap-quyen',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              handleButton(`cap-quyen`, record);
                            }}
                          >
                            <i className={`fa fa-user-shield me-2`}></i>
                            {`Cấp quyền`}
                          </a>
                        ),
                      }
                    : null,
                  {
                    key: 'chiet-khau',
                    disabled: false,
                    label: (
                      <a
                        className="e-1 p-2 text-dark"
                        onClick={() => {
                          handleButton(`chiet-khau`, record);
                        }}
                      >
                        <i className={`fas fa-cog me-2`}></i>
                        {`Cấu hình chiết khấu`}
                      </a>
                    ),
                  },
                ],
              }}
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1" title="Thao tác nhanh">
                <i className="fa fa-ellipsis-h"></i>
              </a>
            </Dropdown>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
        </div>
      </div>
      {modalVisible ? <ModalItem /> : <></>}
      {modalCapQuyen ? <ChiTietPermissionUserModal modalVisible={modalCapQuyen} userHandle={userHandle} handleCancel={handleCancel} /> : <></>}
      {modalDiscountVisible ? <ModalDiscount modalVisible={modalDiscountVisible} setModalVisible={setModalDiscountVisible} /> : <></>}
      {modalKhoiPhucMKVisible ? (
        <Modal show={modalKhoiPhucMKVisible} onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
          <Modal.Header className="bg-primary px-4 py-3">
            <Modal.Title className="text-white">Khôi phục mật khẩu</Modal.Title>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
          </Modal.Header>
          <Modal.Body>
            <Form form={form} layout="vertical" /* initialValues={initData} */ autoComplete="off">
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem
                    label="Mật khẩu mới"
                    name="password"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                      /*  {
                        pattern:
                          /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,18}$/,
                        message:
                          "Mật khẩu từ 6-18 ký tự, gồm có: chữ hoa hoặc chữ thường hoặc số và các ký tự đặc biệt! Vui lòng kiểm tra lại!",
                      }, */
                    ]}
                  >
                    <Input placeholder="" type={'password'} />
                  </FormItem>
                </div>

                <div className="col-xl-12 col-lg-12">
                  <FormItem
                    label="Nhập lại mật khẩu mới"
                    name="confirmPassword"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                      /*  {
                        pattern:
                          /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,18}$/,
                        message:
                          "Mật khẩu từ 6-18 ký tự, gồm có: chữ hoa hoặc chữ thường và các ký tự đặc biệt! Vui lòng kiểm tra lại!",
                      }, */
                    ]}
                  >
                    <Input placeholder="" type={'password'} />
                  </FormItem>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-light px-4 py-2 align-items-center">
            <div className="d-flex justify-content-center  align-items-center">
              <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish}>
                <i className="fa fa-save"></i>
                {'Đổi mật khẩu'}
              </Button>
            </div>
            <div className="d-flex justify-content-center  align-items-center">
              <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
                <i className="fa fa-times"></i>Huỷ
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      ) : (
        <></>
      )}
    </>
  );
};

export default UsersList;
