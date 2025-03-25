/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';

import ItemsList from './components/ItemsList';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const ActivationCodePage = () => {
  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Lịch sử kích hoạt'}</h3>
          <div className="card-toolbar">
            {/* <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({ ...null, readOnly: false })
                );
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button> */}
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
            <span className="fw-bold w-100px">Học sinh:</span>
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
            <span className="fw-bold  w-100px">Khoá học:</span>
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
                    label: `${item?.title}`,
                    value: item?.id,
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
            <span className="fw-bold  w-150px">Ngày kích hoạt từ:</span>
            <div className="ms-2 w-100 ">
              <DatePicker
                format={'DD/MM/YYYY'}
                style={{ width: '100%' }}
                onChange={(date, dateString) => {
                  setDataSearch({
                    ...dataSearch,
                    activedOnFrom: date,
                  });
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Ngày kích hoạt đến:</span>
            <div className="ms-2 w-100 ">
              <DatePicker
                format={'DD/MM/YYYY'}
                style={{ width: '100%' }}
                onChange={(date, dateString) => {
                  setDataSearch({
                    ...dataSearch,
                    activedOnTo: date,
                  });
                }}
                disabledDate={d => d.isBefore(dayjs(dataSearch?.createdOnFrom))}
              />
            </div>
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default ActivationCodePage;
