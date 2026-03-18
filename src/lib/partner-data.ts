export type PartnerType = "boyfriend" | "girlfriend";

interface PartnerDialogue {
  greeting: string[];
  checkInSuccess: string[];
  checkInFail: string[];
  encouragement: string[];
}

const boyfriendDialogue: PartnerDialogue = {
  greeting: [
    "欢迎回来，今天也要一起加油哦 💪",
    "你来了！我一直在等你呢 ☺️",
    "今天的你，一定比昨天更强大 🌟",
    "我相信你可以的，一起坚持吧！",
  ],
  checkInSuccess: [
    "太棒了！你真的好厉害！🎉",
    "果然不愧是你，我就知道你可以的 ✨",
    "又成功了一天！我为你骄傲 💖",
    "每一天的坚持都在让你变得更好 🌈",
  ],
  checkInFail: [
    "没关系的，明天重新开始就好 🤗",
    "一次失败不代表什么，我会一直在你身边 💕",
    "跌倒了就站起来，我陪你一起 🌸",
    "别灰心，你已经很努力了 ☺️",
  ],
  encouragement: [
    "累了就休息一下，我在这里等你 ☕",
    "你每天的坚持我都看在眼里 👀💖",
    "加油，你是最棒的！",
    "不管结果如何，我都支持你 🫶",
  ],
};

const girlfriendDialogue: PartnerDialogue = {
  greeting: [
    "你来啦～今天也要元气满满哦 🌸",
    "等你好久了～快来打卡吧 💗",
    "今天也要做最好的自己呢 ✨",
    "我会一直陪着你的～加油！🎀",
  ],
  checkInSuccess: [
    "哇！你太厉害了吧！🎊",
    "成功了呢～我好开心！💖",
    "你好棒好棒！继续保持哦 🌟",
    "每次看到你成功我都超级开心的 🥰",
  ],
  checkInFail: [
    "没事的～明天我们重新来过 🌷",
    "别难过啦，我会一直陪着你的 💝",
    "失败是成功之母嘛～抱抱你 🤗",
    "一起加油，明天一定可以的！🌈",
  ],
  encouragement: [
    "今天辛苦了～好好休息吧 🌙",
    "你已经很棒了，不要太勉强自己 💐",
    "每一步都算数的，慢慢来 🐾",
    "我永远支持你哦～ 💕",
  ],
};

export function getDialogue(partnerType: PartnerType): PartnerDialogue {
  return partnerType === "boyfriend" ? boyfriendDialogue : girlfriendDialogue;
}

export function getRandomLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}
