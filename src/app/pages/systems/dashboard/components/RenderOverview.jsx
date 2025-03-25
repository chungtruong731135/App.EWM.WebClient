import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';

import _ from 'lodash';
import { requestGET } from '@/utils/baseAPI';

import ModalTuyChinhThongKe from './ModalTuyChinhThongKe';

const RenderChartStatus = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [tuyChinhThongKeVisible, setTuyChinhThongKeVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestGET(`api/v1/dashboards/home`);

      var _data = res?.data ?? null;
      if (_data) {
        setData(_data);
      }
    };
    fetchData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={`card card-xl-stretch mb-xl-5`}>
        <div className="card-header min-h-50px td-react-grid-draggable">
          <h3 className="card-title fw-bold text-primary">Tổng quan</h3>
          <div className="card-toolbar">
            <button className="btn btn-icon btn-sm btn-active-light-primary">
              <i class="ki-outline ki-setting-2 text-gray-500 fs-3"></i>
            </button>
            <button
              className="btn btn-icon btn-sm btn-active-light-primary"
              onClick={() => {
                setTuyChinhThongKeVisible(true);
              }}
            >
              <i class="ki-outline ki-setting-4 text-gray-500 fs-3"></i>
            </button>
          </div>
        </div>
        <div className="card-body">
          <Spin spinning={isLoading}>
            <div className="row gy-5 gx-xl-8">
              {data?.map((item, index) => (
                <div key={index} className="col-lg-4 col-xl-3">
                  <div className={` rounded p-2 d-flex align-items-center mb-2`}>
                    <div className={`bg-opacity-25 bg-primary rounded-circle h-35px h-xxl-50px w-35px w-xxl-50px d-flex align-items-center justify-content-center me-3 me-xxl-5`}>
                      <span className={`svg-icon fs-2 text-primary fa fa-clipboard-list`}></span>
                    </div>
                    <div className="d-flex flex-column">
                      <span className={`fs-2 lh-1 fw-bold text-primary`}>{item?.value ?? 0}</span>
                      <span className="text-gray-800">{item?.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Spin>
        </div>
      </div>
      {tuyChinhThongKeVisible ? <ModalTuyChinhThongKe modalVisible={tuyChinhThongKeVisible} setModalVisible={setTuyChinhThongKeVisible} /> : <></>}
    </>
  );
};

export default RenderChartStatus;
