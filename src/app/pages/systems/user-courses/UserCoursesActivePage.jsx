/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker, Checkbox, Select } from 'antd';

import { requestPOST } from '@/utils/baseAPI';

import ItemsList from './components/ItemsActiveList';
import TDSelect from '@/app/components/TDSelect';
import Collapse from 'react-bootstrap/Collapse';
import * as actions from '@/setup/redux/modal/Actions';

import ChiTietModal from './components/ChiTietModal';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const ActivationCodePage = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Khoá học đã thanh toán'}</h3>
          <div className="card-toolbar">
            <button className="btn btn-secondary btn-sm py-2 me-2 text-hover-primary" onClick={() => setOpen(!open)}>
              <span>
                <i className="fas fa-search me-2"></i>
                <span className="">Tìm kiếm nâng cao</span>
              </span>
            </button>
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(actions.setModalVisible(true));
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
          {/* <div className="col-xl-3 col-lg-6 px-5">
            <div className="btn-group me-2 w-100">
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
          </div> */}
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold w-150px">Học sinh:</span>
            <div className="ms-2 w-100">
              <TDSelect
                showSearch={true}
                reload={true}
                placeholder="Chọn học sinh"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/users/search`, {
                    pageNumber: 1,
                    pageSize: 20,
                    type: 1,
                    keyword: keyword,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item?.fullName} (${item?.userName})`,
                    value: item?.id,
                  }));
                }}
                style={{
                  width: '100%',
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      userId: current?.id,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      userId: null,
                    });
                  }
                }}
                optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
              />
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Khoá học:</span>
            <div className="ms-2 w-100">
              <TDSelect
                showSearch={true}
                reload={true}
                placeholder="Chọn khoá học"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/courses/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    keyword: keyword,
                    type: 3,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.title}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: '100%',
                }}
                value={dataSearch?.courseId ?? null}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      courseId: current?.id,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      courseId: null,
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Nguồn:</span>
            <div className="ms-2 w-100">
              <TDSelect
                reload={true}
                showSearch
                placeholder=""
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/categories/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    isActive: true,
                    categoryGroupCode: 'LoaiKichHoat',
                    keyword: keyword,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.name}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: '100%',
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      userTypeId: current?.id,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      userTypeId: null,
                    });
                  }
                }}
              />
            </div>
          </div>
          {/*  <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Loại kích hoạt:</span>
            <div className="ms-2 w-100 ">
              <Select
                allowClear
                placeholder="Loại thanh toán"
                style={{ width: "100%" }}
                options={[
                  {
                    value: 0,
                    label: "Toàn bộ",
                  },
                  {
                    value: 1,
                    label: "Chương trình học",
                  },
                  {
                    value: 2,
                    label: "Luyện đề thi",
                  },
                ]}
                onChange={(value) => {
                  setDataSearch({
                    ...dataSearch,
                    activeType: value,
                  });
                }}
              />
            </div>
          </div> */}
        </div>
        <Collapse in={open}>
          <div className="row g-5 mt-1 mb-3">
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Thời gian kích hoạt từ:</span>
              <div className="ms-2 w-100 ">
                <DatePicker
                  placeholder="Chọn thời gian"
                  format={'DD/MM/YYYY'}
                  onChange={(date, dateString) => {
                    setDataSearch({
                      ...dataSearch,
                      timeConfirmFrom: date,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Thời gian kích hoạt đến:</span>
              <div className="ms-2 w-100 ">
                <DatePicker
                  placeholder="Chọn thời gian"
                  format={'DD/MM/YYYY'}
                  onChange={(date, dateString) => {
                    setDataSearch({
                      ...dataSearch,
                      timeConfirmTo: date,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <Checkbox
                onChange={e => {
                  setDataSearch({
                    ...dataSearch,
                    isSpecial: e.target.checked,
                  });
                }}
              >
                <span className="fw-semibold">Là trường hợp đặc biệt</span>
              </Checkbox>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <Checkbox
                onChange={e => {
                  setDataSearch({
                    ...dataSearch,
                    isActiveByCode: e.target.checked,
                  });
                }}
              >
                <span className="fw-semibold">Kích hoạt qua mã</span>
              </Checkbox>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Trạng thái nhận tiền:</span>
              <div className="ms-2 w-100">
                <Select
                  allowClear
                  placeholder="Trạng thái"
                  style={{ width: '100%' }}
                  options={[
                    {
                      value: 1,
                      label: 'Đã nhận tiền',
                    },
                    {
                      value: 0,
                      label: 'Chưa nhận tiền',
                    },
                  ]}
                  onChange={value => {
                    setDataSearch({
                      ...dataSearch,
                      paymentStatus: value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold w-150px">CTV/Đại lý:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  showSearch={true}
                  reload={true}
                  placeholder="Chọn CTV/Đại lý"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/users/search`, {
                      pageNumber: 1,
                      pageSize: 20,
                      types: [4, 5],
                      isActive: true,
                      keyword: keyword,
                    });
                    return res?.data?.map(item => ({
                      ...item,
                      label: `${item?.fullName} (${item?.userName})`,
                      value: item?.id,
                    }));
                  }}
                  style={{
                    width: '100%',
                  }}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        agentId: current?.id,
                      });
                    } else {
                      setDataSearch({
                        ...dataSearch,
                        agentId: null,
                      });
                    }
                  }}
                  optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
                />
              </div>
            </div>
          </div>
        </Collapse>
        <ItemsList dataSearch={dataSearch} />
      </div>
      {<ChiTietModal />}
    </>
  );
};

export default ActivationCodePage;
