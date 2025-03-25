import { useRef } from 'react';

import { Form, Select } from 'antd';
import _ from 'lodash';
import { TDEditorInline } from '@/app/components';

const RenderDragDropAnswers = props => {
  const { form } = props;
  const editorRef = useRef(null);

  return (
    <div>
      <div className="col-xl-12">
        <Form.Item label="Phương án">
          <Form.List name="dragDropAnswers">
            {(fields, { add, remove }) => (
              <>
                <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key}>
                        <td className="pt-2">
                          <Form.Item {...restField} name={[name, 'content']} label={`Nội dung từ có sẵn ${index + 1}`} valuePropName="data">
                            <TDEditorInline
                              data={form.getFieldValue(['dragDropAnswers', name, 'content']) ? form.getFieldValue(['dragDropAnswers', name, 'content']) : ''}
                              onChange={value => {
                                form.setFieldValue(['dragDropAnswers', name, 'content'], value);
                              }}
                            />
                          </Form.Item>
                        </td>

                        <td className="w-400px  pt-2">
                          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.blankList !== currentValues.blankList || prevValues.dragDropAnswers !== currentValues.dragDropAnswers}>
                            {({ getFieldValue }) => (
                              <Form.Item valuePropName="data" label="Chỗ trống" {...restField} name={['dragDropAnswers', name, 'positionCorrect']}>
                                <Select
                                  allowClear
                                  placeholder="Chọn"
                                  style={{ width: '100%' }}
                                  options={getFieldValue('blankList')}
                                  mode="multiple"
                                  onChange={value => {
                                    form.setFieldValue(['dragDropAnswers', name, 'positionCorrect'], value);
                                  }}
                                  value={form.getFieldValue(['dragDropAnswers', name, 'positionCorrect'])}
                                />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </td>
                        <td className="w-50px  pt-5">
                          <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                            <i className="fas fa-minus-circle fs-3"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Form.Item>
                  <button
                    type="button"
                    className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                    data-kt-stepper-action="next"
                    onClick={() =>
                      add({
                        content: '',
                        positionCorrect: [],
                      })
                    }
                  >
                    Thêm phương án có sẵn
                    <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                      <span className="path1" />
                      <span className="path2" />
                    </i>{' '}
                  </button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </div>
    </div>
  );
};

export default RenderDragDropAnswers;
