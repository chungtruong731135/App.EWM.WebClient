/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { DatePicker, Form, Table } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';

import { requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';

const FormItem = Form.Item;

const UsersPage = () => {
  const [form] = Form.useForm();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    const formData = form.getFieldsValue(true);
    setLoading(true);
    try {
      const res = await requestPOST(`api/v1/reports/doanh-thu-theo-nguon-khach-hang`, {
        fromDate: formData?.fromDate.format('YYYY-MM-DD'),
        toDate: formData?.toDate.format('YYYY-MM-DD'),
        userTypeId: formData?.userTypeId,
      });

      var _data = res?.data ?? [];
      if (_data?.length > 0) {
        _data?.map((item, index) => {
          var children = [];
          var dataDetails = item?.dataDetails?.split('##');
          dataDetails?.map((i, ind) => {
            var temp = i?.split('#');
            children.push({
              key: `${index + '.' + ind}`,
              name: temp[0],
              amount: temp[1],
            });
          });
          item.key = `${index}`;
          item.children = children;
        });
        console.log(_data);
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
      title: 'Nguồn khách hàng',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: 'Số lượng khoá học',
      dataIndex: 'summary',
      key: 'summary',
      render: text => <div>{text ? text.toLocaleString('vi') : ''}</div>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: text => (
        <div>
          {Number(text || 0).toLocaleString('vi', {
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
                <FormItem label="Nguồn khách hàng" name="userType">
                  <TDSelect
                    reload={true}
                    showSearch
                    placeholder=""
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/categories/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                        isActive: true,
                        categoryGroupCode: 'LoaiKichHoat',
                        keyword: keyword,
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
                    onChange={(value, current) => {
                      if (value) {
                        form.setFieldValue('userTypeId', current?.id);
                        form.setFieldValue('userTypeName', current?.name);
                      } else {
                        form.setFieldValue('userTypeId', null);
                        form.setFieldValue('userTypeName', null);
                      }
                    }}
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
