import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react";
import "./Current.css";

type DeckSlide = {
  index: number;
  title: string;
  text: string;
  subject: string | null;
  career: string | null;
  field: string | null;
  fields: string[];
  courses: string[];
  coursesByField: Record<string, string[]>;
};
const PRESENTATION = "/__mockup/kmla-current.html";
const SUBJECT_ORDER = ["과학", "사회", "국어", "영어", "수학", "제2외국어", "정보", "교양"];

const getPresentationUrl = () => {
  const page = Number(new URLSearchParams(window.location.search).get("slide"));
  return Number.isInteger(page) && page >= 1 && page <= 45 ? `${PRESENTATION}#slide-${page}` : PRESENTATION;
};

export function Current() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const presentationUrl = useRef(getPresentationUrl()).current;
  const subjectTriggerRef = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  const [deckLoadFailed, setDeckLoadFailed] = useState(false);
  const [deckRetry, setDeckRetry] = useState(0);
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 12, top: 100 });
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [courseQuery, setCourseQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [subjectTitleTarget, setSubjectTitleTarget] = useState<HTMLElement | null>(null);
  const [fieldTitleTarget, setFieldTitleTarget] = useState<HTMLElement | null>(null);
  const [careerTitleTarget, setCareerTitleTarget] = useState<HTMLElement | null>(null);

  const slides = useMemo(() => {
    if (!ready || !frameRef.current) return [];

    try {
      return Array.from(
        frameRef.current.contentDocument?.querySelectorAll<HTMLElement>(".slide") ?? [],
      ).map((slide, index) => {
        const indexFromSource = Number(slide.dataset.index);
        const subjectPage = slide.classList.contains("subject-full");
        const subject = subjectPage
          ? slide.querySelector<HTMLElement>(":scope > h2")?.textContent?.trim() || null
          : null;
        const career = slide.classList.contains("path-lanes")
          ? slide.querySelector<HTMLElement>(":scope > h2")?.textContent?.trim() || null
          : null;
        const languageColumns = [...slide.querySelectorAll<HTMLElement>(".language-column")];
        const detailedField =
          subject === "과학" || subject === "사회"
            ? slide.querySelector<HTMLElement>(".subject-top h3")?.textContent?.trim()
            : null;
        const fields = languageColumns.length
          ? languageColumns.map((column) => column.querySelector("h3")?.textContent?.trim() || "").filter(Boolean)
          : detailedField
            ? [detailedField]
            : subject
              ? [subject]
              : [];
        const field = fields[0] || null;
        const courses = [...slide.querySelectorAll<HTMLElement>("[data-course]")].map(
          (course) => course.dataset.course || course.textContent?.trim() || "",
        ).filter(Boolean);
        const coursesByField: Record<string, string[]> = {};
        if (languageColumns.length) {
          languageColumns.forEach((column) => {
            const columnField = column.querySelector("h3")?.textContent?.trim();
            if (columnField) {
              coursesByField[columnField] = [...column.querySelectorAll<HTMLElement>("[data-course]")].map(
                (course) => course.dataset.course || course.textContent?.trim() || "",
              ).filter(Boolean);
            }
          });
        } else if (field) {
          coursesByField[field] = courses;
        }
        return {
          index: Number.isInteger(indexFromSource) ? indexFromSource : index,
          title: slide.getAttribute("aria-label")?.replace(/^\d+\.\s*/, "") || `슬라이드 ${index + 1}`,
          text: (slide.textContent ?? "").replace(/\s+/g, " ").trim(),
          subject,
          career,
          field,
          fields,
          courses,
          coursesByField,
        } satisfies DeckSlide;
      });
    } catch {
      return [];
    }
  }, [ready]);

  const subjectGroups = useMemo(
    () =>
      [...new Set(slides.flatMap((slide) => (slide.subject ? [slide.subject] : [])))].sort(
        (a, b) => SUBJECT_ORDER.indexOf(a) - SUBJECT_ORDER.indexOf(b),
      ),
    [slides],
  );
  const subjectPages = useMemo(
    () => slides.filter((slide) => slide.subject === selectedSubject),
    [selectedSubject, slides],
  );
  const fields = useMemo(
    () => [...new Set(subjectPages.flatMap((slide) => slide.fields))],
    [subjectPages],
  );
  const fieldCourses = useMemo(() => {
    const pages = subjectPages.filter((slide) => !selectedField || slide.fields.includes(selectedField));
    return [...new Set(pages.flatMap((slide) => selectedField ? slide.coursesByField[selectedField] || [] : slide.courses))];
  }, [selectedField, subjectPages]);
  const visibleFieldCourses = useMemo(() => {
    const normalized = courseQuery.trim().toLocaleLowerCase();
    return normalized
      ? fieldCourses.filter((course) => course.toLocaleLowerCase().includes(normalized))
      : fieldCourses;
  }, [courseQuery, fieldCourses]);
  const activeSubject = slides.find((slide) => slide.index === activeSlide)?.subject ?? null;
  const careerPages = useMemo(() => slides.filter((slide) => slide.career), [slides]);
  const activeCareer = slides.find((slide) => slide.index === activeSlide)?.career ?? null;
  const deckUrl = useMemo(() => {
    if (!deckRetry) return presentationUrl;
    const [path, hash] = presentationUrl.split("#");
    return `${path}${path.includes("?") ? "&" : "?"}preview-retry=${deckRetry}${hash ? `#${hash}` : ""}`;
  }, [deckRetry, presentationUrl]);

  useEffect(() => {
    if (!ready || !frameRef.current?.contentDocument) return;
    const doc = frameRef.current.contentDocument;
    const syncSlide = () => {
      const active = doc.querySelector<HTMLElement>(".slide.active");
      const index = Number(active?.dataset.index);
      if (!Number.isInteger(index) || index < 0) return;
      setActiveSlide(index);
      const current = slides.find((slide) => slide.index === index);
      setCareerTitleTarget(current?.career ? active?.querySelector<HTMLElement>(":scope > h2") ?? null : null);
      if (current?.subject) {
        setSelectedSubject(current.subject);
        if (current.field) setSelectedField(current.field);
        setSubjectTitleTarget(active?.querySelector<HTMLElement>(":scope > h2") ?? null);
        setFieldTitleTarget(active?.querySelector<HTMLElement>(".subject-top h3") ?? null);
      } else {
        setSubjectTitleTarget(null);
        setFieldTitleTarget(null);
      }
    };
    const observer = new MutationObserver(syncSlide);
    doc.querySelectorAll<HTMLElement>(".slide").forEach((slide) => {
      observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
    doc.defaultView?.addEventListener("hashchange", syncSlide);
    syncSlide();
    return () => {
      observer.disconnect();
      doc.defaultView?.removeEventListener("hashchange", syncSlide);
    };
  }, [ready, slides]);

  useEffect(() => {
    if (!ready || !frameRef.current?.contentDocument) return;
    const doc = frameRef.current.contentDocument;
    const style = doc.createElement("style");
    style.dataset.kmlaInlineNavigation = "true";
    style.textContent = `
      .subject-full > h2, .path-lanes > h2 { display:flex; flex-wrap:wrap; align-items:center; gap:12px; }
      .kmla-inline-nav { display:inline-flex; flex-wrap:wrap; align-items:center; gap:8px; vertical-align:middle; }
      .kmla-inline-nav__control { display:inline-flex; align-items:center; gap:6px; min-height:35px; padding:4px 9px; border:1px solid #c2a66d80; border-radius:4px; color:#efe9db; background:#17313b; font:500 12px/1.25 "Noto Sans KR",sans-serif; }
       .kmla-inline-nav__trigger { cursor:pointer; padding-inline:11px; letter-spacing:.02em; transition:background .15s,border-color .15s; }
       .kmla-inline-nav__trigger:hover, .kmla-inline-nav__trigger[aria-expanded="true"] { background:#23414a; border-color:#cfbb8d; }
       .kmla-inline-nav__trigger:focus-visible { outline:2px solid #d5bf87; outline-offset:3px; }
       .kmla-inline-nav__trigger svg { color:#cfbb8d; }
      .kmla-inline-nav__label { color:#cfbb8d; font-size:10px; white-space:nowrap; }
      .kmla-inline-nav__select-wrap { position:relative; display:inline-flex; align-items:center; }
      .kmla-inline-nav__select { max-width:158px; appearance:none; border:0; padding:3px 20px 3px 0; color:#f4f1e8; background:transparent; font:600 12px/1.3 "Noto Sans KR",sans-serif; cursor:pointer; }
      .kmla-inline-nav__select:focus-visible { outline:2px solid #d5bf87; outline-offset:2px; }
      .kmla-inline-nav__select option { color:#edf0ee; background:#142d3a; }
      .kmla-inline-nav__select-wrap svg { position:absolute; right:0; pointer-events:none; color:#cfbb8d; }
      .kmla-inline-nav--career .kmla-inline-nav__select { max-width:240px; }
      .subject-top h3 { display:flex; flex-wrap:wrap; align-items:center; gap:12px; }
      .kmla-inline-nav--field .kmla-inline-nav__control { min-height:31px; padding:3px 8px; }
      /* Quiet editorial finish: preserve the slide composition while sharpening its edges. */
      .slide.active:not(.hero):not(.finale)::after {
        content:"";
        position:absolute;
        inset:15px;
        z-index:5;
        pointer-events:none;
        border:1px solid #d9c59012;
        background:
          linear-gradient(#d9c59038,#d9c59038) left top/30px 1px no-repeat,
          linear-gradient(#d9c59038,#d9c59038) left top/1px 30px no-repeat,
          linear-gradient(#d9c59038,#d9c59038) right bottom/30px 1px no-repeat,
          linear-gradient(#d9c59038,#d9c59038) right bottom/1px 30px no-repeat;
      }
      .slide.active .eyebrow { letter-spacing:.2em; }
      .slide.active h2 { text-shadow:0 1px 18px #09172224; }
      .slide.active .lane-course,
      .slide.active .full-course,
      .slide.active .chip { box-shadow:0 3px 9px #07192520; }
      .slide.active .foot .mark { color:#d5c398; letter-spacing:.16em; }
      .kmla-breadth-overview { display:grid; grid-template-columns:minmax(0,.84fr) minmax(0,1.16fr); grid-template-rows:minmax(0,1fr) auto; grid-template-areas:"languages inquiry" "languages note"; gap:9px 12px; align-items:stretch; }
      .kmla-breadth-languages { display:grid; grid-area:languages; grid-template-rows:repeat(3,minmax(0,1fr)); gap:9px; }
      .kmla-breadth-card { display:flex; min-height:0; flex-direction:column; justify-content:center; padding:11px 14px!important; }
      .kmla-breadth-card__top { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:5px; }
      .kmla-breadth-card__top .tag { margin:0; }
      .kmla-breadth-card__top strong { color:#d5bd91; font-size:30px; font-weight:650; line-height:1; letter-spacing:-.04em; }
      .kmla-breadth-card p { margin:0; font-size:11px; line-height:1.55; }
      .kmla-breadth-inquiry-panel { grid-area:inquiry; margin:0; }
      .kmla-breadth-inquiry-note { grid-area:note; margin:0; }
      @media(max-width:760px) {
        .subject-full > h2, .path-lanes > h2 { gap:7px; }
        .kmla-inline-nav { gap:5px; }
        .kmla-inline-nav__control { min-height:30px; gap:4px; padding:3px 7px; }
        .kmla-inline-nav__label { font-size:9px; }
        .kmla-inline-nav__select { max-width:116px; font-size:11px; }
        .kmla-inline-nav--career .kmla-inline-nav__select { max-width:190px; }
        .kmla-inline-nav--field .kmla-inline-nav__control { min-height:29px; }
        .subject-top h3 { gap:7px; }
        .slide.active:not(.hero):not(.finale)::after { inset:9px; }
        .kmla-breadth-overview { grid-template-columns:minmax(190px,.84fr) minmax(255px,1.16fr); gap:9px; }
        .kmla-breadth-card { padding:9px 10px!important; }
        .kmla-breadth-card__top strong { font-size:26px; }
        .kmla-breadth-card p { font-size:10px; }
      }
    `;
    doc.head.appendChild(style);

    const titleText = "여덟 영역이 만드는 폭넓은 선택";
    const updatedTitle = "다양하고 폭넓은 선택";
    const breadthSlide = [...doc.querySelectorAll<HTMLElement>(".slide")].find(
      (slide) => slide.querySelector<HTMLElement>(":scope > h2")?.textContent?.trim() === titleText,
    );
    if (breadthSlide) {
      const heading = breadthSlide.querySelector<HTMLElement>(":scope > h2");
      const shadowHeading = breadthSlide.querySelector<HTMLElement>(":scope > .title-ghost");
      if (heading) heading.textContent = updatedTitle;
      if (shadowHeading) shadowHeading.textContent = updatedTitle;
      breadthSlide.setAttribute("aria-label", `${breadthSlide.dataset.index ? Number(breadthSlide.dataset.index) + 1 : ""}. ${updatedTitle}`);

      const inquiryPanel = [...breadthSlide.querySelectorAll<HTMLElement>(".panel")].find(
        (panel) => panel.textContent?.includes("두 탐구 교과의 수록 과목"),
      );
      const originalPanel = inquiryPanel?.parentElement;
      if (originalPanel && inquiryPanel) {
        const inquiryCallout = originalPanel.querySelector<HTMLElement>(".callout");
        originalPanel.classList.add("kmla-breadth-overview");
        const languageCards = doc.createElement("div");
        languageCards.className = "kmla-breadth-languages";
        languageCards.setAttribute("aria-label", "국어·영어·수학 교육과정");
        const foundationalSubjects = [
          {
            name: "국어",
            count: "15",
            description: "언어와 문학을 읽고,<br>생각을 말과 글로 빚습니다.",
          },
          {
            name: "영어",
            count: "36",
            description: "문학·토론·작문으로<br>세계의 관점과 소통합니다.",
          },
          {
            name: "수학",
            count: "25",
            description: "대수·미적분·기하·통계로<br>구조와 현상을 분석합니다.",
          },
        ];
        foundationalSubjects.forEach(({ name, count, description }) => {
          const card = doc.createElement("article");
          card.className = "panel kmla-breadth-card";
          card.innerHTML = `<div class="kmla-breadth-card__top"><span class="tag">${name}</span><strong>${count}</strong></div><p>${description}</p>`;
          languageCards.appendChild(card);
        });

        inquiryPanel.classList.add("kmla-breadth-inquiry-panel");
        inquiryCallout?.classList.add("kmla-breadth-inquiry-note");
        originalPanel.insertBefore(languageCards, inquiryPanel);
      }
      doc.querySelectorAll<HTMLElement>(".toc-item").forEach((item) => {
        item.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(titleText)) {
            node.textContent = node.textContent.replace(titleText, updatedTitle);
          }
        });
      });
    }
    return () => style.remove();
  }, [ready]);

  useEffect(() => {
    if (!subjectMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSubjectMenuOpen(false);
        subjectTriggerRef.current?.focus();
      }
    };
    const updatePosition = () => {
      const trigger = subjectTriggerRef.current?.getBoundingClientRect();
      const frame = frameRef.current?.getBoundingClientRect();
      if (!trigger || !frame) return;
      const width = Math.min(390, window.innerWidth - 24);
      setMenuPosition({
        left: Math.max(12, Math.min(frame.left + trigger.left, window.innerWidth - width - 12)),
        top: Math.max(12, Math.min(frame.top + trigger.bottom + 8, window.innerHeight - 120)),
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    const deckDocument = frameRef.current?.contentDocument;
    document.addEventListener("keydown", handleEscape);
    deckDocument?.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("keydown", handleEscape);
      deckDocument?.removeEventListener("keydown", handleEscape);
    };
  }, [subjectMenuOpen, activeSlide]);

  const selectSlide = (index: number) => {
    const deck = frameRef.current?.contentWindow;
    if (!deck) return;
    deck.location.hash = `slide-${index + 1}`;
    setSubjectMenuOpen(false);
    setActiveSlide(index);
    subjectTriggerRef.current?.focus();
  };

  const selectField = (field: string) => {
    const destination = subjectPages.find((slide) => slide.fields.includes(field));
    if (destination) {
      setSelectedField(field);
      setCourseQuery("");
      setActiveSlide(destination.index);
      const deck = frameRef.current?.contentWindow;
      const hash = `#slide-${destination.index + 1}`;
      if (deck && deck.location.hash !== hash) deck.location.hash = hash;
      const languageTitle = [...(frameRef.current?.contentDocument?.querySelectorAll<HTMLElement>(".language-column > h3") ?? [])]
        .find((element) => element.textContent?.trim() === field);
      languageTitle?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-3px)" }, { transform: "translateY(0)" }], {
        duration: 700,
        easing: "ease-out",
      });
    }
  };

  const selectSubject = (subject: string) => {
    const destination = slides.find((slide) => slide.subject === subject);
    setSelectedSubject(subject);
    setSelectedField(destination?.field ?? null);
    setCourseQuery("");
    if (!destination) return;
    setActiveSlide(destination.index);
    const deck = frameRef.current?.contentWindow;
    const hash = `#slide-${destination.index + 1}`;
    if (deck && deck.location.hash !== hash) deck.location.hash = hash;
  };

  const selectCourse = (course: string) => {
    const destination = subjectPages.find((slide) => slide.courses.includes(course));
    if (!destination) return;
    setSelectedField(
      destination.fields.find((field) => destination.coursesByField[field]?.includes(course)) ?? destination.field,
    );
    setSubjectMenuOpen(false);
    setCourseQuery("");
    selectSlide(destination.index);
    window.requestAnimationFrame(() => {
      const courseNode = [...(frameRef.current?.contentDocument?.querySelectorAll<HTMLElement>("[data-course]") ?? [])]
        .find((element) => element.dataset.course === course);
      courseNode?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.035)" }, { transform: "scale(1)" }],
        { duration: 900, easing: "ease-out" },
      );
    });
  };

  const inlineSubjectButton = (
    <button
      ref={subjectTriggerRef}
      className="kmla-inline-nav__control kmla-inline-nav__trigger"
      type="button"
      aria-expanded={subjectMenuOpen}
      aria-label="교과 이동"
      onClick={() => {
        setSelectedSubject(activeSubject);
        setSubjectMenuOpen((value) => !value);
      }}
    >
      교과 이동 <ChevronDown size={13} aria-hidden="true" />
    </button>
  );
  const inlineFieldSelector = fields.length ? (
    <label className="kmla-inline-nav__control">
      <span className="kmla-inline-nav__label">세부</span>
      <span className="kmla-inline-nav__select-wrap">
        <select
          className="kmla-inline-nav__select"
          aria-label={`${selectedSubject || activeSubject || "교과"} 세부 영역 선택`}
          value={fields.includes(selectedField || "") ? selectedField || "" : fields[0]}
          onChange={(event) => selectField(event.target.value)}
        >
          {fields.map((field) => <option key={field} value={field}>{field}</option>)}
        </select>
        <ChevronDown size={13} aria-hidden="true" />
      </span>
    </label>
  ) : null;
  const subjectTitlePortal = subjectTitleTarget
    ? createPortal(
        <span className="kmla-inline-nav" aria-label="교과 및 세부 교과 선택">
          {inlineSubjectButton}
          {!fieldTitleTarget && inlineFieldSelector}
        </span>,
        subjectTitleTarget,
      )
    : null;
  const fieldTitlePortal = fieldTitleTarget && inlineFieldSelector
    ? createPortal(
        <span className="kmla-inline-nav kmla-inline-nav--field" aria-label="세부 교과 선택">
          {inlineFieldSelector}
        </span>,
        fieldTitleTarget,
      )
    : null;
  const careerTitlePortal = careerTitleTarget && activeCareer
    ? createPortal(
        <span className="kmla-inline-nav kmla-inline-nav--career">
          <label className="kmla-inline-nav__control">
            <span className="kmla-inline-nav__label">진로</span>
            <span className="kmla-inline-nav__select-wrap">
              <select
                className="kmla-inline-nav__select"
                aria-label="진로 영역 선택"
                value={activeSlide}
                onChange={(event) => selectSlide(Number(event.target.value))}
              >
                {careerPages.map((slide) => (
                  <option key={slide.index} value={slide.index}>{slide.career}</option>
                ))}
              </select>
              <ChevronDown size={13} aria-hidden="true" />
            </span>
          </label>
        </span>,
        careerTitleTarget,
      )
    : null;

  return (
    <main className="kmla-current">
      <iframe
        ref={frameRef}
        title="민족사관고등학교 원본 교육과정 프레젠테이션"
        src={deckUrl}
        onLoad={() => {
          const hasSlides = Boolean(frameRef.current?.contentDocument?.querySelector(".slide"));
          if (hasSlides) {
            setDeckLoadFailed(false);
            setReady(true);
          } else {
            setReady(false);
            setDeckLoadFailed(true);
          }
        }}
        data-ready={ready ? "true" : "false"}
        className="kmla-current__deck"
      />
      {deckLoadFailed && (
        <div className="kmla-current__load-error" role="alert">
          <p>발표 화면을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => {
              setDeckLoadFailed(false);
              setDeckRetry((retry) => retry + 1);
            }}
          >
            다시 불러오기
          </button>
        </div>
      )}
      {subjectTitlePortal}
      {fieldTitlePortal}
      {careerTitlePortal}

      {activeSubject && subjectMenuOpen && (
        <aside className="deck-subject-nav" aria-label="교과별 발표 페이지 이동" style={{ left: menuPosition.left, top: menuPosition.top }}>
            <section
              className="deck-subject-nav__panel"
              id="deck-subject-nav-panel"
              aria-labelledby="deck-subject-nav-title"
              style={{ maxHeight: `calc(100dvh - ${menuPosition.top + 12}px)` }}
            >
              <header className="deck-subject-nav__header">
                <div>
                  <span className="deck-subject-nav__eyebrow">SUBJECT CURRICULUM</span>
                  <h2 id="deck-subject-nav-title">교과별 페이지로 이동</h2>
                </div>
                <button
                  type="button"
                  className="deck-subject-nav__close"
                  aria-label="교과 선택 닫기"
                  onClick={() => {
                    setSubjectMenuOpen(false);
                    subjectTriggerRef.current?.focus();
                  }}
                >
                  <X size={16} />
                </button>
              </header>
              <p className="deck-subject-nav__hint">교과를 고른 뒤 세부 영역을 선택하면 해당 페이지로 이동합니다.</p>
              <div className="deck-subject-nav__group" role="group" aria-label="교과 선택">
                {subjectGroups.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    className={selectedSubject === subject ? "is-active" : ""}
                    aria-pressed={selectedSubject === subject}
                    onClick={() => {
                      selectSubject(subject);
                      setSubjectMenuOpen(false);
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              {fields.length > 0 && (
                <div className="deck-subject-nav__fields">
                  <span className="deck-subject-nav__label">
                    {selectedSubject === "과학" || selectedSubject === "사회" ? "세부 교과" : "과목 영역"}
                  </span>
                  <div className="deck-subject-nav__group deck-subject-nav__group--fields" role="group" aria-label="세부 교과 선택">
                    {fields.map((field) => (
                      <button
                        key={field}
                        type="button"
                        className={selectedField === field ? "is-active" : ""}
                        onClick={() => selectField(field)}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="deck-subject-nav__courses">
                <label className="deck-subject-nav__label" htmlFor="deck-subject-course-search">
                  {selectedField ? `${selectedField} 과목` : `${selectedSubject} 수록 과목`}
                </label>
                <div className="deck-subject-nav__search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    id="deck-subject-course-search"
                    type="search"
                    value={courseQuery}
                    onChange={(event) => setCourseQuery(event.target.value)}
                    placeholder="과목명 검색"
                    aria-label="선택한 교과의 과목 검색"
                  />
                  <span>{visibleFieldCourses.length}개</span>
                </div>
                {visibleFieldCourses.length ? (
                  <div className="deck-subject-nav__course-list" role="group" aria-label="수록 과목 페이지로 이동">
                    {visibleFieldCourses.map((course) => (
                      <button key={course} type="button" onClick={() => selectCourse(course)}>
                        {course}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="deck-subject-nav__no-courses">일치하는 과목이 없습니다.</p>
                )}
              </div>
            </section>
        </aside>
      )}
    </main>
  );
}
