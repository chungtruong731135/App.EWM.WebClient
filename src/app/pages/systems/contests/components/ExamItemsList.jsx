/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ContestExamModal';

const UsersList = props => {
  const dispatch = useDispatch();
  const { dataSearch, handleAddData } = props;
  const random = useSelector(state => state.modal.random);
  const modalVisible = useSelector(state => state.modal.modalVisible);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/contestexams/search`,
          _.assign(
            {
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
    fetchData();

    return () => {};
  }, [offset, size, dataSearch, random]);

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/contestexams/${item.id}`);
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
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Tên đề thi',
      dataIndex: 'examTitle',
      key: 'examTitle',
      render: (text, record, index) => (
        <div
          className="text-gray-900 text-hover-primary cursor-pointer"
          onClick={() => {
            window.open(`${window.location.origin}/system/study/exams/${record.examId}`, '_blank', 'noreferrer');
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: 'Thời gian thi (Phút)',
      dataIndex: 'examDuration',
      key: 'examDuration',
    },
    {
      title: 'Tổng số câu hỏi',
      dataIndex: 'examTotalQuestion',
      key: 'examTotalQuestion',
    },
    {
      title: 'Tổng điểm',
      dataIndex: 'examTotalScore',
      key: 'examTotalScore',
    },
    {
      title: 'Số lượt làm bài/người dùng',
      dataIndex: 'maxSubmissions',
      key: 'maxSubmissions',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text, record) => {
        return (
          <div>
            <div className={`me-2 badge badge-light-${record?.isActive ? 'success' : 'danger'}`}>{`${record?.isActive ? 'Sử dụng' : 'Không sử dụng'}`}</div>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 80,
      render: (text, record) => {
        return (
          <div className="d-flex">
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
            <div className="text-center">
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
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
