/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { requestGET, requestPOST } from '@/utils/baseAPI';
import { Select, Table } from 'antd';
import TDSelect from '@/app/components/TDSelect';

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { surveyTemplateId } = useParams();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dataSearch, setDataSearch] = useState({ surveyTemplateId: surveyTemplateId });
  const [dataCourse, setDataCourse] = useState(null);
  const [dataThongKe, setDataThongKe] = useState(null);

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/surveytemplates/${id}`);
      setDataCourse(res?.data ?? null);
    };

    const fetchAmount = async () => {
      const res = await requestPOST(`api/v1/surveytemplates/amount`, {
        surveyTemplateId: surveyTemplateId,
        ...dataSearch,
      });
      setDataThongKe(res?.data ?? null);
    };

    if (surveyTemplateId) {
      fetchData(surveyTemplateId);
      fetchAmount();
    }
  }, [surveyTemplateId, dataSearch]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(`api/v1/surveytemplates/chart`, {
        surveyTemplateId: surveyTemplateId,
        ...dataSearch,
      });
      let data = res?.data ?? [];
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.id]) {
          acc[item.id] = {
            content: item.content,
            surveyQuestionOrderOrder: item.surveyQuestionOrderOrder,
            items: [],
          };
        }
        acc[item.id].items.push(item);
        return acc;
      }, {});

      // Bước 2 và 3: Tính số lượng, tổng amount và tỷ lệ phần trăm
      const result = Object.keys(groupedData).map(id => {
        const { content, items } = groupedData[id];
        const totalAmount = items.reduce((acc, item) => acc + item.amount, 0);
        const itemCount = items.length;

        const percentages = items.map(item => ({
          surveyQuestionOptionId: item.surveyQuestionOptionId,
          surveyQuestionOptionOrder: item.surveyQuestionOptionOrder,
          surveyQuestionOptionContent: item.surveyQuestionOptionContent,
          amount: item.amount,
          percentage: ((item.amount / totalAmount) * 100).toFixed(2) + '%',
        }));

        return {
          id,
          content,
          itemCount,
          totalAmount,
          items: percentages,
        };
      });
      let questionIndex = 1; // Số thứ tự cho các câu hỏi
      const dataSource = result.flatMap(group =>
        group.items.map((item, index) => ({
          key: `${group.id}-${item.surveyQuestionOptionId}`,
          questionIndex: index === 0 ? questionIndex++ : '', // Chỉ tăng số thứ tự cho câu hỏi đầu tiên của mỗi nhóm
          content: index === 0 ? group.content : '', // Hiển thị tên của nhóm chỉ một lần
          id: item.surveyQuestionOptionId,
          percentage: item.percentage,
          surveyQuestionOptionId: item.surveyQuestionOptionId,
          surveyQuestionOptionOrder: item.surveyQuestionOptionOrder,
          surveyQuestionOptionContent: item.surveyQuestionOptionContent,
          amount: item.amount,
          rowSpan: index === 0 ? group.items.length : 0, // rowspan cho các hàng đầu tiên
        }))
      );

      setDataTable(dataSource);
    };
    if (surveyTemplateId) {
      fetchData(surveyTemplateId);
    }
  }, [surveyTemplateId, dataSearch]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'questionIndex',
      key: 'questionIndex',
      render: (text, row) => {
        return {
          children: text,
          props: { rowSpan: row.rowSpan },
        };
      },
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'content',
      key: 'content',
      render: (text, row) => {
        return {
          children: text,
          props: { rowSpan: row.rowSpan },
        };
      },
    },
    {
      title: 'Trả lời',
      dataIndex: 'surveyQuestionOptionContent',
      key: 'surveyQuestionOptionContent',
    },
    {
      title: 'Số lượng',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Phần trăm (được dựa trên số lượng người được khảo sát)',
      dataIndex: 'percentage',
      key: 'percentage',
    },
  ];

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
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
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thống kê kết quả khảo sát ' + (dataCourse?.name ?? '')}</h3>
          </div>
          <div className="card-toolbar"></div>
        </div>
        <div className="row g-5 my-2">
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3 flex-grow-1 w-150px">Đợt khảo sát:</span>
            <TDSelect
              className="flex-grow-1"
              showSearch={true}
              reload={true}
              placeholder="Chọn đợt khảo sát"
              fetchOptions={async keyword => {
                const res = await requestPOST(`api/v1/surveys/search`, {
                  pageNumber: 1,
                  pageSize: 100,
                  keyword: keyword,
                  surveyTemplateId: surveyTemplateId,
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
              value={dataSearch?.surveyId ?? null}
              onChange={(value, current) => {
                console.log(value);
                console.log(current);

                if (value) {
                  setDataSearch({
                    ...dataSearch,
                    surveyId: current?.id,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    surveyId: null,
                  });
                }
              }}
            />
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5 d-flex ">
            <span className="fw-bold me-3 flex-grow-1 w-150px">Trạng thái:</span>
            <Select
              allowClear
              style={{ width: '100%' }}
              options={[
                {
                  value: 0,
                  label: 'Đang thực hiện',
                },
                {
                  value: 1,
                  label: 'Kết thúc',
                },
              ]}
              onChange={(value, current) => {
                if (value != undefined) {
                  setDataSearch({
                    ...dataSearch,
                    status: value,
                  });
                } else {
                  setDataSearch({
                    ...dataSearch,
                    status: null,
                  });
                }
              }}
            />
          </div>
        </div>
        <div className="row g-5 my-2 m-3">
          <div className="fs-5 fw-bolder">Tổng cộng: {dataThongKe?.tongSoNguoiDung ?? 0} người dùng tham gia khảo sát, trong đó:</div>
          <div className="fs-5 fw-bolder">- {dataThongKe?.soLuongNguoiDaKhaoSat ?? 0} người dùng đã hoàn thành khảo sát</div>
          <div className="fs-5 fw-bolder">- {dataThongKe?.soLuongNguoiDangKhaoSat ?? 0} người dùng đang khảo sát</div>
        </div>
        <div className="card-dashboard-body table-responsive">
          <Table
            bordered
            columns={columns}
            dataSource={dataTable}
            loading={loading}
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
    </>
  );
};

export default UsersPage;
