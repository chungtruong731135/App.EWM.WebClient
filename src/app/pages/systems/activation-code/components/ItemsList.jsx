/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import CopyToClipboard from 'react-copy-to-clipboard';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, requestPUT_NEW, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import CustomPriceModal from './CustomPriceModal';
import CustomUserTypeModal from './CustomUserTypeModal';

import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const UsersList = props => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);

  const [modalCustomPriceVisible, setModalCustomPriceVisible] = useState(false);
  const [modalUserTypeModalVisible, setModalUserTypeModalVisible] = useState(false);
  const [dataModal, setDataModal] = useState(null);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/activationcodes/search`,
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

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: record => ({
      disabled: record?.paymentStatus == 1 || record.status != 1,
    }),
  };

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;

      case 'custom-price':
        setDataModal(item);
        setModalCustomPriceVisible(true);

        break;
      case 'custom-usertype':
        setDataModal(item);
        setModalUserTypeModalVisible(true);

        break;

      case 'undo-code':
        var res = await requestPOST(`api/v1/sales/activationcodes/revokecode`, {
          code: item?.code,
        });
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/activationcodes/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'confirm':
        handleUpdatePaymentStatus([item?.id]);
        break;

      case 'chuanhantien':
        handleUpdatePaymentStatus([item?.id], 0);

        break;

      default:
        break;
    }
  };
  const handleUpdatePaymentStatus = async (ids, status = 1) => {
    var res = await requestPUT_NEW(`api/v1/activationcodes/paymentstatus`, {
      ids: ids,
      paymentStatus: status,
    });
    if (res) {
      toast.success('Thao tác thành công!');
      setSelectedRowKeys([]);
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Mã kích hoạt',
      dataIndex: 'code',
      key: 'code',
      render: text => (
        <CopyToClipboard
          text={text}
          onCopy={() => {
            toast.info(`Đã sao chép: ${text}`);
          }}
        >
          <div className="d-flex align-items-center justify-content-between btn p-0">
            <div>{text}</div>
            <i className="fas fa-copy" />
          </div>
        </CopyToClipboard>
      ),
    },

    {
      title: 'Cộng tác viên/Đại lý',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={true} dataUser={{ type: 4, userId: record?.userId, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },

    {
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Giá gốc',
      dataIndex: 'coursePrice',
      key: 'coursePrice',
      render: text => (
        <div>
          {(text || 0).toLocaleString('vi', {
            style: 'currency',
            currency: 'VND',
          })}
        </div>
      ),
    },
    {
      title: 'Giá thanh toán',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record, index) => (
        <>
          <div>
            {(text || 0).toLocaleString('vi', {
              style: 'currency',
              currency: 'VND',
            })}
          </div>
          {record.amount && record.amount > 0 ? <div className={`mt-2  me-auto badge badge-light-success`}>{Math.round(((record?.amount ?? 0) / (record?.coursePrice ?? 1)) * 100)}%</div> : <></>}
        </>
      ),
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentFullName',
      key: 'studentFullName',
      render: (text, record, index) => (
        <TDTableColumnHoTen showMenu={true} dataUser={{ type: 1, userId: record?.studentId, fullName: record?.studentFullName, imageUrl: record?.studentImageUrl, userName: record?.studentUserName }} index={index} />
      ),
    },
    {
      title: 'Ngày kích hoạt mã',
      dataIndex: 'userCourseActivationCodeCreatedOn',
      key: 'userCourseActivationCodeCreatedOn',
      render: (text, record) => {
        return <div>{record?.userCourseActivationCodeCreatedOn ? dayjs(record?.userCourseActivationCodeCreatedOn).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },
    {
      title: 'Nguồn khách hàng',
      dataIndex: 'userTypeName',
      key: 'userTypeName',
      render: (text, record) => {
        return <div>{text}</div>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return (
          <div className="d-flex flex-column ">
            <div className={`me-auto badge badge-light-${text == 1 ? 'success' : record?.expireDate && dayjs(record?.expireDate).isBefore(dayjs().format('YYYY-MM-DD')) ? 'danger' : 'primary'}`}>
              {text == 1 ? 'Đã sử dụng' : record?.expireDate && dayjs(record?.expireDate).isBefore(dayjs().format('YYYY-MM-DD')) ? 'Hết hạn' : 'Chưa sử dụng'}
            </div>
            {record?.status == 1 ? <div className={`mt-2  me-auto badge badge-light-${record?.paymentStatus == 1 ? 'success' : 'danger'}`}>{record?.paymentStatus == 1 ? 'Đã nhận tiền' : 'Chưa nhận tiền'}</div> : <></>}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 150,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết/Sửa"
              onClick={() => {
                handleButton(`chi-tiet`, record);
              }}
            >
              <i className="fa fa-eye"></i>
            </a>
            {record?.status == 1 && record?.paymentStatus != 1 ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Chỉnh sửa giá thanh toán"
                onClick={() => {
                  handleButton(`custom-price`, record);
                }}
              >
                <i className="fa fa-money-bill"></i>
              </a>
            ) : (
              <></>
            )}
            {record?.status != 0 ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Chỉnh sửa nguồn khách hàng"
                onClick={() => {
                  handleButton(`custom-usertype`, record);
                }}
              >
                <i className="fa fa-pen-to-square"></i>
              </a>
            ) : (
              <></>
            )}
            {record?.status != 0 && record?.paymentStatus != 1 ? (
              <Popconfirm
                title="Xác nhận đã nhận tiền?"
                onConfirm={() => {
                  handleButton(`confirm`, record);
                }}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Đã nhận tiền">
                  <i className="fas fa-money-check-alt"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
            {record?.status != 0 && record?.paymentStatus == 1 ? (
              <Popconfirm
                title="Xác nhận chưa nhận tiền?"
                onConfirm={() => {
                  handleButton(`chuanhantien`, record);
                }}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Chưa nhận tiền">
                  <i className="fas fa-rotate-left"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
            {record?.status != 0 && record?.paymentStatus != 1 ? (
              <Popconfirm
                title="Thu hồi mã kích hoạt?"
                onConfirm={() => {
                  handleButton(`undo-code`, record);
                }}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Thu hồi">
                  <i className="fas fa-undo"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
            {record?.status != 1 && record?.paymentStatus != 1 ? (
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
      <div className="card-body card-dashboard px-3 py-3">
        <div className="d-flex align-items-center flex-grow-1 my-3">
          {(selectedRowKeys || [])?.length > 0 && (
            <>
              <span className="me-2">Đã chọn</span>
              <span className="fw-bold me-10">{(selectedRowKeys || [])?.length}</span>
              <span
                className="fw-bold me-10 text-info cursor-pointer"
                onClick={() => {
                  setSelectedRowKeys([]);
                }}
              >
                Bỏ chọn
              </span>
              <Popconfirm
                title="Bạn có chắc chắn xác nhận đã nhận tiền?"
                onConfirm={() => {
                  handleUpdatePaymentStatus(selectedRowKeys);
                }}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <a type="button" className="btn btn-success btn-sm m-btn m-btn--icon py-2 me-2">
                  <span>
                    <i className="fas fa-check me-2"></i>
                    <span className="">Đã nhận tiền</span>
                  </span>
                </a>
              </Popconfirm>
            </>
          )}
        </div>
        <div className="card-dashboard-body table-responsive">
          <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} rowSelection={rowSelection} />
        </div>
      </div>
      {modalVisible ? <ModalItem /> : <></>}
      {modalCustomPriceVisible ? <CustomPriceModal modalVisible={modalCustomPriceVisible} setModalVisible={setModalCustomPriceVisible} dataModal={dataModal} /> : <></>}
      {modalUserTypeModalVisible ? <CustomUserTypeModal modalVisible={modalUserTypeModalVisible} setModalVisible={setModalUserTypeModalVisible} dataModal={dataModal} /> : <></>}
    </>
  );
};

export default UsersList;
