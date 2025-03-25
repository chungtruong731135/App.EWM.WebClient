/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Dropdown, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, requestPOST_NEW } from '@/utils/baseAPI';
import { useNavigate, createSearchParams } from 'react-router-dom';
import TableList from '@/app/components/TableList';
import ModalListStudent from './ModalListStudent';
import { CheckRole } from '@/utils/utils';
import { useAuth } from '@/app/modules/auth';

import SubTableList from '@/app/pages/systems/course-onlines-sessions/components/ItemsList';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const { dataSearch, type, courseId, courseOnlineProgramId } = props;

  const random = useSelector(state => state.modal.random);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalStudentVisible, setModalStudentVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/courseclasses/search`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
              courseId: courseId,
              courseOnlineProgramId: courseOnlineProgramId,
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

  const GuiThongBaoPhuHuynh = async (item, type) => {
    try {
      const res = await requestPOST_NEW(`api/v1/courseclasses/guithongbao-ravao`, { id: item.id, type: type });
      if (res.status === 200) {
        toast.success('Gửi thông báo thành công!');
        dispatch(actionsModal.setRandom());
      } else {
        toast.error('Thất bại, vui lòng thử lại!');
      }
    } catch (error) {}
  };

  const handleButton = async (action, item) => {
    switch (action) {
      case 'chi-tiet':
        dispatch(
          actionsModal.setCourseOnlineClassDetail({
            ...item,
            readOnly: type == 3 ? true : false,
          })
        );
        dispatch(actionsModal.setCourseOnlineClassDetailModalVisible(true));

        break;

      case 'gui-thong-bao-dauvao-cho-phu-huynh':
        GuiThongBaoPhuHuynh(item, 4);
        break;

      case 'gui-thong-bao-daura-cho-phu-huynh':
        GuiThongBaoPhuHuynh(item, 5);
        break;

      case 'students':
        if (courseId) {
          navigate({
            pathname: `${courseId}/course-classes/${item?.id}/class-students`,
          });
        } else if (courseOnlineProgramId) {
          navigate({
            pathname: `${courseOnlineProgramId}/course-classes/${item?.id}/class-students`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/class-students`,
          });
        }

        break;

      case 'add-sessions':
        dispatch(
          actionsModal.setCourseOnlineClassSessionDetail({
            ...null,
            readOnly: false,
            courseClassId: item?.id,
            courseClassName: item?.name,
          })
        );
        dispatch(actionsModal.setCourseOnlineClassSessionDetailModalVisible(true));
        break;

      case 'add-auto-sessions':
        dispatch(
          actionsModal.setCourseOnlineClassSessionDetail({
            ...null,
            readOnly: false,
            courseClassId: item?.id,
            courseClassName: item?.name,
          })
        );
        dispatch(actionsModal.setAutoCourseOnlineClassSessionDetailModalVisible(true));
        break;

      case 'sessions':
        if (courseId) {
          navigate({
            pathname: `${courseId}/course-classes/${item?.id}/class-sessions`,
          });
        } else if (courseOnlineProgramId) {
          navigate({
            pathname: `${courseOnlineProgramId}/course-classes/${item?.id}/class-sessions`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/class-sessions`,
          });
        }

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/courseclasses/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'XoaVanBan':
        //handleXoaVanBan(item);
        break;

      default:
        break;
    }
  };

  const expandedRowRender = (record, index, indent, expanded) => {
    return <SubTableList courseClassId={record?.id} courseId={courseId} />;
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

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    !courseId
      ? {
          title: 'Khoá học',
          dataIndex: 'courseTitle',
          key: 'courseTitle',
        }
      : null,
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giáo viên',
      dataIndex: 'teacherFullName',
      key: 'teacherFullName',
    },
    {
      title: 'Thời gian dạy',
      dataIndex: 'studyDay',
      key: 'studyDay',
      render: (text, record, index) => (
        <div>
          {record?.studyDay} : {record?.studyTime}
        </div>
      ),
    },
    {
      title: 'Số lượng học sinh',
      dataIndex: 'studentsCount',
      key: 'studentsCount',
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
              title="Xem chi tiết/Sửa"
              onClick={() => {
                handleButton(`chi-tiet`, record);
              }}
            >
              <i className="fa fa-eye"></i>
            </a>
            {CheckRole(currentUser?.permissions, ['Permissions.CourseClasses.ManageStudent']) ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Danh sách học sinh"
                onClick={() => {
                  handleButton(`students`, record);
                }}
              >
                <i className="fas fa-users me-2"></i>
              </a>
            ) : (
              <></>
            )}
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.View', 'Permissions.ClassSessions.Manage']) ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Danh sách buổi học"
                onClick={() => {
                  handleButton(`sessions`, record);
                }}
              >
                <i className="fas fa-clipboard-list me-2"></i>
              </a>
            ) : (
              <></>
            )}
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage']) ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Thêm mới buổi học"
                onClick={() => {
                  handleButton(`add-sessions`, record);
                }}
              >
                <i className="fa fa-plus"></i>
              </a>
            ) : (
              <></>
            )}
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage']) ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Thêm tự động nhiều buổi học"
                onClick={() => {
                  handleButton(`add-auto-sessions`, record);
                }}
              >
                <i className="fa fa-calendar-plus"></i>
              </a>
            ) : (
              <></>
            )}
            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  CheckRole(currentUser?.permissions, ['Permissions.CourseClasses.DoiSoat'])
                    ? {
                        key: 'doisoat',
                        disabled: false,
                        label:
                          type == 3 ? (
                            <></>
                          ) : (
                            <Popconfirm
                              title="Bạn có muốn đối soát?"
                              onConfirm={() => {
                                DoiSoat({ id: record?.id });
                              }}
                              okText="Đối soát"
                              cancelText="Huỷ"
                            >
                              <a className="p-2 text-dark" data-toggle="m-tooltip" title="Xoá">
                                <i className="fa fa-check me-2"></i> Đối soát
                              </a>
                            </Popconfirm>
                          ),
                      }
                    : null,
                  CheckRole(currentUser?.permissions, ['Permissions.CourseClasses.GuiThongBao'])
                    ? {
                        key: 'guithongbaodauvao',
                        disabled: false,
                        label:
                          type == 3 ? (
                            <></>
                          ) : (
                            <Popconfirm
                              title="Bạn có muốn gửi?"
                              onConfirm={() => {
                                handleButton(`gui-thong-bao-dauvao-cho-phu-huynh`, record);
                              }}
                              okText="Gửi"
                              cancelText="Huỷ"
                            >
                              <a className="p-2 text-dark" data-toggle="m-tooltip" title="Xoá">
                                <i className="fa fa-sms me-2"></i> Gửi thông báo kết quả đầu vào
                              </a>
                            </Popconfirm>
                          ),
                      }
                    : null,
                  CheckRole(currentUser?.permissions, ['Permissions.CourseClasses.GuiThongBao'])
                    ? {
                        key: 'guithongbaodaura',
                        disabled: false,
                        label:
                          type == 3 ? (
                            <></>
                          ) : (
                            <Popconfirm
                              title="Bạn có muốn gửi?"
                              onConfirm={() => {
                                handleButton(`gui-thong-bao-daura-cho-phu-huynh`, record);
                              }}
                              okText="Gửi"
                              cancelText="Huỷ"
                            >
                              <a className="p-2 text-dark" data-toggle="m-tooltip" title="Xoá">
                                <i className="fa fa-share-from-square me-2"></i> Gửi thông báo kết quả đầu ra
                              </a>
                            </Popconfirm>
                          ),
                      }
                    : null,
                  CheckRole(currentPermissions, ['Permissions.CourseClasses.Manage'])
                    ? {
                        key: 'delete',
                        disabled: false,
                        label:
                          type == 3 ? (
                            <></>
                          ) : (
                            <Popconfirm
                              title="Xoá?"
                              onConfirm={() => {
                                handleButton(`delete`, record);
                              }}
                              okText="Xoá"
                              cancelText="Huỷ"
                            >
                              <a className="p-2 text-dark" data-toggle="m-tooltip" title="Xoá">
                                <i className="fa fa-trash me-2"></i> Xoá
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
          <TableList
            expandable={
              CheckRole(currentPermissions, ['Permissions.ClassSessions.View', 'Permissions.ClassSessions.Manage'])
                ? {
                    expandedRowRender,
                  }
                : null
            }
            dataTable={dataTable}
            columns={columns}
            isPagination={true}
            size={size}
            count={count}
            offset={offset}
            setOffset={setOffset}
            setSize={setSize}
            loading={loading}
          />
        </div>
      </div>
      {modalStudentVisible ? <ModalListStudent modalVisible={modalStudentVisible} setModalVisible={setModalStudentVisible} /> : <></>}
    </>
  );
};

export default UsersList;
