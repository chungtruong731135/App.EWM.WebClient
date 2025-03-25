import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { Popconfirm, Dropdown, Menu, Drawer, Select } from 'antd';
import { requestPOST, requestDELETE, requestGET, requestDOWNLOADFILE } from '@/utils/baseAPI';
import { useNavigate, useParams } from 'react-router-dom';
import TableList from '@/app/components/TableList';
import BookTableModal from './components/BookTableModal';
import BookQuestionModal from './components/BookQuestionModalCopy';
import { QUESTION_TYPES } from '@/app/data/datas';
import { Content } from '@/_metronic/layout/components/content';
import { toast } from 'react-toastify';
import { toAbsoluteUrl } from '@/_metronic/helpers';

const BookTablesPage = () => {
  const dispatch = useDispatch();
  const { bookId } = useParams();
  const navigate = useNavigate();

  const modalVisible = useSelector(state => state.modal.modalVisible);
  const modal2Visible = useSelector(state => state.modal.modal2Visible);

  const drawerVisible = useSelector(state => state.modal.drawerData.drawerVisible);
  const drawerData = useSelector(state => state.modal.drawerData.drawerData);

  const random = useSelector(state => state.modal.random);
  const [dataSearch, setDataSearch] = useState({ bookId: bookId });
  const [dataTables, setDataTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [offset, setOffset] = useState(1);
  const [count, setCount] = useState(0);
  const [bookTable, setBookTable] = useState(null);

  const [bookItem, setBookItem] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [selectedBookTable, setSelectedBookTable] = useState(null);
  const [selectedBookItem, setSelectedBookItem] = useState(null);

  // console.log(dataSearch);
  const buildTree = (items, parentId = null, level = 1) => {
    if (level > 3) return [];

    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        level,
        children: buildTree(items, item.id, level + 1).length > 0 ? buildTree(items, item.id, level + 1) : null,
      }))
      .sort((a, b) => a.pageOrder - b.pageOrder);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestGET(`api/v1/books/${bookId}`);

      var _data = res?.data ?? null;
      if (_data) {
        setBookItem(res?.data);
      }
    };
    if (bookId) {
      fetchData();
    }
    return () => { };
  }, [bookId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestPOST('api/v1/booktables/search', {
        pageNumber: 1,
        pageSize: 300,
        bookId,
        keyword: dataSearch?.keyword,
      });

      if (res && res.data.length > 0) {
        const treeData = buildTree(res.data);
        setDataTables(treeData);
        setCount(res.totalCount);
      } else {
        setDataTables([]);
      }
      setLoading(false);
    };
    fetchData();
    return () => { };
  }, [bookId, dataSearch, random]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return <>{record.parentId ? <>{text}</> : <strong>{text}</strong>}</>;
      },
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
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
        const isLastLevel = !record.children || record.children.length === 0;

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

            {record.level < 3 && !record.haveQuestions && (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Thêm mục lục con"
                onClick={() => {
                  handleButton(`them-muc-luc`, record);
                }}
              >
                <i className="fa fa-add"></i>
              </a>
            )}

            {isLastLevel && (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-warning btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Danh sách câu hỏi của mục"
                onClick={() => {
                  navigate(`/system/book/search/${bookId}/tables/${record.id}/questions`);
                }}
              >
                <i className="fa fa-table-list"></i>
              </a>
            )}

            {isLastLevel && (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="add-group-question"
                      onClick={() => handleAddNewGroup(record, bookItem)}
                    >
                      <i className="fa fa-layer-group me-2"></i> Thêm câu hỏi dạng nhóm
                    </Menu.Item>
                    <Menu.Item
                      key="add-question"
                      onClick={() => handleShowDrawer(record, bookItem)}
                    >
                      <i className="fa fa-plus-circle me-2"></i> Thêm câu hỏi
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <a
                  className="btn btn-icon btn-bg-light btn-active-color-info btn-sm me-1 mb-1"
                  data-toggle="m-tooltip"
                  title="Thêm câu hỏi cho mục này"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fa fa-puzzle-piece"></i>
                </a>
              </Dropdown>
            )}

            {isLastLevel && (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-info btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Xuất danh sách câu hỏi"
                onClick={() => {
                  handleButton(`export-questions`, record);
                }}
              >
                <i className="fas fa-file-word me-2"></i>
              </a>
            )}
          </div>
        );
      },
    },
  ];

  const handleButton = async (type, item) => {
    switch (type) {
      case 'noi-dung':
        navigate({
          pathname: `${item?.id}`,
        });
        break;
      case 'chi-tiet':
        setBookTable({ id: item.id, name: item.name });

        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));
        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/booktables/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'them-muc-luc':
        setBookTable({ id: item.id, name: item.name });
        dispatch(actionsModal.setModalVisible(true));
        break;

      case 'export-questions':
        setLoading(true);
        toast.info('Đang xuất câu hỏi...', { autoClose: false });
        try {
          const res = await requestDOWNLOADFILE(`api/public/v1/books/export-questions`, {
            bookTableId: item?.id,
            bookId: item?.bookId,
          });

          if (res) {
            const downloadUrl = window.URL.createObjectURL(res.data);
            const link = document.createElement('a');
            document.body.appendChild(link);
            link.href = downloadUrl;
            const fileName = `Danh sách câu hỏi - ${item?.bookName} - ${item?.name}, ${item?.parentAndGrandParentName}.docx`;

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

  const handleShowDrawer = (bookTable, bookItem) => {
    setSelectedBookTable(bookTable);
    setSelectedBookItem(bookItem);
    dispatch(actionsModal.setDrawerDataState({ drawerVisible: true, drawerData: null }));
  };

  const onClose = () => {
    dispatch(actionsModal.setDrawerDataState({ drawerVisible: false, drawerData: null }));
    setSelectedBookTable(null);
    setSelectedBookItem(null);
  };

  const handleAddQuestion = (type, bookTable, bookItem) => {
    dispatch(actionsModal.setModal2Visible(true));
    dispatch(actionsModal.setData2Modal({
      bookTable: selectedBookTable,
      bookItem: selectedBookItem,
      questionType: type,
    }));
    onClose();
  };

  const handleAddNewGroup = (bookTable, bookItem) => {
    dispatch(actionsModal.setModal2Visible(true));
    dispatch(actionsModal.setData2Modal({
      bookTable: bookTable,
      bookItem: bookItem,
      questionType: {
        value: 0,
        label: 'Nhóm câu hỏi',
        icon: 'group',
        showMenu: true,
        typeKey: 0,
      },
    }));
    onClose();
  };

  return (
    <>
      <Content>
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
              <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{`Danh sách mục lục`}</h3>
            </div>
            <div className="card-toolbar">
              <div className="btn-group me-0 w-xl-250px w-lg-200px me-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  onChange={e => {
                    setDataSearch({ ...dataSearch, keyword: e.target.value });
                  }}
                />
              </div>
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  dispatch(actionsModal.setDataModal({ ...null, readOnly: false }));
                  dispatch(actionsModal.setModalVisible(true));
                  setBookTable(null);
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
            <div className="px-3 py-3 d-flex align-items-center justify-content-end">
              <a
                className=" me-1 btn btn-success btn-sm py-2 me-2"
                title="Danh sách câu hỏi"
                onClick={() => {
                  navigate({
                    pathname: `/system/book/search/${bookId}/questions`,
                  });
                }}
              >
                Danh sách câu hỏi
              </a>
            </div>
            <TableList
              dataTable={dataTables}
              columns={columns}
              isPagination={true}
              size={size}
              count={count}
              offset={offset}
              setOffset={setOffset}
              setSize={setSize}
              loading={loading}
              childrenColumnName="children"

            />
          </div>
        </div>
        <Drawer size="large" title="Chọn loại câu hỏi" onClose={onClose} open={drawerVisible}>
          <div className="row g-2">
            {QUESTION_TYPES.filter(type => type.showMenu).map(type => (
              <div key={type.value} className="col-4">
                <span
                  className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3"
                  onClick={() => handleAddQuestion(type)}
                >
                  <img
                    src={toAbsoluteUrl(`media/icons/questions/${type.icon}.svg`)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = toAbsoluteUrl(`media/icons/questions/${type.icon}.png`);
                    }}
                    className="w-100 h-100 mb-2"
                    alt={type.label}
                  />
                  <span className="fw-semibold">{type.label}</span>
                </span>
              </div>
            ))}
          </div>
        </Drawer>
        {modalVisible ? <BookTableModal bookTable={bookTable} /> : <></>}
        {modal2Visible && (
          <BookQuestionModal
            bookTable={selectedBookTable}
            bookItem={selectedBookItem}
            questionType={selectedQuestionType}
          />
        )}
      </Content>
    </>
  );
};

export default BookTablesPage;
