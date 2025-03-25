/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';
import dayjs from 'dayjs';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/loginlogs/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ['fullName', 'userName'],
                keyword: dataSearch?.keyword ?? null,
              },
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
        dispatch(actionsModal.setDataModal({ ...item, readOnly: false }));
        dispatch(actionsModal.setModalVisible(true));

        break;
      case 'xem':
        dispatch(actionsModal.setDataModal({ ...item, readOnly: true }));
        dispatch(actionsModal.setModalVisible(true));

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/loginlogs/${item.id}`);
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
      title: 'Họ tên ',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Thông tin',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (text, record) => (
        <div>
          <div className="me-2 badge badge-light-primary">{record?.operatingSystem}</div>
          <div className="me-2 badge badge-light-danger">{record?.browserName}</div>
          <span>{record?.userAgent}</span>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: (text, record) => <div>{record.createdOn ? dayjs(record.createdOn).format('DD/MM/YYYY HH:mm') : ''}</div>,
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
                handleButton(`xem`, record);
              }}
            >
              <i className="fa fa-eye"></i>
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
        <div className="card-dashboard-body table-responsive">
          <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
        </div>
      </div>
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
