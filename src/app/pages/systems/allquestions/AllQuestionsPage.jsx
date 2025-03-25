/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemList';
import { requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import { Checkbox, Popover, Drawer, Select } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModalAddQuestions from './components/ChiTietModal';
import { toast } from 'react-toastify';
import { Content } from '@/_metronic/layout/components/content';
import { toAbsoluteUrl } from '@/_metronic/helpers';
import BookQuestionModal from './components/ChiTietModal';

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
  { value: 11, label: 'Điền vào hình ảnh', icon: 'fill_input_img', showMenu: true, typeKey: 11 },
  { value: 12, label: 'Chọn một đáp án điền vào chỗ trống', icon: 'selectMulti', showMenu: true, typeKey: 12 },
];

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const drawerVisible = useSelector(state => state.modal.drawerData.drawerVisible);
  const modalVisible = useSelector(state => state.modal.modalVisible);

  const [dataSearch, setDataSearch] = useState(null);
  let [searchParams, setSearchParams] = useSearchParams();
  const [parentId, setParentId] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Kiểm tra input, chỉ cập nhật setDataSearch với keyword sau 1 giây nếu không có nhập mới:
  const handleKeywordChange = e => {
    const value = e.target.value;
    setSearchKeyword(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        setDataSearch(prev => ({
          ...prev,
          keyword: value,
        }));
      }, 1000)
    );
  };

  useEffect(() => {
    setParentId(searchParams.get('parentId'));
    setDataSearch({ ...dataSearch, parentId: searchParams.get('parentId') });
  }, [searchParams]);

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
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
            {parentId && (
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
            )}
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Ngân hàng câu hỏi'}</h3>
            <div className="card-toolbar">
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNewGroup}>
                <span>
                  <i className="fas fa-plus  me-2"></i>
                  <span className="">Tạo nhóm câu hỏi</span>
                </span>
              </button>
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleShowDrawer}>
                <span>
                  <i className="fas fa-plus me-2"></i>
                  <span className="">Tạo câu hỏi</span>
                </span>
              </button>
            </div>
          </div>
          <div className="d-flex flex-row my-2">
            <div className="flex-grow-1 row g-5">
              <div className="col-xl-4 col-md-6 px-5">
                <div className="btn-group me-2 w-100">
                  <span className="fw-bold w-150px m-auto">Từ khóa:</span>
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" value={searchKeyword} onChange={handleKeywordChange} />
                </div>
              </div>

              <div className="col-xl-4 col-md-6 btn-group align-items-center px-5">
                <span className="fw-bold w-150px">Bộ sách:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    showSearch
                    reload={true}
                    placeholder="Chọn bộ sách"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/booktypes/search`, {
                        pageNumber: 1,
                        pageSize: 10000,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    value={dataSearch?.bookTypeId ?? null}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          bookTypeId: current?.id,
                          bookId: null,
                        });
                      } else {
                        setDataSearch({
                          ...dataSearch,
                          bookTypeId: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-xl-4 col-md-6 btn-group align-items-center px-5">
                <span className="fw-bold w-150px">Nhóm sách:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    showSearch
                    reload={true}
                    placeholder="Chọn nhóm sách"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/bookcatalogs/search`, {
                        pageNumber: 1,
                        pageSize: 10000,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    value={dataSearch?.bookCatalogId ?? null}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          bookCatalogId: current?.id,
                          bookId: null,
                        });
                      } else {
                        setDataSearch({
                          ...dataSearch,
                          bookCatalogId: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-xl-4 col-md-6 btn-group align-items-center px-5">
                <span className="fw-bold w-150px">Khối lớp:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    showSearch
                    reload={true}
                    placeholder="Chọn khối lớp"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/bookgrades/search`, {
                        pageNumber: 1,
                        pageSize: 1000,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    value={dataSearch?.bookGradeId ?? null}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          bookGradeId: current?.id,
                          bookId: null,
                        });
                      } else {
                        setDataSearch({
                          ...dataSearch,
                          bookGradeId: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-xl-4 col-md-6 btn-group align-items-center px-5">
                <span className="fw-bold w-150px">Môn học:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    showSearch
                    reload={true}
                    placeholder="Chọn môn học"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/bookSubjects/search`, {
                        pageNumber: 1,
                        pageSize: 1000,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    value={dataSearch?.bookSubjectId ?? null}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          bookSubjectId: current?.id,
                          bookId: null,
                        });
                      } else {
                        setDataSearch({
                          ...dataSearch,
                          bookSubjectId: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-xl-4 col-md-6 btn-group align-items-center px-5">
                <span className="fw-bold w-150px">Thuộc sách:</span>
                <div className="ms-2 w-100">
                  <TDSelect
                    showSearch
                    reload={true}
                    placeholder="Chọn sách"
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/books/search`, {
                        pageNumber: 1,
                        pageSize: 10000,
                        bookTypeId: dataSearch?.bookTypeId,
                        bookGradeId: dataSearch?.bookGradeId,
                        bookSubjectId: dataSearch?.bookSubjectId,
                        bookCatalogId: dataSearch?.bookCatalogId,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                    }}
                    value={dataSearch?.bookId ?? null}
                    onChange={(value, current) => {
                      if (value) {
                        setDataSearch({
                          ...dataSearch,
                          bookId: current?.id,
                        });
                      } else {
                        setDataSearch({
                          ...dataSearch,
                          bookId: null,
                        });
                      }
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
                        typeEnum: value ?? null,
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
                      onError={e => {
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
          <ItemsList dataSearch={dataSearch} />
          {modalVisible ? <BookQuestionModal questionType={selectedQuestionType} /> : <></>}
        </div>
      </Content>
    </>
  );
};

export default UsersPage;
