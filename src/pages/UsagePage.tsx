import { useState } from "react";
import { mockUsageData } from "@/data/mockData";
import { DollarSign, Zap, MessageSquare, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ranges = ["Today", "This Week", "This Month", "This Year"];
const chartTabs = ["Cost", "Tokens", "Conversations", "Activity"];

export default function UsagePage() {
  const [range, setRange] = useState("This Week");
  const [chartTab, setChartTab] = useState("Cost");
  const data = mockUsageData;

  const getChartDataKey = () => {
    switch (chartTab) {
      case "Cost": return "cost";
      case "Tokens": return "tokens";
      case "Conversations": return "conversations";
      case "Activity": return "activity";
      default: return "cost";
    }
  };

  const formatValue = (val: number) => {
    if (chartTab === "Cost") return `$${val.toFixed(2)}`;
    if (chartTab === "Tokens") return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toString();
    return val.toString();
  };

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usage & Costs</h1>
          <p className="text-sm text-muted-foreground">Sun 2/8 — Wed 2/11</p>
        </div>
        <div className="flex items-center bg-muted rounded-md p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                range === r
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon={<DollarSign size={20} />} label="Total Cost" value={`$${data.totalCost.toFixed(2)}`} />
        <KpiCard icon={<Zap size={20} />} label="Total Tokens" value={formatTokens(data.totalTokens)} />
        <KpiCard icon={<MessageSquare size={20} />} label="Conversations" value={data.conversations} />
        <KpiCard icon={<Activity size={20} />} label="Activity" value={data.activityCount} />
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Cost Over Time</h2>
          <div className="flex items-center bg-muted rounded-md p-0.5">
            {chartTabs.map((t) => (
              <button
                key={t}
                onClick={() => setChartTab(t)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  chartTab === t ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.costOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={formatValue} />
            <Tooltip
              formatter={(val: number) => [formatValue(val), chartTab]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey={getChartDataKey()} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* By Agent + By Model */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">By Agent</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase">
                <th className="text-left pb-3">Agent</th>
                <th className="text-left pb-3">Cost ▾</th>
                <th className="text-right pb-3">%</th>
                <th className="text-right pb-3">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.byAgent.map((a) => (
                <tr key={a.name}>
                  <td className="py-2.5 flex items-center gap-2">
                    <span>{a.emoji}</span>
                    <span className="font-medium text-card-foreground">{a.name}</span>
                  </td>
                  <td className="py-2.5 text-card-foreground">${a.cost.toFixed(2)}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${a.percentage}%` }} />
                      </div>
                      <span className="text-muted-foreground w-12 text-right">{a.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">{formatTokens(a.tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">By Model</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase">
                <th className="text-left pb-3">Model</th>
                <th className="text-left pb-3">Cost ▾</th>
                <th className="text-right pb-3">%</th>
                <th className="text-right pb-3">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.byModel.map((m) => (
                <tr key={m.name}>
                  <td className="py-2.5 font-medium text-card-foreground">{m.name}</td>
                  <td className="py-2.5 text-card-foreground">${m.cost.toFixed(2)}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.percentage}%`, backgroundColor: m.color || "hsl(var(--secondary))" }} />
                      </div>
                      <span className="text-muted-foreground w-12 text-right">{m.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">{formatTokens(m.tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
