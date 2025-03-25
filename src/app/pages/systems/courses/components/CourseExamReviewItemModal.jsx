import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Input, Spin, InputNumber, Select } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as authHelper from "@/app/modules/auth/core/AuthHelpers";
import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestGET, requestPOST_NEW, requestPUT_NEW } from "@/utils/baseAPI";
import TDEditorNew from "@/app/components/TDEditorNew";

const FormItem = Form.Item;

const ModalItem = (props) => {
  const dispatch = useDispatch();
  const dataModal = useSelector((state) => state.modal.dataModal);
  const modalVisible = useSelector((state) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const { courseId } = props;
  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/courseexamreviews/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };
    if (id) {
      fetchData();
    } else if (dataModal?.learningRoadmapId) {
      form.setFieldsValue({
        learningRoadmapId: dataModal?.learningRoadmapId,
      });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };

      if (id) {
        body.id = id;
      }
      if (courseId) {
        body.courseId = courseId;
      }

      const res = id
        ? await requestPUT_NEW(`api/v1/courseexamreviews/${id}`, body)
        : await requestPOST_NEW(`api/v1/courseexamreviews`, body);

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
  const onFinishFailed = (error) => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
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
            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              onFinishFailed={onFinishFailed}
              onFinish={onFinish}
              initialValues={{ type: 0 }}
            >
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Loại gợi ý"
                    name="type"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                    initialValue={0}
                  >
                    <Select
                      style={{ width: "100%" }}
                      options={[
                        {
                          value: 0,
                          label: "Phần trăm",
                        },
                        {
                          value: 1,
                          label: "Điểm số",
                        },
                      ]}
                      onChange={() => {
                        form.setFieldValue("parent", null);
                        form.setFieldValue("parentId", null);
                      }}
                    />
                  </FormItem>
                </div>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                  }
                >
                  {({ getFieldValue }) => {
                    let textContent = "Phần trăm";
                    if (getFieldValue("type") === 1) {
                      textContent = "Điểm số";
                    }
                    return (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label={`${textContent} làm bài chính xác từ`}
                            name="fromScore"
                            rules={[
                              {
                                required: true,
                                message: "Không được để trống!",
                              },
                            ]}
                          >
                            <InputNumber placeholder="" min={0} />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                              prevValues.fromScore !== currentValues.fromScore
                            }
                          >
                            {({ getFieldValue }) => (
                              <FormItem
                                label={`${textContent} làm bài chính xác đến"`}
                                name="toScore"
                                rules={[
                                  {
                                    required: true,
                                    message: "Không được để trống!",
                                  },
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (
                                        !value ||
                                        getFieldValue("fromScore") <= value
                                      ) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        new Error(
                                          `${textContent} làm bài chính xác đến phải lớn hơn hoặc bằng ${textContent} làm bài chính xác từ!`
                                        )
                                      );
                                    },
                                  }),
                                ]}
                              >
                                <InputNumber
                                  placeholder=""
                                  min={getFieldValue("fromScore")}
                                />
                              </FormItem>
                            )}
                          </Form.Item>
                        </div>
                      </>
                    );
                  }}
                </Form.Item>

                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="description">
                    <TDEditorNew
                      data={
                        form.getFieldValue("description")
                          ? form.getFieldValue("description")
                          : ""
                      }
                      onChange={(value) => {
                        form.setFieldValue("description", value);
                      }}
                    />
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
