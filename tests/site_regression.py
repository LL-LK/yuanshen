from __future__ import annotations

import contextlib
import functools
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html",
    "functions.html",
    "geometry.html",
    "probability.html",
    "calculus.html",
    "elective.html",
    "lab.html",
    "challenge.html",
]
COURSE_PAGES = [page for page in PAGES if page not in {"index.html", "challenge.html"}]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *args: object) -> None:
        return


@contextlib.contextmanager
def local_server():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def launch_browser(playwright) -> Browser:
    try:
        return playwright.chromium.launch(headless=True)
    except Exception:
        return playwright.chromium.launch(headless=True, channel="chrome")


class Suite:
    def __init__(self, browser: Browser, base_url: str) -> None:
        self.browser = browser
        self.base_url = base_url
        self.failures: list[str] = []

    def check(self, condition: bool, message: str) -> None:
        if not condition:
            self.failures.append(message)

    def context(
        self,
        *,
        width: int = 1440,
        height: int = 900,
        java_script_enabled: bool = True,
        reduced_motion: str = "no-preference",
    ) -> BrowserContext:
        return self.browser.new_context(
            viewport={"width": width, "height": height},
            java_script_enabled=java_script_enabled,
            reduced_motion=reduced_motion,
        )

    def page(self, context: BrowserContext) -> tuple[Page, list[str], list[str]]:
        page = context.new_page()
        page_errors: list[str] = []
        local_http_errors: list[str] = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))

        def record_response(response) -> None:
            parsed = urlparse(response.url)
            if parsed.hostname == "127.0.0.1" and response.status >= 400:
                local_http_errors.append(f"{response.status} {response.url}")

        def route_request(route) -> None:
            parsed = urlparse(route.request.url)
            if parsed.scheme in {"http", "https"} and parsed.hostname != "127.0.0.1":
                route.abort()
            else:
                route.continue_()

        page.on("response", record_response)
        page.route("**/*", route_request)
        return page, page_errors, local_http_errors

    def goto(self, page: Page, path: str, wait_ms: int = 900) -> None:
        page.goto(f"{self.base_url}/{path}", wait_until="domcontentloaded", timeout=15_000)
        if wait_ms:
            page.wait_for_timeout(wait_ms)

    def test_all_pages_offline(self) -> None:
        for path in PAGES:
            context = self.context()
            try:
                page, page_errors, http_errors = self.page(context)
                self.goto(page, path)
                result = page.evaluate(
                    """() => {
                      const probe = document.createElement('div');
                      probe.className = 'hidden';
                      document.body.appendChild(probe);
                      const tailwind = getComputedStyle(probe).display === 'none';
                      probe.remove();
                      const localBroken = [...document.images].filter(img => {
                        const url = new URL(img.src, location.href);
                        return url.origin === location.origin && img.complete && img.naturalWidth === 0;
                      }).map(img => img.src);
                      const icons = [...document.querySelectorAll('[data-lucide]')];
                      return {
                        title: document.title,
                        tailwind,
                        localBroken,
                        renderedIcons: icons.filter(icon => icon.tagName.toLowerCase() === 'svg').length,
                        iconCount: icons.length,
                        overflow: document.documentElement.scrollWidth - innerWidth
                      };
                    }"""
                )
                self.check(bool(result["title"]), f"{path}: document title is empty")
                self.check(result["tailwind"], f"{path}: Tailwind did not initialize")
                self.check(not result["localBroken"], f"{path}: broken local images: {result['localBroken']}")
                self.check(not page_errors, f"{path}: page errors: {page_errors}")
                self.check(not http_errors, f"{path}: local HTTP errors: {http_errors}")
                self.check(result["overflow"] <= 1, f"{path}: desktop horizontal overflow {result['overflow']}px")
                if result["iconCount"]:
                    self.check(
                        result["renderedIcons"] == result["iconCount"],
                        f"{path}: Lucide rendered {result['renderedIcons']}/{result['iconCount']} icons",
                    )
            except Exception as error:
                self.failures.append(f"{path}: offline smoke failed: {error}")
            finally:
                context.close()

    def test_responsive_navigation(self) -> None:
        for path in ["index.html", *COURSE_PAGES]:
            context = self.context(width=900, height=900)
            try:
                page, page_errors, http_errors = self.page(context)
                self.goto(page, path, 600)
                state = page.evaluate(
                    """() => ({
                      desktop: getComputedStyle(document.querySelector('nav > div > div.hidden')).display,
                      toggle: getComputedStyle(document.getElementById('mobile-menu-toggle')).display,
                      overflow: document.documentElement.scrollWidth - innerWidth,
                      toc: document.querySelector('.toc-desktop,.toc-panel')
                        ? getComputedStyle(document.querySelector('.toc-desktop,.toc-panel')).display
                        : null
                    })"""
                )
                self.check(state["desktop"] == "none", f"{path}: desktop nav is visible at 900px")
                self.check(state["toggle"] != "none", f"{path}: mobile nav toggle is hidden at 900px")
                self.check(state["overflow"] <= 1, f"{path}: 900px horizontal overflow {state['overflow']}px")
                if state["toc"] is not None:
                    self.check(state["toc"] == "none", f"{path}: desktop TOC is visible at 900px")
                self.check(not page_errors and not http_errors, f"{path}: responsive errors {page_errors + http_errors}")
            except Exception as error:
                self.failures.append(f"{path}: 900px responsive check failed: {error}")
            finally:
                context.close()

        context = self.context(width=390, height=844)
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "calculus.html", 600)
            page.click("#mobile-menu-toggle")
            link = page.locator('#mobile-menu a[data-nav-key="functions"]')
            self.check(link.get_attribute("href") == "functions.html", "mobile course link has no href")
            link.click()
            page.wait_for_url("**/functions.html", timeout=5_000)
            self.check(page.url.endswith("/functions.html"), "mobile course link did not navigate")
            self.check(not page_errors and not http_errors, f"mobile navigation errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"390px mobile navigation failed: {error}")
        finally:
            context.close()

        context = self.context(width=1024, height=900)
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "functions.html", 700)
            state = page.evaluate(
                """() => {
                  const toc = document.querySelector('.toc-desktop');
                  const article = document.querySelector('article[id]');
                  const tocRect = toc.getBoundingClientRect();
                  const articleRect = article.getBoundingClientRect();
                  return {
                    desktop: getComputedStyle(document.querySelector('nav > div > div.hidden')).display,
                    toggle: getComputedStyle(document.getElementById('mobile-menu-toggle')).display,
                    toc: getComputedStyle(toc).display,
                    overlap: Math.max(0, articleRect.right - tocRect.left),
                    overflow: document.documentElement.scrollWidth - innerWidth
                  };
                }"""
            )
            self.check(state["desktop"] != "none", "desktop nav is hidden at 1024px")
            self.check(state["toggle"] == "none", "mobile nav toggle is visible at 1024px")
            self.check(state["toc"] != "none", "desktop TOC is hidden at 1024px")
            self.check(state["overlap"] <= 1, f"desktop TOC overlaps article by {state['overlap']}px")
            self.check(state["overflow"] <= 1, f"1024px horizontal overflow {state['overflow']}px")
            self.check(not page_errors and not http_errors, f"1024px errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"1024px breakpoint check failed: {error}")
        finally:
            context.close()

    def test_no_javascript_fallback(self) -> None:
        for path in ["index.html", *COURSE_PAGES]:
            context = self.context(java_script_enabled=False)
            try:
                page, page_errors, http_errors = self.page(context)
                self.goto(page, path, 0)
                hidden = page.evaluate(
                    """() => [...document.querySelectorAll('.reveal,.hero-reveal')]
                      .filter(element => Number.parseFloat(getComputedStyle(element).opacity) < 0.9).length"""
                )
                self.check(hidden == 0, f"{path}: {hidden} reveal elements stay hidden without JavaScript")
                self.check(not page_errors and not http_errors, f"{path}: no-JS errors: {page_errors + http_errors}")
            except Exception as error:
                self.failures.append(f"{path}: no-JavaScript check failed: {error}")
            finally:
                context.close()

    def test_reduced_motion(self) -> None:
        context = self.context(width=390, height=844, reduced_motion="reduce")
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "index.html", 600)
            page.click("#mobile-menu-toggle")
            page.wait_for_timeout(100)
            click_particles = page.locator('[style*="z-index: 99999"], [style*="z-index:99999"]').count()
            self.check(click_particles == 0, f"reduced motion generated {click_particles} click particles")
            self.check(not page_errors and not http_errors, f"reduced-motion index errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"reduced-motion index check failed: {error}")
        finally:
            context.close()

        context = self.context(reduced_motion="reduce")
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "challenge.html", 600)
            page.evaluate("spawnParticles(20, 20, '#fff', 5)")
            self.check(page.locator(".particle").count() == 0, "challenge particles ignore reduced-motion preference")
            self.check(not page_errors and not http_errors, f"reduced-motion challenge errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"reduced-motion challenge check failed: {error}")
        finally:
            context.close()

    def test_geometry_toc(self) -> None:
        context = self.context()
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "geometry.html", 600)
            page.locator("article[id]").first.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            active = page.locator(".toc-item.toc-active").count()
            self.check(active == 2, f"geometry scrollspy activates {active} links instead of desktop+mobile")
            self.check(not page_errors and not http_errors, f"geometry desktop TOC errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"geometry desktop TOC check failed: {error}")
        finally:
            context.close()

        context = self.context(width=390, height=844)
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "geometry.html", 600)
            page.click("#toc-fab")
            self.check(not page.locator("#toc-mobile-panel").get_attribute("class").split().__contains__("hidden"),
                       "geometry mobile TOC did not open")
            page.keyboard.press("Escape")
            state = page.evaluate(
                """() => ({
                  hidden: document.getElementById('toc-mobile-panel').classList.contains('hidden'),
                  expanded: document.getElementById('toc-fab').getAttribute('aria-expanded')
                })"""
            )
            self.check(state == {"hidden": True, "expanded": "false"}, f"geometry Escape close state: {state}")
            self.check(not page_errors and not http_errors, f"geometry mobile TOC errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"geometry mobile TOC check failed: {error}")
        finally:
            context.close()

    def test_home_accessibility(self) -> None:
        context = self.context()
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "index.html", 600)
            state = page.evaluate(
                """() => [...document.querySelectorAll('.char-card')].map(card => ({
                  role: card.getAttribute('role'),
                  tabIndex: card.tabIndex,
                  label: card.getAttribute('aria-label')
                }))"""
            )
            self.check(len(state) == 14, f"expected 14 character cards, found {len(state)}")
            self.check(all(card["role"] == "link" and card["tabIndex"] == 0 and card["label"] for card in state),
                       "one or more character cards are not keyboard accessible")
            fallback_icons = page.locator('.genshin-card [role="img"][aria-label$="头像占位符"]').count()
            self.check(fallback_icons == 5, f"expected 5 offline module-avatar fallbacks, found {fallback_icons}")
            self.check(not page_errors and not http_errors, f"home accessibility errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"home accessibility check failed: {error}")
        finally:
            context.close()

    def test_challenge_state(self) -> None:
        context = self.context()
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "challenge.html", 700)

            normalized = page.evaluate(
                """() => {
                  const state = normalizeGameState({
                    adventureRank: '<img src=x onerror=window.__xss=1>',
                    completedDays: [1, 1, 31, -1],
                    starRecords: [{day: 1, stars: 9}, {day: 1, stars: 2}],
                    totalAnswered: 3,
                    totalCorrect: 99,
                    wrongQuestions: [{
                      q: '<img src=x onerror=window.__xss=1>',
                      options: ['<b>A</b>', 'B', 'C', 'D'],
                      answer: 0,
                      knowledgePoint: '__proto__',
                      explanation: '<img src=x onerror=window.__xss=2>',
                      kpPage: 'javascript:alert(1)'
                    }]
                  });
                  gameState = state;
                  renderWrongBook();
                  return {
                    rank: state.adventureRank,
                    completedDays: state.completedDays,
                    stars: state.starRecords,
                    totalCorrect: state.totalCorrect,
                    kpPage: state.wrongQuestions[0].kpPage,
                    renderedImages: document.querySelectorAll('#wrongBookList img').length,
                    xss: window.__xss || 0,
                    literalText: document.getElementById('wrongBookList').textContent.includes('<img')
                  };
                }"""
            )
            self.check(normalized["rank"] == 1, f"invalid rank was not normalized: {normalized['rank']}")
            self.check(normalized["completedDays"] == [1], f"completed days were not normalized: {normalized['completedDays']}")
            self.check(normalized["stars"] == [{"day": 1, "stars": 3}], f"star records were not normalized: {normalized['stars']}")
            self.check(normalized["totalCorrect"] == 3, f"totalCorrect invariant failed: {normalized['totalCorrect']}")
            self.check(normalized["kpPage"] == "index.html", f"unsafe kpPage survived: {normalized['kpPage']}")
            self.check(normalized["renderedImages"] == 0 and normalized["xss"] == 0 and normalized["literalText"],
                       f"wrong-book HTML escaping failed: {normalized}")

            keys = page.evaluate(
                """() => ({
                  sameAfterShuffle: getQuestionKey({q:'Q',options:['A','B','C','D']}) ===
                    getQuestionKey({q:'Q',options:['D','B','A','C']}),
                  differentSets: getQuestionKey({q:'Q',options:['A','B','C','D']}) !==
                    getQuestionKey({q:'Q',options:['A','B','C','E']})
                })"""
            )
            self.check(keys == {"sameAfterShuffle": True, "differentSets": True}, f"question key invariants failed: {keys}")

            corrected_questions = page.evaluate(
                """() => {
                  const expected = [
                    ['不等式(1/3)^(x²-1) > 1/9的解集是？', '(-√3, √3)'],
                    ['△ABC的面积为√3，A=60°，b=2，则a = ?', '2'],
                    ['正四面体的棱长为2，则其体积为？', '2√2/3'],
                    ['某人射击命中率为p，射击3次，命中次数X的方差D(X)=18/25，则p = ?', '3/5或2/5'],
                    ['已知椭圆过点(2,√2)，焦点(±2,0)，则椭圆方程是？', 'x²/8+y²/4=1'],
                    ['椭圆x²/4+y²=1上的点到直线2x+4y-√2=0的距离最大值是？', '√10/2']
                  ];
                  const questions = Object.values(questionBank).flat();
                  return expected.map(([text, correct]) => {
                    const question = questions.find(item => item.q === text);
                    return {text, expected: correct, actual: question?.options?.[question.answer] ?? null};
                  });
                }"""
            )
            self.check(
                all(item["actual"] == item["expected"] for item in corrected_questions),
                f"corrected math question regression: {corrected_questions}",
            )

            revenge_count = page.evaluate(
                """() => {
                  gameState = normalizeGameState({
                    wrongQuestions: Array.from({length: 15}, (_, index) => ({
                      q: `Question ${index}`,
                      options: ['A','B','C','D'], answer: 0,
                      explanation: 'ok', knowledgePoint: 'test', kpPage: 'index.html'
                    }))
                  });
                  startRevengeMode();
                  return {stored: gameState.wrongQuestions.length, selected: currentQuiz.questions.length};
                }"""
            )
            self.check(revenge_count == {"stored": 15, "selected": 10}, f"revenge mode discarded questions: {revenge_count}")

            state_logic = page.evaluate(
                """() => {
                  const today = new Date().toDateString();
                  gameState = normalizeGameState({
                    adventureRank: 1, currentExp: 0, primogem: 60,
                    completedDays: [1], starRecords: [{day:1, stars:2}],
                    dailyQuests: [{id:'d3', progress:0, completed:false, claimed:false}],
                    lastDailyReset: today
                  });
                  currentQuiz = {
                    day: 1, currentQuestion: 4, answers: [0,0,0,0,0],
                    questions: [{},{},{},{},{}], correctCount: 5, combo: 0,
                    shuffledQuestions: [], mode: 'normal', wrongQuestionIndices: []
                  };
                  finishQuiz();
                  const threeStarProgress = gameState.dailyQuests.find(q => q.id === 'd3').progress;

                  gameState = normalizeGameState({adventureRank:1,currentExp:350,primogem:60});
                  updateExpBar();
                  const rankState = {
                    rank: gameState.adventureRank,
                    exp: gameState.currentExp,
                    primogem: gameState.primogem,
                    domRank: document.getElementById('adventureRank').textContent
                  };

                  const badge = document.getElementById('achievementBadge');
                  badge.textContent = '8';
                  badge.classList.remove('hidden');
                  gameState.unlockedConstellations = [];
                  updateAchievementBadge();
                  return {
                    threeStarProgress,
                    rankState,
                    badgeHidden: badge.classList.contains('hidden'),
                    badgeText: badge.textContent
                  };
                }"""
            )
            self.check(state_logic["threeStarProgress"] == 1, f"3-star upgrade quest was not counted: {state_logic}")
            self.check(
                state_logic["rankState"] == {"rank": 3, "exp": 50, "primogem": 160, "domRank": "3"},
                f"multi-rank update failed: {state_logic['rankState']}",
            )
            self.check(state_logic["badgeHidden"] and state_logic["badgeText"] == "",
                       f"achievement badge did not reset: {state_logic}")

            modal_state = page.evaluate(
                """() => ({
                  quizRole: document.getElementById('quizModal').getAttribute('role'),
                  resultRole: document.getElementById('resultModal').getAttribute('role'),
                  achievementRole: document.getElementById('achievementModal').getAttribute('role'),
                  soundPressed: document.getElementById('soundToggle').getAttribute('aria-pressed')
                })"""
            )
            self.check(
                modal_state["quizRole"] == modal_state["resultRole"] == modal_state["achievementRole"] == "dialog",
                f"modal dialog semantics are incomplete: {modal_state}",
            )
            self.check(modal_state["soundPressed"] in {"true", "false"}, f"sound toggle has no aria-pressed: {modal_state}")
            self.check(not page_errors and not http_errors, f"challenge state page errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"challenge state regression failed: {error}")
        finally:
            context.close()

    def test_challenge_interactions(self) -> None:
        context = self.context()
        try:
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "challenge.html", 700)

            day_one = page.locator(".day-card.unlocked").first
            day_one.focus()
            page.keyboard.press("Enter")
            self.check(not page.locator("#quizModal").evaluate("element => element.classList.contains('hidden')"),
                       "Day 1 did not open from the keyboard")

            page.locator("#optionsContainer .option-btn").first.click()
            page.wait_for_timeout(180)
            explanation = page.locator("#explanationBox")
            self.check(not explanation.evaluate("element => element.classList.contains('hidden')"),
                       "answer explanation disappeared after 180 ms")
            self.check(bool(page.locator("#explanationText").text_content().strip()),
                       "answer explanation has no text")

            page.locator("#nextQuestion").focus()
            page.keyboard.press("Tab")
            self.check(page.evaluate("document.activeElement.id") == "soundToggle",
                       "Tab did not wrap from the last to the first dialog control")
            page.keyboard.press("Shift+Tab")
            self.check(page.evaluate("document.activeElement.id") == "nextQuestion",
                       "Shift+Tab did not wrap from the first to the last dialog control")
            self.check(not page_errors and not http_errors,
                       f"challenge interaction errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"challenge interaction regression failed: {error}")
        finally:
            context.close()

    def test_storage_denied(self) -> None:
        context = self.context()
        try:
            context.add_init_script(
                """Object.defineProperty(window, 'localStorage', {
                  configurable: true,
                  get() { throw new DOMException('Storage disabled by test', 'SecurityError'); }
                });"""
            )
            page, page_errors, http_errors = self.page(context)
            self.goto(page, "challenge.html", 900)
            state = page.evaluate(
                """() => ({
                  loadingHidden: document.getElementById('loadingOverlay').classList.contains('hidden'),
                  dayCards: document.querySelectorAll('.day-card').length,
                  firstDayReady: document.querySelector('.day-card.unlocked')?.getAttribute('role') === 'button',
                  enhancerLoaded: Boolean(window.GenshinEnhance)
                })"""
            )
            self.check(
                state == {"loadingHidden": True, "dayCards": 30, "firstDayReady": True, "enhancerLoaded": True},
                f"storage-denied initialization failed: {state}",
            )
            self.check(not page_errors and not http_errors,
                       f"storage-denied page errors: {page_errors + http_errors}")
        except Exception as error:
            self.failures.append(f"storage-denied regression failed: {error}")
        finally:
            context.close()

    def run(self) -> None:
        self.test_all_pages_offline()
        self.test_responsive_navigation()
        self.test_no_javascript_fallback()
        self.test_reduced_motion()
        self.test_geometry_toc()
        self.test_home_accessibility()
        self.test_challenge_state()
        self.test_challenge_interactions()
        self.test_storage_denied()


def main() -> int:
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    with local_server() as base_url, sync_playwright() as playwright:
        browser = launch_browser(playwright)
        try:
            suite = Suite(browser, base_url)
            suite.run()
        finally:
            browser.close()

    if suite.failures:
        print(f"BROWSER REGRESSION FAILED ({len(suite.failures)})")
        for index, failure in enumerate(suite.failures, 1):
            print(f"{index}. {failure}")
        return 1

    print("BROWSER REGRESSION PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
