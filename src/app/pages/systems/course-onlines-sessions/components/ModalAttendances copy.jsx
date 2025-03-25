import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Spin, Checkbox, InputNumber } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as authHelper from "@/app/modules/auth/core/AuthHelpers";
import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestGET, requestPOST_NEW, requestPOST } from "@/utils/baseAPI";
import TableList from "@/app/components/TableList";

const ModalItem = (props) => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector((state) => state.modal.dataModal);

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
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (text, record, index) => (
        <div>{(offset - 1) * size + index + 1}</div>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Tài khoản",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Điểm danh",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (text, record) => {
        return (
          <div className="text-center">
            <Checkbox
              checked={text == 1 ? true : false}
              onChange={(e) => handleCheck(record?.studentId, e.target.checked)}
            />
          </div>
        );
      },
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
      if (_dataTemp?.length > 0) {
        setDataTable(_dataTemp);
      } else {
        const res = await requestGET(
          `api/v1/courseclasses/${dataModal?.courseClassId}`
        );
        var _data = res?.data?.students ?? [];
        _data?.map((i) => (i.studentId = i?.userId));
        setDataTable(_data);
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

  const onFinish = async () => {
    setBtnLoading(true);
    var arrStudent = [];
    dataTable?.map((i) => {
      arrStudent.push({
        studentId: i?.studentId,
        status: i?.status ?? 0,
      });
    });
    try {
      var body = {
        classSessionId: dataModal?.classSessionId,
        students: arrStudent,
      };
      const res = await requestPOST_NEW(`api/v1/classsessionattendances`, body);

      if (res.status === 200) {
        toast.success("Thao tác thành công!");
        // dispatch(actionsModal.setRandom());
      } else {
        toast.error("Thất bại, vui lòng thử lại!");
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
    setBtnLoading(false);
  };

  const handleCheck = (userId, value) => {
    var temp = [...dataTable];
    var ind = temp.findIndex((i) => i.studentId == userId);
    if (ind > -1) {
      var item = temp[ind];
      item.status = value == true ? 1 : 0;
    }
    setDataTable(temp);
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
      }),
    };
  });
  return (
    <>
      <Modal
        show={modalVisible}
        fullscreen={"lg-down"}
        size="xl"
        onExited={handleCancel}
        keyboard={true}
        scrollable={true}
        onEscapeKeyDown={handleCancel}
      >
        <Modal.Header className="bg-primary px-4 py-3">
          <Modal.Title className="text-white">Danh sách điểm danh</Modal.Title>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={handleCancel}
          ></button>
        </Modal.Header>
        <Modal.Body>
          <Spin spinning={loading}>
            <div className="mb-3 d-flex align-items-center">
              <div class="btn-group me-2 align-items-center">
                <span class="fw-bold w-80px">Số bài:</span>
                <InputNumber placeholder=""></InputNumber>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => {}}>
                <span className="fw-bold">Xác nhận</span>
              </button>
            </div>
            <div className="table-responsive  min-h-300px">
              <TableList
                loading={loading}
                dataTable={dataTable}
                columns={columns}
                isPagination={false}
                offset={offset}
                size={size}
                // scroll={{
                //   y: 500,
                // }}
              />
            </div>
          </Spin>
        </Modal.Body>
        <Modal.Footer className="bg-light px-4 py-2 align-items-center">
          <div className="d-flex justify-content-center  align-items-center">
            <Button
              className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2"
              onClick={onFinish}
              disabled={btnLoading}
            >
              <i className="fa fa-save"></i>
              {"Lưu"}
            </Button>
          </div>
          <div className="d-flex justify-content-center  align-items-center">
            <Button
              className="btn-sm btn-secondary rounded-1 p-2  ms-2"
              onClick={handleCancel}
            >
              <i className="fa fa-times"></i>Đóng
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalItem;
