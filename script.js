'use strict';

// PERSONALIZACIÓN: Puedes cambiar las cinco canciones y los mensajes desde aquí.
// Los cinco MP3 ya están incluidos en assets/musica/.
const tracks = [
  {title:"Can't Help Falling in Love", file:'assets/musica/01_cant_help_falling_in_love.mp3'},
  {title:'Amor de Cine', file:'assets/musica/02_amor_de_cine.mp3'},
  {title:'Mujer de Rizos', file:'assets/musica/03_mujer_de_rizos.mp3'},
  {title:'Morfina', file:'assets/musica/04_morfina.mp3'},
  {title:'Always Love', file:'assets/musica/05_always_love.mp3'}
];
const reasons = [
  'Porque contigo hasta los días normales se sienten especiales.',
  'Porque tu sonrisa tiene una forma muy bonita de iluminar mi mundo.',
  'Porque me haces sentir afortunado de compartir esta historia contigo.',
  'Porque cada conversación contigo se convierte en un recuerdo que guardo.',
  'Porque eres mi lugar bonito, incluso desde lejos.',
  'Porque me encanta descubrir cada pequeño detalle de ti.',
  'Porque contigo aprendí a querer también los instantes sencillos.',
  'Porque, entre tantas posibilidades, mi corazón te sigue eligiendo.'
];
const flowers = [
  {name:'Tu sonrisa', message:'Tu sonrisa es de esas cosas que podría admirar mil veces.', color:'#f5a3c3'},
  {name:'Tu ternura', message:'Tu ternura hace que el mundo se sienta más suave.', color:'#d0a3f4'},
  {name:'Tu forma de ser', message:'No cambiaría esa forma tan tuya de existir.', color:'#f6c18d'},
  {name:'Nuestras risas', message:'Ojalá nunca nos falten razones para reír juntos.', color:'#f2b4d4'},
  {name:'Tu compañía', message:'Hasta el silencio se siente lindo cuando estás conmigo.', color:'#b2cfef'},
  {name:'Lo que aprendemos', message:'Quiero seguir aprendiendo a quererte cada día mejor.', color:'#ecd3a2'},
  {name:'Nuestros sueños', message:'Me emociona pensar en todo lo que nos falta vivir.', color:'#c5bcf8'},
  {name:'Nuestro amor', message:'Ocho meses después, mi respuesta sigue siendo tú.', color:'#f6a8b6'}
];
const letterText = `Mi amor:\n\nHoy cumplimos ocho meses, y me gusta pensar en todo lo que significa poder decir “nosotros”. No necesito que cada día sea perfecto para saber lo especial que es compartir mi vida contigo. A veces basta una conversación, un mensaje tuyo o simplemente pensar en ti para sonreír sin darme cuenta.\n\nGracias por cada momento, por tu cariño, por las risas y por cada pequeño detalle que hemos ido guardando en nuestra historia. Me encanta lo que somos, y también me emociona imaginar todo lo bonito que todavía podemos construir.\n\nSi pudiera pedirle algo al tiempo, le pediría que nos regalara muchos días más para seguir conociéndonos, cuidándonos y eligiéndonos. Feliz octavo mes, mi vida. Te quiero muchísimo, más de lo que estas palabras alcanzan a contar.`;

const $ = (selector) => document.querySelector(selector);
const scenes = Array.from(document.querySelectorAll('.scene'));
let currentScene = 0;
let selectedTrack = 0;
let heartFound = new Set();
let flowerFound = new Set();
let audioUnlocked = false; // El navegador ya permitió escuchar música.
let musicWanted = true; // Solo se desactiva si alguien pulsa "Pausar".
let playbackRequest = 0; // Evita mensajes desactualizados si se cambia rápido de escena.
let letterInterval = null;
let letterIndex = 0;
const player = $('#music-audio');
player.volume = .55;

