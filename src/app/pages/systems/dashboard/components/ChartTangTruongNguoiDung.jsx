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

  const [optionLine, setOptionLine] = useState(null);
  const fromDateToDate = props?.fromDateToDate ?? {};

  const getOptionLine = _data => {
    setIsLoading(true);
    let arr_Cash = [];
    let count = fromDateToDate.toDate.diff(fromDateToDate.fromDate, 'day');
    for (let i = 0; i <= count; i++) {
      let time = fromDateToDate.fromDate.add(i, 'day').format('YYYY-MM-DD');
      let item = _data?.find(item => item?.name == time);
      let text = Date.UTC(dayjs(time).year(), dayjs(time).month(), dayjs(time).date());
      arr_Cash.push([text, item?.value ?? 0]);
    }

    var format = '%d/%m/%Y';
    setOptionLine({
      chart: {
        type: 'spline',
      },
      title: {
        text: '',
      },
      yAxis: {
        title: null,
        min: 0,
      },

      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            return Highcharts.dateFormat(format, this.value);
          },
        },
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        xDateFormat: format,
      },
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
          name: 'Tài khoản tạo mới',
          tooltip: {
            valueSuffix: ' tài khoản',
          },
          data: arr_Cash,
        },
      ],
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(`api/v1/dashboards/tang-truong-nguoi-dung`, {
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
  return (
    <div className="card card-xl-stretch mb-xl-5 p-5 border-0">
      <div className="card-header ribbon ribbon-top ribbon-vertical px-3">
        <div className="card-title ">
          <span className="fa fa-chart-bar me-3 "></span> Biểu đồ tăng trưởng người dùng tạo mới
        </div>
        <div className="card-toolbar"></div>
      </div>
      <div className="card-body">
        <Spin spinning={isLoading}>{isLoading ? <div className="h-300px" /> : <HighchartsReact highcharts={Highcharts} options={optionLine} />}</Spin>
      </div>
    </div>
  );
};

export default RenderChartStatus;
