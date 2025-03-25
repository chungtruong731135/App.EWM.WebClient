/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DatePicker, Form, Select, Spin, Table } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';

import { useAuth } from '@/app/modules/auth';
import { requestDOWNLOADFILE, requestPOST } from '@/utils/baseAPI';

const FormItem = Form.Item;

const UsersPage = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [dataTK, setDataTK] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const { currentUser } = useAuth();

  const [tongTien, setTongTien] = useState(0);
  const excelRef = useRef();
  const onFinish = async () => {
    const formData = form.getFieldsValue(true);
    try {
      setLoading(true);
      var body = {
        fromDate: formData?.fromDate ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null,
        toDate: formData?.toDate ? dayjs(formData.toDate).format('YYYY-MM-DD') : null,
        type: formData?.type ?? null,
      };
      const res = await requestPOST(`api/v1/reports/doanh-thu-khoa-hoc-time`, body);
      var _data = res?.data ?? [];
      setDataTable(_data);
      setDataTK({
        distributorCount: _.sumBy(_data, 'distributorCount'),
        distributorAmount: _.sumBy(_data, 'distributorAmount'),
        retailerCount: _.sumBy(_data, 'retailerCount'),
        retailerAmount: _.sumBy(_data, 'retailerAmount'),
        count: _.sumBy(_data, 'count'),
        amount: _.sumBy(_data, 'amount'),
        totalCount: _.sumBy(_data, 'totalCount'),
        totalAmount: _.sumBy(_data, 'totalAmount'),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    console.log(123);
    try {
      const validate = await form.validateFields();
      const formData = form.getFieldsValue(true);
      setLoadingExport(true);
      var body = {
        fromDate: formData?.fromDate ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null,
        toDate: formData?.toDate ? dayjs(formData.toDate).format('YYYY-MM-DD') : null,
        type: formData?.type ?? null,
      };
      const res = await requestDOWNLOADFILE(`api/v1/reports/export-doanh-thu-khoa-hoc-time`, body);
      // Xử lý dữ liệu
      const fileData = new Blob([res.data], { type: 'application/msword' });
      // Tạo liên kết tải xuống (download link)
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = 'ThongKeDoanhThuVaLuotKichHoat.doc'; // Tên file và định dạng file
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
    },
    {
      title: 'Thời gian',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đại lý',
      dataIndex: 'distributor',
      key: 'distributor',
      children: [
        {
          title: 'Số lượt kích hoạt',
          dataIndex: 'distributorCount',
          key: 'distributorCount',
          render: text => <div>{(text || 0).toLocaleString()}</div>,
        },
        {
          title: 'Số tiền thanh toán',
          dataIndex: 'distributorAmount',
          key: 'distributorAmount',
          render: text => (
            <div>
              {(text || 0).toLocaleString('vi', {
                style: 'currency',
                currency: 'VND',
              })}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Cộng tác viên',
      dataIndex: 'retailer',
      key: 'retailer',
      children: [
        {
          title: 'Số lượt kích hoạt',
          dataIndex: 'retailerCount',
          key: 'retailerCount',
          render: text => <div>{(text || 0).toLocaleString()}</div>,
        },
        {
          title: 'Số tiền thanh toán',
          dataIndex: 'retailerAmount',
          key: 'retailerAmount',
          render: text => (
            <div>
              {(text || 0).toLocaleString('vi', {
                style: 'currency',
                currency: 'VND',
              })}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Trực tiếp',
      dataIndex: 'payment',
      key: 'payment',
      children: [
        {
          title: 'Số lượt kích hoạt',
          dataIndex: 'count',
          key: 'count',
          render: text => <div>{(text || 0).toLocaleString()}</div>,
        },
        {
          title: 'Số tiền thanh toán',
          dataIndex: 'amount',
          key: 'amount',
          render: text => (
            <div>
              {(text || 0).toLocaleString('vi', {
                style: 'currency',
                currency: 'VND',
              })}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Tổng số tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: text => (
        <div>
          {(text || 0).toLocaleString('vi', {
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
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thống kê doanh thu theo thời gian'}</h3>
        </div>
        <div className="p-5">
          <Form initialValues={{ fromDate: dayjs(), toDate: dayjs() }} form={form} autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <div className="row">
              <div className="col-xl-4 col-lg-4">
                <FormItem label="Từ ngày" name="fromDate" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <DatePicker format={'DD/MM/YYYY'} placeholder="Từ ngày" style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-4 col-lg-4">
                <FormItem
                  label="Đến ngày"
                  name="toDate"
                  rules={[
                    { required: true, message: 'Không được để trống!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('fromDate') <= value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Đến ngày phải lớn hơn hoặc bằng Từ Ngày!'));
                      },
                    }),
                  ]}
                >
                  <DatePicker format={'DD/MM/YYYY'} placeholder="Đến ngày" style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className=" col-xl-4 col-lg-4">
                <FormItem label="Lọc theo" name="type" initialValue={0} rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Select
                    placeholder="Chọn"
                    options={[
                      {
                        value: 0,
                        label: 'Theo ngày',
                      },
                      {
                        value: 1,
                        label: 'Theo tuần',
                      },
                      {
                        value: 2,
                        label: 'Theo tháng',
                      },
                    ]}
                  />
                </FormItem>
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
                <span className="mx-2">lượt kích hoạt trực tiếp, trị giá:</span>
                <span className="fw-bolder">
                  {dataTK?.amount?.toLocaleString('vi', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </span>
              <span class="d-flex align-items-center mb-2">
                <i className="fas fa-minus me-3"></i>
                <span className="fw-bolder">{dataTK?.distributorCount?.toLocaleString()}</span>
                <span className="mx-2">lượt kích hoạt qua đại lý, trị giá:</span>
                <span className="fw-bolder">
                  {dataTK?.distributorAmount?.toLocaleString('vi', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </span>
              <span class="d-flex align-items-center mb-2">
                <i className="fas fa-minus me-3"></i>
                <span className="fw-bolder">{dataTK?.retailerCount?.toLocaleString()}</span>
                <span className="mx-2">lượt kích hoạt qua cộng tác viên, trị giá:</span>
                <span className="fw-bolder">
                  {dataTK?.retailerAmount?.toLocaleString('vi', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </span>
              <span class="d-flex align-items-center mb-2">
                <i className="fas fa-minus me-3"></i>
                <span className="fw-bolder">TỔNG: {dataTK?.totalCount?.toLocaleString()}</span>
                <span className="mx-2">lượt kích hoạt, trị giá:</span>
                <span className="fw-bolder">
                  {dataTK?.totalAmount?.toLocaleString('vi', {
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
