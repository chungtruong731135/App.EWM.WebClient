import { Modal, Button } from "react-bootstrap";
import { Form, Input } from "antd";
import { toast } from "react-toastify";
import { requestPOST, requestPOST_NEW, requestPUT_NEW } from "@/utils/baseAPI";
import { getAuth, useAuth } from "@/app/modules/auth";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actionsModal from "@/setup/redux/modal/Actions";
const FormItem = Form.Item;
const ChangePasswordModal = ({ modalVisible, setModalVisible }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { currentUser, logout } = useAuth();
  const { token } = getAuth();
  const dataModal = useSelector((state) => state.modal.dataModal);
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (
        !formData.newPassword ||
        !formData.confirmNewPassword ||
        formData.newPassword !== formData.confirmNewPassword
      ) {
        toast.error(
          "Thất bại, vui lòng nhập lại mật khẩu, mật khẩu mới và nhập lại mật khẩu không trùng nhau!"
        );
        return;
      }
      var body = {
        userName: dataModal?.userName,
        password: formData.newPassword,
        token: token,
      };
      const res = await requestPOST_NEW(`api/users/admin-reset-password`, body);
      if (res.status === 200) {
        form.resetFields();
        toast.success("Cập nhật thành công!");
        setTimeout(() => {
          handleCancel();
        }, 1000);
      } else {
        toast.error("Cập nhật thất bại, vui lòng nhập lại mật khẩu!");
      }
    } catch (error) {}
    setLoading(false);
  };
  const onFinishFailed = (error) => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
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
        <Modal.Title className="text-white">Khôi phục mật khẩu</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <FormItem
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Không được để trống!" },
                  /* {
                    pattern:
                      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,18}$/,
                    message:
                      "Mật khẩu từ 6-18 ký tự, gồm có: chữ hoa hoặc chữ thường hoặc số và các ký tự đặc biệt! Vui lòng kiểm tra lại!",
                  }, */
                ]}
              >
                <Input placeholder="" type={"password"} />
              </FormItem>
            </div>
            <div className="col-xl-12 col-lg-12">
              <FormItem
                label="Nhập lại mật khẩu mới"
                name="confirmNewPassword"
                rules={[
                  { required: true, message: "Không được để trống!" },
                  /* {
                    pattern:
                      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,18}$/,
                    message:
                      "Mật khẩu từ 6-18 ký tự, gồm có: chữ hoa hoặc chữ thường và các ký tự đặc biệt! Vui lòng kiểm tra lại!",
                  }, */
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        "Nhập lại mật khẩu không khớp với mật khẩu mới!"
                      );
                    },
                  }),
                ]}
              >
                <Input placeholder="" type={"password"} />
              </FormItem>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button
            disabled={loading}
            className="btn-sm btn-primary rounded-1 p-2  ms-2"
            onClick={handleSubmit}
          >
            <i className="fa fa-save"></i>
            {"Đổi mật khẩu"}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button
            className="btn-sm btn-secondary rounded-1 p-2  ms-2"
            onClick={handleCancel}
          >
            <i className="fa fa-times"></i>Huỷ
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangePasswordModal;
