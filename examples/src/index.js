import React, { useMemo } from 'react';
import { render } from 'react-dom';
import conditionRender from '@/';
import { Input, Form, Col, Row, Modal } from 'antd';
import 'antd/dist/antd.css';

function App({ form }) {
  const { getFieldDecorator } = form;
  const colCondition = {
    '@wrap': <div style={{ background: 'red', padding: '10px' }}></div>,
    '@decorator': [
      <Col span={8} />,
      (Target, params) => {
        const { title } = params;
        return <Form.Item label={title}>{Target}</Form.Item>;
      },
      (Target, params) => {
        const { title, value } = params;
        return getFieldDecorator(title, {
          initialValue: value,
          rules: [{ required: true, message: `please input ${title}` }],
        })(Target);
      },
    ],
    '@component': [
      {
        '@component': Input,
        value: 1,
        title: 'Input1',
        '@wrap': <div style={{ background: 'blue', padding: '10px' }}></div>,
      },
      {
        '@component': Input,
        value: 2,
        title: 'Input2',
      },
      {
        '@component': Input,
        value: 3,
        title: 'Input3',
      },
    ],
  };

  const rowCondition = {
    '@component': () => conditionRender(colCondition),
    '@decorator': [<Modal visible={true} />, <Form />, <Row gutter={8} />],
  };

  return conditionRender(colCondition);
}

const WithForm = Form.create()(App);

render(<WithForm />, document.getElementById('root'));
