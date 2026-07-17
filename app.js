const form = document.querySelector('#promptForm');
const results = document.querySelector('#results');
const summary = document.querySelector('#summary');
const template = document.querySelector('#trackTemplate');
const settingsStatus = document.querySelector('#settingsStatus');

const STORAGE_KEY = 'Music-command-maker-kr-v1.2-settings';
const SETTINGS_FILE_NAME = 'Music-command-maker-v1.2-settings.json';

const genreGroups = {
  'K-Pop / Pop': ['케이팝', '팝', '댄스팝', '버블검 팝', '버블검 댄스', '버블검 베이스', '하이퍼팝', '얼터너티브 팝', '인디팝', '베드룸 팝', '드림 팝', '어쿠스틱 팝', '싱어송라이터'],
  'Ballad / Piano / BGM': ['발라드', '피아노', '솔로 피아노', '감성 피아노', '시네마틱 피아노', '뉴에이지', '힐링 음악', '명상 음악', '수면 음악', '카페 BGM', '잔잔한 BGM'],
  'Rock / Metal / Alternative': ['록', '헤비메탈', '메탈코어', '그런지', '펑크', '얼터너티브 록', '어쿠스틱 록', '슈게이즈', '포스트 록', '스래시 메탈', '데스 메탈', '블랙 메탈', '둠 메탈', '파워 메탈', '심포닉 메탈', '프로그레시브 메탈'],
  'R&B / Soul / Groove': ['알앤비', '얼터너티브 R&B', '펑크/소울', '재즈 소울', '그루브', '그루브 팝', '그루브 펑크', '그루브 소울', '그루브 R&B', '그루브 하우스', '뉴잭스윙', '디스코 펑크', '시티팝 그루브'],
  'Hip-Hop / Electronic': ['힙합', 'EDM', '하우스', '테크노', '애시드 하우스', '애시드 테크노', '트랜스', '애시드 트랜스', '브레이크비트', '브레이크비트 트랜스', 'UK 개러지', '투스텝', '정글', '드럼 앤 베이스', '드럼스텝', '덥스텝', '퓨처 베이스', '칠스텝', '앰비언트 테크노', '앰비언트 하우스', '덥 테크노', '일렉트로팝', '신스팝', '뉴웨이브'],
  'Chill / Retro / Internet': ['로파이', '앰비언트', '시티팝', '디스코', '신스웨이브', '일렉트로스윙', '베이퍼웨이브', '슬러시웨이브', '칠신스', '폰크', '카와이 퓨처 베이스', '알고레이브'],
  'Folk / Country / Blues': ['트로트', '포크', '블루스', '블루스 록', '블루스 포크', '컨트리', '얼터너티브 컨트리', '안티 포크', '블루그래스', '아메리카나'],
  'Jazz / Classic / Stage': ['재즈', '클래식', '오케스트라', '시네마틱', '빅 밴드', '스윙', '애시드 재즈', '아방가르드 재즈', '카바레', '오페라', '바버샵'],
  'Korean Traditional / Worship': ['국악', '판소리', '민요', '국악 퓨전', '찬송가', 'CCM', '가스펠', '성가대'],
  'World / Latin / Afro': ['월드뮤직', '샹송', '파두', '보사노바', '삼바', '살사', '플라멩코', '탱고', '레게', '레게톤', '아프로비트', '라틴팝', '아프로 하우스', '아프로 트랩', '아프로 재즈', '아프로 록', '아프로스윙', '아프로피아노', '아프로-큐반 재즈', '바차타', '쿰비아', '메렝게', '칼립소', '스카', '마리아치', '케이준', '발칸 브라스 밴드', '아랍 팝', '아랍 클래식', '아랍 레게']
};

const genreOptions = Object.values(genreGroups).flat();

const languageOptions = ['한국어', '영어', '일본어', '중국어', '스페인어', '프랑스어', '독일어', '이탈리아어', '포르투갈어', '힌디어', '아랍어', '인도네시아어', '베트남어', '태국어', '러시아어', '터키어', '스웨덴어', '노르웨이어', '라틴어'];

const voiceToneEnglish = {
  '밝고 쾌활한': 'bright casual',
  '감정적으로 솔직한': 'emotionally open',
  '수줍은': 'shy',
  '장난기 넘치는': 'playful',
  '시크하고 쿨한': 'cool chic',
  '몽환적이고 부드러운': 'dreamy soft',
  '따뜻하고 포근한': 'sleepy warm',
  '우아하고 차분한': 'elegant calm',
  '허스키한': 'husky',
  '에너지 넘치고 파워풀한': 'energetic powerful',
  '맑고 깨끗한': 'clear pure',
  '섬세하고 속삭이는': 'delicate whispery',
  '깊고 성숙한': 'deep mature',
  '담백하고 자연스러운': 'natural plain'
};

