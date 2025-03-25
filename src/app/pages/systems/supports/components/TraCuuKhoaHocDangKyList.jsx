/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { Popconfirm } from 'antd';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, FILE_URL, requestDELETE, requestPUT_NEW } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import dayjs from 'dayjs';

import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const UsersList = props => {
  const dispatch = useDispatch();
  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const handleUpdatePaymentStatus = async (ids, status = 1) => {
    var res = await requestPUT_NEW(`api/v1/activationcodes/paymentstatus`, {
      ids: ids,
      paymentStatus: status,
    });
    if (res) {
      toast.success('Thao tác thành công!');
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (dataSearch.keyword.length <= 0) {
          setDataTable([]);
          setCount(0);
          setLoading(false);
        } else {
          const res = await requestPOST(
            `api/v1/usercourses/search`,
            _.assign(
              {
                pageNumber: offset,
                pageSize: size,
                isAccurate: true,
              },
              dataSearch
            )
          );
          setDataTable(res?.data ?? []);
          setCount(res?.totalCount ?? 0);
          setLoading(false);
        }
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

      case 'delete':
        var res = await requestDELETE(`api/v1/usercourses/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'confirm':
        handleUpdatePaymentStatus([item?.activationCodeId], 1);
        break;

      case 'chuanhantien':
        handleUpdatePaymentStatus([item?.activationCodeId], 0);
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
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Thời gian thanh toán',
      dataIndex: 'confirmationDate',
      key: 'confirmationDate',
      render: (text, record) => {
        var time = record?.confirmationDate;
        return <div>{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },
    {
      title: 'Giá gốc',
      dataIndex: 'amount',
      key: 'amount',
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
      dataIndex: 'userCourseCodeAmount',
      key: 'userCourseCodeAmount',
      render: (text, record, index) => {
        var coursePrice = record?.userCourseActivationCodeAmount ?? 0;
        if (record?.userCourseCodeAmount) {
          coursePrice = record?.userCourseCodeAmount ?? 0;
        }

        return (
          <>
            <div>
              {(coursePrice || 0).toLocaleString('vi', {
                style: 'currency',
                currency: 'VND',
              })}
            </div>
            {record.amount && record.amount > 0 ? <div className={`mt-2  me-auto badge badge-light-success`}>{Math.round(((coursePrice ?? 0) / (record?.amount ?? 1)) * 100)}%</div> : <></>}
          </>
        );
      },
    },

    {
      title: 'Đại lý/Cộng tác viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => {
        let fullName = record?.retailerFullName ?? null;
        let imageUrl = record?.retailerImageUrl ?? null;
        let userName = record?.retailerUserName ?? null;

        if (record?.isTrial == true) {
          fullName = record?.activeSpecialFullName ?? null;
          imageUrl = record?.activeSpecialImageUrl ?? null;
          userName = record?.activeSpecialUserName ?? null;
        }

        if (userName == null) {
          return <></>;
        }
        return <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: fullName, imageUrl: imageUrl, userName: userName }} index={index} />;
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 80,
      render: (text, record) => {
        return <div></div>;
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
