/* eslint-disable jsx-a11y/anchor-is-valid */
import {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';

import {KTSVG} from '@/_metronic/helpers';
import {requestGET} from '@/utils/baseAPI';

import ItemsList from './ItemsList';
import * as actionsModal from '@/setup/redux/modal/Actions';

const UsersList = (props) => {
  const dispatch = useDispatch();
  const random = useSelector((state) => state.modal.random);

  const dataModal = useSelector((state) => state.modal.currentOrganizationUnit);
  const id = dataModal?.id ?? null;
  const [loading, setLoading] = useState(false);
  const [organizationUnit, setOrganizationUnit] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/organizationunits/${id}`);

      setOrganizationUnit(res?.data ?? null);

      setLoading(false);
    };
    if (id) {
      fetchData();
    } else {
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, random]);

  return (
    <>
      <div className='card-body card-dashboard px-3 py-3'>
        <div className='card-body pt-1 p-0'>
          <div className='d-flex flex-wrap flex-sm-nowrap mb-3'>
            <div className='flex-grow-1'>
              <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
                <div className='d-flex flex-column'>
                  <div className='d-flex align-items-center mb-2'>
                    <span href='#' className='text-gray-800 text-hover-primary fs-2 fw-bolder me-1'>
                      {organizationUnit?.name}
                    </span>
                    <KTSVG
                      path='/media/icons/duotune/general/gen026.svg'
                      className='svg-icon-1 svg-icon-primary'
                    />
                    <span className='btn btn-sm btn-light-success fw-bolder ms-2 fs-8 py-1 px-3'>
                      {organizationUnit?.Inactive ? 'Dừng hoạt động' : 'Đang hoạt động'}
                    </span>
                  </div>
                </div>
                <div className='d-flex'>
                  <span
                    onClick={() => {
                      dispatch(
                        actionsModal.setModalOrganizationUnit({
                          modalVisible: true,
                          type: 'suanhom',
                        })
                      );
                    }}
                    className='btn btn-sm btn-primary me-3'
                  >
                    <KTSVG
                      path='/media/icons/duotune/art/art005.svg'
                      className='svg-icon svg-icon-3'
                    />
                    Sửa
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className='table-responsive'>
            {/*begin::Table*/}
            <table
              className='table align-middle table-row-dashed gy-5'
              id='kt_table_users_login_session'
            >
              {/*begin::Table body*/}
              <tbody className='fs-6 fw-semibold text-gray-600'>
                <tr>
                  <td>Mã đơn vị</td>
                  <td>
                    <span className='fw-bold fs-6 text-dark'>{organizationUnit?.code}</span>
                  </td>
                  <td>Cấp tổ chức</td>
                  <td>
                    <span className='fw-bold fs-6 text-dark'>
                      {organizationUnit?.organizationUnitType?.name ?? ''}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Chức năng nhiệm vụ</td>
                  <td>
                    <span className='fw-bold fs-6 text-dark'>{organizationUnit?.mainTask}</span>
                  </td>
                  <td>Địa chỉ</td>
                  <td>
                    <span className='fw-bold fs-6 text-dark'>{organizationUnit?.address}</span>
                  </td>
                </tr>
              </tbody>
              {/*end::Table body*/}
            </table>
            {/*end::Table*/}
          </div>
        </div>
        <ItemsList />
      </div>
    </>
  );
};

export default UsersList;
