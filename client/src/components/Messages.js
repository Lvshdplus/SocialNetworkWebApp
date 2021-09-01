import { Input, Button, Divider, Modal, Upload, Popover } from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  MessageOutlined,
  UserDeleteOutlined,
  UploadOutlined,
  FileImageOutlined,
  AudioOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import { searchNewUser, searchNewUserSingle, unfollowUser, followUser } from '../fetch/contactFetch';
import { useEffect, useRef, useState } from 'react';
import Webavatar from './Webavatar'; 
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { sendMsg, sendImgMsg, sendAudioMsg, getAudioValue, isAbleToContact } from '../fetch/messageFetch';
import { 
  AgentBar, 
  Column, 
  Title, 
  Row,  
  MessageText, 
  Message, 
  MessageList,
  TextComposer,
  IconButton,
  TextInput,
  SendButton,
  AddIcon,
  TitleBar,
  MessageMedia
} from '@livechat/ui-kit';
import { getToken } from '../fetch/authFetch';
import { getImageValue } from '../fetch/postFetch';
import useRecorder from './useRecorder';
import { useDispatch, useSelector } from 'react-redux';
import { addMsgContactByOne, selectContact } from '../redux/action';

const { Search } = Input;

function Messages(props) {
  const dispatch = useDispatch();
  const messageRawData = useSelector(state => state.messageRawData);
  const messageContactList = useSelector(state => state.messageContactList);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchRes, setSearchRes] = useState(null);
  // const [selectedName, setSelectedName] = useState(null);
  const selectedName = useSelector(state => state.selectedContact);
  const [rerender, setRerender] = useState(false);
  let isFollowed = false;
  const toggleFollow = () => {isFollowed = !isFollowed};
  // [IMPORTANT]  ***********************************************
  // Put mutators in functions to avoid stale references to state
  // When mutating state inside [websocket] event handlers! 
  // ************************************************************

  useState(() => {
    console.log('messageContactList changes: ', messageContactList);
    setRerender(!rerender);
  }, [messageContactList]);

  const press = (item) => {
    dispatch(selectContact(item.name));
    console.log(`I pressed item: ${item.name}`);
  };

  const renderItem = ({ item }) => {
    if (!item.display) {
      return;
    }
    const backgroundColor = item.name === selectedName ? 'black' : 'white';

    return (
      <Item 
        item={item}
        onPress={() => press(item)}
        backgroundColor={{ backgroundColor }}
      />
    );
  };

  const contactsListScroll = (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messageContactList}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        extraData={rerender}
      />
    </SafeAreaView>
  );

  const handlerSearch = (value) => {
    console.log(value);
    for (let i=0; i<messageContactList.length; i++) {
      console.log(messageContactList[i]);
      if (messageContactList[i].name.toUpperCase().indexOf(value.toUpperCase()) > -1) {
        messageContactList[i].display = true;
      } else {
        messageContactList[i].display = false;
      }
    }
    setRerender(!rerender);
  };

  const follow = (name) => {
    console.log(`follow user: ${name}`);
    followUser(name).then(res => {
      if (res.code === 0) {
        toggle(name);
      } else {
        window.alert(res.msg);
      }
    });
  }

  const unfollow = (name) => {
    console.log(`unfollow user: ${name}`);
    unfollowUser(name).then(res => {
      if (res.code === 0) {
        toggle(name);
      }
    })
  }

  const toggle = (value) => {
    toggleFollow();
    const info = (
      <AgentBar>
        <Webavatar name={value} />
        <Column>
          <Row justify style={{width: '400px'}}>
            <Title ellipsis>{value}</Title>
            <div className="icons-list">
            <Button type="primary" shape="circle" icon={<MessageOutlined/>} onClick={()=>onChat(value)}/>
            { isFollowed === true ? 
              <Button type="default" shape="circle" icon={<UserAddOutlined/>}/>  :
              <Button type="primary" shape="circle" icon={<UserAddOutlined/>} onClick={()=>follow(value)}/>
            }
            { isFollowed === true ?
              <Button type="primary" shape="circle" icon={<UserDeleteOutlined/>} onClick={()=>unfollow(value)}/> :
              <Button type="default" shape="circle" icon={<UserDeleteOutlined/>}/>
            }
            </div>
          </Row>
        </Column>
      </AgentBar>
      
    );
    setSearchRes(info);
  }

  const onChat = (name) => {
    const index = messageContactList.findIndex((user) => user.name === name);
    console.log(`find chat? ${index}`)
    if (index === -1) {
      dispatch(addMsgContactByOne({ name, display: true }));
    }
    dispatch(selectContact(name));
    setIsModalVisible(false);
  }

  const searchNew = async value => {
    console.log(`Search new people: ${value}`);
    if (value === props.user) {
      window.alert('Sorry, you are searching yourself.');
      return;
    }
    searchNewUserSingle(value).then(res => {
      if (res.code === 0) { // user exists
        console.log(`follow? ${res.data.isFollowed}`)
        isFollowed = res.data.isFollowed;
        const info = (
          <AgentBar>
            <Webavatar name={value} />
            <Column>
              <Row justify style={{width: '400px'}}>
                <Title ellipsis>{value}</Title>
                <div className="icons-list">
                <Button type="primary" shape="circle" icon={<MessageOutlined/>} onClick={()=>onChat(value)}/>
                { isFollowed === true ? 
                  <Button type="default" shape="circle" icon={<UserAddOutlined/>}/>  :
                  <Button type="primary" shape="circle" icon={<UserAddOutlined/>} onClick={()=>follow(value)}/>
                }
                { isFollowed === true ?
                  <Button type="primary" shape="circle" icon={<UserDeleteOutlined/>} onClick={()=>unfollow(value)}/> :
                  <Button type="default" shape="circle" icon={<UserDeleteOutlined/>}/>
                }
                </div>
              </Row>
            </Column>
          </AgentBar>
          
        );
        setSearchRes(info);
        
      } else {
        window.alert(res.msg);
      }
    })
  }

  const MsgBox = (text, contact) => {
    const index = text.findIndex((item) => item.contact === contact);
    if (index === -1) {
      // text.push({ contact: contact, msg: [] });
      return [];
    } else {
      return text[index].messages;
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  }

  const handleCancel = () => {
    setIsModalVisible(false);
  }

  return (
    <div className="message-row">
      <div className="message-column-left">
        <Button style={{width: '100%'}} type="primary" onClick={showModal}>
          <UserAddOutlined/> Chat with a New Contact
        </Button>
        <Input
         placeholder="search current contacts" 
         onChange={(e)=>handlerSearch(e.target.value)}  
         prefix={<SearchOutlined />} 
        />
        <Modal 
          title="Find a New Contact to Chat" 
          visible={isModalVisible} 
          onOk={handleOk} 
          onCancel={handleCancel} 
          footer={[
            <Button key="back" onClick={handleOk}>
              Done
            </Button>
          ]}
        >
        <Search placeholder="search new contacts" onSearch={searchNew} prefix={<UserAddOutlined />} enterButton />
          {searchRes}
        </Modal>
        {contactsListScroll}
      </div>
      <Divider type="vertical" style={{ margin:0, height: '100vh', borderColor: '#E5E5E5' }}></Divider>
      <div className="message-column-right">
        { selectedName === null ? <></>: <ChatBox selectedName={selectedName} user={props.user} msgs={MsgBox(messageRawData, selectedName)}/>}
      </div>
    </div>
  );
}

