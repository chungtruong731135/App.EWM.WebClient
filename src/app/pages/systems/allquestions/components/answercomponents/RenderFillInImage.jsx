import { Checkbox, Form, Radio, Input } from 'antd';

import { TDEditorOnlyImage } from '@/app/components';

const RenderFillInImage = props => {
  const { form, isSingleChoice } = props;

  return (
    <div className="row">
      <div className="col-xl-12">
        <Form.Item label="Phương án">
          <Form.List name="fillInImageAnswers">
            {(fields, { add, remove }) => (
              <>
                <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                  <thead>
                    <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                      <th>STT</th>
                      <th>Nội dung hình ảnh</th>

                      <th>Đáp án tương ứng</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key}>
                        <td className="w-50px text-center pt-5">{index + 1}</td>
                        
                        <td className="pt-5">
                          <Form.Item 
                            {...restField} 
                            name={[name, 'content']} 
                            noStyle 
                            valuePropName="data"
                          >
                            <TDEditorOnlyImage
                              data={form.getFieldValue(['fillInImageAnswers', name, 'content']) || ''}
                              onChange={(value) => {
                                form.setFieldValue(['fillInImageAnswers', name, 'content'], value);
                              }}
                              imageOnly={true}
                            />
                          </Form.Item>
                        </td>

                        <td className="w-150px text-center pt-5">
                          <Form.Item {...restField} name={[name, 'correctAnswer']} noStyle>
                            <Input placeholder="Nhập giá trị" />
                          </Form.Item>
                        </td>

                        <td className="w-50px pt-5">
                          <button
                            className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger"
                            onClick={() => remove(name)}
                          >
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
    </div>
  );
};

export default RenderFillInImage;
