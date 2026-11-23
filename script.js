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
function renderVocab(){const cat=$('vocabCategory').value,q=$('vocabSearch').value.toLowerCase();const rows=vocab.filter(v=>(cat==='Semua'||v[3]===cat)&&v.join(' ').toLowerCase().includes(q));$('vocabGrid').innerHTML=rows.map(v=>`<article class="vocab-card"><div><div class="jp">${escapeHTML(v[0])}</div><h3>${escapeHTML(v[2])}</h3><p>${escapeHTML(v[1])} · ${escapeHTML(v[3])}</p></div><div class="vocab-actions"><button aria-label="Dengarkan ${escapeHTML(v[0])}" data-say="${escapeHTML(v[0])}">🔊</button><button aria-label="Simpan favorit" data-favorite="${escapeHTML(v[0])}">${isFavorite(v[0])?'★':'☆'}</button></div></article>`).join('')||'<div class="empty-state">Kosakata tidak ditemukan.</div>';document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.say)));document.querySelectorAll('[data-favorite]').forEach(b=>b.addEventListener('click',()=>toggleFavorite(b.dataset.favorite)))}
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
$('timerStart').addEventListener('click',()=>{if(timerRunning)return;timerRunning=true;timerInterval=setInterval(()=>{timerSeconds++;if(timerSeconds%60===0){setTodayStudy(getTodayStudy()+60);renderGoal()}renderTimer()},1000)});
$('timerPause').addEventListener('click',()=>{if(timerRunning){clearInterval(timerInterval);timerRunning=false;setTodayStudy(getTodayStudy()+(timerSeconds%60));timerSeconds=0;renderTimer();renderGoal()}});
$('timerReset').addEventListener('click',()=>{clearInterval(timerInterval);timerRunning=false;timerSeconds=0;renderTimer()});
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
function renderStats(){const h=getHistory();$('statAttempts').textContent=h.length;$('statBest').textContent=h.length?Math.max(...h.map(x=>x.score)):0;$('statAverage').textContent=h.length?Math.round(h.reduce((s,x)=>s+x.score,0)/h.length):0;$('statCorrect').textContent=h.reduce((s,x)=>s+x.correct,0);$('quizHistory').innerHTML=h.length? h.slice(0,5).map(x=>`<div class="history-item"><span>${escapeHTML(x.date)}</span><strong>${x.script?x.script.toUpperCase()+' · ':''}${x.score}/100 · ${x.correct}/20 benar</strong></div>`).join(''):'<p class="muted">Belum ada riwayat kuis.</p>'}
function startQuiz(script){if(!script){$('quizSetup').classList.remove('hidden');$('quizContent').classList.add('hidden');$('quizResult').classList.add('hidden');openPanel('quizPanel');return}quizScript=script;const source=script==='hiragana'?hiragana:katakana;quizQuestions=shuffle(source.map(x=>({char:x[0],romaji:x[1],script}))).slice(0,20);quizIndex=0;quizScore=0;quizLocked=false;$('quizSetup').classList.add('hidden');$('quizContent').classList.remove('hidden');$('quizResult').classList.add('hidden');$('quizPrompt').textContent=`Pilih romaji yang benar untuk huruf ${script==='hiragana'?'Hiragana':'Katakana'} berikut.`;renderQuiz();openPanel('quizPanel')}
function renderQuiz(){const q=quizQuestions[quizIndex];const source=quizScript==='hiragana'?hiragana:katakana;$('quizCounter').textContent=`${quizScript==='hiragana'?'Hiragana':'Katakana'} · Soal ${quizIndex+1}/20`;$('quizScore').textContent=`Nilai: ${quizScore}`;$('quizCharacter').textContent=q.char;$('quizFeedback').textContent='';$('quizStatus').textContent='Pilih satu jawaban';$('quizNext').disabled=true;$('quizNext').textContent=quizIndex===19?'Lihat Hasil':'Berikutnya';const opts=shuffle([q.romaji,...shuffle(source.filter(x=>x[1]!==q.romaji)).slice(0,3).map(x=>x[1])]);$('quizOptions').innerHTML=opts.map(o=>`<button class="option-btn" data-answer="${o}">${o}</button>`).join('');document.querySelectorAll('#quizOptions button').forEach(b=>b.addEventListener('click',()=>{if(quizLocked)return;quizLocked=true;const ok=b.dataset.answer===q.romaji;if(ok)quizScore+=5;b.classList.add(ok?'correct':'wrong');if(!ok)document.querySelector(`#quizOptions [data-answer="${q.romaji}"]`).classList.add('correct');$('quizScore').textContent=`Nilai: ${quizScore}`;$('quizFeedback').textContent=ok?'Benar! +5 poin':`Jawaban yang benar adalah ${q.romaji}`;$('quizStatus').textContent=ok?'Jawaban benar':'Jawaban belum tepat';$('quizNext').disabled=false}))}
function finishQuiz(){const h=getHistory();h.unshift({date:new Date().toLocaleString('id-ID'),score:quizScore,correct:quizScore/5,script:quizScript});writeStore('nihongo-history',h.slice(0,30));$('quizContent').classList.add('hidden');$('quizResult').classList.remove('hidden');$('quizResult').innerHTML=`<span class="eyebrow">HASIL KUIS ${quizScript.toUpperCase()}</span><h3>Kuis selesai!</h3><strong>${quizScore}/100</strong><p>Kamu menjawab benar ${quizScore/5} dari 20 soal ${quizScript}.</p><button class="btn primary" id="quizAgain">Ulangi Kuis</button> <button class="btn secondary" id="quizChoose">Pilih jenis huruf</button>`;$('quizAgain').addEventListener('click',()=>startQuiz(quizScript));$('quizChoose').addEventListener('click',()=>startQuiz());renderStats()}
$('quizNext').addEventListener('click',()=>{if(quizIndex<19){quizIndex++;quizLocked=false;renderQuiz()}else finishQuiz()});
$('startQuiz').addEventListener('click',()=>startQuiz());
document.querySelectorAll('[data-quiz-script]').forEach(b=>b.addEventListener('click',()=>startQuiz(b.dataset.quizScript)));
$('quizBack').addEventListener('click',()=>startQuiz());
$('clearHistory').addEventListener('click',()=>{if(confirm('Hapus semua riwayat kuis?')){writeStore('nihongo-history',[]);renderStats()}});renderStats();

