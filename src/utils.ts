/**
 * 戻る/進むで現在のページに来たかどうかを判定する
 */
export const getIsFromBFCache = () => {
  const performanceNavigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  return performanceNavigationTiming?.type === "back_forward";
};

export const getIsRunOnGitHub = () => {
  return window.location.href.startsWith("https://github.com");
};

export const getGitHubRoutePattern = () => {
  const routePatternMetaElement = document.querySelector<HTMLMetaElement>("meta[name='route-pattern']");

  if (!routePatternMetaElement) {
    throw new Error("指定されたクエリで要素が見つかりませんでした(meta[name='route-pattern'])");
  }

  return routePatternMetaElement.content;
};

export const getGitLabRoutePattern = () => {
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
export const findGitHubUrlChangeTargetElement = (nodes: Node[]) => {
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
export const findGitLabUrlChangeTargetElement = (nodes: Node[]) => {
  return nodes.find((node) => {
    if (node instanceof HTMLMetaElement) {
      return node.name === "csp-nonce";
    }

    return false;
  }) as HTMLMetaElement | undefined;
};
