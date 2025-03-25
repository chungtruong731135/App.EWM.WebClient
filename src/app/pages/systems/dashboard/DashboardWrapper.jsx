import { useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';

import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

import {
  RenderOverview,
  RenderChartMoney,
  RenderChartCourse,
  RenderChartCourseOnline,
  ChartTangTruongTaiKhoanKichHoatKhoaHoc,
  BarChartDoanhThuCongTacVienDaiLy,
  BarChartDoanhThuKhoaHoc,
  ChartTangTruongNguoiDung,
} from './components';

const { RangePicker } = DatePicker;

const DashboardWrapper = () => {
  const dateFormat = 'DD/MM/YYYY';
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const [fromDateToDate, setFromDateToDate] = useState({
    fromDate: dayjs().startOf('month'),
    toDate: dayjs(),
  });

  const onChange = (date, dateString) => {
    setFromDateToDate({
      fromDate: date[0],
      toDate: date[1],
    });
  };

  return (currentUser?.type == 0 || currentUser?.type == null) && (CheckRole(currentPermissions, ['Permissions.Reports.Manage']) || CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage'])) ? (
    <div>
      <div className="mb-5">
        <RenderOverview />
      </div>
      <div className={`card card-xl-stretch mb-xl-5`}>
        <div className="card-header min-h-50px">
          <h3 className="card-title fw-bold text-primary">Thống kê chung theo thời gian</h3>
          <div className="card-toolbar">
            <RangePicker
              onChange={onChange}
              //defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
              value={[fromDateToDate?.fromDate, fromDateToDate?.toDate]}
              format={dateFormat}
            />
          </div>
        </div>
        <div className="card-body">
          <div className="row ">
            <div className="col-12">
              <RenderChartMoney fromDateToDate={fromDateToDate} />
            </div>
            <div className="col-xl-6 col-lg-12">
              <BarChartDoanhThuCongTacVienDaiLy fromDateToDate={fromDateToDate} />
            </div>
            <div className="col-xl-6 col-lg-12">
              <BarChartDoanhThuKhoaHoc fromDateToDate={fromDateToDate} />
            </div>
            <div className="col-xl-6 col-lg-12">
              <ChartTangTruongNguoiDung fromDateToDate={fromDateToDate} />
            </div>
            <div className="col-xl-6 col-lg-12">
              <ChartTangTruongTaiKhoanKichHoatKhoaHoc fromDateToDate={fromDateToDate} />
            </div>

            {/*  <div className="col-12">
              <RenderChartCourse fromDateToDate={fromDateToDate} />
            </div>
            <div className="col-12">
              <RenderChartCourseOnline fromDateToDate={fromDateToDate} />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default DashboardWrapper;