function ChatBox(props) {
  const [uploadFileModalVisble, setUploadFileModalVisble] = useState(false); 
  const [sendable, setSendable] = useState(false);
  const [image, setImage] = useState(null);
  const reader = new FileReader();

  const onSend = (value) => {
    console.log(`send text: ${value}`);
    isAbleToContact(props.selectedName).then(res => {
      if (res.code === 0 && res.data === true) {
        sendMsg(props.selectedName, value)
      } else {
        window.alert(res.msg);
      }
    })
  }

  const openUploadModal = () => {
    setUploadFileModalVisble(true);
  }

  const handleOk = () => {
    setUploadFileModalVisble(false);
  }

  const handleCancel = () => {
    setUploadFileModalVisble(false);
  }

  const handleSend = () => {
    console.log('Send file');
    isAbleToContact(props.selectedName).then(res => {
      if (res.code === 0 && res.data === true) {
        sendImgMsg(props.selectedName, image);
      } else {
        window.alert(res.msg);
      }
    })
    setSendable(false);
    setUploadFileModalVisble(false);
  }

  const handleBeforeUpload = (file) => {
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 3) {
      window.alert('Image size must be smaller than 2MB');
      return false;
    }
    reader.readAsDataURL(file);
  }

  reader.onload = () => {
    console.log(reader.result);
    setImage(reader.result);
    setSendable(true);
  };

  // override action of upload components
  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  // --------------------[audio begin]-------------------------------------------
  const [audioReady, setAudioReady] = useState(false);
  const [audioSendable, setAudioSendable] = useState(true);
  const updateAudioState = () => setAudioReady((audioReady) => !audioReady);
  const [audioModalVisble, setAudioModalVisble] = useState(false);
  const [audioURL, audioBlob, isRecording, startRecording, stopRecording] = useRecorder(updateAudioState);
  const audio = (
    <div>
      <audio src={audioURL} controls /> <br></br>
      <div style={{width: 300, display: 'flex', justifyContent: 'space-between'}}>
      <Button type={!isRecording?'primary':'default'} onClick={startRecording} disabled={isRecording}>
        Start Recording
      </Button>
      <Button type={isRecording?'primary':'default'} onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </Button>
      </div>
    </div>
  );

  useEffect(() => {
    console.log('audio is ready');
    setAudioSendable(false);
  }, [audioReady]);

  const openAudioModal = () => {
    setAudioModalVisble(true);
  }

  const audioOk = () => {
    setAudioModalVisble(false);
  }

  const audioCancel = () => {
    setAudioModalVisble(false);
  }

  const audioSend = () => {
    console.log('send audioBlob: ', audioBlob);
    isAbleToContact(props.selectedName).then(res => {
      if (res.code === 0 && res.data === true) {
        sendAudioMsg(props.selectedName, audioBlob);
      } else {
        window.alert(res.msg);
      }
    })
    setAudioModalVisble(false);
  }

  // --------------------[audio end]-------------------------------------------------


  // --------------------[BEGIN: send audio file]-------------------------------------------

  const audioReader = new FileReader();
  const [audioFileRes, setAudioFileRes] = useState(null);
  const [audioFileModalVisible, setAudioModalFileVisble] = useState(false);
  const [audioFileSendable, setAudioFileSendable] = useState(false);

  const openAudioFileModal = () => {
    setAudioModalFileVisble(true);
  }
  const handleAudioFileOk = () => {
    setAudioModalFileVisble(false);
  }

  const handleAudioFileCancel = () => {
    setAudioModalFileVisble(false);
  }

  const handleAudioFileSend = () => {
    // [IMPORTANT] ---------------------------------------------------
    // change data buffer format
    const blob = new Blob([Buffer.from(audioFileRes, 'binary')]);
    console.log(blob);
    isAbleToContact(props.selectedName).then(res => {
      if (res.code === 0 && res.data === true) {
        sendAudioMsg(props.selectedName, blob);
      } else {
        window.alert(res.msg);
      }
    })
    
    setAudioModalFileVisble(false);
  }

  const handleAudioBeforeUpload = (file) => {
    console.log('file: ', file);
    // check audio file size, maximal file size === 2
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 3) {
      window.alert('Audio file size must be smaller than 3MB');
      return false;
    }
    audioReader.readAsArrayBuffer(file);
  }

  audioReader.onload = () => {
    console.log(audioReader.result);
    setAudioFileRes(audioReader.result);
    setAudioFileSendable(true);
  }

  audioReader.onerror = (event) => {
    console.error("An error ocurred reading the file: ", event);
  };


  const audioModal = (
    <Modal 
      title="Upload a Prerecorded Audio File Here" 
      visible={audioFileModalVisible} 
      onOk={handleAudioFileOk} 
      onCancel={handleAudioFileCancel}
      footer={[
        <Button disabled={!audioFileSendable} key="send" onClick={handleAudioFileSend}>
          Send
        </Button>,
        <Button key="cancel" onClick={handleAudioFileCancel}>
          Cancel
        </Button>
      ]}
    >
      <Upload 
        customRequest={dummyRequest}
        accept='audio/*'
        maxCount={1}
        beforeUpload={handleAudioBeforeUpload}
      >
        <Button icon={<UploadOutlined />}>Upload Audio (Max: 1)</Button>
      </Upload>
    </Modal>
  );
  // --------------------[END: send audio file]---------------------------------------------

  const content = (
    <div style={{display: 'flex', flexDirection: 'row', justifyContent:'space-between', width: '70px'}}>
      <FileImageOutlined onClick={openUploadModal} style={{fontSize: '30px'}} />
      <FileAddOutlined onClick={openAudioFileModal} style={{fontSize: '30px'}} />
    </div>
  );

  return (
    <div style={{ width: '100%', height: '75vh' }}>
      <TitleBar title={props.selectedName}/>
      <MessageList active>
      {props.msgs.map((msg) => (<MessageRow user={props.user} msg={msg}/>))}
      </MessageList>
      <TextComposer onSend={onSend}>
      <Row align="center">
        <IconButton>
          <Popover content={content} trigger="hover">
            <AddIcon  />
          </Popover> 
        </IconButton>
        <TextInput/>
        <SendButton fit />
      </Row>
      <Row verticalAlign="center" justify="right">
        <IconButton fit>
          <Button type="primary" shape="circle" onClick={openAudioModal} icon={<AudioOutlined />} size='small'/>
        </IconButton>
      </Row>
      </TextComposer>
      {audioModal}
      <Modal 
        title="Find a New Contact to Chat" 
        visible={uploadFileModalVisble} 
        onOk={handleOk} 
        onCancel={handleCancel}
        footer={[
          <Button disabled={!sendable} key="send" onClick={handleSend}>
            Send
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>
        ]}
      >
        <Upload 
          customRequest={dummyRequest}
          accept='image/*'
          listType="picture"
          maxCount={1}
          headers={{
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          }}
          beforeUpload={handleBeforeUpload}
        >
          <Button icon={<UploadOutlined />}>Upload Image (Max: 1)</Button>
        </Upload>
      </Modal>
      <Modal 
        title="Record an audio" 
        visible={audioModalVisble} 
        onOk={audioOk} 
        onCancel={audioCancel}
        footer={[
          <Button disabled={audioSendable} key="send" onClick={audioSend}>
            Send
          </Button>,
          <Button key="cancel" onClick={audioCancel}>
            Cancel
          </Button>
        ]}
      >
        {audio}
      </Modal>
    </div>
  );
};

