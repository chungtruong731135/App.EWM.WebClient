/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';

import ItemsList from './components/ItemsList';
import { useNavigate, useParams } from 'react-router-dom';
import { requestGET } from '@/utils/baseAPI';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

const UsersPage = () => {
  const navigate = useNavigate();
  const { classSessionId } = useParams();
  const { currentUser } = useAuth();

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
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{'Danh sách bài kiểm tra ' + (dataCourse?.name ?? '')}</h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách bài kiểm tra'}</h3>
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
            {/* <div className="btn-group align-items-center mx-3 w-xl-300px w-lg-250px">
              <span className="fw-bold w-80px">Cấp độ:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  reload={true}
                  showSearch
                  placeholder="Chọn cấp độ"
                  fetchOptions={async (keyword) => {
                    const res = await requestPOST(`api/v1/examareas/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      keyword: keyword,
                    });
                    return res?.data?.map((item) => ({
                      ...item,
                      label: `${item.name}`,
                      value: item.id,
                    }));
                  }}
                  style={{
                    width: "100%",
                  }}
                  // value={dataSearch?.examAreaId ?? null}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        examAreaId: current?.id,
                      });
                    } else {
                      setDataSearch({ ...dataSearch, examAreaId: null });
                    }
                  }}
                />
              </div>
            </div> */}

            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage']) && (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  var params = {
                    classSessionId: dataCourse?.id,
                  };
                  navigate({
                    pathname: 'new',
                  });
                }}
              >
                <span>
                  <i className="fas fa-plus  me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            )}
          </div>
        </div>
        <div></div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
