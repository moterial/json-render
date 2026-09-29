import type { Spec } from "@json-render/core";

export interface DemoScene {
  step: string;
  caption: string;
  subCaption: string;
  prompt: string;
  spec: Spec;
}

const N = null;

// Scene 1: a shop owner asks for a booking form with phone validation.
const bookingForm: Spec = {
  root: "card",
  state: { form: { name: "", phone: "", time: "", drink: "" }, result: null },
  elements: {
    card: {
      type: "Card",
      props: {
        title: "茶小满 · 会员到店预约",
        description: "填写后到店报手机号，立享第二杯半价",
        maxWidth: N,
        centered: N,
        className: N,
      },
      children: ["stack"],
    },
    stack: {
      type: "Stack",
      props: {
        direction: "vertical",
        gap: "md",
        align: N,
        justify: N,
        className: N,
      },
      children: ["name", "phone", "time", "drink", "submit", "result"],
    },
    name: {
      type: "Input",
      props: {
        label: "姓名",
        name: "name",
        type: "text",
        placeholder: "怎么称呼你",
        value: { $bindState: "/form/name" },
        checks: [{ type: "required", message: "请填写姓名" }],
        validateOn: "blur",
      },
    },
    phone: {
      type: "Input",
      props: {
        label: "手机号",
        name: "phone",
        type: "text",
        placeholder: "11 位手机号",
        value: { $bindState: "/form/phone" },
        checks: [
          { type: "required", message: "请填写手机号" },
          {
            type: "pattern",
            args: { pattern: "^1[3-9]\\d{9}$" },
            message: "手机号格式不对，请检查",
          },
        ],
        validateOn: "blur",
      },
    },
    time: {
      type: "Select",
      props: {
        label: "到店时间",
        name: "time",
        options: ["今天 14:00", "今天 16:00", "今天 19:00", "明天 10:00"],
        placeholder: "选择时间",
        value: { $bindState: "/form/time" },
        checks: [{ type: "required", message: "请选择到店时间" }],
        validateOn: "change",
      },
    },
    drink: {
      type: "Radio",
      props: {
        label: "想喝什么",
        name: "drink",
        options: ["杨枝甘露", "生椰拿铁", "芋泥波波"],
        value: { $bindState: "/form/drink" },
        checks: N,
        validateOn: N,
      },
    },
    submit: {
      type: "Button",
      props: { label: "提交预约", variant: "primary", disabled: N },
      on: {
        press: [{ action: "validateForm", params: { statePath: "/result" } }],
      },
    },
    result: {
      type: "Alert",
      props: {
        title: {
          $cond: { $state: "/result/valid", eq: true },
          $then: "预约成功",
          $else: "还有信息没填对",
        },
        message: {
          $cond: { $state: "/result/valid", eq: true },
          $then: { $template: "${/form/name}，我们 ${/form/time} 见！" },
          $else: "请按提示修改后再提交",
        },
        type: {
          $cond: { $state: "/result/valid", eq: true },
          $then: "success",
          $else: "error",
        },
      },
      visible: { $state: "/result", neq: null },
    },
  },
};

// Scene 2: weekly sales dashboard.
const dashboardElements: Spec["elements"] = {
  page: {
    type: "Stack",
    props: {
      direction: "vertical",
      gap: "md",
      align: N,
      justify: N,
      className: N,
    },
    children: ["title", "grid", "goal", "rank"],
  },
  title: {
    type: "Stack",
    props: {
      direction: "horizontal",
      gap: "sm",
      align: "center",
      justify: "between",
      className: N,
    },
    children: ["h", "badge"],
  },
  h: { type: "Heading", props: { text: "本周经营看板", level: "h3" } },
  badge: { type: "Badge", props: { text: "较上周 +18%", variant: "default" } },
  grid: {
    type: "Grid",
    props: { columns: 2, gap: "sm", className: N },
    children: ["m1", "m2", "m3", "m4"],
  },
  goal: {
    type: "Progress",
    props: { value: 76, max: 100, label: "月度营业额目标 76%" },
  },
  rank: {
    type: "Table",
    props: {
      caption: "爆款排行（按销量）",
      columns: ["排名", "单品", "销量", "营业额"],
      rows: [
        ["1", "杨枝甘露", "486", "¥7,290"],
        ["2", "生椰拿铁", "402", "¥6,030"],
        ["3", "芋泥波波", "355", "¥5,325"],
        ["4", "柠檬茶", "298", "¥2,980"],
      ],
    },
  },
};
const metrics: [string, string, string][] = [
  ["营业额", "¥28,460", "+18%"],
  ["订单数", "1,732", "+12%"],
  ["客单价", "¥16.4", "+5%"],
  ["新会员", "214", "+31%"],
];
metrics.forEach(([label, value, delta], i) => {
  const id = `m${i + 1}`;
  dashboardElements[id] = {
    type: "Card",
    props: {
      title: N,
      description: N,
      maxWidth: N,
      centered: N,
      className: "gap-1 py-3",
    },
    children: [`${id}l`, `${id}v`, `${id}d`],
  };
  dashboardElements[`${id}l`] = {
    type: "Text",
    props: { text: label, variant: "muted" },
  };
  dashboardElements[`${id}v`] = {
    type: "Heading",
    props: { text: value, level: "h3" },
  };
  dashboardElements[`${id}d`] = {
    type: "Text",
    props: { text: `环比 ${delta}`, variant: "caption" },
  };
});
const dashboard: Spec = { root: "page", elements: dashboardElements };

