import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { requestPOST } from '@/utils/baseAPI';
import _ from 'lodash';
import dayjs from 'dayjs';

import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
const RenderChartStatus = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(0);
  const [typeDate, setTypeDate] = useState(0);

  const [optionLine, setOptionLine] = useState({
    chart: {
      type: 'column',
    },
    legend: {
      verticalAlign: 'bottom',
    },
    credits: {
      enabled: false,
    },
    title: {
      text: ' ',
    },
  });
  const fromDateToDate = props?.fromDateToDate ?? {};

  const getOptionLine = _data => {
    setIsLoading(true);
    let arr_Data = [];
    let arr_Text = [];

    if (type == 0) {
      const sortedDoanhSo = _data.sort((a, b) => b.priceAmount - a.priceAmount);
      const top5 = sortedDoanhSo.slice(0, 5);
      const others = sortedDoanhSo.slice(5);
      const totalDoanhSoOthers = others.reduce((total, item) => total + item.priceAmount, 0);
      const result = [...top5, { fullName: 'Khác', priceAmount: totalDoanhSoOthers }];

      (result ?? []).map(i => {
        arr_Data.push(i?.priceAmount ?? 0);
        arr_Text.push(i?.fullName ?? '');
      });
    } else {
      const sortedDoanhSo = _data.sort((a, b) => b.courseAmount - a.courseAmount);
      const top5 = sortedDoanhSo.slice(0, 5);
      const others = sortedDoanhSo.slice(5);
      const totalDoanhSoOthers = others.reduce((total, item) => total + item.courseAmount, 0);
      const result = [...top5, { fullName: 'Khác', courseAmount: totalDoanhSoOthers }];

      (result ?? []).map(i => {
        arr_Data.push(i?.courseAmount ?? 0);
        arr_Text.push(i?.fullName ?? '');
      });
    }

    setOptionLine({
      chart: {
        type: 'column',
      },
      title: {
        text: '',
      },
      yAxis: {
        title: null,
        min: 0,
      },

      xAxis: { categories: arr_Text },
      plotOptions: {
        series: {
          label: null,
        },
      },
      legend: {
        verticalAlign: 'bottom',
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: type == 0 ? 'Doanh số (₫)' : 'Khoá học',
          tooltip: {
            valueSuffix: type == 0 ? ' ₫' : ' Khoá',
          },
          data: arr_Data,
        },
      ],
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(`api/v1/dashboards/doanh-thu-ctv-daily`, {
        fromDate: fromDateToDate.fromDate.format('YYYY-MM-DD'),
        toDate: fromDateToDate.toDate.format('YYYY-MM-DD'),
      });

      var _data = res?.data ?? null;
      if (_data) {
        getOptionLine(_data);
      }
    };
    fetchData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDateToDate, type, typeDate]);
  console.log(optionLine);
  return (
    <div className="card card-xl-stretch mb-xl-5 p-5 border-0">
      <div className="card-header ribbon ribbon-top ribbon-vertical px-3">
        <div className="card-title ">
          <span className="fa fa-chart-bar me-3 "></span> Doanh số theo cộng tác viên/Đại lý
        </div>
        <div className="card-toolbar">
          <div className="ms-2 w-xl-200px w-lg-150px">
            <Select
              defaultValue={0}
              placeholder="Loại"
              style={{ width: '100%' }}
              options={[
                {
                  value: 0,
                  label: 'Doanh số',
                },
                {
                  value: 1,
                  label: 'Số lượng khoá học',
                },
              ]}
              onChange={value => {
                setType(value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="card-body">
        <Spin spinning={isLoading}>{isLoading ? <div className="h-300px" /> : <HighchartsReact highcharts={Highcharts} options={optionLine} />}</Spin>
      </div>
    </div>
  );
};

export default RenderChartStatus;
