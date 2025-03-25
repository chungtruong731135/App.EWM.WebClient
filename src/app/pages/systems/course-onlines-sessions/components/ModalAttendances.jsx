import { useState, useEffect, createContext, useRef, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';

import { Form, Spin, Checkbox, InputNumber, Input } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, requestPOST, requestDOWNLOADFILE } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

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
const EditableCell = ({ editable, children, dataIndex, record, editing, handleSave, ...restProps }) => {
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
      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status || prevValues.onLeave !== currentValues.onLeave}>
        {({ getFieldValue }) => (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            valuePropName={dataIndex == 'comment' ? 'value' : 'checked'}
            className="text-center"
          >
            {dataIndex == 'status' ? (
              <Checkbox onClick={save} disabled={getFieldValue('onLeave') == true} />
            ) : dataIndex == 'onLeave' ? (
              <Checkbox onClick={save} disabled={getFieldValue('status') == true} />
            ) : dataIndex == 'comment' ? (
              <Input.TextArea ref={inputRef} onPressEnter={save} />
            ) : (
              <Checkbox onClick={save} />
            )}
          </Form.Item>
        )}
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
  const random = useSelector(state => state.modal.random);

  let container = useRef(null);
  let [height, setHeight] = useState(null);

  const [form] = Form.useForm();
  const [offset, setOffset] = useState(1);
  const [size, setSize] = useState(50);

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [numberCol, setNumberCol] = useState(0);
  const [columnsTable, setColumnsTable] = useState([]);

  const fileInputRef = useRef(null);

  const defaultColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      fixed: 'left',
      render: (text, record, index) => <div style={{ width: '40px' }}>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Nghỉ',
      dataIndex: 'onLeave',
      key: 'onLeave',
      width: 80,
      editable: true,
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
    setHeight(container.current.offsetHeight);
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
  }, [dataModal?.classSessionId, random]);

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

  const onFinishItem = async datas => {
    try {
      var body = {
        classSessionId: dataModal?.classSessionId,
        studentId: datas?.studentId,
        status: datas?.status ? 1 : 0,
        onLeave: datas?.onLeave ? 1 : 0,
        comment: datas?.comment,
        description: getDescription(datas),
      };
      await requestPOST_NEW(`api/v1/classsessionattendances/create-or-update`, body);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onFinish = async () => {
    setBtnLoading(true);
    var arrStudent = [];

    dataTable?.map(i => {
      arrStudent.push({
        studentId: i?.studentId,
        status: i?.status ? 1 : 0,
        onLeave: i?.onLeave ? 1 : 0,
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

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = event => {
    const selectedFile = event.target.files[0];
    handleConvert(selectedFile);
  };

  const handleConvert = async selectedFile => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async e => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const transformedData = json.map(item => {
          let description = [];
          let transformedItem = {};

          for (const key in item) {
            if (key.startsWith('Câu') || key.startsWith('Bài')) {
              if (item[key]) {
                description.push(true);
              } else {
                description.push(null);
              }
            } else if (key === 'Tài khoản') {
              transformedItem.userName = item[key];
            } else if (key === 'Nghỉ phép') {
              if (item[key]) {
                transformedItem.onLeave = 1;
              } else {
                transformedItem.onLeave = 0;
              }
            } else if (key === 'Điểm danh') {
              if (item[key]) {
                transformedItem.status = 1;
              } else {
                transformedItem.status = 0;
              }
            }
          }

          transformedItem.description = JSON.stringify(description);

          return transformedItem;
        });
        try {
          var body = {
            classSessionId: dataModal?.classSessionId,
            students: transformedData,
          };
          const res = await requestPOST_NEW(`api/v1/classsessionattendances`, body);
          if (res.status === 200) {
            toast.success('Thao tác thành công!');
            dispatch(actionsModal.setRandom());
            handleCancel();
          } else {
            toast.error('Thất bại, vui lòng thử lại!');
          }
        } catch (errorInfo) {
          console.log('Failed:', errorInfo);
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleExport = async () => {
    handleAddColumns(numberCol);
    try {
      const res = await requestDOWNLOADFILE(`api/v1/classsessionattendances/export-diem-danh-cham-diem`, { amount: numberCol || 0, classSessionId: dataModal?.classSessionId });
      const fileData = new Blob([res.data], { type: 'application/vnd.ms-excel' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = 'BaiLamCuaHocSinh.xlsx';
      downloadLink.click();
    } catch (error) {
      console.log(error);
    }
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
    onFinishItem(row);
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
        <Modal.Body ref={container}>
          <div className="mb-3 d-flex align-items-center">
            <div className="btn-group me-2 align-items-center">
              <span className="fw-bold w-200px">Số bài tập trên lớp:</span>
              <InputNumber value={numberCol} placeholder="" min={0} onChange={e => setNumberCol(e)}></InputNumber>
            </div>
            <button
              className="btn btn-primary btn-sm me-2 "
              onClick={() => {
                handleAddColumns(numberCol);
              }}
            >
              <span className="fw-bold">Xác nhận</span>
            </button>
            <button
              className="btn btn-primary btn-sm me-2 "
              onClick={() => {
                handleExport();
              }}
            >
              <span>
                <i className="fas fa-print me-2"></i>
                <span className="">Xuất dữ liệu</span>
              </span>
            </button>
            <input type="file" accept=".xls,.xlsx" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            <button className="btn btn-primary btn-sm me-2 " onClick={handleButtonClick}>
              <span>
                <i className="fas fa-upload me-2"></i>
                <span className="">Nhập dữ liệu</span>
              </span>
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
                x: 1300,
                y: height - 200,
              }}
            />
          </div>
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