const ageEnglish = { '어린이': 'child', '청소년': 'teen', '성인': 'adult', '중년': 'middle-aged' };

const genderEnglish = {
  '남자': 'male',
  '여자': 'female',
  '듀엣': 'duet',
  '합창': 'choir',
  '남녀 듀엣': 'male-female duet',
  '여성 듀엣': 'female duet',
  '남성 듀엣': 'male duet',
  '혼성 그룹': 'mixed vocal group'
};

const lyricDefaults = {
  density: 'medium',
  voiceTone: '밝고 쾌활한',
  voiceAge: '청소년',
  voiceGender: '여자',
  languageA: '한국어',
  languageB: '없음',
  languageMix: '70',
  hook: '중간',
  rhyme: '랜덤'
};

let lyricBackup = { ...lyricDefaults };
let lyricGroupWasNone = false;
let genreTarget = null;
let saveTimer = null;

function value(id) {
  return document.querySelector('#' + id).value;
}

function control(id) {
  return document.querySelector('#' + id);
}

function fillSelect(select, options, selected, withNone = false) {
  const list = withNone ? ['없음', ...options] : options;
  select.innerHTML = list
    .map(option => {
      const attr = option === selected ? ' selected' : '';
      return '<option' + attr + '>' + option + '</option>';
    })
    .join('');
}

function getMode() {
  return document.querySelector("input[name='projectMode']:checked").value;
}

function isNoLyricsSelected() {
  return value('density') === 'none'
    || value('voiceTone') === '없음'
    || value('voiceAge') === '없음'
    || value('voiceGender') === '없음'
    || value('languageA') === '없음';
}

function rememberLyricSettings() {
  if (isNoLyricsSelected()) return;
  lyricBackup = {
    density: value('density'),
    voiceTone: value('voiceTone'),
    voiceAge: value('voiceAge'),
    voiceGender: value('voiceGender'),
    languageA: value('languageA'),
    languageB: value('languageB'),
    languageMix: value('languageMix'),
    hook: value('hook'),
    rhyme: value('rhyme')
  };
}

function restoreLyricsFromBackup(changedId, changedValue) {
  const merged = { ...lyricDefaults, ...lyricBackup };
  control('density').value = merged.density === 'none' ? lyricDefaults.density : merged.density;
  control('voiceTone').value = merged.voiceTone === '없음' ? lyricDefaults.voiceTone : merged.voiceTone || lyricDefaults.voiceTone;
  control('voiceAge').value = merged.voiceAge === '없음' ? lyricDefaults.voiceAge : merged.voiceAge || lyricDefaults.voiceAge;
  control('voiceGender').value = merged.voiceGender === '없음' ? lyricDefaults.voiceGender : merged.voiceGender;
  control('languageA').value = merged.languageA === '없음' ? lyricDefaults.languageA : merged.languageA;
  control('languageB').value = merged.languageB || lyricDefaults.languageB;
  control('languageMix').value = merged.languageMix || lyricDefaults.languageMix;
  control('hook').value = merged.hook || lyricDefaults.hook;
  control('rhyme').value = merged.rhyme || lyricDefaults.rhyme;
  control(changedId).value = changedValue;
  lyricGroupWasNone = false;
}

function syncLyricModeState() {
  const noLyrics = isNoLyricsSelected();
  const lyricControls = ['hookLyric', 'adlib', 'languageB', 'languageMix', 'hook', 'rhyme'];
  lyricControls.forEach(id => {
    control(id).disabled = noLyrics;
  });
  control('languageMix').disabled = noLyrics
    || value('languageB') === '없음'
    || value('languageA') === value('languageB');
  control('languageMixWrap').classList.toggle('is-disabled', control('languageMix').disabled);
  if (noLyrics) {
    control('density').value = 'none';
    if (value('voiceTone') === '없음' || !lyricGroupWasNone) control('voiceTone').value = '없음';
    if (value('voiceAge') === '없음' || !lyricGroupWasNone) control('voiceAge').value = '없음';
    control('voiceGender').value = '없음';
    control('languageA').value = '없음';
    control('languageB').value = '없음';
    lyricGroupWasNone = true;
    return;
  }
  rememberLyricSettings();
  lyricGroupWasNone = false;
}

