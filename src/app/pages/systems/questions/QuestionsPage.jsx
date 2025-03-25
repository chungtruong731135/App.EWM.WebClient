/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import { requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import { Checkbox, Popover } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModalAddQuestions from './components/ModalAddQuestions';
import { toast } from 'react-toastify';
const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dataSearch, setDataSearch] = useState(null);
  let [searchParams, setSearchParams] = useSearchParams();
  const [parentId, setParentId] = useState(null);
  const [modalAddVisible, setModalAddVisible] = useState(false);

  useEffect(() => {
    setParentId(searchParams.get('parentId'));
    setDataSearch({ ...dataSearch, parentId: searchParams.get('parentId') });
  }, [searchParams]);

  const CapNhatGoiY = async () => {
    const res = await requestPOST(`api/v1/questions/fix-all`, {});
    if (res) {
      toast.success('Cập nhật thành công!');
    } else {
      toast.error('Thất bại, vui lòng thử lại! ');
    }
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          {parentId && (
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
          )}
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Ngân hàng câu hỏi'}</h3>
          <div className="card-toolbar">
            {dataSearch?.parentId ? (
              <button
                className="btn btn-info btn-sm py-2 me-2"
                onClick={() => {
                  dispatch(
                    actionsModal.setDataModal({
                      readOnly: false,
                      parentId: parentId,
                    })
                  );
                  setModalAddVisible(true);
                }}
              >
                <span>
                  <i className="fas fa-file-import me-2"></i>
                  <span className="">Nhập câu hỏi</span>
                </span>
              </button>
            ) : (
              <></>
            )}
            <button className="btn btn-success btn-sm py-2 me-2" onClick={CapNhatGoiY}>
              <span>
                <i className="fas fa-retweet me-2"></i>
                <span className="">Cập nhật gợi ý</span>
              </span>
            </button>
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({
                    ...null,
                    readOnly: false,
                    parentId: parentId,
                  })
                );
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
          </div>
        </div>
        <div className="d-flex flex-row my-2">
          <div className="flex-grow-1 row g-5">
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
                  showSearch
                  reload={true}
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
                  showSearch
                  reload={true}
                  placeholder="Chọn chủ đề"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/topics/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      courseId: dataSearch?.courseId ?? null,
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
              <div className="ms-2 w-100 ">
                <TDSelect
                  showSearch
                  reload={true}
                  placeholder="Chương trình học"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/questionlevels/search`, {
                      pageNumber: 1,
                      pageSize: 100,
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
                      setDataSearch({ ...dataSearch, questionLevelId: null });
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <Popover
            content={
              <div>
                <Checkbox
                  onChange={e => {
                    setDataSearch({
                      ...dataSearch,
                      noAnswer: e.target.checked,
                    });
                  }}
                >
                  <span className="fw-semibold">Chưa có câu trả lời</span>
                </Checkbox>
              </div>
            }
            title=""
            trigger="click"
            placement="bottom"
          >
            <a className="btn btn-icon btn-secondary btn-active-color-primary btn-sm me-3 mt-1" title="Thao tác nhanh">
              <i className="fas fa-filter"></i>
            </a>
          </Popover>
        </div>
        <ItemsList dataSearch={dataSearch} />
        {modalAddVisible ? (
          <ModalAddQuestions
            modalVisible={modalAddVisible}
            setModalVisible={setModalAddVisible}
            // notInIds={data?.map(i => i.questionId)}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default UsersPage;
