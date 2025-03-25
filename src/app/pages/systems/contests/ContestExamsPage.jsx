/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import ExamItemsList from './components/ExamItemsList';
import { useNavigate, useParams } from 'react-router-dom';
import { requestGET } from '@/utils/baseAPI';
import ModalAddExams from './components/ModalAddExams';
import { CheckPermissions } from '@/utils/utils';

const UsersPage = () => {
  const navigate = useNavigate();

  const [modalVisible, setModalVisible] = useState(null);
  const { contestId } = useParams();

  const [dataSearch, setDataSearch] = useState({ contestId: contestId });
  const [dataCourse, setDataCourse] = useState(null);

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/contests/${id}`);
      setDataCourse(res?.data ?? null);
    };
    if (contestId) {
      fetchData(contestId);
    }
  }, [contestId]);

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
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{'Danh sách đề thi ' + (dataCourse?.name ?? '')}</h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0"></h3>
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
            {CheckPermissions(['Permissions.CourseOnline.Manage']) && (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  setModalVisible(true);
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
        <ExamItemsList dataSearch={dataSearch} />
        {modalVisible ? <ModalAddExams modalVisible={modalVisible} setModalVisible={setModalVisible} contestId={dataSearch?.contestId} /> : <></>}
      </div>
    </>
  );
};

export default UsersPage;
