import { useRef, useState } from 'react';
import React from 'react';
import { Modal, Button, Input, Image, Mentions } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { sendPost } from '../fetch/postFetch';
import { useSelector } from 'react-redux';
const { Option } = Mentions;

function NewPost(props) {
  const [imageValue, setImageValue] = useState(null);
  const [imageName, setImageName] = useState('');
  const [textValue, setTextValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const mentions = useRef([]);
  const allContacts = useSelector(state => state.allContacts);

  const reader = new FileReader();

  const showModal = () => {
    setVisible(true);
  }

  const onChangeText = (value) => {
    setTextValue(value);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleOk = async () => {
    if (textValue.trim()==='' && imageValue===null) {
      alert('Post should not be empty!');
      return;
    }
    setLoading(true);
    const resSendPost = await sendPost(textValue, imageValue, mentions.current);
    setLoading(false);
    setVisible(false);
    setImageValue(null);
    setImageName('');
    setTextValue('');
    mentions.current = [];
    props.refreshPostArea();
  };

  const handlePostImageInput = async (e) => {
    if (e.target.files.length !== 0) {
      if (e.target.files[0].size > 3000000) {
        alert(`image size cannot be larger than 3MB`);
        return;
      }
      setImageName(e.target.files[0].name);
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setImageValue(null);
      setImageName('');
    }
  }

  reader.onload = function () {
    setImageValue(reader.result);
  };

  function onSelect(option) {
    console.log('select', option);
    mentions.current.push(option.value);
  }

  return (
    <>
      <Button id='postBtn' type="primary" shape="round" onClick={showModal}>
          Post
      </Button>
      <span className='placeHolder'> Share a moment of beauty! </span>
      <Modal
        visible={visible}
        title="New Post"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button id='postSendBtn' key="submit" type="primary" shape="round" loading={loading} onClick={handleOk}>
            Send
          </Button>,
          <Button key="back" shape="round" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
        >
        <Mentions
          id='postTextArea'
          value={textValue}
          autoSize={{ minRows: 6, maxRows: 12 }}
          placeholder="Share your moment"
          onChange={onChangeText}
          onSelect={onSelect}
        >
          {allContacts.map((user) => <Option key={user} value={user}>{user}</Option>)}
        </Mentions>
        <label htmlFor='post-image-input'>
          <FileImageOutlined className='media-icon'/>
          <span> {imageName} </span>
        </label>
        <input onChange={handlePostImageInput} id="post-image-input" type="file" accept='image/*' />
        <br/>
        <Image
          width={200}
          src={imageValue}
        />
        </Modal>
    </>
  );
}

export default NewPost;