// Fondo estrellado creado con CSS, sin fotografías ni recursos externos.
function makeStars() {
  const sky = $('#sky');
  for (let i = 0; i < 95; i++) {
    const star = document.createElement('span');
    star.className = 'sky-dot';
    star.style.left = `${(i * 61.733 + 17) % 100}%`;
    star.style.top = `${(i * 37.921 + 9) % 100}%`;
    const size = i % 11 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty('--opacity', `${.18 + (i % 8) * .08}`);
    star.style.setProperty('--duration', `${2.7 + (i % 7) * .65}s`);
    star.style.animationDelay = `${(i % 13) * -.51}s`;
    sky.appendChild(star);
  }
}

function showScene(index) {
  currentScene = index;
  scenes.forEach((scene,i) => {
    const active = i === index;
    scene.hidden = !active;
    scene.classList.toggle('active',active);
  });
  $('#chapter-count').textContent = `${String(index+1).padStart(2,'0')} / 05`;
  $('#progress-fill').style.width = `${(index+1)*20}%`;
  $('#progress-track').setAttribute('aria-valuenow',String(index+1));
  setTrack(index);
  window.scrollTo({top:0,behavior:'instant'});
  if (index === 1) { createHearts(); requestAnimationFrame(()=>$('#playfield').focus({preventScroll:true})); }
  if (index === 2) createFlowers();
  if (index === 3) startLetter();
  if (index === 4) makeConfetti(34);
}

// Reproductor: intenta empezar al abrir la página (si el navegador lo permite).
// Si el navegador impide la reproducción automática con sonido, el botón
// «Comenzar nuestra aventura» la activa con la primera interacción válida.
// Los cinco archivos MP3 están incluidos en este proyecto.
function renderTracks() {
  $('#track-list').innerHTML = tracks.map((track,i) => `<button type="button" class="track-item ${i===selectedTrack?'active':''}" data-track="${i}"><span>${String(i+1).padStart(2,'0')}</span>${track.title.replaceAll('&','&amp;').replaceAll('<','&lt;')}</button>`).join('');
  $('#track-list').querySelectorAll('[data-track]').forEach(button => button.addEventListener('click',()=>{
    setTrack(Number(button.dataset.track), false);
    void playAudio();
  }));
}
function setTrack(index, autoContinue = true) {
  if (selectedTrack === index && player.getAttribute('src')) return;
  playbackRequest++;
  selectedTrack = index;
  player.pause();
  player.src = tracks[index].file;
  player.load();
  $('#music-current').textContent = tracks[index].title;
  $('#music-message').textContent = audioUnlocked
    ? `Preparando: ${tracks[index].title} ♡`
    : 'La música empezará al comenzar la aventura ♡';
  $('#music-play').textContent = '▶ Reproducir';
  renderTracks();
  // Una vez que el usuario habilitó el audio, los cambios de capítulo
  // empiezan su canción correspondiente automáticamente.
  if (autoContinue && audioUnlocked && musicWanted) void playAudio();
}
async function playAudio() {
  musicWanted = true;
  const request = ++playbackRequest;
  try {
    await player.play();
    if (request !== playbackRequest) return;
    audioUnlocked = true;
    $('#music-message').textContent = `Sonando: ${tracks[selectedTrack].title} ♡`;
    $('#music-play').textContent = 'Ⅱ Pausar';
    $('#music-icon').textContent = '♫';
  } catch (error) {
    if (request !== playbackRequest || error?.name === 'AbortError') return;
    $('#music-play').textContent = '▶ Reproducir';
    if (error?.name === 'NotAllowedError') {
      $('#music-message').textContent = 'Pulsa «Comenzar nuestra aventura» para activar la música. Los navegadores bloquean el sonido automático antes de tocar la página.';
    } else {
      $('#music-message').textContent = 'No se pudo reproducir esta canción. Comprueba que descomprimiste la carpeta completa, incluyendo assets/musica.';
    }
  }
}
function pauseAudio() {
  musicWanted = false;
  playbackRequest++;
  player.pause();
  $('#music-play').textContent = '▶ Reproducir';
  $('#music-message').textContent = 'Música en pausa. Puedes reanudarla cuando quieras.';
}
$('#music-toggle').addEventListener('click',()=>{
  const open = !$('#music-panel').classList.toggle('hidden');
  $('#music-toggle').setAttribute('aria-expanded',String(open));
});
$('#music-close').addEventListener('click',()=>{
  $('#music-panel').classList.add('hidden');
  $('#music-toggle').setAttribute('aria-expanded','false');
});
$('#music-play').addEventListener('click',()=>{
  if (player.paused) void playAudio();
  else pauseAudio();
});
$('#music-volume').addEventListener('input',event=>{player.volume = Number(event.target.value)});
player.addEventListener('error',()=>{
  // Si falta el archivo, se muestra una ayuda incluso cuando el navegador
  // ya permitió el audio, en lugar de aparentar que hay música sonando.
  $('#music-message').textContent = `No se encuentra «${tracks[selectedTrack].title}». Coloca el archivo MP3 indicado en assets/musica/.`;
  $('#music-play').textContent = '▶ Reproducir';
});
$('#brand').addEventListener('click',event=>{event.preventDefault();showScene(0)});
$('#begin-button').addEventListener('click',()=>{
  showScene(1);
  // Este play() se ejecuta en el clic de la persona: funciona en Chrome,
  // Edge, Firefox y navegadores móviles, siempre que exista el MP3.
  if (musicWanted && player.paused) void playAudio();
});

