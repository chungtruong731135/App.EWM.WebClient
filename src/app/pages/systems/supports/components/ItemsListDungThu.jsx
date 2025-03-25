/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { requestPOST, FILE_URL, requestDELETE } from '@/utils/baseAPI';
import * as actionsModal from '@/setup/redux/modal/Actions';

import TableList from '@/app/components/TableList';
import dayjs from 'dayjs';

import ModalListSupport from './ModalListSupport';

import ModalDanhSachYeuCauTuVan from '../../userpapers/components/ModalDanhSachYeuCauTuVan';
import ModalDanhSachKhoaHoc from '../../userpapers/components/ModalDanhSachKhoaHoc';
import ModalTuVan from '../../user-courses/components/ModalTuVan';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';

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

  const [modalReplyVisible, setModalReplyVisible] = useState(false);
  const [modalLstTuVanVisible, setModalLstTuVanVisible] = useState(false);
  const [modalId, setModalId] = useState(null);

  const [modalDSYeuCauTuVanVisible, setModalDSYeuCauTuVanVisible] = useState(false);

  const [modalDSKhoaHocVisible, setModalDSKhoahocVisible] = useState(false);

  const handleButton = async (type, item) => {
    switch (type) {
      case 'ds-tu-van':
        setModalId(item?.id);
        setModalLstTuVanVisible(true);

        break;
      case 'tu-van':
        dispatch(
          actionsModal.setDataModal({
            parentId: item?.id,
          })
        );
        setModalReplyVisible(true);

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

      case 'danh-sach-khoa-hoc':
        dispatch(
          actionsModal.setDataModal({
            phoneNumber: item?.phoneNumber,
            email: item?.email,
          })
        );
        setModalDSKhoahocVisible(true);

        break;

      case 'danh-sach-yeu-cau-tu-van':
        dispatch(
          actionsModal.setDataModal({
            phoneNumber: item?.phoneNumber,
            email: item?.email,
          })
        );
        setModalDSYeuCauTuVanVisible(true);

        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/supports/danh-sach-dung-thu-khoa-hoc`,
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
      title: 'Khoá học đăng ký',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },

    {
      title: 'Thời gian học từ',
      dataIndex: 'confirmationDate',
      key: 'confirmationDate',
      render: (text, record) => {
        var time = record?.confirmationDate;
        return <div>{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },
    {
      title: 'Thời gian học đến',
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      render: (text, record) => {
        var time = record?.expiredDate;
        return <div>{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },
    {
      title: 'Đại lý/Cộng tác viên',
      dataIndex: 'RetailerUserName',
      key: 'RetailerUserName',
      render: (text, record, index) => {
        const nameArray = record.retailerFullName && record.retailerFullName.length > 1 ? record.retailerFullName.match(/\S+/g) : ['A'];
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
                  {record.retailerImageUrl ? (
                    <div className="symbol-label">
                      <img
                        src={record.retailerImageUrl.includes('https://') || record.retailerImageUrl.includes('http://') ? record.retailerImageUrl : FILE_URL + `${record.retailerImageUrl.startsWith('/') ? record.retailerImageUrl.substring(1) : record.retailerImageUrl}`}
                        alt={record.retailerFullName}
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
                  {record?.retailerFullName}
                </a>
                <span>{record?.retailerUserName}</span>
              </div>
            </div>
          </>
        );
      },
    },
    {
      title: 'Trạng thái tư vấn',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return (
          <div className="">
            <div>
              <div className={`me-2 badge badge-light-${record?.userPaperStatus == 0 ? 'info' : record?.userPaperStatus == 1 ? 'success' : record?.userPaperStatus == 2 ? 'primary' : 'danger'}`}>
                {`${record?.userPaperStatus == 0 ? 'Đã chuyển tư vấn' : record?.userPaperStatus == 1 ? 'Đã tư vấn' : record?.userPaperStatus == 2 ? 'Đang tư vấn' : 'Chờ tư vấn'}`}
              </div>
            </div>

            <div>
              <div className={`me-2 badge badge-light-${record?.userPaperOrderStatus == 0 ? 'info' : text == 1 ? 'success' : text == 2 ? 'primary' : 'danger'}`}>
                {`${record?.userPaperOrderStatus == 0 ? 'Khách mua hàng' : record?.userPaperOrderStatus == 1 ? 'Khách không mua hàng' : record?.userPaperOrderStatus == 2 ? 'Đang phân vân' : ''}`}
              </div>
            </div>
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
          <div className="text-center">
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Tư vấn"
              onClick={() => {
                handleButton(`tu-van`, record);
              }}
            >
              <i className="fas fa-comment-dots p-0"></i>
            </a>

            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Danh sách khoá học đăng ký"
              onClick={() => {
                handleButton(`danh-sach-khoa-hoc`, record);
              }}
            >
              <i className="fas fa-list fs-4 p-0"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Danh sách yêu cầu tư vấn"
              onClick={() => {
                handleButton(`danh-sach-yeu-cau-tu-van`, record);
              }}
            >
              <i className="fas fa-list-check fs-4 p-0"></i>
            </a>
            <Popconfirm
              title="Xoá khỏi danh sách dùng thử?"
              onConfirm={() => {
                handleButton(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá khỏi danh sách dùng thử?">
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
      {modalReplyVisible ? <ModalTuVan modalVisible={modalReplyVisible} setModalVisible={setModalReplyVisible} /> : <></>}
      {modalLstTuVanVisible ? <ModalListSupport modalVisible={modalLstTuVanVisible} setModalVisible={setModalLstTuVanVisible} modalId={modalId} setModalId={setModalId} /> : <></>}
      {modalDSYeuCauTuVanVisible ? <ModalDanhSachYeuCauTuVan modalVisible={modalDSYeuCauTuVanVisible} setModalVisible={setModalDSYeuCauTuVanVisible} /> : <></>}
      {modalDSKhoaHocVisible ? <ModalDanhSachKhoaHoc modalVisible={modalDSKhoaHocVisible} setModalVisible={setModalDSKhoahocVisible} /> : <></>}
    </>
  );
};

export default UsersList;
