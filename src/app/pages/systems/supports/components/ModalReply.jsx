import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Input, Select, Spin } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST, requestPOST_NEW, requestPUT_NEW } from "@/utils/baseAPI";
import TDSelect from "@/app/components/TDSelect";

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = (props) => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible, setRefreshing } = props;
  const dataModal = useSelector((state) => state.modal.dataModal);
  const userId = dataModal?.userId ?? null;
  const courseId = dataModal?.courseId ?? null;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestPOST(`api/v1/supports/chi-tiet-thong-tin`, {
        userId: userId,
        courseId: courseId,
      });
      var _data = res?.data ?? null;
      if (_data) {
        _data.chatLuongKhoaHoc = _data?.chatLuongKhoaHocId
          ? {
              value: _data?.chatLuongKhoaHocId,
              label: _data?.chatLuongKhoaHocName,
            }
          : null;

        _data.thanhTich = _data?.thanhTichId
          ? {
              value: _data?.thanhTichId,
              label: _data?.thanhTichName,
            }
          : null;
        _data.huongDan = _data?.huongDanId
          ? {
              value: _data?.huongDanId,
              label: _data?.huongDanName,
            }
          : null;
        _data.tiepTucMuaKhoaHoc = _data?.tiepTucMuaKhoaHocId
          ? {
              value: _data?.tiepTucMuaKhoaHocId,
              label: _data?.tiepTucMuaKhoaHocName,
            }
          : null;
        _data.status = _data?.statusId
          ? {
              value: _data?.statusId,
              label: _data?.statusName,
            }
          : null;

        form.setFieldsValue(_data);
      }
      setLoading(false);
    };
    if (userId && courseId) {
      fetchData();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, courseId]);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = await form.getFieldsValue(true);
      formData.userId = userId;
      formData.courseId = courseId;

      const res = await requestPOST_NEW(`api/v1/supports/thong-tin`, formData);

      if (res.status === 200) {
        toast.success("Thao tác thành công!");
        dispatch(actionsModal.setRandom());
        handleCancel();
        if (setRefreshing) {
          setRefreshing(true);
        }
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
        <Modal.Title className="text-white">Tư vấn</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <div className="row">
                <div className="col-12">
                  <FormItem label="Nội dung tư vấn" name="content">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-12">
                  <FormItem label="Phản hồi của khách" name="code">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Chất lượng khóa học" name="chatLuongKhoaHoc">
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
                            categoryGroupCode: "ChatLuongKhoaHoc",
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
                          form.setFieldValue("chatLuongKhoaHocId", current?.id);
                          form.setFieldValue(
                            "chatLuongKhoaHocName",
                            current?.name
                          );
                        } else {
                          form.setFieldValue("chatLuongKhoaHocId", null);
                          form.setFieldValue("chatLuongKhoaHocName", null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thành tích" name="thanhTich">
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
                            categoryGroupCode: "ThanhTich",
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
                          form.setFieldValue("thanhTichId", current?.id);
                          form.setFieldValue("thanhTichName", current?.name);
                        } else {
                          form.setFieldValue("thanhTichId", null);
                          form.setFieldValue("thanhTichName", null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Trạng thái hướng dẫn" name="huongDan">
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
                            categoryGroupCode: "TrangThaiHuongDan",
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
                          form.setFieldValue("huongDanId", current?.id);
                          form.setFieldValue("huongDanName", current?.name);
                        } else {
                          form.setFieldValue("huongDanId", null);
                          form.setFieldValue("huongDanName", null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Trạng thái tiếp tục mua khóa học"
                    name="tiepTucMuaKhoaHoc"
                  >
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
                            categoryGroupCode: "TiepTucMuaKhoaHoc",
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
                          form.setFieldValue(
                            "tiepTucMuaKhoaHocId",
                            current?.id
                          );
                          form.setFieldValue(
                            "tiepTucMuaKhoaHocName",
                            current?.name
                          );
                        } else {
                          form.setFieldValue("tiepTucMuaKhoaHocId", null);
                          form.setFieldValue("tiepTucMuaKhoaHocName", null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Trạng thái chăm sóc khách hàng"
                    name="status"
                  >
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
                            categoryGroupCode: "TrangThaiChamSocKhachHang",
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
                          form.setFieldValue("statusId", current?.id);
                          form.setFieldValue("statusName", current?.name);
                        } else {
                          form.setFieldValue("statusId", null);
                          form.setFieldValue("statusName", null);
                        }
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