function handleLyricModeChange(event) {
  const id = event.currentTarget.id;
  const newValue = event.currentTarget.value;
  if (lyricGroupWasNone && newValue !== 'none' && newValue !== '없음') {
    restoreLyricsFromBackup(id, newValue);
  }
  render();
}

function syncModeState() {
  const isSingle = getMode() === 'single';
  document.querySelectorAll('.single-only').forEach(el => {
    el.classList.toggle('is-hidden', !isSingle);
  });
  document.querySelectorAll('.album-only').forEach(el => {
    el.classList.toggle('is-hidden', isSingle);
  });
}

function getTrackCount() {
  if (getMode() === 'single') return Number(value('singleCount'));
  const count = Number(value('trackCount')) || 1;
  return Math.max(1, Math.min(30, count));
}

function durationLabel(seconds) {
  const total = Number(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (!minutes) return rest + '초';
  return rest ? minutes + '분 ' + rest + '초' : minutes + '분';
}

function parseBpm(raw) {
  const match = String(raw).match(/\d{2,3}/);
  if (!match) return null;
  const bpm = Number(match[0]);
  if (bpm < 45 || bpm > 220) return null;
  return bpm;
}

function suggestedBpm(settings) {
  const hint = settings.genreA + ' ' + settings.genreB + ' ' + settings.purpose + ' ' + settings.energy;
  let bpm = 96;
  if (/수면|명상|힐링|잔잔한 BGM|솔로 피아노|감성 피아노|뉴에이지|찬송가|CCM|성가대|파두|샹송/.test(hint)) bpm = 72;
  if (/발라드|블루스|컨트리|포크|아메리카나|보사노바|레게/.test(hint)) bpm = 88;
  if (/트로트|국악|판소리|민요|스윙|빅 밴드|카페 BGM/.test(hint)) bpm = 104;
  if (/하우스|테크노|트랜스|브레이크비트|UK 개러지|투스텝|레게톤|아프로|라틴팝|삼바|살사|스카/.test(hint)) bpm = 124;
  if (/드럼 앤 베이스|정글|드럼스텝|덥스텝|퓨처 베이스|하이퍼팝|메탈|펑크|록|강함/.test(hint)) bpm = 142;
  if (/로파이|칠|베이퍼웨이브|앰비언트/.test(hint)) bpm = 82;
  return bpm;
}

function roundToEven(bars) {
  return Math.max(4, Math.round(bars / 2) * 2);
}

function sectionBlueprint(settings) {
  const bpm = parseBpm(settings.bpm) || suggestedBpm(settings);
  const exactBars = settings.duration * bpm / 240;
  const totalBars = Math.max(8, roundToEven(exactBars));
  const estimatedSeconds = Math.round(totalBars * 240 / bpm);
  const drift = estimatedSeconds - settings.duration;
  const weights = settings.noLyrics
    ? [['Intro', 1], ['Theme A', 2.4], ['Theme B', 2.1], ['Bridge', 1.3], ['Final Theme', 2.4], ['Outro', 0.8]]
    : [['Intro', 0.7], ['Verse 1', 1.7], ['Pre-Chorus', 0.9], ['Chorus', 1.8], ['Verse 2', 1.4], ['Bridge', 1], ['Final Chorus', 1.8], ['Outro', 0.7]];
  const weightSum = weights.reduce((sum, [, weight]) => sum + weight, 0);
  const sections = weights.map(([name, weight]) => ({
    name,
    bars: Math.max(2, roundToEven(totalBars * weight / weightSum))
  }));
  let remaining = totalBars - sections.reduce((sum, section) => sum + section.bars, 0);
  let index = 0;
  while (remaining !== 0 && index < 200) {
    const step = remaining > 0 ? 2 : -2;
    const section = sections[index % sections.length];
    if (section.bars + step >= 2) {
      section.bars += step;
      remaining -= step;
    }
    index += 1;
  }
  return { bpm, exactBars, totalBars, estimatedSeconds, drift, sections };
}

function blendText(first, second, mix, none = '없음') {
  if (second === none || first === second) return first;
  const ratio = Number(mix);
  return first + ' ' + ratio + '% + ' + second + ' ' + (100 - ratio) + '%';
}

function genreText(settings) {
  return blendText(settings.genreA, settings.genreB, settings.genreMix);
}

function languageText(settings) {
  if (settings.noLyrics) return '없음';
  return blendText(settings.languageA, settings.languageB, settings.languageMix);
}

function voiceProfile(settings) {
  if (settings.noLyrics) return '없음';
  const korean = settings.voiceTone + ' ' + settings.voiceGender + ' ' + settings.voiceAge;
  const english = (voiceToneEnglish[settings.voiceTone] || settings.voiceTone) + ' ' + voiceEnglishCue(settings);
  return korean + ' (' + english + ')';
}

function voiceEnglishCue(settings) {
  const age = settings.voiceAge;
  const gender = settings.voiceGender;
  if (gender === '여자' && age === '청소년') return 'girl';
  if (gender === '남자' && age === '청소년') return 'boy';
  if (gender === '여자' && age === '성인') return 'woman';
  if (gender === '남자' && age === '성인') return 'man';
  if (gender === '여자' && age === '중년') return 'middle-aged woman';
  if (gender === '남자' && age === '중년') return 'middle-aged man';
  if (age === '어린이') return ((genderEnglish[gender] || gender) + ' child').trim();
  return ((ageEnglish[age] || age) + ' ' + (genderEnglish[gender] || gender)).trim();
}

function durationPlanText(settings) {
  const plan = sectionBlueprint(settings);
  const driftText = plan.drift === 0
    ? '오차 0초'
    : '' + (plan.drift > 0 ? '+' : '') + plan.drift + '초 예상';
  const sectionLines = plan.sections
    .map(section => '  - ' + section.name + ': ' + section.bars + '마디')
    .join('\n');
  return [
    '- 목표 길이: ' + durationLabel(settings.duration) + ' (' + settings.duration + '초)',
    '- 계산 BPM: ' + plan.bpm + ' BPM' + (settings.bpm ? '' : ' (직접 BPM이 없어서 장르/용도 기준 추천)'),
    '- 4/4 기준 총 마디: 약 ' + plan.exactBars.toFixed(1) + '마디, 실제 작성은 ' + plan.totalBars + '마디',
    '- ' + plan.totalBars + '마디를 ' + plan.bpm + ' BPM으로 만들면 약 ' + durationLabel(plan.estimatedSeconds) + '이며 ' + driftText,
    '- 섹션별 마디 배분:',
    sectionLines,
    '- 목표 길이에 맞도록 가사 줄 수, 반복 횟수, 브릿지와 아웃트로 길이를 우선 조절한다.'
  ].join('\n');
}

function getSettings() {
  const noLyrics = isNoLyricsSelected();
  return {
    mode: getMode(),
    noLyrics,
    songTitle: value('songTitle').trim() || '랜덤',
    hookLyric: value('hookLyric').trim() || '랜덤',
    adlib: value('adlib').trim() || '랜덤',
    promptLanguage: value('promptLanguage'),
    extraRequest: value('extraRequest').trim(),
    theme: value('theme').trim(),
    purpose: value('purpose'),
    genreA: value('genreA'),
    genreB: value('genreB'),
    genreMix: value('genreMix'),
    duration: Number(value('duration')),
    density: noLyrics ? 'none' : value('density'),
    voiceTone: noLyrics ? '없음' : value('voiceTone'),
    voiceAge: noLyrics ? '없음' : value('voiceAge'),
    voiceGender: noLyrics ? '없음' : value('voiceGender'),
    languageA: noLyrics ? '없음' : value('languageA'),
    languageB: noLyrics ? '없음' : value('languageB'),
    languageMix: value('languageMix'),
    bpm: parseBpm(value('bpm')) ? String(parseBpm(value('bpm'))) : null,
    energy: value('energy'),
    trackCount: getTrackCount(),
    mood: value('mood'),
    structure: value('structure'),
    hook: noLyrics ? '없음' : value('hook'),
    rhyme: noLyrics ? '없음' : value('rhyme'),
    avoid: value('avoid').trim()
  };
}

function lyricRequirement(settings) {
  if (settings.noLyrics) {
    return [
      '무가사곡으로 작성한다.',
      '실제 가사 문장, 보컬 파트, 언어 지시, 라임 지시, 훅 가사 문장은 만들지 않는다.',
      'Music Lyrics에는 [Intro], [Instrumental Break], [Build], [Outro] 같은 구조 태그와 연주 지시만 넣는다.'
    ].join('\n');
  }
  const densityGuide = {
    high: '가사 분량은 높게. 벌스는 이미지를 촘촘하게, 후렴은 반복 가능하지만 단조롭지 않게 작성.',
    medium: '가사 분량은 중간. 벌스와 후렴의 균형을 맞추고 바로 노래로 만들 수 있는 완성도로 작성.',
    low: '가사 분량은 낮게. 짧은 문장, 긴 여백, 반복 가능한 훅 중심으로 작성.'
  };
  return [
    '가사곡으로 작성한다.',
    densityGuide[settings.density],
    '가사 언어는 ' + languageText(settings) + ' 비중을 지킨다.',
    '보컬 특징은 ' + voiceProfile(settings) + '로 지시한다.',
    'Music Lyrics에 바로 붙여 넣기 좋게 [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro] 섹션 태그를 사용한다.'
  ].join('\n');
}

function modeRule(settings) {
  if (settings.mode === 'single') {
    return [
      settings.trackCount + '개의 싱글곡 후보를 하나의 패키지로 생성한다.',
      '모든 후보는 같은 목적과 핵심 설정을 공유하되 제목, 훅, 사운드 질감, 편곡 방향은 서로 다르게 만든다.',
      '각 후보마다 목표 길이 계산표와 Music용 Weirdness, Style Influence 추천값을 반드시 명시한다.'
    ].join('\n');
  }
  return [
    settings.trackCount + '개의 트랙을 하나의 앨범 패키지로 생성한다.',
    '모든 트랙은 기본 설정을 공유하되 트랙별 제목, 훅, 리듬, 감정선, 사운드 질감, 구조 전개가 겹치지 않게 한다.',
    '각 트랙마다 목표 길이 계산표와 Music용 Weirdness, Style Influence 추천값을 반드시 명시한다.'
  ].join('\n');
}

function singleOnlyLines(settings) {
  if (settings.mode !== 'single') return '';
  return [
    '- 곡 제목: ' + (settings.songTitle === '랜덤' ? '랜덤. 챗봇이 곡마다 적절히 설정' : settings.songTitle),
    '- 훅 가사: ' + (settings.hookLyric === '랜덤' ? '랜덤. 챗봇이 곡마다 강한 훅을 직접 설계' : settings.hookLyric),
    '- 애드립/추임새: ' + (settings.adlib === '랜덤' ? '랜덤. 장르와 보컬에 맞게 설계' : settings.adlib)
  ].join('\n');
}

function lyricOnlyLines(settings) {
  if (settings.noLyrics) {
    return [
      '- 곡 형태: 무가사곡',
      '- 보컬/언어/가사 분량/훅/라임 관련 지시는 출력하지 말 것',
      '- 무가사 구조: 대괄호 섹션 태그와 연주 지시 중심'
    ].join('\n');
  }
  return [
    '- 곡 형태: 가사곡',
    '- 보컬 특징: ' + voiceProfile(settings),
    '- 언어: ' + languageText(settings),
    '- 가사 분량: ' + settings.density,
    '- 훅 강조: ' + settings.hook,
    '- 라임/반복: ' + (settings.rhyme === '랜덤' ? '랜덤. 장르, 가사 분량, 보컬 설정을 바탕으로 적절히 설정' : settings.rhyme)
  ].join('\n');
}

function buildCommand(settings) {
  const themeLine = settings.theme ? '- 주제: ' + settings.theme + '\n' : '';
  const extraLine = settings.extraRequest ? '- 추가 요청사항: ' + settings.extraRequest + '\n' : '';
  const avoidText = settings.avoid ? settings.avoid : '없음';
  const modeLabel = settings.mode === 'single' ? '싱글곡' : '앨범';
  const formLabel = settings.noLyrics ? '무가사곡' : '가사곡';
  const lyricsBlockLabel = settings.noLyrics ? '무가사 구조 블록박스' : 'Lyrics 블록박스';
  const lyricsBlockContent = settings.noLyrics
    ? 'Music Lyrics에 바로 붙여 넣을 구조 태그와 연주 지시'
    : 'Music Lyrics에 바로 붙여 넣을 가사';
  const perItem = settings.mode === 'single' ? '각 후보곡마다' : '각 트랙마다';
  return '아래 설정을 바탕으로 Music에서 바로 시작할 수 있는 "수노 패키지"를 만들어줘.\n\n'
    + '출력은 반드시 다음 항목 순서로 정리해줘.\n'
    + '1. 전체 패키지 콘셉트\n'
    + '2. 곡별 요청사항\n'
    + '3. 곡별 상세 패키지\n\n'
    + '곡별 상세 패키지는 ' + perItem + ' 아래 형식으로 작성해줘.\n'
    + '- 제목\n'
    + '- ' + lyricsBlockLabel + '\n'
    + '```text\n'
    + '여기에 ' + lyricsBlockContent + '만 작성\n'
    + '```\n'
    + '- Style Prompt 블록박스\n'
    + '```text\n'
    + '여기에 Music Style Prompt에 바로 붙여 넣을 스타일 프롬프트만 작성\n'
    + '```\n'
    + '- Music 설정 추천값\n'
    + '  - Weirdness: 챗봇이 곡 분위기/장르/실험성에 맞게 자율 판단\n'
    + '  - Style Influence: 챗봇이 장르 혼합도/스타일 선명도에 맞게 자율 판단\n'
    + '- 편곡 메모\n'
    + '- 감정선\n'
    + '- 사운드 질감\n'
    + '- 길이 계산 메모\n'
    + '- 구조 전개\n\n'
    + '기본 설정:\n'
    + '- 분류: ' + modeLabel + '\n'
    + '- 곡 형태: ' + formLabel + '\n'
    + '- 곡의 용도: ' + settings.purpose + '\n'
    + themeLine
    + '- 장르: ' + genreText(settings) + '\n'
    + singleOnlyLines(settings)
    + '\n- 목표 길이: ' + durationLabel(settings.duration) + '\n'
    + '- BPM: ' + (settings.bpm ? settings.bpm + ' BPM' : '직접 지정하지 않음. 아래 길이 계산 지시에 따라 추천 BPM을 먼저 고정') + '\n'
    + '- 곡 강도: ' + (settings.energy === '랜덤' ? '랜덤. 다른 설정값을 바탕으로 적절히 설정' : settings.energy) + '\n'
    + '- 분위기: ' + (settings.mood === '랜덤' ? '랜덤. 다른 설정값을 바탕으로 적절히 설정' : settings.mood) + '\n'
    + '- 곡 구성: ' + (settings.structure === '랜덤' ? '랜덤. 용도, 장르, 길이, 가사 분량을 바탕으로 적절히 설계' : settings.structure) + '\n'
    + lyricOnlyLines(settings) + '\n'
    + '- 원하지 않는 요소: ' + avoidText + '\n'
    + '- 스타일 프롬프트 언어: ' + settings.promptLanguage + '\n'
    + extraLine
    + '\n패키지 생성 지침:\n'
    + modeRule(settings)
    + '\n- 장르가 2개일 때는 단순 나열하지 말고 비중에 맞춰 실제적인 사운드를 설계한다.\n'
    + '- 언어가 2개일 때는 지정 비중을 지키되 발음, 훅, 감정선이 자연스럽게 들리도록 배치한다.\n'
    + '- Weirdness와 Style Influence 추천값은 곡마다 숫자로 명시하고, 왜 그 값이 적절한지 한 줄로 설명한다.\n\n'
    + '가사/무가사 지침:\n'
    + lyricRequirement(settings)
    + '\n\n길이 맞춤 지침:\n'
    + durationPlanText(settings)
    + '\n\n마지막 지침:\n'
    + '- Style Prompt는 Music가 이해하기 쉬운 음악 제작 키워드 중심으로 작성한다.\n'
    + '- 스타일 프롬프트 언어가 영어이면 Style Prompt 내용은 영어로 작성한다.\n'
    + '- 스타일 프롬프트 언어가 한국어이면 Style Prompt 내용은 한국어로 작성한다.\n'
    + '- 결과는 복사해서 바로 사용할 수 있게 군더더기 없이 작성한다.';
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function showCopied(button) {
  const original = button.textContent;
  button.textContent = '복사됨';
  button.classList.add('copied');
  window.setTimeout(() => {
    button.textContent = original;
    button.classList.remove('copied');
  }, 1300);
}

function setGenre(id, genre) {
  control(id).value = genre;
  document.querySelector('.genre-picker-button[data-target="' + id + '"] span').textContent = genre;
}

function syncBlendControls() {
  const genreMixDisabled = value('genreB') === '없음' || value('genreA') === value('genreB');
  control('genreMix').disabled = genreMixDisabled;
  control('genreMixWrap').classList.toggle('is-disabled', genreMixDisabled);
  control('genreMixValue').textContent = value('genreMix') + ' : ' + (100 - Number(value('genreMix')));
  const languageMixDisabled = isNoLyricsSelected()
    || value('languageB') === '없음'
    || value('languageA') === value('languageB');
  control('languageMix').disabled = languageMixDisabled;
  control('languageMixWrap').classList.toggle('is-disabled', languageMixDisabled);
  control('languageMixValue').textContent = value('languageMix') + ' : ' + (100 - Number(value('languageMix')));
}

function render() {
  syncModeState();
  syncLyricModeState();
  syncBlendControls();
  const settings = getSettings();
  const command = buildCommand(settings);
  results.innerHTML = '';
  const card = template.content.cloneNode(true);
  card.querySelector('.track-label').textContent = 'COMMAND';
  card.querySelector('h3').textContent = settings.mode === 'single'
    ? settings.trackCount + '개 싱글곡 후보 명령어'
    : settings.trackCount + '개 앨범 트랙 명령어';
  card.querySelector('.command-output').textContent = command;
  card.querySelector('.copy-track').addEventListener('click', event => {
    copyText(command);
    showCopied(event.currentTarget);
  });
  results.append(card);
  const plan = sectionBlueprint(settings);
  const bpmText = settings.bpm ? settings.bpm + ' BPM' : plan.bpm + ' BPM 추천';
  const modeText = settings.mode === 'single' ? '싱글곡 후보' : '앨범 트랙';
  const vocalText = settings.noLyrics ? '무가사곡' : voiceProfile(settings) + ' / ' + languageText(settings);
  summary.textContent = modeText + ' ' + settings.trackCount + '개 / ' + settings.purpose + ' / '
    + genreText(settings) + ' / ' + durationLabel(settings.duration) + ' / ' + bpmText + ' / ' + vocalText;
}

function serializeSettings() {
  const data = {};
  form.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.type === 'radio') {
      if (field.checked) data[field.name] = field.value;
      return;
    }
    data[field.id] = field.value;
  });
  return data;
}

