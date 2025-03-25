import { useEffect, useState } from "react";
import { Select, Table } from "antd";
import { requestPOST } from "@/utils/baseAPI";
import _ from "lodash";

const RenderChartStatus = (props) => {
  const [options, setOptions] = useState(null);
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(0);

  const [dataTable, setDataTable] = useState([]);
  const fromDateToDate = props?.fromDateToDate ?? {};

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await requestPOST(
          `api/v1/dashboards/kich-hoat-khoa-hoc-course`,
          {
            fromDate: fromDateToDate.fromDate.format("YYYY-MM-DD"),
            toDate: fromDateToDate.toDate.format("YYYY-MM-DD"),
          }
        );

        var _data = res?.data ?? [];
        if (_data?.length > 0) {
          _data = _.chain(_data)
            .groupBy("examinatTitle")
            .map((value, key) => {
              var arr = [];
              value?.map((i) => {
                arr.push({
                  key: i?.id,
                  title: i.name,
                  count:
                    type == 0
                      ? i?.userCourseCount ?? 0
                      : i?.userCourseActivationCodeCount ?? 0,
                  amount:
                    type == 0 ? i?.amount ?? 0 : i?.activationCodeAmount ?? 0,
                });
              });
              return {
                key: value[0]?.examinatId,
                title: key,
                order: value[0]?.examinatSortOrder,
                count: _.sumBy(arr, (i) => i?.count ?? 0),
                amount: _.sumBy(arr, (i) => i?.amount ?? 0),
                children: arr,
              };
            })
            .value();
          setDataTable(_data);
        } else {
          setDataTable([]);
        }
      } catch (error) {
        setDataTable([]);
      }
      setIsLoading(false);
    };
    fetchData();
    return () => {};
  }, [fromDateToDate, type]);
  const columns = [
    {
      title: "Kỳ thi",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Doanh thu",
      dataIndex: "amount",
      key: "amount",
      render: (text) => (
        <div>
          {(text || 0).toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          })}
        </div>
      ),
      width: "20%",
    },
    {
      title: "Lượt kích hoạt",
      dataIndex: "count",
      key: "count",
      render: (text) => <div>{(text || 0).toLocaleString()}</div>,
      width: "20%",
    },
  ];
  return (
    <div className="card card-xl-stretch mb-xl-5 p-5 border-0">
      <div className="card-header ribbon ribbon-top ribbon-vertical px-3">
        <div className="card-title ">
          <span className="fa fa-chart-bar me-3 "></span> Thống kê doanh thu -
          số lượt kích hoạt theo kỳ thi
        </div>
        <div className="card-toolbar">
          <div className="ms-2 w-xl-200px w-lg-150px">
            <Select
              defaultValue={0}
              placeholder="Loại"
              style={{ width: "100%" }}
              options={[
                {
                  value: 0,
                  label: "Thanh toán trực tiếp",
                },
                {
                  value: 1,
                  label: "Qua đại lý/cộng tác viên",
                },
              ]}
              onChange={(value) => {
                setType(value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="card-body">
        <Table
          bordered
          pagination={false}
          dataSource={dataTable}
          columns={columns}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default RenderChartStatus;
