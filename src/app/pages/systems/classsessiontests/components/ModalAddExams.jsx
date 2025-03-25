import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form, Input, Select, Spin } from "antd";
import { Modal, Button } from "react-bootstrap";
import _ from "lodash";

import * as actionsModal from "@/setup/redux/modal/Actions";
import TDSelect from "@/app/components/TDSelect";
import ExamItemsList from "./ExamItemsList";
import { requestPOST } from "@/utils/baseAPI";

const ModalItem = (props) => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible, handleAddData } = props;
  const [form] = Form.useForm();
  const [dataSearch, setDataSearch] = useState(null);

  const [loadding, setLoadding] = useState(false);

  const handleCancel = () => {
    form.resetFields();

    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  return (
    <Modal
      show={modalVisible}
      fullscreen={true}
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Danh sách đề thi</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          <div className="card ">
            <div className="row g-5 my-2">
              <div className="col-xl-4 col-lg-6 px-5">
                <div className="btn-group me-2 w-100">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Nhập từ khoá tìm kiếm"
                    onChange={(e) => {
                      setDataSearch({
                        ...dataSearch,
                        keyword: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold w-100px">Kỳ thi:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    reload={true}
                    placeholder="Chọn kỳ thi"
                    fetchOptions={async (keyword) => {
                      const res = await requestPOST(`api/v1/examinats/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                        keyword: keyword,
                      });
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
                        setDataSearch({
                          ...dataSearch,
                          examinatId: current?.id,
                        });
                      } else {
                        setDataSearch({ ...dataSearch, examinatId: null });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold  w-100px">Khối lớp:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    reload
                    mode="multiple"
                    placeholder="Chọn khối lớp"
                    fetchOptions={async () => {
                      const res = await requestPOST(
                        `api/v1/categories/search`,
                        {
                          pageNumber: 1,
                          pageSize: 100,
                          categoryGroupCode: "KhoiLop",
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
                        setDataSearch({
                          ...dataSearch,
                          gradeIds: current?.map((i) => i?.id),
                        });
                      } else {
                        setDataSearch({ ...dataSearch, gradeIds: null });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold  w-100px">Cấp độ:</span>
                <div className="ms-2 w-100 ">
                  <TDSelect
                    reload={true}
                    showSearch
                    placeholder="Chọn cấp độ"
                    fetchOptions={async (keyword) => {
                      const res = await requestPOST(`api/v1/examareas/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                        keyword: keyword,
                      });
                      return res?.data?.map((item) => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: "100%",
                    }}
                    value={dataSearch?.examAreaId ?? null}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          examAreaId: current?.id,
                        });
                      } else {
                        setDataSearch({ ...dataSearch, examAreaId: null });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold  w-100px">Loại kỳ thi:</span>
                <div className="ms-2 w-100 ">
                  <Select
                    allowClear
                    placeholder="Chọn"
                    style={{ width: "100%" }}
                    options={[
                      {
                        value: 0,
                        label: "Đề luyện tập theo chương trình học",
                      },
                      {
                        value: 1,
                        label: "Đề thi thử",
                      },
                      {
                        value: 2,
                        label: "Đề kiểm tra kiến thức",
                      },
                      {
                        value: 3,
                        label: "Đề luyện thi, đánh giá (Hệ thống tạo tự động)",
                      },
                      {
                        value: 4,
                        label: "Đề luyện theo chuyên đề (Hệ thống tạo tự động)",
                      },
                    ]}
                    onChange={(value) => {
                      setDataSearch({
                        ...dataSearch,
                        type: value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <ExamItemsList
              dataSearch={dataSearch}
              handleAddData={handleAddData}
            />
          </div>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
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
