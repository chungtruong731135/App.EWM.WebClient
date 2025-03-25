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
            {"Ngân hàng câu hỏi fix"}
          </h3>
          <div className="card-toolbar"></div>
        </div>
        <div className="d-flex flex-row my-2">
          <div className="flex-grow-1 row g-5">
           
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
