import { Form, Input } from 'antd';
import { APP_CONFIGS } from '@/utils/TDData';

const FormItem = Form.Item;

const UsersPage = () => {
  return (
    <>
      <div className="">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-normal fs-5 mb-0 mb-lg-2">{'Cấu hình thanh toán qua VietQR'}</h3>
          <div className="card-toolbar"></div>
        </div>
        <div className="card-body card-dashboard px-3 py-3">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <FormItem label="VietQR Client ID" name={APP_CONFIGS.VIETQR_CLIENT_ID}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="VietQR API Key" name={APP_CONFIGS.VIETQR_API_KEY}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="VietQR Checksum Key" name={APP_CONFIGS.VIETQR_CHECKSUM_KEY}>
                <Input placeholder="" />
              </FormItem>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
