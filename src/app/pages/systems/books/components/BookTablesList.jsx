/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Popconfirm } from "antd";
import { toast } from "react-toastify";
import clsx from "clsx";
import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST, requestDELETE, FILE_URL } from "@/utils/baseAPI";

import TableList from "@/app/components/TableList";
import ModalItem from "./ChiTietModal";
import { useNavigate } from "react-router-dom";

const UsersList = (props) => {
    const dispatch = useDispatch();
    const modalVisible = useSelector((state) => state.modal.modalVisible);
    const { dataSearch } = props;
    const random = useSelector((state) => state.modal.random);
    const navigate = useNavigate()
    const [dataTable, setDataTable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [size, setSize] = useState(50);
    const [offset, setOffset] = useState(1);
    const [count, setCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        console.log(dataSearch)
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await requestPOST(
                    `api/v1/books/search`,
                    _.assign(
                        {
                            advancedSearch: {
                                fields: ["name", "code"],
                                keyword: dataSearch?.keyword ?? null,
                            },
                            pageNumber: offset,
                            pageSize: size,
                            orderBy: ["createdOn DESC"],
                        },
                        dataSearch
                    )
                );
                setDataTable(res?.data ?? []);
                setCount(res?.totalCount ?? 0);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };

        if (refreshing) {
            fetchData();
            setRefreshing(false);
        }
        return () => { };
    }, [refreshing]);
    useEffect(() => {
        if (!refreshing) {
            setRefreshing(true);
        }
        return () => { };
    }, [offset, size, dataSearch, random]);
    useEffect(() => {
        setOffset(1);
        return () => { };
    }, [dataSearch]);
    const handleButton = async (type, item) => {
        switch (type) {
            case "muc-luc":
                navigate({
                    pathname: `${item?.id}/tables`,
                });
                break;
            case "chi-tiet":
                dispatch(actionsModal.setDataModal(item));
                dispatch(actionsModal.setModalVisible(true));
                break;
            case "muc-luc":
                break;
            case "delete":
                var res = await requestDELETE(`api/v1/books/${item.id}`);
                if (res) {
                    toast.success("Thao tác thành công!");
                    dispatch(actionsModal.setRandom());
                } else {
                    toast.error("Thất bại, vui lòng thử lại!");
                }
                break;
            case "XoaVanBan":
                //handleXoaVanBan(item);
                break;

            default:
                break;
        }
    };

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
            title: "Mã",
            dataIndex: "code",
            key: "code",
        },
        {
            title: 'Ảnh bìa',
            width: '10%',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (text, record, index) => {
                return (
                    <>
                        <div className="d-flex align-items-center" style={{ overflow: 'hidden' }}>
                            {/* begin:: Avatar */}
                            <div className="symbol overflow-hidden me-3">
                                <div>
                                    {record.imageUrl ? (
                                        <img
                                            src={
                                                record.imageUrl.includes('https://') || record.imageUrl.includes('http://')
                                                    ? record.imageUrl
                                                    : FILE_URL + `${record.imageUrl.startsWith('/') ? record.imageUrl.substring(1) : record.imageUrl}`
                                            }
                                            alt={record.name}
                                            className="w-100 symbol-label"
                                        />
                                    ) : (
                                        <div
                                            className={clsx(
                                                'symbol-label fs-3',
                                                `bg-light-${record.isActive ? 'danger' : ''}`,
                                                `text-${record.isActive ? 'danger' : ''}`
                                            )}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                );
            },
        },
        {
            title: "Tiêu đề",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Bộ sách",
            dataIndex: "bookTypeName",
            key: "bookTypeName",
        },
        {
            title: "Nhóm sách",
            dataIndex: "bookCatalogName",
            key: "bookCatalogName",
        },
        {
            title: "Khối",
            dataIndex: "bookGradeName",
            key: "bookGradeName",
        },
        {
            title: "Môn học",
            dataIndex: "bookSubjectName",
            key: "bookSubjectName",
        },
        {
            title: "Số trang",
            dataIndex: "pages",
            key: "pages",
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
                        {`${record?.isActive ? "Phát hành" : "Không phát hành"}`}
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

                        <a
                            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                            data-toggle="m-tooltip"
                            title="Mục lục"
                            onClick={() => {
                                handleButton(`muc-luc`, record);
                            }}
                        >
                            <i className="fa fa-book"></i>
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
    return (
        <>
            <div className="card-body card-dashboard px-3 py-3">
                <div className="card-dashboard-body table-responsive">
                    <TableList
                        dataTable={dataTable}
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
            {modalVisible ? <ModalItem /> : <></>}
        </>
    );
};

export default UsersList;
