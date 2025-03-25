/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { DatePicker, Select } from 'antd';

import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';
import { CheckRole } from '@/utils/utils';
import { useAuth } from '@/app/modules/auth';

import ItemsList from './components/ItemsList';
import SelfActiveCourseModal from './components/SelfActiveCourseModal';
import ChiTietModalDungThu from './components/ChiTietModalDungThu';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const ActivationCodePage = () => {
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const [dataSearch, setDataSearch] = useState(null);

  const [modalActiveCourseVisible, setModalActiveCourseVisible] = useState(false);

  const [modalKichHoatDungThuVisible, setModalKichHoatDungThuVisible] = useState(false);

  //Permissions.Courses.Manage
  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Mã kích hoạt khoá học'}</h3>
          <div className="card-toolbar">
            <button
              className="btn btn-info btn-sm py-2 me-2 mt-2"
              onClick={() => {
                setModalActiveCourseVisible(true);
              }}
            >
              <span>
                <i className="fas fa-stamp me-2"></i>
                <span className="">Kích hoạt khoá học</span>
              </span>
            </button>
            {CheckRole(currentPermissions, ['Permissions.Courses.Manage']) && (
              <button
                className="btn btn-success btn-sm py-2 me-2 mt-2"
                onClick={() => {
                  setModalKichHoatDungThuVisible(true);
                }}
              >
                <span>
                  <i className="fas fa-plus me-2"></i>
                  <span className="">Kích hoạt dùng thử</span>
                </span>
              </button>
            )}
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
            <span className="fw-bold w-150px">Khoá học:</span>
            <div className="ms-2 w-100">
              <TDSelect
                reload={true}
                showSearch
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
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({ ...dataSearch, courseId: current?.id });
                  } else {
                    setDataSearch({ ...dataSearch, courseId: null });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Học sinh:</span>
            <div className="ms-2 w-100 ">
              <TDSelect
                reload
                showSearch
                placeholder="Lựa chọn học sinh"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/users/search`, {
                    pageNumber: 1,
                    pageSize: 20,
                    advancedSearch: {
                      fields: ['name'],
                      keyword: keyword || null,
                    },
                    isActive: true,
                    keyword: keyword,
                    type: 1,
                  });
                  return res.data.map(item => ({
                    ...item,
                    label: `${item.fullName} - ${item.userName}`,
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
                      studentId: current?.id,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      studentId: null,
                    });
                  }
                }}
                optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Trạng thái:</span>
            <div className="ms-2 w-100">
              <Select
                allowClear
                placeholder="Trạng thái"
                style={{ width: '100%' }}
                options={[
                  {
                    value: 0,
                    label: 'Chưa sử dụng',
                  },
                  {
                    value: 1,
                    label: 'Đã sử dụng',
                  },
                  {
                    value: 2,
                    label: 'Hết hạn',
                  },
                ]}
                onChange={value => {
                  setDataSearch({
                    ...dataSearch,
                    status: value,
                  });
                }}
              />
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Thời gian tạo từ:</span>
            <div className="ms-2 w-100 ">
              <DatePicker
                placeholder="Chọn thời gian"
                format={'DD/MM/YYYY'}
                onChange={(date, dateString) => {
                  setDataSearch({
                    ...dataSearch,
                    createdOnFrom: date,
                  });
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Thời gian tạo đến:</span>
            <div className="ms-2 w-100 ">
              <DatePicker
                placeholder="Chọn thời gian"
                format={'DD/MM/YYYY'}
                onChange={(date, dateString) => {
                  setDataSearch({
                    ...dataSearch,
                    createdOnTo: date,
                  });
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
              />
            </div>
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
      {modalActiveCourseVisible ? <SelfActiveCourseModal modalVisible={modalActiveCourseVisible} setModalVisible={setModalActiveCourseVisible} /> : <></>}
      {modalKichHoatDungThuVisible ? <ChiTietModalDungThu modalVisible={modalKichHoatDungThuVisible} setModalVisible={setModalKichHoatDungThuVisible} /> : <></>}
    </>
  );
};

export default ActivationCodePage;
