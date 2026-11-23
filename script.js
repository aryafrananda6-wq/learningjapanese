// Nihongo Japanese Learning — seluruh fitur berjalan di browser tanpa backend.
const $ = (id) => document.getElementById(id);
const hiragana = [
 ['あ','a'],['い','i'],['う','u'],['え','e'],['お','o'],['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko'],
 ['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so'],['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to'],
 ['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no'],['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho'],
 ['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo'],['や','ya'],['ゆ','yu'],['よ','yo'],
 ['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro'],['わ','wa'],['を','wo'],['ん','n']
];
const katakana = [
 ['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o'],['カ','ka'],['キ','ki'],['ク','ku'],['ケ','ke'],['コ','ko'],
 ['サ','sa'],['シ','shi'],['ス','su'],['セ','se'],['ソ','so'],['タ','ta'],['チ','chi'],['ツ','tsu'],['テ','te'],['ト','to'],
 ['ナ','na'],['ニ','ni'],['ヌ','nu'],['ネ','ne'],['ノ','no'],['ハ','ha'],['ヒ','hi'],['フ','fu'],['ヘ','he'],['ホ','ho'],
 ['マ','ma'],['ミ','mi'],['ム','mu'],['メ','me'],['モ','mo'],['ヤ','ya'],['ユ','yu'],['ヨ','yo'],
 ['ラ','ra'],['リ','ri'],['ル','ru'],['レ','re'],['ロ','ro'],['ワ','wa'],['ヲ','wo'],['ン','n']
];
const vocab = [
 ['こんにちは','konnichiwa','Halo / selamat siang','Salam'],['おはよう','ohayou','Selamat pagi','Salam'],['こんばんは','konbanwa','Selamat malam','Salam'],['ありがとう','arigatou','Terima kasih','Salam'],['すみません','sumimasen','Permisi / maaf','Salam'],['さようなら','sayounara','Selamat tinggal','Salam'],['はい','hai','Ya','Salam'],['いいえ','iie','Tidak','Salam'],
 ['水','mizu','Air','Makanan'],['ご飯','gohan','Nasi / makanan','Makanan'],['パン','pan','Roti','Makanan'],['りんご','ringo','Apel','Makanan'],['お茶','ocha','Teh','Makanan'],['魚','sakana','Ikan','Hewan'],['肉','niku','Daging','Makanan'],['卵','tamago','Telur','Makanan'],
 ['猫','neko','Kucing','Hewan'],['犬','inu','Anjing','Hewan'],['鳥','tori','Burung','Hewan'],['馬','uma','Kuda','Hewan'],['学校','gakkou','Sekolah','Tempat'],['家','ie','Rumah','Tempat'],['駅','eki','Stasiun','Tempat'],['店','mise','Toko','Tempat'],
 ['本','hon','Buku','Benda'],['車','kuruma','Mobil','Benda'],['時計','tokei','Jam','Benda'],['電話','denwa','Telepon','Benda'],['友達','tomodachi','Teman','Orang'],['先生','sensei','Guru','Orang'],['学生','gakusei','Murid / mahasiswa','Orang'],['家族','kazoku','Keluarga','Orang'],
 ['一','ichi','Satu','Angka'],['二','ni','Dua','Angka'],['三','san','Tiga','Angka'],['四','yon','Empat','Angka'],['五','go','Lima','Angka'],['今日','kyou','Hari ini','Waktu'],['明日','ashita','Besok','Waktu'],['昨日','kinou','Kemarin','Waktu']
];
const grammar = [
 ['は','Penanda topik','Menandai topik utama yang sedang dibicarakan. Dalam pengucapan sebagai partikel dibaca “wa”.','私は学生です。','Watashi wa gakusei desu. — Saya adalah pelajar.'],
 ['が','Penanda subjek','Menandai subjek atau informasi yang ingin ditekankan.','猫がいます。','Neko ga imasu. — Ada kucing.'],
 ['を','Penanda objek','Menandai objek langsung dari suatu tindakan. Dibaca “o”.','水を飲みます。','Mizu o nomimasu. — Saya minum air.'],
 ['に','Arah / waktu / tujuan','Dapat menandai waktu tertentu, tujuan, atau lokasi keberadaan.','七時に起きます。','Shichi-ji ni okimasu. — Saya bangun pukul tujuh.'],
 ['です','Kopula sopan','Digunakan untuk menyatakan “adalah” dalam kalimat sopan.','これは本です。','Kore wa hon desu. — Ini adalah buku.'],
 ['ます','Akhiran sopan','Akhiran kata kerja bentuk sopan untuk menyatakan kegiatan.','毎日勉強します。','Mainichi benkyou shimasu. — Saya belajar setiap hari.']
];
const allChars = [...hiragana.map(x=>({...{char:x[0],romaji:x[1],script:'Hiragana'}})),...katakana.map(x=>({char:x[0],romaji:x[1],script:'Katakana'}))];
let currentScript='hiragana', flashIndex=0, quizQuestions=[], quizIndex=0, quizScore=0, quizLocked=false, quizScript='hiragana';
let listeningQuestions=[], listeningIndex=0, listeningLocked=false, matchSelected=null, matchMoves=0, matchFound=0;
let timerSeconds=0,timerInterval=null, timerRunning=false;
let jlptQuestions=[], jlptIndex=0, jlptCorrect=0, jlptLocked=false;
let sentenceIndex=0, sentenceScript='hiragana', sentenceSelected=[];
const todayKey = new Date().toLocaleDateString('en-CA');
const readStore=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}};
const writeStore=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
function speak(text){if(!('speechSynthesis'in window)){alert('Browser ini belum mendukung audio pengucapan.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.82;const voices=speechSynthesis.getVoices();const jp=voices.find(v=>v.lang.toLowerCase().startsWith('ja'));if(jp)u.voice=jp;speechSynthesis.speak(u)}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

// Mobile navigation and theme
$('menuToggle').addEventListener('click',()=>$('mainNav').classList.toggle('open'));
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('mainNav').classList.remove('open')));
function applyTheme(){const dark=localStorage.getItem('nihongo-theme')==='dark';document.body.classList.toggle('dark',dark);$('themeToggle').textContent=dark?'☀️':'🌙'}
$('themeToggle').addEventListener('click',()=>{localStorage.setItem('nihongo-theme',document.body.classList.contains('dark')?'light':'dark');applyTheme()});applyTheme();

// Character grid and flashcards
function renderCharacters(){const list=currentScript==='hiragana'?hiragana:katakana;const q=$('characterSearch').value.trim().toLowerCase();const filtered=list.filter(([c,r])=>c.includes(q)||r.includes(q));$('characterCount').textContent=`${filtered.length} dari ${list.length} huruf`; $('characterGrid').innerHTML=filtered.map(([c,r])=>`<button class="char-card" data-char="${c}" data-romaji="${r}"><strong>${c}</strong><span>${r}</span></button>`).join('')||'<div class="empty-state">Huruf tidak ditemukan.</div>';document.querySelectorAll('.char-card').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.char)))}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentScript=b.dataset.script;renderCharacters()}));
$('characterSearch').addEventListener('input',renderCharacters);renderCharacters();
function currentFlashList(){return currentScript==='hiragana'?hiragana:katakana}
function renderFlash(){const item=currentFlashList()[flashIndex%currentFlashList().length];$('flashChar').textContent=item[0];$('flashBackChar').textContent=item[0];$('flashRomaji').textContent=item[1];$('flashScript').textContent=currentScript.toUpperCase();$('flashcard').classList.remove('flipped')}
$('flashcard').addEventListener('click',()=>$('flashcard').classList.toggle('flipped'));$('flashcard').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('flashcard').classList.toggle('flipped')}});
$('flashPrev').addEventListener('click',()=>{flashIndex=(flashIndex-1+currentFlashList().length)%currentFlashList().length;renderFlash()});
$('flashNext').addEventListener('click',()=>{flashIndex=(flashIndex+1)%currentFlashList().length;renderFlash()});
$('flashSpeak').addEventListener('click',()=>speak($('flashChar').textContent));
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{flashIndex=0;renderFlash()}));renderFlash();

