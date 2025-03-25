import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Select, Form } from 'antd';

const { Option } = Select;
const FormItem = Form.Item;

const BookListPage = () => {
  const dispatch = useDispatch();

  const [dataSearch, setDataSearch] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [bookCatalogOptions, setBookCatalogOptions] = useState([]);
  const [bookTypeOptions, setBookTypeOptions] = useState([]);
  const [bookSubjectOptions, setBookSubjectOptions] = useState([]);
  const [bookGradeOptions, setBookGradeOptions] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState(dataSearch?.keyword || '');
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
    const searchParams = new URLSearchParams(location.search);
    // lấy dữ liệu search sau khi back về

    setDataSearch({
      bookTypeId: searchParams.get('bookTypeId'),
      bookCatalogId: searchParams.get('bookCatalogId'),
      bookSubjectId: searchParams.get('bookSubjectId'),
      bookGradeId: searchParams.get('bookGradeId'),
      keyword: searchParams.get('keyword'),
    });

    setSearchKeyword(searchParams.get('keyword'));
  }, [location.search]);

  useEffect(() => {
    // change dữ liệu thì update search và up lên url
    if (dataSearch) {
      const filteredData = Object.entries(dataSearch).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      setSearchParams(filteredData);
    }
  }, [dataSearch]);

  useEffect(() => {
    const fetchBookCatalogs = async () => {
      const res = await requestPOST(`api/v1/bookcatalogs/search`, {
        pageNumber: 1,
        pageSize: 100,
      });

      if (res?.data) {
        const options = res.data.map(item => ({
          label: item.name,
          value: item.id,
        }));

        setBookCatalogOptions(options);
      }
    };

    const fetchBookTypes = async () => {
      const res = await requestPOST(`api/v1/booktypes/search`, {
        pageNumber: 1,
        pageSize: 100,
        keyword: '',
      });

      if (res?.data) {
        const options = res.data.map(item => ({
          label: item.name,
          value: item.id,
        }));

        setBookTypeOptions(options);
      }
    };

    const fetchBookSubjects = async () => {
      const res = await requestPOST(`api/v1/booksubjects/search`, {
        pageNumber: 1,
        pageSize: 100,
        keyword: '',
      });

      if (res?.data) {
        const options = res.data.map(item => ({
          label: item.name,
          value: item.id,
        }));

        setBookSubjectOptions(options);
      }
    };

    const fetchBookGrades = async () => {
      const res = await requestPOST(`api/v1/bookgrades/search`, {
        pageNumber: 1,
        pageSize: 100,
        keyword: '',
      });

      if (res?.data) {
        const options = res.data.map(item => ({
          label: item.name,
          value: item.id,
        }));

        setBookGradeOptions(options);
      }
    };
    fetchBookSubjects();
    fetchBookCatalogs();
    fetchBookTypes();
    fetchBookGrades();
  }, []);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0 mb-lg-2">{'Sách'}</h3>
          <div className="card-toolbar">
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(actionsModal.setDataModal({ ...null, readOnly: false }));
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
          </div>
        </div>

        <div className="d-flex flex-row my-2 mx-2">
          <div className="flex-grow-1 row g-5">
            <div className="col-xl-4 col-md-6">
              <FormItem label="Từ khóa">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" value={searchKeyword} onChange={handleKeywordChange} />
              </FormItem>
            </div>

            <div className="col-xl-4 col-md-6">
              <FormItem label="Nhóm sách">
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn nhóm sách"
                  value={dataSearch?.bookCatalogId}
                  style={{ width: '100%' }}
                  filterOption={(input, option) => option?.label?.toLowerCase().includes(input?.toLowerCase())}
                  onChange={value => {
                    setDataSearch(prev => ({
                      ...prev,
                      bookCatalogId: value || null,
                    }));
                  }}
                >
                  {bookCatalogOptions.map(item => (
                    <Option key={item.value} value={item.value} label={item.label}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </div>

            <div className="col-xl-4 col-md-6">
              <FormItem label="Bộ sách">
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn bộ sách"
                  value={dataSearch?.bookTypeId}
                  style={{ width: '100%' }}
                  filterOption={(input, option) => option?.label?.toLowerCase().includes(input?.toLowerCase())}
                  onChange={value => {
                    setDataSearch(prev => ({
                      ...prev,
                      bookTypeId: value || null,
                    }));
                  }}
                >
                  {bookTypeOptions.map(item => (
                    <Option key={item.value} value={item.value} label={item.label}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </div>

            <div className="col-xl-4 col-md-6">
              <FormItem label="Môn học">
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn môn học"
                  value={dataSearch?.bookSubjectId}
                  style={{ width: '100%' }}
                  filterOption={(input, option) => option?.label?.toLowerCase().includes(input?.toLowerCase())}
                  onChange={value => {
                    setDataSearch(prev => ({
                      ...prev,
                      bookSubjectId: value || null,
                    }));
                  }}
                >
                  {bookSubjectOptions.map(item => (
                    <Option key={item.value} value={item.value} label={item.label}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </div>

            <div className="col-xl-4 col-md-6">
              <FormItem label="Khối lớp">
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn khối lớp"
                  value={dataSearch?.bookGradeId}
                  style={{ width: '100%' }}
                  filterOption={(input, option) => option?.label?.toLowerCase().includes(input?.toLowerCase())}
                  onChange={value => {
                    setDataSearch(prev => ({
                      ...prev,
                      bookGradeId: value || null,
                    }));
                  }}
                >
                  {bookGradeOptions.map(item => (
                    <Option key={item.value} value={item.value} label={item.label}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </div>
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default BookListPage;
