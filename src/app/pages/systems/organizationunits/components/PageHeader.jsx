import React, { useState, useEffect, useRef } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { Form, Input } from "antd";
import { Dropdown, Menu } from "antd";

import Collapse from "react-bootstrap/Collapse";

import * as actionsModal from "@/setup/redux/modal/Actions";

const FormItem = Form.Item;

const PageHeader = (props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const { setDataSearch } = props;

  const TimKiem = () => {
    const formData = form.getFieldsValue(true);
    setDataSearch(formData);
  };

  return (
    <>
      <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
        <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
          {props?.title ?? ""}
        </h3>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-primary btn-sm m-btn m-btn--icon py-2 me-2"
            onClick={() => {
              dispatch(
                actionsModal.setModalOrganizationUnit({
                  modalVisible: true,
                  type: "themnhomcon",
                })
              );
            }}
          >
            <span>
              <i className="fas fa-plus  me-2"></i>
              <span className="">Thêm cơ cấu</span>
            </span>
          </button>
          <Dropdown
            trigger={"click"}
            menu={{
              items: [
                {
                  key: "nhap-khau",
                  disabled: false,
                  label: (
                    <span
                      className="e-1 p-2 text-dark"
                      onClick={() => {
                        /*  handleButton(`them-hop-dong`, data); */
                      }}
                    >
                      <i className={`fa fa-upload me-2`}></i>
                      {"Nhập khẩu"}
                    </span>
                  ),
                },
              ],
            }}
          >
            <button
              className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary"
              title="Thao tác nhanh"
            >
              <i className="fa fa-ellipsis-h"></i>
            </button>
          </Dropdown>
        </div>
      </div>
      <div>
        <Collapse in={open}>
          <div className="card card-body">
            <Form form={form} hideRequiredMark autoComplete="off">
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Từ khoá" name="keyword">
                    <Input placeholder="" />
                  </FormItem>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-12 col-lg-12 d-flex justify-content-center">
                  <button
                    className="btn btn-primary btn-sm m-btn m-btn--icon py-2 me-2"
                    onClick={TimKiem}
                  >
                    <span>
                      <i className="fas fa-search"></i>
                      <span className="">Tìm kiếm</span>
                    </span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm m-btn m-btn--icon py-2 me-2"
                    onClick={() => {
                      form.resetFields();
                      TimKiem();
                    }}
                  >
                    <span>
                      <i className="fas fa-sync"></i>
                      <span className="">Tải lại</span>
                    </span>
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </Collapse>
      </div>
    </>
  );
};

export default PageHeader;