// Daily word
function renderDailyWord(){const dayNumber=Math.floor(new Date(new Date().toDateString()).getTime()/86400000);const item=vocab[dayNumber%vocab.length];$('dailyWord').textContent=item[0];$('dailyRomaji').textContent=item[1];$('dailyMeaning').textContent=item[2];$('dailyCategory').textContent=`Kategori: ${item[3]}`;$('dailyAudio').onclick=()=>speak(item[0])}renderDailyWord();

// Vocabulary
const cats=['Semua',...new Set(vocab.map(v=>v[3]))];cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c==='Semua'?'Semua kategori':c;$('vocabCategory').appendChild(o)});
function renderVocab(){const cat=$('vocabCategory').value,q=$('vocabSearch').value.toLowerCase();const rows=vocab.filter(v=>(cat==='Semua'||v[3]===cat)&&v.join(' ').toLowerCase().includes(q));$('vocabGrid').innerHTML=rows.map(v=>`<article class="vocab-card"><div><div class="jp">${escapeHTML(v[0])}</div><h3>${escapeHTML(v[2])}</h3><p>${escapeHTML(v[1])} · ${escapeHTML(v[3])}</p></div><button aria-label="Dengarkan ${escapeHTML(v[0])}" data-say="${escapeHTML(v[0])}">🔊</button></article>`).join('')||'<div class="empty-state">Kosakata tidak ditemukan.</div>';document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.say)))}
$('vocabCategory').addEventListener('change',renderVocab);$('vocabSearch').addEventListener('input',renderVocab);renderVocab();

