import {
  Input,
  Button,
  Divider
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { 
  searchNewUser, 
  unfollowUser,
  followUser,
  getAllContacts,
  getContactEntries,
  blockUser,
  unblockUser,
} from '../fetch/contactFetch';
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from 'react';
import Webavatar from './Webavatar'; 
import { addMsgContactByOne } from '../redux/action';
import { useDispatch } from 'react-redux';

const { Search } = Input;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '90vh',
  },

  backTop: {
    height: 40,
    width: 40,
    lineHeight: '40px',
    borderRadius: 4,
    backgroundColor: '#1088e9',
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  }
});



function Contacts(props) {
  const [contactEntries, setContactEntries] = useState([]);
  const [candidateEntries, setCandidateEntries] = useState([]);
  const [contactRerender, setContactRerender] = useState(false);
  const [candidateRerender, setCandidateRerender] = useState(false);
  const ref = useRef('');
  const dispatch = useDispatch();
  useEffect(() => {
    refreshContactEntries();
  }, []);

  const refreshContactEntries = () => {
    getContactEntries().then(res => {
      let contactEntryList = [];
      for (let i=0; i<res.data.length; i++) {
        const e = res.data[i];
        e.display = true;
        contactEntryList = [...contactEntryList, e];
      }
      setContactEntries(contactEntryList);
      if (ref.current) {
        refreshNewUser();
      }
    })
  }

  const refreshNewUser = async () => {
    if (ref.current) {
      searchNewUser(ref.current).then(res => {
        if (res.code === 0) { // user exists
          setCandidateEntries(res.data);
        } else {
          setCandidateEntries([]);
        }
        setContactRerender(!candidateRerender);
      })
    }
  }

  const follow = (name) => {
    if (name === props.user) {
      alert(`You cannot follow yourself!`);
      return;
    }
    followUser(name).then(res => {
      if (res.code === 0) {
        dispatch(addMsgContactByOne({ name, display: true }));
        refreshContactEntries();
      } else {
        alert(res.msg);
      }
    });
  }

  const unfollow = (name) => {
    if (name === props.user) {
      alert(`You cannot unfollow yourself!`);
      return;
    }
    console.log(`unfollow user: ${name}`);
    unfollowUser(props.user, name).then(res => {
      if (res.code === 0) {
        refreshContactEntries();
      }
    })
  }

  const block = async  (name) => {
    if (name === props.user) {
      alert(`You cannot block yourself!`);
      return;
    }
    console.log(`${props.user} blocks ${name}`);
    const resUnfollow = await unfollowUser(name, props.user);
    const resBlockUser = await blockUser(name);
    refreshContactEntries();
  }

  const unblock = async (name) => {
    if (name === props.user) {
      alert(`You cannot unblock yourself!`);
      return;
    }
    await unblockUser(name);
    refreshContactEntries();
  }

  function UserBox (props) {
    const info = (
      <div className='avatar-name'>
        <Webavatar name={props.name} />
        <span className='name'> {props.name} </span>
      </div>
    );
    let followBtn;
    if (props.isFollowed) {
      followBtn = (
        <div>
          <Button type="primary" shape="round" ghost className='Button' onClick={() => unfollow(props.name)}>
            Unfollow
          </Button>
        </div>
      );
    } else {
      followBtn = (
        <div>
          <Button type="primary" shape="round" className='Button' onClick={() => follow(props.name)}>
            Follow
          </Button>
        </div>
      );
    }
    let blockBtn;
    if (props.isBlocked) {
      blockBtn = (
        <div style={{width: 20}}>
          <Button danger shape="round" className='Button' onClick={() => unblock(props.name)}>
            Unblock
          </Button>
        </div>
      );
    } else {
      blockBtn = (
        <div>
          <Button type="primary" danger shape="round" className='Button' onClick={() => block(props.name)}>
            Block
          </Button>
        </div>
      );
    }
    
    return (
      <div className='contact-card'>
        <div className='contact-card-inside'>
          {info} {followBtn} {blockBtn}
        </div>
        <Divider/>        
      </div>
    )
  };

  const renderContactBox = ({ item }) => {
    if (!item.display) {
      return;
    }
    return (
      <li className="listItem">
        <UserBox name={item.contact} isFollowed={item.isFollowed} isBlocked={item.isBlocked}/>
      </li>
    );
  };

  const renderCandidateBox = ({ item }) => {
    return (
      <li className="listItem">
        <UserBox name={item.contact} isFollowed={item.isFollowed} isBlocked={item.isBlocked}/>
      </li>
    );
  };

  const handleSearchContact = (value) => {
    for (let i=0; i<contactEntries.length; i++) {
      if (contactEntries[i].contact.toUpperCase().indexOf(value.toUpperCase()) > -1) {
        contactEntries[i].display = true;
      } else {
        contactEntries[i].display = false;
      }
    }
    setContactRerender(!contactRerender);
  };

  const handleSearchCandidate = (value, reference) => {
    reference.current = value;
    searchNewUser(value).then(res => {
      if (res.code === 0) { // user exists
        setCandidateEntries(res.data);
      } else {
        setCandidateEntries([]);
      }
      setContactRerender(!candidateRerender);
    })
  };

  return (
    <div className="contact-row">
      <Divider type="vertical" style={{ height: '100vh', borderColor: '#E5E5E5' }}></Divider>
      <div className="contact-column-left">
        <h1>Your Contacts</h1>
        <Input placeholder="search your contacts" onChange={(e)=>handleSearchContact(e.target.value)}  prefix={<SearchOutlined />} />
        <ul className="list" id='contactsList'>
          <SafeAreaView style={styles.container}>
            <FlatList
              data={contactEntries}
              renderItem={renderContactBox}
              keyExtractor={(item) => item.contact}
              extraData={contactRerender}
            />
          </SafeAreaView>
        </ul>
      </div>
      <Divider type="vertical" style={{ height: '100vh', borderColor: '#E5E5E5' }}></Divider>
      <div className="contact-column-right">
        <h1>Search New Contacts</h1>
        <div> 
          <Input placeholder="search new contacts" onChange={(e)=>handleSearchCandidate(e.target.value, ref)} prefix={<UserAddOutlined />} />
        </div>
        <ul className="list">
          <SafeAreaView style={styles.container}>
            <FlatList
              data={candidateEntries}
              renderItem={renderCandidateBox}
              keyExtractor={(item) => item.contact}
              extraData={candidateRerender}
            />
          </SafeAreaView>
        </ul>
      </div>
    </div>
  );
}

export default Contacts;