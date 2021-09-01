import { Layout, Form, Input, Button } from 'antd';
import { useState } from 'react';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import React from 'react';
import { resetPasswordPage } from '../fetch/authFetch';
import { Typography, Select } from 'antd';

const { Option } = Select;

const { Title } = Typography;
const { Content } = Layout;
const layout = {
  labelCol: { span: 8, offset: 4 },
  wrapperCol: { span: 16, offset: 4 },
};

function ResetPasswordForm(props) {
  const [safeQuestion, setSafeQuestion] = useState("What is your major?");

  const history = useHistory();

  const onFinish = (values) => {
    const { name, password, answer } = values;
    resetPasswordPage(name, password, safeQuestion, answer).then((res) => {
      if (res.code === 0) {
        alert(res.msg);
        toLoginPage();
      } else {
        alert(res.msg);
      }
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const toLoginPage = () => {
    history.push('/login');
  }

  function handleChangeSafeQuestion(value) {
    setSafeQuestion(value);
  }

  return (
    <Content>
      <Title> Reset Password </Title>
      <div className="site-layout-content">
        <Form
          {...layout}
          name="reset-password-form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: 'Please input your first name!' },
            ]}
          >
            <Input style={{ width: 500 }} />
          </Form.Item>

          <Form.Item
            label="New password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password style={{ width: 500 }}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Your safe question"
            name="safe"
          >
            <Select defaultValue="What is your major?" style={{ width: 500 }} onChange={handleChangeSafeQuestion}>
              <Option value="What is your major?">What is your major?</Option>
              <Option value="Which city do you live in?">Which city do you live in?</Option>
              <Option value="What is your favorite fruit?">What is your favorite fruit?</Option>
              <Option value="Who is your favorite singer?">Who is your favorite singer?</Option>
              <Option value="What is your favorite sport?">What is your favorite sport?</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Answer to safe question"
            name="answer"
            rules={[
              { required: true, message: 'Please input your answer to selected safe question!' },
            ]}
          >
            <Input style={{ width: 500 }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          <Form.Item>
            Already have an account?  <div style={{color: 'blue'}} onClick={toLoginPage}>Sign In</div>
          </Form.Item>
        </Form>
      </div>
    </Content>
  );
}

export default ResetPasswordForm;
