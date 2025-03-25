/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { DatePicker, Checkbox, Select } from 'antd';

import { requestPOST } from '@/utils/baseAPI';
import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import Collapse from 'react-bootstrap/Collapse';
import { toast } from 'react-toastify';
import TDSelect from '@/app/components/TDSelect';

const ActivationCodePage = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const [dataSearch, setDataSearch] = useState(null);

  const DongBoDuLieu = async () => {
    var resZalo = await requestPOST(`api/v1/examregistrations/import`, {
      SpreadsheetId: '1kHgEXEQZ1-wfFMTUPEUsHstZcIqm2qXYtw28-KAVs1Q',
      SheetName: 'Đăng ký IKMC 2025',
    });
    if (resZalo) {
      toast.success('Thao tác thành công!');
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách đăng ký dự thi'}</h3>
          <div className="card-toolbar">
            <button className="btn btn-secondary btn-sm py-2 me-2 text-hover-primary" onClick={() => setOpen(!open)}>
              <span>
                <i className="fas fa-search me-2"></i>
                <span className="">Tìm kiếm nâng cao</span>
              </span>
            </button>
            <button className="btn btn-primary btn-sm py-2 me-2" onClick={DongBoDuLieu}>
              <span>
                <i className="fas fa-sync me-2"></i>
                <span className="">Đồng bộ dữ liệu</span>
              </span>
            </button>
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(actionsModal.setDataModal({ ...null, readOnly: false }));
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
          </div>
        </div>
        <div className="row g-5 my-2">
          <div className="col-xl-4 col-lg-6 px-5 align-items-center d-flex">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nhập từ khoá tìm kiếm"
              onChange={e => {
                setDataSearch({
                  ...dataSearch,
                  keyword: e.target.value,
                });
              }}
            />
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3">Gửi thông tin cho khách hàng:</span>
            <Select
              className="flex-grow-1"
              placeholder="Gửi thông tin cho khách hàng"
              allowClear
              options={[
                { value: -1, label: 'Toàn bộ' },
                { value: 1, label: 'Đã gửi' },
                { value: 0, label: 'Chưa gửi' },
              ]}
              onChange={(value, current) => {
                if (value != undefined) {
                  setDataSearch({
                    ...dataSearch,
                    status: value,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    status: null,
                  });
                }
              }}
            />
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3">Chuyển thông tin cho BTC:</span>
            <Select
              className="flex-grow-1"
              placeholder="Chuyển thông tin cho BTC"
              allowClear
              options={[
                { value: -1, label: 'Toàn bộ' },
                { value: 1, label: 'Đã chuyển' },
                { value: 0, label: 'Chưa chuyển' },
              ]}
              onChange={(value, current) => {
                if (value != undefined) {
                  setDataSearch({
                    ...dataSearch,
                    infoTransferredToOrganizers: value,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    infoTransferredToOrganizers: null,
                  });
                }
              }}
            />
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3">Thêm nhóm Zalo:</span>
            <Select
              className="flex-grow-1"
              placeholder="Thêm nhóm Zalo"
              allowClear
              options={[
                { value: -1, label: 'Toàn bộ' },
                { value: 1, label: 'Đã thêm' },
                { value: 0, label: 'Chưa thêm' },
              ]}
              onChange={(value, current) => {
                if (value != undefined) {
                  setDataSearch({
                    ...dataSearch,
                    addedToSupportGroup: value,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    addedToSupportGroup: null,
                  });
                }
              }}
            />
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3">Tình trạng đối soát:</span>
            <Select
              className="flex-grow-1"
              placeholder="Tình trạng đối soát"
              allowClear
              options={[
                { value: -1, label: 'Toàn bộ' },
                { value: 1, label: 'Đã đối soát' },
                { value: 0, label: 'Chưa đối soát' },
              ]}
              onChange={(value, current) => {
                if (value != undefined) {
                  setDataSearch({
                    ...dataSearch,
                    reconciliationStatus: value,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    reconciliationStatus: null,
                  });
                }
              }}
            />
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3">Kỳ thi:</span>
            <TDSelect
              reload
              placeholder="Chọn"
              fetchOptions={async keyword => {
                const res = await requestPOST(`api/public/v1/examregistrations/list-categories`, {
                  pageNumber: 1,
                  pageSize: 100,
                  groupBy: 'ExamName',
                });
                return res.data.map(item => ({
                  ...item,
                  label: item?.name,
                  value: item?.name,
                }));
              }}
              className="flex-grow-1"
              onChange={(value, current) => {
                if (value) {
                  setDataSearch({
                    ...dataSearch,
                    examName: current?.value,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    examName: null,
                  });
                }
              }}
            />
          </div>
        </div>
        <Collapse in={open}>
          <div className="row g-5 mt-1">
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5 d-flex">
              <span className="fw-bold me-3 ">Thời gian đăng ký từ:</span>
              <div className="ms-2 flex-grow-1">
                <DatePicker
                  placeholder="Chọn thời gian"
                  format={'DD/MM/YYYY'}
                  onChange={(date, dateString) => {
                    setDataSearch({
                      ...dataSearch,
                      dateOfRegistrationFrom: date,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5  d-flex">
              <span className="fw-bold me-3">Thời gian đăng ký đến:</span>
              <div className="ms-2 flex-grow-1">
                <DatePicker
                  placeholder="Chọn thời gian"
                  format={'DD/MM/YYYY'}
                  onChange={(date, dateString) => {
                    setDataSearch({
                      ...dataSearch,
                      dateOfRegistrationTo: date,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5 d-flex ">
              <span className="fw-bold me-3">Kỳ thi:</span>
              <TDSelect
                className="flex-grow-1"
                reload
                placeholder="Chọn"
                fetchOptions={async () => {
                  const res = await requestPOST(`api/public/v1/examregistrations/list-categories`, {
                    pageNumber: 1,
                    pageSize: 100,
                    groupBy: 'ExamName',
                  });
                  return res.data.map(item => ({
                    ...item,
                    label: item?.name,
                    value: item?.name,
                  }));
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      examName: current?.name,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      examName: null,
                    });
                  }
                }}
              />
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5 d-flex ">
              <span className="fw-bold me-3">Khối:</span>
              <TDSelect
                className="flex-grow-1"
                reload
                placeholder="Chọn"
                fetchOptions={async () => {
                  const res = await requestPOST(`api/public/v1/examregistrations/list-categories`, {
                    pageNumber: 1,
                    pageSize: 100,
                    groupBy: 'GradeRegistered',
                  });
                  return res.data.map(item => ({
                    ...item,
                    label: item?.name,
                    value: item?.name,
                  }));
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      gradeRegistered: current?.name,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      gradeRegistered: null,
                    });
                  }
                }}
              />
            </div>
          </div>
        </Collapse>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default ActivationCodePage;