// === Fitur tambahan: Kanji, favorit, speaking, sentence builder, JLPT N5, budaya, sertifikat ===
const kanjiData=[
 {k:'日',on:'ニチ・ジツ',kun:'ひ・か',meaning:'hari / matahari',example:'日本 (にほん) — Jepang'},
 {k:'月',on:'ゲツ・ガツ',kun:'つき',meaning:'bulan',example:'月曜日 (げつようび) — Senin'},
 {k:'火',on:'カ',kun:'ひ',meaning:'api',example:'火山 (かざん) — gunung berapi'},
 {k:'水',on:'スイ',kun:'みず',meaning:'air',example:'水曜日 (すいようび) — Rabu'},
 {k:'木',on:'モク・ボク',kun:'き',meaning:'pohon / kayu',example:'木曜日 (もくようび) — Kamis'},
 {k:'金',on:'キン・コン',kun:'かね',meaning:'emas / uang',example:'お金 (おかね) — uang'},
 {k:'土',on:'ド・ト',kun:'つち',meaning:'tanah',example:'土曜日 (どようび) — Sabtu'},
 {k:'人',on:'ジン・ニン',kun:'ひと',meaning:'orang',example:'日本人 (にほんじん) — orang Jepang'},
 {k:'山',on:'サン',kun:'やま',meaning:'gunung',example:'富士山 (ふじさん) — Gunung Fuji'},
 {k:'川',on:'セン',kun:'かわ',meaning:'sungai',example:'川 (かわ) — sungai'},
 {k:'大',on:'ダイ・タイ',kun:'おお',meaning:'besar',example:'大学 (だいがく) — universitas'},
 {k:'小',on:'ショウ',kun:'ちい・こ',meaning:'kecil',example:'小さい (ちいさい) — kecil'},
 {k:'学',on:'ガク',kun:'まな',meaning:'belajar',example:'学生 (がくせい) — pelajar'},
 {k:'生',on:'セイ・ショウ',kun:'い・う',meaning:'hidup / lahir',example:'先生 (せんせい) — guru'},
 {k:'年',on:'ネン',kun:'とし',meaning:'tahun',example:'今年 (ことし) — tahun ini'},
 {k:'本',on:'ホン',kun:'もと',meaning:'buku / asal',example:'本 (ほん) — buku'}
];
function renderKanji(){const q=$('kanjiSearch').value.trim().toLowerCase();const rows=kanjiData.filter(x=>[x.k,x.on,x.kun,x.meaning,x.example].join(' ').toLowerCase().includes(q));$('kanjiCount').textContent=`${rows.length} dari ${kanjiData.length} Kanji`; $('kanjiGrid').innerHTML=rows.map(x=>`<article class="kanji-card"><strong>${x.k}</strong><h3>${x.meaning}</h3><p><b>On:</b> ${x.on}</p><p><b>Kun:</b> ${x.kun}</p><small>${x.example}</small><button class="btn ghost small" data-kanji-say="${x.k}">🔊 Dengarkan</button></article>`).join('')||'<div class="empty-state">Kanji tidak ditemukan.</div>';document.querySelectorAll('[data-kanji-say]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.kanjiSay)))}
$('kanjiSearch').addEventListener('input',renderKanji);renderKanji();
function getFavorites(){return readStore('nihongo-favorites',[])}
function isFavorite(word){return getFavorites().includes(word)}
function toggleFavorite(word){let f=getFavorites();f=f.includes(word)?f.filter(x=>x!==word):[...f,word];writeStore('nihongo-favorites',f);renderVocab();renderFavorites()}
function renderFavorites(){const f=getFavorites();const rows=vocab.filter(v=>f.includes(v[0]));$('favoriteGrid').innerHTML=rows.length?rows.map(v=>`<article class="vocab-card"><div><div class="jp">${escapeHTML(v[0])}</div><h3>${escapeHTML(v[2])}</h3><p>${escapeHTML(v[1])} · ${escapeHTML(v[3])}</p></div><div class="vocab-actions"><button data-fav-say="${escapeHTML(v[0])}">🔊</button><button data-fav-remove="${escapeHTML(v[0])}">★</button></div></article>`).join(''):'<div class="empty-state">Belum ada kosakata favorit. Tekan ☆ pada kartu kosakata untuk menyimpan.</div>';document.querySelectorAll('[data-fav-say]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.favSay)));document.querySelectorAll('[data-fav-remove]').forEach(b=>b.addEventListener('click',()=>toggleFavorite(b.dataset.favRemove)))}
renderFavorites();

const cultureData=[
 ['🍵','Upacara minum teh (茶道)','Sadō adalah tradisi penyajian dan menikmati teh matcha yang menekankan ketenangan, kesopanan, dan perhatian pada detail.'],
 ['🎎','Festival (祭り)','Matsuri adalah festival lokal yang sering diadakan di kuil atau lingkungan masyarakat. Beberapa festival memiliki parade, musik, dan pakaian tradisional.'],
 ['🍱','Budaya makanan','Makanan Jepang sering disajikan dengan memperhatikan keseimbangan rasa, warna, musim, dan tampilan. Contohnya sushi, ramen, dan bento.'],
 ['👞','Etika melepas sepatu','Di banyak rumah dan beberapa tempat tradisional, pengunjung melepas sepatu sebelum masuk. Perhatikan area genkan atau tempat masuk.'],
 ['🙇','Salam membungkuk (お辞儀)','Ojigi digunakan untuk menyapa, berterima kasih, atau meminta maaf. Kedalaman dan lamanya membungkuk bergantung pada situasi.'],
 ['🌸','Hanami (花見)','Hanami adalah kegiatan menikmati bunga sakura yang mekar, biasanya bersama keluarga atau teman saat musim semi.']
];
$('cultureGrid').innerHTML=cultureData.map(c=>`<article class="culture-card"><div>${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p></article>`).join('');

// Latihan pengucapan: rekaman audio lokal melalui MediaRecorder (tidak ada penilaian otomatis).
const speakingWords=[['こんにちは','konnichiwa · Halo'],['ありがとう','arigatou · Terima kasih'],['おはようございます','ohayou gozaimasu · Selamat pagi'],['すみません','sumimasen · Permisi / maaf'],['さようなら','sayounara · Selamat tinggal']];
let speakingIndex=0,mediaRecorder=null,recordChunks=[],recordUrl=null;
function renderSpeaking(){ $('pronunciationWord').textContent=speakingWords[speakingIndex][0];$('pronunciationRomaji').textContent=speakingWords[speakingIndex][1];$('recordStatus').textContent='Dengarkan contoh, lalu rekam pengucapanmu.';$('recordedAudio').classList.add('hidden');$('recordPlay').disabled=true }
$('openPronunciation').addEventListener('click',()=>{openPanel('pronunciationPanel');renderSpeaking()});
$('pronunciationSample').addEventListener('click',()=>speak(speakingWords[speakingIndex][0]));
$('recordStart').addEventListener('click',async()=>{try{if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('Fitur rekam tidak didukung browser ini.');const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];mediaRecorder=new MediaRecorder(stream);mediaRecorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};mediaRecorder.onstop=()=>{const blob=new Blob(recordChunks,{type:mediaRecorder.mimeType||'audio/webm'});if(recordUrl)URL.revokeObjectURL(recordUrl);recordUrl=URL.createObjectURL(blob);$('recordedAudio').src=recordUrl;$('recordedAudio').classList.remove('hidden');$('recordPlay').disabled=false;stream.getTracks().forEach(t=>t.stop());$('recordStatus').textContent='Rekaman siap diputar. Dengarkan dan coba ulangi bila perlu.'};mediaRecorder.start();$('recordStart').disabled=true;$('recordStop').disabled=false;$('recordStatus').textContent='Sedang merekam... Ucapkan kata Jepang dengan jelas.'}catch(err){$('recordStatus').textContent=err.message||'Tidak dapat mengakses mikrofon. Periksa izin browser.'}});
$('recordStop').addEventListener('click',()=>{if(mediaRecorder?.state==='recording'){mediaRecorder.stop();$('recordStart').disabled=false;$('recordStop').disabled=true}});
$('recordPlay').addEventListener('click',()=>$('recordedAudio').play());
$('recordNext').addEventListener('click',()=>{speakingIndex=(speakingIndex+1)%speakingWords.length;renderSpeaking()});

// Susun kalimat: pilih potongan kata hingga membentuk urutan yang tepat.
const sentenceData=[
 {meaning:'Saya minum air.',parts:['水','を','飲みます','。'],answer:['水','を','飲みます','。'],hint:'Mizu o nomimasu.'},
 {meaning:'Saya adalah pelajar.',parts:['学生','です','。','私は'],answer:['私は','学生','です','。'],hint:'Watashi wa gakusei desu.'},
 {meaning:'Kucing ada.',parts:['います','猫','が','。'],answer:['猫','が','います','。'],hint:'Neko ga imasu.'},
 {meaning:'Saya pergi ke sekolah.',parts:['学校','行きます','に','。','私は'],answer:['私は','学校','に','行きます','。'],hint:'Watashi wa gakkou ni ikimasu.'}
];
let sentenceIndex=0,sentencePicked=[];
function renderSentence(){const s=sentenceData[sentenceIndex];sentencePicked=[];$('sentenceMeaning').textContent=`Susun kata berikut menjadi: ${s.meaning}`;$('sentenceAnswer').innerHTML='<span class="muted">Pilih potongan kata di bawah.</span>';$('sentencePieces').innerHTML=shuffle(s.parts.map((x,i)=>({x,id:i}))).map(o=>`<button class="sentence-piece" data-piece="${o.id}">${o.x}</button>`).join('');$('sentenceFeedback').textContent='';document.querySelectorAll('[data-piece]').forEach(b=>b.addEventListener('click',()=>{const id=Number(b.dataset.piece);if(b.disabled)return;b.disabled=true;sentencePicked.push({id,text:b.textContent});$('sentenceAnswer').textContent=sentencePicked.map(x=>x.text).join('');}))}
$('openSentence').addEventListener('click',()=>{openPanel('sentencePanel');renderSentence()});
$('checkSentence').addEventListener('click',()=>{const s=sentenceData[sentenceIndex];const ok=sentencePicked.map(x=>x.text).join('')===s.answer.join('');$('sentenceFeedback').textContent=ok?`Benar! ${s.hint}`:`Belum tepat. Coba susun kembali urutan kalimatnya.`;$('sentenceFeedback').style.color=ok?'var(--green)':'var(--red)'});
$('resetSentence').addEventListener('click',renderSentence);$('nextSentence').addEventListener('click',()=>{sentenceIndex=(sentenceIndex+1)%sentenceData.length;renderSentence()});

// Simulasi latihan JLPT N5 (soal latihan buatan, bukan soal resmi).
const jlptQuestions=[
 {q:'「みず」の意味は何ですか。',o:['Air','Api','Buku','Gunung'],a:0},
 {q:'「ねこ」はどれですか。',o:['Anjing','Kucing','Burung','Ikan'],a:1},
 {q:'わたし ___ 学生です。',o:['を','に','は','で'],a:2},
 {q:'「ありがとう」の意味は？',o:['Maaf','Terima kasih','Selamat pagi','Sampai jumpa'],a:1},
 {q:'学校へ ___。 (pergi)',o:['行きます','飲みます','食べます','見ます'],a:0},
 {q:'「先生」は何ですか。',o:['Dokter','Guru','Teman','Siswa'],a:1},
 {q:'七時 ___ 起きます。',o:['を','が','に','は'],a:2},
 {q:'「大きい」の反対は？',o:['新しい','小さい','高い','長い'],a:1},
 {q:'本を ___。 (membaca)',o:['読みます','書きます','聞きます','話します'],a:0},
 {q:'「月曜日」は何曜日ですか。',o:['Senin','Selasa','Rabu','Minggu'],a:0}
];
let jlptIndex=0,jlptCorrect=0,jlptLocked=false;
$('openJLPT').addEventListener('click',()=>{openPanel('jlptPanel');$('jlptIntro').classList.remove('hidden');$('jlptQuiz').classList.add('hidden');$('jlptResult').classList.add('hidden')});
$('jlptBegin').addEventListener('click',()=>{jlptIndex=0;jlptCorrect=0;renderJLPT();$('jlptIntro').classList.add('hidden');$('jlptQuiz').classList.remove('hidden');$('jlptResult').classList.add('hidden')});
function renderJLPT(){const q=jlptQuestions[jlptIndex];jlptLocked=false;$('jlptCounter').textContent=`Soal ${jlptIndex+1}/10`;$('jlptScore').textContent=`Benar: ${jlptCorrect}`;$('jlptQuestion').textContent=q.q;$('jlptFeedback').textContent='';$('jlptNext').disabled=true;$('jlptNext').textContent=jlptIndex===9?'Lihat Hasil':'Berikutnya';$('jlptOptions').innerHTML=q.o.map((x,i)=>`<button class="option-btn" data-jlpt="${i}">${x}</button>`).join('');document.querySelectorAll('[data-jlpt]').forEach(b=>b.addEventListener('click',()=>{if(jlptLocked)return;jlptLocked=true;const ok=Number(b.dataset.jlpt)===q.a;if(ok)jlptCorrect++;b.classList.add(ok?'correct':'wrong');document.querySelector(`[data-jlpt="${q.a}"]`).classList.add('correct');$('jlptScore').textContent=`Benar: ${jlptCorrect}`;$('jlptFeedback').textContent=ok?'Benar!':'Jawaban benar: '+q.o[q.a];$('jlptNext').disabled=false}))}
$('jlptNext').addEventListener('click',()=>{if(jlptIndex<9){jlptIndex++;renderJLPT()}else finishJLPT()});
function finishJLPT(){const score=jlptCorrect*10;writeStore('nihongo-jlpt-last',{score,date:new Date().toLocaleDateString('id-ID'),passed:score>=70});$('jlptQuiz').classList.add('hidden');$('jlptResult').classList.remove('hidden');$('jlptResult').innerHTML=`<span class="eyebrow">HASIL SIMULASI N5</span><h3>${score>=70?'Selamat, latihan berhasil!':'Terus berlatih!'}</h3><strong>${score}/100</strong><p>Jawaban benar ${jlptCorrect} dari 10 soal. ${score>=70?'Kamu memenuhi syarat latihan untuk mencetak sertifikat penyelesaian.':'Butuh nilai minimal 70 untuk membuka sertifikat latihan.'}</p>${score>=70?'<button class="btn primary" id="printCertificate">Cetak Sertifikat</button>':''} <button class="btn secondary" id="retryJLPT">Ulangi Simulasi</button>`;if(score>=70)$('printCertificate').addEventListener('click',printCertificate);$('retryJLPT').addEventListener('click',()=>$('jlptBegin').click())}
function printCertificate(){const last=readStore('nihongo-jlpt-last',{});const w=window.open('','_blank','width=900,height=700');if(!w){alert('Izinkan pop-up browser untuk mencetak sertifikat.');return}w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Sertifikat Nihongo</title><style>body{font-family:Georgia,serif;background:#f5f1ff;padding:40px;color:#28213d}.cert{background:white;border:12px double #725bd8;padding:55px;text-align:center;max-width:760px;margin:auto}.jp{font-size:38px;color:#725bd8}.title{font-size:34px;letter-spacing:3px}.name{font-size:28px;border-bottom:1px solid #999;display:inline-block;padding:10px 50px}.muted{color:#666}button{padding:10px 20px;margin-top:25px}@media print{button{display:none}body{background:white}}</style></head><body><div class="cert"><div class="jp">日本語 · NIHONGO</div><h1 class="title">SERTIFIKAT PENYELESAIAN</h1><p>Diberikan kepada</p><p class="name">Peserta Japanese Learning</p><p>atas keberhasilan menyelesaikan Simulasi Latihan JLPT N5</p><h2>Nilai: ${last.score}/100</h2><p class="muted">Tanggal: ${last.date||new Date().toLocaleDateString('id-ID')}</p><p>がんばりました！ Terus semangat belajar.</p><button onclick="window.print()">Cetak / Simpan PDF</button></div></body></html>`);w.document.close()}

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
if(/kanji/.test(q))return 'Materi Kanji dasar tersedia pada bagian Belajar Kanji, lengkap dengan arti, cara baca, dan contoh.';
if(/jlpt|ujian n5/.test(q))return 'Buka Area Latihan lalu pilih Simulasi JLPT N5. Tersedia 10 soal latihan kosakata dan tata bahasa tingkat pemula.';
if(/budaya|tradisi jepang/.test(q))return 'Buka Ensiklopedia Budaya Jepang untuk membaca tentang etika, makanan, festival, dan kebiasaan di Jepang.';
if(/favorit/.test(q))return 'Tekan ikon bintang pada kartu kosakata untuk menyimpannya. Daftar tersimpan ada di bagian Kosakata Favorit.';
if(/pengucapan|rekam suara|speaking/.test(q))return 'Buka Latihan Pengucapan di Area Latihan. Dengarkan contoh, izinkan mikrofon, lalu rekam dan putar suaramu.';
if(/susun kalimat/.test(q))return 'Buka Susun Kalimat pada Area Latihan, lalu tekan potongan kata sesuai urutan kalimat yang benar.';
if(/fitur|website|web ini|menu/.test(q))return 'Fitur website ini meliputi Hiragana/Katakana, flashcard, kosakata, Kanji, tata bahasa, listening, latihan menulis dan pengucapan, susun kalimat, JLPT N5, favorit, budaya Jepang, kuis, kamus, timer, target harian, statistik, dan dark mode.';
if(/halo|hai|hello|こんにちは/.test(q))return 'こんにちは！ Senang bertemu denganmu. Mau belajar huruf, kosakata, tata bahasa, atau mencoba latihan?';
if(/terima kasih|arigatou/.test(q))return 'どういたしまして (dou itashimashite) — sama-sama! Tetap semangat belajar bahasa Jepang.';
if(/siapa|kamu/.test(q))return 'Aku Asisten Nihongo, chatbot mini yang membantu menjelaskan fitur website dan materi dasar bahasa Jepang.';
return 'Maaf, aku belum memiliki jawaban untuk pertanyaan itu. Aku bisa membantu tentang Hiragana, Katakana, kosakata, tata bahasa dasar, listening, latihan menulis, kamus, timer, target harian, dan fitur website.'}
function addChat(text,type){const d=document.createElement('div');d.className=`chat-bubble ${type}`;d.textContent=text;$('chatMessages').appendChild(d);$('chatMessages').scrollTop=$('chatMessages').scrollHeight}
function sendChat(text){const q=text.trim();if(!q)return;addChat(q,'user');$('chatInput').value='';setTimeout(()=>addChat(botReply(q),'bot'),220)}
$('chatLauncher').addEventListener('click',()=>$('chatWidget').classList.toggle('hidden'));$('chatLauncher').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('chatWidget').classList.toggle('hidden')}});
$('chatClose').addEventListener('click',()=>$('chatWidget').classList.add('hidden'));$('chatForm').addEventListener('submit',e=>{e.preventDefault();sendChat($('chatInput').value)});document.querySelectorAll('.chat-suggestions button').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.prompt)));
