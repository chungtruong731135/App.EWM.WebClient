/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import dayjs from 'dayjs';
import ModalReply from './ModalReply';
import ModalListSupport from './ModalListSupport';

import ModalDanhSachYeuCauTuVan from '../../userpapers/components/ModalDanhSachYeuCauTuVan';
import ModalDanhSachKhoaHoc from '../../userpapers/components/ModalDanhSachKhoaHoc';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const UsersList = props => {
  const dispatch = useDispatch();
  const { dataSearch, type, saphethan } = props;
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [modalReplyVisible, setModalReplyVisible] = useState(false);
  const [modalLstTuVanVisible, setModalLstTuVanVisible] = useState(false);
  const [modalId, setModalId] = useState(null);

  const [modalDSYeuCauTuVanVisible, setModalDSYeuCauTuVanVisible] = useState(false);

  const [modalDSKhoaHocVisible, setModalDSKhoahocVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/supports/danh-sach-mua-khoa-hoc`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
              type: type,
              sapHetHan: props?.saphethan,
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

  const handleButton = async (type, item) => {
    switch (type) {
      case 'ds-tu-van':
        setModalId(item?.id);
        setModalLstTuVanVisible(true);

        break;
      case 'tu-van':
        dispatch(
          actionsModal.setDataModal({
            userId: item?.id,
            courseId: item?.courseId,
          })
        );
        setModalReplyVisible(true);

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
      render: (text, record, index) => <TDTableColumnHoTen dataUser={{ fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
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
      title: 'CTV/Đại lý',
      dataIndex: 'agentFullName',
      key: 'agentFullName',
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
      title: 'Khoá học đăng ký chăm sóc',
      dataIndex: 'coursesStr',
      key: 'coursesStr',
      render: (text, record) => (
        <div>
          <div>{record.courseTitle}</div>
          <div className="badge badge-light-success">{record?.timeConfirm ? dayjs(record?.timeConfirm).format('DD/MM/YYYY HH:mm') : ''}</div>
        </div>
      ),
    },
    {
      title: 'Toàn bộ khoá học đăng ký',
      dataIndex: 'coursesStrs',
      key: 'coursesStrs',
      render: (text, record) => {
        var lst = JSON.parse(record?.coursesStr ?? '[]');
        return (
          <div className="row">
            {lst.map(item => (
              <div className="d-flex p-2" key={Math.random().toString()}>
                <div>{item.Title}</div>
                <div className="badge badge-light-success ms-2">{item?.TimeConfirm ? dayjs(item?.TimeConfirm).format('DD/MM/YYYY HH:mm') : ''}</div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái chăm sóc',
      dataIndex: 'statusName',
      key: 'statusName',
      render: (text, record) => (
        <div>
          <div>{record.statusName}</div>
          <div className="badge badge-light-success">{record?.commentLastModifiedOn ? dayjs(record?.commentLastModifiedOn).format('DD/MM/YYYY HH:mm') : ''}</div>
          <div>{record.commentLastModifiedBy}</div>
        </div>
      ),
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
              <i className="fas fa-edit fs-4 p-0"></i>
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
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} rowKey={() => Math.random().toString()} />
        </div>
      </div>
      {modalReplyVisible ? <ModalReply modalVisible={modalReplyVisible} setModalVisible={setModalReplyVisible} /> : <></>}
      {modalLstTuVanVisible ? <ModalListSupport modalVisible={modalLstTuVanVisible} setModalVisible={setModalLstTuVanVisible} modalId={modalId} setModalId={setModalId} /> : <></>}
      {modalDSYeuCauTuVanVisible ? <ModalDanhSachYeuCauTuVan modalVisible={modalDSYeuCauTuVanVisible} setModalVisible={setModalDSYeuCauTuVanVisible} /> : <></>}
      {modalDSKhoaHocVisible ? <ModalDanhSachKhoaHoc modalVisible={modalDSKhoaHocVisible} setModalVisible={setModalDSKhoahocVisible} /> : <></>}
    </>
  );
};

export default UsersList;
