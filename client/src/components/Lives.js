import { Divider } from 'antd';
import VideoChat from './VideoChat';

function Lives (props) {
  return (
    <div id='liveBoard'>
      <VideoChat user={props.user} />
    </div>
  );
}

export default Lives;