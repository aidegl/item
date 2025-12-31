const MOCK_PATIENTS = {
    "1": {
        name: "张三",
        gender: "男",
        age: 56,
        phone: "13800138000",
        allergy: "青霉素过敏",
        history: "高血压"
    },
    "2": {
        name: "李四",
        gender: "女",
        age: 32,
        phone: "13900139000",
        allergy: "无",
        history: "无"
    }
};

const MOCK_AI_TRANSCRIPT = {
    symptom: "反复胃痛，伴有反酸",
    startTime: "一周前，吃火锅后开始",
    coreQuestion: "想确诊是不是胃溃疡，是否需要做胃镜"
};

const MOCK_OCR_RESULT = {
    diagnosis: "慢性浅表性胃炎",
    advice: "1. 建议清淡饮食，避免辛辣刺激。\n2. 口服奥美拉唑肠溶胶囊，每日一次。\n3. 定期复查。"
};
