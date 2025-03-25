import { useState } from 'react';
import { DatePicker } from 'antd';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';

const UsersPage = () => {
  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Nhật ký đăng nhập'}</h3>
          <div className="card-toolbar">
            <div className="btn-group mx-3 w-300px">
              <span className="fw-bold">Từ khoá:</span>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập từ khoá tìm kiếm"
                onChange={e => {
                  setDataSearch({ ...dataSearch, keyword: e.target.value });
                }}
              />
            </div>
            <div className="btn-group mx-3 w-300px">
              <span className="fw-bold">Tài khoản:</span>
              <TDSelect
                reload={true}
                showSearch
                placeholder="Tài khoản"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/users/search`, {
                    pageNumber: 1,
                    pageSize: 20,
                    keyword: keyword,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.fullName}`,
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
            <div className="btn-group mx-3 w-300px">
              <span className="fw-bold">Thời gian:</span>
              <DatePicker.RangePicker
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                onChange={(dates, dateStrings) => {
                  if (dates) {
                    setDataSearch({
                      ...dataSearch,
                      fromDate: dates[0],
                      toDate: dates[1],
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      fromDate: null,
                      toDate: null,
                    });
                  }
                }}
                allowClear={true}
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
