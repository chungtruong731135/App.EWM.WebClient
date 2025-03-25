import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

import layoutConfig from './components/layoutConfig';
import { RenderOverview } from './components';
import GridItemContainer from './components/GridItemContainer';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardWrapper = () => {
  const dateFormat = 'DD/MM/YYYY';
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const handleBreakPointChange = breakpoint => {
    console.log('breakpoint change', breakpoint);
  };
  const handleLayoutChange = newLayout => {
    console.log('Layout changed', newLayout);
  };

  const items = [
    {
      id: 1,
      layout: 'item1',
    },
    {
      id: 2,
      layout: 'item2',
    },
  ];

  const gridItems = useMemo(
    () =>
      items.map(item => (
        <div key={item.layout} style={{ background: item.color }} className="td-grid-item d-flex">
          <button className="btn btn-sm bg-danger deleteWidgetButton  ng-star-inserted">
            <i className="la la-times text-white "></i>
          </button>
          <RenderOverview />
        </div>
      )),
    [items]
  );

  return (currentUser?.type == 0 || currentUser?.type == null) && (CheckRole(currentPermissions, ['Permissions.Reports.Manage']) || CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage'])) ? (
    <div>
      <div className="d-flex flex-stack container-fluid mb-4">
        <div className="page-title d-flex flex-wrap me-3 flex-column justify-content-center">
          <h1 className="page-heading d-flex text-gray-900 fw-bold fs-3 my-0 flex-column justify-content-center">Dashboard</h1>
        </div>
        <div className="d-flex align-items-center gap-2 gap-lg-3">
          <div className="form-check form-switch form-check-custom form-check-solid me-10">
            <input className="form-check-input h-30px w-50px" type="checkbox" value="" />
            <label className="form-check-label" for="flexSwitch30x50">
              Sửa giao diện
            </label>
          </div>
        </div>
      </div>

      <div className="app-layout-builder-toggle lh-1 p-3 d-flex rounded-1 ">
        <button className="btn btn-sm btn-warning rounded-1 me-2">
          <i className="fa fa-plus me-2"></i>Thêm thành phần
        </button>
        <button className="btn btn-sm btn-success rounded-1 me-2">
          <i className="fa fa-save me-2"></i>Lưu
        </button>
        <button className="btn btn-sm btn-danger rounded-1">
          <i className="fa fa-trash me-2"></i>Đưa về mặc định
        </button>
      </div>

      <ResponsiveGridLayout
        className="td-react-grid"
        layouts={layoutConfig}
        onBreakpointChange={handleBreakPointChange}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        isRearrangeable={true}
        useCSSTransforms={true}
        draggableHandle=".card-header"
        breakpoints={{ lg: 1280, md: 992, sm: 767, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        width={1200}
      >
        {/* {data.map(item => (
          <GridItemContainer key={item} item={item} />
        ))} */}

        {gridItems}
      </ResponsiveGridLayout>
    </div>
  ) : (
    <></>
  );
};

export default DashboardWrapper;
