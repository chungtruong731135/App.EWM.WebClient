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
      type: 'pie',
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

    const sortedDoanhSo = _data.sort((a, b) => (b?.activationCodeAmount ?? 0) + (b?.priceAmount ?? 0) - (a?.activationCodeAmount ?? 0) + (a?.priceAmount ?? 0));
    const top5 = sortedDoanhSo.slice(0, 5);
    const others = sortedDoanhSo.slice(5);
    const totalDoanhSoOthers = others.reduce((total, item) => total + (item?.activationCodeAmount ?? 0) + (item?.amount ?? 0), 0);
    const result = [...top5, { title: 'Khoá học khác', amount: totalDoanhSoOthers }];

    (result ?? []).map(i => {
      arr_Data.push({
        name: i?.title ?? '',
        y: (i?.activationCodeAmount ?? 0) + (i?.amount ?? 0),
      });
    });

    setOptionLine({
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: ' ',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: 'Doanh số (₫)',
          tooltip: {
            valueSuffix: ' ₫',
          },
          colorByPoint: true,
          data: arr_Data,
        },
      ],
      legend: {
        verticalAlign: 'bottom',
      },
      credits: {
        enabled: false,
      },
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestPOST(`api/v1/dashboards/doanh-thu-khoa-hoc`, {
        fromDate: fromDateToDate.fromDate.format('YYYY-MM-DD'),
        toDate: fromDateToDate.toDate.format('YYYY-MM-DD'),
        type: type,
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
          <span className="fa fa-chart-bar me-3 "></span> Doanh thu theo khoá học
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
                  label: 'Khoá tự học',
                },
                {
                  value: 1,
                  label: 'Khoá Online',
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
