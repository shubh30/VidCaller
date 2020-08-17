const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
  // path: '/peerjs',
  host: '/',
  port: '3001',
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        console.log('In answer');
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  console.log('New User ' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    console.log('In connectedNewUser');
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  console.log('In addVideoStream');
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $('input');

$('html').keydown(function (e) {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());
    socket.emit('message', text.val());
    text.val('');
  }
});

socket.on('createMessage', (message) => {
  console.log('this is comming from server', message);
  $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
});
