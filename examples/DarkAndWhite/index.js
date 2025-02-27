let socket = new ReconnectingWebSocket("ws://127.0.0.1:9001/ws");

socket.onopen = () => console.log("Successfully Connected");

socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};

socket.onerror = error => console.log("Socket Error: ", error);

let animation = {
  pp: {
    current: new CountUp('pp', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." }),
  },
  h100: document.getElementById('h100'),
  h50: document.getElementById('h50'),
  h0: document.getElementById('h0'),
};

let cache = {
  id: 0,
  time: 0,
  pp: {
    current: 0,
    fc: 0
  },
  hits: {
    100: 0,
    50: 0,
    0: 0,
  }
};

socket.onmessage = event => {
  try {
    let data = JSON.parse(event.data);
	
    document.documentElement.style.setProperty('--progress', `${(data.playtime / data.last_obj_time * 100).toFixed(2)}%`);
    if (data.status == 2) {
      if (cache.id != 0) cache.id = 0;
      if (data.first_obj_time > data.playtime) {
        animation.h100.innerHTML = 0;
        animation.h50.innerHTML = 0;
        animation.h0.innerHTML = 0;
      };
      document.body.classList.remove('songSelect');
      if (data.playtime > data.first_obj_time) {
        if (cache.pp.current != data.current_pp) {
          cache.pp.current = data.current_pp;
          animation.pp.current.update(data.current_pp);
        };
        if (cache.hits[100] != data.hit_100) {
          cache.hits[100] = data.hit_100;
          animation.h100.innerHTML = data.hit_100;
        };
        if (cache.hits[50] != data.hit_50) {
          cache.hits[50] = data.hit_50;
          animation.h50.innerHTML = data.hit_50;
        };
        if (cache.hits[0] != data.hit_miss) {
          cache.hits[0] = data.hit_miss;
          animation.h0.innerHTML = data.hit_miss;
        };
      } else animation.pp.current.update(0);
    }  else if (data.status != 7) {
      document.body.classList.add('songSelect');
      if (cache.id != data.beatmap_id) {
        animation.pp.current.update(data.beatmap_id);
        cache.id = data.beatmap_id;
      };
      animation.h100.innerHTML = 0;
      animation.h50.innerHTML = 0;
      animation.h0.innerHTML = 0;
    }; 
  } catch (err) { console.log(err); };
};
