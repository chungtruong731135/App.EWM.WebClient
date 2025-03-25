/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/popups/search`,
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

    fetchData();

    return () => {};
  }, [offset, size, dataSearch, random]);

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/popups/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      default:
        break;
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      width: '10%',
      dataIndex: 'image',
      key: 'image',
      render: (text, record, index) => {
        return (
          <>
            <div className="d-flex align-items-center">
              {/* begin:: Avatar */}
              <div className="symbol overflow-hidden me-3">
                <div>
                  {record.source ? (
                    <img
                      src={record.source.includes('https://') || record.source.includes('http://') ? record.source : FILE_URL + `${record.source.startsWith('/') ? record.source.substring(1) : record.source}`}
                      alt={record.name}
                      className="w-100 symbol-label"
                    />
                  ) : (
                    <div className={clsx('symbol-label fs-3', `bg-light-${record.isVerified ? 'danger' : ''}`, `text-${record.isVerified ? 'danger' : ''}`)}></div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      },
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: 'Tình trạng',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text, record) => {
        return record?.isActive ? 'Đang hoạt động' : 'Dừng hoạt động';
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