function MessageRow(props) {
  const myName = props.user;
  const msg = props.msg;
  const mountedRef = useRef(true);
  const [image, setImage] = useState(null);
  const [audioURLShow, setAudioURLShow] = useState(null);

  useEffect(() => {
    if (msg.type === 'image') {
      getImageValue(msg.content).then(res => {
        if (res.code === 0) {
          if (!mountedRef.current) return null
          setImage(res.data);
        }
      });
    }

    if (msg.type === 'audio') {
      getAudioValue(msg.content).then(res => {
        if (res.code === 0) {
          console.log(res.data);
          if (!mountedRef.current) return null
          // [IMPORTANT]--------------------------
          // change buffer code to binary style
          const arrayBuf = Buffer.from(res.data, 'binary');
          const blob = new Blob([arrayBuf]);
          console.log(blob);
          const aUrl = URL.createObjectURL(blob);
          setAudioURLShow(aUrl);
        }
      })
    }

    return () => { 
      mountedRef.current = false
    }
  }, []);

  if (msg.type === "image") {
    console.log(msg);
    return (
      <Row key={`${msg.sender}-${msg.timeStamp}`} reverse={myName === msg.sender}>
        <Webavatar name={msg.sender} />
        <Message isOwn={true} >
          <MessageMedia><img width='200px' src={image} /></MessageMedia>
        </Message>
      </Row>
    );
  } else if (msg.type === 'text') {
    return (
      <Row key={`${msg.sender}-${msg.timeStamp}`} reverse={myName === msg.sender}>
        <Webavatar name={msg.sender} />
        <Message isOwn={true} >
          <MessageText>{msg.content}</MessageText>
        </Message>
      </Row>
    );
  } else if (msg.type === 'audio') {
    return (
      <Row key={`${msg.sender}-${msg.timeStamp}`} reverse={myName === msg.sender}>
        <Webavatar name={msg.sender} />
        <Message isOwn={true} >
          <MessageMedia><audio src={audioURLShow} controls /></MessageMedia>
        </Message>
      </Row>
    );
  }
}

export default Messages;

const Item = ({ item, onPress, backgroundColor }) => (
  <TouchableOpacity id={item} onPress={onPress} style={[styles.item, backgroundColor]}>
    <AgentBar>
      <Webavatar name={item.name} />
      <Column>
        <Row justify>
          <Title ellipsis>{item.name}</Title>
        </Row>
      </Column>
    </AgentBar>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh'
  },
  item: {
    padding: 2,
    marginVertical: 2,
    marginHorizontal: 10,
    borderRadius: 0,
  },
  contactName: {
    fontSize: 24,
  },
});
