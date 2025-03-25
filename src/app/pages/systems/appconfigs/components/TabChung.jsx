import { Form, Input } from 'antd';
import { APP_CONFIGS } from '@/utils/TDData';

const FormItem = Form.Item;

const UsersPage = () => {
  return (
    <>
      <div className="">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-normal  fs-5 mb-0 mb-lg-2">{'Thiết lập chung các cấu hình hệ thống'}</h3>
          <div className="card-toolbar"></div>
        </div>
        <div className="card-body card-dashboard px-3 py-3">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Số điện thoại hỗ trợ" name={APP_CONFIGS.PORTAL_HOTLINE} rules={[{ required: true, message: 'Không được để trống!' }]}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Tên công ty" name={APP_CONFIGS.PORTAL_COMPANY} rules={[{ required: true, message: 'Không được để trống!' }]}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Email" name={APP_CONFIGS.PORTAL_EMAIL}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Địa chỉ" name={APP_CONFIGS.PORTAL_ADDRESS}>
                <Input placeholder="" />
              </FormItem>
            </div>

            <div className="col-xl-6 col-lg-6">
              <FormItem label="Mã số thuế" name={APP_CONFIGS.PORTAL_TAXCODE}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Nơi cấp" name={APP_CONFIGS.PORTAL_ISSUEDBY}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Ngày cấp" name={APP_CONFIGS.PORTAL_ISSUEDDATE}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Email nhận thông báo khi có thảo luận" name={APP_CONFIGS.EMAILRECEIVEDISCUSSION}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Email nhận thông báo khi có đăng ký khoá học" name={APP_CONFIGS.EMAILRECEIVENOTIFICATIONS}>
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
