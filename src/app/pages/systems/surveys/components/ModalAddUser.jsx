import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

import { requestPOST, FILE_URL } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';

import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';
import { Select } from 'antd';

const ModalItem = ({ modalVisible, setModalVisible, handleAddData, dataSource, surveyTemplateId, surveyId }) => {
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(20);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [keySearch, setKeySearch] = useState('');
  const [dataSearch, setDataSearch] = useState(null);

  const rowSelection = {
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

        var sources = (dataSource?.sources ?? []).map(item => item.id);

        const res = await requestPOST(`api/v1/surveys/search-users`, {
          pageNumber: offset,
          pageSize: size,
          keyword: dataSearch?.keyword ?? null,
          notInIds: [],
          sourceType: dataSource?.sourceType,
          sourceId: dataSearch?.sourceId,
          sources: sources,
          surveyTemplateId: surveyTemplateId,
        });
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
  };

  const onFinish = async () => {
    if (selectedRows?.length > 0) {
      var temp = [...selectedRows];
      temp?.map(i => {
        i.userId = i.id;
      });
      handleAddData(temp);
    }
    handleCancel();
  };
  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
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
  ];

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Thêm người dùng</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 500 }}>
        <div className="p-3">
          <div className="row align-items-center mb-3 ">
            <div className="col-xl-6 col-md-6 btn-group align-items-center ">
              <div className="input-group w-xl-100 w-lg-100">
                <input
                  type="text"
                  className="form-control form-control-sm ps-3"
                  placeholder="Nhập từ khoá tìm kiếm"
                  aria-label="Tìm kiếm"
                  aria-describedby="basic-addon2"
                  size={40}
                  value={keySearch}
                  onChange={e => setKeySearch(e.target.value)}
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
            <div className="col-xl-6 col-md-6 btn-group align-items-center ">
              <span className="fw-bold w-100px">Nguồn:</span>
              <div className="w-100">
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  showSearch
                  reload={true}
                  placeholder="Lựa chọn"
                  value={dataSearch?.sourceId ?? null}
                  options={dataSource?.sources ?? []}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        sourceId: current?.id,
                      });
                    } else {
                      setDataSearch({
                        ...dataSearch,
                        sourceId: null,
                      });
                    }
                  }}
                />
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
