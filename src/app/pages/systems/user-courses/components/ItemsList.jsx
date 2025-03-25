/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { requestPOST, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import dayjs from 'dayjs';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const UsersList = props => {
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
          `api/v1/usercourses/search`,
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
      render: (text, record, index) => <TDTableColumnHoTen showMenu={true} dataUser={{ type: 1, userId: record?.userId, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Khoá học đăng ký',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    // {
    //   title: "Giá tiền",
    //   dataIndex: "courseTitle",
    //   key: "courseTitle",
    // },
    {
      title: 'Thời gian đăng ký',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (text, record) => {
        var time = record?.orderDate;
        return <div>{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },
    {
      title: 'Thời gian xác nhận',
      dataIndex: 'confirmationDate',
      key: 'confirmationDate',
      render: (text, record) => {
        var time = record?.confirmationDate;
        return <div>{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'activeAll',
      key: 'activeAll',
      render: (text, record) => {
        return record?.isTrial ? <div className={`badge badge-light-info`}>Dùng thử </div> : record?.confirmationDate ? <div className={`badge badge-light-success`}>Đã mua khoá học</div> : <></>;
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 80,
      render: (text, record) => {
        return (
          <div>
            {/* <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết/Sửa"
              onClick={() => {
                handleButton(`chi-tiet`, record);
              }}
            >
              <i className="fa fa-eye"></i>
            </a> */}

            {/* <Popconfirm
              title="Xoá?"
              onConfirm={() => {
                handleButton(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a
                className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Xoá"
              >
                <i className="fa fa-trash"></i>
              </a>
            </Popconfirm> */}
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
    </>
  );
};

export default UsersList;
