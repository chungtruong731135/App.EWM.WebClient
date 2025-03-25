/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'antd';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';

const ActivationCodePage = () => {
  const dispatch = useDispatch();

  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Mã khuyến mãi'}</h3>
          <div className="card-toolbar">
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(actionsModal.setDataModal({ ...null, readOnly: false }));
                dispatch(actionsModal.setModalVisible(true));
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
            <span className="fw-bold w-100px">Hình thức:</span>
            <div className="ms-2 w-100">
              <Select
                allowClear
                placeholder="Hình thức"
                style={{ width: '100%' }}
                options={[
                  {
                    value: 0,
                    label: 'Giảm theo %',
                  },
                  {
                    value: 1,
                    label: 'Giảm theo số tiền',
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
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default ActivationCodePage;
