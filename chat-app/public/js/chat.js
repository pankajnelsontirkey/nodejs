const socket = io();

/* DOM Elements */
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $shareLocationButton = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');

/* Templates */
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('hh:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('location', url => {
  const html = Mustache.render(locationTemplate, {
    url: url.url,
    createdAt: moment(url.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;
  socket.emit('sendMessage', message, error => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log('The message was delivered!', message);
  });
});

$shareLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    $shareLocationButton.setAttribute('disabled', 'disabled');
    return alert('Geolocation not supported by your browser.');
  }

  $shareLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'shareLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        console.log('Location shared!');
      }
    );
    $shareLocationButton.removeAttribute('disabled');
  });
});