import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Form, Input } from "antd";
import Collapse from "react-bootstrap/Collapse";

import * as actionsModal from "@/setup/redux/modal/Actions";

const FormItem = Form.Item;

const PageHeader = (props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    form.resetFields();
    dispatch(actionsModal.setDataSearch(null));
    return () => {};
  }, []);

  const TimKiem = () => {
    const formData = form.getFieldsValue(true);
    dispatch(actionsModal.setDataSearch(formData));
  };

  return (
    <>
      <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
        <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
          {props?.title ?? ""}
        </h3>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-secondary btn-sm m-btn m-btn--icon py-2 me-2"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span>
              <i className="fas fa-search"></i>
              <span className="">Tìm kiếm</span>
            </span>
          </button>
          <button
            className="btn btn-primary btn-sm m-btn m-btn--icon py-2 me-2"
            onClick={() => {
              dispatch(actionsModal.setDataModal(null));
              dispatch(actionsModal.setModalVisible(true));
            }}
          >
            <span>
              <i className="fas fa-plus  me-2"></i>
              <span className="">Thêm mới</span>
            </span>
          </button>
        </div>
      </div>
      <div>
        <Collapse in={open}>
          <div className="card card-body">
            <Form form={form} autoComplete="off">
              <div className="row">
                <div className="col-xl-6 col-lg-6">
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
                      dispatch(actionsModal.setDataSearch(null));
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
