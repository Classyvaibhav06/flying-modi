let board;
let boardwidth = 360;
let boardheight = 640;
let context;

let modiwidth = 44;
let modiheight = 30;
let birdX = boardwidth / 8;
let birdY = boardheight / 2;
let modi_img;

let bird = {
  x: birdX,
  y: birdY,
  width: modiwidth,
  height: modiheight,
};

// pipes
let pipearray = [];
let pipewidth = 80;
let pipeheight = 400;
let pipeX = boardwidth;
let pipeY = 50;

let toppipeimg;
let bottompipeimg;

// physics
let velocityX = -4;
let velocitY = 0;
let gravity = window.innerWidth < 800 ? 0.1 : 0.4; // slower gravity for phones


let gameover = false;
let score = 0;
let highscore=0;
let hitImageToShow = null; // store which hit image to show

// 🎵 sounds
let bgMusic = new Audio("./media/cid-le-mdc.mp3");
let hitTopSound = new Audio("./media/tmp8ljn9e7h.mp3");
let hitBottomSound = new Audio("./media/mamta.mp3");
let passSound = new Audio("./media/cid-acp-behn-choo.mp3");
let jump = new Audio("./media/1-108.mp3")

// 🖼️ hit images
let hitTopImg = new Image();
let hitBottomImg = new Image();
hitTopImg.src = "./media/tata.jpg";
hitBottomImg.src = "./media/hamba.avif";

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardheight;
  board.width = boardwidth;
  context = board.getContext("2d");

  modi_img = new Image();
  modi_img.src = "./media/bird1.png";

  toppipeimg = new Image();
  toppipeimg.src = "https://th.bing.com/th/id/OIP.AYgp2lMVKQY7I8YQ_Ksh6QHaNH?w=115&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3";
  bottompipeimg = new Image();
  bottompipeimg.src = "https://www.bing.com/th/id/OIP.0zwIYeR8sWjeU1t3BVj41QHaJQ?w=179&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2";

  document.addEventListener("click", startMusic, { once: true });
  document.addEventListener("keydown", startMusic, { once: true });

  requestAnimationFrame(update);
  setInterval(placepipes, 1500);

  document.addEventListener("keydown", movebird);
  document.addEventListener("mousedown", (e) => {
    if (e.button === 0) velocitY = -2.7;
    jump.play()
  });

  // restart button setup
  const restartBtn = document.getElementById("restartBtn");
  restartBtn.addEventListener("click", restartGame);
};

function startMusic() {
  bgMusic.loop = true;
  bgMusic.play();
}

function update() {
  requestAnimationFrame(update);

  // clear frame
  context.clearRect(0, 0, board.width, board.height);

  if (gameover) {
    
    // Draw final state
    for (let pipe of pipearray) {
      context.fillStyle = "green";
      context.fillText(`score :${score} `, 5, 45);
      context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }
    context.drawImage(modi_img, bird.x, bird.y, bird.width, bird.height);

    // 🖼️ Draw hit image *on top*
    if (hitImageToShow) {
      context.drawImage(hitImageToShow.img, hitImageToShow.x, hitImageToShow.y, 100, 100);
    }

    // show restart text
    context.fillStyle = "red";
    context.font = "30px sans-serif";
    context.fillText("GAME OVER", 80, 200);
    context.fillText(`highscore :${highscore}`, 80, 150);
    document.getElementById("restartBtn").style.display = "block";
    return;
  }

  // gravity and movement
  velocitY += gravity;
  bird.y = Math.max(bird.y + velocitY, 0);
  context.drawImage(modi_img, bird.x, bird.y, bird.width, bird.height);

  for (let i = 0; i < pipearray.length; i++) {
    let pipe = pipearray[i];
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    pipe.x += velocityX;

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      if(highscore<score){
        highscore = score;
      }
      passSound.play();
      pipe.passed = true;
    }

    if (detectcollision(bird, pipe)) {
      gameover = true;
      passSound.pause()
      bgMusic.pause();
      bgMusic.currentTime = 0;

      if (pipe.img === toppipeimg) {
        hitTopSound.play();
        hitImageToShow = { img: hitTopImg, x: bird.x - 20, y: bird.y - 50 };
      } else {
        hitBottomSound.play();
        hitImageToShow = { img: hitBottomImg, x: bird.x - 20, y: bird.y };
      }
    }
  }

  // ground hit
  if (bird.y > board.height) {
    gameover = true;
    bgMusic.pause();
    hitBottomSound.play();
    hitImageToShow = { img: hitBottomImg, x: bird.x - 20, y: board.height - 100 };
  }

  // remove old pipes
  while (pipearray.length > 0 && pipearray[0].x < -pipewidth) {
    pipearray.shift();
  }

  // score
  context.fillStyle = "green";
  context.font = "25px sans-serif";
  context.fillText(`score :${score} `, 5, 45);
}

function placepipes() {
  if (gameover) return;
  let randompipeY = pipeY - pipeheight / 4 - Math.random() * (pipeheight / 2);
  let openingspace = board.height / 4;

  let toppipe = {
    img: toppipeimg,
    x: pipeX,
    y: randompipeY,
    width: pipewidth,
    height: pipeheight,
    passed: false,
  };
  pipearray.push(toppipe);

  let bottompipe = {
    img: bottompipeimg,
    x: pipeX,
    y: randompipeY + pipeheight + openingspace - 20,
    width: pipewidth,
    height: pipeheight,
    passed: false,
  };
  pipearray.push(bottompipe);
}

function movebird(e) {
  if (e.code == "Space" || e.code == "ArrowUp"){
  velocitY = -6;
  jump.play()
  }
}

function detectcollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function restartGame() {
  gameover = false;
  score = 0;
  velocitY = 0;
  bird.y = birdY;
  pipearray = [];
  hitImageToShow = null;
  document.getElementById("restartBtn").style.display = "none";
  bgMusic.currentTime = 0;
  bgMusic.play();
   hitTopSound.pause();
  hitBottomSound.pause();
  hitTopSound.currentTime = 0;
  hitBottomSound.currentTime = 0;
}
