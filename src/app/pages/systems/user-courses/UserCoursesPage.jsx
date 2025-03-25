/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker, Form, Checkbox, Select } from 'antd';

import { requestPOST, requestDELETE, FILE_URL } from '@/utils/baseAPI';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import Collapse from 'react-bootstrap/Collapse';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const ActivationCodePage = () => {
  const [open, setOpen] = useState(false);

  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Khoá học đăng ký'}</h3>
          <div className="card-toolbar">
            <button className="btn btn-secondary btn-sm py-2 me-2 text-hover-primary" onClick={() => setOpen(!open)}>
              <span>
                <i className="fas fa-search me-2"></i>
                <span className="">Tìm kiếm nâng cao</span>
              </span>
            </button>
          </div>
        </div>
        <div className="row g-5 my-2">
          <div className="col-xl-3 col-lg-6 px-5">
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
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
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
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
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
          {/*  <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Loại thanh toán:</span>
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
                    buyType: value,
                  });
                }}
              />
            </div>
          </div> */}
        </div>
        <Collapse in={open}>
          <div className="row g-5 mt-1">
            {/* <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
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
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Thời gian đặt mua từ:</span>
              <div className="ms-2 w-100 ">
                <DatePicker
                  placeholder="Chọn thời gian"
                  format={'DD/MM/YYYY'}
                  onChange={(date, dateString) => {
                    setDataSearch({
                      ...dataSearch,
                      timeBuyFrom: date,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Thời gian đặt mua đến:</span>
              <div className="ms-2 w-100 ">
                <DatePicker
                  placeholder="Chọn thời gian"
                  format={'DD/MM/YYYY'}
                  onChange={(date, dateString) => {
                    setDataSearch({
                      ...dataSearch,
                      timeBuyTo: date,
                    });
                  }}
                />
              </div>
            </div>
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
          </div>
        </Collapse>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default ActivationCodePage;
