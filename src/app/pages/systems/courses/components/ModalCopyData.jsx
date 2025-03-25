import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Input, Spin, Checkbox } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST_NEW, requestPOST } from "@/utils/baseAPI";
import TDSelect from "@/app/components/TDSelect";

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
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      console.log(formData);

      const res = await requestPOST_NEW(
        `api/v1/courses/copy-course`,
        formData
      );

      if (res.status === 200) {
        toast.success("Sao chép thành công!");
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
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
      fullscreen={"lg-down"}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Sao chép dữ liệu</Modal.Title>
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
              initialValues={{
                copyTopic: true,
                copyQuestionLevel: true,
                copyDeLuyenTap: true,
              }}
            >
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Cấu hình sao chép">
                    <div className="row px-2">
                      <div className="col-xl-6 col-lg-6">
                        <FormItem
                          label="Khoá học nguồn"
                          name="source"
                          rules={[
                            { required: true, message: "Không được để trống!" },
                          ]}
                        >
                          <TDSelect
                            reload={true}
                            showSearch
                            placeholder="Chọn khoá học"
                            fetchOptions={async (keyword) => {
                              const res = await requestPOST(
                                `api/v1/courses/search`,
                                {
                                  pageNumber: 1,
                                  pageSize: 100,
                                  keyword: keyword,
                                }
                              );
                              return res?.data?.map((item) => ({
                                ...item,
                                label: `${item.title}`,
                                value: item.id,
                              }));
                            }}
                            style={{
                              width: "100%",
                            }}
                            onChange={(value, current) => {
                              if (value) {
                                form.setFieldValue("sourceId", current?.id);
                              } else {
                                form.setFieldValue("sourceId", null);
                              }
                            }}
                          />
                        </FormItem>
                      </div>
                      <div className="col-xl-6 col-lg-6">
                        <FormItem label="Khoá học đích" name="destination">
                          <TDSelect
                            reload={true}
                            showSearch
                            placeholder="Chọn khoá học đích"
                            fetchOptions={async (keyword) => {
                              const res = await requestPOST(
                                `api/v1/courses/search`,
                                {
                                  pageNumber: 1,
                                  pageSize: 100,
                                  keyword: keyword,
                                }
                              );
                              return res?.data?.map((item) => ({
                                ...item,
                                label: `${item.title}`,
                                value: item.id,
                              }));
                            }}
                            style={{
                              width: "100%",
                            }}
                            onChange={(value, current) => {
                              if (value) {
                                form.setFieldValue(
                                  "destinationId",
                                  current?.id
                                );
                              } else {
                                form.setFieldValue("destinationId", null);
                              }
                            }}
                          />
                        </FormItem>
                      </div>
                    </div>
                  </FormItem>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="copyTopic" valuePropName="checked">
                    <Checkbox>Copy chủ đề</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label=""
                    name="copyQuestionLevel"
                    valuePropName="checked"
                  >
                    <Checkbox>Copy chương trình học</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label=""
                    name="copyDeLuyenTap"
                    valuePropName="checked"
                  >
                    <Checkbox>Copy đề luyện tập</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label=""
                    name="deleteDataDestination"
                    valuePropName="checked"
                  >
                    <Checkbox>
                      Xoá dữ liệu kỳ thi đích trước khi sao chép
                    </Checkbox>
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
            onClick={onFinish}
            disabled={btnLoading}
          >
            <i className="fa fa-save"></i>
            Sao chép
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
