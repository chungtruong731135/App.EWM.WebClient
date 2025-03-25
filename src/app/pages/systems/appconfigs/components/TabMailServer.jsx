import { Form, Input } from 'antd';
import { APP_CONFIGS } from '@/utils/TDData';

const FormItem = Form.Item;

const UsersPage = () => {
  return (
    <>
      <div className="">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-normal fs-5 mb-0 mb-lg-2">{'Cấu hình thông báo'}</h3>
          <div className="card-toolbar"></div>
        </div>
        <div className="card-body card-dashboard px-3 py-3">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Máy chủ mail" name={APP_CONFIGS.MAINSETTINGS_HOST}>
                <Input placeholder="VD: smtp.gmail.com" />
              </FormItem>
            </div>

            <div className="col-xl-6 col-lg-6">
              <FormItem label="Cổng" name={APP_CONFIGS.MAINSETTINGS_PORT}>
                <Input placeholder="VD: 587" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Tên đăng nhập" name={APP_CONFIGS.MAINSETTINGS_USERNAME}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Mật khẩu" name={APP_CONFIGS.MAINSETTINGS_PASSWORD}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Địa chỉ gửi" name={APP_CONFIGS.MAINSETTINGS_FROM}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Tên hiển thị" name={APP_CONFIGS.MAINSETTINGS_DISPLAYNAME}>
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
