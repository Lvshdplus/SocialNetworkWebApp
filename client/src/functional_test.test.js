/* eslint-disable no-undef */
require('@babel/polyfill');
require('isomorphic-fetch');

// import selenium functions
const {
  Builder, By, until,
} = require('selenium-webdriver'); // eslint-disable-line

// install and import chromedriver for Chrome
require('chromedriver'); // eslint-disable-line

// declare the -web- driver
let driver;

// NOTE: make sure user (functional, test) has been registered in database

beforeAll(async () => {
  // initialize the driver before running the tests
  driver = await new Builder().forBrowser('chrome').build();
});

afterAll(async () => {
  // close the driver after running the tests
  await driver.quit();
});

const username = 'functional';
const password = 'test';
const textvalue = 'This is a funtional testing';

it('functional test visit login page', async () => {
  driver.wait(until.urlIs('http://localhost:3000/login'));
  await driver.get('http://localhost:3000/login');

  await driver.wait(until.elementLocated(By.id('loginName')), 30000);
  const loginName = await driver.findElement(By.id('loginName'));
  expect(loginName).not.toEqual(null);

  await driver.wait(until.elementLocated(By.id('loginPassword')), 30000);
  const loginPassword = await driver.findElement(By.id('loginPassword'));
  expect(loginPassword).not.toEqual(null);

  await driver.wait(until.elementLocated(By.id('loginBtn')), 30000);
  const loginBtn = await driver.findElement(By.id('loginBtn'));
  expect(loginBtn).not.toEqual(null);

}, 100000);

it('functional test login with correct password', async () => {
  driver.wait(until.urlIs('http://localhost:3000/login'));
  await driver.get('http://localhost:3000/login');

  await driver.wait(until.elementLocated(By.id('loginName')), 30000);
  const loginName = await driver.findElement(By.id('loginName'));
  expect(loginName).not.toEqual(null);

  await driver.wait(until.elementLocated(By.id('loginPassword')), 30000);
  const loginPassword = await driver.findElement(By.id('loginPassword'));
  expect(loginPassword).not.toEqual(null);

  await driver.wait(until.elementLocated(By.id('loginBtn')), 30000);
  const loginBtn = await driver.findElement(By.id('loginBtn'));
  expect(loginBtn).not.toEqual(null);

  await loginName.clear();
  await loginName.sendKeys(username);

  await loginPassword.clear();
  await loginPassword.sendKeys(password);
  
  await loginBtn.click();
  
}, 100000);

it('functional test post', async () => {
  driver.wait(until.urlIs('http://localhost:3000/login'));
  await driver.get('http://localhost:3000/login');

  await driver.wait(until.elementLocated(By.id('loginName')), 30000);
  const loginName = await driver.findElement(By.id('loginName'));
  expect(loginName).not.toEqual(null);

  await driver.wait(until.elementLocated(By.id('loginPassword')), 30000);
  const loginPassword = await driver.findElement(By.id('loginPassword'));
  expect(loginPassword).not.toEqual(null);

  await driver.wait(until.elementLocated(By.id('loginBtn')), 30000);
  const loginBtn = await driver.findElement(By.id('loginBtn'));
  expect(loginBtn).not.toEqual(null);

  await loginName.clear();
  await loginName.sendKeys(username);

  await loginPassword.clear();
  await loginPassword.sendKeys(password);
  
  await loginBtn.click();

  driver.wait(until.urlIs('http://localhost:3000/'));
  
  await driver.wait(until.elementLocated(By.id('postBtn')), 30000);
  const postBtn = await driver.findElement(By.id('postBtn'));
  expect(postBtn).not.toEqual(null);

  await postBtn.click();

  await driver.wait(until.elementLocated(By.id('postTextArea')), 30000);
  const postTextArea = await driver.findElement(By.id('postTextArea'));
  expect(postTextArea).not.toEqual(null);

  await driver.wait(until.elementLocated(By.id('postSendBtn')), 30000);
  const postSendBtn = await driver.findElement(By.id('postSendBtn'));
  expect(postSendBtn).not.toEqual(null);

  await postTextArea.clear();
  await postTextArea.sendKeys(textvalue);

  await postSendBtn.click();

  await driver.wait(until.elementLocated(By.className('post-dropdown')), 30000);
  const postDropdown = await driver.findElement(By.className('post-dropdown'));
  expect(postDropdown).not.toEqual(null);

  await postDropdown.click();

  await driver.wait(until.elementLocated(By.className('postDeleteBtn')), 30000);
  const postDeleteBtn = await driver.findElement(By.className('postDeleteBtn'));
  expect(postDeleteBtn).not.toEqual(null);

  await postDeleteBtn.click();
}, 100000);