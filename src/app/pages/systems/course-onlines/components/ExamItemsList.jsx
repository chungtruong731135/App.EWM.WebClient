/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, requestPOST_NEW } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';

import ModalItem from './CourseExamDetailModal';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dataSearch, handleAddData } = props;
  const random = useSelector(state => state.modal.random);

  const [modalVisible, setModalVisible] = useState(false);
  const [itemEdit, setItemEdit] = useState(null);

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
          `api/v1/courseexams/search`,
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
        setModalVisible(true);
        setItemEdit(item);

        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/courseexams/${item.id}`);
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

  const ChangeStatus = async (item, enable) => {
    console.log('enable', !enable);
    const res = await requestPOST_NEW(`api/v1/courseexams/toggle-status`, { id: item?.id, isDisable: !enable });
    if (res.status === 200) {
      toast.success('Thao tác thành công!');
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const ChangeAllowAll = async (item, enable) => {
    console.log('enable', !enable);
    const res = await requestPOST_NEW(`api/v1/courseexams/toggle-allowall`, { id: item?.id, disableAll: !enable });
    if (res.status === 200) {
      toast.success('Thao tác thành công!');
    } else {
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
      title: 'Dành cho chương trình tuyển sinh',
      dataIndex: 'courseOnlineProgramNames',
      key: 'courseOnlineProgramNames',
    },
    {
      title: 'Dành cho lớp học',
      dataIndex: 'courseClassNames',
      key: 'courseClassNames',
    },
    {
      title: 'Loại đánh giá',
      dataIndex: 'type',
      key: 'type',
      render: text => (text == 0 ? 'Kiểm tra đầu vào' : 'Kiểm tra đầu ra'),
    },
    {
      title: 'Áp dụng cho toàn bộ',
      dataIndex: 'disableAll',
      key: 'disableAll',
      width: 150,
      render: (text, record) => {
        let checked = record?.disableAll == true ? false : true;
        return (
          <div className="d-flex justify-content-center">
            <Switch
              defaultChecked={checked}
              onChange={enable => {
                ChangeAllowAll(record, enable);
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Sử dụng',
      dataIndex: 'isDisable',
      key: 'isDisable',
      width: 150,
      render: (text, record) => {
        let checked = record?.isDisable == true ? false : true;
        return (
          <div className="d-flex justify-content-center">
            <Switch
              defaultChecked={checked}
              onChange={enable => {
                ChangeStatus(record, enable);
              }}
            />
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
      {modalVisible ? <ModalItem modalVisible={modalVisible} setModalVisible={setModalVisible} dataModal={itemEdit} /> : <></>}
    </>
  );
};

export default UsersList;
