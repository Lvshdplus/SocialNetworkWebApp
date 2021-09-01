import { useState, useEffect } from 'react';
import React from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { Descriptions, Divider, Button, Modal } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import Webavatar from './Webavatar';

import { getProfile, deactivateUser } from '../fetch/authFetch';

function Profile(props) {
  const [registrationDate, setRegistrationDate] = useState(null);
  const [deactivateVisible, setDeactivateVisible] = useState(false);

  const history = useHistory();

  useEffect(() => {
    getProfile(props.user).then(res => {
      setRegistrationDate(res.data.registrationDate);
    });
  }, []);

  const HandleReset = () => {
    props.resetPwdFunc();
  }

  const showModal = () => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Once the account is deactivated, it cannot be restored!',
      okText: 'Deactivate',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return handleOk();
      },
      onCancel() {
        
      },
    });
    // setDeactivateVisible(true);
  };

  const handleOk = () => {
    deactivateUser().then(res => {
      props.logoutFunc();
    });
  }

  return (
    <>
      <div id='profileBoard'>
        <Descriptions title="User Info" column={2}>
          <Descriptions.Item label=""><Webavatar name={props.user} /></Descriptions.Item>
          <Descriptions.Item label="Username">{props.user}</Descriptions.Item>
          <Descriptions.Item label=""></Descriptions.Item>
          <Descriptions.Item label="Registration date">{moment(registrationDate).format('YYYY-MM-DD')}</Descriptions.Item>
        </Descriptions>
        <Divider/>
        <Descriptions title="Settings" column={2}>
          <Descriptions.Item label="">
            <Button type="primary" shape="round" onClick={HandleReset}>
              Reset Password
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="">
            <Button danger shape="round" onClick={showModal}>
              Deactivate
            </Button>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </>
  );
}

export default Profile;