// Grammar cards
$('grammarGrid').innerHTML=grammar.map(g=>`<article class="grammar-card"><div class="grammar-symbol">${g[0]}</div><h3>${g[1]}</h3><p>${g[2]}</p><div class="grammar-example"><strong>${g[3]}</strong>${g[4]}</div><button class="btn ghost small grammar-audio" data-say="${g[3]}">🔊 Dengarkan contoh</button></article>`).join('');
document.querySelectorAll('.grammar-audio').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.say)));

// Dictionary
function renderDictionary(){const q=$('dictionarySearch').value.trim().toLowerCase();const rows=vocab.filter(v=>!q||v.some(x=>x.toLowerCase().includes(q)));$('dictionaryResults').innerHTML=rows.slice(0,40).map(v=>`<div class="dictionary-item"><div><strong>${escapeHTML(v[0])}</strong><small>${escapeHTML(v[1])} · ${escapeHTML(v[3])}</small></div><span>${escapeHTML(v[2])}</span><button class="audio-btn" data-dict-say="${escapeHTML(v[0])}">🔊</button></div>`).join('')||'<div class="empty-state">Tidak ada kata yang cocok. Coba kata lain.</div>';document.querySelectorAll('[data-dict-say]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.dictSay)))}
$('dictionarySearch').addEventListener('input',renderDictionary);$('dictionaryClear').addEventListener('click',()=>{$('dictionarySearch').value='';renderDictionary()});renderDictionary();

// Daily target and study timer. Time counts only while the timer is running.
function getTodayStudy(){const data=readStore('nihongo-study',{});return data[todayKey]||0}
function setTodayStudy(seconds){const data=readStore('nihongo-study',{});data[todayKey]=seconds;writeStore('nihongo-study',data)}
function getGoal(){return Number(localStorage.getItem('nihongo-goal')||20)}
function renderGoal(){const mins=Math.floor(getTodayStudy()/60),goal=getGoal(),pct=Math.min(100,Math.round(mins/goal*100));$('goalTarget').textContent=goal;$('goalInput').value=goal;$('goalProgress').textContent=mins;$('goalPercent').textContent=pct+'%';$('goalBar').style.width=pct+'%';$('goalMessage').textContent=pct>=100?'Hebat! Target harianmu tercapai 🎉':'Ayo lanjutkan belajar untuk mencapai target hari ini!';$('todayStudy').textContent=mins+' menit'}
function formatTime(sec){const h=String(Math.floor(sec/3600)).padStart(2,'0'),m=String(Math.floor(sec%3600/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');return `${h}:${m}:${s}`}
function renderTimer(){$('timerDisplay').textContent=formatTime(timerSeconds)}
$('saveGoal').addEventListener('click',()=>{const n=Math.max(5,Math.min(600,Number($('goalInput').value)||20));localStorage.setItem('nihongo-goal',n);renderGoal()});
function stopStudyTimer(){
  if(timerInterval!==null){clearInterval(timerInterval);timerInterval=null;}
  timerRunning=false;
}
$('timerStart').addEventListener('click',()=>{
  if(timerRunning)return;
  timerRunning=true;
  timerInterval=setInterval(()=>{
    timerSeconds+=1;
    setTodayStudy(getTodayStudy()+1);
    if(timerSeconds%5===0)renderGoal();
    renderTimer();
  },1000);
});
$('timerPause').addEventListener('click',()=>{
  // Jeda menghentikan interval saja; waktu sesi tidak dihapus.
  stopStudyTimer();
  renderTimer();
  renderGoal();
});
$('timerReset').addEventListener('click',()=>{
  // Reset mengakhiri sesi dan mengosongkan tampilan timer, bukan progres harian.
  stopStudyTimer();
  timerSeconds=0;
  renderTimer();
  renderGoal();
});
renderGoal();renderTimer();

// Writing canvas
const canvas=$('writingCanvas'),ctx=canvas.getContext('2d');let drawing=false;
function setupCanvas(){ctx.lineWidth=8;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#6754d9'}
function pointerPos(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture(e.pointerId);const p=pointerPos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=pointerPos(e);ctx.lineTo(p.x,p.y);ctx.stroke()});
['pointerup','pointercancel','pointerleave'].forEach(ev=>canvas.addEventListener(ev,()=>drawing=false));
function updateWritingOptions(){const list=$('writingScript').value==='hiragana'?hiragana:katakana;$('writingCharacter').innerHTML=list.map(x=>`<option value="${x[0]}">${x[0]} — ${x[1]}</option>`).join('');$('writingGuide').textContent=$('writingCharacter').value}
$('writingScript').addEventListener('change',updateWritingOptions);$('writingCharacter').addEventListener('change',()=>$('writingGuide').textContent=$('writingCharacter').value);$('showWritingGuide').addEventListener('click',()=>$('writingGuide').classList.toggle('hidden'));$('clearCanvas').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));updateWritingOptions();setupCanvas();
function openPanel(id){document.querySelectorAll('.exercise-panel').forEach(p=>p.classList.add('hidden'));$(id).classList.remove('hidden');$(id).scrollIntoView({behavior:'smooth',block:'center'})}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).classList.add('hidden')));
$('openWriting').addEventListener('click',()=>openPanel('writingPanel'));

