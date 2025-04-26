"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWRInfinite from "swr/infinite";
import { useTranslation } from "react-i18next";
import { useDebounceFn } from "ahooks";
import {
  RiApps2Line,
  RiExchange2Line,
  RiMessage3Line,
  RiRobot3Line,
} from "@remixicon/react";
import AppCard from "./AppCard";
import NewAppCard from "./NewAppCard";
import useAppsQueryState from "./hooks/useAppsQueryState";
import type { AppListResponse } from "@/models/app";
import { fetchAppList } from "@/service/apps";
import { useAppContext } from "@/context/app-context";
import { NEED_REFRESH_APP_LIST_KEY } from "@/config";
import { CheckModal } from "@/hooks/use-pay";
import TabSliderNew from "@/app/components/base/tab-slider-new";
import { useTabSearchParams } from "@/hooks/use-tab-searchparams";
import Input from "@/app/components/base/input";
import { useStore as useTagStore } from "@/app/components/base/tag-management/store";
import TagManagementModal from "@/app/components/base/tag-management";
import TagFilter from "@/app/components/base/tag-management/filter";
import CheckboxWithLabel from "@/app/components/datasets/create/website/base/checkbox-with-label";

const TEMP_ID_LIST = [
  {
    app: {
      icon: "🐳",
      icon_background: "#CCFBF1",
      id: "TEMP_ID_WHALE_WATCHER",
      mode: "agent-chat",
      name: "Whale Watcher Agent",
    },
    app_id: "TEMP_ID_WHALE_WATCHER",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Real-time tracking of whale wallet movements across multiple chains, with automated alerting and optional pre-emptive trading triggers.",
    is_listed: true,
    position: 20,
    privacy_policy: null,
  },
  {
    app: {
      icon: "🏛️",
      icon_background: "#FEF9C3",
      id: "TEMP_ID_DAO_GOVERNOR",
      mode: "agent-chat",
      name: "DAO Auto-Governor",
    },
    app_id: "TEMP_ID_DAO_GOVERNOR",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Automatically monitors DAO governance proposals, analyzes voting trends, and casts votes based on preset community strategies.",
    is_listed: true,
    position: 21,
    privacy_policy: null,
  },
  {
    app: {
      icon: "🔭",
      icon_background: "#ECFCCB",
      id: "TEMP_ID_ALPHA_SNIPER",
      mode: "agent-chat",
      name: "Alpha Sniper Bot",
    },
    app_id: "TEMP_ID_ALPHA_SNIPER",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Scans Mempools, Telegram channels, and Alpha feeds to detect early token launches and automatically executes strategic buys.",
    is_listed: true,
    position: 22,
    privacy_policy: null,
  },
  {
    app: {
      icon: "⚖️",
      icon_background: "#CFFAFE",
      id: "TEMP_ID_DEFI_ARBITRAGE",
      mode: "agent-chat",
      name: "DeFi Arbitrage Executor",
    },
    app_id: "TEMP_ID_DEFI_ARBITRAGE",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Detects price discrepancies across DEXs and CEXs in real time, executing arbitrage strategies through modular multi-agent coordination.",
    is_listed: true,
    position: 23,
    privacy_policy: null,
  },
  {
    app: {
      icon: "📈",
      icon_background: "#FEE2E2",
      id: "TEMP_ID_NFT_TREND",
      mode: "agent-chat",
      name: "NFT Trend Crawler",
    },
    app_id: "TEMP_ID_NFT_TREND",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Tracks trending NFTs, floor price changes, and social signals, aggregating insights for collector DAOs and investors.",
    is_listed: true,
    position: 24,
    privacy_policy: null,
  },
  {
    app: {
      icon: "📝",
      icon_background: "#F5D0FE",
      id: "TEMP_ID_CONTENT_SYNTH",
      mode: "agent-chat",
      name: "Creator Content Synthesizer",
    },
    app_id: "TEMP_ID_CONTENT_SYNTH",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Composes visual content, social media posts, and campaign narratives using modular content-generation agents.",
    is_listed: true,
    position: 25,
    privacy_policy: null,
  },
  {
    app: {
      icon: "💹",
      icon_background: "#D1FAE5",
      id: "TEMP_ID_PREDICT_TRADE",
      mode: "agent-chat",
      name: "Predictive Trading Agent",
    },
    app_id: "TEMP_ID_PREDICT_TRADE",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Forecasts short-term token price movements using multimodal on-chain data and sentiment analysis from Web2/Web3 sources.",
    is_listed: true,
    position: 26,
    privacy_policy: null,
  },
  {
    app: {
      icon: "🏪",
      icon_background: "#FEF08A",
      id: "TEMP_ID_AGENT_MARKET",
      mode: "agent-chat",
      name: "Agent Marketplace Manager",
    },
    app_id: "TEMP_ID_AGENT_MARKET",
    category: "MCP",
    copyright: "CAN20.AI",
    description:
      "Deploys, prices, monitors, and optimizes owned Agents (dAaaA) in the decentralized marketplace for maximum revenue extraction.",
    is_listed: true,
    position: 27,
    privacy_policy: null,
  },
];

