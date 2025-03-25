/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'antd';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';
import ModalCopyData from './components/ModalCopyData';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

const UsersPage = props => {
  const dispatch = useDispatch();

  const { currentUser } = useAuth();

  const [dataSearch, setDataSearch] = useState(null);
  const [modalCopyVisible, setModalCopyVisible] = useState(false);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Buổi học online'}</h3>
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
            <div className="btn-group mx-2 align-items-center w-xl-300px w-lg-250px">
              <span className="fw-bold  w-100px">Lớp học:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  reload={true}
                  showSearch
                  placeholder="Chọn lớp học"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/courseclasses/search`, {
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
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        courseClassId: current?.id,
                      });
                    } else {
                      setDataSearch({ ...dataSearch, courseClassId: null });
                    }
                  }}
                />
              </div>
            </div>
            <div className="btn-group mx-2 align-items-center w-xl-300px w-lg-250px">
              <span className="fw-bold  w-100px">Trạng thái:</span>
              <div className="ms-2 w-100">
                <Select
                  allowClear
                  placeholder="Chọn trạng thái"
                  options={[
                    {
                      label: 'Chưa diễn ra',
                      value: 0,
                    },
                    {
                      label: 'Đang diễn ra',
                      value: 1,
                    },
                    {
                      label: 'Đã kết thúc',
                      value: 2,
                    },
                  ]}
                  style={{
                    width: '100%',
                  }}
                  onChange={value => {
                    setDataSearch({
                      ...dataSearch,
                      status: value,
                    });
                  }}
                />
              </div>
            </div>
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage']) ? (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  dispatch(actionsModal.setCourseOnlineClassSessionDetail({ ...null, readOnly: false }));
                  dispatch(actionsModal.setCourseOnlineClassSessionDetailModalVisible(true));
                }}
              >
                <span>
                  <i className="fas fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} type={props?.type} />
      </div>
      <ModalCopyData modalVisible={modalCopyVisible} setModalVisible={setModalCopyVisible} />
    </>
  );
};

export default UsersPage;
