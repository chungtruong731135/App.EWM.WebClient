/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import { useNavigate } from 'react-router-dom';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';
import TableList from '@/app/components/TableList';
import ModalSurveyAnswerDetails from './ModalSurveyAnswerDetails';
import dayjs from 'dayjs';
import { Popconfirm } from 'antd';

const UsersList = ({ surveyId, questions, surveyTemplate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const modalVisible = useSelector(state => state.modal.modalVisible);

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
        const res = await requestPOST(`api/v1/surveys/list-users`, {
          pageNumber: offset,
          pageSize: size,
          surveyId: surveyId,
        });
        setDataTable(res?.data ?? []);
        setCount(res?.totalCount ?? 0);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (refreshing && surveyId) {
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
  }, [offset, size, surveyId, random]);
  useEffect(() => {
    setOffset(1);
    return () => {};
  }, [surveyId]);

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal({ ...item, questions: questions }));
        dispatch(actionsModal.setModalVisible(true));
        break;

      case 'delete':
        var res = await requestPOST(`api/v1/surveys/remove-users`, { ids: [item.id] });
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
      width: '5%',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      /*  width: '10%', */
      render: (text, record, index) => <TDTableColumnHoTen showMenu={true} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: '15%',
    },
    surveyTemplate?.sourceType == 'CourseOnline' || surveyTemplate?.sourceType == 'CourseClass' || surveyTemplate?.sourceType == 'OnlineProgram'
      ? {
          title: 'Lớp tham gia',
          dataIndex: 'courseClass',
          key: 'courseClass',
          render: (text, record) => {
            var lst = JSON.parse(record?.sourceName ?? '[]');
            return (
              <div className="row">
                {lst.map(item => (
                  <div className="d-flex p-2" key={Math.random().toString()}>
                    <div>{item.Name}</div>
                  </div>
                ))}
              </div>
            );
          },
        }
      : null,
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'beginDate',
      key: 'beginDate',
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (text, record) => {
        return (
          <div>
            <div className={`me-2 badge badge-light-${record?.status == 1 ? 'success' : 'danger'}`}>{`${record?.status == 1 ? 'Kết thúc' : 'Đang thực hiện'}`}</div>
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
      <TableList dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
      {modalVisible ? <ModalSurveyAnswerDetails /> : <></>}
    </>
  );
};

export default UsersList;
