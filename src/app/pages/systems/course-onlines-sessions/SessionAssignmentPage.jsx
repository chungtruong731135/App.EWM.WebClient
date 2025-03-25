/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';

import ItemsList from './components/AssignmentList';
import { useNavigate, useParams } from 'react-router-dom';
import { requestGET } from '@/utils/baseAPI';

const UsersPage = () => {
  const navigate = useNavigate();

  const { classSessionId } = useParams();

  const [dataSearch, setDataSearch] = useState({ classSessionId: classSessionId });
  const [dataCourse, setDataCourse] = useState(null);

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/classsessions/${classSessionId}`);
      setDataCourse(res?.data ?? null);
    };
    if (classSessionId) {
      fetchData(classSessionId);
    }
  }, [classSessionId]);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-3">
        <div className="px-3 py-3 d-flex align-items-center justify-content-between">
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
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{'Danh sách nộp bài tập về nhà ' + (dataCourse?.name ?? '')}</h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách nộp bài tập về nhà'}</h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-xl-250px w-lg-200px">
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
        </div>
        <div></div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
