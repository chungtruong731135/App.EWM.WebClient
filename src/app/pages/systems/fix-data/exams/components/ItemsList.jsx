/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, createContext, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Popconfirm, Form, Select, Input } from 'antd';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestDELETE, requestPUT_NEW } from '@/utils/baseAPI';

import TableList from '@/app/components/TableList';
import ModalItem from './ChiTietModal';
import { useNavigate, createSearchParams } from 'react-router-dom';
import TDSelect from '@/app/components/TDSelect';
const EditableContext = createContext(null);
const EditableRow = ({ index, ...props }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const onFinish = async () => {
    try {
      const formData = form.getFieldsValue(true);
      var body = {
        id: formData?.id,
        courseId: formData?.courseId,
      };

      const res = await requestPUT_NEW(`api/v1/exams/fix-data`, body);

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
      } else {
        toast.error('Thất bại, vui lòng thử lại! ');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const onFinishFailed = error => {
    console.log(error);
  };

  return (
    <Form form={form} component={false} onFinish={onFinish} onFinishFailed={onFinishFailed}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  editing,

  ...restProps
}) => {
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      form.setFieldValue('id', record?.id);
      if (dataIndex == 'examinat') {
        form.setFieldsValue({
          examinat: {
            value: record?.examinatId,
            label: record?.examinatTitle,
          },
        });
      } else if (dataIndex == 'course') {
        form.setFieldsValue({
          course: {
            value: record?.courseId,
            label: record?.courseTitle,
          },
        });
      } else {
        form.setFieldsValue({
          [dataIndex]: record[dataIndex],
        });
      }
    }
  }, [editing]);

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: dataIndex == 'difficulty' ? false : true,
            message: `Không được để trống.`,
          },
        ]}
      >
        {dataIndex == 'course' ? (
          <TDSelect
            reload
            showSearch
            placeholder=""
            fetchOptions={async keyword => {
              const res = await requestPOST(`api/v1/courses/search`, {
                pageNumber: 1,
                pageSize: 1000,
                keyword: keyword,
                examinatId: record?.examinatId,
              });
              return res?.data?.map(item => ({
                ...item,
                label: `${item.title}`,
                value: item.id,
              }));
            }}
            style={{
              width: '100%',
              height: 'auto',
            }}
            onChange={(value, current) => {
              if (value) {
                form.setFieldValue('courseId', current?.id);
              } else {
                form.setFieldValue('courseId', null);
              }
            }}
          />
        ) : dataIndex == 'examinat' ? (
          <TDSelect
            reload
            showSearch
            placeholder=""
            fetchOptions={async keyword => {
              const res = await requestPOST(`api/v1/examinats/search`, {
                pageNumber: 1,
                pageSize: 1000,
                keyword: keyword,
              });
              return res?.data?.map(item => ({
                ...item,
                label: `${item.title}`,
                value: item.id,
              }));
            }}
            style={{
              width: '100%',
              height: 'auto',
            }}
            onChange={(value, current) => {
              if (value) {
                form.setFieldValue('examinatId', current?.id);
              } else {
                form.setFieldValue('examinatId', null);
              }
            }}
          />
        ) : (
          <Input ref={inputRef} />
        )}
      </Form.Item>
    ) : dataIndex == 'action' ? (
      <button
        className="btn btn-info btn-sm py-2"
        onClick={() => {
          form.submit();
        }}
      >
        <span>
          <i className="fas fa-save me-2"></i>
          <span className="">Lưu</span>
        </span>
      </button>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        // onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
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
  const [editingKey, setEditingKey] = useState('');
  const isEditing = record => record.id === editingKey;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/exams/search-fix`,
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
    setDataTable([]);
    return () => {};
  }, [dataSearch]);

  const defaultColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{(offset - 1) * size + index + 1}</div>,
    },
    {
      title: 'Tền đề thi',
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
      title: 'Thuộc kỳ thi',
      dataIndex: 'examinat',
      key: 'examinat',
      render: (text, record) => <div>{record?.examinatTitle}</div>,
    },

    {
      title: 'Khoá học',
      dataIndex: 'course',
      key: 'course',
      editable: true,
      width: '15%',
      render: (text, record) => <div>{record?.courseTitle}</div>,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: '',
      width: 100,
      editable: true,
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: col.dataIndex == 'action' ? false : true,
      }),
    };
  });
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TableList components={components} dataTable={dataTable} columns={columns} isPagination={true} size={size} count={count} offset={offset} setOffset={setOffset} setSize={setSize} loading={loading} />
        </div>
      </div>
      {/* {modalVisible ? <ModalItem /> : <></>} */}
    </>
  );
};

export default UsersList;
