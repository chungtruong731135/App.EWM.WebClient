import { Form, Input, Radio } from 'antd';
import _ from 'lodash';

import { create_UUID } from '@/utils/utils';
import { TDEditorInline } from '@/app/components';

const RenderTableDungSai = props => {
  const { form } = props;

  return (
    <div>
      <div className="col-xl-12">
        <Form.Item label="Phương án">
          <Form.List name="tableChoiceAnswers" initialValue={[{ content: '' }, { content: '' }]}>
            {(fields, { add, remove }) => (
              <>
                <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                  <thead>
                    <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                      <th>STT</th>
                      <th>Câu hỏi</th>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.tableChoiceOptions !== currentValues.tableChoiceOptions}
                      >
                        {({ getFieldValue }) =>
                          getFieldValue('tableChoiceOptions')?.map((item, index) => (
                            <th key={index} className="w-100px text-center">
                              {item?.name}
                            </th>
                          ))
                        }
                      </Form.Item>
                      {fields?.length > 2 ? <th></th> : <></>}
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key}>
                        <td className="w-50px text-center pt-5">{index + 1}</td>
                        <td className="pt-5">
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => prevValues.specialCharacters !== currentValues.specialCharacters}
                          >
                            {({ getFieldValue, setFieldValue }) => (
                              <Form.Item {...restField} name={[name, 'content']} noStyle valuePropName="data">
                                <TDEditorInline
                                  data={
                                    getFieldValue(['tableChoiceAnswers', name, 'content'])
                                      ? getFieldValue(['tableChoiceAnswers', name, 'content'])
                                      : ''
                                  }
                                  onChange={value => {
                                    setFieldValue(['tableChoiceAnswers', name, 'content'], value);
                                  }}
                                />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </td>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) =>
                            prevValues.tableChoiceOptions !== currentValues.tableChoiceOptions ||
                            prevValues.tableChoiceAnswers !== currentValues.tableChoiceAnswers
                          }
                        >
                          {({ getFieldValue, setFieldValue }) =>
                            getFieldValue('tableChoiceOptions')?.map((item, index) => (
                              <td className="w-100px text-center  pt-5" key={index}>
                                <Form.Item {...restField} name={[name, 'optionId']} noStyle>
                                  <Radio
                                    checked={item?.id && getFieldValue(['tableChoiceAnswers', name, 'optionId']) == item?.id}
                                    onChange={value => {
                                      setFieldValue(['tableChoiceAnswers', name, 'optionId'], item?.id);
                                    }}
                                  />
                                </Form.Item>
                              </td>
                            ))
                          }
                        </Form.Item>
                        {fields?.length > 2 ? (
                          <td className="w-50px  pt-5">
                            <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                              <i className="fas fa-minus-circle fs-3"></i>
                            </button>
                          </td>
                        ) : (
                          <></>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Form.Item>
                  <button
                    type="button"
                    className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                    data-kt-stepper-action="next"
                    onClick={() => add()}
                  >
                    Thêm
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
      <div className="col-xl-12">
        <Form.Item label="Lựa chọn">
          <Form.List
            name="tableChoiceOptions"
            initialValue={[
              { id: create_UUID(), name: 'Đúng' },
              { id: create_UUID(), name: 'Sai' },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key}>
                        <td className="w-100px text-center pt-7">{`Lựa chọn ${index + 1}`}</td>
                        <td className="pt-5">
                          <Form.Item {...restField} name={[name, 'name']} noStyle>
                            <Input placeholder="Lựa chọn" />
                          </Form.Item>
                        </td>
                        {fields?.length > 2 ? (
                          <td className="w-50px  pt-5">
                            <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                              <i className="fas fa-minus-circle fs-3"></i>
                            </button>
                          </td>
                        ) : (
                          <></>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Form.Item>
                  <button
                    type="button"
                    className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                    data-kt-stepper-action="next"
                    onClick={() => add({ id: create_UUID(), name: '' })}
                  >
                    Thêm
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

export default RenderTableDungSai;
