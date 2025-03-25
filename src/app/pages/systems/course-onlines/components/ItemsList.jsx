/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Dropdown, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

import SubTableList from '@/app/pages/systems/course-onlines-classes/components/ItemsList';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/courseonlines/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ['title', 'code'],
                keyword: dataSearch?.keyword ?? null,
              },
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
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

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setCourseOnlineDetail(item));
        dispatch(actionsModal.setCourseOnlineDetailModalVisible(true));
        break;

      case 'add-class':
        dispatch(
          actionsModal.setCourseOnlineClassDetail({
            ...null,
            readOnly: false,
            courseId: item?.id,
            courseTitle: item?.title,
          })
        );
        dispatch(actionsModal.setCourseOnlineClassDetailModalVisible(true));
        break;

      case 'class':
        navigate({
          pathname: `${item?.id}/course-classes`,
        });
        break;
      case 'CourseExamReviews':
        navigate({
          pathname: `${item?.id}/courseexamreviews`,
        });
        break;
      case 'reviews':
        navigate({
          pathname: `${item?.id}/course-reviews`,
        });

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/courseonlines/${item.id}`);
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
    return <SubTableList courseId={record?.id} />;
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
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Giáo viên',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 200,
      render: (text, record) => {
        return (
          <div>
            <div className={`me-2 badge badge-light-${record?.isActive ? 'success' : 'danger'}`}>{`${record?.isActive ? 'Sử dụng' : 'Không sử dụng'}`}</div>
            {record?.isPublic ? <div className={`badge badge-light-${record?.isPublic ? 'success' : 'danger'}`}>{`${record?.isPublic ? 'Phát hành' : 'Không phát hành'}`}</div> : <></>}
          </div>
        );
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 180,
      render: (text, record) => {
        return (
          <div className="d-flex ">
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

            {CheckRole(currentPermissions, ['Permissions.CourseClasses.View', 'Permissions.CourseClasses.Manage']) ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Danh sách lớp học"
                onClick={() => {
                  handleButton(`class`, record);
                }}
              >
                <i className="fa fa-clipboard-list"></i>
              </a>
            ) : (
              <></>
            )}
            {CheckRole(currentPermissions, ['Permissions.CourseClasses.Manage']) ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Thêm mới lớp học"
                onClick={() => {
                  handleButton(`add-class`, record);
                }}
              >
                <i className="fa fa-plus"></i>
              </a>
            ) : (
              <></>
            )}
            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  CheckRole(currentPermissions, ['Permissions.CourseOnline.Manage'])
                    ? {
                        key: 'reviews',
                        disabled: false,
                        label: (
                          <a
                            className="p-2 text-dark"
                            data-toggle="m-tooltip"
                            title="Danh sách bài đánh giá"
                            onClick={() => {
                              handleButton(`reviews`, record);
                            }}
                          >
                            <i className="fas fa-tasks me-2"></i>
                            Danh sách bài đánh giá
                          </a>
                        ),
                      }
                    : {},
                  CheckRole(currentPermissions, ['Permissions.CourseOnline.Manage'])
                    ? {
                        key: 'comments',
                        disabled: false,
                        label: (
                          <a
                            className="p-2 text-dark"
                            data-toggle="m-tooltip"
                            title="Danh sách nhận xét bài đánh giá"
                            onClick={() => {
                              handleButton(`CourseExamReviews`, record);
                            }}
                          >
                            <i className="fas fa-tasks me-2"></i>
                            Danh sách nhận xét bài đánh giá
                          </a>
                        ),
                      }
                    : {},
                  CheckRole(currentPermissions, ['Permissions.CourseOnline.Manage'])
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
                            <a className="p-2 text-dark" data-toggle="m-tooltip" title="Xoá">
                              <i className="fas fa-trash me-2"></i>
                              Xoá
                            </a>
                          </Popconfirm>
                        ),
                      }
                    : {},
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
              CheckRole(currentPermissions, ['Permissions.CourseClasses.View', 'Permissions.CourseClasses.Manage'])
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
    </>
  );
};

export default UsersList;