// Listening test
function makeListening(){listeningQuestions=shuffle(allChars).slice(0,10);listeningIndex=0;listeningLocked=false;renderListening()}
function renderListening(){const q=listeningQuestions[listeningIndex];$('listenCount').textContent=`Soal ${listeningIndex+1}/10`;const options=shuffle([q.romaji,...shuffle(allChars.filter(x=>x.romaji!==q.romaji)).slice(0,3).map(x=>x.romaji)]);$('listenOptions').innerHTML=options.map(o=>`<button class="option-btn" data-answer="${o}">${o}</button>`).join('');$('listenFeedback').textContent='';$('listenNext').disabled=true;$('listenNext').textContent=listeningIndex===9?'Selesai':'Berikutnya';document.querySelectorAll('#listenOptions button').forEach(b=>b.addEventListener('click',()=>{if(listeningLocked)return;listeningLocked=true;const ok=b.dataset.answer===q.romaji;b.classList.add(ok?'correct':'wrong');if(!ok)document.querySelector(`#listenOptions [data-answer="${q.romaji}"]`).classList.add('correct');$('listenFeedback').textContent=ok?'Benar! Bagus sekali.':`Belum tepat. Jawaban: ${q.romaji}`;$('listenNext').disabled=false}))}
$('listenPlay').addEventListener('click',()=>speak(listeningQuestions[listeningIndex]?.char||'あ'));
$('startListening').addEventListener('click',()=>{makeListening();openPanel('listeningPanel');setTimeout(()=>$('listenPlay').click(),250)});
$('listenNext').addEventListener('click',()=>{if(listeningIndex<9){listeningIndex++;listeningLocked=false;renderListening()}else{$('listenFeedback').textContent='Listening test selesai! Coba lagi untuk berlatih.';$('listenNext').disabled=true;$('listenNext').textContent='Selesai'}});

// Matching game
function startMatching(){const selected=shuffle(allChars).slice(0,6);const tiles=shuffle([...selected.map(x=>({text:x.char,type:'jp',pair:x.romaji})),...selected.map(x=>({text:x.romaji,type:'romaji',pair:x.romaji}))]);matchSelected=null;matchMoves=0;matchFound=0;$('matchMoves').textContent='0';$('matchPairs').textContent='0/6';$('matchFeedback').textContent='';$('matchGrid').innerHTML=tiles.map((t,i)=>`<button class="match-tile ${t.type==='jp'?'jp':''}" data-index="${i}" data-pair="${t.pair}" data-type="${t.type}">${t.text}</button>`).join('');document.querySelectorAll('.match-tile').forEach(b=>b.addEventListener('click',()=>selectMatch(b)))}
function selectMatch(btn){if(btn.classList.contains('matched')||btn===matchSelected)return;if(!matchSelected){matchSelected=btn;btn.classList.add('selected');return}matchMoves++;$('matchMoves').textContent=matchMoves;const first=matchSelected;const match=first.dataset.pair===btn.dataset.pair&&first.dataset.type!==btn.dataset.type;first.classList.remove('selected');if(match){first.classList.add('matched');btn.classList.add('matched');matchFound++;$('matchPairs').textContent=`${matchFound}/6`;if(matchFound===6)$('matchFeedback').textContent=`Selesai! Kamu menemukan semua pasangan dalam ${matchMoves} langkah.`}else{$('matchFeedback').textContent='Belum cocok, coba lagi.';first.classList.add('selected');setTimeout(()=>first.classList.remove('selected'),500)}matchSelected=null}
$('startMatching').addEventListener('click',()=>{startMatching();openPanel('matchingPanel')});$('restartMatching').addEventListener('click',startMatching);

