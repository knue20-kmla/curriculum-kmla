type Course = { name: string; level: string; grade: string };

const planning = [
  ['01', '질문을 정하기', '관심 분야를 직업명뿐 아니라 탐구하고 싶은 질문으로 표현해 봅니다.'],
  ['02', '중심 교과 연결', '기초와 후속 과목을 찾아 배움이 어떻게 이어지는지 구성합니다.'],
  ['03', '도구와 균형 더하기', '수학·언어·정보를 더하고 필수 이수와 학습 부담을 함께 살핍니다.'],
  ['04', '상담으로 구체화', '실제 개설·시간표·선수조건을 확인하고 다음 학기의 선택을 조정합니다.'],
];

const stages = [
  ['01', '탐색', '기초 · 공통 과목', '8개 교과 영역에서 학문의 기초를 쌓습니다.'],
  ['02', '심화', 'AP · 전문교과 Ⅰ·Ⅱ', '한 분야의 안쪽으로 깊이 들어갑니다.'],
  ['03', '융합', 'R&E · 실험 · 융합탐구', '서로 다른 배움을 하나의 탐구로 연결합니다.'],
];

const mathTiers = [
  ['공통', '공통의 기반', ['공통수학1', '공통수학2']],
  ['선택', '개념의 확장', ['대수', '미적분I']],
  ['전문Ⅰ', '이론의 심화', ['고급 대수', '고급 미적분']],
  ['전문Ⅱ', '전공 기초로 확장', ['선형대수학', '미분 방정식', '벡터 미적분학']],
] as const;

export function ProgramHighlights({ catalog }: { catalog: Record<string, Course[]> }) {
  const apByCategory = Object.entries(catalog)
    .map(([category, list]) => [category, list.filter((c) => /^AP/.test(c.name))] as const)
    .filter(([, list]) => list.length > 0);
  const apTotal = apByCategory.reduce((sum, [, list]) => sum + list.length, 0);
  const research = Object.values(catalog).flat().filter((c) => /R&E|과제연구/.test(c.name));

  return (
    <section className="section" id="programs" aria-labelledby="programs-title">
      <div className="section-head">
        <div>
          <div className="section-index">03 / AP · R&amp;E</div>
          <h2 id="programs-title">깊이를 더하는 AP,<br />질문을 완성하는 R&amp;E</h2>
        </div>
        <p>교육과정 편제표의 과목명에서 직접 집계했습니다. AP 수강 자체가 AP 시험 성적이나 대학 학점 인정을 보장하지는 않습니다.</p>
      </div>

      <div className="stage-row">
        {stages.map(([no, title, sub, body]) => (
          <article className="stage" key={no}>
            <span>{no}</span><h3>{title}</h3><b>{sub}</b><p>{body}</p>
          </article>
        ))}
      </div>

      <div className="tier-block">
        <div className="eyebrow">MATH · FOUR TIERS</div>
        <h3 className="panel-title">수학으로 보는 네 단계의 확장</h3>
        <div className="tier-grid">
          {mathTiers.map(([name, line, list], i) => (
            <div key={name}><span>0{i + 1}</span><h4>{name}</h4><b>{line}</b><ul>{list.map((n) => <li key={n}>{n}</li>)}</ul></div>
          ))}
        </div>
        <p className="section-note">수학 교과의 수준별 과목 예시이며 공식 선수과목 순서나 필수 이수 경로를 뜻하지 않습니다.</p>
      </div>

      <div className="ap-block">
        <div className="ap-head">
          <div className="eyebrow">ADVANCED PLACEMENT</div>
          <p className="ap-total"><strong>{apTotal}</strong> AP 명칭 과목 · 단계별 개별 과목 수</p>
        </div>
        <div className="ap-grid">
          {apByCategory.map(([category, list]) => (
            <section className="ap-col" key={category} data-testid={`ap-category-${category}`}>
              <header><h3>{category}</h3><b>{list.length}</b></header>
              <ul>{list.map((c) => <li key={c.name}>{c.name}</li>)}</ul>
            </section>
          ))}
        </div>
      </div>

      <div className="re-block">
        <div>
          <div className="eyebrow">RESEARCH &amp; EDUCATION</div>
          <h3 className="panel-title">질문에서 발견으로</h3>
          <p className="panel-lead">주제를 정하고 탐구를 설계하며 배운 지식을 자신의 설명으로 완성합니다. 편제표에는 학년 정보가 비어 있어 특정 학기나 학년은 지정하지 않았습니다.</p>
        </div>
        <ul className="re-list">
          {research.map((c) => <li key={c.name}><span>{c.name}</span><small>전문Ⅰ · 학년 미기재</small></li>)}
        </ul>
      </div>

      <div className="plan-block">
        <div className="eyebrow">PLANNING GUIDE</div>
        <h3 className="panel-title">좋은 설계는, 한 번의 선택보다 여러 번의 점검</h3>
        <div className="plan-grid">
          {planning.map(([no, title, body]) => (
            <div key={no}><span>{no}</span><h4>{title}</h4><p>{body}</p></div>
          ))}
        </div>
        <p className="section-note">설계·분석 도구는 선택 과목을 돌아보는 참고 자료입니다. 준비도, 필수 학점, 중복 수강, 실제 개설 학기와 시간표는 학교의 수강신청 안내와 상담으로 확인하세요. 입시 결과나 학습 성과를 예측하지 않습니다.</p>
      </div>
    </section>
  );
}
