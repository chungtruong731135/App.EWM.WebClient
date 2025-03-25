const genders = [
  { id: 'Nam', name: 'Nam' },
  { id: 'Nữ', name: 'Nữ' },
  { id: 'Khác', name: 'Khác' },
];

const DanhGiaNoiDungBaiHocTrenLops = [
  { id: 1, name: 'Không đầy đủ' },
  { id: 2, name: 'Đầy đủ' },
  { id: 3, name: 'Rất đầy đủ' },
];
const DanhGiaBaiTapVeNhas = [
  { id: 1, name: 'Không phù hợp' },
  { id: 2, name: 'Phù hợp' },
  { id: 3, name: 'Rất phù hợp' },
];
const DanhGiaTiepCanThongTins = [
  { id: 1, name: 'Không tốt' },
  { id: 2, name: 'Trung bình' },
  { id: 3, name: 'Tốt' },
];
const DanhGiaChatLuongGiaoViens = [
  { id: 1, name: 'Không tốt' },
  { id: 2, name: 'Trung bình' },
  { id: 3, name: 'Tốt' },
];
const DanhGiaHoTroCodeMaths = [
  { id: 1, name: 'Không tốt' },
  { id: 2, name: 'Trung bình' },
  { id: 3, name: 'Tốt' },
];
const DanhGiaKienThucs = [
  { id: 1, name: 'Không tương xứng' },
  { id: 2, name: 'Tương xứng' },
  { id: 3, name: 'Rất tương xứng' },
];
const DanhGiaMucDoHaiLongs = [
  { id: 1, name: 'Không hài lòng' },
  { id: 2, name: 'Hài lòng' },
  { id: 3, name: 'Rất hài lòng' },
];
const DanhGiaTiepTucHocs = [
  { id: 1, name: 'Không' },
  { id: 2, name: 'Cần xem xét thêm' },
  { id: 3, name: 'Có' },
];

const APP_CONFIGS = {
  MAINSETTINGS_HOST: 'MailSettings_Host',
  MAINSETTINGS_PORT: 'MailSettings_Port',
  MAINSETTINGS_USERNAME: 'MailSettings_UserName',
  MAINSETTINGS_PASSWORD: 'MailSettings_Password',
  MAINSETTINGS_FROM: 'MailSettings_From',
  MAINSETTINGS_DISPLAYNAME: 'MailSettings_DisplayName',
  ZALO_TOKEN: 'Zalo_Token',
  VIETQR_CLIENT_ID: 'VietQRSettings_ClientId',
  VIETQR_API_KEY: 'VietQRSettings_APIKey',
  VIETQR_CHECKSUM_KEY: 'VietQRSettings_ChecksumKey',
  EXAMSETTINGS_SOLUONGLAMBAI: 'ExamSettings_SoLuongLamBaiDauVao',
  COURSESETTINGS_TRIALCOUNT: 'CourseSettings_TrialCount',
  COURSESETTINGS_MAXTRIALINCOURSE: 'CourseSettings_MaxTrialInCourse',
  COURSESETTINGS_TRIALTIME: 'CourseSettings_TrialTime',
  PORTAL_HOTLINE: 'Portal_Hotline',
  PORTAL_COMPANY: 'Portal_Company',
  PORTAL_EMAIL: 'Portal_Email',
  PORTAL_ADDRESS: 'Portal_Address',
  PORTAL_TAXCODE: 'Portal_TaxCode',
  PORTAL_ISSUEDBY: 'Portal_IssuedBy',
  PORTAL_ISSUEDDATE: 'Portal_IssuedDate',
  TELEGRAM_TOKEN: 'Telegram_Token',
  TELEGRAM_CHATIDS: 'Telegram_ChatIds',
};

export { APP_CONFIGS, genders, DanhGiaNoiDungBaiHocTrenLops, DanhGiaBaiTapVeNhas, DanhGiaTiepCanThongTins, DanhGiaChatLuongGiaoViens, DanhGiaHoTroCodeMaths, DanhGiaKienThucs, DanhGiaMucDoHaiLongs, DanhGiaTiepTucHocs };
