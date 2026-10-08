import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import DATA from './curriculum-data';
import { SchoolIntro } from './components/SchoolIntro';
import { ProgramHighlights } from './components/ProgramHighlights';
import { ClosingVision } from './components/ClosingVision';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  List,
  Maximize2,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';



const semesterKeys = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
const semesterNames = ['1학년 1학기', '1학년 2학기', '2학년 1학기', '2학년 2학기', '3학년 1학기', '3학년 2학기'];
const levelNames: Record<string, string> = {
  '100공통': '공통',
  '200선택': '선택',
  '300전문I': '전문Ⅰ',
  '400전문II': '전문Ⅱ',
};
const levelColors: Record<string, string> = {
  '100공통': '#a1aaa2',
  '200선택': '#6794a4',
  '300전문I': '#b48755',
  '400전문II': '#88739a',
};
const sections = [
  { id: 'school', title: 'KMLA 교육', label: '학교 소개' },
  { id: 'learning-arc', title: '3년의 배움', label: '학습 흐름' },
  { id: 'programs', title: 'AP · R&E', label: '심화와 탐구' },
  { id: 'pathways', title: '진로별 경로', label: '경로 예시' },
  { id: 'comparison', title: '교육과정 비교', label: '비교 보기' },
  { id: 'catalog', title: '전체 과목', label: '과목 찾아보기' },
  { id: 'notes', title: '자료와 안내', label: '자료 안내' },
  { id: 'closing', title: '마무리', label: '학교 설립 정신' },
];

type Pathway = {
  key: string;
  desc: string;
  sem: Record<string, string[]>;
};
type CatalogCourse = { name: string; level: string; grade: string };
type Dialog = 'contents' | 'notes' | null;

