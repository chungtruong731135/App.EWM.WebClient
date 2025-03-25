import { useState, useEffect } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';

import ItemsStudentList from './components/ItemsStudentList';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { requestGET } from '@/utils/baseAPI';
import { requestDOWNLOADFILE, requestPOST } from '@/utils/baseAPI';
import { Popconfirm } from 'antd';
import TDSelect from '@/app/components/TDSelect';

const UsersPage = () => {
  const navigate = useNavigate();

  const { contestId } = useParams();

  const [dataSearch, setDataSearch] = useState({ contestId: contestId });
  const [dataCourse, setDataCourse] = useState(null);

  useEffect(() => {
    const fetchData = async id => {
      const res = await requestGET(`api/v1/contests/${id}`);
      setDataCourse(res?.data ?? null);
    };
    if (contestId) {
      fetchData(contestId);
    }
  }, [contestId]);

  const [loadingExport, setLoadingExport] = useState(false);

  const handleExport = async () => {
    try {
      setLoadingExport(true);
      const res = await requestDOWNLOADFILE(`api/v1/classsessiontests/export-danh-sach-bai-cua-hoc-sinh`, _.assign({}, dataSearch));
      const fileData = new Blob([res.data], { type: 'application/vnd.ms-excel' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(fileData);
      downloadLink.download = 'KetQuaBTVN.xlsx';
      downloadLink.click();
      setLoadingExport(false);
    } catch (error) {
      console.log(error);
      setLoadingExport(false);
    }
  };

  const handleSendMessage = async () => {
    var resZalo = await requestPOST(`api/v1/classsessiontests/send-zalo`, {
      id: contestId,
    });
    if (resZalo) {
      toast.success('Thao tác thành công!');
    } else {
      toast.error('Thất bại, vui lòng thử lại!');
    }
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-3">
        <div className="px-3 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fa fa-arrow-left fs-2 text-gray-600"></i>
            </a>
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{dataCourse?.name ?? 'Danh sách bài thi của học sinh'}</h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách bài thi của học sinh'}</h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-xl-250px w-lg-200px">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập từ khoá tìm kiếm"
                onChange={e => {
                  setDataSearch({
                    ...dataSearch,
                    keyword: e.target.value,
                  });
                }}
              />
            </div>
            <div className="btn-group align-items-center mx-3 mb-lg-2">
              <span className="fw-bold">Đề thi:</span>
              <TDSelect
                reload={true}
                placeholder="Chọn đề thi"
                fetchOptions={async (keyword) => {
                  const res = await requestPOST(`api/v1/contestexams/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    keyword: keyword,
                    contestId: contestId
                  });
                  return res?.data?.map((item) => ({
                    ...item,
                    label: `${item.examTitle}`,
                    value: item.examId,
                  }));
                }}
                style={{
                  width: 250,
                  marginLeft: 20,
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({ ...dataSearch, examId: current?.examId });
                  } else {
                    setDataSearch({ ...dataSearch, examId: null });
                  }
                }}
              />
            </div>
            <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleExport}>
              <span>
                <i className="fas fa-print me-2"></i>
                <span className="">Xuất danh sách</span>
              </span>
            </button>
            <Popconfirm title="Gửi thông báo?" onConfirm={handleSendMessage} okText="Gửi" cancelText="Huỷ">
              <button className="btn btn-primary btn-sm py-2 me-2">
                <span>
                  <i className="fas fa-paper-plane me-2"></i>
                  <span className="">Gửi thông báo</span>
                </span>
              </button>
            </Popconfirm>
          </div>
        </div>
        <ItemsStudentList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
