import {
  findGitHubUrlChangeTargetElement,
  findGitLabUrlChangeTargetElement,
  getGitHubRoutePattern,
  getGitLabRoutePattern,
  getIsFromBFCache,
  getIsRunOnGitHub,
} from "./utils";

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
let currentUrl: string | undefined;
/**
 * イベントリスナーが登録されているかどうか
 */
let isEventListening = false;
/**
 * メイン処理をスキップするかどうか
 */
let isSkipAction = false;

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
 *
 * @todo イベントリスナーの管理以外もやってしまっているので良い感じにする
 */
const manageEventListeners = ({ url, routePattern }: { url: string; routePattern: string }) => {
  // URLが変わっていない場合は何もしない
  if (currentUrl === url) {
    return;
  }

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

  if (isSkipAction) {
    // 処理をスキップするフラグが立っている場合は、フラグを下げる
    isSkipAction = false;
  } else {
    // 処理をスキップするフラグが立っていない場合は、メインの処理を実行する
    action();
  }

  // イベントリスナーが登録されていない場合は登録する
  if (!isEventListening) {
    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);
    isEventListening = true;
  }
};

/**
 * URLが変わったかどうかを監視するための要素の親要素を取得する
 */
const getObserveTargetElement = () => {
  const observeTargetElement = document.querySelector<HTMLHeadElement>("head");

  if (!observeTargetElement) {
    throw new Error("指定されたクエリで要素が見つかりませんでした(head)");
  }

  return observeTargetElement;
};

/**
 * イベントリスナーを管理する関数を実行するかどうかはMutationObserverで監視した結果で判断する
 */
const mutationCallback = ((mutations: MutationRecord[]) => {
  const addedNodes = mutations.flatMap((mutation) => Array.from(mutation.addedNodes));

  const isRunOnGitHub = getIsRunOnGitHub();

  const changeTarget = isRunOnGitHub
    ? findGitHubUrlChangeTargetElement(addedNodes)
    : findGitLabUrlChangeTargetElement(addedNodes);

  if (!changeTarget) {
    return;
  }

  manageEventListeners({
    url: window.location.href,
    routePattern: isRunOnGitHub ? getGitHubRoutePattern() : getGitLabRoutePattern(),
  });
}) satisfies MutationCallback;

/**
 * ページ表示時にメイン処理をスキップするかどうかを管理する処理を初期化する
 */
const initSkipActionManager = () => {
  const isFromBFCache = getIsFromBFCache();

  if (isFromBFCache) {
    // 戻る/進む操作で現在のページに来た場合は、初回のページ表示時のメイン処理をスキップする
    isSkipAction = true;
  }

  window.addEventListener("popstate", () => {
    // 戻る/進む操作で遷移した場合は、その回のページ表示時のメイン処理をスキップする
    isSkipAction = true;
  });
};

const init = () => {
  initSkipActionManager();

  const observeTarget = getObserveTargetElement();

  const observer = new MutationObserver(mutationCallback);
  observer.observe(observeTarget, { childList: true, subtree: true });

  const isRunOnGitHub = getIsRunOnGitHub();

  // 初回実行は手動で行う
  manageEventListeners({
    url: window.location.href,
    routePattern: isRunOnGitHub ? getGitHubRoutePattern() : getGitLabRoutePattern(),
  });
};

init();
