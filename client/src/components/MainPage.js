/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Layout, Menu, Dropdown } from 'antd';
import Webavatar from './Webavatar'; 
import {
  VideoCameraOutlined,
  LogoutOutlined,
  HomeOutlined,
  ContactsOutlined,
  ProfileOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { logOut } from '../fetch/authFetch';
import { Redirect, useHistory } from 'react-router';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from './Home';
import Contacts from './Contacts';
import Messages from './Messages';
import Lives from './Lives';
import Profile from './Profile';
import { useDispatch } from 'react-redux';
import { selectContact } from '../redux/action';

const { Sider, Content } = Layout;

function MainPage(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  if (props.user === null) {
    return <Redirect to="/login" />;
  }

  const logout = () => {
    logOut();
    history.push('/login');
  }

  const resetPwd = () => {
    history.push('/reset');
  }

  const removeSelected = () => {
    dispatch(selectContact(null));
  }

  const menu = (
    <Menu>
      <Menu.Item danger onClick={logout}> <LogoutOutlined/> Logout </Menu.Item>
    </Menu>
  );

  const userInfo = (
    <Dropdown overlay={menu} trigger={['hover', 'click']}>
    <a className="ant-dropdown-link" onClick={e => e.preventDefault()} >
      <Webavatar name={props.user} /> <span className='name'> {props.user} </span>
    </a>
  </Dropdown>
  );
  
  

  return (
    <Router>
    <Layout style={{height: '100vh', width:'100wh'}}>
      <Sider theme="light">
        <div className="logo">
          {userInfo}
        </div>
        <Menu theme="light" mode="inline" defaultSelectedKeys={['1']} >
          <Menu.Item key="1" onClick={removeSelected} icon={<HomeOutlined />}>
            <span>Home</span>
            <Link to="/" />
          </Menu.Item>
          <Menu.Item key="2" onClick={removeSelected} icon={<ContactsOutlined />}>
            <span>Contacts</span>
            <Link to="/contacts" />
          </Menu.Item>
          <Menu.Item key="3" icon={<MessageOutlined />}>
            <span>Messages</span>
            <Link to="/messages" />
          </Menu.Item>
          <Menu.Item key="5" onClick={removeSelected} icon={<VideoCameraOutlined />}>
            <span>Lives</span>
            <Link to="/lives" />
          </Menu.Item>
          <Menu.Item key="6" onClick={removeSelected} icon={<ProfileOutlined />}>
            <span>Profile</span>
            <Link to="/profile" />
          </Menu.Item>
        </Menu>
        {/* <div className="userinfo">
          {userInfo}
        </div> */}
      </Sider>
      <Layout className="site-layout">
        {/* <Header className="site-layout-background" style={{ padding: 0 }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: toggle,
          })}
          {userInfo}
        </Header> */}
        <Content
          className="site-layout-background"
          style={{
            margin: '0px 0px',
            padding: 0,
            minHeight: 280,
          }}
        >
          <Route exact path="/" component={() => (<Home user={props.user}/>)} />
          <Route path="/contacts" component={() => (<Contacts user={props.user}/>)} />
          <Route path="/messages" component={() => (<Messages user={props.user} />) } />
          <Route path="/lives" component={() => (<Lives user={props.user}/>)} />
          <Route path="/profile" component={() => (<Profile user={props.user} logoutFunc={logout} resetPwdFunc={resetPwd} /> ) } />
        </Content>
      </Layout>
    </Layout>
    </Router>
  );
}

export default MainPage;