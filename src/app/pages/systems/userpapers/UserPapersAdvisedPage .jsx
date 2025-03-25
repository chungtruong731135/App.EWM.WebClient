/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';

import ItemsList from './components/ItemsAvisedList';
import { requestDOWNLOADFILE, requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import { useAuth } from '@/app/modules/auth';
import { Select } from 'antd';
import _ from 'lodash';

const UsersPage = props => {
  const { currentUser } = useAuth();

  const [dataSearch, setDataSearch] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);

  const handleExport = async () => {
    try {
      setLoadingExport(true);
      const res = await requestDOWNLOADFILE(`api/v1/userpapers/export`, _.assign({ advisedBy: currentUser?.id }, dataSearch));
      const fileData = new Blob([res.data], { type: 'application/vnd.ms-excel' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = 'KhachHangTuVanChoXuLy.xlsx';
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
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{props?.isSale ? 'Khách hàng đăng ký tư vấn' : 'Khách hàng đăng ký tư vấn chờ xử lý'}</h3>
          <div className="card-toolbar">
   {/*          <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleExport}>
              <span>
                <i className="fas fa-print me-2"></i>
                <span className="">Xuất Excel</span>
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
            <span className="fw-bold w-100px">Loại tư vấn:</span>
            <div className="ms-2 w-100">
              <TDSelect
                allowClear
                reload={true}
                placeholder="Chọn Loại tư vấn"
                fetchOptions={async () => {
                  const res = await requestPOST(`api/v1/userpapers/list-paper-type`, {});
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.name}`,
                    value: item.name,
                  }));
                }}
                style={{
                  width: '100%',
                  height: 'auto',
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({ ...dataSearch, userPaperType: current?.name });
                  } else {
                    setDataSearch({ ...dataSearch, userPaperType: null });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold w-100px">Trạng thái:</span>
            <div className="ms-2 w-100">
              <Select
                allowClear
                placeholder="Chọn"
                style={{ width: '100%' }}
                options={[
                  {
                    value: -1,
                    label: 'Chờ tư vấn',
                  },
                  {
                    value: 0,
                    label: 'Đã chuyển tư vấn',
                  },
                  {
                    value: 1,
                    label: 'Đã tư vấn',
                  },
                  {
                    value: 2,
                    label: 'Đang tư vấn',
                  },
                ]}
                onChange={(value, current) => {
                  if (value != null) {
                    console.log('vao');
                    setDataSearch({
                      ...dataSearch,
                      status: current?.value,
                    });
                  } else {
                    setDataSearch({ ...dataSearch, status: null });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
