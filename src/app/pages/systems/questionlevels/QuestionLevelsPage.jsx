/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'antd';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import ModalCopyData from './components/ModalCopyData';

import { requestPOST } from '@/utils/baseAPI';

const UsersPage = () => {
  const dispatch = useDispatch();
  const [dataSearch, setDataSearch] = useState(null);
  const [modalCopyVisible, setModalCopyVisible] = useState(false);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Chương trình học'}</h3>
          <div className="card-toolbar">
            <button
              className="btn btn-info btn-sm py-2 me-2"
              onClick={() => {
                setModalCopyVisible(true);
              }}
            >
              <span>
                <i className="fas fa-copy"></i>
                <span className="ms-1">Sao chép</span>
              </span>
            </button>
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(actionsModal.setQuestionLevelDetail({ ...null, readOnly: false }));
                dispatch(actionsModal.setQuestionLevelModalVisible(true));
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
          <div className="col-xl-3 col-md-6 px-5">
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
          <div className="col-xl-3 col-md-6 btn-group align-items-center px-5">
            <span className="fw-bold w-100px">Khoá học:</span>
            <div className="ms-2 w-100">
              <TDSelect
                allowClear
                reload={true}
                showSearch
                placeholder="Chọn khoá học"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/courses/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    keyword: keyword,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.title}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: '100%',
                }}
                value={dataSearch?.courseId ?? null}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      courseId: current?.id,
                      topicId: null,
                      questionLevelId: null,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      courseId: null,
                      topicId: null,
                      questionLevelId: null,
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-md-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Chủ đề:</span>
            <div className="ms-2 w-100">
              <TDSelect
                allowClear
                showSearch
                reload={true}
                placeholder="Chọn chủ đề"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/topics/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    courseId: dataSearch?.courseId,
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
                value={dataSearch?.topicId ?? null}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      topicId: current?.id,
                      questionLevelId: null,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      topicId: null,
                      questionLevelId: null,
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-md-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Tình trạng:</span>
            <div className="ms-2 w-100 ">
              <Select
                allowClear
                placeholder="Chọn tình trạng"
                style={{ width: '100%' }}
                options={[
                  {
                    value: true,
                    label: 'Đang hoạt động',
                  },
                  {
                    value: false,
                    label: 'Dừng hoạt động',
                  },
                ]}
                onChange={value => {
                  setDataSearch({ ...dataSearch, isActive: value });
                }}
              />
            </div>
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
      <ModalCopyData modalVisible={modalCopyVisible} setModalVisible={setModalCopyVisible} />
    </>
  );
};

export default UsersPage;
