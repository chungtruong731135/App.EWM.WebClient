import { useEffect, useState } from "react";
import { Table } from "antd";
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
        const res = await requestPOST(`api/v1/dashboards/khoa-hoc-online`, {
          fromDate: fromDateToDate.fromDate.format("YYYY-MM-DD"),
          toDate: fromDateToDate.toDate.format("YYYY-MM-DD"),
        });

        var _data = res?.data ?? [];
        if (_data?.length > 0) {
          _data = _.chain(_data)
            .groupBy("title")
            .map((value, key) => {
              value.map((i) => (i.title = i?.courseClassName));
              return {
                key: key,
                title: key,
                totalStudents: _.sumBy(value, (i) => i?.totalStudents ?? 0),
                children: value,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDateToDate, type]);
  const columns = [
    {
      title: "Khoá học",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tổng số học sinh",
      dataIndex: "totalStudents",
      key: "totalStudents",
      width: "20%",
    },
  ];
  return (
    <div className="card card-xl-stretch mb-xl-5 p-5 border-0">
      <div className="card-header ribbon ribbon-top ribbon-vertical px-3">
        <div className="card-title ">
          <span className="fa fa-chart-bar me-3 "></span> Thống kê khoá học
          online
        </div>
        {/* <div className="card-toolbar">
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
        </div> */}
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
