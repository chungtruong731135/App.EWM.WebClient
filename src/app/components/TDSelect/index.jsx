import { Empty, Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { useMemo, useRef, useState } from 'react';

const TDSelect = ({ reload = false, showSearch = false, fetchOptions, debounceTimeout = 800, ...props }) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const fetchFirstRef = useRef(true);

  const debounceFetcher = useMemo(() => {
    const loadOptions = value => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const debounceFetcherFirst = useMemo(() => {
    const loadOptions = open => {
      if (open && (fetchFirstRef.current || options?.length === 0 || reload)) {
        fetchFirstRef.current = false;
        setOptions([]);
        setFetching(true);
        fetchOptions(null).then(newOptions => {
          setOptions(newOptions);
          setFetching(false);
        });
      }
    };
    return debounce(loadOptions, 10);
  }, [options?.length, reload, fetchOptions]);

  const removeVietnameseTones = str => {
    return str
      .normalize('NFD') // Tách dấu khỏi chữ cái
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/[^a-zA-Z0-9 ]/g, '') // Xóa ký tự đặc biệt
      .toLowerCase(); // Chuyển về chữ thường
  };

  return (
    <Select
      filterOption={(input, option) => {
        const searchText = removeVietnameseTones(input || '');
        const optionText = removeVietnameseTones(option?.label || '');

        return optionText.includes(searchText);
      }}
      defaultActiveFirstOption={false}
      allowClear
      showSearch={showSearch}
      labelInValue
      onSearch={showSearch ? debounceFetcher : null}
      notFoundContent={fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {...props}
      options={options}
      onDropdownVisibleChange={debounceFetcherFirst}
    />
  );
};

export default TDSelect;
// Usage of TDSelect
