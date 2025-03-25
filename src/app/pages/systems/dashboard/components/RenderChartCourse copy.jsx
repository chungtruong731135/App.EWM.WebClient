import { useEffect, useState } from "react";
import { Select, Spin } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { requestPOST } from "@/utils/baseAPI";
import _ from "lodash";

const RenderChartStatus = (props) => {
  const [options, setOptions] = useState(null);
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(0);

  const [optionLine, setOptionLine] = useState(null);
  const fromDateToDate = props?.fromDateToDate ?? {};

  const getOptionLine = (_data) => {
    let arr_ChiNhanh = [];
    let arr_DoanhThu = [];
    let arr_KichHoat = [];

    _data?.map((item) => {
      arr_ChiNhanh.push(item?.name ?? "");
      arr_DoanhThu.push(
        type == 0 ? item?.amount ?? 0 : item?.activationCodeAmount ?? 0
      );
      arr_KichHoat.push(
        type == 0
          ? (item?.userCourseCount ?? 0) -
              (item?.userCourseActivationCodeCount ?? 0)
          : item?.userCourseActivationCodeCount ?? 0
      );
    });
    console.log(arr_ChiNhanh);

    setOptionLine({
      chart: {},
      title: {
        text: "",
      },
      xAxis: [
        {
          categories: arr_ChiNhanh,
        },
      ],
      yAxis: [
        {
          // Primary yAxis
          labels: {
            format: "{value} lượt",
            style: {
              color: Highcharts.getOptions().colors[1],
            },
          },
          title: {
            text: "Lượt kích hoạt",
            style: {
              color: Highcharts.getOptions().colors[1],
            },
          },
        },
        {
          // Secondary yAxis
          title: {
            text: "Doanh thu",
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          labels: {
            format: "{value} VND",
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          opposite: true,
        },
      ],
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "middle",
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: "Doanh thu",
          type: "column",
          yAxis: 1,
          data: arr_DoanhThu,
          tooltip: {
            valueSuffix: " VND",
          },
        },
        {
          name: "Lượt kích hoạt",
          type: "column",
          data: arr_KichHoat,
          tooltip: {
            valueSuffix: " lượt",
          },
        },
      ],
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(
        `api/v1/dashboards/kich-hoat-khoa-hoc-course`,
        {
          fromDate: fromDateToDate.fromDate.format("YYYY-MM-DD"),
          toDate: fromDateToDate.toDate.format("YYYY-MM-DD"),
        }
      );

      var _data = res?.data ?? null;
      if (_data) {
        getOptionLine(_data);
      }
    };
    fetchData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDateToDate, type]);
  return (
    <div className="card card-xl-stretch mb-xl-5 p-5 border-0">
      <div className="card-header ribbon ribbon-top ribbon-vertical px-3">
        <div className="card-title ">
          <span className="fa fa-chart-bar me-3 "></span> Biểu đồ doanh thu - số
          lượt kích hoạt theo khóa học
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
        <Spin spinning={isLoading}>
          <HighchartsReact highcharts={Highcharts} options={optionLine} />
        </Spin>
      </div>
    </div>
  );
};

export default RenderChartStatus;
