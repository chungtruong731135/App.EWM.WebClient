/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { DatePicker, Select } from 'antd';
import Collapse from 'react-bootstrap/Collapse';
import dayjs from 'dayjs';

import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';

import ItemsList from './components/ItemsList';
import ModalNew from './components/ModalNew';
import ActiveCourseModal from './components/ActiveCourseModal';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const ActivationCodePage = () => {
  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalActiveCourseVisible, setModalActiveCourseVisible] = useState(false);

  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Quản lý mã kích hoạt khoá học'}</h3>
          <div className="card-toolbar">
            <button className="btn btn-secondary btn-sm py-2 me-2 text-hover-primary" onClick={() => setOpen(!open)}>
              <span>
                <i className="fas fa-search me-2"></i>
                <span className="">Tìm kiếm nâng cao</span>
              </span>
            </button>
            <button
              className="btn btn-info btn-sm py-2 me-2"
              onClick={() => {
                setModalActiveCourseVisible(true);
              }}
            >
              <span>
                <i className="fas fa-stamp me-2"></i>
                <span className="">Kích hoạt khoá học</span>
              </span>
            </button>
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                setModalVisible(true);
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
          <div className="col-xl-3 col-lg-6 px-5">
            <div className="btn-group me-2 w-100">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập mã kích hoạt cần tìm"
                onChange={e => {
                  setDataSearch({
                    ...dataSearch,
                    keyword: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          {/* <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">CTV/Đại lý:</span>
            <div className="ms-2 w-100 ">
              <Select
                allowClear
                placeholder="Chọn"
                style={{ width: '100%' }}
                options={[
                  {
                    value: 4,
                    label: 'Cộng tác viên',
                  },
                  {
                    value: 5,
                    label: 'Đại lý',
                  },
                ]}
                onChange={value => {
                  setDataSearch({
                    ...dataSearch,
                    userType: value,
                  });
                }}
              />
            </div>
          </div> */}
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Tài khoản CTV/Đại lý:</span>
            <div className="ms-2 w-100 ">
              <TDSelect
                reload
                showSearch
                placeholder="Chọn"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/users/search`, {
                    pageNumber: 1,
                    pageSize: 20,
                    advancedSearch: {
                      fields: ['name'],
                      keyword: keyword || null,
                    },
                    isActive: true,
                    keyword: keyword,
                    type: dataSearch?.userType ?? null,
                    types: dataSearch?.userType != null ? null : [4, 5],
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
            <span className="fw-bold  w-150px">Trạng thái sử dụng:</span>
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
        </div>
        <Collapse in={open}>
          <div className="row g-5 mt-1">
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Ngày tạo từ:</span>
              <div className="ms-2 w-100 ">
                <DatePicker
                  format={'DD/MM/YYYY'}
                  style={{ width: '100%' }}
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
              <span className="fw-bold  w-150px">Ngày tạo đến:</span>
              <div className="ms-2 w-100 ">
                <DatePicker
                  format={'DD/MM/YYYY'}
                  style={{ width: '100%' }}
                  onChange={(date, dateString) => {
                    setDataSearch({
                      ...dataSearch,
                      createdOnTo: date,
                    });
                  }}
                  disabledDate={d => d.isBefore(dayjs(dataSearch?.createdOnFrom))}
                />
              </div>
            </div>

            {/* <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold w-150px">Hình thức:</span>
              <div className="ms-2 w-100">
                <Select
                  allowClear
                  placeholder="Hình thức"
                  style={{ width: '100%' }}
                  options={[
                    {
                      value: 0,
                      label: 'Trả trước',
                    },
                    {
                      value: 1,
                      label: 'Trả sau',
                    },
                  ]}
                  onChange={value => {
                    setDataSearch({
                      ...dataSearch,
                      type: value,
                    });
                  }}
                />
              </div>
            </div> */}

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
                  disabledDate={d => d.isBefore(dayjs(dataSearch?.activedOnFrom))}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Loại khoá học:</span>
              <div className="ms-2 w-100 ">
                <Select
                  allowClear
                  placeholder="Chọn"
                  style={{ width: '100%' }}
                  options={[
                    {
                      value: 0,
                      label: 'Khoá học offline',
                    },
                    {
                      value: 1,
                      label: 'Khoá học online',
                    },
                  ]}
                  onChange={value => {
                    setDataSearch({
                      ...dataSearch,
                      courseType: value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-150px">Khoá học:</span>
              <div className="ms-2 w-100 ">
                <TDSelect
                  reload
                  showSearch
                  placeholder="Chọn"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/courses/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      keyword: keyword,
                      type: dataSearch?.courseType ?? 3,
                    });
                    return res.data.map(item => ({
                      ...item,
                      label: item?.title,
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
              <span className="fw-bold  w-150px">Nguồn khách hàng:</span>
              <div className="ms-2 w-100 ">
                <TDSelect
                  reload
                  showSearch
                  placeholder="Chọn"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/categories/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      keyword: keyword,
                      categoryGroupCode: 'LoaiKichHoat',
                      isActive: true,
                    });
                    return res.data.map(item => ({
                      ...item,
                      label: item?.name,
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
          </div>
        </Collapse>
        <ItemsList dataSearch={dataSearch} />
        {modalVisible ? <ModalNew modalVisible={modalVisible} setModalVisible={setModalVisible} /> : <></>}
        {modalActiveCourseVisible ? <ActiveCourseModal modalVisible={modalActiveCourseVisible} setModalVisible={setModalActiveCourseVisible} /> : <></>}
      </div>
    </>
  );
};

export default ActivationCodePage;
