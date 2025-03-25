import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {Form, Input} from 'antd';
import Collapse from 'react-bootstrap/Collapse';

import * as actionsModal from '@/setup/redux/modal/Actions';

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
                <img src='assets/media/avatars/300-6.jpg' alt='image' />
              </div>
              {/*end::Avatar*/}
              {/*begin::Name*/}
              <a href='#' className='fs-3 text-gray-800 text-hover-primary fw-bold mb-3'>
                {dataUserDetails?.fullName}
              </a>
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
              {/*begin::Info*/}
              {/*begin::Info heading*/}
              <div className='fw-bold mb-3'>
                Assigned Tickets
                <i
                  className='fas fa-exclamation-circle ms-2 fs-7'
                  data-bs-toggle='popover'
                  data-bs-trigger='hover'
                  data-bs-html='true'
                  data-bs-content='Number of support tickets assigned, closed and pending this week.'
                />
              </div>
              {/*end::Info heading*/}
              <div className='d-flex flex-wrap flex-center'>
                {/*begin::Stats*/}
                <div className='border border-gray-300 border-dashed rounded py-3 px-3 mb-3'>
                  <div className='fs-4 fw-bold text-gray-700'>
                    <span className='w-75px'>243</span>
                    {/*begin::Svg Icon | path: icons/duotune/arrows/arr066.svg*/}
                    <span className='svg-icon svg-icon-3 svg-icon-success'>
                      <svg
                        width={24}
                        height={24}
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <rect
                          opacity='0.5'
                          x={13}
                          y={6}
                          width={13}
                          height={2}
                          rx={1}
                          transform='rotate(90 13 6)'
                          fill='currentColor'
                        />
                        <path
                          d='M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z'
                          fill='currentColor'
                        />
                      </svg>
                    </span>
                    {/*end::Svg Icon*/}
                  </div>
                  <div className='fw-semibold text-muted'>Total</div>
                </div>
                {/*end::Stats*/}
                {/*begin::Stats*/}
                <div className='border border-gray-300 border-dashed rounded py-3 px-3 mx-4 mb-3'>
                  <div className='fs-4 fw-bold text-gray-700'>
                    <span className='w-50px'>56</span>
                    {/*begin::Svg Icon | path: icons/duotune/arrows/arr065.svg*/}
                    <span className='svg-icon svg-icon-3 svg-icon-danger'>
                      <svg
                        width={24}
                        height={24}
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <rect
                          opacity='0.5'
                          x={11}
                          y={18}
                          width={13}
                          height={2}
                          rx={1}
                          transform='rotate(-90 11 18)'
                          fill='currentColor'
                        />
                        <path
                          d='M11.4343 15.4343L7.25 11.25C6.83579 10.8358 6.16421 10.8358 5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75L11.2929 18.2929C11.6834 18.6834 12.3166 18.6834 12.7071 18.2929L18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25C17.8358 10.8358 17.1642 10.8358 16.75 11.25L12.5657 15.4343C12.2533 15.7467 11.7467 15.7467 11.4343 15.4343Z'
                          fill='currentColor'
                        />
                      </svg>
                    </span>
                    {/*end::Svg Icon*/}
                  </div>
                  <div className='fw-semibold text-muted'>Solved</div>
                </div>
                {/*end::Stats*/}
                {/*begin::Stats*/}
                <div className='border border-gray-300 border-dashed rounded py-3 px-3 mb-3'>
                  <div className='fs-4 fw-bold text-gray-700'>
                    <span className='w-50px'>188</span>
                    {/*begin::Svg Icon | path: icons/duotune/arrows/arr066.svg*/}
                    <span className='svg-icon svg-icon-3 svg-icon-success'>
                      <svg
                        width={24}
                        height={24}
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <rect
                          opacity='0.5'
                          x={13}
                          y={6}
                          width={13}
                          height={2}
                          rx={1}
                          transform='rotate(90 13 6)'
                          fill='currentColor'
                        />
                        <path
                          d='M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z'
                          fill='currentColor'
                        />
                      </svg>
                    </span>
                    {/*end::Svg Icon*/}
                  </div>
                  <div className='fw-semibold text-muted'>Open</div>
                </div>
                {/*end::Stats*/}
              </div>
              {/*end::Info*/}
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
                Details
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
                <a
                  href='#'
                  className='btn btn-sm btn-light-primary'
                  data-bs-toggle='modal'
                  data-bs-target='#kt_modal_update_details'
                >
                  Edit
                </a>
              </span>
            </div>
            {/*end::Details toggle*/}
            <div className='separator' />
            {/*begin::Details content*/}
            <div id='kt_user_view_details' className='collapse show'>
              <div className='pb-5 fs-6'>
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Account ID</div>
                <div className='text-gray-600'>ID-45453423</div>
                {/*begin::Details item*/}
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Email</div>
                <div className='text-gray-600'>
                  <a href='#' className='text-gray-600 text-hover-primary'>
                    info@keenthemes.com
                  </a>
                </div>
                {/*begin::Details item*/}
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Address</div>
                <div className='text-gray-600'>
                  101 Collin Street,
                  <br />
                  Melbourne 3000 VIC
                  <br />
                  Australia
                </div>
                {/*begin::Details item*/}
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Language</div>
                <div className='text-gray-600'>English</div>
                {/*begin::Details item*/}
                {/*begin::Details item*/}
                <div className='fw-bold mt-5'>Last Login</div>
                <div className='text-gray-600'>21 Feb 2023, 10:30 am</div>
                {/*begin::Details item*/}
              </div>
            </div>
            {/*end::Details content*/}
          </div>
          {/*end::Card body*/}
        </div>
        {/*end::Card*/}
        {/*begin::Connected Accounts*/}
        <div className='card mb-5 mb-xl-8'>
          {/*begin::Card header*/}
          <div className='card-header border-0'>
            <div className='card-title'>
              <h3 className='fw-bold m-0'>Connected Accounts</h3>
            </div>
          </div>
          {/*end::Card header*/}
          {/*begin::Card body*/}
          <div className='card-body pt-2'>
            {/*begin::Notice*/}
            <div className='notice d-flex bg-light-primary rounded border-primary border border-dashed mb-9 p-6'>
              {/*begin::Icon*/}
              {/*begin::Svg Icon | path: icons/duotune/art/art006.svg*/}
              <span className='svg-icon svg-icon-2tx svg-icon-primary me-4'>
                <svg
                  width={24}
                  height={24}
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    opacity='0.3'
                    d='M22 19V17C22 16.4 21.6 16 21 16H8V3C8 2.4 7.6 2 7 2H5C4.4 2 4 2.4 4 3V19C4 19.6 4.4 20 5 20H21C21.6 20 22 19.6 22 19Z'
                    fill='currentColor'
                  />
                  <path
                    d='M20 5V21C20 21.6 19.6 22 19 22H17C16.4 22 16 21.6 16 21V8H8V4H19C19.6 4 20 4.4 20 5ZM3 8H4V4H3C2.4 4 2 4.4 2 5V7C2 7.6 2.4 8 3 8Z'
                    fill='currentColor'
                  />
                </svg>
              </span>
              {/*end::Svg Icon*/}
              {/*end::Icon*/}
              {/*begin::Wrapper*/}
              <div className='d-flex flex-stack flex-grow-1'>
                {/*begin::Content*/}
                <div className='fw-semibold'>
                  <div className='fs-6 text-gray-700'>
                    By connecting an account, you hereby agree to our
                    <a href='#' className='me-1'>
                      privacy policy
                    </a>
                    and
                    <a href='#'>terms of use</a>.
                  </div>
                </div>
                {/*end::Content*/}
              </div>
              {/*end::Wrapper*/}
            </div>
            {/*end::Notice*/}
            {/*begin::Items*/}
            <div className='py-2'>
              {/*begin::Item*/}
              <div className='d-flex flex-stack'>
                <div className='d-flex'>
                  <img
                    src='assets/media/svg/brand-logos/google-icon.svg'
                    className='w-30px me-6'
                    alt=''
                  />
                  <div className='d-flex flex-column'>
                    <a href='#' className='fs-5 text-dark text-hover-primary fw-bold'>
                      Google
                    </a>
                    <div className='fs-6 fw-semibold text-muted'>Plan properly your workflow</div>
                  </div>
                </div>
                <div className='d-flex justify-content-end'>
                  {/*begin::Switch*/}
                  <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid'>
                    {/*begin::Input*/}
                    <input
                      className='form-check-input'
                      name='google'
                      type='checkbox'
                      defaultValue={1}
                      id='kt_modal_connected_accounts_google'
                      defaultChecked='checked'
                    />
                    {/*end::Input*/}
                    {/*begin::Label*/}
                    <span
                      className='form-check-label fw-semibold text-muted'
                      htmlFor='kt_modal_connected_accounts_google'
                    />
                    {/*end::Label*/}
                  </label>
                  {/*end::Switch*/}
                </div>
              </div>
              {/*end::Item*/}
              <div className='separator separator-dashed my-5' />
              {/*begin::Item*/}
              <div className='d-flex flex-stack'>
                <div className='d-flex'>
                  <img
                    src='assets/media/svg/brand-logos/github.svg'
                    className='w-30px me-6'
                    alt=''
                  />
                  <div className='d-flex flex-column'>
                    <a href='#' className='fs-5 text-dark text-hover-primary fw-bold'>
                      Github
                    </a>
                    <div className='fs-6 fw-semibold text-muted'>
                      Keep eye on on your Repositories
                    </div>
                  </div>
                </div>
                <div className='d-flex justify-content-end'>
                  {/*begin::Switch*/}
                  <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid'>
                    {/*begin::Input*/}
                    <input
                      className='form-check-input'
                      name='github'
                      type='checkbox'
                      defaultValue={1}
                      id='kt_modal_connected_accounts_github'
                      defaultChecked='checked'
                    />
                    {/*end::Input*/}
                    {/*begin::Label*/}
                    <span
                      className='form-check-label fw-semibold text-muted'
                      htmlFor='kt_modal_connected_accounts_github'
                    />
                    {/*end::Label*/}
                  </label>
                  {/*end::Switch*/}
                </div>
              </div>
              {/*end::Item*/}
              <div className='separator separator-dashed my-5' />
              {/*begin::Item*/}
              <div className='d-flex flex-stack'>
                <div className='d-flex'>
                  <img
                    src='assets/media/svg/brand-logos/slack-icon.svg'
                    className='w-30px me-6'
                    alt=''
                  />
                  <div className='d-flex flex-column'>
                    <a href='#' className='fs-5 text-dark text-hover-primary fw-bold'>
                      Slack
                    </a>
                    <div className='fs-6 fw-semibold text-muted'>
                      Integrate Projects Discussions
                    </div>
                  </div>
                </div>
                <div className='d-flex justify-content-end'>
                  {/*begin::Switch*/}
                  <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid'>
                    {/*begin::Input*/}
                    <input
                      className='form-check-input'
                      name='slack'
                      type='checkbox'
                      defaultValue={1}
                      id='kt_modal_connected_accounts_slack'
                    />
                    {/*end::Input*/}
                    {/*begin::Label*/}
                    <span
                      className='form-check-label fw-semibold text-muted'
                      htmlFor='kt_modal_connected_accounts_slack'
                    />
                    {/*end::Label*/}
                  </label>
                  {/*end::Switch*/}
                </div>
              </div>
              {/*end::Item*/}
            </div>
            {/*end::Items*/}
          </div>
          {/*end::Card body*/}
          {/*begin::Card footer*/}
          <div className='card-footer border-0 d-flex justify-content-center pt-0'>
            <button className='btn btn-sm btn-light-primary'>Save Changes</button>
          </div>
          {/*end::Card footer*/}
        </div>
        {/*end::Connected Accounts*/}
      </div>
    </>
  );
};

export default PageHeader;
