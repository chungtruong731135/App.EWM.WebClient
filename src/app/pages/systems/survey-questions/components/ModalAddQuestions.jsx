import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';

const ModalItem = props => {
  const { modalVisible, setModalVisible, handleAddData, notInIds, maxOrder } = props;
  const dispatch = useDispatch();
  const dataModal = useSelector(state => state.modal.dataModal);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [keySearch, setKeySearch] = useState('');
  const [order, setOrder] = useState('');
  const [dataSearch, setDataSearch] = useState(props?.dataSearch ?? null);

  const rowSelection = {
    type: dataModal?.type ?? 'checkbox',
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/surveyquestions/search`,
          _.assign({
            pageNumber: offset,
            pageSize: size,
            orderBy: ['createdOn'],
            keyword: dataSearch?.keyword ?? null,
            notInIds: notInIds ?? null,
          })
        );
        var arr = res?.data ?? [];
        setDataTable(arr);
        setCount(res?.totalCount ?? 0);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (isLoading) {
      fetchData();
      setIsLoading(false);
    }

    return () => {};
  }, [isLoading]);
  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
    }

    return () => {};
  }, [offset, size, dataSearch]);

  const handleCancel = () => {
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    if (selectedRows?.length > 0) {
      var temp = [...selectedRows];
      temp?.map((i, ind) => {
        i.questionId = i.id;
        i.order = order ? parseInt(order) : (maxOrder || 0) + ind + 1;
      });
      handleAddData(temp);
    }
    handleCancel();
  };
  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
    },
  ];

  return (
    <Modal show={modalVisible} fullscreen={true} onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Thêm mới</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 500 }}>
        <div className="p-3">
          <div className="row g-5">
            <div className="col-xl-12 col-lg-12">
              <div className="input-group me-2 w-100">
                <input
                  type="text"
                  className="form-control form-control-sm ps-3"
                  placeholder="Nhập từ khoá tìm kiếm"
                  aria-label="Tìm kiếm"
                  aria-describedby="basic-addon2"
                  size={40}
                  value={keySearch}
                  onChange={e => {
                    setKeySearch(e.target.value);
                    // setDataSearch({
                    //   ...dataSearch,
                    //   keyword: e.target.value,
                    // });
                  }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setDataSearch({
                      ...dataSearch,
                      keyword: keySearch,
                    });
                  }}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
          <TableList
            rowKey={'id'}
            dataTable={dataTable || []}
            columns={columns}
            isPagination={true}
            size={size}
            count={count}
            offset={offset}
            setOffset={setOffset}
            setSize={setSize}
            loading={loading}
            rowSelection={rowSelection}
            pageSizeOptions={['50', '100', '200']}
            position={['topRight', 'bottomRight']}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={onFinish}>
            <i className="fa fa-save"></i>
            {'Chọn'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