// Quiz and history
function getHistory(){return readStore('nihongo-history',[])}
function renderStats(){const h=getHistory();$('statAttempts').textContent=h.length;$('statBest').textContent=h.length?Math.max(...h.map(x=>x.score)):0;$('statAverage').textContent=h.length?Math.round(h.reduce((s,x)=>s+x.score,0)/h.length):0;$('statCorrect').textContent=h.reduce((s,x)=>s+x.correct,0);$('quizHistory').innerHTML=h.length? h.slice(0,5).map(x=>`<div class="history-item"><span>${escapeHTML(x.date)}</span><strong>${x.script?x.script.toUpperCase()+' · ':''}${x.score}/100 · ${x.correct}/${x.total||20} benar</strong></div>`).join(''):'<p class="muted">Belum ada riwayat kuis.</p>'}
function startQuiz(script){if(!script){$('quizSetup').classList.remove('hidden');$('quizContent').classList.add('hidden');$('quizResult').classList.add('hidden');openPanel('quizPanel');return}quizScript=script;const source=script==='hiragana'?hiragana:katakana;quizQuestions=shuffle(source.map(x=>({char:x[0],romaji:x[1],script}))).slice(0,10);quizIndex=0;quizScore=0;quizLocked=false;$('quizSetup').classList.add('hidden');$('quizContent').classList.remove('hidden');$('quizResult').classList.add('hidden');$('quizPrompt').textContent=`Pilih romaji yang benar untuk huruf ${script==='hiragana'?'Hiragana':'Katakana'} berikut.`;renderQuiz();openPanel('quizPanel')}
function renderQuiz(){const q=quizQuestions[quizIndex];const source=quizScript==='hiragana'?hiragana:katakana;$('quizCounter').textContent=`${quizScript==='hiragana'?'Hiragana':'Katakana'} · Soal ${quizIndex+1}/10`;$('quizScore').textContent=`Nilai: ${quizScore}`;$('quizCharacter').textContent=q.char;$('quizFeedback').textContent='';$('quizStatus').textContent='Pilih satu jawaban';$('quizNext').disabled=true;$('quizNext').textContent=quizIndex===9?'Lihat Hasil':'Berikutnya';const opts=shuffle([q.romaji,...shuffle(source.filter(x=>x[1]!==q.romaji)).slice(0,3).map(x=>x[1])]);$('quizOptions').innerHTML=opts.map(o=>`<button class="option-btn" data-answer="${o}">${o}</button>`).join('');document.querySelectorAll('#quizOptions button').forEach(b=>b.addEventListener('click',()=>{if(quizLocked)return;quizLocked=true;const ok=b.dataset.answer===q.romaji;if(ok)quizScore+=10;b.classList.add(ok?'correct':'wrong');if(!ok)document.querySelector(`#quizOptions [data-answer="${q.romaji}"]`).classList.add('correct');$('quizScore').textContent=`Nilai: ${quizScore}`;$('quizFeedback').textContent=ok?'Benar! +10 poin':`Belum tepat. Huruf ${q.char} dibaca ${q.romaji}. Hafalkan pasangan huruf dan bunyi ini, lalu coba lagi.`;$('quizStatus').textContent=ok?'Jawaban benar':'Jawaban belum tepat';$('quizNext').disabled=false}))}
function finishQuiz(){const h=getHistory();h.unshift({date:new Date().toLocaleString('id-ID'),score:quizScore,correct:quizScore/10,total:10,script:quizScript});writeStore('nihongo-history',h.slice(0,30));$('quizContent').classList.add('hidden');$('quizResult').classList.remove('hidden');$('quizResult').innerHTML=`<span class="eyebrow">HASIL KUIS ${quizScript.toUpperCase()}</span><h3>Kuis selesai!</h3><strong>${quizScore}/100</strong><p>Kamu menjawab benar ${quizScore/10} dari 10 soal ${quizScript}.</p><button class="btn primary" id="quizAgain">Ulangi Kuis</button> <button class="btn secondary" id="quizChoose">Pilih jenis huruf</button>`;$('quizAgain').addEventListener('click',()=>startQuiz(quizScript));$('quizChoose').addEventListener('click',()=>startQuiz());renderStats()}
$('quizNext').addEventListener('click',()=>{if(quizIndex<9){quizIndex++;quizLocked=false;renderQuiz()}else finishQuiz()});
$('startQuiz').addEventListener('click',()=>startQuiz());
document.querySelectorAll('[data-quiz-script]').forEach(b=>b.addEventListener('click',()=>startQuiz(b.dataset.quizScript)));
$('quizBack').addEventListener('click',()=>startQuiz());
$('clearHistory').addEventListener('click',()=>{if(confirm('Hapus semua riwayat kuis?')){writeStore('nihongo-history',[]);renderStats()}});renderStats();

