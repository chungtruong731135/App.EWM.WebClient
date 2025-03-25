import React, { useEffect, useState } from "react";
import { Spin } from "antd";

import _ from "lodash";
import { requestGET } from "@/utils/baseAPI";

const RenderChartStatus = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
        <div className="card-header min-h-50px">
          <h3 className="card-title fw-bold text-primary">Tổng quan</h3>
        </div>
        <div className="card-body">
          <Spin spinning={isLoading}>
            <div className="row gy-5 gx-xl-8">
              {data?.map((item, index) => (
                <div key={index} className="col-lg-4 col-xl-3">
                  <div
                    className={` rounded p-2 d-flex align-items-center mb-2`}
                  >
                    <div
                      className={`bg-opacity-25 bg-primary rounded-circle h-35px h-xxl-50px w-35px w-xxl-50px d-flex align-items-center justify-content-center me-3 me-xxl-5`}
                    >
                      <span
                        className={`svg-icon fs-2 text-primary fa fa-clipboard-list`}
                      ></span>
                    </div>
                    <div className="d-flex flex-column">
                      <span className={`fs-2 lh-1 fw-bold text-primary`}>
                        {item?.value ?? 0}
                      </span>
                      <span className="text-gray-800">{item?.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default RenderChartStatus;
