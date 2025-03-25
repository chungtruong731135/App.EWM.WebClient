import React, { useState, useEffect, useRef } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";

import { Form, Input, Select, Spin, TreeSelect } from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _ from "lodash";

import * as actionsModal from "@/setup/redux/modal/Actions";
import {
  requestPOST,
  requestGET,
  requestPUT_NEW,
  requestPOST_NEW,
} from "@/utils/baseAPI";

const FormItem = Form.Item;

const { TextArea } = Input;
const { Option } = Select;

const levels = [
  { id: 0, name: "Quốc gia" },
  { id: 1, name: "Tỉnh/Thành phố trực thuộc TW" },
  { id: 2, name: "Quận/Huyện" },
  { id: 3, name: "Phường/Xã" },
];

const types = [
  { id: "Quốc gia", name: "Quốc gia" },
  { id: "Thành phố Trung ương", name: "Thành phố Trung ương" },
  { id: "Tỉnh", name: "Tỉnh" },
  { id: "Thành phố", name: "Thành phố" },
  { id: "Quận", name: "Quận" },
  { id: "Huyện", name: "Huyện" },
  { id: "Thị xã", name: "Thị xã" },
  { id: "Phường", name: "Phường" },
  { id: "Xã", name: "Xã" },
  { id: "Thị trấn", name: "Thị trấn" },
];

const ModalItem = (props) => {
  const dispatch = useDispatch();
  const dataModal = useSelector((state) => state.modal.dataModal);
  const modalVisible = useSelector((state) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [value, setValue] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const onChange = (newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchDonVi = async () => {
      try {
        const res = await requestPOST(`api/v1/locations/search`, {
          pageNumber: 1,
          pageSize: 100000,
          orderBy: ["name"],
        });

        const nest = (items, id = null, link = "parentCode") =>
          items
            .filter((item) => item[link] === id)
            .map((item) => ({
              ...item,
              title: item.nameWithType,
              key: item.code,
              value: item.code,
              children: nest(items, item.code),
            }));
        let tmp = nest(res?.data ?? []);
        setTreeData(tmp);
      } catch (error) {}
    };
    const fetchData = async () => {
      setLoadding(true);
      try {
        const res = await requestPOST(`api/v1/locations/search`, {
          pageNumber: 1,
          pageSize: 100000,
          orderBy: ["name"],
        });

        const nest = (items, id = null, link = "parentCode") =>
          items
            .filter((item) => item[link] === id)
            .map((item) => ({
              ...item,
              title: item.nameWithType,
              key: item.code,
              value: item.code,
              children: nest(items, item.code),
            }));
        let tmp = nest(res?.data ?? []);
        setTreeData(tmp);
      } catch (error) {}

      const res = await requestGET(`api/v1/locations/${id}`);

      if (res && res.data) {
        form.setFieldsValue(res.data);
        setValue(res.data?.parentCode ?? null);
      }
      setLoadding(false);
    };
    if (id) {
      fetchData();
    } else {
      fetchDonVi();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    setButtonLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      formData.parentCode = value;

      const res = id
        ? await requestPUT_NEW(`api/v1/locations/${id}`, formData)
        : await requestPOST_NEW(`api/v1/locations`, formData);
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
        console.log(final_arr);
        toast.error("Thất bại, vui lòng thử lại! " + final_arr.join(" "));
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
    setButtonLoading(false);
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
                  <FormItem
                    label="Mã"
                    name="code"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Địa bàn cha" /* name='parentCode' */>
                    <TreeSelect
                      allowClear
                      style={{ width: "100%" }}
                      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                      treeData={treeData}
                      placeholder="Lựa chọn nhóm"
                      value={value}
                      onChange={onChange}
                    />
                  </FormItem>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Loại"
                    name="level"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Loại"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {levels.map((item) => {
                        return (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại địa bàn cụ thể" name="type">
                    <Select
                      showSearch
                      placeholder=""
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {types.map((item) => {
                        return (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                </div>
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
            onClick={onFinish}
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
