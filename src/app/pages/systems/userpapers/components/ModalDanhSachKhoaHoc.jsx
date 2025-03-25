import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { FILE_URL, requestPOST, requestPOST_NEW } from '@/utils/baseAPI';
import dayjs from 'dayjs';
import TableList from '@/app/components/TableList';

const ModalItem = props => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector(state => state.modal.dataModal);

  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);

  const handleCancel = () => {
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(`api/v1/usercourses/search`, {
          pageNumber: offset,
          pageSize: size,
          orderBy: ['createdOn DESC'],
          phoneNumber: dataModal?.phoneNumber ?? null,
          email: dataModal?.email ?? null,
          isActive: true,
        });
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
  }, [offset, size, random]);

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
      title: 'Loại thanh toán',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        return (
          <div>
            {record?.isTrial == true
              ? 'Dùng thử'
              : record?.isSpecial == true
              ? 'Trường hợp đặc biệt'
              : record?.isSpecial != true && record?.userCourseActivationCodeId != null
              ? `Kích hoạt qua cộng tác viên/Đại lý (${record?.activationCodeCode ?? ''})`
              : record?.userCourseCodeId != null
              ? 'Kích hoạt trực tiếp'
              : ''}
          </div>
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
        const nameArray = fullName && fullName.length > 1 ? fullName.match(/\S+/g) : ['A'];
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
                  {imageUrl ? (
                    <div className="symbol-label">
                      <img src={imageUrl.includes('https://') || imageUrl.includes('http://') ? imageUrl : FILE_URL + `${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`} alt={fullName} className="w-100" />
                    </div>
                  ) : (
                    <div className={`symbol-label fs-3 bg-light-${color} text-${color}`}>{` ${firstChar.toUpperCase()} `}</div>
                  )}
                </a>
              </div>
              <div className="d-flex flex-column">
                <a href="#" className="text-gray-800 text-hover-primary mb-1 fw-bolder">
                  {fullName}
                </a>
                <span>{userName}</span>
              </div>
            </div>
          </>
        );
      },
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return (
          <div className="d-flex flex-column ">
            {record?.userCourseActivationCodeId != null ? (
              <div className={`mt-2  me-auto badge badge-light-${record?.activationCodePaymentStatus == 1 ? 'success' : 'danger'}`}>{record?.activationCodePaymentStatus == 1 ? 'Đã nhận tiền' : 'Chưa nhận tiền'}</div>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Danh sách khoá học đã đăng ký</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <div className="card-body card-dashboard px-3 py-3">
              <div className="card-dashboard-body table-responsive">
                <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
              </div>
            </div>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times me-2"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
