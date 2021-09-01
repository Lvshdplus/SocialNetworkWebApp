import { Layout, Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import React from 'react';
import { login } from '../fetch/authFetch';
import { Typography } from 'antd';
import { setupWSConnection } from '../fetch/msg.ws';
import { useDispatch } from 'react-redux';
import { getMsg } from '../fetch/messageFetch';
import { getAllContacts } from '../fetch/contactFetch';
import { 
  addContacts, 
  addMsgByManyContact,
  addMsgContactByOne,
  addMsgContactByMany,
} from '../redux/action';
const { Title } = Typography;
const { Content } = Layout;
const layout = {
  labelCol: { span: 8, offset: 4 },
  wrapperCol: { span: 16, offset: 4 },
};

function LoginForm(props) {
  const history = useHistory();
  const dispatch = useDispatch();

  const onFinish = (values) => {
    const { name, password } = values;
    login(name, password).then((res) => {
      if (res.code === 0) { // login in successfully
        // set up websocket
        setupWSConnection(dispatch);
        getAllContacts().then(res => {
          dispatch(addMsgContactByMany(res.data));
          dispatch(addContacts(res.data));
        });
        getMsg().then((res) => {
          dispatch(addMsgByManyContact(res.data));
          res.data.forEach( (user) => {
            dispatch(addMsgContactByOne({name: user.contact, display: true}));
          });
        });
        props.onSuccess(name);
        history.push('/');
      } else {
        alert(res.msg);
      }
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const toRegisterPage = () => {
    history.push('/register');
  }

  const toResetPasswordPage = () => {
    history.push('/reset');
  }

  return (
    <Content>
      <Title> Login Page </Title>
      <div className="site-layout-content">
        <Form
          {...layout}
          name="basic"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input id='loginName' size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password id='loginPassword'
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button id='loginBtn' type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>

          <Form.Item>
            Don't have an account?<div style={{color: 'blue'}} onClick={toRegisterPage}>Sign Up</div>
          </Form.Item>

          <Form.Item>
            Fogret password?<div style={{color: 'blue'}} onClick={toResetPasswordPage}>Reset password</div>
          </Form.Item>
        </Form>
      </div>
    </Content>
  );
}

export default LoginForm;
