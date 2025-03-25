import React, { useState, useEffect, useRef } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";

import {
  Form,
  Input,
  Select,
  Spin,
  DatePicker,
  InputNumber,
  Checkbox,
  TreeSelect,
} from "antd";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";

import * as actionsModal from "@/setup/redux/modal/Actions";
import {
  requestPOST,
  requestGET,
  requestPUT,
  API_URL,
  FILE_URL,
} from "@/utils/baseAPI";
import { handleImage } from "@/utils/utils";
import TDSelect from "@/app/components/TDSelect";

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = (props) => {
  const dispatch = useDispatch();

  /* const dataModal = useSelector((state) => state.modal.dataModal); */
  const dataModal = useSelector((state) => state.modal.currentOrganizationUnit);
  const dataModalChiTiet = useSelector((state) => state.modal.dataModal);

  const modalOrganizationUnit = useSelector(
    (state) => state.modal.modalOrganizationUnit
  );

  const id =
    modalOrganizationUnit?.type == "suanhom"
      ? dataModal?.id ?? null
      : modalOrganizationUnit?.type == "chitiet"
      ? dataModalChiTiet?.id ?? null
      : null;
  const parentId =
    modalOrganizationUnit?.type == "themnhomcon" ? dataModal?.id ?? null : null;

  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [file, setFile] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [value, setValue] = useState(null);

  const [currentParentId, setCurrentParentId] = useState(null);

  const onChange = (newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(`api/v1/organizationunits/search`, {
          advancedSearch: {
            fields: ["name", "code"],
            keyword: null,
          },
          pageNumber: 1,
          pageSize: 100000,
          orderBy: ["name"],
        });

        const nest = (items, id = null, link = "parentId") =>
          items
            .filter((item) => item[link] === id)
            .map((item) => ({
              ...item,
              title: item.name,
              key: item.code,
              value: item.id,
              children: nest(items, item.id),
            }));
        let tmp = nest(res?.data ?? []);
        setTreeData(tmp);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();

    return () => {};
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/organizationunits/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.organizationUnitType = _data?.organizationUnitType
          ? {
              ..._data?.organizationUnitType,
              value: _data?.organizationUnitType?.id ?? null,
              label: `${_data?.organizationUnitType?.name ?? ""}` ?? null,
            }
          : null;

        setCurrentParentId(_data?.parentId);

        form.setFieldsValue(_data);
      }
      setLoading(false);
    };
    if (id) {
      fetchData();
    } else {
      form.setFieldsValue({ parentId: parentId });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    /*  props.setDataModal(null);
    props.setModalVisible(false); */
    dispatch(
      actionsModal.setModalOrganizationUnit({ modalVisible: false, type: null })
    );
  };

  const onFinish = async () => {
    const values = await form.validateFields();

    try {
      let arrFile = [];
      file.forEach((i) => {
        if (i.response) {
          arrFile.push(i.response.data[0].url);
        } else {
          arrFile.push(i.path);
        }
      });
      form.setFieldsValue({ file: arrFile.join("##") });
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      const res = id
        ? await requestPUT(`api/v1/organizationunits/${id}`, formData)
        : await requestPOST(`api/v1/organizationunits`, formData);
      if (res) {
        toast.success("Cập nhật thành công!");
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        toast.error("Thất bại, vui lòng thử lại!");
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };

  return (
    <Modal
      show={modalOrganizationUnit?.modalVisible}
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
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Tên đơn vị"
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
                    label="Mã đơn vị"
                    name="code"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tên viết tắt" name="shortcutName">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thứ tự" name="sortOrder">
                    <InputNumber
                      placeholder=""
                      style={{ width: "100%" }}
                      min={0}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Thuộc đơn vị"
                    name="parentId"
                    rules={[
                      {
                        required: !(!currentParentId && id),
                        message: "Không được để trống!",
                      },
                    ]}
                  >
                    <TreeSelect
                      disabled={!currentParentId && id}
                      allowClear
                      style={{ width: "100%" }}
                      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                      treeData={treeData}
                      placeholder="Lựa chọn nhóm"
                      /* value={value}
                      onChange={onChange} */
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Cấp tổ chức"
                    name="organizationUnitType"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <TDSelect
                      disabled={!currentParentId && id}
                      reload={true}
                      placeholder=""
                      fetchOptions={async (keyword) => {
                        const res = await requestPOST(
                          `api/v1/organizationunittypes/search`,
                          {
                            pageNumber: 1,
                            pageSize: 1000,
                            orderBy: ["name "],
                          }
                        );
                        return res.data.map((item) => ({
                          ...item,
                          label: `${item?.name ?? ""}`,
                          value: item.id,
                        }));
                      }}
                      style={{
                        width: "100%",
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue(
                            "organizationUnitTypeId",
                            current?.id
                          );
                        } else {
                          form.setFieldValue("organizationUnitTypeId", null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Địa chỉ" name="address">
                    <Input placeholder="" />
                  </FormItem>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <label for="description" className="" title="Mô tả">
                    Lĩnh vực hoạt động
                  </label>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isProduce" valuePropName="checked">
                    <Checkbox>Sản xuất</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isBusiness" valuePropName="checked">
                    <Checkbox>Kinh doanh</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isSupport" valuePropName="checked">
                    <Checkbox>Hỗ trợ</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isOffice" valuePropName="checked">
                    <Checkbox>Văn phòng</Checkbox>
                  </FormItem>
                </div>
              </div>
              {/*  <div className='row'>
                <div className='col-xl-6 col-lg-6'>
                  <FormItem label='Trưởng đơn vị' name='leaders'>
                    <Select
                      allowClear
                      showSearch
                      placeholder='Trưởng đơn vị'
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {organizationUnitTypes.map((item) => {
                        return (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                </div>
              </div> */}
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Chức năng nhiệm vụ" name="mainTask">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
              </div>
              <div className="row">
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
            className="btn-sm btn-primary rounded-1 p-2  ms-2"
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
