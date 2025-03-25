import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { Image, Popconfirm } from 'antd';
import { FILE_URL, requestPOST, requestDELETE } from '@/utils/baseAPI';
import { useNavigate, useParams } from 'react-router-dom';
import TableList from '@/app/components/TableList';
import BookTableModal from './components/BookPageModal';

const BookPagesList = () => {
  const dispatch = useDispatch();
  const { bookId } = useParams();
  const navigate = useNavigate();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const random = useSelector(state => state.modal.random);
  const [dataTables, setDataTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(20);
  const [offset, setOffset] = useState(1);
  const [count, setCount] = useState(0);
  const [pageNo, setPageNo] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestPOST('api/v1/bookpages/search', {
        pageNumber: offset,
        pageSize: size,
        bookId,
        pageNo: parseInt(pageNo),
      });

      if (res) {
        setDataTables(res.data.sort((a, b) => a.pageNo - b.pageNo) ?? []);
        setCount(res.totalCount);
      }
      setLoading(false);
    };
    fetchData();
    return () => {};
  }, [bookId, pageNo, offset, random]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'pageNo',
      key: 'pageNo',
      width: 80,
    },
    {
      title: 'Ảnh',
      dataIndex: 'cover',
      key: 'cover',
      render: (text, record, index) => {
        return (
          <>
            <div className="d-flex align-items-center" style={{ overflow: 'hidden' }}>
              {/* begin:: Avatar */}
              <div className="symbol overflow-hidden me-3">
                <div>
                  {record.cover ? (
                    <Image
                      src={record.cover.includes('https://') || record.cover.includes('http://') ? record.cover : FILE_URL + `${record.cover.startsWith('/') ? record.cover.substring(1) : record.cover}`}
                      alt={record.name}
                      className="w-full h-100px"
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
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 200,
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

  const handleButton = async (type, item) => {
    switch (type) {
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
      default:
        break;
    }
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-3">
        <div className="px-3 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fa fa-arrow-left fs-2 text-gray-600"></i>
            </a>
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{`Nội dung Ebook`}</h3>
          </div>
          <div className="card-toolbar">
            <div className="btn-group me-0 w-xl-250px w-lg-200px me-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập từ khoá tìm kiếm"
                onChange={e => {
                  setPageNo(e.target.value);
                }}
              />
            </div>
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(actionsModal.setDataModal({ ...null, readOnly: false }));
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus  me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
          </div>
        </div>
        <div className="card-dashboard-body table-responsive p-3">
          <TableList dataTable={dataTables} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
        </div>
      </div>
      {modalVisible ? <BookTableModal /> : <></>}
    </>
  );
};

export default BookPagesList;
