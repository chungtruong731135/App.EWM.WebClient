import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from '@/app/pages/systems/surveys/components/ModalSurveyAnswerDetails';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const UsersList = ({ dataSearch, surveyTemplate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const modalVisible = useSelector(state => state.modal.modalVisible);
  const random = useSelector(state => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(20);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [columnsTable, setColumnsTable] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/surveys/list-users`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ['createdOn DESC'],
            },
            dataSearch
          )
        );

        const data = res?.data ?? [];
        data.map(item => {
          const surveyAnswers = item?.surveyAnswers ?? [];
          surveyAnswers.map(survey => {
            if (survey.surveyQuestionOptionId) {
              item[survey.surveyQuestionId] = survey?.content;
            } else {
              item[survey.surveyQuestionId] = survey?.answer;
            }
          });
          return item;
        });
        console.log(data);

        setDataTable(data);
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
        dispatch(actionsModal.setDataModal({ ...item, questions: surveyTemplate?.questions ?? [] }));
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

      default:
        break;
    }
  };
  const defaultColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
      fixed: 'left',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      fixed: 'left',
      ellipsis: true,
      width: 250,
      render: (text, record, index) => <TDTableColumnHoTen showMenu={true} dataUser={{ type: 1, fullName: record?.fullName, imageUrl: record?.imageUrl, userName: record?.userName }} index={index} />,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 130,
    },
    {
      title: 'Đợt khảo sát',
      dataIndex: 'surveyName',
      key: 'surveyName',
      width: 150,
    },
    surveyTemplate?.sourceType == 'CourseOnline' || surveyTemplate?.sourceType == 'CourseClass' || surveyTemplate?.sourceType == 'OnlineProgram'
      ? {
          title: 'Lớp tham gia',
          dataIndex: 'courseClass',
          key: 'courseClass',
          width: 150,
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
      width: 150,
      render: text => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150,
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
  ];

  const itemThaoTac = {
    title: 'Thao tác',
    dataIndex: '',
    key: '',
    fixed: 'right',
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
              <i className="fa fa-trash"></i>
            </a>
          </Popconfirm>
        </div>
      );
    },
  };

  useEffect(() => {
    if (surveyTemplate?.questions ?? null) {
      console.log(surveyTemplate?.questions);
      var temp = [...defaultColumns];
      (surveyTemplate?.questions ?? []).map(item => {
        temp.push({
          title: item.content,
          dataIndex: `${item.id}`,
          key: `${item.id}`,
          width: 150,
        });
      });
      temp.push(itemThaoTac);
      setColumnsTable(temp);
    } else {
      defaultColumns.push(itemThaoTac);
      setColumnsTable(defaultColumns);
    }

    return () => {};
  }, [surveyTemplate, dataTable]);

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TableList
            scroll={{
              x: 1300,
            }}
            dataTable={dataTable}
            columns={columnsTable}
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
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
