import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'antd';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';
import { Exam_LoaiDeThi } from '@/app/data/datas';
import ModalCopyData from './components/ModalCopyData';

const UsersPage = () => {
  const dispatch = useDispatch();

  const [dataSearch, setDataSearch] = useState(null);
  const [modalCopyVisible, setModalCopyVisible] = useState(false);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Đề thi - luyện tập - kiểm tra'}</h3>
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
                dispatch(
                  actionsModal.setModalExamState({
                    modalVisible: true,
                    modalData: null,
                  })
                );
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
            <span className="fw-bold w-100px">Kỳ thi:</span>
            <div className="ms-2 w-100">
              <TDSelect
                reload={true}
                placeholder="Chọn kỳ thi"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/examinats/search`, {
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
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({ ...dataSearch, examinatId: current?.id });
                  } else {
                    setDataSearch({ ...dataSearch, examinatId: null });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Khối lớp:</span>
            <div className="ms-2 w-100">
              <TDSelect
                reload
                mode="multiple"
                placeholder="Chọn khối lớp"
                fetchOptions={async () => {
                  const res = await requestPOST(`api/v1/categories/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    categoryGroupCode: 'KhoiLop',
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.name}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: '100%',
                  height: 'auto',
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      gradeIds: current?.map(i => i?.id),
                    });
                  } else {
                    setDataSearch({ ...dataSearch, gradeIds: null });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Cấp độ:</span>
            <div className="ms-2 w-100 ">
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
                value={dataSearch?.examAreaId ?? null}
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
            <span className="fw-bold  w-100px">Chương trình học:</span>
            <div className="ms-2 w-100">
              <TDSelect
                allowClear
                showSearch
                reload={true}
                placeholder="Chọn chủ đề"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/questionlevels/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    courseId: dataSearch?.courseId,
                    topicId: dataSearch?.topicId,
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
                value={dataSearch?.questionLevelId ?? null}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      questionLevelId: current?.id,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      questionLevelId: null,
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Loại đề:</span>
            <div className="ms-2 w-100 ">
              <Select
                allowClear
                placeholder="Chọn"
                style={{ width: '100%' }}
                options={Exam_LoaiDeThi}
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
      <ModalCopyData modalVisible={modalCopyVisible} setModalVisible={setModalCopyVisible} />
    </>
  );
};

export default UsersPage;