// Sentence builder: latihan dengan pilihan Hiragana atau Katakana.
const sentenceBank=[
 {meaning:'Saya minum air.',romaji:'Watashi wa mizu o nomimasu.',h:['わたし','は','みず','を','のみます'],k:['ワタシ','ハ','ミズ','ヲ','ノミマス'],why:'Pola kalimat dasar Jepang adalah Subjek + は + Objek + を + Kata kerja. は menandai topik, sedangkan を menandai objek.'},
 {meaning:'Kucing makan ikan.',romaji:'Neko wa sakana o tabemasu.',h:['ねこ','は','さかな','を','たべます'],k:['ネコ','ハ','サカナ','ヲ','タベマス'],why:'ねこ (neko) berarti kucing, さかな (sakana) berarti ikan, dan たべます (tabemasu) berarti makan.'},
 {meaning:'Saya pergi ke sekolah.',romaji:'Watashi wa gakkou e ikimasu.',h:['わたし','は','がっこう','へ','いきます'],k:['ワタシ','ハ','ガッコウ','ヘ','イキマス'],why:'へ (e) menunjukkan arah atau tujuan. がっこう berarti sekolah dan いきます berarti pergi.'},
 {meaning:'Ini adalah buku.',romaji:'Kore wa hon desu.',h:['これ','は','ほん','です'],k:['コレ','ハ','ホン','デス'],why:'これ berarti ini, は menandai topik, dan です adalah bentuk sopan yang bermakna “adalah”.'}
];
function renderSentence(){
  const q=sentenceBank[sentenceIndex%sentenceBank.length];
  sentenceSelected=[];
  $('sentenceMeaning').textContent=`Susun kata berikut menjadi: ${q.meaning}`;
  $('sentenceFeedback').textContent='';
  $('sentenceFeedback').style.color='';
  $('sentenceAnswer').innerHTML='<span class="muted">Pilih potongan kata di bawah.</span>';
  const words=sentenceScript==='hiragana'?q.h:q.k;
  const pieces=shuffle(words.map((word,index)=>({word,index})));
  $('sentencePieces').innerHTML=pieces.map(x=>`<button type="button" class="option-btn sentence-piece" data-piece-id="${x.index}">${x.word}</button>`).join('');
  document.querySelectorAll('.sentence-piece').forEach(b=>b.addEventListener('click',()=>{
    const id=Number(b.dataset.pieceId);
    if(sentenceSelected.some(x=>x.id===id))return;
    sentenceSelected.push({id,word:words[id]});
    renderSentenceAnswer();
  }));
}
function renderSentenceAnswer(){
  $('sentenceAnswer').innerHTML=sentenceSelected.length
    ?sentenceSelected.map((x,i)=>`<button type="button" class="option-btn" data-remove="${i}" title="Klik untuk mengembalikan potongan">${x.word}</button>`).join(' ')
    :'<span class="muted">Pilih potongan kata di bawah.</span>';
  document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{
    sentenceSelected.splice(Number(b.dataset.remove),1);
    renderSentenceAnswer();
  }));
  const selectedIds=new Set(sentenceSelected.map(x=>x.id));
  document.querySelectorAll('.sentence-piece').forEach(b=>{
    b.disabled=selectedIds.has(Number(b.dataset.pieceId));
  });
}
$('sentenceScript').addEventListener('change',()=>{sentenceScript=$('sentenceScript').value;renderSentence()});
$('openSentence').addEventListener('click',()=>{sentenceScript=$('sentenceScript').value;renderSentence();openPanel('sentencePanel')});
$('resetSentence').addEventListener('click',renderSentence);
$('nextSentence').addEventListener('click',()=>{sentenceIndex=(sentenceIndex+1)%sentenceBank.length;renderSentence()});
$('checkSentence').addEventListener('click',()=>{
  const q=sentenceBank[sentenceIndex%sentenceBank.length];
  const correct=sentenceScript==='hiragana'?q.h:q.k;
  const answer=sentenceSelected.map(x=>x.word);
  const ok=answer.length===correct.length&&answer.every((word,i)=>word===correct[i]);
  $('sentenceFeedback').textContent=ok
    ?`Benar! ${q.romaji} — ${q.why}`
    :`Belum tepat. Jawaban yang benar: ${correct.join(' ')} (${q.romaji}). Penjelasan: ${q.why}`;
  $('sentenceFeedback').style.color=ok?'#16845b':'#c04b56';
});

