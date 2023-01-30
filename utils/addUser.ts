import { exec, execSync } from 'child_process';
import fs from 'fs';

const checkFormat = (userInfo: string) => {
  let info = userInfo.replaceAll('{', '').replaceAll('}', '').replaceAll('"', '').split(',');
  let infos = ['', '', '', ''];
  for (let i = 0; i < info.length; i++) {
    let temp = info[i].split(':');
    infos[i] = temp[1].trim();
  }
  return {
    "LEETCODE_ID": infos[0],
    "wechat_id": infos[1],
    "first_name": infos[2],
    "last_name": infos[3]
  };
}

const writeToFile = (userInfo: object) => {
  let info = JSON.stringify(userInfo);
  try{
    fs.writeFileSync('../UTLeetcoder/backend/new_user.json', info);
  } catch (err) {
    throw new Error('Write File Error');
  }
};

const updateUser = () => {
  try {
    execSync('cd ../UTLeetcoder/backend/src && node add_user.js && node index.js');
  } catch (err) {
    throw new Error('Update Error');
  }
};

const updateGit = () => {
  try {
    execSync('cd ../UTLeetcoder && node update.js');
  } catch (err) {
    throw new Error('Update Git Error');
  }
};

export const addUser = (userInfo: string) => {
  let info = checkFormat(userInfo);
  if (Object.keys(info).length !== 4 || info.LEETCODE_ID === '' || info.LEETCODE_ID === undefined) {
    throw new Error('Invalid format');
  }
  try {
    writeToFile(info);
  } catch (err) {
    throw new Error('Write File Error');
  }
  try {
    updateUser();
  } catch (err) {
    throw new Error('Update User Error');
  }
  try {
    updateGit();
  } catch (err) {
    throw new Error('Update Git Error');
  }
  return info.LEETCODE_ID;
};