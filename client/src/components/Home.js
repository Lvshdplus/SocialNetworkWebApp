import { useState, useEffect } from 'react';
import { Divider } from 'antd';
import NewPost from './NewPost';
import PostArea from './PostArea';
import './style.css'

import { getAllPosts } from '../fetch/postFetch';
import { useSelector } from 'react-redux';

function Home(props) {
  const [postList, setPostList] = useState([]);
  const isPostUpdate = useSelector(state => state.postsUpdateNotification);
  const isPostDelete = useSelector(state => state.postsDeleteNotification);
  useEffect(() => {
    getAllPosts().then(res => {
      setPostList(res.data);
    });
  }, []);

  useEffect(() => { 
    refreshPostArea();
  }, [isPostUpdate]);

  useEffect(() => {
    refreshPostArea();
  }, [isPostDelete]);

  const refreshPostArea = async () => {
    const resGetAllPosts = await getAllPosts();
    const refreshedPostList = resGetAllPosts.data;
    setPostList([]);
    // change an item of a state array doesn't update directly
    setPostList(refreshedPostList);
  }


  return (
      <div id='mainBoard'>
        <NewPost user={props.user} refreshPostArea={refreshPostArea}/>
        <Divider />
        <PostArea user={props.user} postList={postList} refreshPostArea={refreshPostArea}/>
      </div>
  );
}

export default Home;

