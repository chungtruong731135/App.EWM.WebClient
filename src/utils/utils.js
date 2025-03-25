import _ from 'lodash';
import { requestGETAttachment } from './baseAPI';
import { useAuth } from '@/app/modules/auth';

const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = path => reg.test(path);

export const getPageQuery = () => URLSearchParams(window.location.href.split('?')[1]);

export const handleDocumentAttachments = (values, URL) => {
  let res = [];
  values.forEach(i => {
    res.push({
      ...i,
      //url: !(i?.url.includes('https://') || i?.url.includes('http://')) ? URL + i?.url : i?.url,
      path: i?.url,
      name: i?.url.substring(i?.url.lastIndexOf('/') + 1),
    });
  });
  return res;
};

export const downloadDocumentAttachment = async fileName => {
  try {
    const res = await requestGETAttachment(`api/v1/documentattachments/${fileName}`);
    const fileData = new Blob([res.data]);
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(fileData);
    downloadLink.download = fileName.substring(fileName.lastIndexOf('/') + 1); // Tên file và định dạng file
    downloadLink.click();
  } catch (error) {
    console.error('Lỗi khi download file:', error);
  }
};

export const handleImage = (values, URL) => {
  const arr = _.without(_.split(values, '##'), '');
  let res = [];
  arr.forEach(i => {
    if (i.startsWith('/')) {
      i = i.substring(1);
    }
    res.push({
      url: !(i.includes('https://') || i.includes('http://')) ? URL + i : i,
      path: i,
      name: i.substring(i.lastIndexOf('/') + 1),
    });
  });
  return res;
};

export const convertImage = array => {
  var temp = [];
  array.forEach(element => {
    temp = _.concat(temp, element?.response?.data[0]?.url ?? element.path);
  });
  var res = _.uniq(temp).join('##');
  return res;
};

export const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const CheckRole = (roles, role) => {
  if (!roles) {
    return false;
  }
  return roles.some(v => role.includes(v));
};

export const CheckPermissions = permissions => {
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;
  if (!currentPermissions) {
    return false;
  }
  return currentPermissions.some(v => permissions.includes(v));
};

export const roleDisplay = {
  Basic: 'Cơ bản',
  '13770b14-0a29-4f7f-8235-08db9f99666a': 'Tự động 1',
  Admin: 'Quản trị',
  LanhDaoDonVi: 'Lãnh đạo đơn vị',
  ChuyenVien: 'Chuyên viên',
  PhongVien: 'Phóng viên',
  LanhDaoPhongBan: 'Lãnh đạo phòng ban',
  '093bc938-0ebd-4c8e-eef1-08db70a124b4': 'Tự động 2',
  QuanTriHeThong: 'Quản trị hệ thống',
};

export const sectionOrder = {
  'Danh mục': 1,
  'Đề tài': 2,
  'Đề cương': 3,
  'Kịch bản': 4,
  'Kế hoạch sản xuất': 5,
  'Tác phẩm': 6,
  'Nhân sự đề tài tỷ lệ': 7,
  'Quản lý thù lao nhuận bút': 8,
  Tenants: 9,
  'Hệ thống': 10,
};

let numerals = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
};

export const convertToRoman = num => {
  let newNumeral = '';

  for (let i in numerals) {
    while (num >= numerals[i]) {
      newNumeral += i;
      num -= numerals[i];
    }
  }

  return newNumeral;
};

export const create_UUID = () => {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};