import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, InputNumber, Spin } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import TDSelect from "@/app/components/TDSelect";
import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST_NEW, requestPOST } from "@/utils/baseAPI";

const FormItem = Form.Item;

const ModalItem = (props) => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector((state) => state.modal.dataModal);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(false));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const values = await form.validateFields();
      const formData = form.getFieldsValue(true);
      var body = {
        quantity: formData?.quantity,
        id: dataModal?.id,
      };
      const res = await requestPOST_NEW(
        `api/v1/sales/activationcodes/activecode`,
        body
      );

      if (res.status === 200) {
        toast.success("Cập nhật thành công!");
        dispatch(actionsModal.setRandom());
        handleCancel();
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
    // form.submit();
  };
  return (
    <Modal
      show={modalVisible}
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">
          Yêu cầu thêm mã kích hoạt
        </Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              onFinishFailed={onFinishFailed}
              onFinish={onFinish}
            >
              <div className="row">
                <div className="col-xl-12">
                  <FormItem
                    label="Số lượng"
                    name="quantity"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <InputNumber min={0} />
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button
            className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2"
            onClick={handleSubmit}
            disabled={btnLoading}
          >
            <i className="fa fa-save me-2"></i>
            {"Lưu"}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button
            className="btn-sm btn-secondary rounded-1 p-2  ms-2"
            onClick={handleCancel}
          >
            <i className="fa fa-times me-2"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
