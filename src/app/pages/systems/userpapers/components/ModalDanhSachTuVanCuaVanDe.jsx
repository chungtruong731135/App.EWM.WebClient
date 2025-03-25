import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { FILE_URL, requestPOST, requestPOST_NEW } from '@/utils/baseAPI';
import dayjs from 'dayjs';
import TableList from '@/app/components/TableList';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

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
        const res = await requestPOST(`api/v1/userpapers/list-comment`, {
          pageNumber: offset,
          pageSize: size,
          orderBy: ['createdOn DESC'],
          parentId: dataModal?.id,
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
      title: 'Người chuyển xử lý',
      dataIndex: 'nguoiChuyenXuLyId',
      key: 'nguoiChuyenXuLyId',
      render: (text, record, index) => (
        <TDTableColumnHoTen showMenu={false} dataUser={{ type: 4, fullName: record?.nguoiChuyenXuLyFullName, imageUrl: record?.nguoiChuyenXuLyImageUrl, userName: record?.nguoiChuyenXuLyUserName }} index={index} />
      ),
    },
    {
      title: 'Người xử lý',
      dataIndex: 'nguoiXuLyId',
      key: 'nguoiXuLyId',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 4, fullName: record?.nguoiXuLyFullName, imageUrl: record?.nguoiXuLyImageUrl, userName: record?.nguoiXuLyUserName }} index={index} />,
    },
    {
      title: 'Nội dung trao đổi',
      dataIndex: 'noiDungTraoDoi',
      key: 'noiDungTraoDoi',
    },

    {
      title: 'Thời gian tư vấn',
      dataIndex: 'confirmationDate',
      key: 'confirmationDate',
      render: (text, record) => {
        var time = record?.createdOn;
        return <div>{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },
    {
      title: 'Hạn xử lý',
      dataIndex: 'hanXuLyDen',
      key: 'hanXuLyDen',
      render: (text, record) => {
        var time = record?.hanXuLyDen;
        return <div>{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : ''}</div>;
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
              <div className={`me-2 badge badge-light-${text == 0 ? 'info' : text == 1 ? 'success' : text == 2 ? 'primary' : 'danger'}`}>
                {`${text == 0 ? 'Chờ tư vấn' : text == 1 ? 'Đã tư vấn' : text == 2 ? 'Đang tư vấn' : 'Đã chuyển tư vấn'}`}
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Danh sách trao đổi</Modal.Title>
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
