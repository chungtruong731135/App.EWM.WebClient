/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { DatePicker } from 'antd';
import { useParams } from 'react-router-dom';

import ItemsList from './LoginLogItemsList';

const ActivationCodePage = () => {
  const { userId } = useParams();

  const [dataSearch, setDataSearch] = useState({ userId: userId });

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Nhật ký đăng nhập'}</h3>
          <div className="card-toolbar">
            <div className="btn-group mx-3 w-500px">
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

export default ActivationCodePage;
