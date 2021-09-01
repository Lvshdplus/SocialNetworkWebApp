import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { Image, Card, Comment, Tooltip, Divider, Mentions, Menu, Dropdown, Modal } from 'antd';
import moment from 'moment';
import Webavatar from './Webavatar'; 
import CommentItem from './CommentItem'; 
import { useSelector } from 'react-redux';
import { getImageValue, sendComment, getPostById, deletePost, hidePost } from '../fetch/postFetch';


const { Option } = Mentions;

function PostCard(props) {
  const [post, setPost] = useState(props.post);
  const [postId, setPostId] = useState(props.post.postId);
  const [author, setAuthor] = useState(props.post.author);
  const [timeStamp, setTimeStamp] = useState(props.post.timeStamp);
  const [textValue, setTextValue] = useState(props.post.content.text);
  const [imageKey, setImageKey] = useState(props.post.content.image);
  const [imageValue, setImageValue] = useState(null);
  const [comments, setComments] = useState(props.post.comments);
  const [newCommentVisible, setNewCommentVisible] = useState(false);
  const [newCommentValue, setNewCommentValue] = useState('');
  const allContacts = useSelector(state => state.allContacts)
  const mentions = useRef([]);
  const isCommentUpdate = useSelector(state => state.updateCommentsNotification);
  
  useEffect(() => {
    if (imageKey !== null) {
      getImageValue(imageKey).then(res => {
        setImageValue(res.data);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageKey]);

  useEffect(() => {
    if (isCommentUpdate.id > 0 && isCommentUpdate.data !== null) {
      if (props.post.postId === isCommentUpdate.data.postId) {
        refreshComment(isCommentUpdate.data.postId);
      }
    }
  }, [isCommentUpdate]);

  const refreshComment = async (qPostId) => {
    // find the post in postList
    const resGetPostById = await getPostById(qPostId);
    const refreshedPost = resGetPostById.data;
    setComments([]);
    // change an item of a state array doesn't update directly
    if (refreshedPost !== null) {
      // update posts will also cause comments state to change
      setComments(refreshedPost.comments);
    }
  };

  const handleClickNewComment = ()=>{
    setNewCommentVisible(true);
  }
  
  const handleClickDelete = async ()=>{
    const resDeletePost = await deletePost(props.post.postId);
    await props.refreshPostArea();
  }

  const handleClickHide = async ()=>{
    const resHidePost = await hidePost(props.post.postId);
    await props.refreshPostArea();
  }

  const onChangeNewComment = (value) => {
    setNewCommentValue(value);
  };

  const handleNewCommentOk = async () => {
    if (newCommentValue.trim() === '') {
      alert('Comment should not be empty!');
      return;
    }
    const resSendComment = await sendComment(postId, newCommentValue, mentions.current);
    mentions.current = [];
    setNewCommentVisible(false);
    setNewCommentValue('');
    await refreshComment(props.post.postId);
  }

  const handleNewCommentCancel = () => {
    setNewCommentVisible(false);
  }

  function onSelect(option) {
    console.log('select', option.value);
    mentions.current.push(option.value);
  }

  const menuSelf = (
    <Menu className='menu'>
      <Menu.Item key="0" onClick = {handleClickNewComment}>
        Comment
      </Menu.Item>
      <Menu.Item key="1" className='postDeleteBtn' onClick = {handleClickDelete}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const menuOthers = (
    <Menu className='menu'>
      <Menu.Item key="0" onClick = {handleClickNewComment}>
        Comment
      </Menu.Item>
      <Menu.Item key="2" onClick = {handleClickHide}>
        Hide
      </Menu.Item>
    </Menu>
  );

  const newCommentModal = (
    <Modal
      visible={newCommentVisible}
      title="New Comment"
      onOk={handleNewCommentOk}
      onCancel={handleNewCommentCancel}
    >
      {/* <TextArea
        value={newCommentValue}
        showCount maxLength={100}
        onChange={onChangeNewComment}
        placeholder="Make a comment"
        autoSize={{ minRows: 2, maxRows: 2 }}
      /> */}
      <Mentions
        value={newCommentValue}
        autoSize={{ minRows: 2, maxRows: 2 }}
        onChange={onChangeNewComment}
        placeholder="Make a comment"
        onSelect={onSelect}
      >
        {allContacts.map((user) => <Option key={user} value={user}>{user}</Option>)}
      </Mentions>
    </Modal>
  )

  function PostDropDownItem() {
    if (author === props.user) {
      return (
        <Dropdown overlay={menuSelf}>
          <div className="post-dropdown">
          <a onClick={(e) => e.preventDefault()}>
            ...
          </a>
          </div>
        </Dropdown>
      )
    } else {
      return (
        <Dropdown overlay={menuOthers}>
          <div className="post-dropdown">
          <a onClick={(e) => e.preventDefault()}>
            ...
          </a>
          </div>
        </Dropdown>
      )
    }
  }

  function makeCommentItems(commentArr) {
    return commentArr.map((comment, index) => {
      return (
         <CommentItem comment={comment} user={props.user} refreshComment={refreshComment} postId={postId} key={comment.commentId}/>
      )
   })
  };

  return (
    <>
      <div className='postCard'>
      <Card
        hoverable
      >
        <Comment
          author={<a> {author}</a>}
          avatar={
            <Webavatar name={author} />
          }
          content={
            <>
              <p>
                {textValue}
              </p>
              <Image
                width={200}
                src={imageValue}
              />
              <PostDropDownItem/>
              {newCommentModal}
              <Divider />
              {makeCommentItems(comments)}
            </>
          }
          datetime={
            <Tooltip title={moment(timeStamp).format('YYYY-MM-DD HH:mm:ss')}>
              <span>{moment(timeStamp).fromNow()}</span>
            </Tooltip>
          }
        />
      </Card>
      </div>
    </>
  );
}

export default PostCard;