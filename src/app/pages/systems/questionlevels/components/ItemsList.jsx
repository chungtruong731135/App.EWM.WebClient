/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import QuestionLevelDetailModal from './QuestionLevelDetailModal';
import { useNavigate, createSearchParams } from 'react-router-dom';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { dataSearch, topicId, courseId } = props;
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
          `api/v1/questionlevels/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ['name', 'code'],
                keyword: dataSearch?.keyword ?? null,
              },
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
              topicId: topicId,
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
        dispatch(actionsModal.setQuestionLevelDetail(item));
        dispatch(actionsModal.setQuestionLevelModalVisible(true));

        break;
      case 'questions':
        if (courseId && topicId) {
          navigate({
            pathname: `${courseId}/topics/${topicId}/questionlevels/${item?.id}/questions`,
          });
        } else if (topicId) {
          navigate({
            pathname: `${topicId}/questionlevels/${item?.id}/questions`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/questions`,
          });
        }

        break;

      case 'exams':
        if (courseId && topicId) {
          navigate({
            pathname: `${courseId}/topics/${topicId}/questionlevels/${item?.id}/exams`,
          });
        } else if (topicId) {
          navigate({
            pathname: `${topicId}/questionlevels/${item?.id}/exams`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/exams`,
          });
        }

        break;

      case 'levelItems':
        /*  navigate({
          pathname: `${item?.id}/questionlevelItems`,
        }); */
        if (courseId && topicId) {
          navigate({
            pathname: `${courseId}/topics/${topicId}/questionlevels/${item?.id}/questionlevelItems`,
          });
        } else if (topicId) {
          navigate({
            pathname: `${topicId}/questionlevels/${item?.id}/questionlevelItems`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/questionlevelItems`,
          });
        }
        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/questionlevels/${item.id}`);
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
      width: 50,
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Chương trình học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Chủ đề',
      dataIndex: 'topicName',
      key: 'topicName',
      hidden: topicId ? true : false,
    },
    {
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      hidden: topicId ? true : false,
    },
    {
      title: 'Tình trạng',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (text, record) => {
        return <div className={`badge badge-light-${record?.isActive ? 'success' : 'danger'}`}>{record?.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}</div>;
      },
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (text, record) => {
        return <div className={`badge badge-light-${record?.isActive ? 'success' : 'danger'}`}>{record?.type == 'Quiz' ? 'Kiểm tra' : record?.type == 'UnitTest' ? 'Thử thách' : 'Bài học'}</div>;
      },
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

            {record.type == 'Learn' || !record.type ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Ngân hàng câu hỏi"
                onClick={() => {
                  handleButton(`questions`, record);
                }}
              >
                <i className="fas fa-clipboard-list"></i>
              </a>
            ) : (
              <></>
            )}
            {record.type == 'Learn' || !record.type ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Danh sách buổi học"
                onClick={() => {
                  handleButton(`levelItems`, record);
                }}
              >
                <i className="fas fa-book-open"></i>
              </a>
            ) : (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Danh sách đề"
                onClick={() => {
                  handleButton(`exams`, record);
                }}
              >
                <i className="fas fa-book"></i>
              </a>
            )}
            <Popconfirm
              title="Xoá?"
              onConfirm={() => {
                handleButton(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
                <i className="fa fa-trash"></i>
              </a>
            </Popconfirm>
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
    </>
  );
};

export default UsersList;
