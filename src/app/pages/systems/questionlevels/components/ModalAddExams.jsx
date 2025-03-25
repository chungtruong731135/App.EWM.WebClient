import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';
import HeaderTitle from '@/app/components/HeaderTitle';
import { toast } from 'react-toastify';

const ModalItem = props => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible, courseId } = props;

  console.log('courseId', courseId);

  const [form] = Form.useForm();
  const random = useSelector(state => state.modal.random);
  const [dataSearch, setDataSearch] = useState(null);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/exams/search`,
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
    fetchData();

    return () => {};
  }, [offset, size, dataSearch, random]);
  const handleCancel = () => {
    form.resetFields();

    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Thuộc kỳ thi',
      dataIndex: 'examinatTitle',
      key: 'examinatTitle',
    },
    {
      title: 'Tên đề thi',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Cấp độ',
      dataIndex: 'examAreaName',
      key: 'examAreaName',
    },
    {
      title: 'Thời gian thi (Phút)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Tổng số câu hỏi',
      dataIndex: 'totalQuestion',
      key: 'totalQuestion',
    },
    {
      title: 'Tổng điểm',
      dataIndex: 'totalScore',
      key: 'totalScore',
    },
  ];
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      // setSelectedRows(selectedRows);
    },
  };
  const onFinish = async () => {
    setButtonLoading(true);
    try {
      var body = {
        courseId: courseId,
        exams: selectedRowKeys?.map(i => {
          return { id: i };
        }),
      };
      const res = await requestPOST(`api/v1/courseexams`, body);

      if (res?.succeeded) {
        toast.success('Thao tác thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        toast.error('Thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setButtonLoading(false);
  };

  return (
    <Modal show={modalVisible} fullscreen={true} onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Danh sách đề thi</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          <HeaderTitle title={'Chọn đề thi'} />
          <div className="row g-5">
            <div className="col-xl-4 col-lg-6 px-5">
              <div className="btn-group me-2 w-100">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  onChange={e => {
                    setDataSearch({
                      ...dataSearch,
                      keyword: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold w-100px">Kỳ thi:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  reload={true}
                  placeholder="Chọn kỳ thi"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/examinats/search`, {
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
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        examinatId: current?.id,
                      });
                    } else {
                      setDataSearch({ ...dataSearch, examinatId: null });
                    }
                  }}
                />
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-100px">Khối lớp:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  reload
                  mode="multiple"
                  placeholder="Chọn khối lớp"
                  fetchOptions={async () => {
                    const res = await requestPOST(`api/v1/categories/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      categoryGroupCode: 'KhoiLop',
                    });
                    return res?.data?.map(item => ({
                      ...item,
                      label: `${item.name}`,
                      value: item.id,
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
                        gradeIds: current?.map(i => i?.id),
                      });
                    } else {
                      setDataSearch({ ...dataSearch, gradeIds: null });
                    }
                  }}
                />
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-100px">Cấp độ:</span>
              <div className="ms-2 w-100 ">
                <TDSelect
                  reload={true}
                  showSearch
                  placeholder="Chọn cấp độ"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/examareas/search`, {
                      pageNumber: 1,
                      pageSize: 100,
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
                  value={dataSearch?.examAreaId ?? null}
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
            <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-100px">Loại kỳ thi:</span>
              <div className="ms-2 w-100 ">
                <Select
                  allowClear
                  placeholder="Chọn"
                  style={{ width: '100%' }}
                  options={[
                    {
                      value: 0,
                      label: 'Đề luyện tập theo chương trình học',
                    },
                    {
                      value: 1,
                      label: 'Đề thi thử',
                    },
                    {
                      value: 2,
                      label: 'Đề kiểm tra kiến thức',
                    },
                    {
                      value: 3,
                      label: 'Đề luyện thi, đánh giá (Hệ thống tạo tự động)',
                    },
                    {
                      value: 4,
                      label: 'Đề luyện theo chuyên đề (Hệ thống tạo tự động)',
                    },
                  ]}
                  onChange={value => {
                    setDataSearch({
                      ...dataSearch,
                      type: value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-5">
            <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} rowSelection={rowSelection} />
          </div>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa fa-times"></i>Lưu
          </Button>
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