// Scene 3: price cards for sharing.
const priceElements: Spec["elements"] = {
  page: {
    type: "Stack",
    props: {
      direction: "vertical",
      gap: "md",
      align: N,
      justify: N,
      className: N,
    },
    children: ["head", "sub", "grid", "cta"],
  },
  head: {
    type: "Heading",
    props: { text: "国庆限定 · 招牌三件套", level: "h3" },
  },
  sub: {
    type: "Text",
    props: {
      text: "10 月 1 日至 7 日，到店出示此页面即可享受",
      variant: "muted",
    },
  },
  grid: {
    type: "Grid",
    props: { columns: 1, gap: "sm", className: N },
    children: ["p1", "p2", "p3"],
  },
  cta: {
    type: "Button",
    props: { label: "一键分享到群聊", variant: "primary", disabled: N },
  },
};
const products: [string, string, string, string][] = [
  ["杨枝甘露", "¥15", "¥22", "人气第一"],
  ["生椰拿铁", "¥13", "¥19", "新品"],
  ["芋泥波波", "¥12", "¥18", "限量"],
];
products.forEach(([name, price, old, tag], i) => {
  const id = `p${i + 1}`;
  priceElements[id] = {
    type: "Card",
    props: {
      title: N,
      description: N,
      maxWidth: N,
      centered: N,
      className: "py-3",
    },
    children: [`${id}row`],
  };
  priceElements[`${id}row`] = {
    type: "Stack",
    props: {
      direction: "horizontal",
      gap: "md",
      align: "center",
      justify: "between",
      className: N,
    },
    children: [`${id}left`, `${id}right`],
  };
  priceElements[`${id}left`] = {
    type: "Stack",
    props: {
      direction: "vertical",
      gap: "sm",
      align: "start",
      justify: N,
      className: N,
    },
    children: [`${id}n`, `${id}t`],
  };
  priceElements[`${id}n`] = {
    type: "Heading",
    props: { text: name, level: "h4" },
  };
  priceElements[`${id}t`] = {
    type: "Badge",
    props: { text: tag, variant: i === 0 ? "destructive" : "secondary" },
  };
  priceElements[`${id}right`] = {
    type: "Stack",
    props: {
      direction: "vertical",
      gap: "none",
      align: "end",
      justify: N,
      className: N,
    },
    children: [`${id}p`, `${id}o`],
  };
  priceElements[`${id}p`] = {
    type: "Heading",
    props: { text: price, level: "h3" },
  };
  priceElements[`${id}o`] = {
    type: "Text",
    props: { text: `原价 ${old}`, variant: "caption" },
  };
});
const priceCards: Spec = { root: "page", elements: priceElements };

export const scenes: DemoScene[] = [
  {
    step: "场景 1 · 预约报名表",
    caption: "说一句话，生成能用的报名表",
    subCaption: "自动校验手机号，提交即收单",
    prompt: "帮我的奶茶店做个会员预约表：姓名、手机号、到店时间，手机号要校验",
    spec: bookingForm,
  },
  {
    step: "场景 2 · 经营数据看板",
    caption: "老板每天要看的数，一句话出看板",
    subCaption: "营业额、订单、爆款排行一屏看清",
    prompt: "做一个本周经营看板：营业额、订单数、客单价、新会员，再加爆款排行",
    spec: dashboard,
  },
  {
    step: "场景 3 · 活动价目卡",
    caption: "节日活动页，发群发朋友圈",
    subCaption: "改文案改价格，再说一句就行",
    prompt: "把招牌三款做成国庆活动价目卡，标出原价和标签，能分享到群里",
    spec: priceCards,
  },
];

/** Convert a spec to the JSONL patch stream json-render consumes from an LLM. */
export function specToPatchLines(spec: Spec): string[] {
  const lines: string[] = [];
  lines.push(JSON.stringify({ op: "add", path: "/root", value: spec.root }));
  if (spec.state) {
    lines.push(
      JSON.stringify({ op: "add", path: "/state", value: spec.state }),
    );
  }
  // Breadth-first so parents appear before their children, like a model would stream.
  const queue = [spec.root];
  const seen = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const el = spec.elements[id];
    if (!el) continue;
    lines.push(
      JSON.stringify({ op: "add", path: `/elements/${id}`, value: el }),
    );
    for (const c of el.children ?? []) queue.push(c);
  }
  return lines;
}
