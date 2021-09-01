import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import MainPage from './components/MainPage';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import './App.css';
import { notification } from 'antd';
import { useSelector } from 'react-redux';

function App() {
  const [user, setUser] = useState(null);
  const isPostUpdate = useSelector(state => state.postsUpdateNotification);
  const isMsgUpdate = useSelector(state => state.msgUpdateNotification);
  const selectedContact = useSelector(state => state.selectedContact);
  const isCommentUpdate = useSelector(state => state.updateCommentsNotification);

  useEffect(() => { 
    if (isPostUpdate.id > 0) {
      if (isPostUpdate.data.mentioned) {
        postMentionNotification(isPostUpdate.data);
      } else {
        postNotification(isPostUpdate.data.sender);
      }
    }
  }, [isPostUpdate]);

  useEffect(() => {
    if (isCommentUpdate.id > 0) {
      if (isCommentUpdate.data.mentioned) {
        commentMentionNotification(isCommentUpdate.data);
      } 
    }
  }, [isCommentUpdate]);

  useEffect(() => { 
    if (isMsgUpdate.id > 0 && selectedContact !== isMsgUpdate.sender) {
      msgNotification(isMsgUpdate.sender);
    }
  }, [isMsgUpdate]);

  return (
    <Router>
      <Switch>
        <Route path="/login">
          <LoginForm onSuccess={setUser} />
        </Route>
        <Route path="/register">
          <RegistrationForm />
        </Route>
        <Route path="/reset">
          <ResetPasswordForm />
        </Route>
        <Route path="/">
          <MainPage user = {user} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

const postNotification = (sender) => {
  notification.open({
    message: 'New Post',
    description: `Your friend ${sender} upload a new post!`,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

const postMentionNotification = (data) => {
  notification.open({
    message: 'Post Mention',
    description: `Your friend ${data.sender} mentioned you in a post!`,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

const commentMentionNotification = (data) => {
  notification.open({
    message: 'Comment Mention',
    description: `Your friend ${data.sender} mentioned you in a comment!`,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

const msgNotification = (sender) => {
  notification.open({
    message: 'New Message',
    description: `Your friend ${sender} send you a new message!`,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};