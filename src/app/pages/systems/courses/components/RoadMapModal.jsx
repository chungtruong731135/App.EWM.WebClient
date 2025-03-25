import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Input, Spin, InputNumber } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";
import TDEditorNew from "@/app/components/TDEditorNew";

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
  const { token } = authHelper.getAuth();
  const dataModal = useSelector((state) => state.modal.dataModal);
  const modalVisible = useSelector((state) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/learningroadmaps/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.course = _data?.courseId
          ? {
              value: _data?.courseId,
              label: _data?.courseTitle,
            }
          : null;

        _data.tournament = _data?.tournamentId
          ? {
              value: _data?.tournamentId,
              label: _data?.tournamentName,
            }
          : null;

        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };
    if (id) {
      fetchData();
    } else if (dataModal?.courseId) {
      form.setFieldsValue({
        courseId: dataModal?.courseId,
        course: {
          value: dataModal?.courseId,
          label: dataModal?.courseTitle,
        },
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
        ? await requestPUT_NEW(`api/v1/learningroadmaps/${id}`, body)
        : await requestPOST_NEW(`api/v1/learningroadmaps`, body);

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
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.examinatId !== currentValues.examinatId
                  }
                >
                  {({ getFieldValue }) => (
                    <div className="col-xl-6 col-lg-6">
                      <FormItem label="Thuộc vòng thi" name="tournament">
                        <TDSelect
                          reload
                          placeholder=""
                          fetchOptions={async (keyword) => {
                            const res = await requestPOST(
                              `api/v1/tournamentrelationships/search`,
                              {
                                pageNumber: 1,
                                pageSize: 1000,
                                relationshipId: getFieldValue("courseId"),
                              }
                            );
                            return res?.data?.map((item) => ({
                              ...item,
                              label: `${item.tournamentName}`,
                              value: item.tournamentId,
                            }));
                          }}
                          style={{
                            width: "100%",
                            height: "auto",
                          }}
                          onChange={(value, current) => {
                            if (value) {
                              form.setFieldValue(
                                "tournamentId",
                                current?.tournamentId
                              );
                              form.setFieldValue(
                                "tournamentName",
                                current?.tournamentName
                              );
                            } else {
                              form.setFieldValue("tournamentId", null);
                              form.setFieldValue("tournamentName", null);
                            }
                          }}
                        />
                      </FormItem>
                    </div>
                  )}
                </Form.Item>
                {/* <div className="col-xl-6 col-lg-6">
                  <FormItem label="Vòng thi" name="tournament">
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder=""
                      fetchOptions={async (keyword) => {
                        const res = await requestPOST(
                          `api/v1/categories/search`,
                          {
                            pageNumber: 1,
                            pageSize: 100,
                            isActive: true,
                            categoryGroupCode: "VongThi",
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
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue("tournamentId", current?.id);
                          form.setFieldValue("tournamentName", current?.name);
                        } else {
                          form.setFieldValue("tournamentId", null);
                          form.setFieldValue("tournamentName", null);
                        }
                      }}
                    />
                  </FormItem>
                </div> */}
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Điểm số từ"
                    name="fromScore"
                    rules={[
                      { required: true, message: "Không được để trống!" },
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
                        label="Điểm số đến"
                        name="toScore"
                        rules={[
                          { required: true, message: "Không được để trống!" },
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
                                  "Điểm số đến phải lớn hơn hoặc bằng Điểm số từ!"
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
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Tên lộ trình"
                    name="description"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Input />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="guide">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Nội dung cần học" name="contentData">
                    <TDEditorNew
                      data={
                        form.getFieldValue("contentData")
                          ? form.getFieldValue("contentData")
                          : ""
                      }
                      onChange={(value) => {
                        form.setFieldValue("contentData", value);
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
