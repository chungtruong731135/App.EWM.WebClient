import { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { toAbsoluteUrl } from '../../../_metronic/helpers';

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.style.height = '100%';
    }
    return () => {
      if (root) {
        root.style.height = 'auto';
      }
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-lg-row flex-column-fluid h-100">
      {/* begin::Body */}
      <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
        {/* begin::Form */}
        <div className="d-flex flex-center flex-column flex-lg-row-fluid">
          {/* begin::Wrapper */}
          <div className="w-lg-500px p-10">
            <Outlet />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Form */}

        {/* begin::Footer */}
        {/* <div className='d-flex flex-center flex-wrap px-5'>
          <div className='d-flex fw-semibold text-primary fs-base'>
            <a href='#' className='px-5' target='_blank'>
              Terms
            </a>

            <a href='#' className='px-5' target='_blank'>
              Plans
            </a>

            <a href='#' className='px-5' target='_blank'>
              Contact Us
            </a>
          </div>
        </div> */}
        {/* end::Footer */}
      </div>
      {/* end::Body */}

      {/* begin::Aside */}
      <div
        className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
        style={{
          backgroundImage: `url(${toAbsoluteUrl('media/misc/auth-bg.png')})`,
        }}
      >
        {/* begin::Content */}
        <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
          {/* begin::Logo */}
          <Link to="/" className="mb-12">
            <img alt="Logo" src={toAbsoluteUrl(`media/images/logo${import.meta.env.VITE_APP_SYSTEM_TYPE}.png`)} className="h-100px" />
          </Link>
          {/* <img
            className="mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
            src={toAbsoluteUrl("/media/misc/auth-screens.png")}
            alt=""
          /> */}

          {/* begin::Title */}
          <h1 className="text-white fs-2qx fw-bolder text-center mb-7">{import.meta.env.VITE_APP_SYSTEM_TYPE == 'codemath' ? `Cùng con chinh phục các kỳ thi Toán Olympic quốc tế` : ''}</h1>
          {/* end::Title */}

          {/* begin::Text */}
          <div className="text-white fs-base text-center">
            {import.meta.env.VITE_APP_SYSTEM_TYPE == 'codemath' ? `CodeMath là một trải nghiệm học tập tuyệt vời, cung cấp những khóa học online chất lượng cao cho học sinh tiểu học.` : ''}
          </div>
          {/* end::Text */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::Aside */}
    </div>
  );
};

export { AuthLayout };