// Minijuego de recuerdos: tocar corazones o acercarse con el personaje.
const positions = [[16,65],[27,30],[43,70],[58,25],[72,55],[85,23],[40,18],[89,73]];
const hero = {x:10,y:65};
const heldDirections = new Set();
let previousFrameTime = null;
let popTimer = null;
function createHearts() {
  if ($('#playfield').querySelector('.collect-heart')) return;
  positions.forEach(([x,y],i)=>{
    const button = document.createElement('button');
    button.className = 'collect-heart';
    button.type = 'button';
    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.textContent='♥';
    button.setAttribute('aria-label',`Recoger corazón ${i+1}`);
    button.addEventListener('click',()=>collectHeart(i));
    button.dataset.heart = i;
    $('#playfield').appendChild(button);
  });
  renderCharacter();
}
function renderCharacter(){ $('#game-character').style.left = `${hero.x}%`;$('#game-character').style.top = `${hero.y}%`; }
function collectHeart(i) {
  if (heartFound.has(i)) return;
  heartFound.add(i);
  const element = $(`[data-heart="${i}"]`);
  if (element) {element.classList.add('collected');element.disabled = true;}
  $('#heart-count').textContent=`${heartFound.size} / 8`;
  const pop = $('#memory-pop');
  pop.textContent = `♡ ${reasons[i]}`;
  pop.hidden = false;
  clearTimeout(popTimer);
  popTimer = setTimeout(()=>{pop.hidden=true},3400);
  makeConfetti(6);
  if (heartFound.size === 8){
    const next = $('#garden-next');
    next.disabled = false;
    next.textContent = 'Descubrir nuestro jardín ❀';
  }
}
function tick(time) {
  if (previousFrameTime === null) previousFrameTime = time;
  const dt = Math.min((time-previousFrameTime)/1000,.06);
  previousFrameTime = time;
  if (currentScene === 1 && heldDirections.size) {
    const speed=34;
    let dx=0,dy=0;
    if (heldDirections.has('left')) dx--;
    if (heldDirections.has('right')) dx++;
    if (heldDirections.has('up')) dy--;
    if (heldDirections.has('down')) dy++;
    const length=Math.hypot(dx,dy)||1;
    hero.x=Math.max(4,Math.min(96,hero.x+dx/length*speed*dt));
    hero.y=Math.max(9,Math.min(86,hero.y+dy/length*speed*dt));
    renderCharacter();
    positions.forEach(([x,y],i)=>{if (!heartFound.has(i) && Math.hypot((x-hero.x)*1.4,y-hero.y) < 9) collectHeart(i)});
  }
  requestAnimationFrame(tick);
}
const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right',W:'up',A:'left',S:'down',D:'right'};
window.addEventListener('keydown',event=>{
  if (currentScene !== 1 || !keyMap[event.key]) return;
  if (event.target && ['INPUT','TEXTAREA'].includes(event.target.tagName)) return;
  event.preventDefault();
  heldDirections.add(keyMap[event.key]);
});
window.addEventListener('keyup',event=>{if(keyMap[event.key]) heldDirections.delete(keyMap[event.key])});
window.addEventListener('blur',()=>heldDirections.clear());
document.querySelectorAll('[data-direction]').forEach(button=>{
  const direction=button.dataset.direction;
  button.addEventListener('pointerdown',event=>{event.preventDefault();heldDirections.add(direction);button.setPointerCapture(event.pointerId)});
  for(const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name,()=>heldDirections.delete(direction));
});
$('#garden-next').addEventListener('click',()=>{if(heartFound.size === 8)showScene(2)});

