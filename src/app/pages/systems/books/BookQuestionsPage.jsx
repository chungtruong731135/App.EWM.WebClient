import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { Image, Popconfirm, Drawer, Select } from 'antd';
import { FILE_URL, requestPOST, requestDELETE, requestGET } from '@/utils/baseAPI';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TableList from '@/app/components/TableList';
import BookQuestionModal from './components/BookQuestionModal';
import clsx from 'clsx';
import { orderBy, random } from 'lodash';
import { toast } from 'react-toastify';
import { Content } from '@/_metronic/layout/components/content';
import { toAbsoluteUrl } from '@/_metronic/helpers';

const questionTypeMap = {
  0: 'Nhóm câu hỏi', // Group
  1: 'Chọn một đáp án', // SingleChoice (radio)
  2: 'Chọn nhiều đáp án', // MultipleChoice (checkbox)
  3: 'Câu hỏi tự luận', // Essay
  4: 'Điền vào chỗ trống', // FillInBlank (fill_blank)
  5: 'Sắp xếp từ', // WordArrangement
  6: 'Ghép đôi', // Matching (math_col)
  7: 'Đúng / Sai / Không có', // TrueFalse (answer_t_f_no)
  8: 'Sắp xếp đoạn văn', // Arrangement
  9: 'Kéo thả đáp án', // DragAndDrop (down_answer)
  10: 'Chọn bảng', // TableChoice

  // Others:
  11: 'Điền vào hình ảnh', // FillInImage (fill_input_img)
  // 12: 'Đánh dấu X', // XMarkAnswer (x_mark_answer)
  12: 'Chọn một đáp án điền vào chỗ trống', // SelectAnswer (select)
  // 14: 'Khoanh tròn đáp án', // CircleAnswer (circle_answer)
};

const QUESTION_TYPES = [
  // { value: 0, label: 'Nhóm câu hỏi', icon: 'group', showMenu: true, typeKey: 'group' }, // no icon
  { value: 1, label: 'Chọn một đáp án', icon: 'radio', showMenu: true, typeKey: 1 },
  { value: 2, label: 'Chọn nhiều đáp án', icon: 'checkbox', showMenu: true, typeKey: 2 },
  { value: 3, label: 'Tự luận', icon: 'essay', showMenu: true, typeKey: 3 },
  { value: 4, label: 'Điền vào chỗ trống', icon: 'fill_blank', showMenu: true, typeKey: 4 },
  { value: 5, label: 'Sắp xếp từ', icon: 'down_answer', showMenu: true, typeKey: 5 },
  { value: 6, label: 'Ghép đôi', icon: 'math_col', showMenu: true, typeKey: 6 },
  { value: 7, label: 'Đúng / Sai / Không có', icon: 'true_false', showMenu: true, typeKey: 7 },
  { value: 8, label: 'Sắp xếp đoạn văn', icon: 'word_arrangement', showMenu: true, typeKey: 8 },
  { value: 9, label: 'Kéo thả đáp án', icon: 'select', showMenu: true, typeKey: 9 },
  { value: 10, label: 'Chọn bảng', icon: 'table_choice', showMenu: true, typeKey: 10 },

  // Others:
  { value: 11, label: 'Điền vào hình ảnh', icon: 'fill_input_img', showMenu: true, typeKey: 11 },
  { value: 12, label: 'Chọn một đáp án điền vào chỗ trống', icon: 'selectMulti', showMenu: true, typeKey: 12 },
];

