import CommentItem from './components/CommentItem';
import Contacts from './components/Contacts';
import Home from './components/Home';
import LoginForm from './components/LoginForm';
import MainPage from './components/MainPage';
import Messages from './components/Messages';
import NewPost from './components/NewPost';
import PostArea from './components/PostArea';
import PostCard from './components/PostCard';
import Profile from './components/Profile';
import RegistrationForm from './components/RegistrationForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import Webavatar from './components/Webavatar'; 
import renderer from 'react-test-renderer';
import store from './redux/store';
import { Provider } from 'react-redux';

// const {
//   getAllContacts, getContactEntries, 
// } = require('./fetch/contactFetch.js');

// jest.mock('./fetch/contactFetch', () => {
//   return {
//     getAllContacts: jest.fn().mockImplementation(() => JSON.stringify({ code: 0, msg: 'success', data: ['Bob', 'Cara'] })),

//     getContactEntries: jest.fn().mockImplementation(() => JSON.stringify({ code: 0, msg: 'success', data: [
//       { contact: 'Bob', isFollowed: true, isBlocked: false },
//       { contact: 'Cara', isFollowed: false, isBlocked: true }
//     ] })),
//   }
// })


// getAllContacts.mockResolvedValue(JSON.stringify({ code: 0, msg: 'success', data: ['Bob', 'Cara'] }));

// getContactEntries.mockResolvedValue(JSON.stringify({ code: 0, msg: 'success', data: [
//   { contact: 'Bob', isFollowed: true, isBlocked: false },
//   { contact: 'Cara', isFollowed: false, isBlocked: true }
// ] }));

const user = 'Alex';
const postId = 'post-Cara-1620054195743';
const comment = {
  commentId: 'post-Cara-1620054195743-comment-Cara-1620282158908',
  commentAuthor: 'Cara',
  commentValue: 'thank you friends',
};
const postItem = {
  _id: {"$oid":"60901059f92665e135eda7a7"},
  postId: "post-Alex-1620054105057",
  author: "Alex",
  timeStamp: 1620054105057,
  content: {
    text: "I'm Alex, this is the 1st post.",
    image: null
  },
  comments:[]
}
const postList = [
  postItem,
];


describe('Snapshot test for react components', () => {
  test('Snapshot test CommentItem', () => {
    const component = renderer.create(
      <Provider store={store}>
        <CommentItem comment={comment} user={user} refreshComment={null} postId={postId} key={comment.commentId}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test Contacts', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Contacts user={user}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test Home', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Home user={user}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test LoginForm', () => {
    const component = renderer.create(
      <Provider store={store}>
        <LoginForm/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test MainPage', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MainPage user={user}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test Messages', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Messages user={user}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test NewPost', () => {
    const component = renderer.create(
      <Provider store={store}>
        <NewPost user={user}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test PostArea', () => {
    const component = renderer.create(
      <Provider store={store}>
        <PostArea user={user} postList={postList}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test PostCard', () => {
    const component = renderer.create(
      <Provider store={store}>
        <PostCard post={postItem} user={user} postList={postList}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test Profile', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Profile post={postItem} user={user} postList={postList}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test RegistrationForm', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RegistrationForm/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test ResetPasswordForm', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ResetPasswordForm />
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Snapshot test Webavatar', () => {
    const component = renderer.create(
      <Provider store={store}> 
        <Webavatar name={user}/>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});