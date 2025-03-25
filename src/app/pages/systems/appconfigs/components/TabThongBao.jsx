import { APP_CONFIGS } from '@/utils/TDData';
import { Form, Input } from 'antd';
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
            <div className="col-xl-12 col-lg-12">
              <FormItem label="Zalo Access Token" name={APP_CONFIGS.ZALO_TOKEN}>
                <Input.TextArea placeholder="" rows={4} />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Telegram BOT Token" name={APP_CONFIGS.TELEGRAM_TOKEN}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Telegram Chat IDs" name={APP_CONFIGS.TELEGRAM_CHATIDS}>
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
