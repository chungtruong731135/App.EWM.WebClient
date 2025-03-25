import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Input, Spin } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as authHelper from "@/app/modules/auth/core/AuthHelpers";
import * as actionsModal from "@/setup/redux/modal/Actions";
import {
  requestGET,
  requestPOST_NEW,
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
      const res = await requestGET(`api/v1/notifications/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        // _data.createdOn = _data?.createdOn ? dayjs(_data?.createdOn) : null;

        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };
    if (id) {
      fetchData();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    /*  props.setDataModal(null);
    props.setModalVisible(false); */
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };

      if (body?.topics?.length > 0) {
        body.topics = body?.topics?.map((i) => i.value);
      } else {
        body.topics = null;
      }
      const res = await requestPOST_NEW(`api/v1/notifications/send`, body);
      if (res.status === 200) {
        toast.success("Cập nhật thành công!");
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
      size="lg"
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
              disabled={id ? true : false}
            >
              <div className="row">
                {id ? (
                  <>
                    <div className="col-xl-12">
                      <FormItem label="Thời gian gửi" name="createdOn">
                        <Input placeholder="" />
                      </FormItem>
                    </div>
                    <div className="col-xl-12">
                      <FormItem
                        label="Người nhận"
                        name="fullName"
                        rules={[
                          { required: true, message: "Không được để trống!" },
                        ]}
                      >
                        <Input placeholder="" />
                      </FormItem>
                    </div>
                  </>
                ) : (
                  <div className="col-xl-12">
                    <FormItem
                      label="Người nhận"
                      name="topics"
                      rules={[
                        { required: true, message: "Không được để trống!" },
                      ]}
                    >
                      <TDSelect
                        reload
                        showSearch
                        mode="multiple"
                        placeholder=""
                        fetchOptions={async (keyword) => {
                          const res = await requestPOST(`api/users/search`, {
                            pageNumber: 1,
                            pageSize: 20,
                            keyword,
                          });
                          return res?.data?.map((item) => ({
                            ...item,
                            label: `${item.fullName} (${item?.userName})`,
                            value: item.id,
                          }));
                        }}
                        style={{
                          width: "100%",
                          height: "auto",
                        }}
                      />
                    </FormItem>
                  </div>
                )}
                <div className="col-xl-12">
                  <FormItem
                    label="Tiêu đề"
                    name="title"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Nội dung" name="content">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Link" name="link">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="DeepLink" name="deepLink">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="DiscussionId" name="discussionId">
                    <Input placeholder="" />
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {id ? (
          <></>
        ) : (
          <div className="d-flex justify-content-center  align-items-center">
            <Button
              className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2"
              onClick={handleSubmit}
              disabled={btnLoading}
            >
              <i className="fa fa-save"></i>
              {"Tạo mới"}
            </Button>
          </div>
        )}
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
