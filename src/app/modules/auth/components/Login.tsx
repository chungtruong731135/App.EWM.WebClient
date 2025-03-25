import { useState } from 'react';
import * as Yup from 'yup';
import clsx from 'clsx';
import { useFormik } from 'formik';
import { getUserByToken, login } from '../core/_requests';
import { useAuth } from '../core/Auth';

const loginSchema = Yup.object().shape({
  userName: Yup.string().min(2, 'Không hợp lệ').max(50, 'Không hợp lệ').required('Không được để trống!'),

  password: Yup.string().min(2, 'Không hợp lệ').max(50, 'Không hợp lệ').required('Không được để trống!'),
});

const initialValues = {
  userName: '',
  password: '',
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const { data: auth } = await login(values.userName, values.password);
        saveAuth(auth);
        const { data: user } = await getUserByToken();
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus('Đăng nhập không thành công!');
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <form className="form w-100" onSubmit={formik.handleSubmit} noValidate id="kt_login_signin_form">
      {/* begin::Heading */}

      <div className="text-center mb-11">
        <h1 className="text-gray-900 fw-bolder mb-3">Đăng nhập</h1>
      </div>

      {formik.status ? (
        <div className="mb-lg-15 alert alert-danger">
          <div className="alert-text font-weight-bold">{formik.status}</div>
        </div>
      ) : (
        <></>
      )}

      {/* begin::Form group */}
      <div className="fv-row mb-8">
        <label className="form-label fs-6 fw-bolder text-gray-900">Tài khoản</label>
        <input
          placeholder="Tài khoản"
          {...formik.getFieldProps('userName')}
          className={clsx(
            'form-control bg-transparent',
            { 'is-invalid': formik.touched.userName && formik.errors.userName },
            {
              'is-valid': formik.touched.userName && !formik.errors.userName,
            }
          )}
          type="text"
          name="userName"
          autoComplete="off"
        />
        {formik.touched.userName && formik.errors.userName && (
          <div className="fv-plugins-message-container">
            <span role="alert">{formik.errors.userName}</span>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6 mb-0">Mật khẩu</label>
        <input
          type="password"
          placeholder="Mật khẩu"
          autoComplete="off"
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.password && formik.errors.password,
            },
            {
              'is-valid': formik.touched.password && !formik.errors.password,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>

      {/* <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
        <div />
        <Link to="/auth/forgot-password" className="link-primary">
          Forgot Password ?
        </Link>
      </div> */}

      {/* begin::Action */}
      <div className="d-grid my-10">
        <button type="submit" id="kt_sign_in_submit" className="btn btn-primary" disabled={formik.isSubmitting || !formik.isValid}>
          {!loading && <span className="indicator-label">Đăng nhập</span>}
          {loading && (
            <span className="indicator-progress" style={{ display: 'block' }}>
              Đang xử lý...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
      </div>

      {/* <div className="text-gray-500 text-center fw-semibold fs-6">
        Not a Member yet?{" "}
        <Link to="/auth/registration" className="link-primary">
          Sign up
        </Link>
      </div> */}
    </form>
  );
}
