const workerUrl = 'https://bdz-manito-login.bdz-manito.workers.dev';
const form = document.querySelector('#login');
form.onsubmit = async event => {
  event.preventDefault();
  const button = form.querySelector('button');
  const notice = document.querySelector('#notice');
  button.disabled = true;
  notice.textContent = '입장권을 확인하고 있어요.';
  try {
    const local = ['localhost','127.0.0.1'].includes(location.hostname);
    const response = await fetch(local ? '/login' : workerUrl, {
      method:'POST',
      body:new URLSearchParams(new FormData(form))
    });
    if (response.status === 401) throw new Error('번호, 이름, 비밀번호를 다시 확인해 주세요.');
    if (!response.ok) throw new Error();
    const {admitted, mission, target} = await response.json();
    if (!admitted) throw new Error();
    const number = form.elements.number.value;
    form.reset();
    document.querySelector('#entrance').hidden = true;
    document.querySelector('#game').hidden = false;
    if (mission && target) {
      newTicket(number, mission, target);
      action.focus();
    } else {
      document.querySelector('#number').textContent = 'NO. '+number;
      document.querySelector('#game article p').textContent = '마니또 배정을 준비하고 있어요. 나중에 다시 입장해 주세요.';
      document.querySelector('#game .panel').hidden = true;
      action.hidden = true;
      const title = document.querySelector('#game h1');
      title.tabIndex = -1;
      title.focus();
    }
  } catch (error) {
    notice.textContent = error.message.startsWith('입장') || error.message.startsWith('번호')
      ? error.message : '입장 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.';
  } finally {
    button.disabled = false;
  }
};