const BookQuestionsPage = () => {
  const dispatch = useDispatch();

  const { bookId, tableId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const [bookItem, setBookItem] = useState(null);
  const [bookTable, setBookTable] = useState(null);

  const drawerVisible = useSelector(state => state.modal.drawerData.drawerVisible);
  const drawerData = useSelector(state => state.modal.drawerData.drawerData);

  const random = useSelector(state => state.modal.random);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const [dataTables, setDataTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(20);
  const [offset, setOffset] = useState(1);
  const [count, setCount] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [dataSearch, setDataSearch] = useState(null);

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
    const fetchBookTable = async () => {
      if (!tableId) return;

      setLoading(true);
      const res = await requestGET(`api/v1/booktables/${tableId}`);

      if (res?.data) {
        setBookTable(res.data);
      }

      setLoading(false);
    };

    fetchBookTable();
    return () => { };
  }, [tableId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestPOST('api/v1/bookquestions/search', {
        pageNumber: offset,
        pageSize: size,
        bookId,
        keyword: keyword,
        ...dataSearch,
        orderBy: ['pageNo', 'title', 'sortOrder'],
        ...(tableId ? { bookTableId: tableId } : {}),
      });

      if (res) {
        setDataTables(res.data ?? []);
        setCount(res.totalCount);
      }
      setLoading(false);
    };
    fetchData();
    return () => { };
  }, [bookId, tableId, offset, size, random, keyword, dataSearch]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Nội dung câu hỏi',
      key: 'question',
      dataIndex: 'question',
      render: (text, record) => {
        const cleanContent = record.content ? record.content.replace(/<[^>]*>/g, '') : 'Không có dữ liệu';
        const shortContent = cleanContent.length > 100 ? `${cleanContent.substring(0, 100)}...` : cleanContent;

        return (
          <div>
            <strong className="text-primary d-block mb-3">#{record.title}</strong>
            <div>{shortContent}</div>
          </div>
        );
      },
    },
    {
      title: 'Thuộc trang',
      key: 'pageNo',
      dataIndex: 'pageNo',
      render: text => (text ? `Trang ${text}` : ''),
    },
    {
      title: 'Loại câu hỏi',
      key: 'typeEnum',
      dataIndex: 'typeEnum',
      render: text => questionTypeMap[text] || 'Không xác định',
    },
    {
      title: 'Độ khó',
      key: 'level',
      dataIndex: 'level',
      render: text => {
        const levelMap = {
          easy: 'Dễ',
          medium: 'Vừa phải',
          hard: 'Khó',
        };

        const levelColorMap = {
          easy: 'text-success',
          medium: 'text-warning',
          hard: 'text-danger',
        };

        const levelText = levelMap[text] || 'Không xác định';
        const levelClass = levelColorMap[text] || 'text-muted';

        return <span className={levelClass}>{levelText}</span>;
      },
    },

    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 125,
      render: (text, record) => {
        return <div className={`badge badge-light-${record?.isActive ? 'success' : 'danger'}`}>{`${record?.isActive ? 'Hoạt động' : 'Không hoạt động'}`}</div>;
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

            {record?.typeEnum == 0 && (
              <>
                {/* <a
                    className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                    data-toggle="m-tooltip"
                    title="Danh sách câu hỏi con"
                    onClick={() => {
                        handleButton(`children`, record);
                    }}
                >
                    <i className="fa fa-clipboard-list"></i>
                </a> */}
                <a
                  className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                  data-toggle="m-tooltip"
                  title="Thêm mới câu hỏi con"
                  onClick={() => {
                    handleButton(`add-child`, record);
                  }}
                >
                  <i className="fa fa-plus"></i>
                </a>
              </>
            )}
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
        setSelectedQuestionType(item?.typeEnum);
        console.log('item', item.typeEnum);
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));
        break;
      case 'delete':
        var res = await requestDELETE(`api/v1/bookquestions/${item.id}`);
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'add-child':
        dispatch(actionsModal.setDrawerDataState({ drawerVisible: true, drawerData: { parentId: item?.id, parentCode: item?.code } }));
        dispatch(
          actionsModal.setDataModal({
            parent: item,
            parentId: item?.id,
            parentCode: item?.code,
          })
        );
        break;
      default:
        break;
    }
  };

  const handleShowDrawer = () => {
    dispatch(actionsModal.setDrawerDataState({ drawerVisible: true, drawerData: null }));
  };

  const onClose = () => {
    dispatch(actionsModal.setDrawerDataState({ drawerVisible: false, drawerData: null }));
  };

  const handleAddQuestion = type => {
    setSelectedQuestionType(type);
    dispatch(actionsModal.setModalVisible(true));
    onClose();
  };

  const handleAddNewGroup = () => {
    setSelectedQuestionType({ value: 0, label: 'Nhóm câu hỏi', icon: 'group', showMenu: true, typeKey: 0 });
    dispatch(actionsModal.setModalVisible(true));
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
              <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">
                {bookTable
                  ? `Danh sách câu hỏi - ${bookTable.name}${bookTable.parentAndGrandParentName ? `, ${bookTable.parentAndGrandParentName}` : ''}`
                  : 'Danh sách câu hỏi trong sách'}
              </h3>
            </div>
            <div className="card-toolbar">
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNewGroup}>
                <span>
                  <i className="fas fa-plus  me-2"></i>
                  <span className="">Thêm nhóm câu hỏi</span>
                </span>
              </button>
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleShowDrawer}>
                <span>
                  <i className="fas fa-plus  me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <div className="d-flex flex-row my-2">
            <div className="flex-grow-1 row g-5">
              <div className="col-xl-4 col-md-6 px-5">
                <div className="btn-group me-2 w-100">
                  <span className="fw-bold w-150px m-auto">Từ khóa:</span>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Nhập từ khoá tìm kiếm"
                    onChange={e => {
                      setDataSearch({
                        ...dataSearch,
                        keyword: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="col-xl-4 col-md-6 btn-group align-items-center px-5">
                <span className="fw-bold w-150px">Loại câu hỏi:</span>
                <div className="ms-2 w-100">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Chọn loại câu hỏi"
                    style={{ width: '100%' }}
                    value={dataSearch?.typeEnum ?? undefined}
                    onChange={value => {
                      setDataSearch({
                        ...dataSearch,
                        typeEnum: value ?? null, // Đặt lại null nếu không chọn gì
                      });
                    }}
                    options={Object.entries(questionTypeMap).map(([key, label]) => ({
                      value: parseInt(key),
                      label: label,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card-dashboard-body table-responsive p-3">
            <div className="px-3 py-3 d-flex align-items-center justify-content-end">
              <a
                className=" me-1 btn btn-success btn-sm py-2 me-2"
                title="Danh sách mục lục"
                onClick={() => {
                  navigate({
                    pathname: `/system/book/search/${bookId}/tables`,
                  });
                }}
              >
                Danh sách mục lục
              </a>
            </div>
            <TableList dataTable={dataTables} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
          </div>
        </div>

        <Drawer size="large" title="Chọn loại câu hỏi" onClose={onClose} open={drawerVisible}>
          <div className="row g-2">
            {QUESTION_TYPES.filter(type => type.showMenu).map(type => (
              <div key={type.value} className="col-4">
                <span
                  className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3"
                  onClick={() => {
                    handleAddQuestion(type);
                  }}
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
        {modalVisible ? (
          <BookQuestionModal
            bookItem={bookItem}
            questionType={selectedQuestionType}
            bookTable={bookTable ?? null}
          />
        ) : null}
      </Content>
    </>
  );
};

export default BookQuestionsPage;