function applySettings(data) {
  if (!data || typeof data !== 'object') return false;
  Object.entries(data).forEach(([key, raw]) => {
    const normalized = normalizeRandomField(key, raw);
    const radio = form.querySelector('input[type="radio"][name="' + key + '"][value="' + raw + '"]');
    if (radio) {
      radio.checked = true;
      return;
    }
    const field = document.getElementById(key);
    if (!field) return;
    field.value = normalized;
  });
  setGenre('genreA', value('genreA') || '케이팝');
  setGenre('genreB', value('genreB') || '없음');
  return true;
}

function setStatus(message) {
  if (!settingsStatus) return;
  settingsStatus.textContent = message;
  window.clearTimeout(settingsStatus.timer);
  settingsStatus.timer = window.setTimeout(() => {
    settingsStatus.textContent = '';
  }, 1600);
}

function settingsFilePayload() {
  return {
    app: 'Music Prompt Maker KR',
    version: '1.2',
    savedAt: new Date().toISOString(),
    settings: serializeSettings()
  };
}

function normalizeSettingsData(data) {
  if (data && typeof data === 'object' && data.settings && typeof data.settings === 'object') {
    return data.settings;
  }
  return data;
}

function normalizeRandomField(key, raw) {
  const text = String(raw || '').trim();
  if (key !== 'hookLyric') return text;
  if (!text || text === 'ㅊㅎㄹ') return '랜덤';
  return text;
}

function saveLocalSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeSettings()));
    return true;
  } catch (error) {
    return false;
  }
}

async function saveSettings(toFile = false) {
  if (!toFile) {
    saveLocalSettings();
    return;
  }
  const payload = settingsFilePayload();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: SETTINGS_FILE_NAME,
        types: [{ description: 'Music Prompt Maker 설정 파일', accept: { 'application/json': ['.json'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      saveLocalSettings();
      setStatus('파일 저장됨');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = SETTINGS_FILE_NAME;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    saveLocalSettings();
    setStatus('파일 다운로드됨');
  } catch (error) {
    if (error.name !== 'AbortError') setStatus('저장 취소/실패');
  }
}

function loadLocalSettings(showStatus = false) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (showStatus) setStatus('저장 없음');
      return false;
    }
    applySettings(normalizeSettingsData(JSON.parse(raw)));
    render();
    if (showStatus) setStatus('불러옴');
    return true;
  } catch (error) {
    if (showStatus) setStatus('불러오기 실패');
    return false;
  }
}

function readFallbackSettingsFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) {
        reject(new DOMException('No file selected', 'AbortError'));
        return;
      }
      file.text().then(resolve, reject);
    }, { once: true });
    input.click();
  });
}

async function loadSettings(fromFile = false) {
  if (!fromFile) {
    loadLocalSettings(false);
    return;
  }
  try {
    let text;
    if (window.showOpenFilePicker) {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [{ description: 'Music Prompt Maker 설정 파일', accept: { 'application/json': ['.json'] } }]
      });
      const file = await handle.getFile();
      text = await file.text();
    } else {
      text = await readFallbackSettingsFile();
    }
    const data = normalizeSettingsData(JSON.parse(text));
    if (!applySettings(data)) {
      setStatus('설정 파일 아님');
      return;
    }
    saveLocalSettings();
    render();
    setStatus('파일 불러옴');
  } catch (error) {
    if (error.name !== 'AbortError') setStatus('불러오기 실패');
  }
}

