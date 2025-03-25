/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Dropdown, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, requestPOST_NEW, requestDOWNLOADFILE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';

import { useNavigate, createSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import ModalAttendances from './ModalAttendances';
import ModalUpdateFile from './ModalUpdateFile';
import ModalUpdateVideo from './ModalUpdateVideo';
import ModalUpdateAssignment from './ModalUpdateAssignment';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const { dataSearch, courseClassId, courseId } = props;
  const random = useSelector(state => state.modal.random);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalUserVisible, setModalUserVisible] = useState(false);
  const [modalUpdateFile, setModalUpdateFile] = useState(false);
  const [modalUpdateVideo, setModalUpdateVideo] = useState(false);
  const [modalUpdateAssignment, setModalUpdateAssignment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/classsessions/search`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ['startTime'],
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
  }, [dataSearch, courseClassId]);

  const GuiThongBaoPhuHuynh = async item => {
    var res = await requestPOST_NEW(`api/v1/courseclasses/sendmessage`, { id: item.id });
    if (res) {
      toast.success('Thao tác thành công!');
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };
  const GuiThongBaoDiemDanhPhuHuynh = async item => {
    var res = await requestPOST_NEW(`api/v1/courseclasses/send-thong-bao-diem-danh`, { id: item.id });
    if (res) {
      toast.success('Thao tác thành công!');
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setCourseOnlineClassSessionDetail(item));
        dispatch(actionsModal.setCourseOnlineClassSessionDetailModalVisible(true));

        break;

      case 'attendance':
        dispatch(
          actionsModal.setDataModal({
            courseClassId: item?.courseClassId,
            classSessionId: item?.id,
          })
        );
        setModalUserVisible(true);
        break;

      case 'assignment':
        if (courseId) {
          navigate({
            pathname: `${courseId}/course-classes/${courseClassId}/class-sessions/${item?.id}/assignments`,
          });
        } else if (courseClassId) {
          navigate({
            pathname: `${courseClassId}/class-sessions/${item?.id}/assignments`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/assignments`,
          });
        }

        break;

      case 'cham-diem-bai-tap':
        var ress = await requestPOST(`api/v1/classsessiontests/cham-lai-bai-hoc-sinh`, { classSessionId: item.id });
        if (ress) {
          toast.success('Hệ thống đang xử lý dữ liệu, vui lòng kiểm tra lại kết quả bài làm của học sinh sau ít phút!');
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'gui-thong-bao-cho-phu-huynh':
        GuiThongBaoPhuHuynh(item);
        break;

      case 'gui-thong-bao-diem-danh-cho-phu-huynh':
        GuiThongBaoDiemDanhPhuHuynh(item);
        break;

      case 'export-excel':
        var resExport = await requestDOWNLOADFILE(`api/v1/classsessiontests/export-danh-sach-tren-lop-hoc-sinh`, { classSessionId: item?.id });
        var fileData = new Blob([resExport.data], { type: 'application/vnd.ms-excel' });
        var downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(fileData);
        downloadLink.download = 'HocTrenLopHocSinh.xlsx';
        downloadLink.click();
        break;

      case 'tests':
        if (courseId) {
          navigate({
            pathname: `${courseId}/course-classes/${courseClassId}/class-sessions/${item?.id}/tests`,
          });
        } else if (courseClassId) {
          navigate({
            pathname: `${courseClassId}/class-sessions/${item?.id}/tests`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/tests`,
          });
        }

        break;
      case 'update-file':
        dispatch(actionsModal.setDataModal(item));
        setModalUpdateFile(true);
        break;
      case 'update-video':
        dispatch(actionsModal.setDataModal(item));
        setModalUpdateVideo(true);
        break;
      case 'update-assignment':
        dispatch(actionsModal.setDataModal(item));
        setModalUpdateAssignment(true);
        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/classsessions/${item.id}`);
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

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Tên ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Lớp học',
      dataIndex: 'courseClassName',
      key: 'courseClassName',
      hidden: courseClassId ? true : false,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        var check = dayjs(record?.startTime).isAfter(dayjs().format('YYYY-MM-DD HH:mm')) ? 0 : dayjs(record?.endTime).isBefore(dayjs().format('YYYY-MM-DD HH:mm')) ? 2 : 1;
        return <div className={`me-2 badge badge-light-${check == 0 ? 'info' : check == 2 ? 'danger' : 'success'}`}>{check == 0 ? 'Chưa diễn ra' : check == 2 ? 'Đã kết thúc' : 'Đang diễn ra'}</div>;
      },
    },

    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 150,
      render: (text, record) => {
        var check = dayjs(record?.startTime).isAfter(dayjs().format('YYYY-MM-DD HH:mm')) ? 0 : dayjs(record?.endTime).isBefore(dayjs().format('YYYY-MM-DD HH:mm')) ? 2 : 1;
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết/Sửa"
              onClick={() => {
                handleButton(`chi-tiet`, record);
              }}
            >
              <i className="fas fa-eye" />
            </a>
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.DiemDanh']) && (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Điểm danh và cho điểm trên lớp"
                onClick={() => {
                  handleButton(`attendance`, record);
                }}
              >
                <i className="fas fa-user-check" />
              </a>
            )}
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.DiemDanh']) ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Xuất danh sách điểm danh và cho điểm trên lớp"
                onClick={() => {
                  handleButton(`export-excel`, record);
                }}
              >
                <i className="fas fa-print" />
              </a>
            ) : (
              <></>
            )}
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage']) && (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title=" Bài kiểm tra"
                onClick={() => {
                  handleButton(`tests`, record);
                }}
              >
                <i className="fas fa-file-edit" />
              </a>
            )}
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.GuiThongBao']) ? (
              <Popconfirm
                title="Gửi thông báo điểm danh cho phụ huynh?"
                onConfirm={() => {
                  handleButton(`gui-thong-bao-diem-danh-cho-phu-huynh`, record);
                }}
                okText="Gửi"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon hover-scale btn-bg-light btn-active-color-primary btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Gửi thông báo điểm danh cho phụ huynh">
                  <i className="fas fa-paper-plane"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.GuiThongBao']) ? (
              <Popconfirm
                title="Gửi thông báo kết quả bài tập trên lớp cho phụ huynh?"
                onConfirm={() => {
                  handleButton(`gui-thong-bao-cho-phu-huynh`, record);
                }}
                okText="Gửi"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon hover-scale btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Gửi thông báo kết quả bài tập trên lớp cho phụ huynh">
                  <i className="fas fa-sms"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}

            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.CapNhatTaiLieu'])
                    ? {
                        key: 'update-file',
                        disabled: false,
                        label: (
                          <a
                            className="p-2 text-dark"
                            data-toggle="m-tooltip"
                            title="Cập nhật tài liệu"
                            onClick={() => {
                              handleButton(`update-file`, record);
                            }}
                          >
                            <i className="fas fa-file-alt me-2"></i>
                            Cập nhật tài liệu
                          </a>
                        ),
                      }
                    : null,
                  CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.CapNhatTaiLieu'])
                    ? {
                        key: 'update-video',
                        disabled: false,
                        label: (
                          <a
                            className="p-2 text-dark"
                            data-toggle="m-tooltip"
                            title="Cập nhật video"
                            onClick={() => {
                              handleButton(`update-video`, record);
                            }}
                          >
                            <i className="fas fa-file-video me-2"></i>
                            Cập nhật video
                          </a>
                        ),
                      }
                    : null,
                  CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage'])
                    ? {
                        key: 'update-cham-diem-hoc-sinh',
                        disabled: false,
                        label: (
                          <a
                            className="p-2 text-dark"
                            data-toggle="m-tooltip"
                            title="Cập nhật chấm điểm bài về nhà"
                            onClick={() => {
                              handleButton(`cham-diem-bai-tap`, record);
                            }}
                          >
                            <i className="fas fa-check me-2"></i>
                            Chấm lại bài về nhà
                          </a>
                        ),
                      }
                    : null,
                  CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage'])
                    ? {
                        key: 'delete',
                        disabled: false,
                        label: (
                          <Popconfirm
                            title="Xoá?"
                            onConfirm={() => {
                              handleButton(`delete`, record);
                            }}
                            okText="Xoá"
                            cancelText="Huỷ"
                          >
                            <a className="p-2 text-dark" data-toggle="m-tooltip" title="Xoá buổi học">
                              <i className="fas fa-trash me-2"></i>
                              Xoá buổi học
                            </a>
                          </Popconfirm>
                        ),
                      }
                    : null,
                ],
              }}
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1" title="Thao tác nhanh">
                <i className="fa fa-ellipsis-h"></i>
              </a>
            </Dropdown>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
        </div>
      </div>
      {modalUserVisible ? <ModalAttendances modalVisible={modalUserVisible} setModalVisible={setModalUserVisible} /> : <></>}
      {modalUpdateFile ? <ModalUpdateFile modalVisible={modalUpdateFile} setModalVisible={setModalUpdateFile} /> : <></>}
      {modalUpdateVideo ? <ModalUpdateVideo modalVisible={modalUpdateVideo} setModalVisible={setModalUpdateVideo} /> : <></>}
      {modalUpdateAssignment ? <ModalUpdateAssignment modalVisible={modalUpdateAssignment} setModalVisible={setModalUpdateAssignment} /> : <></>}
    </>
  );
};

export default UsersList;
