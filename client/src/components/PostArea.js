import React from 'react';
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import PostCard from './PostCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '80vh',
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

function PostArea(props) {
  // const [postList, setPostList] = useState(props.postList);
  // useEffect(() => {
  //   setPostList(props.postList);
  // }, []);

  const renderPostCard = ({ item }) => {
    return (
      <PostCard post={item} user={props.user} refreshPostArea={props.refreshPostArea}/>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <FlatList
          id = 'flatList'
          data={props.postList}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.postId}
          extraData={props.postList}
        />
      </SafeAreaView>
      
    </>
  );
}

export default PostArea;