// Simulasi JLPT N5: 10 soal, setiap soal bernilai 10 poin dan disertai pembahasan.
const jlptBank=[
 {q:'「みず」の arti adalah …',o:['Air','Api','Buku','Ikan'],a:0,e:'みず (mizu) berarti air.'},
 {q:'「ねこ」 berarti …',o:['Anjing','Kucing','Burung','Kuda'],a:1,e:'ねこ (neko) berarti kucing. Anjing adalah いぬ (inu).'},
 {q:'Pilih partikel untuk menandai topik: わたし ___ がくせいです。',o:['を','に','は','で'],a:2,e:'は (wa) menandai topik. Kalimatnya berarti “Saya adalah pelajar”.'},
 {q:'「ありがとう」 digunakan untuk mengucapkan …',o:['Maaf','Terima kasih','Selamat pagi','Sampai jumpa'],a:1,e:'ありがとう (arigatou) berarti terima kasih.'},
 {q:'Partikel を umumnya menandai …',o:['Objek tindakan','Topik','Waktu','Tempat asal'],a:0,e:'を (o) menandai objek langsung, misalnya みずをのみます (minum air).'},
 {q:'「がっこう」 berarti …',o:['Rumah','Stasiun','Sekolah','Toko'],a:2,e:'がっこう (gakkou) berarti sekolah.'},
 {q:'「おはよう」 adalah salam untuk …',o:['Pagi hari','Siang hari','Malam hari','Perpisahan'],a:0,e:'おはよう (ohayou) berarti selamat pagi.'},
 {q:'Lengkapi: まいにち にほんごを ___。 (Setiap hari belajar bahasa Jepang)',o:['たべます','のみます','べんきょうします','いきます'],a:2,e:'べんきょうします (benkyou shimasu) berarti belajar.'},
 {q:'「ほん」 berarti …',o:['Buku','Mobil','Jam','Telepon'],a:0,e:'ほん (hon) berarti buku.'},
 {q:'Akhiran です biasanya digunakan untuk membuat kalimat …',o:['Kasar','Sopan','Perintah','Negatif saja'],a:1,e:'です (desu) adalah kopula yang umum dipakai dalam pernyataan sopan.'}
];
function beginJLPT(){jlptQuestions=shuffle(jlptBank);jlptIndex=0;jlptCorrect=0;jlptLocked=false;$('jlptIntro').classList.add('hidden');$('jlptResult').classList.add('hidden');$('jlptQuiz').classList.remove('hidden');renderJLPT()}
function renderJLPT(){const q=jlptQuestions[jlptIndex];$('jlptCounter').textContent=`Soal ${jlptIndex+1}/10`;$('jlptScore').textContent=`Benar: ${jlptCorrect} · Nilai sementara: ${jlptCorrect*10}`;$('jlptQuestion').textContent=q.q;$('jlptFeedback').textContent='';$('jlptNext').disabled=true;$('jlptNext').textContent=jlptIndex===9?'Lihat Nilai':'Berikutnya';$('jlptOptions').innerHTML=q.o.map((v,i)=>`<button class="option-btn" data-jlpt="${i}">${v}</button>`).join('');document.querySelectorAll('[data-jlpt]').forEach(b=>b.addEventListener('click',()=>{if(jlptLocked)return;jlptLocked=true;const selected=Number(b.dataset.jlpt),ok=selected===q.a;if(ok)jlptCorrect++;b.classList.add(ok?'correct':'wrong');document.querySelector(`[data-jlpt="${q.a}"]`).classList.add('correct');$('jlptScore').textContent=`Benar: ${jlptCorrect} · Nilai sementara: ${jlptCorrect*10}`;$('jlptFeedback').textContent=`${ok?'Benar!':'Jawaban belum tepat.'} ${q.e}`;$('jlptNext').disabled=false}))}
function finishJLPT(){const score=jlptCorrect*10;const history=getHistory();history.unshift({date:new Date().toLocaleString('id-ID'),score,correct:jlptCorrect,total:10,script:'JLPT N5'});writeStore('nihongo-history',history.slice(0,30));$('jlptQuiz').classList.add('hidden');$('jlptResult').classList.remove('hidden');$('jlptResult').innerHTML=`<span class="eyebrow">HASIL SIMULASI JLPT N5</span><h3>Latihan selesai!</h3><strong>${score}/100</strong><p>Jawaban benar: ${jlptCorrect} dari 10 soal.</p><p>${score>=70?'Bagus! Kamu mencapai nilai latihan 70 atau lebih.': 'Terus berlatih dan pelajari kembali pembahasan setiap soal.'}</p><button class="btn primary" id="jlptRetry">Ulangi 10 Soal</button>`;$('jlptRetry').addEventListener('click',beginJLPT);renderStats()}
$('openJLPT').addEventListener('click',()=>{openPanel('jlptPanel');$('jlptIntro').classList.remove('hidden');$('jlptQuiz').classList.add('hidden');$('jlptResult').classList.add('hidden')});
$('jlptBegin').addEventListener('click',beginJLPT);
$('jlptNext').addEventListener('click',()=>{if(jlptIndex<9){jlptIndex++;jlptLocked=false;renderJLPT()}else finishJLPT()});

