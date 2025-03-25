import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Input, Spin } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestGET, requestPOST_NEW } from "@/utils/baseAPI";

const FormItem = Form.Item;

const ModalItem = (props) => {
  const dispatch = useDispatch();

  const dataModal = useSelector((state) => state.modal.dataModal);
  const modalVisible = useSelector((state) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [permissionGroups, setPermissionGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      if (!id) {
        const res = await requestGET(`api/permissions/group`);
        setPermissionGroups(res);
      } else {
        const resRoles = await requestGET(`api/roles/${id}/permissions/group`);
        if (resRoles) {
          form.setFieldsValue(resRoles);
          setPermissionGroups(resRoles?.groups ?? []);
        }
      }
      setLoadding(false);
    };

    fetchData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChangePermission = (event) => {
    const element = event.target;
    const permission = element.value;

    const newPermissionGroups = permissionGroups.map((g) => {
      const updatedPermissions = g.permissions.map((p) => {
        if (p.value === permission) {
          return { ...p, active: element.checked };
        }
        return p;
      });

      return { ...g, permissions: updatedPermissions };
    });

    setPermissionGroups(newPermissionGroups);
  };

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    setBtnLoading(true);
    try {
      const permissionElements = document.querySelectorAll(
        'input[name="permissions"]'
      );
      let permissionValues = [];

      permissionElements.forEach((input) => {
        permissionValues.push({
          value: input.value,
          active: input.checked,
        });
      });

      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      formData.permissions = permissionValues;

      const res = await requestPOST_NEW(`api/roles`, formData);

      if (res.status === 200) {
        toast.success("Cập nhật thành công!");
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        //toast.error('Thất bại, vui lòng thử lại!');
        const errors = Object.values(res?.data?.errors ?? {});
        let final_arr = [];
        errors.forEach((item) => {
          final_arr = _.concat(final_arr, item);
        });
        toast.error("Thất bại, vui lòng thử lại! " + final_arr.join(" "));
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
    setBtnLoading(false);
  };

  return (
    <Modal
      show={modalVisible}
      fullscreen={true}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
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
            <Form form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Tên"
                    name="name"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ghi chú" name="description">
                    <Input placeholder="" />
                  </FormItem>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-12 col-lg-12 mt-4">
                  <div className="card card-xl-stretch">
                    <div className="card-header">
                      <div className="card-title fw-bold text-header-td fs-4 mb-0">
                        Danh sách quyền
                      </div>
                    </div>
                    <div className="card-body">
                      <Spin spinning={loadding}>
                        {!loadding && (
                          <div className="row">
                            {permissionGroups.map((group) => (
                              <div className="mb-3">
                                <p className="fw-bold">{group.section}</p>
                                <div className="row">
                                  {group.permissions.map((i) => (
                                    <div className="col-3 mb-1">
                                      <div className="d-flex align-items-center">
                                        <input
                                          name="permissions"
                                          type="checkbox"
                                          id={i.value}
                                          value={i.value}
                                          checked={i.active}
                                          className="me-2"
                                          onChange={(e) =>
                                            onChangePermission(e)
                                          }
                                        ></input>
                                        <label htmlFor={i.value}>
                                          {i.description}
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Spin>
                    </div>
                  </div>
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
            onClick={onFinish}
            disabled={btnLoading}
          >
            <i className="fa fa-save"></i>
            {id ? "Lưu" : "Tạo mới"}
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
  );
};

export default ModalItem;
