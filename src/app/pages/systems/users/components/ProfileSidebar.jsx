import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {Form, Input} from 'antd';
import Collapse from 'react-bootstrap/Collapse';
import {KTSVG, toAbsoluteUrl} from '@/_metronic/helpers';

const PageHeader = (props) => {
  const dispatch = useDispatch();

  const {dataUserDetails} = props;

  return (
    <>
      <div className='flex-column flex-lg-row-auto w-lg-250px w-xl-350px mb-10'>
        {/*begin::Card*/}
        <div className='card mb-5 mb-xl-8'>
          {/*begin::Card body*/}
          <div className='card-body'>
            {/*begin::Summary*/}
            {/*begin::User Info*/}
            <div className='d-flex flex-center flex-column py-5'>
              {/*begin::Avatar*/}
              <div className='symbol symbol-100px symbol-circle mb-7'>
                <img
                  src={toAbsoluteUrl('/media/avatars/300-1.jpg')}
                  alt={dataUserDetails?.fullName}
                />
              </div>
              {/*end::Avatar*/}
              {/*begin::Name*/}
              <span className='fs-3 text-gray-800 text-hover-primary fw-bold mb-3'>
                {dataUserDetails?.fullName}
              </span>
              {/*end::Name*/}
              {/*begin::Position*/}
              <div className='mb-9'>
                {/*begin::Badge*/}
                <div className='badge badge-lg badge-light-primary d-inline'>
                  {dataUserDetails?.jobPositionName}
                </div>
                {/*begin::Badge*/}
              </div>
              {/*end::Position*/}
            </div>
            {/*end::User Info*/}
            {/*end::Summary*/}
            {/*begin::Details toggle*/}
            <div className='d-flex flex-stack fs-4 py-3'>
              <div
                className='fw-bold rotate collapsible'
                data-bs-toggle='collapse'
                href='#kt_user_view_details'
                role='button'
                aria-expanded='false'
                aria-controls='kt_user_view_details'
              >
                Thông tin
                <span className='ms-2 rotate-180'>
                  {/*begin::Svg Icon | path: icons/duotune/arrows/arr072.svg*/}
                  <span className='svg-icon svg-icon-3'>
                    <svg
                      width={24}
                      height={24}
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579 8.96426 5.33579 9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071 15.5929L18.25 10.05C18.6642 9.63584 18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642 8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468 11.7467 13.0468 11.4343 12.7344Z'
                        fill='currentColor'
                      />
                    </svg>
                  </span>
                  {/*end::Svg Icon*/}
                </span>
              </div>
              <span data-bs-toggle='tooltip' data-bs-trigger='hover' title='Edit customer details'>
                <span href='#' className='btn btn-sm btn-light-primary'>
                  <KTSVG
                    path='/media/icons/duotune/art/art005.svg'
                    className='svg-icon svg-icon-3'
                  />
                  Sửa
                </span>
              </span>
            </div>
            {/*end::Details toggle*/}
            <div className='separator' />
            {/*begin::Details content*/}
            <div id='kt_user_view_details' className='collapse show'>
              <div className='pb-5 fs-6'>
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Mã nhân viên</div>
                <div className='text-gray-600'>{dataUserDetails?.employeeCode ?? '--'}</div>
                {/*begin::Details item*/}
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Email</div>
                <div className='text-gray-600'>
                  <a href='#' className='text-gray-600 text-hover-primary'>
                    {dataUserDetails?.email ?? '--'}
                  </a>
                </div>
                {/*begin::Details item*/}
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Đơn vị công tác</div>
                <div className='text-gray-600'>{dataUserDetails?.organizationUnitName ?? '--'}</div>
                <div className='fw-bold mt-5'>Đăng nhập lần cuối</div>
                <div className='text-gray-600'>21 Feb 2023, 10:30 am</div>
              </div>
            </div>
            {/*end::Details content*/}
          </div>
          {/*end::Card body*/}
        </div>
        {/*end::Card*/}
      </div>
    </>
  );
};

export default PageHeader;
