/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Empty, Popconfirm } from 'antd';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { useNavigate, createSearchParams, useParams } from 'react-router-dom';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestDELETE, requestGET, requestPOST, requestPUT_NEW } from '@/utils/baseAPI';
import RenderDataQuestion from './components/RenderDataQuestion';
import ModalExamVariation from './components/ModalExamVariation';
import ModalChiTiet from './components/ChiTietModal';
import './index.scss';

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { examId } = useParams();
  const random = useSelector(state => state.modal.random);
  const modalExamState = useSelector(state => state.modal.modalExamState);
  const currentVariation = useSelector(state => state.modal.currentVariation);
  const modalExamVariationState = useSelector(state => state.modal.modalExamVariationState);

  const modalVariationVisible = modalExamVariationState?.modalVisible ?? false;

  const [dataExam, setDataExam] = useState(null);
  const [dataVariation, setDataVariation] = useState([]);
  const [modalShuffleVisible, setModalShuffleVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestGET(`api/v1/exams/${examId}`);
      setDataExam(res?.data ?? null);
    };
    if (examId) {
      fetchData();
    }
  }, [examId, random]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(`api/v1/examvariations/search`, {
        pageNumber: 1,
        pageSize: 100,
        examId: examId,
      });
      var _data = res?.data ?? [];
      if (_data?.length > 0) {
        _data = _.orderBy(_data, ['isDefault'], ['desc']);
        setDataVariation(_data);
        if (currentVariation) {
          var temp = _data?.find(i => i.id == currentVariation?.id || i.code == currentVariation?.code);
          dispatch(actionsModal.setCurrentVariation(temp));
        } else {
          var temp_ = _data?.find(i => i.isDefault) || _data[0];
          dispatch(actionsModal.setCurrentVariation(temp_));
        }
      } else {
        setDataVariation([]);
      }
    };
    if (examId) {
      fetchData();
    }
  }, [examId, random]);

  const handleSetDefault = async item => {
    try {
      const res = await requestPUT_NEW(`api/v1/examvariations/${item?.id}`, { ...item, isDefault: true });
      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
      } else {
        toast.error('Thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const handleDeleteVariation = async deleteId => {
    var res = await requestDELETE(`api/v1/examvariations/${deleteId}`);
    if (res) {
      toast.success('Thao tác thành công!');
      if (deleteId == currentVariation?.id) {
        dispatch(actionsModal.setCurrentVariation(null));
      }
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };
  return (
    <>
      <div className="card card-xl-stretch mb-xl-3">
        <div className="px-3 py-3 d-flex align-items-center justify-content-between flex-wrap">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fas fa-arrow-left fs-2 text-gray-600" />
            </a>
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{dataExam?.title ?? 'Đề thi'}</h3>
          </div>
          <div className="card-toolbar">
            <button
              className="btn btn-primary py-2 me-2"
              onClick={() => {
                dispatch(
                  actionsModal.setModalExamState({
                    modalVisible: true,
                    modalData: dataExam,
                  })
                );
              }}
            >
              <i className="fas fa-edit fs-5 p-0 me-2" />
              <span className="">Sửa thông tin đề thi</span>
            </button>
            <button
              className="btn btn-primary py-2 me-2"
              onClick={() => {
                var params = {
                  examId: examId,
                };
                navigate({
                  pathname: '/system/study/exams/result',
                  search: `?${createSearchParams(params)}`,
                });
              }}
            >
              <span className="">Kết quả</span>
            </button>
          </div>
        </div>
      </div>
      <div className="mb-xl-9">
        <div className="row g-5">
          <div className="col-xl-3">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between px-5 min-h-60px">
                <div className="card-title  text-header-td fs-3 mb-0">Mã đề</div>
                <button
                  className="btn btn-success btn-sm btn-icon w-25px h-25px rounded-circle"
                  onClick={() => {
                    if (dataVariation?.length > 0) {
                      dispatch(actionsModal.setModalExamVariationState({ modalVisible: true, modalData: { examId: examId } }));
                    } else {
                      dispatch(actionsModal.setModalExamVariationState({ modalVisible: true, modalData: { examId: examId } }));
                    }
                  }}
                >
                  <i className="fas fa-plus text-white" />
                </button>
              </div>
              <div className="card-body p-0 pb-2 category-menu">
                {dataVariation?.length > 0 ? (
                  <>
                    {dataVariation?.map((item, index) => (
                      <div key={item?.id || item?.code} className={`category-item border-bottom ${item?.id == currentVariation?.id || (!item?.id && item?.code == currentVariation?.code) ? 'item-active' : ''}`}>
                        <div
                          className="d-flex flex-column flex-grow-1 btn align-items-start ps-2"
                          onClick={() => {
                            dispatch(actionsModal.setCurrentVariation(item));
                          }}
                        >
                          <div className={`text-start ${item?.id == currentVariation?.id || (!item?.id && item?.code == currentVariation?.code) ? 'text-primary' : ''}`}>
                            <span className="fw-normal">Mã đề:</span>
                            <span className="fw-bold ms-2">{item?.code ?? item?.id}</span>
                          </div>

                          <div className="fs-7 fw-semibold text-info lh-sm mt-1">{item?.isDefault ? 'Đề mặc định' : ''}</div>
                        </div>
                        <Dropdown
                          trigger={'click'}
                          menu={{
                            items: [
                              {
                                key: 'default',
                                label: (
                                  <span
                                    className="p-2 text-dark"
                                    onClick={() => {
                                      handleSetDefault(item);
                                    }}
                                  >
                                    <i className={`fas fa-star me-2`} />
                                    {'Đề mặc định'}
                                  </span>
                                ),
                              },
                              {
                                key: 'edit',
                                label: (
                                  <span
                                    className="p-2 text-dark"
                                    onClick={() => {
                                      dispatch(actionsModal.setModalExamVariationState({ modalVisible: true, modalData: item }));
                                    }}
                                  >
                                    <i className={`fas fa-edit me-2`} />
                                    {'Chỉnh sửa mã đề'}
                                  </span>
                                ),
                              },
                              {
                                key: 'download',
                                label: (
                                  <span
                                    className="p-2 text-dark"
                                    onClick={() => {
                                      toast.info('Chức năng đang cập nhật!');
                                    }}
                                  >
                                    <i className={`fas fa-download me-2`} />
                                    {'Tải xuống'}
                                  </span>
                                ),
                              },

                              !item?.isDefault
                                ? {
                                    key: 'delete',
                                    label: (
                                      <Popconfirm
                                        title="Xoá mã đề?"
                                        onConfirm={() => {
                                          handleDeleteVariation(item?.id);
                                        }}
                                        okText="Xoá"
                                        cancelText="Huỷ"
                                      >
                                        <span className="p-2 text-dark">
                                          <i className={`fas fa-trash me-2`} />
                                          {'Xoá mã đề'}
                                        </span>
                                      </Popconfirm>
                                    ),
                                  }
                                : null,
                            ],
                          }}
                        >
                          <button className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary" title="Thao tác">
                            <i className="fa fa-ellipsis-h" />
                          </button>
                        </Dropdown>
                      </div>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
          <div className="col-xl-9">
            <div className="card">
              {!currentVariation ? (
                <div className="h-300px d-flex align-items-center justify-content-center">
                  <Empty />
                </div>
              ) : (
                <RenderDataQuestion examId={examId} isGroupQuestions={dataExam?.isGroupQuestions} />
              )}
            </div>
          </div>
        </div>
      </div>
      {modalVariationVisible ? <ModalExamVariation /> : <></>}
      {modalExamState?.modalVisible ? <ModalChiTiet /> : <></>}
    </>
  );
};

export default UsersPage;
