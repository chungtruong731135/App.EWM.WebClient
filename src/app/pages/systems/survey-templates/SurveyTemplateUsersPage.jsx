/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import ItemsList from './components/ListNguoiThamGiaKhaoSat';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { Select } from 'antd';
import TDSelect from '@/app/components/TDSelect';

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { surveyTemplateId } = useParams();

  const [dataSearch, setDataSearch] = useState({ surveyTemplateId: surveyTemplateId });
  const [dataCourse, setDataCourse] = useState(null);

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/surveytemplates/${id}`);
      setDataCourse(res?.data ?? null);
    };
    if (surveyTemplateId) {
      fetchData(surveyTemplateId);
    }
  }, [surveyTemplateId]);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fa fa-arrow-left fs-2 text-gray-600"></i>
            </a>
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách người tham gia khảo sát ' + (dataCourse?.name ?? '')}</h3>
          </div>
          <div className="card-toolbar"></div>
        </div>
        <div className="row g-5 my-2">
          <div className="col-xl-4 col-lg-6 px-5 align-items-center d-flex">
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
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3 flex-grow-1 w-150px">Đợt khảo sát:</span>
            <TDSelect
              className="flex-grow-1"
              showSearch={true}
              reload={true}
              placeholder="Chọn đợt khảo sát"
              fetchOptions={async keyword => {
                const res = await requestPOST(`api/v1/surveys/search`, {
                  pageNumber: 1,
                  pageSize: 100,
                  keyword: keyword,
                  surveyTemplateId: surveyTemplateId,
                });
                return res?.data?.map(item => ({
                  ...item,
                  label: `${item.name}`,
                  value: item.id,
                }));
              }}
              style={{
                width: '100%',
              }}
              value={dataSearch?.surveyId ?? null}
              onChange={(value, current) => {
                if (value) {
                  setDataSearch({
                    ...dataSearch,
                    surveyId: current?.id,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    surveyId: null,
                  });
                }
              }}
            />
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3 flex-grow-1 w-150px">Trạng thái:</span>
            <Select
              style={{ width: '100%' }}
              options={[
                {
                  value: 0,
                  label: 'Đang thực hiện',
                },
                {
                  value: 1,
                  label: 'Kết thúc',
                },
              ]}
              onChange={(value, current) => {
                if (value != undefined) {
                  setDataSearch({
                    ...dataSearch,
                    status: value,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    status: null,
                  });
                }
              }}
            />
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} surveyTemplate={dataCourse} />
      </div>
    </>
  );
};

export default UsersPage;
