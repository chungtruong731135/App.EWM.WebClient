/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";

import ItemsList from "./components/ItemsList";
import { requestPOST } from "@/utils/baseAPI";
import TDSelect from "@/app/components/TDSelect";
import { Checkbox, Popover } from "antd";

const UsersPage = () => {
  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
            {"Ngân hàng câu hỏi"}
          </h3>
          <div className="card-toolbar"></div>
        </div>
        <div className="d-flex flex-row my-2">
          <div className="flex-grow-1 row g-5">
            <div className="col-xl-6 col-md-6 btn-group align-items-center px-5">
              <span className="fw-bold w-100px">Khoá học:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  showSearch
                  reload={true}
                  placeholder="Chọn khoá học"
                  fetchOptions={async (keyword) => {
                    const res = await requestPOST(`api/v1/courses/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      keyword: keyword,
                    });
                    return res?.data?.map((item) => ({
                      ...item,
                      label: `${item.title}`,
                      value: item.id,
                    }));
                  }}
                  style={{
                    width: "100%",
                  }}
                  value={dataSearch?.courseId ?? null}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        courseId: current?.id,
                        topicId: null,
                        questionLevelId: null,
                        examId: null,
                      });
                    } else {
                      setDataSearch({
                        ...dataSearch,
                        courseId: null,
                        topicId: null,
                        questionLevelId: null,
                        examId: null,
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div className="col-xl-6 col-md-6 btn-group align-items-center px-5">
              <span className="fw-bold w-100px">Đề thi:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  showSearch
                  reload={true}
                  placeholder="Chọn kỳ thi"
                  fetchOptions={async (keyword) => {
                    const res = await requestPOST(`api/v1/exams/search-fix`, {
                      pageNumber: 1,
                      pageSize: 100,
                      keyword: keyword,
                      type: 1,
                      courseId: dataSearch?.courseId ?? null,
                    });
                    return res?.data?.map((item) => ({
                      ...item,
                      label: `${item.title}`,
                      value: item.id,
                    }));
                  }}
                  style={{
                    width: "100%",
                  }}
                  value={dataSearch?.examId ?? null}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        examId: current?.id,

                        topicId: null,
                        questionLevelId: null,
                      });
                    } else {
                      setDataSearch({
                        ...dataSearch,
                        examId: null,

                        topicId: null,
                        questionLevelId: null,
                      });
                    }
                  }}
                />
              </div>
            </div>

            {/* <div className="col-xl-3 col-md-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-100px">Chủ đề:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  showSearch
                  reload={true}
                  placeholder="Chọn chủ đề"
                  fetchOptions={async (keyword) => {
                    const res = await requestPOST(`api/v1/topics/search`, {
                      pageNumber: 1,
                      pageSize: 100,
                      courseId: dataSearch?.courseId ?? null,
                      keyword: keyword,
                    });
                    return res?.data?.map((item) => ({
                      ...item,
                      label: `${item.name}`,
                      value: item.id,
                    }));
                  }}
                  style={{
                    width: "100%",
                  }}
                  value={dataSearch?.topicId ?? null}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        topicId: current?.id,
                        questionLevelId: null,
                      });
                    } else {
                      setDataSearch({
                        ...dataSearch,
                        topicId: null,
                        questionLevelId: null,
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-md-6 btn-group align-items-center px-5">
              <span className="fw-bold  w-100px">Chương trình học:</span>
              <div className="ms-2 w-100 ">
                <TDSelect
                  showSearch
                  reload={true}
                  placeholder="Chương trình học"
                  fetchOptions={async (keyword) => {
                    const res = await requestPOST(
                      `api/v1/questionlevels/search`,
                      {
                        pageNumber: 1,
                        pageSize: 100,
                        topicId: dataSearch?.topicId,
                        keyword: keyword,
                      }
                    );
                    return res?.data?.map((item) => ({
                      ...item,
                      label: `${item.name}`,
                      value: item.id,
                    }));
                  }}
                  style={{
                    width: "100%",
                  }}
                  value={dataSearch?.questionLevelId ?? null}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({
                        ...dataSearch,
                        questionLevelId: current?.id,
                      });
                    } else {
                      setDataSearch({ ...dataSearch, questionLevelId: null });
                    }
                  }}
                />
              </div>
            </div> */}
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
