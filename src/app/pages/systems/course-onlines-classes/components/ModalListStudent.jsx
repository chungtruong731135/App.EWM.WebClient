import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Spin, Popconfirm } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestGET, requestPUT_NEW, FILE_URL } from "@/utils/baseAPI";
import TableList from "@/app/components/TableList";
import ModalAddUser from "./ModalAddUser";

const ModalItem = (props) => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector((state) => state.modal.dataModal);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [data, setData] = useState(null);
  const [modalUserVisible, setModalUserVisible] = useState(false);
  const [size, setSize] = useState(50);
  const [offset, setOffset] = useState(1);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/courseclasses/${id}`);

      var _data = res?.data ?? null;
      setData(_data);
      setDataTable(_data?.students ?? []);

      setLoading(false);
    };
    if (id) {
      fetchData();
    }
    return () => {};
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      var body = {
        ...data,
        students: dataTable,
      };

      const res = await requestPUT_NEW(`api/v1/courseclasses/${id}`, body);

      if (res.status === 200) {
        toast.success("Cập nhật thành công!");
        dispatch(actionsModal.setRandom());
        // handleCancel();
      } else {
        toast.error("Thất bại, vui lòng thử lại!");
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
    setBtnLoading(false);
  };
  const onFinishFailed = (error) => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
  };
  const handleAddData = (dataUser) => {
    setDataTable((arr) => [...arr, ...dataUser]);
  };
  const handleDeleteUser = (deleteId) => {
    var temp = [...dataTable];
    setDataTable(temp?.filter((i) => i.userId != deleteId));
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => (
        <div>{(offset - 1) * size + index + 1}</div>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text, record, index) => {
        const nameArray =
          record.fullName && record.fullName.length > 1
            ? record.fullName.match(/\S+/g)
            : ["A"];
        const lastName = nameArray[nameArray.length - 1];
        const firstChar = lastName.charAt(0);
        let arr = ["primary", "success", "danger", "warning", "info", "muted"];
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
                        src={
                          record.imageUrl.includes("https://") ||
                          record.imageUrl.includes("http://")
                            ? record.imageUrl
                            : FILE_URL +
                              `${
                                record.imageUrl.startsWith("/")
                                  ? record.imageUrl.substring(1)
                                  : record.imageUrl
                              }`
                        }
                        alt={record.fullName}
                        className="w-100"
                      />
                    </div>
                  ) : (
                    <div
                      className={`symbol-label fs-3 bg-light-${color} text-${color}`}
                    >
                      {` ${firstChar.toUpperCase()} `}
                    </div>
                  )}
                </a>
              </div>
              <div className="d-flex flex-column">
                <a
                  href="#"
                  className="text-gray-800 text-hover-primary mb-1 fw-bolder"
                >
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
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    // {
    //   title: "Thao tác",
    //   dataIndex: "",
    //   key: "",
    //   width: 80,
    //   render: (text, record) => {
    //     return (
    //       <div className="text-center">
    //         <Popconfirm
    //           title="Xoá?"
    //           onConfirm={() => {
    //             handleDeleteUser(record?.userId);
    //           }}
    //           okText="Xoá"
    //           cancelText="Huỷ"
    //         >
    //           <a
    //             className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1"
    //             data-toggle="m-tooltip"
    //             title="Xoá"
    //           >
    //             <i className="fa fa-trash"></i>
    //           </a>
    //         </Popconfirm>
    //       </div>
    //     );
    //   },
    // },
  ];
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
          <Modal.Title className="text-white">Danh sách học sinh</Modal.Title>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={handleCancel}
          ></button>
        </Modal.Header>
        <Modal.Body>
          <Spin spinning={loading}>
            <div className="table-responsive  min-h-300px">
              {/* <div className="mb-3 d-flex justify-content-end">
                <button
                  className="btn btn-primary btn-sm py-2"
                  onClick={() => {
                    setModalUserVisible(true);
                  }}
                >
                  <span>
                    <i className="fas fa-plus  me-2"></i>
                    <span className="">Thêm mới</span>
                  </span>
                </button>
              </div> */}

              <TableList
                loading={loading}
                dataTable={dataTable}
                columns={columns}
                isPagination={true}
                offset={offset}
                setOffset={setOffset}
                size={size}
                setSize={setSize}
                // scroll={{
                //   y: 500,
                // }}
              />
            </div>
          </Spin>
        </Modal.Body>
        <Modal.Footer className="bg-light px-4 py-2 align-items-center">
          {/* <div className="d-flex justify-content-center  align-items-center">
            <Button
              className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2"
              onClick={onFinish}
              disabled={btnLoading}
            >
              <i className="fa fa-save"></i>
              {"Lưu"}
            </Button>
          </div> */}
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
      {modalUserVisible ? (
        <ModalAddUser
          modalVisible={modalUserVisible}
          setModalVisible={setModalUserVisible}
          notInIds={dataTable?.map((i) => i?.userId)}
          handleAddData={handleAddData}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default ModalItem;
