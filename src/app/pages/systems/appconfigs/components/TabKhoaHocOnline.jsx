import { APP_CONFIGS } from '@/utils/TDData';
import { Form, Input } from 'antd';

const FormItem = Form.Item;

const UsersPage = () => {
  return (
    <>
      <div className="">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-normal fs-5 mb-0 mb-lg-2">{'Các cấu hình chung cho khoá học'}</h3>
          <div className="card-toolbar">
            {/*  <button className="btn btn-primary btn-sm py-2 me-2" onClick={onFinish}>
              <span>
                <i className="fas fa-save me-2"></i>
                <span className="">Lưu cấu hình</span>
              </span>
            </button> */}
          </div>
        </div>
        <div className="card-body card-dashboard px-3 py-3">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Số lượng lần làm bài kiểm tra đầu vào" name={APP_CONFIGS.EXAMSETTINGS_SOLUONGLAMBAI}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Số lượng khoá học dùng thử tối đa của người dùng" name={APP_CONFIGS.COURSESETTINGS_TRIALCOUNT}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Số lượt dùng thử tối đa 1 khoá học" name={APP_CONFIGS.COURSESETTINGS_MAXTRIALINCOURSE}>
                <Input placeholder="" />
              </FormItem>
            </div>
            <div className="col-xl-6 col-lg-6">
              <FormItem label="Số ngày kích hoạt dùng thử" name={APP_CONFIGS.COURSESETTINGS_TRIALTIME}>
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
