/**
 * 拡張機能を有効にするページのルートパターン
 */
const matchRoutePatterns = [
  // GitHubのPR作成ページ
  "/:user_id/:repository/compare/:range",
  // GitLabのMR作成ページ
  "projects:merge_requests:creations:new",
] as const satisfies string[];

/**
 * 現在のURL
 */
let currentUrl: string | undefined = undefined;
/**
 * イベントリスナーが登録されているかどうか
 */
let isEventListening = false;

/**
 * 最初に押すキー
 */
const firstKeyCode = "MetaRight";
/**
 * 最初に押すキーが押されているかどうか
 */
let isFirstKeyDown = false;
/**
 * 2つ目に押すキー (処理を実行するキー)
 */
const secondKeyCode = "KeyB";

/**
 * アラートに表示するメッセージ
 */
const alertMessage = "セルフチェックはしましたか？\n\nTODO: ここに好きなメッセージを記入";

/**
 * メインの処理
 */
const action = () => {
  alert(alertMessage);
};

/**
 * 1つ目のキーが押されている時に2つ目のキーが押された場合にメインの処理を実行する
 */
const keyDownListener = (event: KeyboardEvent) => {
  // 1つ目のキーが押された場合、フラグを立てて終了
  if (event.code === firstKeyCode) {
    isFirstKeyDown = true;

    return;
  }

  // 2つ目のキーが押されて、1つ目のキーが押されている場合
  if (event.code === secondKeyCode && isFirstKeyDown) {
    // メインの処理を実行
    action();
  }
};

/**
 * 1つ目のキーが離された場合、フラグを下げる
 */
const keyUpListener = (event: KeyboardEvent) => {
  if (event.code === firstKeyCode) {
    isFirstKeyDown = false;
  }
};

/**
 * イベントリスナーを登録したり削除したりする
 */
const manageEventListeners = ({ url, routePattern }: { url: string; routePattern: string }) => {
  // URLが変わっていない場合は何もしない
  if (currentUrl === url) return;

  // URLを更新
  currentUrl = url;

  const isRoutePatternMatched = matchRoutePatterns.some((rp) => rp === routePattern);

  // 新しいURLが条件マッチしない場合
  if (!isRoutePatternMatched) {
    // イベントリスナーが登録されている場合は削除する
    if (isEventListening) {
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
      isEventListening = false;
    }

    return;
  }

  // 新しいURLが条件マッチする場合
  action();

  // イベントリスナーが登録されていない場合は登録する
  if (!isEventListening) {
    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);
    isEventListening = true;
  }
};

const getIsRunOnGitHub = () => {
  return window.location.href.startsWith("https://github.com");
};

const getGitHubRoutePattern = () => {
  const routePatternMetaElement = document.querySelector<HTMLMetaElement>("meta[name='route-pattern']");

  if (!routePatternMetaElement) {
    throw new Error("指定されたクエリで要素が見つかりませんでした(meta[name='route-pattern'])");
  }

  return routePatternMetaElement.content;
};

const getGitLabRoutePattern = () => {
  const routePatternMetaElement = document.querySelector<HTMLBodyElement>("body[data-page]");

  if (!routePatternMetaElement) {
    throw new Error("指定されたクエリで要素が見つかりませんでした(body[data-page])");
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  return routePatternMetaElement.getAttribute("data-page")!;
};

/**
 * 配列の中に対象が存在する時、GitHubのURLが変わったと判断できる要素を取得する
 */
const findGitHubUrlChangeTargetElement = (nodes: Node[]) => {
  return nodes.find((node) => {
    if (node instanceof HTMLMetaElement) {
      return node.name === "request-id";
    }

    return false;
  }) as HTMLMetaElement | undefined;
};

/**
 * 配列の中に対象が存在する時、GitLabのURLが変わったと判断できる要素を取得する
 */
const findGitLabUrlChangeTargetElement = (nodes: Node[]) => {
  return nodes.find((node) => {
    if (node instanceof HTMLMetaElement) {
      return node.name === "csp-nonce";
    }

    return false;
  }) as HTMLMetaElement | undefined;
};

/**
 * イベントリスナーを管理する関数を実行するかどうかはMutationObserverで監視した結果で判断する
 */
const observerCallback = ((mutations: MutationRecord[]) => {
  const addedNodes = mutations.flatMap((mutation) => Array.from(mutation.addedNodes));

  const isRunOnGitHub = getIsRunOnGitHub();

  const changeTarget = isRunOnGitHub
    ? findGitHubUrlChangeTargetElement(addedNodes)
    : findGitLabUrlChangeTargetElement(addedNodes);

  if (!changeTarget) return;

  manageEventListeners({
    url: window.location.href,
    routePattern: isRunOnGitHub ? getGitHubRoutePattern() : getGitLabRoutePattern(),
  });
}) satisfies MutationCallback;

/**
 * 監視の開始とイベントリスナーの管理初期化
 */
const init = () => {
  const observeTargetNode = document.querySelector<HTMLHeadElement>("head");

  if (!observeTargetNode) {
    throw new Error("指定されたクエリで要素が見つかりませんでした(head)");
  }

  const observer = new MutationObserver(observerCallback);
  observer.observe(observeTargetNode, { childList: true, subtree: true });

  const isRunOnGitHub = getIsRunOnGitHub();

  // 初回実行は手動で行う
  manageEventListeners({
    url: window.location.href,
    routePattern: isRunOnGitHub ? getGitHubRoutePattern() : getGitLabRoutePattern(),
  });
};

init();
