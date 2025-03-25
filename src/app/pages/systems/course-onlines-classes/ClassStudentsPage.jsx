/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popconfirm, Spin, Switch } from 'antd';
import { toast } from 'react-toastify';

import * as actionsModal from '@/setup/redux/modal/Actions';

import { useNavigate, useParams } from 'react-router-dom';
import { requestDELETE, requestDOWNLOADFILE, requestGET, requestPOST, requestPOST_NEW, requestUploadFile } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';
import _ from 'lodash';
import ModalComment from './components/ModalComment';

import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';
import ModalAddUserToClass from './components/ModalAddUserToClass';

import { useAuth } from '@/app/modules/auth';
import { CheckPermissions, CheckRole } from '@/utils/utils';
import dayjs from 'dayjs';

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const { courseClassId } = useParams();

  const random = useSelector(state => state.modal.random);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalCommentVisible, setModalCommentVisible] = useState(false);
  const [modalAddStudentVisible, setModalAddStudentVisible] = useState(false);

  const [dataSearch, setDataSearch] = useState({ courseClassId: courseClassId });
  const [dataCourse, setDataCourse] = useState(null);

  const handleExport = async data => {
    try {
      const res = await requestDOWNLOADFILE(`api/v1/courseclassusers/export-ket-qua-hoc-tap`, {
        userId: data.userId,
        courseClassId: data.courseClassId,
      });
      const fileData = new Blob([res.data], { type: 'application/vnd.ms-excel' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = `KetQuaHocTap_${data?.fullName}.xlsx`;
      downloadLink.click();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/courseclasses/${courseClassId}`);
      setDataCourse(res?.data ?? null);
    };
    if (courseClassId) {
      fetchData(courseClassId);
    }
  }, [courseClassId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/courseclassusers/search`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
              courseClassId: courseClassId,
            },
            dataSearch
          )
        );
        setDataTable(res?.data ?? []);
        setCount(res?.totalCount ?? 0);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (refreshing) {
      fetchData();
      setRefreshing(false);
    }
    return () => {};
  }, [refreshing]);
  useEffect(() => {
    if (!refreshing) {
      setRefreshing(true);
    }
    return () => {};
  }, [offset, size, dataSearch, random]);
  useEffect(() => {
    setOffset(1);
    return () => {};
  }, [dataSearch]);

  const handleAddData = async values => {
    const res = await requestPOST_NEW(`api/v1/courseclassusers/add-users`, { CourseClassId: courseClassId, students: values });

    if (res.status === 200) {
      toast.success('Thao tác thành công!');
      setRefreshing(true);
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const ChangeSpecialUser = async (item, enable) => {
    const res = await requestPOST_NEW(`api/v1/courseclassusers/toggle-special`, { id: item?.id, isSpecial: enable });
    if (res.status === 200) {
      toast.success('Thao tác thành công!');
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const RowClassName = (record, index) => {
    if (record?.status == 0) return 'bg-danger';
    return index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={true} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Điểm đầu vào',
      dataIndex: 'diemDauVao',
      key: 'diemDauVao',
      render: (text, record) => {
        var diemSoDauVaoStr = record?.diemSoDauVaoStr;
        try {
          var arrDiemDauVao = JSON.parse(diemSoDauVaoStr);
          if (arrDiemDauVao.length > 0) {
            return (
              <>
                {arrDiemDauVao.map(item => (
                  <div key={Math.random().toString()} className="mb-3">
                    <a
                      data-toggle="m-tooltip"
                      title="Chi tiết bài làm của học sinh"
                      onClick={() => {
                        window.open(`https://codemath.vn/ket-qua-bai-kiem-tra/${item.Id}`, '_blank', 'noreferrer');
                      }}
                    >
                      {item.Title}
                      <i className="fas fa-arrow-up-right-from-square ms-2"></i>
                    </a>
                    <span className="fw-bold ms-5">Điểm: {item.Score}</span>
                    <span className="fw-bold ms-1">| {dayjs(item.CreatedOn).format('DD/MM/YYYY HH:mm')}</span>
                    <div className={`badge badge-light-${item?.SendZaloStatus == 1 ? 'success' : 'danger'} ms-5 me-5`}>{`${item?.SendZaloStatus == 1 ? 'Đã gửi' : 'Chưa gửi'}`}</div>
                    {item?.SendZaloStatus != 1 ? (
                      <Popconfirm
                        title="Gửi thông báo?"
                        onConfirm={() => {
                          GuiThongBaoPhuHuynh(item);
                        }}
                        okText="Gửi"
                        cancelText="Huỷ"
                      >
                        <a className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm  mb-1" data-toggle="m-tooltip" title="Gửi thông báo kết quả bài làm cho phụ huynh">
                          <i className="fas fa-sms"></i>
                        </a>
                      </Popconfirm>
                    ) : (
                      <></>
                    )}
                  </div>
                ))}
              </>
            );
          } else return <></>;
        } catch (error) {
          /* empty */
        }
        return <></>;
      },
    },
    {
      title: 'Điểm đầu ra',
      dataIndex: 'diemDauRa',
      key: 'diemDauRa',
      render: (text, record) => {
        var diemSoDauVaoStr = record?.diemSoDauRaStr;
        try {
          var arrDiemDauVao = JSON.parse(diemSoDauVaoStr);
          if (arrDiemDauVao.length > 0) {
            return (
              <>
                {arrDiemDauVao.map(item => (
                  <div key={Math.random().toString()} className="mb-3">
                    <a
                      data-toggle="m-tooltip"
                      title="Chi tiết bài làm của học sinh"
                      onClick={() => {
                        window.open(`https://codemath.vn/ket-qua-bai-kiem-tra/${item.Id}`, '_blank', 'noreferrer');
                      }}
                    >
                      {item.Title}
                      <i className="fas fa-arrow-up-right-from-square ms-2"></i>
                    </a>
                    <span className="fw-bold ms-5">Điểm: {item.Score}</span>
                    <span className="fw-bold ms-1">| {dayjs(item.CreatedOn).format('DD/MM/YYYY HH:mm')}</span>
                    <div className={`badge badge-light-${item?.SendZaloStatus == 1 ? 'success' : 'danger'} ms-5 me-5`}>{`${item?.SendZaloStatus == 1 ? 'Đã gửi' : 'Chưa gửi'}`}</div>
                    {item?.SendZaloStatus != 1 ? (
                      <Popconfirm
                        title="Gửi thông báo?"
                        onConfirm={() => {
                          GuiThongBaoPhuHuynh(item);
                        }}
                        okText="Gửi"
                        cancelText="Huỷ"
                      >
                        <a className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm  mb-1" data-toggle="m-tooltip" title="Gửi thông báo kết quả bài làm cho phụ huynh">
                          <i className="fas fa-sms"></i>
                        </a>
                      </Popconfirm>
                    ) : (
                      <></>
                    )}
                  </div>
                ))}
              </>
            );
          } else return <></>;
        } catch (error) {
          /* empty */
        }
        return <></>;
      },
    },
    {
      title: 'Người dùng đặc biệt',
      dataIndex: 'danhgia',
      key: 'danhgia',
      width: 150,
      hidden: !CheckRole(currentPermissions, ['Permissions.CourseOnline.Manage']),
      render: (text, record) => {
        let checked = record?.isSpecial == true ? true : false;
        return (
          <div className="d-flex justify-content-center">
            <Switch
              defaultChecked={record?.isSpecial}
              onChange={enable => {
                ChangeSpecialUser(record, enable);
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 150,
      render: (text, record) => {
        return (
          <div className="">
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Kết quả học tập của học sinh"
              onClick={() => {
                handleButton(`print-ket-qua-hoc-tap`, record);
              }}
            >
              <i className="fa fa-print"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Đánh giá nhận xét"
              onClick={() => {
                handleButton(`comment`, record);
              }}
            >
              <i className="fas fa-comment-alt"></i>
            </a>
            {record?.diemSoDauVaoStr ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Gửi thông báo kết quả đầu vào qua Zalo cho phụ huynh"
                onClick={() => {
                  handleButton(`gui-thong-bao-cho-phu-huynh`, record);
                }}
              >
                <i className="fas fa-sms"></i>
              </a>
            ) : (
              <></>
            )}
            {record?.diemSoDauRaStr ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Gửi thông báo kết quả đầu ra qua Zalo cho phụ huynh"
                onClick={() => {
                  handleButton(`gui-thong-bao-daura-cho-phu-huynh`, record);
                }}
              >
                <i className="fas fa-share-from-square"></i>
              </a>
            ) : (
              <></>
            )}
            {CheckRole(currentPermissions, ['Permissions.CourseClasses.ManageStudent']) ? (
              <Popconfirm
                title="Xoá?"
                onConfirm={() => {
                  handleButton(`delete`, record);
                }}
                okText="Xoá"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá học sinh khỏi lớp học">
                  <i className="fas fa-trash"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];

  const GuiThongBaoPhuHuynh = async item => {
    const res = await requestPOST_NEW(`api/v1/courseclasses/guithongbao-diemdauvao`, { id: item.Id, className: dataCourse?.name ?? '', courseTitle: dataCourse?.courseTitle ?? '' });
    if (res.status === 200) {
      toast.success('Gửi thông báo thành công!');
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const GuiThongBaoRaVaoAll = async (item, type) => {
    const res = await requestPOST_NEW(`api/v1/courseclasses/guithongbao-all-hocsinh`, {
      userId: item?.userId,
      type: type,
      courseClassId: item?.courseClassId,
      className: dataCourse?.name ?? '',
      courseTitle: dataCourse?.courseTitle ?? '',
    });
    if (res.status === 200) {
      toast.success('Gửi thông báo thành công!');
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const DoiSoat = async item => {
    try {
      const res = await requestPOST_NEW(`api/v1/courseclasses/doisoat`, {
        courseClassId: item?.id,
      });
      if (res?.status == 200) {
        toast.success('Thao tác thành công!');
        dispatch(actionsModal.setRandom());
      } else {
        toast.error('Thất bại, vui lòng thử lại! ' + (res?.data?.exception ?? ''));
      }
    } catch (error) {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const GuiThongBaoChungPhuHuynh = async type => {
    try {
      const res = await requestPOST_NEW(`api/v1/courseclasses/guithongbao-all-hocsinh`, {
        type: type,
        courseClassId: courseClassId,
        className: dataCourse?.name ?? '',
        courseTitle: dataCourse?.courseTitle ?? '',
      });
      if (res.status === 200) {
        toast.success('Gửi thông báo thành công!');
        dispatch(actionsModal.setRandom());
      } else {
        toast.error('Thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      /* empty */
    }
  };

  const handleButton = async (action, item) => {
    switch (action) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;
      case 'comment':
        dispatch(actionsModal.setDataModal({ id: item?.id, comment: item?.comment }));
        setModalCommentVisible(true);

        break;

      case 'gui-thong-bao-cho-phu-huynh':
        GuiThongBaoRaVaoAll(item, 4);
        break;

      case 'gui-thong-bao-daura-cho-phu-huynh':
        GuiThongBaoRaVaoAll(item, 5);
        break;

      case 'print-ket-qua-hoc-tap':
        handleExport(item);
        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/courseclassusers/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      default:
        break;
    }
  };
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
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{'Danh sách học sinh lớp ' + (dataCourse?.name ?? '')}</h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách học sinh'}</h3>
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
            {CheckPermissions(['Permissions.CourseClasses.GuiThongBao']) && (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  DoiSoat({ id: courseClassId });
                }}
              >
                <span>
                  <i className="fas fa-check me-2"></i>
                  <span className="">Đối soát</span>
                </span>
              </button>
            )}
            {CheckPermissions(['Permissions.CourseClasses.DoiSoat']) && (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  GuiThongBaoChungPhuHuynh(4);
                }}
              >
                <span>
                  <i className="fas fa-sms me-2"></i>
                  <span className="">Gửi thông báo đầu vào</span>
                </span>
              </button>
            )}
            {CheckPermissions(['Permissions.CourseClasses.GuiThongBao']) && (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  GuiThongBaoChungPhuHuynh(5);
                }}
              >
                <span>
                  <i className="fas fa-share-from-square me-2"></i>
                  <span className="">Gửi thông báo đầu ra</span>
                </span>
              </button>
            )}
            {CheckRole(currentPermissions, ['Permissions.CourseClasses.ManageStudent']) ? (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  setModalAddStudentVisible(true);
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
        <div className="card-body card-dashboard px-3 py-3">
          <Spin spinning={loading}>
            <TableList rowClassName={RowClassName} dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
          </Spin>
        </div>
      </div>
      {modalCommentVisible ? <ModalComment modalVisible={modalCommentVisible} setModalVisible={setModalCommentVisible} setRefreshing={setRefreshing} /> : <></>}
      {modalAddStudentVisible ? <ModalAddUserToClass modalVisible={modalAddStudentVisible} setModalVisible={setModalAddStudentVisible} handleAddData={handleAddData} /> : <></>}
    </>
  );
};

export default UsersPage;
