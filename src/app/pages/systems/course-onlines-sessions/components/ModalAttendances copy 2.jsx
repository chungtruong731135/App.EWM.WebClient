import { useState, useEffect, createContext, useRef, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Spin, Checkbox, InputNumber, Input } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPOST, FILE_URL } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';

const EditableContext = createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({ title, editable, children, dataIndex, record, editing, handleSave, ...restProps }) => {
  const inputRef = useRef(null);
  let childNode = children;
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    }
  }, [editing]);
  const save = async () => {
    try {
      const values = await form.validateFields();
      // form.setFieldsValue({
      //   [dataIndex]: record[dataIndex],
      // });
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        valuePropName={dataIndex == 'status' ? 'checked' : 'value'}
      >
        {dataIndex == 'status' ? <Checkbox onClick={save} onBlur={save} /> : dataIndex == 'comment' ? <Input.TextArea ref={inputRef} onPressEnter={save} onBlur={save} /> : <InputNumber min={0} onPressEnter={save} onBlur={save} />}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        // onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const ModalItem = props => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector(state => state.modal.dataModal);

  const [form] = Form.useForm();
  const [offset, setOffset] = useState(1);
  const [size, setSize] = useState(50);

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [numberCol, setNumberCol] = useState(0);
  const [columnsTable, setColumnsTable] = useState([]);
  const defaultColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 80,
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
      title: 'Điểm danh',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      editable: true,
    },
  ];
  useEffect(() => {
    setColumnsTable(defaultColumns);
    return () => {};
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const resTemp = await requestPOST(
        `api/v1/classsessionattendances/search`,
        _.assign({
          pageNumber: 1,
          pageSize: 1000,
          classSessionId: dataModal?.classSessionId,
        })
      );
      var _dataTemp = resTemp?.data ?? [];
      const resCourse = await requestGET(`api/v1/courseclasses/${dataModal?.courseClassId}`);
      var _dataCourse = resCourse?.data?.students ?? [];
      _dataCourse?.map(i => (i.studentId = i?.userId));
      var temp = _dataCourse?.filter(i => _dataTemp?.findIndex(user => user?.studentId == i.studentId) < 0);
      _dataTemp = _dataTemp?.concat(temp);
      if (_dataTemp?.length > 0) {
        var first = JSON.parse(_dataTemp[0]?.description ?? '[]');
        setNumberCol(first?.length);
        handleAddColumns(first?.length);
        if (first?.length > 0) {
          _dataTemp?.map(item => {
            let arr = JSON.parse(item?.description ?? '[]');
            if (arr?.length > 0) {
              arr.map((i, ind) => {
                item[`score${ind + 1}`] = i;
              });
            }
          });
        }
        setDataTable(_dataTemp);
      }
      setLoading(false);
    };
    if (dataModal?.classSessionId) {
      fetchData();
    }
    return () => {};
  }, [dataModal?.classSessionId]);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const getDescription = item => {
    if (numberCol > 0) {
      var score = [];
      for (let index = 1; index <= numberCol; index++) {
        score.push(item[`score${index}`]);
      }
      return JSON.stringify(score);
    }
    return null;
  };
  const onFinish = async () => {
    setBtnLoading(true);
    var arrStudent = [];

    dataTable?.map(i => {
      arrStudent.push({
        studentId: i?.studentId,
        status: i?.status ? 1 : 0,
        comment: i?.comment,
        description: getDescription(i),
      });
    });
    try {
      var body = {
        classSessionId: dataModal?.classSessionId,
        students: arrStudent,
      };
      const res = await requestPOST_NEW(`api/v1/classsessionattendances`, body);

      if (res.status === 200) {
        toast.success('Thao tác thành công!');
        handleCancel();
      } else {
        toast.error('Thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setBtnLoading(false);
  };

  const handleAddColumns = num => {
    if (num > 0) {
      var temp = [...defaultColumns];
      for (let index = 1; index <= num; index++) {
        temp.push({
          title: `Bài ${index}`,
          dataIndex: `score${index}`,
          key: `score${index}`,
          editable: true,
          width: 80,
        });
      }
      temp.push({
        title: 'Nhận xét',
        dataIndex: 'comment',
        key: 'comment',
        width: 300,
        editable: true,
      });
      setColumnsTable(temp);
    } else {
      setColumnsTable(defaultColumns);
    }
    console.log(dataTable);
    var tempTable = [...dataTable];
    tempTable?.map(item => {
      for (let index = 1; index <= num; index++) {
        item[`score${index}`] = item[`score${index}`] || null;
      }
    });
    setDataTable(tempTable);
  };
  const handleSave = row => {
    var newData = [...dataTable];
    const index = newData.findIndex(item => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataTable(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = columnsTable.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: true,
        handleSave,
      }),
    };
  });
  return (
    <>
      <Modal show={modalVisible} fullscreen={true} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
        <Modal.Header className="bg-primary px-4 py-3">
          <Modal.Title className="text-white">Điểm danh và chấm điểm</Modal.Title>
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
        </Modal.Header>
        <Modal.Body>
          <Spin spinning={loading}>
            <div className="mb-3 d-flex align-items-center">
              <div className="btn-group me-2 align-items-center">
                <span className="fw-bold w-200px">Số bài tập trên lớp:</span>
                <InputNumber value={numberCol} placeholder="" min={0} onChange={e => setNumberCol(e)}></InputNumber>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  handleAddColumns(numberCol);
                }}
              >
                <span className="fw-bold">Xác nhận</span>
              </button>
            </div>
            <div className="table-responsive  min-h-300px">
              <TableList
                components={components}
                loading={loading}
                dataTable={dataTable}
                columns={columns}
                isPagination={true}
                offset={offset}
                size={size}
                setOffset={setOffset}
                setSize={setSize}
                scroll={{
                  x: 2000,
                }}
              />
            </div>
          </Spin>
        </Modal.Body>
        <Modal.Footer className="bg-light px-4 py-2 align-items-center">
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={onFinish} disabled={btnLoading}>
              <i className="fa fa-save"></i>
              {'Lưu'}
            </Button>
          </div>
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
              <i className="fa fa-times"></i>Đóng
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalItem;
