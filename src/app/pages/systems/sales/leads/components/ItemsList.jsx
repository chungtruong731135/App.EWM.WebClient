/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm, Dropdown } from 'antd';

import { useNavigate } from 'react-router-dom';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import dayjs from 'dayjs';
const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const modalVisible = useSelector(state => state.modal.modalVisible);
  const dataSearch = props?.dataSearch;
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [modalActiveVisible, setModalActiveVisible] = useState(false);
  const [modalListVisible, setModalListVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/sales/leads/search`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
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
      case 'chuyen-doi-thanh-khach-hang':
        dispatch(actionsModal.setDataModal({ id: item?.id }));
        setModalActiveVisible(true);
        break;
      case 'yeu-cau-tu-van':
        dispatch(actionsModal.setDataModal(item));
        setModalListVisible(true);
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
      title: 'Thời gian tạo',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
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
              title="Xem chi tiết"
              onClick={() => {
                handleButton(`chi-tiet`, record);
              }}
            >
              <i className="fa fa-eye"></i>
            </a>
            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  {
                    key: 'chuyen-doi-thanh-khach-hang',
                    disabled: false,
                    label: (
                      <a
                        className="e-1 p-2 text-dark"
                        onClick={() => {
                          handleButton(`chuyen-doi-thanh-khach-hang`, record);
                        }}
                      >
                        <i className={`fas fa-users me-2`}></i>
                        {`Chuyển đổi thành khách hàng`}
                      </a>
                    ),
                  },
                  {
                    key: 'yeu-cau-tu-van',
                    disabled: false,
                    label: (
                      <a
                        className="e-1 p-2 text-dark"
                        onClick={() => {
                          handleButton(`yeu-cau-tu-van`, record);
                        }}
                      >
                        <i className={`fas fa-clipboard-list me-2`}></i>
                        {`Lịch sử yêu cầu tư vấn/trao đổi`}
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
    </>
  );
};

export default UsersList;
