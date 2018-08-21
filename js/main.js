// youtube api 其實我說明還沒看完 有空再來細看一下 
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: 'yotq0PxWZk4', 
    events: {
      'onStateChange': function(event) {
        if (event.data == YT.PlayerState.PLAYING) {
          // console.log('play!');  
          canvas.style.zIndex = 1;
        }
      }
    }
  });
}


// 等等放進彈幕
var words = [];


// 用canvas畫布裡的文字 來當彈幕牆
// 後來看到freecodecamp中文版 裡面也有個彈幕範例 不過它是給<body>增加<p>然後移動 那一堆人發彈幕不就超級多p標籤 不喜歡>A <
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");

var ww = 500;
var wh = 500;


// 調整畫布大小用的
function initCanvas() {
    ww = canvas.width = window.innerWidth*0.85;
    
    wh = canvas.height = document.getElementsByTagName('iframe')[0].height * 3/4;

    canvas.style.zIndex = -1;
};

canvas.addEventListener('click', ()=>{
  if (player.getPlayerState() == 2) {player.playVideo()}
  else if (player.getPlayerState() == 1){player.pauseVideo()}
} , false);


// 畫面更新
function draw() {
  // 清空背景
  ctx.clearRect(0,0,ww,wh)

  // 覺得之後把彈幕弄成物件會比較好 才可以再加上點擊 查看 複製 等等
  for (var i = words.length - 1; i >= 0; i--) {
    let t = player.getCurrentTime()
    let wt = words[i].videoCurrentTime
    if (t > wt) {
      ctx.save()
        ctx.translate(ww, 0)
        ctx.beginPath()
        ctx.fillStyle = 'white'
        ctx.font = "20pt 微軟正黑體"     
        ctx.fillText(words[i].state, -85*(t - wt), words[i].y)

        ctx.stroke()
        ctx.closePath()
      ctx.restore()

    }
  }
  requestAnimationFrame(draw);
};

// 頁面載入
function loaded() {
  initCanvas();
  requestAnimationFrame(draw);
}
// 載入 縮放的事件
window.addEventListener("load", loaded);
window.addEventListener("resize", initCanvas);
// 這兩個載入 縮放的用法 是從某直播coding的強者那原封不動抄來的哈哈哈哈  (逃


// 打字和傳彈幕
var UserContent = document.getElementById('UserContent');
var btn = document.getElementById('btn');

btn.addEventListener('click', write, false);

// 接上firebase
var firebase;
var config = {
  databaseURL: "https://myhtmlvideoplayer.firebaseio.com"
};
firebase.initializeApp(config);

var database = firebase.database().ref('/test/');


//第一次載入資料庫時顯示所有內容
database.once('value', function (snapshot) {
  // show.innerHTML = ('');
  for (var i in snapshot.val()) {
    console.log(snapshot.val()[i])
    // words.push('奏姐我洗番你阿阿阿')
    words.push(snapshot.val()[i])
  } 
  
})

// 傳訊息到Firebase 成為彈幕
function write(){
    var UserPostData = {
      // 之後想加上發言者的暱稱 時間
      // name: UserName.value,
      state: UserContent.value,
      videoCurrentTime: player.getCurrentTime(),
      y : wh*Math.random(),
      // time: now,
      // id: 'id' + ms,
    };
    database.push(UserPostData);
    UserContent.value = '';
}


//每一次資料庫有變動時，獲取最新一筆內容呈現
database.limitToLast(1).on('value', function (snapshot) {
  for (var i in snapshot.val()) {
    console.log(snapshot.val()[i]);
    words.push(snapshot.val()[i]);

    // 想嘗試的功能：用另一個的網頁來控制播放暫停
    // 另一邊click時 傳一個字串給firebase 這邊接到字串然後判斷
    // if (snapshot.val()[i].playOrStop == "play") {
    //   影片.播放()
      // ↑去youtube的api裡找找看暫停播放的methods
    // }
  }  
});
// 以上Firebase的基礎用法 是從網路上各個教學文章 亂改而來的
// 有空得去把Firebase的官方文件重看一次

window.addEventListener("keydown", function(evt) {

  if (evt.key == 'Enter' && UserContent.value != "") {
    write();
  }
});