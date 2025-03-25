/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { DatePicker } from 'antd';

import { requestDOWNLOADFILE, requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

import ItemsList from './components/ItemsList';

const UsersPage = () => {
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  useEffect(() => {
    if (!(currentUser.type == 0 || currentUser.type == null || CheckRole(currentPermissions, ['Permissions.Supports.Manage']))) {
      setDataSearch({ ...dataSearch, userId: currentUser.id });
    }

    return () => {};
  }, []);

  const [dataSearch, setDataSearch] = useState(null);

  const [loadingExport, setLoadingExport] = useState(false);

  const handleExport = async () => {
    try {
      setLoadingExport(true);
      const res = await requestDOWNLOADFILE(`api/v1/supports/export`, _.assign({ type: 0, sapHetHan: true }, dataSearch));
      const fileData = new Blob([res.data], { type: 'application/vnd.ms-excel' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = 'KhachHangTuVan.xlsx';
      downloadLink.click();
      setLoadingExport(false);
    } catch (error) {
      console.log(error);
      setLoadingExport(false);
    }
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Khoá học sắp hết hạn'}</h3>
          <div className="card-toolbar">
            <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleExport}>
              <span>
                <i className="fas fa-print me-2"></i>
                <span className="">Xuất Excel</span>
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
            <span className="fw-bold w-100px">Khoá học:</span>
            <div className="ms-2 w-100">
              <TDSelect
                showSearch
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
                  height: 'auto',
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
            <span className="fw-bold w-100px">Trạng thái chăm sóc:</span>
            <div className="ms-2 w-100">
              <TDSelect
                showSearch
                reload={true}
                placeholder="Chọn trạng thái"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/categories/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    isActive: true,
                    categoryGroupCode: 'TrangThaiChamSocKhachHang',
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
                  height: 'auto',
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({ ...dataSearch, statusId: current?.id });
                  } else {
                    setDataSearch({ ...dataSearch, statusId: null });
                  }
                }}
              />
            </div>
          </div>
          {currentUser.type == 0 || currentUser.type == null || CheckRole(currentPermissions, ['Permissions.Supports.Manage']) ? (
            <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
              <span className="fw-bold w-100px">CTV/Đại lý:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  reload
                  showSearch
                  placeholder=""
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/users/search`, {
                      pageNumber: 1,
                      pageSize: 20,
                      keyword: keyword,
                      types: [4, 5],
                      isActive: true,
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
                      setDataSearch({ ...dataSearch, userId: current?.id });
                    } else {
                      setDataSearch({ ...dataSearch, userId: null });
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <></>
          )}
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
        </div>
        <ItemsList dataSearch={dataSearch} path="danh-sach-mua-khoa-hoc" type={0} saphethan={true} />
      </div>
    </>
  );
};

export default UsersPage;
