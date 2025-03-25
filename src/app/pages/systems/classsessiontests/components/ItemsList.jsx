/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { Dropdown, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { requestPOST, requestDELETE, requestDOWNLOADFILE } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CheckRole } from '@/utils/utils';
import { useAuth } from '@/app/modules/auth';

const UsersList = props => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const { dataSearch } = props;
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
          `api/v1/classsessiontests/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ['name', 'code'],
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
        /* var params = {
          classSessionTestId: item?.id,
          classSessionId: item?.classSessionId,
        };
        navigate({
          pathname: 'classsessiontest',
          search: `?${createSearchParams(params)}`,
        }); */
        navigate({
          pathname: `${item?.id}`,
        });
        break;
      case 'result':
        navigate({
          pathname: `${item?.id}/student-tests`,
        });

        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/classsessiontests/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          setRefreshing(true);
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'send-zalo':
        var resZalo = await requestPOST(`api/v1/classsessiontests/send-zalo`, {
          id: item?.id,
        });
        if (resZalo) {
          toast.success('Thao tác thành công!');
          setRefreshing(true);
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'export-excel':
        var resExport = await requestDOWNLOADFILE(`api/v1/classsessiontests/export-danh-sach-bai-cua-hoc-sinh`, { classSessionTestId: item?.id });
        var fileData = new Blob([resExport.data], { type: 'application/vnd.ms-excel' });
        var downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(fileData);
        downloadLink.download = 'KetQuaBTVN.xlsx';
        downloadLink.click();
        break;

      case 'start-test':
        var res1 = await requestPOST(`api/v1/classsessiontests/update-status`, {
          id: item?.id,
          status: 1,
        });
        if (res1) {
          toast.success('Thao tác thành công!');
          setRefreshing(true);
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'finish-test':
        var res2 = await requestPOST(`api/v1/classsessiontests/update-status`, {
          id: item?.id,
          status: 2,
        });
        if (res2) {
          toast.success('Thao tác thành công!');
          setRefreshing(true);
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
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
      title: 'Tên bài kiểm tra',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Thời gian làm (phút)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text, record) => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text, record) => <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },
    {
      title: 'Loại bài kiểm tra',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => <div>{text == 0 ? 'Bài tập trên lớp' : 'Bài tập về nhà'}</div>,
    },
    {
      title: 'Loại câu hỏi',
      dataIndex: 'questionType',
      key: 'questionType',
      render: (text, record) => <div>{text == 0 ? 'Câu hỏi trên hệ thống' : 'Câu hỏi qua file'}</div>,
    },
    {
      title: 'Tình trạng',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        var check = dayjs().isAfter(dayjs(record?.startTime)) ? 1 : dayjs().isAfter(dayjs(record?.endTime)) ? 2 : 0;
        return (
          <>
            <div className={`badge badge-light-${text == 0 || check == 0 ? 'info' : text == 1 || check == 1 ? 'success' : 'danger'}`}>
              {/* {text == 0 || check == 0
              ? "Chưa bắt đầu"
              : text == 1 || check == 1
              ? "Đang  diễn ra"
              : "Đã kết thúc"} */}
              {text == 2 ? 'Đã kết thúc' : text == 1 ? 'Đang  diễn ra' : 'Chưa bắt đầu'}
            </div>
            {record.isPublic ? <div className={`badge badge-light-danger'}`}>Không sử dụng</div> : <></>}
          </>
        );
      },
    },
    {
      title: '',
      dataIndex: 'result',
      key: 'result',
      align: 'center',
      render: (text, record) => {
        var check = dayjs().isAfter(dayjs(record?.startTime));
        return (
          <button
            // disabled={record?.status == 0 && !check}
            // className={`btn btn-${
            //   record?.status == 0 && !check ? "secondary" : "info"
            // } btn-sm py-2`}
            className="btn  btn-sm btn-info py-2"
            onClick={() => {
              handleButton(`result`, record);
            }}
          >
            Kết quả
          </button>
        );
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 120,
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

            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xuất kết quả làm bài của học sinh"
              onClick={() => {
                handleButton(`export-excel`, record);
              }}
            >
              <i className="fa fa-print"></i>
            </a>

            <Popconfirm
              title="Gửi thông báo?"
              onConfirm={() => {
                handleButton(`send-zalo`, record);
              }}
              okText="Gửi"
              cancelText="Huỷ"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Gửi thông báo kết quả làm bài tập cho phụ huynh">
                <i className="fa fa-paper-plane"></i>
              </a>
            </Popconfirm>
            {CheckRole(currentUser?.permissions, ['Permissions.ClassSessions.Manage']) && (
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
            )}
            <Dropdown
              trigger={'click'}
              menu={{
                items: [
                  record?.status == 0
                    ? {
                        key: 'attendance',
                        disabled: false,
                        label: (
                          <a
                            className="p-2 text-dark"
                            data-toggle="m-tooltip"
                            title="Bắt đầu"
                            onClick={() => {
                              handleButton(`start-test`, record);
                            }}
                          >
                            <i className="fas fa-hourglass-start me-3"></i>
                            Bắt đầu
                          </a>
                        ),
                      }
                    : null,
                  record?.status == 1
                    ? {
                        key: 'attendance',
                        disabled: false,
                        label: (
                          <a
                            className="p-2 text-dark"
                            data-toggle="m-tooltip"
                            title="Kết thúc"
                            onClick={() => {
                              handleButton(`finish-test`, record);
                            }}
                          >
                            <i className="fas fa-hourglass-end me-3"></i>
                            Kết thúc
                          </a>
                        ),
                      }
                    : null,
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
    </>
  );
};

export default UsersList;