// Jardín 2D animado, enteramente dibujado con CSS.
function createFlowers() {
  if ($('#flower-grid').children.length) return;
  flowers.forEach((flower,i)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='flower-card';
    button.setAttribute('aria-label',`Hacer florecer ${flower.name}`);
    button.style.setProperty('--flower-color',flower.color);
    const petals=Array.from({length:7},(_,p)=>`<span class="petal" style="--petal-angle:${p*360/7}deg"></span>`).join('');
    button.innerHTML=`<div class="flower-visual"><span class="stem"></span><span class="leaf"></span><span class="leaf leaf-right"></span><span class="bud"></span>${petals}<span class="flower-center"></span><span class="flower-pot"></span></div><small>Mes ${i+1} · ${flower.name}</small>`;
    button.addEventListener('click',()=>{
      button.classList.add('bloomed');
      flowerFound.add(i);
      $('#flower-count').textContent=`${flowerFound.size} de 8`;
      $('#garden-message').textContent=`❀ ${flower.message}`;
      makeConfetti(5);
      if (flowerFound.size===8){const next=$('#letter-next');next.disabled=false;next.textContent='Leer la carta que hice para ti ♡';}
    });
    $('#flower-grid').appendChild(button);
  });
}
$('#letter-next').addEventListener('click',()=>{if(flowerFound.size===8)showScene(3)});

// Carta animada: el texto también es legible sin esperar usando el botón Mostrar carta completa.
function startLetter() {
  clearInterval(letterInterval);
  const el=$('#letter-content');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=letterText;letterIndex=letterText.length;return}
  el.textContent='';letterIndex=0;
  letterInterval=setInterval(()=>{
    letterIndex=Math.min(letterText.length,letterIndex+3);
    el.textContent=letterText.slice(0,letterIndex);
    if(letterIndex>=letterText.length) clearInterval(letterInterval);
  },23);
}
$('#letter-reveal').addEventListener('click',()=>{clearInterval(letterInterval);$('#letter-content').textContent=letterText;letterIndex=letterText.length});
$('#final-next').addEventListener('click',()=>{clearInterval(letterInterval);showScene(4)});

function makeConfetti(count) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for(let i=0;i<count;i++){
    const dot=document.createElement('span');
    dot.className='float-confetti';
    dot.textContent=['♡','✧','✦','❀'][i%4];
    dot.style.left=`${10+(i*41+Math.random()*16)%80}%`;
    dot.style.top=`${50+(i*17)%36}%`;
    dot.style.setProperty('--dx',`${(i%2?1:-1)*(15+i*5)}px`);
    document.body.appendChild(dot);
    setTimeout(()=>dot.remove(),1500);
  }
}
$('#restart').addEventListener('click',()=>{
  heartFound.clear();flowerFound.clear();
  document.querySelectorAll('.collect-heart').forEach(el=>el.remove());
  $('#flower-grid').innerHTML='';
  hero.x=10;hero.y=65;
  $('#heart-count').textContent='0 / 8';
  $('#flower-count').textContent='0 de 8';
  $('#garden-message').textContent='Cada flor está esperando un poquito de tu magia ✨';
  $('#garden-next').disabled=true;
  $('#garden-next').textContent='Encuentra los ocho corazones ♡';
  $('#letter-next').disabled=true;
  $('#letter-next').textContent='Haz florecer las ocho flores ❀';
  $('#memory-pop').hidden=true;
  heldDirections.clear();
  showScene(0);
});

makeStars();
renderTracks();
setTrack(0);
requestAnimationFrame(tick);
// Prueba autoplay con sonido al abrir. Si el navegador lo bloquea, no se
// insiste sin interacción: el botón «Comenzar» lo activará normalmente.
void playAudio();
