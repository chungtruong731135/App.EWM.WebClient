/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import RoadMapItemModal from './RoadMapItemModal';
import { useNavigate, createSearchParams } from 'react-router-dom';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const { dataSearch, courseId } = props;
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
          `api/v1/learningroadmapitems/search`,
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
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;
      case 'items':
        var params = {
          learningRoadmapId: item?.id,
        };
        navigate({
          pathname: 'roadmapitems',
          search: `?${createSearchParams(params)}`,
        });

        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/learningroadmapitems/${item.id}`);
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

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Loại gợi ý ',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => <div>{text == 0 ? 'Chuyên đề' : 'Khoá học'}</div>,
    },
    {
      title: 'Chuyên đề/Khoá học',
      dataIndex: 'parent',
      key: 'parent',
      render: (text, record) => <div>{record?.type == 0 ? record?.topicName : record?.courseTitle}</div>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Phần trăm làm bài chính xác từ',
      dataIndex: 'fromScore',
      key: 'fromScore',
    },
    {
      title: 'Phần trăm làm bài chính xác đến',
      dataIndex: 'toScore',
      key: 'toScore',
    },

    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 100,
      render: (text, record) => {
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
              <i className="fa fa-eye"></i>
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
                <i className="fas fa-trash"></i>
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
      {modalVisible ? <RoadMapItemModal courseId={courseId} /> : <></>}
    </>
  );
};

export default UsersList;