// Small local assistant. It is rule-based, not a connected generative AI service.
function botReply(raw){const q=raw.toLowerCase();if(/hiragana/.test(q))return 'Hiragana adalah salah satu sistem huruf Jepang yang umum dipakai untuk kata asli Jepang dan akhiran tata bahasa. Buka bagian “Huruf”, pilih tab Hiragana, lalu gunakan flashcard untuk menghafal.';
if(/katakana/.test(q))return 'Katakana digunakan terutama untuk kata serapan, nama asing, dan penekanan. Kamu bisa mempelajarinya di bagian “Huruf” dengan memilih tab Katakana.';
if(/partikel|は|wa\b/.test(q))return 'Partikel は menandai topik kalimat dan dibaca “wa” saat menjadi partikel. Contoh: 私は学生です (Watashi wa gakusei desu) = Saya adalah pelajar.';
if(/が\b|ga\b/.test(q))return 'Partikel が menandai subjek atau informasi yang ditekankan. Contoh: 猫がいます (Neko ga imasu) = Ada kucing.';
if(/を\b|wo\b|o\b/.test(q))return 'Partikel を menandai objek langsung dan biasanya dibaca “o”. Contoh: 水を飲みます = Saya minum air.';
if(/kosakata|tango|kata jepang/.test(q))return 'Buka bagian “Belajar Kosakata” untuk mempelajari kata berdasarkan kategori. Kamu juga bisa memakai audio untuk mendengarkan pengucapannya.';
if(/tata bahasa|bunpou|grammar/.test(q))return 'Materi tata bahasa dasar tersedia di bagian “Materi Tata Bahasa”, mencakup は, が, を, に, です, dan ます beserta contoh kalimat.';
if(/listening|mendengar|audio/.test(q))return 'Pilih “Mulai Listening” pada Area Latihan. Tekan tombol speaker, dengarkan bunyinya, lalu pilih romaji yang sesuai.';
if(/menulis|writing|gambar huruf/.test(q))return 'Pilih “Latihan Menulis Huruf”. Kamu dapat menggambar karakter di kanvas dengan mouse atau layar sentuh, mengganti huruf, dan menghapus tulisan.';
if(/timer|waktu belajar/.test(q))return 'Timer berada di bagian atas halaman. Tekan Mulai saat belajar dan Jeda ketika selesai sementara. Waktu yang tercatat akan menambah progres target harian.';
if(/target|harian/.test(q))return 'Atur target dalam menit pada kartu Target Harian, lalu tekan Simpan. Gunakan timer belajar agar durasi belajarmu tercatat.';
if(/kamus|arti|terjemah|cari kata/.test(q))return 'Kamus mini ada di bagian bawah halaman. Cari menggunakan tulisan Jepang, romaji, atau arti bahasa Indonesia.';
if(/fitur|website|web ini|menu/.test(q))return 'Fitur website ini meliputi huruf Hiragana/Katakana, flashcard, kosakata, tata bahasa dasar, listening test, latihan menulis, game mencocokkan, kuis, kamus mini, kata harian, timer, target harian, statistik, riwayat, dan mode gelap.';
if(/halo|hai|hello|こんにちは/.test(q))return 'こんにちは！ Senang bertemu denganmu. Mau belajar huruf, kosakata, tata bahasa, atau mencoba latihan?';
if(/terima kasih|arigatou/.test(q))return 'どういたしまして (dou itashimashite) — sama-sama! Tetap semangat belajar bahasa Jepang.';
if(/siapa|kamu/.test(q))return 'Aku Asisten Nihongo, chatbot mini yang membantu menjelaskan fitur website dan materi dasar bahasa Jepang.';
return 'Maaf, aku belum memiliki jawaban untuk pertanyaan itu. Aku bisa membantu tentang Hiragana, Katakana, kosakata, tata bahasa dasar, listening, latihan menulis, kamus, timer, target harian, dan fitur website.'}
function addChat(text,type){const d=document.createElement('div');d.className=`chat-bubble ${type}`;d.textContent=text;$('chatMessages').appendChild(d);$('chatMessages').scrollTop=$('chatMessages').scrollHeight}
function sendChat(text){const q=text.trim();if(!q)return;addChat(q,'user');$('chatInput').value='';setTimeout(()=>addChat(botReply(q),'bot'),220)}
$('chatLauncher').addEventListener('click',()=>$('chatWidget').classList.toggle('hidden'));$('chatLauncher').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('chatWidget').classList.toggle('hidden')}});
$('chatClose').addEventListener('click',()=>$('chatWidget').classList.add('hidden'));$('chatForm').addEventListener('submit',e=>{e.preventDefault();sendChat($('chatInput').value)});document.querySelectorAll('.chat-suggestions button').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.prompt)));
