/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';

import SubTableList from '@/app/pages/systems/questionlevels/components/ItemsList';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dataSearch, courseId } = props;
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/topics/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ['name', 'code'],
                keyword: dataSearch?.keyword ?? null,
              },
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
              courseId: courseId,
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
        dispatch(actionsModal.setTopicDetail(item));
        dispatch(actionsModal.setTopicDetailModalVisible(true));

        break;
      case 'add-questionlevel':
        dispatch(
          actionsModal.setQuestionLevelDetail({
            readOnly: false,
            courseId: item?.courseId,
            topicId: item?.id,
            topicName: item?.name,
          })
        );
        dispatch(actionsModal.setQuestionLevelModalVisible(true));
        break;
      case 'questionLevels':
        if (courseId) {
          navigate({
            pathname: `${courseId}/topics/${item?.id}/questionlevels`,
          });
        } else {
          navigate({
            pathname: `${item?.id}/questionlevels`,
          });
        }

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/topics/${item.id}`);
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

  const expandedRowRender = (record, index, indent, expanded) => {
    return <SubTableList topicId={record?.id} courseId={courseId} />;
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
      title: 'Chủ đề',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      hidden: courseId ? true : false,
    },
    {
      title: 'Tình trạng',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
      render: (text, record) => {
        return <div className={`badge badge-light-${record?.isActive ? 'success' : 'danger'}`}>{record?.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}</div>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div dangerouslySetInnerHTML={{ __html: record?.description }} />
        </div>
      ),
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
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Danh sách chương trình học"
              onClick={() => {
                handleButton(`questionLevels`, record);
              }}
            >
              <i className="fa fa-clipboard-list"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Thêm mới chương trình học"
              onClick={() => {
                handleButton(`add-questionlevel`, record);
              }}
            >
              <i className="fa fa-plus"></i>
            </a>
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
          <TableList
            expandable={{
              expandedRowRender,
            }}
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
