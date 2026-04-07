import { notFound } from "next/navigation";
import { getTradingToolDefinition } from "components/tradingToolsConfig";
import { TRADING_RISK_TOOL_SLUGS } from "@/lib/trading-risk-tools";
import { getTradingToolBySlug } from "@/lib/trading-tools";
import { ADS_TOOLS_BY_SLUG } from "components/tools/adsToolsConfig";
import TradingToolSlugPage from "components/TradingToolSlugPage";
import TradingRiskAnalyticsToolPage from "components/TradingRiskAnalyticsToolPage";
import TradingToolDetailPage from "components/TradingToolDetailPage";
import AdsToolPage from "components/tools/AdsToolPage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DynamicToolPage({ params }: PageProps) {
  const { slug } = await params;

  if (getTradingToolDefinition(slug)) {
    return <TradingToolSlugPage slug={slug} />;
  }
  if (TRADING_RISK_TOOL_SLUGS.has(slug)) {
    return <TradingRiskAnalyticsToolPage />;
  }
  if (getTradingToolBySlug(slug)) {
    return <TradingToolDetailPage />;
  }
  if (ADS_TOOLS_BY_SLUG[slug]) {
    return <AdsToolPage key={slug} slug={slug} />;
  }

  notFound();
}
