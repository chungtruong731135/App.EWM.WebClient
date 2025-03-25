import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import TableList from '@/app/components/TableList';
import { toast } from 'react-toastify';

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
  const [score, setScore] = useState('');
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
          `api/v1/questions/search`,
          _.assign({
            pageNumber: offset,
            pageSize: size,
            orderBy: ['createdOn'],
            keyword: dataSearch?.keyword ?? null,
            examAreaId: dataSearch?.examAreaId ?? null,
            questionLevelId: dataSearch?.questionLevel?.value ?? null,
            courseId: dataSearch?.course?.value ?? null,
            notInIds: notInIds ?? null,
            notQuestionType: 3,
            withChild: false,
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
      var body = {
        id: dataModal?.parentId,
        datas: selectedRows?.map(i => i.id),
      };
      const res = await requestPOST(`api/v1/questions/add-question-to-parent`, body);
      if (res?.succeeded) {
        toast.success('Thao tác thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        toast.error('Thất bại, vui lòng thử lại! ');
      }
    } else {
      toast.warning('Vui lòng chọn ít nhất 1 câu hỏi!');
    }
  };
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'codeId',
      key: 'codeId',
      with: 50,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <div className="w-100 text-gray-600" dangerouslySetInnerHTML={{ __html: record?.title }} />,
    },
    {
      title: 'Tiêu đề tiếng anh',
      dataIndex: 'titleEn',
      key: 'titleEn',
      render: (text, record) => <div className="w-100" dangerouslySetInnerHTML={{ __html: record?.titleEn }} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => <div className="w-100" dangerouslySetInnerHTML={{ __html: record?.content }} />,
    },
  ];

  return (
    <Modal show={modalVisible} fullscreen={true} onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Nhập câu hỏi</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 500 }}>
        <div className="p-3">
          <div className="row g-5">
            {/* <div className="input-group mt-3">
                <input
                  type="text"
                  className="form-control form-control-solid border ps-5"
                  placeholder="Nhập từ khoá tìm kiếm"
                  aria-label="Tìm kiếm"
                  aria-describedby="basic-addon2"
                  value={keySearch}
                  onChange={(e) => setKeySearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                  <i className="fas fa-search"></i>
                  Tìm kiếm
                </button>
              </div> */}
            <div className="col-xl-3 col-lg-6">
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
            <div className="col-xl-3 col-lg-6">
              <div className="btn-group align-items-center w-100">
                <span className="fw-bold w-150px">Khoá học:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    reload={true}
                    showSearch
                    placeholder="Chọn khoá học"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/courses/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                        keyword: keyword,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.title}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    value={dataSearch?.course}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          course: value,
                          questionLevel: null,
                        });
                      } else {
                        setDataSearch({
                          ...dataSearch,
                          course: null,
                          questionLevel: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6">
              <div className="btn-group align-items-center w-100">
                <span className="fw-bold w-200px">Chương trình học:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    reload={true}
                    showSearch
                    placeholder="Chương trình học"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/questionlevels/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                        courseId: dataSearch?.course?.value,
                        keyword: keyword,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    value={dataSearch?.questionLevel}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          questionLevel: value,
                        });
                      } else {
                        setDataSearch({
                          ...dataSearch,
                          questionLevel: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6">
              <div className="btn-group align-items-center w-100">
                <span className="fw-bold w-150px">Cấp độ:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    reload
                    showSearch
                    placeholder="Cấp độ"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/examAreas/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                        keyword: keyword,
                      }));
                    }}
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          examAreaId: current?.id,
                        });
                      } else {
                        setDataSearch({ ...dataSearch, examAreaId: null });
                      }
                    }}
                  />
                </div>
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
            scroll={{
              x: 2000,
            }}
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
