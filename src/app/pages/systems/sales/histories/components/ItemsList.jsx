/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import dayjs from 'dayjs';
import { Popconfirm } from 'antd';

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
          `api/v1/sales/activationcodes/histories`,
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

      case 'undo-code':
        var res = await requestPOST(`api/v1/sales/activationcodes/revokecode`, {
          code: item?.activationCode,
        });
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
      title: 'Mã kích hoạt',
      dataIndex: 'activationCode',
      key: 'activationCode',
      // render: (text) => (
      //   <CopyToClipboard
      //     text={text}
      //     onCopy={() => {
      //       toast.info(`Đã sao chép: ${text}`);
      //     }}
      //   >
      //     <div className="d-flex align-items-center justify-content-between btn p-0">
      //       <div>{text}</div>
      //       <i className="fas fa-copy" />
      //     </div>
      //   </CopyToClipboard>
      // ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
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
      title: 'Thời gian kích hoạt',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: (text, record) => {
        return <div>{record?.createdOn ? dayjs(record?.createdOn).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },

    {
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
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
      width: 100,
      render: (text, record) => {
        return (
          <>
            {record?.paymentStatus != 1 ? (
              <div className="text-center">
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
              </div>
            ) : (
              <></>
            )}
          </>
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
