/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, FILE_URL } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import dayjs from 'dayjs';
import ModalScore from './ModalScore';
import ModalAssignment from './ModalAssignment';
const UsersList = props => {
  const dispatch = useDispatch();
  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalScoreVisible, setModalScoreVisible] = useState(false);
  const [modalDetailVisible, setModalDetailVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/classsessionassignments/search`,
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

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        setModalDetailVisible(true);

        break;
      case 'cham-diem':
        dispatch(actionsModal.setDataModal(item));
        setModalScoreVisible(true);
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
  const getFileName = fileUrl => {
    var fileName = '';
    if (fileUrl.length > 0) {
      fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1, fileUrl.length);
    }
    return fileName;
  };
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'studentFullName',
      key: 'studentFullName',
    },
    {
      title: 'Tài khoản',
      dataIndex: 'studentUserName',
      key: 'studentUserName',
    },
    {
      title: 'File bài tập',
      dataIndex: 'files',
      key: 'files',
      render: text => {
        var files = text?.split('##');
        return (
          <div className="d-flex flex-row flex-wrap">
            {files?.map(i => (
              <a
                href={`${FILE_URL + i}`}
                target="_blank"
                className="btn btn-icon btn-active-color-danger btn-sm mx-1 my-1"
                title={getFileName(i) || 'Tệp đính kèm'}
                // onClick={() => {}}
              >
                <i className="fa fa-file-pdf fs-3"></i>{' '}
              </a>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Thời gian nộp',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 120,
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
              <i className="fas fa-eye"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Chấm điểm"
              onClick={() => {
                handleButton(`cham-diem`, record);
              }}
            >
              <i className="fas fa-clipboard-check"></i>
            </a>
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
      {modalScoreVisible ? <ModalScore modalVisible={modalScoreVisible} setModalVisible={setModalScoreVisible} /> : <></>}
      {modalDetailVisible ? <ModalAssignment modalVisible={modalDetailVisible} setModalVisible={setModalDetailVisible} /> : <></>}
    </>
  );
};

export default UsersList;
