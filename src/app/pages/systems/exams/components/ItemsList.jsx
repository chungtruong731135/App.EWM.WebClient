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
import ModalItem from './ChiTietModal';
import { useNavigate, createSearchParams } from 'react-router-dom';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalExamState = useSelector(state => state.modal.modalExamState);
  const modalVisible = modalExamState?.modalVisible ?? false;
  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);

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
          `api/v1/exams/search`,
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
  // useEffect(() => {
  //   setOffset(1);

  //   return () => {};
  // }, [dataSearch]);

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(
          actionsModal.setModalExamState({
            modalVisible: true,
            modalData: item,
          })
        );

        break;
      case 'content':
        navigate(`/system/study/exams/${item?.id}`);

        break;
      case 'result':
        var params = {
          examId: item?.id,
        };
        navigate({
          pathname: 'result',
          search: `?${createSearchParams(params)}`,
        });

        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/exams/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'cham-lai-diem':
        var ress = await requestPOST(`api/v1/exams/cham-lai-bai`, { id: item.id });
        if (ress) {
          toast.success('Hệ thống đang xử lý dữ liệu, vui lòng kiểm tra lại kết quả bài làm của học sinh sau ít phút!');
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
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Tên đề thi',
      dataIndex: 'title',
      key: 'title',
    },

    {
      title: 'Thời gian thi (Phút)',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
    {
      title: 'Tổng số câu hỏi',
      dataIndex: 'totalQuestion',
      key: 'totalQuestion',
      width: 130,
    },
    {
      title: 'Tổng điểm',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
    },
    {
      title: 'Loại đề',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      ellipsis: true,
      render: (text, record, index) => {
        return text == 0 ? (
          <span>Đề luyện tập theo chương trình học</span>
        ) : text == 1 ? (
          <span>Đề thi thử</span>
        ) : text == 2 ? (
          <span>Đề kiểm tra kiến thức</span>
        ) : text == 3 ? (
          <span>Đề luyện thi, đánh giá (Hệ thống tạo tự động)</span>
        ) : text == 4 ? (
          <span>Đề luyện theo chuyên đề (Hệ thống tạo tự động)</span>
        ) : (
          <></>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isFree',
      key: 'isFree',
      width: 130,
      render: (text, record) => {
        return (
          <div className="d-flex align-items-start flex-column">
            <div className={`me-2 badge badge-light-${record?.isFree ? 'success' : 'danger'}`}>{`${record?.isFree ? 'Miễn phí' : 'Tính phí'}`}</div>
            <div className={`badge badge-light-${record?.isActive ? 'info' : 'danger'} mt-2`}>{`${record?.isActive ? 'Hoạt động' : 'Không hoạt động'}`}</div>
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
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Danh sách mã đề - câu hỏi"
              onClick={() => {
                handleButton(`content`, record);
              }}
            >
              <i className="fa fa-clipboard-list"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Danh sách kết quả thi của học sinh"
              onClick={() => {
                handleButton(`result`, record);
              }}
            >
              <i className="fa fa-list-check"></i>
            </a>
            <Popconfirm
              title="Chấm lại điểm?"
              onConfirm={() => {
                handleButton(`cham-lai-diem`, record);
              }}
              okText="Chấm lại điểm?"
              cancelText="Huỷ"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Chấm lại điểm ">
                <i className="fa fa-rotate"></i>
              </a>
            </Popconfirm>
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
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
