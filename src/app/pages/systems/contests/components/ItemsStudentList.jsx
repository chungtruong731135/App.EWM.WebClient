/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';


const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
          `api/v1/contests/userexams`,
          _.assign(
            {
              advancedSearch: {
                fields: ['name', 'code'],
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
        navigate({
          pathname: `${item?.id}`,
        });

        break;
      case 'nhan-xet':

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
      title: 'Học sinh',
      dataIndex: 'studentFullName',
      key: 'studentFullName',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={true} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Tình trạng',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        let status = null;
        if (record.startTime && record.finishTime) {
          status = 1;
        } else if (record.startTime) {
          status = 0;
        }
        return <div className={`badge badge-light-${status == 0 ? 'info' : status == 1 ? 'success' : 'danger'}`}>{status == 0 ? 'Chưa kết thúc' : status == 1 ? 'Đã kết thúc' : 'Chưa làm bài'}</div>;
      },
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text, record) => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'finishTime',
      key: 'finishTime',
      render: (text, record) => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Số câu đúng',
      dataIndex: 'rightCount',
      key: 'rightCount',
    },
    {
      title: 'Số câu sai',
      dataIndex: 'wrongCount',
      key: 'wrongCount',
    },
    {
      title: 'Số điểm',
      dataIndex: 'score',
      key: 'score',
    },

    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 120,
      render: (text, record) => {
        return (
          <div className="d-flex">
            {record.id != '00000000-0000-0000-0000-000000000000' ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Xem chi tiết/Sửa"
                onClick={() => {
                  handleButton(`chi-tiet`, record);
                }}
              >
                <i className="fas fa-eye"></i>
              </a>
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
        <div className="card-dashboard-body table-responsive">
          <TableList rowKey={() => Math.random().toString()} dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
        </div>
      </div>
    </>
  );
};

export default UsersList;
