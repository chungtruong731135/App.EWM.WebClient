import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as actionsModal from "@/setup/redux/modal/Actions";

import ItemsList from "./components/ItemsList";
import TDSelect from "@/app/components/TDSelect";
import { Image, Popconfirm } from "antd";
import { FILE_URL, requestPOST, requestDELETE } from "@/utils/baseAPI";
import { useNavigate, useParams, useLocation} from "react-router-dom";
import TableList from "@/app/components/TableList";
import TypeGradeModal from './components/TypeGradesModal';
import clsx from "clsx";
import { random } from "lodash";
import { toast } from 'react-toastify';

const TypeGradesPage = () => {
    const dispatch = useDispatch();
    const { typeId } = useParams();
    const navigate = useNavigate()

    const location = useLocation();
    const bookType = location.state?.item; 

    const random = useSelector(state => state.modal.random);
    const modalVisible = useSelector((state) => state.modal.modalVisible);
    const [dataTables, setDataTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [size, setSize] = useState(50);
    const [offset, setOffset] = useState(1);
    const [count, setCount] = useState(0);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const res = await requestPOST('api/v1/booktypegrades/search', {
                pageNumber: offset,
                pageSize: size,
                bookTypeId: typeId,
                keyword: keyword
            })

            if (res) {
                setDataTables(res.data ?? [])
                setCount(res.totalCount)
            }
            setLoading(false)
        };
        fetchData()
        return () => {

        }
    }, [typeId, keyword, random]);

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            width: 80,
            render: (text, record, index) => (
                <div>{(offset - 1) * size + index + 1}</div>
            ),
        },
        {
            title: 'Tên khối lớp',
            key: 'bookGradeName',
            dataIndex: 'bookGradeName'
        },
        {
            title: 'Mức độ ưu tiên',
            key: 'sortOrder',
            dataIndex: 'sortOrder'
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: 200,
            render: (text, record) => {
                return (
                    <div
                        className={`badge badge-light-${record?.isActive ? "success" : "danger"
                            }`}
                    >
                        {`${record?.isActive ? "Hoạt động" : "Không hoạt động"}`}
                    </div>
                );
            },
        },
        {
            title: "Thao tác",
            dataIndex: "",
            key: "",
            width: 150,
            render: (text, record) => {
                return (
                    <div>
                        <a
                            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                            data-toggle="m-tooltip"
                            title="Xem chi tiết/Sửa"
                            onClick={() => {
                                handleButton(`chi-tiet`, record);
                            }}
                        >
                            <i className="fa fa-eye"></i>
                        </a>

                        <Popconfirm
                            title="Xoá?"
                            onConfirm={() => {
                                handleButton(`delete`, record);
                            }}
                            okText="Xoá"
                            cancelText="Huỷ"
                        >
                            <a
                                className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1"
                                data-toggle="m-tooltip"
                                title="Xoá"
                            >
                                <i className="fa fa-trash"></i>
                            </a>
                        </Popconfirm>
                    </div>
                );
            },
        },
    ];

    const handleButton = async (type, item) => {
        switch (type) {
            case "chi-tiet":
                dispatch(actionsModal.setDataModal(item));
                dispatch(actionsModal.setModalVisible(true));
                break;
            case "delete":
                var res = await requestDELETE(`api/v1/booktypegrades/${item.id}`);
                if (res) {
                    toast.success("Thao tác thành công!");
                    dispatch(actionsModal.setRandom());
                } else {
                    toast.error("Thất bại, vui lòng thử lại!");
                }
                break;
            default:
                break;
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
                        <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{`Danh sách khối lớp thuộc bộ sách`}</h3>
                    </div>
                    <div className="card-toolbar">
                        <div className="btn-group me-0 w-xl-250px w-lg-200px me-2">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Nhập từ khoá tìm kiếm"
                                value={keyword} 
                                onChange={(e) => {
                                    setKeyword(e.target.value)
                                }}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-sm py-2 me-2"
                            onClick={() => {
                                dispatch(
                                    actionsModal.setDataModal({ ...null, readOnly: false })
                                );
                                dispatch(actionsModal.setModalVisible(true));
                            }}
                        >
                            <span>
                                <i className="fas fa-plus  me-2"></i>
                                <span className="">Thêm khối lớp</span>
                            </span>
                        </button>
                    </div>
                </div>
                <div className="card-dashboard-body table-responsive p-3">
                    <TableList
                        dataTable={dataTables}
                        columns={columns}
                        isPagination={true}
                        size={size}
                        count={count}
                        offset={offset}
                        setOffset={setOffset}
                        setSize={setSize}
                        loading={loading}
                    />
                </div>
            </div>
            {modalVisible ? <TypeGradeModal bookType = {bookType} /> : <></>}
        </>
    );
};

export default TypeGradesPage;
