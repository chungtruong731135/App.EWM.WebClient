/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Dropdown } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import dayjs from 'dayjs';
import ModalReply from './ModalReply';
import { useAuth } from '@/app/modules/auth';

import ModalDanhSachYeuCauTuVan from './ModalDanhSachYeuCauTuVan';
import ModalDanhSachKhoaHoc from './ModalDanhSachKhoaHoc';
import ModalDanhSachTuVanCuaVanDe from './ModalDanhSachTuVanCuaVanDe';

const UsersList = props => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [modalReplyVisible, setModalReplyVisible] = useState(false);

  const [modalDSYeuCauTuVanVisible, setModalDSYeuCauTuVanVisible] = useState(false);
  const [modalDSKhoaHocVisible, setModalDSKhoahocVisible] = useState(false);
  const [modalDanhSachTuVanCuaVanDeVisible, setModalDanhSachTuVanCuaVanDeVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/userpapers/danh-sach-tu-van-ca-nhan`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
              advisedBy: currentUser?.id,
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
      case 'tu-van':
        dispatch(actionsModal.setDataModal({ parentId: item.id }));
        setModalReplyVisible(true);

        break;

      case 'danh-sach-tu-van':
        dispatch(actionsModal.setDataModal(item));
        setModalDanhSachTuVanCuaVanDeVisible(true);
        break;

      case 'danh-sach-khoa-hoc':
        dispatch(actionsModal.setDataModal(item));
        setModalDSKhoahocVisible(true);

        break;

      case 'danh-sach-yeu-cau-tu-van':
        dispatch(actionsModal.setDataModal(item));
        setModalDSYeuCauTuVanVisible(true);

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/userpapers/${item.id}`);
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
    // {
    //   title: "STT",
    //   dataIndex: "index",
    //   key: "index",
    //   render: (text, record, index) => (
    //     <div>{(offset - 1) * size + index + 1}</div>
    //   ),
    // },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div>
          <div className="text-gray-800 mt-3 text-hover-primary fw-bolder">{record.fullName}</div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => (
        <div>
          <div className="text-gray-700">{record.email}</div>
          <div className="text-gray-800 mt-3 text-hover-primary fw-bolder">{record.phoneNumber}</div>
        </div>
      ),
    },

    // {
    //   title: "Khối lớp",
    //   dataIndex: "gradeName",
    //   key: "gradeName",
    // },
    // {
    //   title: "Kỳ thi",
    //   dataIndex: "examinatName",
    //   key: "examinatName",
    // },

    {
      title: 'Vấn đề tư vấn',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
        <div>
          <div dangerouslySetInnerHTML={{ __html: record?.content }} />
        </div>
      ),
    },
    {
      title: 'Thời gian đăng ký',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Trạng thái tư vấn',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return (
          <div className="">
            <div>
              <div className={`me-2 badge badge-light-${text == 0 ? 'info' : text == 1 ? 'success' : text == 2 ? 'primary' : 'danger'}`}>
                {`${text == 0 ? 'Đã chuyển tư vấn' : text == 1 ? 'Đã tư vấn' : text == 2 ? 'Đang tư vấn' : 'Chờ tư vấn'}`}
              </div>
            </div>

            <div>
              <div className={`me-2 badge badge-light-${record?.orderStatus == 0 ? 'info' : text == 1 ? 'success' : text == 2 ? 'primary' : 'danger'}`}>
                {`${record?.orderStatus == 0 ? 'Khách mua hàng' : record?.orderStatus == 1 ? 'Khách không mua hàng' : record?.orderStatus == 2 ? 'Đang phân vân' : ''}`}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Người tư vấn',
      dataIndex: 'advisedByFullName',
      key: 'advisedByFullName',
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
              title="Tu vấn"
              onClick={() => {
                handleButton(`tu-van`, record);
              }}
            >
              <i className="fas fa-comment-dots"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Danh sách vấn"
              onClick={() => {
                handleButton(`danh-sach-tu-van`, record);
              }}
            >
              <i className="fa fa-rectangle-list"></i>
            </a>
            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  record?.email || record?.phoneNumber
                    ? {
                        key: 'danh-sach-khoa-hoc',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              handleButton(`danh-sach-khoa-hoc`, record);
                            }}
                          >
                            <i className={`fas fa-list me-2`}></i>
                            {`Danh sách khoá học đăng ký`}
                          </a>
                        ),
                      }
                    : null,
                  record?.email || record?.phoneNumber
                    ? {
                        key: 'danh-sach-yeu-cau-tu-van',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              handleButton(`danh-sach-yeu-cau-tu-van`, record);
                            }}
                          >
                            <i className={`fas fa-list-check me-2`}></i>
                            {`Danh sách các lần yêu cầu tư vấn`}
                          </a>
                        ),
                      }
                    : null,
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
      {modalReplyVisible ? <ModalReply modalVisible={modalReplyVisible} setModalVisible={setModalReplyVisible} /> : <></>}
      {modalDSYeuCauTuVanVisible ? <ModalDanhSachYeuCauTuVan modalVisible={modalDSYeuCauTuVanVisible} setModalVisible={setModalDSYeuCauTuVanVisible} /> : <></>}
      {modalDSKhoaHocVisible ? <ModalDanhSachKhoaHoc modalVisible={modalDSKhoaHocVisible} setModalVisible={setModalDSKhoahocVisible} /> : <></>}
      {modalDanhSachTuVanCuaVanDeVisible ? <ModalDanhSachTuVanCuaVanDe modalVisible={modalDanhSachTuVanCuaVanDeVisible} setModalVisible={setModalDanhSachTuVanCuaVanDeVisible} /> : <></>}
    </>
  );
};

export default UsersList;
