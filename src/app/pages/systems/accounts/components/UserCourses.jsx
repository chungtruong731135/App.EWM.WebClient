/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker, Checkbox, Select } from 'antd';
import Collapse from 'react-bootstrap/Collapse';
import { useParams } from 'react-router-dom';

import { requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import * as actions from '@/setup/redux/modal/Actions';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

import ItemsList from './ListCourses';

const ActivationCodePage = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const [dataSearch, setDataSearch] = useState({ userId: userId });

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        {/*  <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Khoá học'}</h3>
          <div className="card-toolbar"></div>
        </div> */}
        <div className="row g-5 my-2">
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Khoá học:</span>
            <div className="ms-2 w-100">
              <TDSelect
                showSearch={true}
                reload={true}
                placeholder="Chọn khoá học"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/courses/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    keyword: keyword,
                    type: 3,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.title}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: '100%',
                }}
                value={dataSearch?.courseId ?? null}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      courseId: current?.id,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      courseId: null,
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Thời gian kích hoạt từ:</span>
            <div className="ms-2 w-100 ">
              <DatePicker
                placeholder="Chọn thời gian"
                format={'DD/MM/YYYY'}
                onChange={(date, dateString) => {
                  setDataSearch({
                    ...dataSearch,
                    timeConfirmFrom: date,
                  });
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-150px">Thời gian kích hoạt đến:</span>
            <div className="ms-2 w-100 ">
              <DatePicker
                placeholder="Chọn thời gian"
                format={'DD/MM/YYYY'}
                onChange={(date, dateString) => {
                  setDataSearch({
                    ...dataSearch,
                    timeConfirmTo: date,
                  });
                }}
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold w-150px">CTV/Đại lý:</span>
            <div className="ms-2 w-100">
              <TDSelect
                showSearch={true}
                reload={true}
                placeholder="Chọn CTV/Đại lý"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/users/search`, {
                    pageNumber: 1,
                    pageSize: 20,
                    types: [4, 5],
                    isActive: true,
                    keyword: keyword,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item?.fullName} (${item?.userName})`,
                    value: item?.id,
                  }));
                }}
                style={{
                  width: '100%',
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      agentId: current?.id,
                    });
                  } else {
                    setDataSearch({
                      ...dataSearch,
                      agentId: null,
                    });
                  }
                }}
                optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
              />
            </div>
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default ActivationCodePage;
