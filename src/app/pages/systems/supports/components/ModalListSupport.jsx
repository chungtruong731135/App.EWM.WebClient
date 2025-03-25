import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Spin, Popconfirm } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestDELETE, requestPOST, FILE_URL } from "@/utils/baseAPI";
import TableList from "@/app/components/TableList";
import ModalReply from "./ModalReply";
const ModalItem = (props) => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible, modalId, setModalId } = props;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [data, setData] = useState(null);
  const [modalSupportVisible, setModalSupportVisible] = useState(false);
  const [size, setSize] = useState(50);
  const [offset, setOffset] = useState(1);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestPOST(
        `api/v1/supports/danh-sach-thong-tin`,
        _.assign({
          pageNumber: offset,
          pageSize: size,
          orderBy: ["createdOn DESC"],
          parentId: modalId,
        })
      );
      setDataTable(res?.data ?? []);

      setLoading(false);
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
  }, [modalId]);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
    setModalId(null);
  };

  const handleButton = async (type, item) => {
    switch (type) {
      case "chi-tiet":
        dispatch(actionsModal.setDataModal(item));
        setModalSupportVisible(true);

        break;

      case "delete":
        var res = await requestDELETE(`api/v1/supports/thong-tin/${item.id}`);
        if (res) {
          toast.success("Thao tác thành công!");
          setRefreshing(true);
        } else {
          toast.error("Thất bại, vui lòng thử lại!");
        }
        break;

      default:
        break;
    }
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
      title: "Nội dung tư vấn",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "Phản hồi của khách hàng",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Trạng thái",
      dataIndex: "codeId",
      key: "codeId",
    },
    {
      title: "Thao tác",
      dataIndex: "",
      key: "",
      width: 100,
      render: (text, record) => {
        return (
          <div className="text-center">
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết/Sửa"
              onClick={() => {
                handleButton(`chi-tiet`, record);
              }}
            >
              <i className="fa fa-eye"></i>
            </a>
            <Popconfirm
              title="Xoá?"
              onConfirm={() => {
                handleButton(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a
                className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Xoá"
              >
                <i className="fa fa-trash"></i>
              </a>
            </Popconfirm>
          </div>
        );
      },
    },
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
          <Modal.Title className="text-white">Danh sách tư vấn</Modal.Title>
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
              <div className="mb-3 d-flex justify-content-end">
                <button
                  className="btn btn-primary btn-sm py-2"
                  onClick={() => {
                    dispatch(actionsModal.setDataModal({ parentId: modalId }));
                    setModalSupportVisible(true);
                  }}
                >
                  <span>
                    <i className="fas fa-plus  me-2"></i>
                    <span className="">Thêm mới</span>
                  </span>
                </button>
              </div>

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
      {modalSupportVisible ? (
        <ModalReply
          modalVisible={modalSupportVisible}
          setModalVisible={setModalSupportVisible}
          setRefreshing={setRefreshing}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default ModalItem;
