/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from 'react';
import { requestPOST, requestDOWNLOADFILE } from '@/utils/baseAPI';
import _ from 'lodash';

import ItemsList from './components/ItemsListDungThu';
import TDSelect from '@/app/components/TDSelect';
import { Select } from 'antd';

import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const ActivationCodePage = () => {
  const [dataSearch, setDataSearch] = useState(null);

  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  useEffect(() => {
    if (!(currentUser.type == 0 || currentUser.type == null)) {
      setDataSearch({ ...dataSearch, retailerId: currentUser.id });
    }

    return () => {};
  }, []);

  const [loadingExport, setLoadingExport] = useState(false);

  const handleExport = async () => {
    try {
      setLoadingExport(true);
      const res = await requestDOWNLOADFILE(`api/v1/supports/export-dung-thu`, _.assign({ type: 0, sapHetHan: true }, dataSearch));
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
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách dùng thử'}</h3>
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

export default ActivationCodePage;
