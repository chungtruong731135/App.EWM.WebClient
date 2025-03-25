/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import dayjs from 'dayjs';

const UsersList = props => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: record => ({
      disabled: record?.status == 1,
    }),
  };
  const handleSendMessage = async ids => {
    var res = await requestPOST(`api/v1/examregistrations/send-message`, {
      ids: ids,
    });
    if (res) {
      toast.success('Thao tác thành công!');
      setSelectedRowKeys([]);
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/examregistrations/search`,
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

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;

      case 'send-message':
        var resSend = await requestPOST(`api/v1/examregistrations/send-message`, { ids: [item.id] });
        if (resSend) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/examregistrations/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'XoaVanBan':
        //handleXoaVanBan(item);
        break;

      default:
        break;
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
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Kỳ thi đăng ký',
      dataIndex: 'examName',
      key: 'examName',
    },
    {
      title: 'Khối thi',
      dataIndex: 'gradeRegistered',
      key: 'gradeRegistered',
    },
    {
      title: 'Chuyển thông tin BTC',
      dataIndex: 'infoTransferredToOrganizers',
      key: 'infoTransferredToOrganizers',
      render: (text, record) => {
        return record?.infoTransferredToOrganizers ? 'Đã chuyển' : 'Chưa chuyển';
      },
    },
    {
      title: 'Trạng thái đối soát',
      dataIndex: 'reconciliationStatus',
      key: 'reconciliationStatus',
      render: (text, record) => {
        return record?.reconciliationStatus ? 'Đã đối soát' : 'Chưa đối soát';
      },
    },
    {
      title: 'Trạng thái gửi thông báo',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return record?.status == 1 ? (
          <div className="">
            <div>
              <div className="me-2 badge badge-light-primary">Đã gửi</div>
            </div>
            <div>
              <div className="me-2 badge badge-light-primary"></div>
            </div>
            <div>{record?.sendMessageOn ? dayjs(record?.sendMessageOn).format('DD/MM/YYYY HH:mm') : ''}</div>
          </div>
        ) : (
          <></>
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
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Gửi thông báo cho người dùng"
              onClick={() => {
                handleButton(`send-message`, record);
              }}
            >
              <i className="fa fa-paper-plane"></i>
            </a>

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
                title="Bạn có chắc chắn muốn gửi thông báo cho nhiều người?"
                onConfirm={() => {
                  handleSendMessage(selectedRowKeys);
                }}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <a type="button" className="btn btn-success btn-sm m-btn m-btn--icon py-2 me-2">
                  <span>
                    <i className="fas fa-check me-2"></i>
                    <span className="">Gửi thông báo</span>
                  </span>
                </a>
              </Popconfirm>
            </>
          )}
        </div>
        <div className="card-dashboard-body table-responsive">
          <TableList rowSelection={rowSelection} dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
        </div>
      </div>
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
