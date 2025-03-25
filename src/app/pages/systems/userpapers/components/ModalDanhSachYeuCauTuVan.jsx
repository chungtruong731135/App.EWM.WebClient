import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestPOST_NEW } from '@/utils/baseAPI';
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
        const res = await requestPOST(`api/v1/userpapers/search`, {
          pageNumber: offset,
          pageSize: size,
          orderBy: ['createdOn DESC'],
          phoneNumber: dataModal?.phoneNumber ?? null,
          email: dataModal?.email ?? null,
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
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
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
  ];

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Lịch sử yêu cầu tư vấn của khách hàng</Modal.Title>
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
