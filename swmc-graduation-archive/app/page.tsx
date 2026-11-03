import { archiveEditions } from "./archive-data";

const graduationSiteUrl =
  "https://www.seowon.ac.kr/multimedia/8392/subview.do";
const catalogueUrl = "/catalogues/sample-catalogue.pdf";

export default function Home() {
  return (
    <div className="archive-experience">
      <main className="archive-shell">
        <header className="archive-intro">
          <div className="archive-brand">
            <div className="archive-logo">
              <img
                src="/assets/swmc-logo.png"
                alt="서원대학교 미디어콘텐츠학부 로고"
              />
            </div>
            <div>
              <h1>서원대학교 미디어콘텐츠학부 졸업전시 아카이브</h1>
              <p>SWMC GRADUATION EXHIBITION ARCHIVE</p>
            </div>
          </div>

          <dl className="archive-summary">
            <div><dt>PERIOD</dt><dd>2015—2026</dd></div>
            <div><dt>ISSUES</dt><dd>{archiveEditions.length}</dd></div>
            <div><dt>UPDATED</dt><dd>2026.08</dd></div>
          </dl>
        </header>

        <section className="archive-section" aria-labelledby="archive-heading">
          <div className="section-title-row">
            <h2 id="archive-heading">졸업전시 <span>Archive</span></h2>
            <p><i /> CURRENT <b /> SAMPLE</p>
          </div>

          <div className="archive-column-head" aria-hidden="true">
            <span>YEAR / ISSUE</span>
            <span>EXHIBITION</span>
            <span>STATUS</span>
          </div>

          <div className="archive-list">
            {archiveEditions.map((edition) => (
              <article
                className={`archive-entry ${edition.status === "current" ? "is-current" : ""}`}
                key={edition.year}
              >
                <div className="entry-title">
                  <div className="entry-year">
                    {edition.year}<small>ISSUE {edition.issue}</small>
                  </div>
                  <div className="entry-main">
                    <strong>{edition.title}</strong>
                    <small>{edition.tagline}</small>
                  </div>
                  <span className="entry-status">
                    {edition.status === "current" ? "CURRENT" : "SAMPLE"}
                  </span>
                </div>

                <div className="entry-links">
                  <a href={graduationSiteUrl} target="_blank" rel="noreferrer">
                    졸전 사이트 바로가기 <span aria-hidden="true">↗</span>
                  </a>
                  <span aria-hidden="true">/</span>
                  <a href={catalogueUrl} target="_blank" rel="noreferrer">
                    도록 보기 <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="archive-notice">
            <strong>NOTE</strong> 2015—2025 기록은 아카이브 구조 확인을 위한 예시이며,
            졸전 사이트와 도록 파일은 실제 자료 확보 후 연도별 링크로 교체할 수 있습니다.
          </p>
        </section>

        <section className="archive-section archive-about" aria-labelledby="about-heading">
          <h2 id="about-heading">아카이브 소개 <span>About</span></h2>
          <div>
            <p>
              서원대학교 미디어콘텐츠학부 졸업전시를 연도별로 모아 보는 단일 페이지
              아카이브입니다. 각 기록에서 졸업전시 웹사이트와 디지털 도록을 바로
              열람할 수 있습니다.
            </p>
            <p>
              기획, 디자인, 영상, 인터랙션을 아우르는 졸업생들의 결과물을 지속해서
              기록하고 다음 세대의 창작으로 연결합니다.
            </p>
          </div>
        </section>

        <section className="archive-section" aria-labelledby="info-heading">
          <h2 id="info-heading">학부 정보 <span>Information</span></h2>
          <ul className="plain-list department-links">
            <li>
              <a href="https://www.seowon.ac.kr/multimedia/index.do" target="_blank" rel="noreferrer">
                <span>WEBSITE</span>
                <span>미디어콘텐츠학부 홈페이지 <b aria-hidden="true">↗</b></span>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/swu_mediacontents/" target="_blank" rel="noreferrer">
                <span>INSTAGRAM</span>
                <span>@swu_mediacontents <b aria-hidden="true">↗</b></span>
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/groups/153806508076533/" target="_blank" rel="noreferrer">
                <span>FACEBOOK</span>
                <span>미디어콘텐츠학부 Facebook <b aria-hidden="true">↗</b></span>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/channel/UCK8J0cwHwoN5UsNr_7Y70Pg" target="_blank" rel="noreferrer">
                <span>YOUTUBE</span>
                <span>미디어콘텐츠학부 공식 채널 <b aria-hidden="true">↗</b></span>
              </a>
            </li>
          </ul>
        </section>

        <footer className="archive-footer">
          <p>© 2015—2026 School of Media Contents, Seowon University.</p>
          <p>Cheongju, Republic of Korea.</p>
        </footer>
      </main>
    </div>
  );
}