function queueAutoSave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveSettings(false), 250);
}

function buildGenreModal(search = '') {
  const list = document.querySelector('#genreGroupList');
  const keyword = search.trim().toLowerCase();
  list.innerHTML = '';
  if (genreTarget === 'genreB') {
    const noneButton = document.createElement('button');
    noneButton.type = 'button';
    noneButton.className = 'genre-choice is-none';
    noneButton.textContent = '없음';
    noneButton.addEventListener('click', () => chooseGenre('없음'));
    list.append(noneButton);
  }
  Object.entries(genreGroups).forEach(([group, genres]) => {
    const matched = keyword
      ? genres.filter(genre => genre.toLowerCase().includes(keyword) || group.toLowerCase().includes(keyword))
      : genres;
    if (!matched.length) return;
    const section = document.createElement('section');
    section.className = 'genre-group';
    section.innerHTML = '<h3>' + group + '</h3>';
    const grid = document.createElement('div');
    grid.className = 'genre-choice-grid';
    matched.forEach(genre => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'genre-choice';
      button.textContent = genre;
      if (genre === value(genreTarget)) button.classList.add('is-selected');
      button.addEventListener('click', () => chooseGenre(genre));
      grid.append(button);
    });
    section.append(grid);
    list.append(section);
  });
}

