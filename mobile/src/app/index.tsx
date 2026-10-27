import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../api";

type Data = Record<string, any>;
type Feature = "home" | "portfolio" | "role" | "company" | "roadmap";

const C = {
  bg: "#09080F", panel: "#14111F", panel2: "#1C172A",
  purple: "#A78BFA", violet: "#7C3AED", white: "#F8F7FC",
  muted: "#A5A0B5", line: "#30283F", green: "#6EE7B7",
  red: "#FDA4AF", yellow: "#FCD34D",
};

const features: { id: Feature; icon: string; title: string; sub: string }[] = [
  { id: "home", icon: "⌂", title: "Home", sub: "Your workspace" },
  { id: "portfolio", icon: "⌘", title: "Portfolio Review", sub: "GitHub profile insights" },
  { id: "role", icon: "◎", title: "Role Readiness", sub: "Find your skill gaps" },
  { id: "company", icon: "▣", title: "Company Analysis", sub: "Estimate role alignment" },
  { id: "roadmap", icon: "↗", title: "Career Roadmap", sub: "Your next steps" },
];

async function apiRequest(path: string, body?: Data) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the backend. Check Wi-Fi and keep the Portfolix backend running.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed (${response.status}).`);
  }
  return data;
}

function Button({ title, onPress, disabled = false }: {
  title: string; onPress: () => void; disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => [s.button, disabled && s.disabled, pressed && { opacity: 0.8 }]}>
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={s.panel}>
    <Text style={s.panelTitle}>{title}</Text>
    {children}
  </View>;
}

function Tag({ text, color = C.purple }: { text: string; color?: string }) {
  return <View style={[s.tag, { borderColor: color + "66" }]}>
    <Text style={[s.tagText, { color }]}>{text}</Text>
  </View>;
}

function LineItem({ title, detail, priority }: {
  title: string; detail?: string; priority?: string;
}) {
  const color = priority === "high" ? C.red : priority === "low" ? C.green : C.yellow;
  return <View style={s.listItem}>
    <View style={s.itemHead}>
      <View style={s.itemDot} />
      <Text style={s.itemTitle}>{title}</Text>
      {priority ? <Tag text={priority.toUpperCase()} color={color} /> : null}
    </View>
    {detail ? <Text style={s.bodyText}>{detail}</Text> : null}
  </View>;
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <View style={s.metric}>
    <Text style={s.metricValue}>{String(value ?? "—")}</Text>
    <Text style={s.metricLabel}>{label}</Text>
    {hint ? <Text style={s.metricHint}>{hint}</Text> : null}
  </View>;
}

function Score({ value, label }: { value: any; label?: string }) {
  const score = Number(value);
  const valid = Number.isFinite(score);
  return <View style={s.scoreCard}>
    <View style={s.scoreCircle}>
      <Text style={s.scoreNumber}>{valid ? score : "—"}</Text>
      <Text style={s.scoreOutOf}>/ 100</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.scoreTitle}>{label || "Estimated score"}</Text>
      <Text style={s.bodyText}>A metadata-based estimate, not a hiring prediction.</Text>
    </View>
  </View>;
}

function StringList({ items }: { items?: any[] }) {
  if (!items?.length) return <Text style={s.bodyText}>Nothing to show yet.</Text>;
  return <View style={{ gap: 10 }}>
    {items.map((item, i) => {
      const title = typeof item === "string" ? item : item.title || item.label || item.name || item.key || `Item ${i + 1}`;
      const detail = typeof item === "string" ? "" : item.detail || item.why || item.action || item.description || "";
      const priority = typeof item === "string" ? undefined : item.priority;
      return <LineItem key={`${title}-${i}`} title={title} detail={detail} priority={priority} />;
    })}
  </View>;
}

export default function Index() {
  const [tab, setTab] = useState<Feature>("home");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [health, setHealth] = useState<"checking" | "online" | "offline">("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Data | null>(null);
  const [resultTab, setResultTab] = useState<Feature | null>(null);

  async function checkHealth() {
    try {
      const result = await apiRequest("/api/health");
      setError("");
      setHealth("online");
      console.log("PORTFOLIX HEALTH:", result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setHealth("offline");
      console.log("PORTFOLIX HEALTH ERROR:", message);
    }
  }

  useEffect(() => {
    checkHealth();
    apiRequest("/api/roles")
      .then(data => {
        const list = Array.isArray(data.roles) ? data.roles : [];
        setRoles(list);
        if (list.length) setRole(old => old || list[0]);
      })
      .catch(() => {});
  }, []);

  function navigate(next: Feature) {
    setTab(next);
    setError("");
    if (resultTab !== next) setResult(null);
  }

  async function runAnalysis() {
    const user = username.trim();
    if (!user) {
      setError("Please enter your GitHub username.");
      return;
    }
    if (user.length > 39 || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(user) || user.includes("--")) {
      setError("Enter a valid GitHub username (letters, numbers and single hyphens).");
      return;
    }
    if ((tab === "role" || tab === "company") && !role) {
      setError("Choose a target role first.");
      return;
    }
    if (tab === "company" && !company.trim()) {
      setError("Enter a company name.");
      return;
    }

    const routes: Record<string, string> = {
      portfolio: "/api/portfolio/analyze",
      role: "/api/role/readiness",
      company: "/api/company/analyze",
      roadmap: "/api/roadmap",
    };
    const body: Data = { username: user };
    if (tab === "role" || tab === "company") body.role = role;
    if (tab === "company") body.company = company.trim();
    if (tab === "roadmap") body.role = role || null;

    setLoading(true);
    setError("");
    setResult(null);
    setResultTab(tab);
    try {
      const data = await apiRequest(routes[tab], body);
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      checkHealth();
    }
  }

  const profile = result?.profile || {};
  const facts = result?.facts || {};
  const current = features.find(f => f.id === tab)!;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.screen} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <View style={s.brandMark}><Text style={s.brandMarkText}>P</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.brand}>PORTFOLIX<Text style={{ color: C.purple }}>.</Text></Text>
              <Text style={s.eyebrow}>GITHUB PORTFOLIO INTELLIGENCE</Text>
            </View>
            <View style={s.status}>
              <View style={[s.statusDot, { backgroundColor: health === "online" ? C.green : health === "offline" ? C.red : C.yellow }]} />
              <Text style={s.statusText}>{health === "online" ? "LIVE" : health === "offline" ? "OFFLINE" : "..."}</Text>
            </View>
          </View>

          <View style={s.hero}>
            <Text style={s.eyebrow}>YOUR DEVELOPER WORKSPACE</Text>
            <Text style={s.heroTitle}>{tab === "home" ? "Build your next level." : current.title}</Text>
            <Text style={s.heroSub}>{tab === "home"
              ? "Turn your GitHub activity into clear, actionable career insights."
              : current.sub}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.nav}>
            {features.map(f => (
              <Pressable key={f.id} onPress={() => navigate(f.id)}
                style={[s.navItem, tab === f.id && s.navActive]}>
                <Text style={[s.navText, tab === f.id && s.navTextActive]}>{f.icon}  {f.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {tab === "home" ? <>
            <Panel title="WORKSPACE STATUS">
              <View style={s.statusRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>Portfolix API</Text>
                  <Text style={s.bodyText}>{health === "online" ? "Connected to your local backend." : health === "offline" ? "Backend not reachable. Check your laptop and Wi-Fi." : "Checking connection..."}</Text>
                </View>
                <Button title="Refresh" onPress={checkHealth} />
              </View>
            </Panel>
            <Text style={s.sectionHeading}>YOUR TOOLKIT</Text>
            {features.filter(f => f.id !== "home").map(f => (
              <Pressable key={f.id} onPress={() => navigate(f.id)} style={s.featureCard}>
                <View style={s.featureIcon}><Text style={s.featureIconText}>{f.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{f.title}</Text>
                  <Text style={s.bodyText}>{f.sub}</Text>
                </View>
                <Text style={s.arrow}>↗</Text>
              </Pressable>
            ))}
            <Panel title="GET STARTED">
              <Text style={s.bodyText}>Enter a public GitHub username in any tool to review repository metadata and discover practical next steps.</Text>
              <Text style={s.smallNote}>Scores are heuristic estimates based on public GitHub metadata. They do not measure code quality or guarantee hiring outcomes.</Text>
            </Panel>
          </> : <>
            <Panel title="ANALYSIS INPUT">
              <Text style={s.fieldLabel}>GITHUB USERNAME</Text>
              <TextInput value={username} onChangeText={setUsername}
                placeholder="e.g. octocat" placeholderTextColor="#777186"
                autoCapitalize="none" autoCorrect={false} style={s.input} />
              {(tab === "role" || tab === "company" || tab === "roadmap") && <>
                <Text style={s.fieldLabel}>TARGET ROLE</Text>
                {roles.length ? <View style={s.chipWrap}>
                  {roles.map(r => <Pressable key={r} onPress={() => setRole(r)}
                    style={[s.choice, role === r && s.choiceActive]}>
                    <Text style={[s.choiceText, role === r && s.choiceTextActive]}>{r}</Text>
                  </Pressable>)}
                </View> : <TextInput value={role} onChangeText={setRole}
                  placeholder="Enter role" placeholderTextColor="#777186" style={s.input} />}
              </>}
              {tab === "company" && <>
                <Text style={s.fieldLabel}>COMPANY NAME</Text>
                <TextInput value={company} onChangeText={setCompany}
                  placeholder="e.g. Google" placeholderTextColor="#777186" style={s.input} />
              </>}
              {tab === "roadmap" && <Text style={s.smallNote}>Role is optional. Choose one to include role-specific skill gaps.</Text>}
              <Button title={loading ? "Analysing..." : `Run ${current.title}  →`}
                disabled={loading || health === "offline"} onPress={runAnalysis} />
              {loading ? <View style={s.loading}><ActivityIndicator color={C.purple} /><Text style={s.bodyText}>Reviewing GitHub data…</Text></View> : null}
              {health === "offline" ? <Text style={s.errorText}>Start your backend server, then tap Refresh on Home.</Text> : null}
              {error ? <Text style={s.errorText}>{error}</Text> : null}
            </Panel>

            {result ? <>
              <View style={s.resultHeading}>
                <Text style={s.eyebrow}>ANALYSIS COMPLETE</Text>
                <Text style={s.resultTitle}>{profile.name || profile.username || username}</Text>
                <Text style={s.bodyText}>{result.analysis_mode === "llm+rules" ? "AI + rule-based analysis" : "Rule-based analysis"}</Text>
              </View>

              {tab === "portfolio" && <>
                <Score value={result.documentation_signal_score?.value} label={result.documentation_signal_score?.label} />
                <View style={s.metricsGrid}>
                  <Metric label="Public repos" value={facts.public_repos ?? "—"} />
                  <Metric label="Original repos" value={facts.original_repos ?? "—"} />
                  <Metric label="Total stars" value={facts.total_stars ?? 0} />
                  <Metric label="Followers" value={facts.followers ?? 0} />
                  <Metric label="Updated in 90d" value={facts.updated_last_90_days ?? 0} />
                  <Metric label="Forked repos" value={facts.forked_repos ?? 0} />
                </View>
                <Panel title="DOCUMENTATION SIGNALS">
                  <Metric label="Repositories with descriptions" value={`${result.documentation?.with_description ?? 0}%`} />
                  <Metric label="Repositories with topics" value={`${result.documentation?.with_topics ?? 0}%`} />
                  <Metric label="Repositories with homepage" value={`${result.documentation?.with_homepage ?? 0}%`} />
                </Panel>
                <Panel title="LANGUAGES"><StringList items={result.languages?.map((x: Data) => ({ title: x.name, detail: `${x.count} repositories · ${x.percent}%` }))} /></Panel>
                <Panel title="DETECTED SKILLS"><View style={s.chipWrap}>{Object.values(result.skills || {}).map((x: any, i) => <Tag key={i} text={x.label || "Skill"} />)}</View></Panel>
                <Panel title="STRENGTHS"><StringList items={result.strengths} /></Panel>
                <Panel title="AREAS TO IMPROVE"><StringList items={result.weaknesses} /></Panel>
                <Panel title="RECOMMENDATIONS"><StringList items={result.recommendations} /></Panel>
                <Panel title="RECENT REPOSITORIES"><StringList items={result.repos?.slice(0, 8).map((r: Data) => ({ title: r.name, detail: `${r.language || "Language not listed"} · ★ ${r.stars ?? 0} · ${r.description || "No description"}` }))} /></Panel>
              </>}

              {tab === "role" && <>
                <Score value={result.estimated_readiness?.value} label={result.estimated_readiness?.label} />
                <Panel title="MATCHED SKILLS"><StringList items={result.matched_skills?.map((x: Data) => ({ title: x.label, detail: `Evidence: ${(x.evidence || []).join(", ") || "No repository listed"}` }))} /></Panel>
                <Panel title="SKILL GAPS"><StringList items={result.missing_skills} /></Panel>
                <Panel title="SUGGESTED PROJECTS"><StringList items={result.suggested_projects} /></Panel>
                <Panel title="YOUR NEXT STEPS"><StringList items={result.next_steps} /></Panel>
                <Panel title="IMPORTANT NOTES"><StringList items={result.notes} /></Panel>
              </>}

              {tab === "company" && <>
                <Score value={result.estimated_alignment?.value} label={result.estimated_alignment?.label} />
                <Panel title="MATCHED SKILLS"><StringList items={result.matched_skills?.map((x: Data) => ({ title: x.label, detail: `Evidence: ${(x.evidence || []).join(", ") || "No repository listed"}` }))} /></Panel>
                <Panel title="SKILL GAPS"><StringList items={result.skill_gaps} /></Panel>
                <Panel title="SUGGESTED PROJECTS"><StringList items={result.suggested_projects} /></Panel>
                <Panel title="NEXT ACTIONS"><StringList items={result.next_actions} /></Panel>
                <Panel title="ASSUMPTIONS"><StringList items={result.assumptions} /></Panel>
              </>}

              {tab === "roadmap" && <>
                <View style={s.metricsGrid}>
                  <Metric label="Total tasks" value={result.items?.length ?? 0} />
                  <Metric label="High priority" value={result.items?.filter((x: Data) => x.priority === "high").length ?? 0} />
                  <Metric label="Skills to practise" value={result.skills_to_practise?.length ?? 0} />
                </View>
                <Panel title="YOUR ACTION PLAN"><StringList items={result.items?.map((x: Data) => ({ title: x.title, detail: `${x.category || "Task"} · ${x.action || x.why || ""}`, priority: x.priority }))} /></Panel>
                <Panel title="SUGGESTED PROJECTS"><StringList items={result.suggested_projects} /></Panel>
                <Panel title="SKILLS TO PRACTISE"><View style={s.chipWrap}>{(result.skills_to_practise || []).map((x: string, i: number) => <Tag key={i} text={x} />)}</View></Panel>
                {result.note ? <Text style={s.smallNote}>{result.note}</Text> : null}
              </>}

              {result.ai ? <Panel title="AI INSIGHTS">
                <Text style={s.bodyText}>{typeof result.ai === "string" ? result.ai : result.ai.summary || result.ai.overview || "AI analysis is included in the sections above where available."}</Text>
              </Panel> : null}
              {result.ai_note ? <Text style={s.smallNote}>{result.ai_note}</Text> : null}
              {result.ai_error ? <Text style={s.smallNote}>{result.ai_error}</Text> : null}
              {result.disclaimer ? <Text style={s.smallNote}>{result.disclaimer}</Text> : null}
            </> : null}
          </>}

          <Text style={s.footer}>PORTFOLIX  ·  BUILT FOR YOUR NEXT STEP</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  screen: { padding: 20, paddingBottom: 40, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  brandMark: { width: 43, height: 43, borderRadius: 14, backgroundColor: C.violet, alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: C.white, fontSize: 26, fontWeight: "900" },
  brand: { color: C.white, fontSize: 20, fontWeight: "900", letterSpacing: 1.5 },
  eyebrow: { color: C.purple, fontSize: 9, fontWeight: "800", letterSpacing: 1.7, marginTop: 3 },
  status: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.panel, padding: 9, borderRadius: 20, borderWidth: 1, borderColor: C.line },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: C.white, fontSize: 10, fontWeight: "800" },
  hero: { paddingVertical: 15, gap: 9 },
  heroTitle: { color: C.white, fontSize: 32, lineHeight: 38, fontWeight: "900", letterSpacing: -0.8 },
  heroSub: { color: C.muted, fontSize: 14, lineHeight: 21 },
  nav: { gap: 8, paddingBottom: 3 },
  navItem: { paddingHorizontal: 13, paddingVertical: 11, borderRadius: 13, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  navActive: { backgroundColor: "#291C46", borderColor: C.purple },
  navText: { color: C.muted, fontSize: 12, fontWeight: "700" },
  navTextActive: { color: C.white },
  panel: { backgroundColor: C.panel, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: C.line, gap: 14 },
  panelTitle: { color: C.purple, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureCard: { flexDirection: "row", alignItems: "center", gap: 13, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel },
  featureIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#2B1D47", alignItems: "center", justifyContent: "center" },
  featureIconText: { color: C.purple, fontSize: 23, fontWeight: "800" },
  cardTitle: { color: C.white, fontSize: 14, fontWeight: "800" },
  bodyText: { color: C.muted, fontSize: 12, lineHeight: 19 },
  arrow: { color: C.purple, fontSize: 22 },
  sectionHeading: { color: C.white, fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  fieldLabel: { color: C.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginTop: 2 },
  input: { color: C.white, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14 },
  button: { backgroundColor: C.violet, borderRadius: 13, paddingHorizontal: 15, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  buttonText: { color: C.white, fontWeight: "900", fontSize: 12 },
  disabled: { opacity: 0.5 },
  choice: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg },
  choiceActive: { backgroundColor: "#342153", borderColor: C.purple },
  choiceText: { color: C.muted, fontSize: 11, fontWeight: "700" },
  choiceTextActive: { color: C.white },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { borderRadius: 10, borderWidth: 1, backgroundColor: C.bg, paddingHorizontal: 9, paddingVertical: 6, alignSelf: "flex-start" },
  tagText: { fontSize: 10, fontWeight: "800" },
  loading: { flexDirection: "row", alignItems: "center", gap: 10 },
  errorText: { color: C.red, fontSize: 12, lineHeight: 18 },
  resultHeading: { gap: 6, paddingVertical: 3 },
  resultTitle: { color: C.white, fontSize: 24, fontWeight: "900" },
  scoreCard: { flexDirection: "row", alignItems: "center", gap: 15, backgroundColor: C.panel2, borderRadius: 20, borderWidth: 1, borderColor: "#60409A", padding: 17 },
  scoreCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: C.purple, alignItems: "center", justifyContent: "center" },
  scoreNumber: { color: C.white, fontSize: 25, fontWeight: "900" },
  scoreOutOf: { color: C.muted, fontSize: 9 },
  scoreTitle: { color: C.white, fontSize: 13, fontWeight: "800", marginBottom: 5 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { flexGrow: 1, flexBasis: "28%", minWidth: 88, backgroundColor: C.panel2, borderRadius: 15, padding: 13, gap: 5, borderWidth: 1, borderColor: C.line },
  metricValue: { color: C.white, fontSize: 22, fontWeight: "900" },
  metricLabel: { color: C.muted, fontSize: 10, fontWeight: "700" },
  metricHint: { color: C.purple, fontSize: 9 },
  listItem: { gap: 6, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: C.line },
  itemHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.purple },
  itemTitle: { flex: 1, color: C.white, fontSize: 12, fontWeight: "800" },
  smallNote: { color: "#898398", fontSize: 10, lineHeight: 16 },
  footer: { color: "#5D566D", textAlign: "center", fontSize: 9, fontWeight: "800", letterSpacing: 1.4, marginTop: 8 },
});


