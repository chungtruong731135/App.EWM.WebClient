/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';
import { requestGET } from '@/utils/baseAPI';

import ItemsList from './components/ItemsList';

const UsersPage = () => {
  const { currentUser } = useAuth();
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
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Nhóm khảo sát ' + (dataCourse?.name ?? '')}</h3>
          </div>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-200px">
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
            {(CheckRole(currentUser?.permissions, ['Permissions.Survey.Manage']) || CheckRole(currentUser?.permissions, ['Permissions.Survey.View'])) && (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  /*  dispatch(actionsModal.setDataModal({ ...null, readOnly: false }));
                dispatch(actionsModal.setModalVisible(true)); */
                  navigate({
                    pathname: 'new',
                  });
                }}
              >
                <span>
                  <i className="fas fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            )}
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
