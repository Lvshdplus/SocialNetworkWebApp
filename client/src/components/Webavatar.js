import { useState } from 'react';
import React from 'react';
import { Avatar } from 'antd';

const colorList = ['#BE90D4', '#E26A6A', '#F4B350', '#66CC99', '#2ECC71', '#6BB9F0'];

function Webavatar(props) {
  const [name, setName] = useState(props.name.charAt(0).toUpperCase());
  const [color] = useState(colorList[(name.charCodeAt(0)+ name.charCodeAt(name.length-1))% colorList.length]);

  if (name.length > 6) {
    setName(name.charAt(0).toUpperCase());
  }
  
  return (
    <>
      <Avatar
        style={{
          backgroundColor: color,
          verticalAlign: 'middle',
        }}
        size="large"
      >
        {name}
      </Avatar>
    </>
  );
}

export default Webavatar;