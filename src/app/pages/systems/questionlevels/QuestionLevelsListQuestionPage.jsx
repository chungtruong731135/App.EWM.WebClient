/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from '../questions/components/ItemsList';
import { useNavigate, useParams } from 'react-router-dom';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { questionLevelId } = useParams();

  //
  const [dataSearch, setDataSearch] = useState({ questionLevelId: questionLevelId });
  const [dataCourse, setDataCourse] = useState(null);
  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/questionlevels/${id}`);
      setDataCourse(res?.data ?? null);
    };
    if (questionLevelId) {
      fetchData(questionLevelId);
    }
  }, [questionLevelId]);

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
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{'Ngân hàng câu hỏi khoá học ' + (dataCourse?.name ?? '')}</h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Ngân hàng câu hỏi'}</h3>
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
            <div className="btn-group align-items-center mx-3 w-xl-300px w-lg-250px">
              <span className="fw-bold w-80px">Cấp độ:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  reload={true}
                  showSearch
                  placeholder="Chọn cấp độ"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/examareas/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      keyword: keyword,
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
            </div>

            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({
                    readOnly: false,
                    courseId: dataCourse?.courseId,
                    courseTitle: dataCourse?.courseTitle,
                    topicId: dataCourse?.topicId,
                    topicName: dataCourse?.topicName,
                    questionLevelId: dataCourse?.id,
                    questionLevelName: dataCourse?.name,
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
          </div>
        </div>
        <div></div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
