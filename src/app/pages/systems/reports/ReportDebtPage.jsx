/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { DatePicker, Form, Select, Spin, Table } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';

import { requestDOWNLOADFILE, requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';

const FormItem = Form.Item;

const UsersPage = () => {
  const [form] = Form.useForm();
  const [dataTable, setDataTable] = useState([]);
  const [dataTK, setDataTK] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const onFinish = async () => {
    const formData = form.getFieldsValue(true);
    try {
      setLoading(true);
      var body = {
        fromDate: formData?.fromDate ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null,
        toDate: formData?.toDate ? dayjs(formData.toDate).format('YYYY-MM-DD') : null,
        type: formData?.type ?? null,
        userId: formData?.userId ?? null,
      };
      const res = await requestPOST(`api/v1/reports/cong-no-time`, body);
      var _data = res?.data ?? [];
      setDataTable(_data);
      setDataTK({
        count: _.sumBy(_data, 'count'),
        amount: _.sumBy(_data, 'amount'),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const validate = await form.validateFields();
      const formData = form.getFieldsValue(true);
      setLoadingExport(true);
      var body = {
        fromDate: formData?.fromDate ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null,
        toDate: formData?.toDate ? dayjs(formData.toDate).format('YYYY-MM-DD') : null,
        type: formData?.type ?? null,
        userId: formData?.userId ?? null,
      };
      const res = await requestDOWNLOADFILE(`api/v1/reports/export-doanh-thu-khoa-hoc-user`, body);
      // Xử lý dữ liệu
      const fileData = new Blob([res.data], { type: 'application/msword' });
      // Tạo liên kết tải xuống (download link)
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = 'ThongKeTheoCongTacVienDaiLy.doc'; // Tên file và định dạng file
      downloadLink.click();
      setLoadingExport(false);
    } catch (error) {
      console.log(error);
      setLoadingExport(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <div>{index + 1}</div>,
      width: 80,
    },
    {
      title: 'Cộng tác viên/Đại lý',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div className="d-flex flex-column">
          <span className="text-gray-800 text-hover-primary mb-1 fw-bolder">{record?.fullName}</span>
          <span>{record?.userName}</span>
        </div>
      ),
    },
    {
      title: 'Loại tài khoản',
      dataIndex: 'userType',
      key: 'userType',
      render: text => <div>{text == 4 ? 'Cộng tác viên' : 'Đại lý'}</div>,
    },
    {
      title: 'Số lượt kích hoạt',
      dataIndex: 'count',
      key: 'count',
      render: text => <div>{(text || 0).toLocaleString()}</div>,
    },
    {
      title: 'Số tiền nợ đầu kỳ',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record, index) => (
        <div>
          {((record?.debtAmount ?? 0) - (record?.distributorDebtAmount ?? 0)).toLocaleString('vi', {
            style: 'currency',
            currency: 'VND',
          })}
        </div>
      ),
    },
    {
      title: 'Số tiền nợ phát sinh',
      dataIndex: 'payAmount',
      key: 'payAmount',
      render: (text, record, index) => (
        <div>
          {(record?.payAmount ?? 0).toLocaleString('vi', {
            style: 'currency',
            currency: 'VND',
          })}
        </div>
      ),
    },
    {
      title: 'Số tiền trả trong kỳ',
      dataIndex: 'distributorInvoiceAmount',
      key: 'distributorInvoiceAmount',
      render: (text, record, index) => (
        <div>
          {(record?.distributorInvoiceAmount ?? 0).toLocaleString('vi', {
            style: 'currency',
            currency: 'VND',
          })}
        </div>
      ),
    },
    {
      title: 'Nợ cuối kỳ',
      dataIndex: 'nocuoiky',
      key: 'nocuoiky',
      render: (text, record, index) => (
        <div>
          {(0 - ((record?.distributorInvoiceAmount ?? 0) + (record?.distributorDebtAmount ?? 0) - (record?.debtAmount ?? 0) - (record?.payAmount ?? 0))).toLocaleString('vi', {
            style: 'currency',
            currency: 'VND',
          })}
        </div>
      ),
    },
  ];
  const onFinishFailed = error => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
  };
  const handleReset = () => {
    form.resetFields();
    setDataTable([]);
    setDataTK(null);
  };
  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="p-4 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thống kê doanh thu theo đại lý/cộng tác viên'}</h3>
        </div>
        <div className="p-5">
          <Form form={form} initialValues={{ fromDate: dayjs(), toDate: dayjs() }} autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <div className="row">
              <div className="col-xl- col-lg-6">
                <FormItem label="Từ ngày" name="fromDate" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <DatePicker format={'DD/MM/YYYY'} placeholder="Từ ngày" style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-6">
                <FormItem
                  label="Đến ngày"
                  name="toDate"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('fromDate') <= value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Đến ngày phải lớn hơn hoặc bằng Từ Ngày!'));
                      },
                    }),
                    { required: true, message: 'Không được để trống!' },
                  ]}
                >
                  <DatePicker format={'DD/MM/YYYY'} placeholder="Đến ngày" style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-6">
                <FormItem label="Loại tài khoản" name="type">
                  <Select
                    allowClear
                    placeholder="Chọn"
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: null,
                        label: 'Tất cả',
                      },
                      {
                        value: 0,
                        label: 'Đại lý',
                      },
                      {
                        value: 1,
                        label: 'Cộng tác viên',
                      },
                    ]}
                  />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-6">
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) => (
                    <FormItem label="Người dùng" name="user">
                      <TDSelect
                        reload
                        showSearch
                        placeholder="Chọn"
                        fetchOptions={async keyword => {
                          const res = await requestPOST(`api/users/search`, {
                            pageNumber: 1,
                            pageSize: 20,
                            advancedSearch: {
                              fields: ['name'],
                              keyword: keyword || null,
                            },
                            keyword: keyword,
                            type: getFieldValue('type') == 0 ? 5 : getFieldValue('type') == 1 ? 4 : null,
                            types: [4, 5],
                          });
                          return res.data.map(item => ({
                            ...item,
                            label: `${item.fullName} - ${item.userName}`,
                            value: item.id,
                          }));
                        }}
                        style={{
                          width: '100%',
                        }}
                        onChange={(value, current) => {
                          if (value) {
                            form.setFieldValue('userId', current?.id);
                          } else {
                            form.setFieldValue('userId', null);
                          }
                        }}
                      />
                    </FormItem>
                  )}
                </Form.Item>
              </div>
            </div>
          </Form>
          <div className="row">
            <div className="col-xl-12 col-lg-12 d-flex justify-content-center">
              <button className="btn btn-primary btn-sm m-btn m-btn--icon py-2 me-3" onClick={handleSubmit}>
                <span>
                  <i className="fas fa-chart-simple me-1"></i>
                  <span className="">Thống kê</span>
                </span>
              </button>
              <Spin spinning={loadingExport}>
                <button
                  onClick={handleExport}
                  className="btn btn-danger btn-sm m-btn m-btn--icon py-2 me-3"
                  //   disabled={loadingExport}
                >
                  <span>
                    <i className="fas fa-print me-1"></i>
                    <span className="">Xuất báo cáo</span>
                  </span>
                </button>
              </Spin>
              <button className="btn btn-info btn-sm m-btn m-btn--icon py-2" onClick={handleReset}>
                <span>
                  <i className="fas fa-sync me-1"></i>
                  <span className="">Tải lại</span>
                </span>
              </button>
            </div>
          </div>
        </div>
        {dataTK ? (
          <div className="p-5">
            <div className="fs-4 fw-bolder">Tổng cộng có:</div>
            <div class="d-flex flex-column flex-shrink-0 ms-4 mt-2 text-dark fs-6">
              <span class="d-flex align-items-center mb-2">
                <i className="fas fa-minus me-3"></i>
                <span className="fw-bolder">{dataTK?.count?.toLocaleString()}</span>
                <span className="mx-2">lượt kích hoạt, trị giá:</span>
                <span className="fw-bolder">
                  {dataTK?.amount?.toLocaleString('vi', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="card-body card-dashboard px-3 py-3">
          <div className="card-dashboard-body table-responsive">
            <Table bordered columns={columns} dataSource={dataTable} loading={loading} pagination={false} />
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
