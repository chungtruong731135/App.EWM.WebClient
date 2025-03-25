/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker, Form, Popconfirm, Select, Spin, Table } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';

import { requestDOWNLOADFILE, requestPOST, requestPUT_NEW } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';
import { toast } from 'react-toastify';
import * as actionsModal from '@/setup/redux/modal/Actions';
import CustomPriceModal from '../activation-code/components/CustomPriceModal';

const FormItem = Form.Item;

const DoiSoatGiaoDichPage = () => {
  const dispatch = useDispatch();
  const random = useSelector(state => state.modal.random);

  const [form] = Form.useForm();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [amount, setAmount] = useState(0);

  const [modalCustomPriceVisible, setModalCustomPriceVisible] = useState(false);
  const [dataModal, setDataModal] = useState(null);

  const onFinish = async () => {
    setLoading(true);
    try {
      await form.validateFields();
      const formData = form.getFieldsValue(true);
      const res = await requestPOST(`api/v1/reports/doi-soat-giao-dich`, {
        fromDate: formData?.fromDate.format('YYYY-MM-DD'),
        toDate: formData?.toDate.format('YYYY-MM-DD'),
        userId: formData?.userId,
        courseType: formData?.courseType ?? null,
      });

      var _data = res?.data ?? [];

      const tong = _data.reduce((total, item) => total + (item?.amount ?? 0), 0);

      setAmount(tong);
      setDataTable(_data);
    } catch (error) {
      setDataTable([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    onFinish();

    return () => {};
  }, [random]);

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: record => ({
      disabled: record?.paymentStatus == 1 || record.status != 1,
    }),
  };

  const handleButton = async (type, item) => {
    switch (type) {
      case 'custom-price':
        setDataModal(item);
        setModalCustomPriceVisible(true);

        break;

      case 'undo-code':
        var res = await requestPOST(`api/v1/sales/activationcodes/revokecode`, {
          code: item?.code,
        });
        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;

      case 'confirm':
        handleUpdatePaymentStatus([item?.id]);
        break;

      case 'chuanhantien':
        handleUpdatePaymentStatus([item?.id], 0);

        break;

      default:
        break;
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
      title: 'Khoá học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Giá gốc',
      dataIndex: 'coursePrice',
      key: 'coursePrice',
      render: text => (
        <div>
          {(text || 0).toLocaleString('vi', {
            style: 'currency',
            currency: 'VND',
          })}
        </div>
      ),
    },
    {
      title: 'Giá thanh toán',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record, index) => (
        <>
          <div>
            {(text || 0).toLocaleString('vi', {
              style: 'currency',
              currency: 'VND',
            })}
          </div>
          {record.amount && record.amount > 0 ? <div className={`mt-2  me-auto badge badge-light-success`}>{Math.round(((record?.amount ?? 0) / (record?.coursePrice ?? 1)) * 100)}%</div> : <></>}
        </>
      ),
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentFullName',
      key: 'studentFullName',
      render: (text, record, index) => <TDTableColumnHoTen showMenu={true} dataUser={{ type: 1, fullName: record?.studentFullName, imageUrl: record?.studentImageUrl, userName: record?.studentUserName }} index={index} />,
    },
    {
      title: 'Ngày kích hoạt mã',
      dataIndex: 'userCourseActivationCodeCreatedOn',
      key: 'userCourseActivationCodeCreatedOn',
      render: (text, record) => {
        return <div>{record?.userCourseActivationCodeCreatedOn ? dayjs(record?.userCourseActivationCodeCreatedOn).format('DD/MM/YYYY HH:mm') : ''}</div>;
      },
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return (
          <div className="d-flex flex-column ">
            <div className={`me-auto badge badge-light-${text == 1 ? 'success' : record?.expireDate && dayjs(record?.expireDate).isBefore(dayjs().format('YYYY-MM-DD')) ? 'danger' : 'primary'}`}>
              {text == 1 ? 'Đã sử dụng' : record?.expireDate && dayjs(record?.expireDate).isBefore(dayjs().format('YYYY-MM-DD')) ? 'Hết hạn' : 'Chưa sử dụng'}
            </div>
            {record?.status == 1 ? <div className={`mt-2  me-auto badge badge-light-${record?.paymentStatus == 1 ? 'success' : 'danger'}`}>{record?.paymentStatus == 1 ? 'Đã nhận tiền' : 'Chưa nhận tiền'}</div> : <></>}
          </div>
        );
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
            {record?.status == 1 ? (
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Chỉnh sửa giá thanh toán"
                onClick={() => {
                  handleButton(`custom-price`, record);
                }}
              >
                <i className="fa fa-money-bill"></i>
              </a>
            ) : (
              <></>
            )}

            {record?.status != 0 && record?.paymentStatus != 1 ? (
              <Popconfirm
                title="Xác nhận đã nhận tiền?"
                onConfirm={() => {
                  handleButton(`confirm`, record);
                }}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Đã nhận tiền">
                  <i className="fas fa-money-check-alt"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
            {record?.status != 0 && record?.paymentStatus == 1 ? (
              <Popconfirm
                title="Xác nhận chưa nhận tiền?"
                onConfirm={() => {
                  handleButton(`chuanhantien`, record);
                }}
                okText="Xác nhận"
                cancelText="Huỷ"
              >
                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Chưa nhận tiền">
                  <i className="fas fa-rotate-left"></i>
                </a>
              </Popconfirm>
            ) : (
              <></>
            )}
          </div>
        );
      },
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

  const handleUpdatePaymentStatus = async (ids, status = 1) => {
    var res = await requestPUT_NEW(`api/v1/activationcodes/paymentstatus`, {
      ids: ids,
      paymentStatus: status,
    });
    if (res) {
      toast.success('Thao tác thành công!');
      setSelectedRowKeys([]);
      dispatch(actionsModal.setRandom());
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  const handleExport = async () => {
    try {
      await form.validateFields();
      const formData = form.getFieldsValue(true);
      console.log(formData);
      setLoadingExport(true);
      var body = {
        fromDate: formData?.fromDate ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null,
        toDate: formData?.toDate ? dayjs(formData.toDate).format('YYYY-MM-DD') : null,
        type: formData?.type ?? null,
        userId: formData?.userId ?? null,
        courseType: formData?.courseType ?? null,
      };
      const resExport = await requestDOWNLOADFILE(`api/v1/reports/export-doi-soat-giao-dich`, body);
      var fileData = new Blob([resExport.data], { type: 'application/vnd.ms-excel' });
      var downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = `DoiSoat_${formData?.fullName ?? ''}_${formData?.fromDate.format('YYYY-MM-DD')}_${formData?.toDate.format('YYYY-MM-DD')}.xlsx`;
      downloadLink.click();
      setLoadingExport(false);
    } catch (error) {
      console.log(error);
      setLoadingExport(false);
    }
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="p-4 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Đốt soát thông tin giao dịch đại lý/CTV'}</h3>
        </div>
        <div className="p-5">
          <Form form={form} initialValues={{ fromDate: dayjs().startOf('month'), toDate: dayjs() }} autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
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
              <div className="col-xl-4 col-lg-4">
                <FormItem label="Loại tài khoản" name="type">
                  <Select
                    allowClear
                    placeholder="Chọn"
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: -1,
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
              <div className="col-xl-4 col-lg-4">
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) => (
                    <FormItem label="Người dùng" name="user" rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <TDSelect
                        reload
                        showSearch
                        placeholder="Chọn"
                        fetchOptions={async keyword => {
                          const res = await requestPOST(`api/users/search`, {
                            pageNumber: 1,
                            pageSize: 100,
                            advancedSearch: {
                              fields: ['name'],
                              keyword: keyword || null,
                            },
                            keyword: keyword,
                            type: getFieldValue('type') == 0 ? 5 : getFieldValue('type') == 1 ? 4 : null,
                            types: [4, 5],
                            isActive: true,
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
                            form.setFieldValue('userName', current?.userName);
                            form.setFieldValue('fullName', current?.fullName);
                          } else {
                            form.setFieldValue('userId', null);
                            form.setFieldValue('userName', null);
                            form.setFieldValue('fullName', null);
                          }
                        }}
                        optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
                      />
                    </FormItem>
                  )}
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <FormItem label="Loại khoá học" name="courseType">
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
                        label: 'Khoá học tự luyện',
                      },
                      {
                        value: 1,
                        label: 'Khoá học Online',
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
        {amount > 0 ? (
          <div className="p-5">
            <div className="fs-4 fw-bolder">
              Tổng cộng :{' '}
              {(amount || 0).toLocaleString('vi', {
                style: 'currency',
                currency: 'VND',
              })}
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="card-body card-dashboard px-3 py-3">
          <div className="d-flex align-items-center flex-grow-1 my-3">
            {(selectedRowKeys || [])?.length > 0 && (
              <>
                <span className="me-2">Đã chọn</span>
                <span className="fw-bold me-10">{(selectedRowKeys || [])?.length}</span>
                <span
                  className="fw-bold me-10 text-info cursor-pointer"
                  onClick={() => {
                    setSelectedRowKeys([]);
                  }}
                >
                  Bỏ chọn
                </span>
                <Popconfirm
                  title="Bạn có chắc chắn xác nhận đã nhận tiền?"
                  onConfirm={() => {
                    handleUpdatePaymentStatus(selectedRowKeys);
                  }}
                  okText="Xác nhận"
                  cancelText="Huỷ"
                >
                  <a type="button" className="btn btn-success btn-sm m-btn m-btn--icon py-2 me-2">
                    <span>
                      <i className="fas fa-check me-2"></i>
                      <span className="">Đã nhận tiền</span>
                    </span>
                  </a>
                </Popconfirm>
              </>
            )}
          </div>
          <div className="card-dashboard-body table-responsive">
            <Table
              bordered
              columns={columns}
              dataSource={dataTable}
              loading={loading}
              /* pagination={true} */
              rowSelection={rowSelection}
              rowKey={'id'}
              size={50}
              pagination={{
                defaultPageSize: 30,
                pageSizeOptions: ['10', '20', '30', '50'],
                locale: { items_per_page: '/ trang' },
                size: 'default',
              }}
            />
          </div>
        </div>
      </div>
      {modalCustomPriceVisible ? <CustomPriceModal modalVisible={modalCustomPriceVisible} setModalVisible={setModalCustomPriceVisible} dataModal={dataModal} /> : <></>}
    </>
  );
};

export default DoiSoatGiaoDichPage;
