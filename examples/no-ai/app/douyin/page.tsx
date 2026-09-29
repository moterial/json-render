"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { JSONUIProvider, Renderer } from "@json-render/react";
import { createSpecStreamCompiler, type Spec } from "@json-render/core";
import {
  registry,
  actionHandlers,
  computedFunctions,
} from "@/lib/render/registry";
import { scenes, specToPatchLines } from "@/lib/douyin-scenes";

// A vertical (9:16) demo page for recording a short video. The UI is rendered
// by the real json-render renderer from a JSONL patch stream; the stream is
// replayed from pre-written specs so the recording needs no model API key.

type Phase = "intro" | "scene" | "flex" | "outro";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function SpecView({
  spec,
  streamKey,
}: {
  spec: Spec;
  streamKey: number;
}): ReactNode {
  return (
    <JSONUIProvider
      key={streamKey}
      registry={registry}
      initialState={spec.state ?? {}}
      handlers={actionHandlers}
      functions={computedFunctions}
    >
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}

export default function DouyinDemo() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [spec, setSpec] = useState<Spec | null>(null);
  const [streamKey, setStreamKey] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [dark, setDark] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const renderRef = useRef<HTMLDivElement>(null);

  const runScene = useCallback(async (i: number) => {
    const scene = scenes[i]!;
    setPhase("scene");
    setSceneIndex(i);
    setSpec(null);
    setLines([]);
    setTyped("");
    setDark(false);
    setStreamKey((k) => k + 1);
    await sleep(500);
    for (let c = 1; c <= scene.prompt.length; c++) {
      setTyped(scene.prompt.slice(0, c));
      await sleep(55);
    }
    await sleep(350);
    setGenerating(true);
    const compiler = createSpecStreamCompiler<Spec>();
    const patchLines = specToPatchLines(scene.spec);
    for (const line of patchLines) {
      const { result } = compiler.push(line + "\n");
      // The state patch must land before the provider mounts, so remount once it arrives.
      if (line.includes('"path":"/state"')) setStreamKey((k) => k + 1);
      setSpec({ ...result, elements: { ...(result.elements ?? {}) } } as Spec);
      setLines((prev) => [...prev.slice(-5), line]);
      await sleep(Math.min(260, 70 + line.length / 3));
    }
    setGenerating(false);
  }, []);

  useEffect(() => {
    const api = {
      runScene,
      setPhase,
      setDark,
      confetti: () => setConfetti((k) => k + 1),
    };
    (window as unknown as { demo: typeof api }).demo = api;
  }, [runScene]);

  const scene = scenes[sceneIndex]!;

  return (
    <div
      className="w-[540px] h-[960px] overflow-hidden relative text-white"
      style={{
        fontFamily:
          '"PingFang SC","WenQuanYi Zen Hei","Noto Sans CJK SC",var(--font-geist-sans),sans-serif',
        background:
          "radial-gradient(120% 60% at 50% 0%, #3b1d6e 0%, #140a2a 55%, #07040f 100%)",
      }}
    >
      {phase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center gap-6 animate-in fade-in duration-700">
          <div className="text-[22px] tracking-widest text-[#ff4d8d] font-bold">
            实体店老板 / 小商家
          </div>
          <div className="text-[46px] leading-[1.2] font-black">
            不会写代码？
            <br />
            <span className="text-[#25f4ee]">说一句话</span>
            <br />
            页面就做好了
          </div>
          <div className="text-[20px] text-white/70 leading-relaxed">
            报名表 · 数据看板 · 活动页
            <br />
            AI 实时生成，马上能用
          </div>
        </div>
      )}

      {phase === "scene" && (
        <div className="absolute inset-0 flex flex-col px-5 pt-8 pb-5 gap-3">
          <div
            className="animate-in fade-in slide-in-from-top-2 duration-500"
            key={`cap-${sceneIndex}`}
          >
            <div className="inline-block rounded-full bg-[#ff4d8d] px-3 py-1 text-[15px] font-bold">
              {scene.step}
            </div>
            <div className="mt-2 text-[30px] font-black leading-tight">
              {scene.caption}
            </div>
            <div className="text-[17px] text-[#25f4ee] mt-1">
              {scene.subCaption}
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-[16px] leading-snug min-h-[72px]">
            <span className="text-white/60">你说：</span>
            {typed}
            {!generating && typed.length < scene.prompt.length && (
              <span className="inline-block w-[2px] h-[18px] bg-white align-middle ml-0.5 animate-pulse" />
            )}
          </div>

          <div
            ref={renderRef}
            className={`relative flex-1 min-h-0 rounded-2xl overflow-hidden ${dark ? "dark bg-neutral-950" : "bg-white"} text-foreground`}
          >
            <div className="absolute top-2 right-3 z-20 text-[12px] font-medium text-neutral-400">
              {generating ? "AI 生成中..." : spec ? "已生成，可直接使用" : ""}
            </div>
            {confetti > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <ConfettiExplosion
                  key={confetti}
                  portal={false}
                  force={0.7}
                  duration={3000}
                  particleCount={180}
                  width={900}
                  colors={["#25f4ee", "#ff4d8d", "#ffe14d", "#7b61ff"]}
                />
              </div>
            )}
            <div className="h-full overflow-hidden p-4 pt-7 text-[15px] [&_input]:text-[15px]">
              {spec?.root && spec.elements?.[spec.root] ? (
                <SpecView spec={spec} streamKey={streamKey} />
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-400 text-[15px]">
                  {typed ? "等待生成..." : ""}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-black/60 border border-white/10 px-3 py-2 h-[118px] overflow-hidden">
            <div className="text-[12px] text-[#25f4ee] mb-1">
              AI 实际输出：受控 JSON（只能用你允许的组件）
            </div>
            <div className="font-mono text-[10px] leading-[15px] text-white/70">
              {lines.map((l, i) => (
                <div key={i} className="truncate">
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "flex" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-7 gap-6 text-center animate-in fade-in duration-500">
          <div className="text-[34px] font-black leading-tight">
            同一份 JSON
            <br />
            <span className="text-[#25f4ee]">到处都能用</span>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full text-[18px] font-bold">
            {[
              "网页 / H5",
              "手机 App",
              "PDF 报价单",
              "营销邮件",
              "短视频",
              "Vue / Svelte 项目",
            ].map((t, i) => (
              <div
                key={t}
                className="rounded-xl bg-white/10 border border-white/15 py-4 animate-in fade-in slide-in-from-bottom-3"
                style={{
                  animationDelay: `${i * 180}ms`,
                  animationFillMode: "both",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[#ff4d8d]/15 border border-[#ff4d8d]/50 px-5 py-4 text-[18px] leading-relaxed">
            AI 只能用你规定的组件和动作
            <br />
            <span className="text-white/70 text-[16px]">
              不会乱改页面，输出稳定可控
            </span>
          </div>
        </div>
      )}

      {phase === "outro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center gap-7 animate-in fade-in duration-700">
          <div className="text-[48px] font-black leading-tight">
            一句话
            <br />
            <span className="text-[#25f4ee]">出页面</span>
          </div>
          <div className="text-[20px] text-white/80 leading-loose">
            不写代码 · 手机上就能改
            <br />
            报名、收单、看数据，一套搞定
          </div>
          <div className="rounded-full bg-[#ff4d8d] px-7 py-3 text-[20px] font-bold">
            评论区扣「试用」领体验名额
          </div>
        </div>
      )}
    </div>
  );
}
