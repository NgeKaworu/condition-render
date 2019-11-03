# condition-render | 条件渲染

## Intro | 简介

> Based on cpmcept of AOP, React json-schema render tool, Useful for large of
> forms. efficient, flexible and easy to expand.
> Its predecessor was [antd-form-gen](https://www.npmjs.com/package/antd-form-gen)
>
> 基于 AOP 思想, 用 JSON 格式渲染组件的工具。特别在大量表单的场景下，显得高效灵活、易扩
> 展。
> 它的前身是[antd-form-gen](https://www.npmjs.com/package/antd-form-gen)

## Usage | 用法

### Install | 安装

```bash
npm i condition-render -D
or
yarn add condition-render -D
```

### Import | 引入

```javascript
import conditionRender from "condition-render";
```

## Example | 例子

### Step1 simple render | 第一步 牛刀小试

let us create three native `<input/>` tags following:
我们先搞三个`<input />` 标签看看, 如下:

```js
import React from "react";
import { render } from "react-dom";
import conditionRender from "condition-render";

function App() {
  const condition = [
    <input value={1} />,
    <input value={2} />,
    <input value={3} />
  ];
  return conditionRender(condition);
}

render(<App />, document.getElementById("root"));
```

![step1_1](./examples/doc/assets/step1_1.jpg)

replace native `<input />` with Antd [Input][input]
用 Antd 的 [Input][input-cn] 组件代替原生`<input/>`

```js
import React from "react";
import { render } from "react-dom";
import conditionRender from "condition-render";
import { Input } from "antd";
import "antd/dist/antd.css";

function App() {
  const condition = [
    {
      "@component": <Input />,
      "@props" { value: 1 },
    },
    <Input value={2} />,
    Input
  ];
  return conditionRender(condition);
}

render(<App />, document.getElementById("root"));
```

![step1_2](./examples/doc/assets/step1_2.jpg)

You may have noticed that condition can be Object, Array, React Element,
React Component, or even a Function, let's continue.
你也许注意到, condition 可以是 Object、 Array、 React Element、 React Component,
其实它还可以是一个 Function, 让我们继续。

## Step2 format and validation | 第二步 格式化和校验

Usually we need to do some format and validation.
通常我们需要做一些排版和校验.
We use Antd's Col Row [component][grid] for format and [rc-form][rc-form] for validation
我们用 Antd 的 Col Row[组件][grid-cn]来排版并用 [rc-form][rc-form] 来校验

```js
import React, { useMemo } from "react";
import { render } from "react-dom";
import conditionRender from "@/";
import { Input, Form, Col, Row } from "antd";
import "antd/dist/antd.css";

function App({ form }) {
  const { getFieldDecorator } = form;
  const colCondition = {
    // Here are the decorators we use for each of the following components
    // 这里是我们给下面每一个组件使用的装饰器
    // It can be a decorator or component
    // 可以是一个装饰器或组件
    // The priority of the decorator must be greater than the component
    // 装饰器的优先级一定大于组件
    "@decorator": [
      <Col span={8} />,
      (target, params) => {
        const { title } = params;
        return <Form.Item label={title}>{target}</Form.Item>;
      },
      (target, params) => {
        const { title, value } = params;
        return getFieldDecorator(title, {
          initialValue: value,
          rules: [{ required: true, message: `please input ${title}` }]
        })(target);
      }
    ],
    "@component": [
      {
        "@component": Input,
        value: 1,
        title: "Input1"
      },
      {
        "@component": Input,
        value: 2,
        title: "Input2"
      },
      {
        "@component": Input,
        value: 3,
        title: "Input3"
      }
    ]
  };

  const rowCondition = {
    // use functions to tell program that the component is a whole
    // 我们用函数的方式告诉程序 这个component是一个整体
    "@component": () => conditionRender(colCondition),
    // These are its decorators
    // 这些是它的装饰器
    "@decorator": [<Form />, <Row gutter={8} />]
  };

  return conditionRender(rowCondition);
}

const WithForm = Form.create()(App);

render(<WithForm />, document.getElementById("root"));
```

![step2_1](./examples/doc/assets/step2_1.jpg)

Now let's make it a Modal
现在我们把它变成一个弹窗

```js
// import it
// 先引入它
import { Input, Form, Col, Row, Modal } from "antd";
const rowCondition = {
  "@component": () => conditionRender(colCondition),
  // And then add it here
  // 然后再这里添加
  "@decorator": [<Modal visible={true} />, <Form />, <Row gutter={8} />]
};
```

Done.
完成了。

![step2_2](./examples/doc/assets/step2_2.jpg)

[rc-form]: https://www.npmjs.com/package/rc-form
[grid-cn]: https://ant.design/components/grid-cn/
[grid]: https://ant.design/components/grid/
[input-cn]: https://ant.design/components/input-cn/
[input]: https://ant.design/components/input/
[antd]: https://ant.design/
[antd-cn]: https://ant.design/index-cn