function openGenreModal(target) {
  genreTarget = target;
  document.querySelector('#genreModalTitle').textContent = target === 'genreA' ? '장르 1 선택' : '장르 2 선택';
  document.querySelector('#genreSearch').value = '';
  buildGenreModal();
  document.querySelector('#genreModal').hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector('#genreSearch').focus();
}

function closeGenreModal() {
  document.querySelector('#genreModal').hidden = true;
  document.body.classList.remove('modal-open');
  genreTarget = null;
}

function chooseGenre(genre) {
  if (!genreTarget) return;
  setGenre(genreTarget, genre);
  closeGenreModal();
  render();
  queueAutoSave();
}

fillSelect(control('languageA'), languageOptions, '한국어', true);
fillSelect(control('languageB'), languageOptions, '없음', true);
setGenre('genreA', value('genreA') || '케이팝');
setGenre('genreB', value('genreB') || '없음');

['density', 'voiceTone', 'voiceAge', 'voiceGender', 'languageA', 'languageB', 'languageMix', 'hook', 'rhyme'].forEach(id => {
  control(id).addEventListener('change', handleLyricModeChange);
  control(id).addEventListener('input', handleLyricModeChange);
});

control('trackPreset').addEventListener('change', event => {
  if (event.target.value !== 'custom') control('trackCount').value = event.target.value;
  render();
  queueAutoSave();
});