function App() {
  const [pathwayIndex, setPathwayIndex] = useState(0);
  const [subject, setSubject] = useState('수학');
  const [query, setQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('전체');
  const [openSubjects, setOpenSubjects] = useState<string[]>(Object.keys(DATA.SUBJECT_CATALOG));
  const [light, setLight] = useState(false);
  const night = !light;
  const setNight = (fn: (v: boolean) => boolean) => setLight((v) => !fn(!v));
  const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState('');
  const [pathSearch, setPathSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const pathways = DATA.MODEL_PATHWAYS as Pathway[];
  const catalog = DATA.SUBJECT_CATALOG as Record<string, CatalogCourse[]>;
  const comparisons = DATA.SCHOOL_COMPARE_DATA as Record<string, any[]>;
  const pathway = pathways[pathwayIndex];

  const filteredCatalog = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return Object.entries(catalog).map(([category, courses]) => {
      const filtered = courses.filter((course) => {
        const queryMatches =
          !normalized ||
          `${course.name} ${category} ${course.grade} ${levelNames[course.level]}`
            .toLocaleLowerCase()
            .includes(normalized);
        return queryMatches && (activeLevel === '전체' || levelNames[course.level] === activeLevel);
      });
      return [category, filtered] as const;
    }).filter(([, courses]) => courses.length > 0);
  }, [activeLevel, catalog, query]);

  const totalFiltered = filteredCatalog.reduce((sum, [, courses]) => sum + courses.length, 0);

  useEffect(() => {
    let mounted = true;
    const restoreAnchor = () => {
      if (!mounted) return;
      const id = window.location.hash.slice(1);
      if (id && (id === 'top' || sections.some((section) => section.id === id))) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };
    const frame = window.requestAnimationFrame(restoreAnchor);
    void document.fonts.ready.then(restoreAnchor);
    window.addEventListener('hashchange', restoreAnchor);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', restoreAnchor);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches('input, textarea, select') || dialog) {
        if (event.key === 'Escape' && dialog) setDialog(null);
        return;
      }
      if (target.closest('button, a') && ['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key.toLowerCase() === 't') setDialog('contents');
      if (event.key.toLowerCase() === 'o') setDialog('contents');
      if (event.key.toLowerCase() === 'n') setDialog('notes');
      if (event.key.toLowerCase() === 'd') setNight((value) => !value);
      if (event.key.toLowerCase() === 'f') void toggleFullscreen();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setPathwayIndex((index) => Math.min(pathways.length - 1, index + 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setPathwayIndex((index) => Math.max(0, index - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog, pathways.length]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const jumpTo = (id: string) => {
    setDialog(null);
    window.history.replaceState(null, '', `#${id}`);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setToast('전체 화면은 브라우저 설정에서 사용할 수 있습니다.');
    }
  };

  const jumpToCourse = (course: CatalogCourse) => {
    setToast(`${course.name} · ${levelNames[course.level]} · 대상 학년 ${course.grade}`);
    const pathIndex = pathways.findIndex((item) =>
      Object.values(item.sem).some((names) => names.some((name) => name.includes(course.name) || course.name.includes(name))),
    );
    if (pathIndex >= 0) {
      setPathwayIndex(pathIndex);
      jumpTo('pathways');
    } else {
      setOpenSubjects((current) => current.includes(Object.keys(catalog).find((key) => catalog[key].some((item) => item.name === course.name)) || '')
        ? current
        : [...current, Object.keys(catalog).find((key) => catalog[key].some((item) => item.name === course.name)) || '']);
    }
  };

  const toggleSubject = (category: string) => {
    setOpenSubjects((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  return (
    <div className={`kmla-root${light ? ' light' : ''}`}>
      <header className="app-header">
        <div className="header-row">
          <a className="brand-lockup" href="#top" aria-label="KMLA 교육과정 첫 화면">
            <img className="brand-seal" src={`${base}images/school_mark.png`} alt="" width={38} height={38} />
            <span className="brand-name">
              민족사관고등학교
              <small>KOREAN MINJOK LEADERSHIP ACADEMY</small>
            </span>
          </a>
          <div className="header-tools">
            <button className="tool-btn hide-mobile" onClick={() => setDialog('contents')} data-testid="button-open-contents" aria-label="목차 열기">
              목차 <span className="key-hint">T</span>
            </button>
            <button className="tool-btn hide-mobile" onClick={() => setDialog('notes')} data-testid="button-open-notes" aria-label="자료 안내 열기">
              자료 안내 <span className="key-hint">N</span>
            </button>
            <a className="tool-btn hide-mobile" href={`${base}original-presentation.html`} target="_blank" rel="noreferrer" data-testid="link-original-header" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>원본 발표</a>
            <button className="tool-btn icon-tool" onClick={() => setNight((value) => !value)} data-testid="button-toggle-theme" aria-label={night ? '밝은 테마로 변경' : '네이비 테마로 변경'} title="테마 변경 (D)">
              {night ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="tool-btn icon-tool" onClick={() => void toggleFullscreen()} data-testid="button-fullscreen" aria-label="전체 화면" title="전체 화면 (F)">
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-shell" id="top">
        <section className="hero motion-in" aria-labelledby="main-title">
          <div className="hero-copy">
            <div className="eyebrow">KMLA · CURRICULUM GUIDE</div>
            <h1 id="main-title">나의 가능성을<br /><em>설계하는</em> 교육과정</h1>
            <p className="hero-desc">
              민족주체성에 뿌리를 두고 영재교육과 글로벌 리더십으로 나아가는 민족사관고등학교.
              3년의 학습 흐름부터 한 과목씩, 내게 맞는 길을 찾아보세요.
            </p>
            <div className="hero-cta">
              <button className="primary-action" onClick={() => jumpTo('pathways')} data-testid="button-explore-pathways">
                진로 경로 살펴보기 <ArrowDown size={14} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
              </button>
              <button className="secondary-action" onClick={() => jumpTo('catalog')} data-testid="button-find-course">
                과목 찾아보기 <Search size={14} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
              </button>
            </div>
          </div>
          <aside className="hero-ledger" aria-label="교육과정 한눈에 보기">
            <div className="ledger-top">
              <img src={`${base}images/school_mark.png`} alt="민족사관고등학교 교표" width={64} height={64} />
              <span>2022 개정 교육과정<small>원문 편제표 기준</small></span>
            </div>
            <dl className="ledger-stats">
              <div><dt>수록 과목</dt><dd>{DATA.stats.total}</dd></div>
              <div><dt>학기별 경로</dt><dd>{pathways.length}</dd></div>
              <div><dt>학기</dt><dd>6</dd></div>
            </dl>
            <ol className="ledger-steps">
              <li><b>탐색</b><span>1학년 · 공통과 선택으로 넓게</span></li>
              <li><b>심화</b><span>2학년 · AP와 전문과목으로 깊게</span></li>
              <li><b>융합</b><span>3학년 · R&amp;E로 연결하고 확장</span></li>
            </ol>
          </aside>
        </section>

        <nav className="chapter-nav" aria-label="교육과정 장 이동">
          <span className="chapter-kicker">CONTENTS</span>
          {sections.map((section, index) => (
            <button key={section.id} onClick={() => jumpTo(section.id)} data-testid={`nav-chapter-${section.id}`}>
              <span className="nav-number">{String(index + 1).padStart(2, '0')}</span> {section.title}
            </button>
          ))}
        </nav>

        <SchoolIntro />

        <section className="section" id="learning-arc">
          <div className="section-head">
            <div><div className="section-index">02 / LEARNING ARC</div><h2>탐색에서 융합으로,<br />3년의 배움이 이어집니다</h2></div>
            <p>학년이 올라갈수록 선택의 폭과 학습의 깊이를 넓히고, 서로 다른 배움을 연결하는 흐름을 제시합니다.</p>
          </div>
          <div className="arc-cards">
            {[
              { no: '01', title: '탐색', period: '1학년 · 넓게 살펴보기', body: '공통 과목으로 여러 학문의 토대를 다지고, 선택 과목으로 관심의 방향을 발견합니다.' },
              { no: '02', title: '심화', period: '2학년 · 깊게 파고들기', body: '관심 분야의 선택 과목과 전문 과목을 통해 질문을 구체화하고 학습의 깊이를 더합니다.' },
              { no: '03', title: '융합', period: '3학년 · 연결하고 확장하기', body: '고급·전문 학습을 이어가며 분야 사이의 연결을 탐구하고 나만의 학업 방향을 다듬습니다.' },
            ].map((item) => (
              <article className="arc-card" key={item.no}>
                <span className="num">{item.no}</span><div className="eyebrow">{item.period}</div>
                <h3>{item.title}</h3><p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="section-note">학습 흐름은 교육과정 안내 자료의 탐색·심화·융합 구성을 읽기 쉽게 정리한 것입니다. 실제 이수 과목과 학기는 아래 진로별 예시를 확인하세요.</div>
        </section>

        <ProgramHighlights catalog={catalog} />

        <section className="section" id="pathways">
          <div className="section-head">
            <div><div className="section-index">04 / PATHWAY EXAMPLES</div><h2>관심에서 출발하는<br />여섯 가지 학기별 경로</h2></div>
            <p>진로별 수강 예시를 6개 학기 흐름으로 살펴봅니다. 예시는 진로를 위한 한 가지 경로이며, 학생별 선택을 제한하지 않습니다.</p>
          </div>
          <div className="path-tools">
            <label htmlFor="pathway-select">예시 경로</label>
            <select id="pathway-select" className="path-select" value={pathwayIndex} onChange={(event) => setPathwayIndex(Number(event.target.value))} data-testid="select-career-path">
              {pathways.map((item, index) => <option key={item.key} value={index}>{item.key}</option>)}
            </select>
            <input
              className="search-box"
              type="search"
              value={pathSearch}
              onChange={(event) => setPathSearch(event.target.value)}
              placeholder="이 경로의 과목 검색"
              aria-label="선택한 경로에서 과목 검색"
              data-testid="input-pathway-search"
            />
          </div>
          <p className="path-description">{pathway.desc}</p>
          <div className="semester-track" aria-label={`${pathway.key} 6개 학기 과목`}>
            {semesterKeys.map((semester, index) => {
              const courses = pathway.sem[semester] || [];
              const visible = courses.filter((course) => !pathSearch || course.toLocaleLowerCase().includes(pathSearch.toLocaleLowerCase()));
              return (
                <article className="semester-card" key={semester} data-testid={`semester-card-${semester}`}>
                  <span className="semester-meta">{String(index + 1).padStart(2, '0')} / SEMESTER</span>
                  <h3>{semesterNames[index]}</h3>
                  {visible.length ? visible.map((course, courseIndex) => (
                    <button key={`${course}-${courseIndex}`} className="course-pill" onClick={() => setToast(`${course} · 원문 진로별 이수 예시`)} data-testid={`button-path-course-${index}-${courseIndex}`}>
                      {course}
                    </button>
                  )) : <div className="empty-state">검색 결과가 없습니다.</div>}
                </article>
              );
            })}
          </div>
          <div className="path-controls">
            <span className="section-note">과목명과 학기 배치는 원문 경로 예시를 그대로 보존했습니다.</span>
            <div>
              <button className="secondary-action" onClick={() => setPathwayIndex((index) => Math.max(index - 1, 0))} disabled={pathwayIndex === 0} data-testid="button-previous-path">이전 경로</button>{' '}
              <button className="secondary-action" onClick={() => setPathwayIndex((index) => Math.min(index + 1, pathways.length - 1))} disabled={pathwayIndex === pathways.length - 1} data-testid="button-next-path">다음 경로</button>
            </div>
          </div>
        </section>

        <section className="section" id="comparison">
          <div className="section-head">
            <div><div className="section-index">05 / COMPARISON</div><h2>같은 교과, 다른 선택의 폭</h2></div>
            <p>원문 비교 자료에서 교과별 개설 예시를 선택해 살펴봅니다. 표는 해당 자료에 수록된 과목과 학기만 나타냅니다.</p>
          </div>
          <div className="path-tools">
            <label htmlFor="comparison-subject">비교 교과</label>
            <select id="comparison-subject" className="path-select" value={subject} onChange={(event) => setSubject(event.target.value)} data-testid="select-comparison-subject">
              {Object.keys(comparisons).map((name) => <option value={name} key={name}>{name}</option>)}
            </select>
          </div>
          <div className="compare-panel">
            <div className="compare-scroll">
              <table className="compare-table">
                <thead><tr><th scope="col">학교 · 선택 예시</th>{semesterNames.map((name) => <th scope="col" key={name}>{name}</th>)}</tr></thead>
                <tbody>
                  {(comparisons[subject] || []).flatMap((school) => {
                    const tracks = school.tracks || [{ label: '', sem: school.sem }];
                    return tracks.map((track: any, index: number) => (
                      <tr className={school.home ? 'home-row' : ''} key={`${school.name}-${track.label}-${index}`}>
                        <td>{school.name}{track.label ? <small className="compare-track">{track.label}</small> : null}</td>
                        {semesterKeys.map((semester) => {
                          const values = track.sem[semester] || [];
                          return <td key={semester}>{values.length ? values.map((entry: any, itemIndex: number) => {
                            if (entry?.or) return <span className="compare-or" key={`or-${itemIndex}`}>또는</span>;
                            const label = typeof entry === 'string' ? entry : entry?.n || '';
                            return label ? <span className="compare-course" key={`${label}-${itemIndex}`}>{label}</span> : null;
                          }) : <span className="compare-empty">—</span>}</td>;
                        })}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
            <div className="section-note">민족사관고와 자공고 비교 예시를 원문 표기 그대로 제공합니다. 빈 칸은 비교 자료에 해당 학기 과목이 수록되지 않았음을 뜻합니다.</div>
          </div>
        </section>

        <section className="section" id="catalog">
          <div className="section-head">
            <div><div className="section-index">06 / COURSE CATALOG</div><h2>전체 과목을 찾아보기</h2></div>
            <p>교과, 과목명, 학년, 이수 구분으로 검색합니다. 표기된 대상 학년과 과목 구분은 원본 과목 목록을 따릅니다.</p>
          </div>
          <div className="catalog-toolbar">
            <label className="catalog-search">
              <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="과목명 또는 교과 검색" data-testid="input-course-search" />
              <span><Search size={15} /></span>
            </label>
            <div className="filter-row" aria-label="이수 단계 필터">
              {['전체', '공통', '선택', '전문Ⅰ', '전문Ⅱ'].map((level) => (
                <button className={`filter-chip${activeLevel === level ? ' active' : ''}`} onClick={() => setActiveLevel(level)} key={level} data-testid={`filter-course-level-${level}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="catalog-status" role="status" data-testid="status-course-results">{totalFiltered} / {DATA.stats.total}개 과목 표시 · 검색 단축키 /</div>
          <div className="subject-list">
            {filteredCatalog.map(([category, courses]) => {
              const expanded = openSubjects.includes(category);
              return (
                <section className="subject-group" key={category}>
                  <button className="subject-heading" onClick={() => toggleSubject(category)} aria-expanded={expanded} data-testid={`button-toggle-subject-${category}`}>
                    <h3>{category}</h3>
                    <span>{courses.length} 과목　{expanded ? <ChevronUp size={14} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={14} style={{ verticalAlign: 'middle' }} />}</span>
                  </button>
                  {expanded && <div className="subject-courses">
                    {courses.map((course, index) => (
                      <button className="catalog-item" key={`${category}-${course.name}`} onClick={() => jumpToCourse(course)} data-testid={`button-course-${category}-${index}`}>
                        <span className="level-mark" style={{ '--level': levelColors[course.level] } as CSSProperties} />
                        <span><strong>{course.name}</strong><small>{levelNames[course.level]} · 대상 학년 {course.grade}</small></span>
                      </button>
                    ))}
                  </div>}
                </section>
              );
            })}
            {!totalFiltered && <div className="empty-state">일치하는 과목이 없습니다. 검색어를 바꾸거나 이수 단계 필터를 초기화해 보세요.</div>}
          </div>
          <div className="level-legend">
            {Object.entries(levelNames).map(([level, label]) => <span key={level} style={{ '--level': levelColors[level] } as CSSProperties}>{label}</span>)}
          </div>
        </section>

        <section className="section" id="notes">
          <div className="section-head">
            <div><div className="section-index">07 / REFERENCE</div><h2>원문을 기준으로, 읽기 쉽게</h2></div>
            <p>탐색을 돕는 화면과 과목 데이터의 출처를 구분해, 예시를 실제 이수 보장이나 개인별 권장으로 오해하지 않도록 안내합니다.</p>
          </div>
          <div className="references">
            <article className="reference-card">
              <h3>이수 구조 읽기</h3>
              <p>{DATA.INFO_TIERS.map((tier: any) => `${tier.name} — ${tier.line} (예: ${tier.ex})`).join('\n')}</p>
            </article>
            <article className="reference-card">
              <h3>진로별 경로 예시</h3>
              <p>원문 자료의 「{DATA.pathwaysSource.section}」에 수록된 예시입니다. 과목명과 학기 배치는 원문 그대로 보존했습니다. 개별 학생의 실제 이수 과목은 학교의 수강 안내와 개설 현황을 확인하세요.</p>
              <p className="source-string">원문 확인 기준 · {DATA.pathwaysSource.verifiedAt}</p>
            </article>
            <article className="reference-card">
              <h3>비교 자료</h3>
              <p>교과별 비교 표는 원문 교육과정 안내의 민족사관고 및 타학교 수강 과목 예시를 바탕으로 표시합니다. 각 학교의 교육과정 전부를 비교하거나 우열을 뜻하지 않습니다.</p>
            </article>
            <article className="reference-card">
              <h3>자료 안내와 단축키</h3>
              <p>목차·전체 보기 T / O · 자료 안내 N · 과목 검색 / · 경로 위/아래 ↑ ↓ · 화면 전환 D · 전체 화면 F<br />원본 기준: 교육과정 안내 및 교과별 개설 과목 자료. 원문 발표 노트는 원본 웹 자료에서 확인할 수 있습니다.</p>
              <a className="source-link" href={DATA.pathwaysSource.url} target="_blank" rel="noreferrer">원본 교육과정 자료 열기 <ArrowUpRight size={14} /></a>
              <a className="source-link" href={`${base}original-presentation.html`} target="_blank" rel="noreferrer" data-testid="link-original-presentation">원본 발표 자료와 노트 열기 <ArrowUpRight size={14} /></a>
            </article>
          </div>
        </section>

        <ClosingVision url={DATA.pathwaysSource.url} onJump={jumpTo} />

        <footer className="app-footer">
          <span>민족사관고등학교 · 교육과정 안내</span>
          <span>과목명과 예시 배치는 제공된 원문 자료를 기준으로 합니다.</span>
          <button className="footer-toc" onClick={() => setDialog('contents')} data-testid="button-footer-contents"><List size={13} /> 목차</button>
        </footer>
      </main>

      {dialog && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}>
        <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <header className="dialog-top">
            <h2 id="dialog-title">{dialog === 'contents' ? '교육과정 목차' : '발표 자료와 안내'}</h2>
            <button className="dialog-close" onClick={() => setDialog(null)} data-testid="button-close-dialog" aria-label="닫기"><X size={15} /></button>
          </header>
          {dialog === 'contents' ? (
            <div className="toc-list">
              {sections.map((section, index) => <button key={section.id} onClick={() => jumpTo(section.id)} data-testid={`dialog-jump-${section.id}`}>
                <small>0{index + 1} / {section.label}</small>{section.title}
              </button>)}
            </div>
          ) : (
            <div className="notes-copy">
              <p>교육과정 안내 및 교과별 개설 과목을 기준으로 구성했습니다. 전체 과목 목록, 과목 구분, 대상 학년, 학기별 진로 경로와 교과 비교 예시는 제공된 원문 자료를 따릅니다.</p>
              <p>진로별 경로는 학습을 탐색하기 위한 예시로, 개인별 수강 계획이나 이수 의무를 의미하지 않습니다. 실제 과목 개설·이수 정보는 학교의 안내를 확인해 주세요.</p>
              <p className="source-string">자료 기준 · {DATA.pathwaysSource.verifiedAt} · 경로 항목 {pathways.length}개 · 과목 {DATA.stats.total}개</p>
              <a className="source-link" href={DATA.pathwaysSource.url} target="_blank" rel="noreferrer"><BookOpen size={14} /> 원본 교육과정 자료 열기 <ArrowUpRight size={14} /></a>
              <a className="source-link" href={`${base}original-presentation.html`} target="_blank" rel="noreferrer" data-testid="link-original-dialog">원본 발표 자료 전체와 노트 열기 <ArrowUpRight size={14} /></a>
            </div>
          )}
        </section>
      </div>}
      {toast && <div className="toast-note" role="status" data-testid="status-course-detail">{toast}</div>}
    </div>
  );
}

export default App;
