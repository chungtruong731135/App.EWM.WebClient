/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DatePicker, Form, Select, Table } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';

import { useAuth } from '@/app/modules/auth';
import { requestPOST } from '@/utils/baseAPI';

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

  const excelRef = useRef();
  const onFinish = async () => {
    const formData = form.getFieldsValue(true);
    setLoading(true);
    try {
      const res = await requestPOST(`api/v1/dashboards/kich-hoat-khoa-hoc-course`, {
        fromDate: formData?.fromDate.format('YYYY-MM-DD'),
        toDate: formData?.toDate.format('YYYY-MM-DD'),
      });

      var _data = res?.data ?? [];
      if (_data?.length > 0) {
        _data = _.chain(_data)
          .groupBy('examinatTitle')
          .map((value, key) => {
            var arr = [];
            value?.map(i => {
              arr.push({
                key: i?.id,
                title: i.name,
                count: formData?.type == 0 ? i?.userCourseCount ?? 0 : i?.userCourseActivationCodeCount ?? 0,
                amount: formData?.type == 0 ? i?.amount ?? 0 : i?.activationCodeAmount ?? 0,
              });
            });
            return {
              key: value[0]?.examinatId,
              title: key,
              order: value[0]?.examinatSortOrder,
              count: _.sumBy(arr, i => i?.count ?? 0),
              amount: _.sumBy(arr, i => i?.amount ?? 0),
              children: arr,
            };
          })
          .value();
        _data = _.orderBy(_data, ['order'], ['asc']);
        setDataTable(_data);
      } else {
        setDataTable([]);
      }
    } catch (error) {
      setDataTable([]);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'Kỳ thi',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Doanh thu',
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
      width: '20%',
    },
    {
      title: 'Lượt kích hoạt',
      dataIndex: 'count',
      key: 'count',
      render: text => <div>{(text || 0).toLocaleString()}</div>,
      width: '20%',
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
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thống kê doanh thu - số lượt kích hoạt theo kỳ thi'}</h3>
        </div>
        <div className="p-5">
          <Form form={form} initialValues={{ fromDate: dayjs(), toDate: dayjs() }} autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
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
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: 0,
                        label: 'Thanh toán trực tiếp',
                      },
                      {
                        value: 1,
                        label: 'Qua đại lý/cộng tác viên',
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
              {/* <Spin spinning={loadingExport}>
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
              </Spin> */}
              <button className="btn btn-info btn-sm m-btn m-btn--icon py-2" onClick={handleReset}>
                <span>
                  <i className="fas fa-sync me-1"></i>
                  <span className="">Tải lại</span>
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* {dataTK ? (
          <div className="p-5">
            <div className="fs-4 fw-bolder">Tổng cộng có:</div>
            <div class="d-flex flex-column flex-shrink-0 ms-4 mt-2 text-dark fs-6">
              <span class="d-flex align-items-center mb-2">
                <i className="fas fa-minus me-3"></i>
                <span className="fw-bolder">
                  {dataTK?.count?.toLocaleString()}
                </span>
                <span className="mx-2">lượt giao dịch, trị giá:</span>
                <span className="fw-bolder">
                  {dataTK?.amount?.toLocaleString("vi", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <></>
        )} */}
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
