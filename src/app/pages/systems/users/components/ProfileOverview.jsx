import {useDispatch} from 'react-redux';
import {KTSVG} from '@/_metronic/helpers';


const PageHeader = (props) => {
  const dispatch = useDispatch();
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
                  <td>Họ và tên</td>
                  <td>
                    <span className='fw-bold fs-6 text-dark'>{dataUserDetails?.fullName}</span>
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
                  <td>Số điện thoại</td>
                  <td>{dataUserDetails?.phoneNumber}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Email liên hệ</td>
                  <td>
                    <span className='fw-bold fs-6 text-primary'>
                      {dataUserDetails?.email}
                    </span>
                  </td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Ngày sinh</td>
                  <td>{dataUserDetails?.dateOfBirth}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Địa chỉ</td>
                  <td>{dataUserDetails?.address}</td>
                  <td className='text-end'></td>
                </tr>
                <tr>
                  <td>Giới tính</td>
                  <td>{dataUserDetails?.genderName}</td>
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
