import { useState, useRef } from 'react';
import React from 'react';
import { Mentions, Menu, Dropdown, Modal } from 'antd';

import { updateComment, deleteComment } from '../fetch/postFetch';
import { useSelector } from 'react-redux';

const { Option } = Mentions;

function CommentItem(props) {
  const [editCommentVisible, setEditCommentVisible] = useState(false);
  const [editCommentValue, setEditCommentValue] = useState(props.comment.commentValue);
  const allContacts = useSelector(state => state.allContacts)
  const mentions = useRef([]);

  const handleEditComment = ()=>{
    setEditCommentVisible(true);
  }

  const onChangeEditComment = (value) => {
    setEditCommentValue(value);
  };

  const handleEditCommentOk = async () => {
    if (editCommentValue.trim() === '') {
      alert('Comment should not be empty!');
      return;
    }
    const resUpdateComment = await updateComment(props.postId, props.comment.commentId, editCommentValue, mentions.current);
    mentions.current = [];
    setEditCommentVisible(false);
    await props.refreshComment(props.postId);
  }

  const handleEditCommentCancel = () => {
    setEditCommentVisible(false);
  }

  const handleDeleteComment = async ()=>{
    await deleteComment(props.postId, props.comment.commentId);
    await props.refreshComment(props.postId);
  }

  function onSelect(option) {
    console.log('select', option.value);
    mentions.current.push(option.value);
  }

  const editCommentModal = (
    <Modal
      visible={editCommentVisible}
      title="Edit Comment"
      onOk={handleEditCommentOk}
      onCancel={handleEditCommentCancel}
    >
      <Mentions
        value={editCommentValue}
        autoSize={{ minRows: 2, maxRows: 2 }}
        onChange={onChangeEditComment}
        onSelect={onSelect}
      >
        {allContacts.map((user) => <Option key={user} value={user}>{user}</Option>)}
      </Mentions>
    </Modal>
  )

  const menu = (
    <Menu className='menu'>
      <Menu.Item key="0" onClick = {handleEditComment}>
        Edit
      </Menu.Item>
      <Menu.Item key="1" onClick = {handleDeleteComment}>
        Delete
      </Menu.Item>
    </Menu>
  );

  function DropDownItem() {
    if (props.comment.commentAuthor === props.user) {
      return (
        <Dropdown overlay={menu}>
          <div className='postCard'>
            <span className='comment-author-name'> {props.comment.commentAuthor}: </span>
            <span className='comment-value'> {props.comment.commentValue} </span>
          </div>
        </Dropdown>
      )
    } else {
      return (
        <div className='postCard'>
          <span className='comment-author-name'> {props.comment.commentAuthor}: </span>
          <span className='comment-value'> {props.comment.commentValue} </span>
        </div>
      )
    }  
  }

  return (
    <>
      
      <DropDownItem/>
      {editCommentModal}
    </>
  );
}

export default CommentItem;