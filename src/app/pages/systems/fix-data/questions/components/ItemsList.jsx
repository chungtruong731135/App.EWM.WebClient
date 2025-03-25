/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import { useNavigate, createSearchParams } from 'react-router-dom';

const UsersList = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const { dataSearch } = props;
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
          `api/v1/questions/cauhoisai`,{}
         
        );
        setDataTable(res?? []);
        setCount(res?.length);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
      fetchData();
      setRefreshing(false);

    return () => {};
  }, [random]);

 
  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;
      case 'them-moi':
        dispatch(
          actionsModal.setDataModal({
            ...null,
            readOnly: false,
            parentId: item?.id,
          })
        );
        dispatch(actionsModal.setModalVisible(true));

        break;

      case 'children':
        var params = {
          parentId: item?.id,
        };
        navigate({
          search: `?${createSearchParams(params)}`,
        });

        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/questions/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'remove':
        var res = await requestPOST(`api/v1/questions/remove-parentid`, { id: dataSearch?.parentId, datas: [record?.id] });
        if (res?.succeeded) {
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
      width: 50,
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Mã',
      dataIndex: 'codeId',
      key: 'codeId',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div dangerouslySetInnerHTML={{ __html: record?.titleEn }} />
          <div className="fw-bold text-gray-600" dangerouslySetInnerHTML={{ __html: record?.title }} />
        </div>
      ),
    },

    {
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      width: 150,
    },
    {
      title: 'Chủ đề',
      dataIndex: 'topicName',
      key: 'topicName',
      width: 150,
    },
    {
      title: 'Chương trình học',
      dataIndex: 'questionLevelName',
      key: 'questionLevelName',
      width: 150,
    },
    {
      title: 'Loại câu hỏi',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      ellipsis: true,
      render: (text, record) => {
        return text == 0 ? 'Chọn đáp án' : text == 1 ? 'Điền đáp án' : text == 2 ? 'Tự luận' : text == 3 ? 'Tổ hợp câu hỏi' : '';
      },
    },

    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 100,
      fixed: 'right',
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
            {record?.type == 3 && (
              <>
                <a
                  className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                  data-toggle="m-tooltip"
                  title="Danh sách câu hỏi phụ"
                  onClick={() => {
                    handleButton(`children`, record);
                  }}
                >
                  <i className="fa fa-clipboard-list"></i>
                </a>
                <a
                  className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                  data-toggle="m-tooltip"
                  title="Thêm mới câu hỏi phụ"
                  onClick={() => {
                    handleButton(`them-moi`, record);
                  }}
                >
                  <i className="fa fa-plus"></i>
                </a>
              </>
            )}

            {dataSearch?.parentId ? (
              <>
                <Popconfirm
                  title="Xoá câu hỏi khỏi tổ hợp?"
                  onConfirm={() => {
                    handleButton(`delete`, record);
                  }}
                  okText="Xoá"
                  cancelText="Huỷ"
                >
                  <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá khỏi tổ hợp">
                    <i className="fa fa-times"></i>
                  </a>
                </Popconfirm>
              </>
            ) : (
              <></>
            )}
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
            scroll={{
              x: 1300,
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
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
