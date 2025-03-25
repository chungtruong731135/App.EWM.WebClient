/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import TopicsList from '../course-onlines-sessions/components/ItemsList';
import { useNavigate, useParams } from 'react-router-dom';
import { requestGET } from '@/utils/baseAPI';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courseClassId } = useParams();

  const [dataSearch, setDataSearch] = useState({ courseClassId: courseClassId });
  const [dataCourse, setDataCourse] = useState(null);

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/courseclasses/${id}`);
      setDataCourse(res?.data ?? null);
    };
    if (courseClassId) {
      fetchData(courseClassId);
    }
  }, [courseClassId]);

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
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{dataCourse?.name ?? 'Danh sách buổi học'}</h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách buổi học'}</h3>
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
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage']) ? (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  dispatch(
                    actionsModal.setDataModal({
                      ...null,
                      courseClassId: dataCourse?.id,
                      courseClassName: dataCourse?.name,
                    })
                  );
                  dispatch(actionsModal.setModalVisible(true));
                }}
              >
                <span>
                  <i className="fas fa-plus  me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div></div>
        <TopicsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