control('trackCount').addEventListener('input', () => {
  control('trackPreset').value = 'custom';
  render();
  queueAutoSave();
});

document.querySelectorAll('.genre-picker-button').forEach(button => {
  button.addEventListener('click', () => openGenreModal(button.dataset.target));
});

document.querySelector('#genreModalClose').addEventListener('click', closeGenreModal);

document.querySelector('#genreModal').addEventListener('click', event => {
  if (event.target.id === 'genreModal') closeGenreModal();
});

document.querySelector('#genreSearch').addEventListener('input', event => {
  buildGenreModal(event.target.value);
});

document.querySelector('#saveSettings').addEventListener('click', () => saveSettings(true));
document.querySelector('#loadSettings').addEventListener('click', () => loadSettings(true));
document.querySelector('#resetSettings').addEventListener('click', () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {}
  form.reset();
  lyricBackup = { ...lyricDefaults };
  lyricGroupWasNone = false;
  setGenre('genreA', '케이팝');
  setGenre('genreB', '없음');
  render();
  setStatus('초기화됨');
});

form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => {
    if (['density', 'voiceTone', 'voiceAge', 'voiceGender', 'languageA', 'languageB', 'languageMix', 'hook', 'rhyme', 'trackCount'].includes(field.id)) return;
    render();
    queueAutoSave();
  });
  field.addEventListener('change', queueAutoSave);
});

form.addEventListener('submit', event => {
  event.preventDefault();
  render();
  saveSettings(false);
});

loadSettings(false);
render();
