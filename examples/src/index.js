import React, { useMemo } from 'react';
import { render } from 'react-dom';
import conditionRender from '@/';
import { Input, Form, Col, Row, Modal } from 'antd';
import 'antd/dist/antd.css';

function App({ form }) {
  const { getFieldDecorator } = form;
  const condition = {
    '@wrap': [<Modal visible={true} />, <Form />, <Row gutter={8} />],
    '@decorator': [
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
        '@decorator': <Col />,
        '@component': Input,
        value: 1,
        title: 'Input1',
      },
      {
        '@decorator': <Col span={12} />,
        '@component': [
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
      },
      {
        '@decorator': <Col span={8} />,
        '@component': [
          {
            '@component': Input,
            value: 4,
            title: 'Input4',
          },
          {
            '@component': Input,
            value: 5,
            title: 'Input5',
          },
          {
            '@component': Input,
            value: 6,
            title: 'Input6',
          },
        ],
      },
    ],
  };

  return conditionRender(condition);
}

const WithForm = Form.create()(App);

render(<WithForm />, document.getElementById('root'));
