import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {Form, Input} from 'antd';
import Collapse from 'react-bootstrap/Collapse';
import {KTSVG, toAbsoluteUrl} from '@/_metronic/helpers';

const PageHeader = (props) => {
  const {dataUserDetails} = props;

  return (
    <>
      {/*begin::Card*/}
      <div className='card pt-4 mb-6 mb-xl-9'>
        {/*begin::Card header*/}

        {/*end::Card header*/}
        {/*begin::Card body*/}
        <div className='card-body pt-0 pb-5'>
          {/*begin::Table wrapper*/}
          <div className='table-responsive'>
            {/*begin::Table*/}
            <table
              className='table align-middle table-row-dashed gy-5'
              id='kt_table_users_login_session'
            >
              {/*begin::Table body*/}
              <tbody className='fs-6 fw-semibold text-gray-600'>
                <tr>
                  <td>Mã nhân viên</td>
                  <td>
                    <span className='fw-bold fs-6 text-dark'>{dataUserDetails?.employeeCode}</span>
                  </td>
                  <td className='text-end'>
                    <button
                      type='button'
                      className='btn btn-icon btn-active-light-primary w-30px h-30px ms-auto'
                    >
                      <KTSVG
                        path='/media/icons/duotune/art/art005.svg'
                        className='svg-icon svg-icon-3'
                      />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Email công ty</td>
                  <td>{dataUserDetails?.officeEmail}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Đơn vị công tác</td>
                  <td>
                    <span className='fw-bold fs-6 text-primary'>
                      {dataUserDetails?.organizationUnitName}
                    </span>
                  </td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Vị trí công tác</td>
                  <td>{dataUserDetails?.jobPositionName}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Chức danh</td>
                  <td>{dataUserDetails?.jobTitleName}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Quản lý trực tiếp</td>
                  <td>{dataUserDetails?.reportToName}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Ngày thử việc</td>
                  <td>{dataUserDetails?.hireDate}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Ngày chính thức</td>
                  <td>{dataUserDetails?.receiveDate}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Trạng thái lao động</td>
                  <td>
                    <span className='badge badge-success'>
                      {(dataUserDetails?.employeeStatus ?? 0) == 1
                        ? 'Đang làm việc'
                        : 'Đã nghỉ việc'}
                    </span>
                  </td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Ngày nghỉ việc</td>
                  <td>{dataUserDetails?.terminationDate}</td>
                  <td className='text-end'></td>
                </tr>
              </tbody>
              {/*end::Table body*/}
            </table>
            {/*end::Table*/}
          </div>
          {/*end::Table wrapper*/}
        </div>
        {/*end::Card body*/}
      </div>
      {/*end::Card*/}
    </>
  );
};

export default PageHeader;