const getKey = (
  pageIndex: number,
  previousPageData: AppListResponse,
  activeTab: string,
  isCreatedByMe: boolean,
  tags: string[],
  keywords: string
) => {
  if (!pageIndex || previousPageData.has_more) {
    const params: any = {
      url: "apps",
      params: {
        page: pageIndex + 1,
        limit: 30,
        name: keywords,
        is_created_by_me: isCreatedByMe,
      },
    };

    if (activeTab !== "all") params.params.mode = activeTab;
    else delete params.params.mode;

    if (tags.length) params.params.tag_ids = tags;

    return params;
  }
  return null;
};

const Apps = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } =
    useAppContext();
  const showTagManagementModal = useTagStore((s) => s.showTagManagementModal);
  const [activeTab, setActiveTab] = useTabSearchParams({
    defaultTab: "all",
  });
  const {
    query: { tagIDs = [], keywords = "" },
    setQuery,
  } = useAppsQueryState();
  const [isCreatedByMe, setIsCreatedByMe] = useState(false);
  const [tagFilterValue, setTagFilterValue] = useState<string[]>(tagIDs);
  const [searchKeywords, setSearchKeywords] = useState(keywords);
  const setKeywords = useCallback(
    (keywords: string) => {
      setQuery((prev) => ({ ...prev, keywords }));
    },
    [setQuery]
  );
  const setTagIDs = useCallback(
    (tagIDs: string[]) => {
      setQuery((prev) => ({ ...prev, tagIDs }));
    },
    [setQuery]
  );

  const { data, isLoading, setSize, mutate } = useSWRInfinite(
    (pageIndex: number, previousPageData: AppListResponse) =>
      getKey(
        pageIndex,
        previousPageData,
        activeTab,
        isCreatedByMe,
        tagIDs,
        searchKeywords
      ),
    fetchAppList,
    { revalidateFirstPage: true }
  );

  const anchorRef = useRef<HTMLDivElement>(null);
  const options = [
    {
      value: "all",
      text: t("app.types.all"),
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "chat",
      text: t("app.types.chatbot"),
      icon: <RiMessage3Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "agent-chat",
      text: t("app.types.agent"),
      icon: <RiRobot3Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "workflow",
      text: t("app.types.workflow"),
      icon: <RiExchange2Line className="w-[14px] h-[14px] mr-1" />,
    },
  ];

  useEffect(() => {
    document.title = `${t("common.menus.apps")} -  CAN20`;
    if (localStorage.getItem(NEED_REFRESH_APP_LIST_KEY) === "1") {
      localStorage.removeItem(NEED_REFRESH_APP_LIST_KEY);
      mutate();
    }
  }, [mutate, t]);

  useEffect(() => {
    if (isCurrentWorkspaceDatasetOperator) return router.replace("/datasets");
  }, [router, isCurrentWorkspaceDatasetOperator]);

  useEffect(() => {
    const hasMore = data?.at(-1)?.has_more ?? true;
    let observer: IntersectionObserver | undefined;
    if (anchorRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading && hasMore)
            setSize((size: number) => size + 1);
        },
        { rootMargin: "100px" }
      );
      observer.observe(anchorRef.current);
    }
    return () => observer?.disconnect();
  }, [isLoading, setSize, anchorRef, mutate, data]);

  const { run: handleSearch } = useDebounceFn(
    () => {
      setSearchKeywords(keywords);
    },
    { wait: 500 }
  );
  const handleKeywordsChange = (value: string) => {
    setKeywords(value);
    handleSearch();
  };

  const { run: handleTagsUpdate } = useDebounceFn(
    () => {
      setTagIDs(tagFilterValue);
    },
    { wait: 500 }
  );
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value);
    handleTagsUpdate();
  };

  return (
    <>
      <div className="sticky top-0 flex justify-between items-center pt-4 px-12 pb-2 leading-[56px] bg-background-body z-10 flex-wrap gap-y-2">
        <TabSliderNew
          value={activeTab}
          onChange={setActiveTab}
          options={options}
        />
        <div className="flex items-center gap-2">
          <CheckboxWithLabel
            className="mr-2"
            label={t("app.showMyCreatedAppsOnly")}
            isChecked={isCreatedByMe}
            onChange={() => setIsCreatedByMe(!isCreatedByMe)}
          />
          <TagFilter
            type="app"
            value={tagFilterValue}
            onChange={handleTagsChange}
          />
          <Input
            showLeftIcon
            showClearIcon
            wrapperClassName="w-[200px]"
            value={keywords}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            onClear={() => handleKeywordsChange("")}
          />
        </div>
      </div>
      {data && data[0].total > 0 ? (
        <div className="grid content-start grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 2k:grid-cols-6 gap-4 px-12 pt-2 grow relative">
          {isCurrentWorkspaceEditor && <NewAppCard onSuccess={mutate} />}
          {data.map(({ data: apps }) =>
            apps.map((app) => (
              <AppCard key={app.id} app={app} onRefresh={mutate} />
            ))
          )}

          <AppCard
            app={{
              id: "TEMP_ID_WHALE_WATCHER",
              name: "Whale Watcher Agent",
              description:
                "Real-time tracking of whale wallet movements across multiple chains, with automated alerting and optional pre-emptive trading triggers.",
              icon_type: null,
              icon: "🐳",
              icon_background: "#CCFBF1",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any, // Using 'as any' to bypass strict type checking for placeholder
              app_model_config: {} as any, // Using 'as any' to bypass strict type checking for placeholder
              created_at: Date.now(),
              site: {} as any, // Using 'as any' to bypass strict type checking for placeholder
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
          <AppCard
            app={{
              id: "TEMP_ID_DAO_GOVERNOR",
              name: "DAO Auto-Governor",
              description:
                "Automatically monitors DAO governance proposals, analyzes voting trends, and casts votes based on preset community strategies.",
              icon_type: null,
              icon: "🏛️",
              icon_background: "#FEF9C3",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any,
              app_model_config: {} as any,
              created_at: Date.now(),
              site: {} as any,
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
          <AppCard
            app={{
              id: "TEMP_ID_ALPHA_SNIPER",
              name: "Alpha Sniper Bot",
              description:
                "Scans Mempools, Telegram channels, and Alpha feeds to detect early token launches and automatically executes strategic buys.",
              icon_type: null,
              icon: "🔭",
              icon_background: "#ECFCCB",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any,
              app_model_config: {} as any,
              created_at: Date.now(),
              site: {} as any,
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
          <AppCard
            app={{
              id: "TEMP_ID_DEFI_ARBITRAGE",
              name: "DeFi Arbitrage Executor",
              description:
                "Detects price discrepancies across DEXs and CEXs in real time, executing arbitrage strategies through modular multi-agent coordination.",
              icon_type: null,
              icon: "⚖️",
              icon_background: "#CFFAFE",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any,
              app_model_config: {} as any,
              created_at: Date.now(),
              site: {} as any,
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
          <AppCard
            app={{
              id: "TEMP_ID_NFT_TREND",
              name: "NFT Trend Crawler",
              description:
                "Tracks trending NFTs, floor price changes, and social signals, aggregating insights for collector DAOs and investors.",
              icon_type: null,
              icon: "📈",
              icon_background: "#FEE2E2",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any,
              app_model_config: {} as any,
              created_at: Date.now(),
              site: {} as any,
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
          <AppCard
            app={{
              id: "TEMP_ID_CONTENT_SYNTH",
              name: "Creator Content Synthesizer",
              description:
                "Composes visual content, social media posts, and campaign narratives using modular content-generation agents.",
              icon_type: null,
              icon: "📝",
              icon_background: "#F5D0FE",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any,
              app_model_config: {} as any,
              created_at: Date.now(),
              site: {} as any,
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
          <AppCard
            app={{
              id: "TEMP_ID_PREDICT_TRADE",
              name: "Predictive Trading Agent",
              description:
                "Forecasts short-term token price movements using multimodal on-chain data and sentiment analysis from Web2/Web3 sources.",
              icon_type: null,
              icon: "💹",
              icon_background: "#D1FAE5",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any,
              app_model_config: {} as any,
              created_at: Date.now(),
              site: {} as any,
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
          <AppCard
            app={{
              id: "TEMP_ID_AGENT_MARKET",
              name: "Agent Marketplace Manager",
              description:
                "Deploys, prices, monitors, and optimizes owned Agents (dAaaA) in the decentralized marketplace for maximum revenue extraction.",
              icon_type: null,
              icon: "🏪",
              icon_background: "#FEF08A",
              icon_url: null,
              use_icon_as_answer_icon: false,
              mode: "agent-chat",
              enable_site: false,
              enable_api: false,
              api_rpm: 60,
              api_rph: 3600,
              is_demo: false,
              model_config: {} as any,
              app_model_config: {} as any,
              created_at: Date.now(),
              site: {} as any,
              api_base_url: "",
              tags: [{ id: "MCP", name: "MCP", type: "app", binding_count: 0 }],
            }}
            isComingSoon={true}
          />
        </div>
      ) : (
        <div className="grid content-start grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 2k:grid-cols-6 gap-4 px-12 pt-2 grow relative overflow-hidden">
          {isCurrentWorkspaceEditor && (
            <NewAppCard className="z-10" onSuccess={mutate} />
          )}
          <NoAppsFound />
        </div>
      )}

      <CheckModal />
      <div ref={anchorRef} className="h-0">
        {" "}
      </div>
      {showTagManagementModal && (
        <TagManagementModal type="app" show={showTagManagementModal} />
      )}
    </>
  );
};

export default Apps;

function NoAppsFound() {
  const { t } = useTranslation();
  function renderDefaultCard() {
    const defaultCards = Array.from({ length: 36 }, (_, index) => (
      <div
        key={index}
        className="h-[160px] inline-flex rounded-xl bg-background-default-lighter"
      ></div>
    ));
    return defaultCards;
  }
  return (
    <>
      {renderDefaultCard()}
      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-background-body to-transparent">
        <span className="system-md-medium text-text-tertiary">
          {t("app.newApp.noAppsFound")}
        </span>
      </div>
    </>
  );
}
