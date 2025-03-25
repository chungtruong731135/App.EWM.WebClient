import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Input, Spin, InputNumber, Select } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as authHelper from "@/app/modules/auth/core/AuthHelpers";
import * as actionsModal from "@/setup/redux/modal/Actions";
import {
  requestGET,
  requestPOST_NEW,
  requestPUT_NEW,
  requestPOST,
} from "@/utils/baseAPI";
import TDSelect from "@/app/components/TDSelect";

const FormItem = Form.Item;

const { TextArea } = Input;

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
      const res = await requestGET(`api/v1/learningroadmapitems/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.parent = _data?.parentId
          ? {
              value: _data?.parentId,
              label: _data?.topicName || _data?.courseTitle,
            }
          : null;

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

      const res = id
        ? await requestPUT_NEW(`api/v1/learningroadmapitems/${id}`, body)
        : await requestPOST_NEW(`api/v1/learningroadmapitems`, body);

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
                          label: "Chuyên đề",
                        },
                        {
                          value: 1,
                          label: "Khoá học",
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
                  {({ getFieldValue }) =>
                    getFieldValue("type") == 1 ? (
                      <div className="col-xl-6 col-lg-6">
                        <FormItem label="Khoá học khác" name="parent">
                          <TDSelect
                            reload
                            showSearch
                            placeholder=""
                            fetchOptions={async (keyword) => {
                              const res = await requestPOST(
                                `api/v1/courses/search`,
                                {
                                  pageNumber: 1,
                                  pageSize: 1000,
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
                              height: "auto",
                            }}
                            onChange={(value, current) => {
                              if (value) {
                                form.setFieldValue("parentId", current?.id);
                              } else {
                                form.setFieldValue("parentId", null);
                              }
                            }}
                          />
                        </FormItem>
                      </div>
                    ) : (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Chuyên đề cần học"
                            name="parent"
                            rules={[
                              {
                                required: true,
                                message: "Không được để trống!",
                              },
                            ]}
                          >
                            <TDSelect
                              reload
                              showSearch
                              placeholder=""
                              fetchOptions={async (keyword) => {
                                const res = await requestPOST(
                                  `api/v1/topics/search`,
                                  {
                                    pageNumber: 1,
                                    pageSize: 1000,
                                    courseId: courseId,
                                    keyword: keyword,
                                  }
                                );
                                return res?.data?.map((item) => ({
                                  ...item,
                                  label: `${item.name}`,
                                  value: item.id,
                                }));
                              }}
                              style={{
                                width: "100%",
                                height: "auto",
                              }}
                              onChange={(value, current) => {
                                if (value) {
                                  form.setFieldValue("parentId", current?.id);
                                } else {
                                  form.setFieldValue("parentId", null);
                                }
                              }}
                            />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem
                            label="Phần trăm làm bài chính xác từ"
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
                                label="Phần trăm làm bài chính xác đến"
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
                                          "Phần trăm làm bài chính xác đến phải lớn hơn hoặc bằng Phần trăm làm bài chính xác từ!"
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
                    )
                  }
                </Form.Item>

                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="description">
                    <TextArea rows={4} placeholder="" />
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
