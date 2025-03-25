/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Popconfirm } from "antd";
import { toast } from "react-toastify";
import clsx from "clsx";
import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST, requestDELETE } from "@/utils/baseAPI";

import TableList from "@/app/components/TableList";
import { useNavigate, createSearchParams } from "react-router-dom";

const UsersList = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dataSearch, handleAddData } = props;
  const random = useSelector((state) => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/exams/search`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ["createdOn DESC"],
              isAutomatic: false,
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
    fetchData();

    return () => {};
  }, [offset, size, dataSearch, random]);
  // useEffect(() => {
  //   setOffset(1);

  //   return () => {};
  // }, [dataSearch]);

  const handleButton = async (type, item) => {
    switch (type) {
      case "addData":
        handleAddData(item);
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
      render: (text, record, index) => (
        <div>{(offset - 1) * size + index + 1}</div>
      ),
    },
    {
      title: "Thuộc kỳ thi",
      dataIndex: "examinatTitle",
      key: "examinatTitle",
    },
    {
      title: "Tên đề thi",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Cấp độ",
      dataIndex: "examAreaName",
      key: "examAreaName",
    },
    {
      title: "Thời gian thi (Phút)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Tổng số câu hỏi",
      dataIndex: "totalQuestion",
      key: "totalQuestion",
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
    },

    {
      title: "",
      dataIndex: "result",
      key: "result",
      render: (text, record) => (
        <a
          className="btn btn-info btn-sm py-2"
          onClick={() => {
            handleButton(`addData`, record);
          }}
        >
          Chọn
        </a>
      ),
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
    </>
  );
};

export default UsersList;
