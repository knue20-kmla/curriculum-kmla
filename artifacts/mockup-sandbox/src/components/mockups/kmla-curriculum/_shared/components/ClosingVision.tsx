import { ArrowUpRight } from 'lucide-react';

const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;

export function ClosingVision({ url, onJump }: { url: string; onJump: (id: string) => void }) {
  return (
    <section className="section closing" id="closing" aria-labelledby="closing-title">
      <div className="closing-grid">
        <figure className="photo-frame">
          <img src={`${base}images/school_founding.png`} alt="민족 정신으로 무장한 세계적 지도자 양성이라는 학교 설립 정신을 담은 사진" loading="lazy" />
          <figcaption>KMLA · FOUNDING VISION</figcaption>
        </figure>
        <div className="closing-copy">
          <div className="eyebrow">민족사관고등학교</div>
          <h2 id="closing-title">나의 질문으로 시작해,<br />나의 교육과정으로 완성합니다.</h2>
          <p className="closing-statement">넓게 탐색하고,<br />깊게 배우고,<br /><em>서로 다른 배움을 연결하는 3년.</em></p>
          <a className="primary-action link-action" href={url} target="_blank" rel="noreferrer" data-testid="link-plan-curriculum">
            나의 교육과정 설계하기 <ArrowUpRight size={14} />
          </a>
          <a className="source-link" href={`${base}original-presentation.html`} target="_blank" rel="noreferrer" data-testid="link-original-closing">원본 발표 자료 전체(45쪽 · 노트 포함) 열기 <ArrowUpRight size={14} /></a>
          <div className="closing-return">
            <button type="button" onClick={() => onJump('pathways')} data-testid="button-back-pathways">
              <b>진로별 경로 다시 보기</b><span>관심 분야에서 시작하는 6개 학기 경로</span>
            </button>
            <button type="button" onClick={() => onJump('catalog')} data-testid="button-back-catalog">
              <b>전체 과목 다시 보기</b><span>8개 교과 · 과목 검색과 필터</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
