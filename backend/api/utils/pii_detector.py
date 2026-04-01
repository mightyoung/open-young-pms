"""随手拍敏感信息检测 — 文字脱敏"""

import re

# 敏感信息正则模式
SENSITIVE_PATTERNS = {
    "phone": (re.compile(r"1[3-9]\d{9}"), "****"),
    "id_card": (re.compile(r"\d{17}[\dXx]"), "**************"),
    "email": (re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"), "***@***.***"),
    "bank_card": (re.compile(r"\d{12,19}"), "****"),
}

# 敏感词库
SENSITIVE_KEYWORDS = [
    "身份证",
    "密码",
    "password",
    "账号",
    "资金",
    "贿赂",
    "回扣",
    "红包",
    "行贿",
    "贪污",
    "挪用",
    "私吞",
    "泄露",
    "机密",
]


def detect_pii(text: str) -> dict:
    """检测文本中的敏感信息，返回脱敏后的文本和检测结果"""
    if not text:
        return {"original": text, "sanitized": text, "has_sensitive": False, "findings": []}

    sanitized = text
    findings = []

    for ptype, (pattern, mask) in SENSITIVE_PATTERNS.items():
        matches = pattern.findall(sanitized)
        for match in matches:
            findings.append({"type": ptype, "original": match, "masked": mask})
            sanitized = sanitized.replace(match, mask)

    text_lower = text.lower()
    for keyword in SENSITIVE_KEYWORDS:
        if keyword.lower() in text_lower:
            findings.append({"type": "keyword", "keyword": keyword})

    return {
        "original": text,
        "sanitized": sanitized,
        "has_sensitive": len(findings) > 0,
        "findings": findings,
    }


def check_hazard_content(description: str) -> dict:
    """检查随手拍隐患描述的敏感信息"""
    result = detect_pii(description)
    if result["has_sensitive"]:
        result["warning"] = "检测到敏感信息，已自动脱敏"
        result["suggestion"] = "请确认上报内容不包含个人隐私或商业机密"
    return result
