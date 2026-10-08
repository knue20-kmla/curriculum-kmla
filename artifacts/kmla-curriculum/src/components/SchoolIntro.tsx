import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';

const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;
const img = (name: string) => `${base}images/${name}`;

const tabs = [
  { label: '민족주체성 교육', en: 'IDENTITY', href: 'https://www.minjok.hs.kr/sub02/sub01' },
  { label: '영재교육', en: 'GIFTED EDUCATION', href: 'https://www.minjok.hs.kr/sub02/sub02' },
  { label: '글로벌 리더십 교육', en: 'GLOBAL LEADERSHIP', href: 'https://www.minjok.hs.kr/sub02/sub03' },
];

const identityCards = [
  { no: '01', title: '민족의식 함양', body: '충무공의 헌신 · 다산의 실사구시\n민족교육관 · 역사 현장학습' },
  { no: '02', title: '전통적 가치 계승', body: '혼정신성 · 성년례\n사은의 날 · 3세대 민속 한마당' },
  { no: '03', title: '전통문화 체득', body: '생활한복 · 가야금·대금 · 한국화\n국궁 · 태권도·검도' },
];

const principles = [
  ['다양한 심화 선택 과목과', '선택 중심 교육과정'],
  ['능력과 적성에 따른', '계열·학년 개방 융합교육과정'],
  ['3단계 교육법을 통한', '토론 및 독서교육의 생활화'],
  ['글로벌', '역량 강화 교육과정'],
  ['교사 교실(연구실)제'],
];

const governance = [
  ['입법', '규칙과 제도'],
  ['행정', '실행과 운영'],
  ['사법', '공정한 판단'],
];

function Pentagon() {
  const cx = 300, cy = 270, r = 190;
  const pts = principles.map((_, i) => {
    const a = (-90 + i * 72) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return (
    <svg className="principle-svg" viewBox="40 20 520 500" role="img" aria-label="5가지 핵심 교육 원칙">
      <polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinejoin="round" opacity=".7" />
      <text x={cx} y={cy - 18} textAnchor="middle" className="pg-center">
        <tspan x={cx}>5가지</tspan><tspan x={cx} dy="34">핵심 교육</tspan><tspan x={cx} dy="34">원칙</tspan>
      </text>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="22" fill="var(--paper)" stroke="var(--brass)" strokeWidth="2" />
          <text x={p.x} y={p.y + 6} textAnchor="middle" className="pg-no">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

export function SchoolIntro() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (event: KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <section className="section" id="school" aria-labelledby="school-title">
      <div className="section-head">
        <div>
          <div className="section-index">01 / KMLA EDUCATION</div>
          <h2 id="school-title">세 가지 교육 방향이<br />교육과정의 뿌리입니다</h2>
        </div>
        <p>학교 공식 홈페이지의 민족주체성 교육, 영재교육, 글로벌 리더십 교육 소개를 바탕으로 요약했습니다. 아래 도표는 이해를 돕기 위한 재구성이며, 고정된 선수 이수 순서나 별도의 필수 이수 요건이 아닙니다.</p>
      </div>

      <div className="vision-tabs" role="tablist" aria-label="KMLA 교육의 세 방향">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            id={`vision-tab-${i}`}
            aria-controls={`vision-panel-${i}`}
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            className={active === i ? 'on' : ''}
            onClick={() => setActive(i)}
            onKeyDown={(event) => onKey(event, i)}
            data-testid={`tab-vision-${i}`}
          >
            <small>0{i + 1}</small>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="vision-panel" role="tabpanel" id="vision-panel-0" aria-labelledby="vision-tab-0" hidden={active !== 0}>
        <div className="identity-layout">
          <figure className="photo-frame">
            <img src={img('school_identity.png')} alt="가장 한국적인 것이 가장 세계적인 리더십입니다라는 문구와 전통 한옥 이미지" loading="lazy" />
            <figcaption>민족주체성 교육 · 전통문화와 리더십</figcaption>
          </figure>
          <div>
            <div className="eyebrow">IDENTITY</div>
            <h3 className="panel-title">우리의 뿌리를 이해하고<br />세계와 만나는 교육</h3>
            <p className="panel-lead">역사와 문화를 지식으로 배우고, 예절과 예술, 생활 속에서 직접 익힙니다.</p>
            <div className="vcards">
              {identityCards.map((card) => (
                <article className="vcard" key={card.no}>
                  <span>{card.no}</span>
                  <h4>{card.title}</h4>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="vision-panel" role="tabpanel" id="vision-panel-1" aria-labelledby="vision-tab-1" hidden={active !== 1}>
        <div className="gifted-layout">
          <Pentagon />
          <div>
            <div className="eyebrow">GIFTED EDUCATION</div>
            <h3 className="panel-title">5가지 핵심 교육 원칙</h3>
            <ol className="principle-list">
              {principles.map((lines, i) => (
                <li key={i}><span>{i + 1}</span><p>{lines.join(' ')}</p></li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="vision-panel" role="tabpanel" id="vision-panel-2" aria-labelledby="vision-tab-2" hidden={active !== 2}>
        <div className="global-layout">
          <figure className="photo-frame">
            <img src={img('school_global.png')} alt="세계로 이어지는 민사고 동문 네트워크 지도" loading="lazy" />
            <figcaption>글로벌 동문 네트워크</figcaption>
          </figure>
          <div className="global-stack">
            <article className="gcard">
              <small>01 · VISION TRIP</small>
              <h4>선배와의 만남, 진로의 발견</h4>
              <div className="trip-row"><b>1학년 · 미국</b><span aria-hidden="true">→</span><b>2학년 · 국내</b></div>
            </article>
            <article className="gcard">
              <small>02 · LANGUAGE &amp; PARTNERSHIP</small>
              <h4>영어 상용 정책(EOP)과 대학 교류</h4>
              <div className="tag-row"><span>EOP TV</span><span>런치 테이블</span><span>말하기 대회</span></div>
              <p><b>St. John’s College · 홍콩대학교(HKU)</b><br />교수진 세미나 · 대학 체험 및 전공 수업</p>
            </article>
            <article className="gcard">
              <small>03 · STUDENT LEADERSHIP</small>
              <h4>학생 자치로 다져지는 리더십</h4>
              <div className="gov-row">
                {governance.map(([name, desc]) => <div key={name}><b>{name}</b><span>{desc}</span></div>)}
              </div>
              <p><b>모든 학생이 한 부서에서 3년간 참여</b></p>
            </article>
          </div>
        </div>
      </div>

      <a className="source-link" href={tabs[active].href} target="_blank" rel="noreferrer" data-testid={`link-school-source-${active}`}>
        학교 홈페이지 · {tabs[active].label} <ArrowUpRight size={14} />
      </a>
    </section>
  );
}
