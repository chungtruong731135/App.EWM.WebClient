/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Dropdown, Popconfirm, Spin } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, FILE_URL, requestDOWNLOADFILE } from '@/utils/baseAPI';
import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import ImportBookModal from './ImportBookModal';
import ViewBookModal from './ViewBookModal';
import { useNavigate } from 'react-router-dom';

const UsersList = props => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const { dataSearch } = props;
  const random = useSelector(state => state.modal.random);
  const navigate = useNavigate();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(20);
  const [offset, setOffset] = useState(1);
  const [count, setCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalImport, setIsModalImport] = useState(false);
  const [isModalPreview, setIsModalPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/books/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ['name', 'code'],
                keyword: dataSearch?.keyword ?? null,
              },
              pageNumber: offset,
              pageSize: size,
              //orderBy: ['createdOn DESC'],
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
    return () => { };
  }, [refreshing]);

  useEffect(() => {
    if (!refreshing) {
      setRefreshing(true);
    }
    return () => { };
  }, [offset, size, dataSearch, random]);

  useEffect(() => {
    setOffset(1);
    return () => { };
  }, [dataSearch]);

  const handleButton = async (type, item) => {
    switch (type) {
      case 'lecturers':
        navigate({
          pathname: `${item?.id}/lecturers`,
        });
        break;
      case 'questions':
        navigate(`${item?.id}/questions`, { state: { item } });
        break;
      case 'authors':
        navigate({
          pathname: `${item?.id}/authors`,
        });
        break;
      case 'ebook':
        navigate({
          pathname: `${item?.id}/pages`,
        });
        break;
      case 'muc-luc':
        navigate({
          pathname: `${item?.id}/tables`,
        });
        break;
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));
        break;

      case 'delete':
        var res = await requestDELETE(`api/v1/books/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'import-book':
        //handleXoaVanBan(item)
        setIsModalImport(true);
        dispatch(actionsModal.setDataModal(item));
        break;

      case 'view-book':
        //handleXoaVanBan(item)
        setIsModalPreview(true);
        dispatch(actionsModal.setDataModal(item));
        break;

      case 'export-questions':
        setLoading(true);
        toast.info('Đang xuất câu hỏi...', { autoClose: false });
        try {
          const res = await requestDOWNLOADFILE(`api/public/v1/books/export-questions`, {
            bookId: item?.id,
          });

          if (res) {
            const downloadUrl = window.URL.createObjectURL(res.data);
            const link = document.createElement('a');
            document.body.appendChild(link);
            link.href = downloadUrl;
            const fileName = `Danh sách câu hỏi - ${item?.name}.docx`;

            link.setAttribute('download', fileName);
            link.click();
            window.URL.revokeObjectURL(downloadUrl);
            link.parentNode.removeChild(link);

            toast.dismiss();
            toast.success('Xuất câu hỏi thành công!');
          } else {
            toast.dismiss();
            toast.error('Không thể xuất câu hỏi, vui lòng thử lại!');
          }
        } catch (errorInfo) {
          console.log('Failed:', errorInfo);
          toast.error('Failed to download file.');
        }
        setLoading(false);
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
      width: 80,
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Ảnh bìa',
      width: '10%',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text, record, index) => {
        return (
          <>
            <div className="d-flex align-items-center" style={{ overflow: 'hidden' }}>
              {/* begin:: Avatar */}
              <div className="symbol overflow-hidden me-3">
                <div>
                  {record.imageUrl ? (
                    <img
                      src={record.imageUrl.includes('https://') || record.imageUrl.includes('http://') ? record.imageUrl : FILE_URL + `${record.imageUrl.startsWith('/') ? record.imageUrl.substring(1) : record.imageUrl}`}
                      alt={record.name}
                      className="w-100 symbol-label"
                    />
                  ) : (
                    <div className={clsx('symbol-label fs-3', `bg-light-${record.isActive ? 'danger' : ''}`, `text-${record.isActive ? 'danger' : ''}`)}></div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Thuộc bộ sách',
      dataIndex: 'bookTypeName',
      key: 'bookTypeName',
    },
    {
      title: 'Nhóm sách',
      dataIndex: 'bookCatalogName',
      key: 'bookCatalogName',
    },
    {
      title: 'Khối',
      dataIndex: 'bookGradeName',
      key: 'bookGradeName',
    },
    {
      title: 'Môn học',
      dataIndex: 'bookSubjectName',
      key: 'bookSubjectName',
    },
    {
      title: 'Số trang',
      dataIndex: 'pages',
      key: 'pages',
      render: (_, record) => <>{record?.note ? <Spin size="small" /> : <span>{record?.pages ? record.pages : 0}</span>}</>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 60,
      render: (text, record) => {
        return <div className={`badge badge-light-${record?.isActive ? 'success' : 'danger'}`}>{`${record?.isActive ? 'Phát hành' : 'Không phát hành'}`}</div>;
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
              <i className="fa fa-pen-to-square"></i>
            </a>

            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Mục lục"
              onClick={() => {
                handleButton(`muc-luc`, record);
              }}
            >
              <i className="fa fa-book"></i>
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
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem sách"
              onClick={() => {
                handleButton(`view-book`, record);
              }}
            >
              <i className="fa fa-eye"></i>
            </a>

            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Nhập sách"
              onClick={() => {
                handleButton(`import-book`, record);
              }}
            >
              <i className="fa fa-down-long"></i>
            </a>

            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  {
                    key: 'pages',
                    disabled: false,
                    label: (
                      <a
                        className="p-2 text-dark"
                        data-toggle="m-tooltip"
                        title="Nội dung Ebook"
                        onClick={() => {
                          handleButton(`ebook`, record);
                        }}
                      >
                        <i className="fas fa-book-open me-2"></i>
                        Nội dung Ebook
                      </a>
                    ),
                  },
                  // {
                  //   key: 'lecturers',
                  //   disabled: false,
                  //   label: (
                  //     <a
                  //       className="p-2 text-dark"
                  //       data-toggle="m-tooltip"
                  //       title="Danh sách bài giảng"
                  //       onClick={() => {
                  //         handleButton(`lecturers`, record);
                  //       }}
                  //     >
                  //       <i className="fas fa-video me-2"></i>
                  //       Danh sách bài giảng
                  //     </a>
                  //   ),
                  // },
                  {
                    key: 'questions',
                    disabled: false,
                    label: (
                      <a
                        className="p-2 text-dark"
                        data-toggle="m-tooltip"
                        title="Danh sách câu hỏi"
                        onClick={() => {
                          handleButton(`questions`, record);
                        }}
                      >
                        <i className="fas fa-file-circle-question me-2"></i>
                        Danh sách câu hỏi
                      </a>
                    ),
                  },
                  {
                    key: 'authors',
                    disabled: false,
                    label: (
                      <a
                        className="p-2 text-dark"
                        data-toggle="m-tooltip"
                        title="Tác giả"
                        onClick={() => {
                          handleButton(`authors`, record);
                        }}
                      >
                        <i className="fas fa-user me-2"></i>
                        Tác giả
                      </a>
                    ),
                  },
                  {
                    key: 'export-questions',
                    disabled: false,
                    label: (
                      <a
                        className="p-2 text-dark"
                        data-toggle="m-tooltip"
                        title="Xuất danh sách câu hỏi"
                        onClick={() => {
                          handleButton(`export-questions`, record);
                        }}
                      >
                        <i className="fas fa-file-word me-2"></i>
                        Xuất danh sách câu hỏi
                      </a>
                    ),
                  },
                ],
              }}
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1" title="Thao tác nhanh">
                <i className="fa fa-ellipsis-h"></i>
              </a>
            </Dropdown>
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
      {isModalImport ? <ImportBookModal isModalImport={isModalImport} setIsModalImport={setIsModalImport} /> : <></>}
      {isModalPreview ? <ViewBookModal isModalPreview={isModalPreview} setIsModalPreview={setIsModalPreview} /> : <></>}
    </>
  );
};

export default UsersList;
