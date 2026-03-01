#!/usr/bin/env python3
"""Shared model-series normalization rules for LLM and multimodal models."""

import re
from typing import Optional

PROVIDER_PREFIXES = {
    "qwen": "alibaba",
    "glm": "zhipu",
    "kimi": "moonshot",
    "minimax": "minimax",
    "gemini": "google",
    "gemma": "google",
    "claude": "anthropic",
    "gpt": "openai",
    "o1": "openai",
    "o3": "openai",
    "o4": "openai",
    "o5": "openai",
    "deepseek": "deepseek",
    "llama": "meta",
    "mistral": "mistral",
    "grok": "xai",
    "doubao": "bytedance",
    "ernie": "baidu",
}


def _normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _extract_version_token(text: str) -> Optional[str]:
    lowered = text.lower()
    m = re.search(r"\b(\d+(?:\.\d+)+)(?=[a-z]?\b)", lowered)
    if m:
        return m.group(1)
    m = re.search(r"\b(\d+n)\b", lowered)
    if m:
        return m.group(1)
    m = re.search(r"\b(\d+)\b", lowered)
    if m:
        return m.group(1)
    return None


def _extract_prefixed_version(text: str, prefixes: tuple[str, ...]) -> Optional[str]:
    prefix_group = "|".join(re.escape(p.lower()) for p in prefixes)
    m = re.search(
        rf"\b({prefix_group})\s*([0-9]+(?:\.[0-9]+)?)(?=[a-z]?\b)",
        text.lower(),
    )
    if not m:
        return None
    return f"{m.group(1).upper()}{m.group(2)}"


def _has_brand(text: str, brands: tuple[str, ...]) -> bool:
    low = text.lower()
    return any(b in low for b in brands)


def _canonicalize_by_family(name: str) -> str:
    low = name.lower()

    if "claude" in low:
        family = None
        for fam in ("sonnet", "opus", "haiku"):
            if re.search(rf"\b{fam}\b", low):
                family = fam.title()
                break
        version = re.search(r"\b(\d+(?:\.\d+)?)\b", low)
        if version:
            return _normalize_spaces(f"Claude {version.group(1)} {family or ''}")
        return _normalize_spaces(f"Claude {family or ''}")

    if "deepseek" in low:
        vr = _extract_prefixed_version(low, ("v", "r"))
        if vr:
            return f"DeepSeek {vr}"
        return "DeepSeek"

    if "gemini" in low:
        version = _extract_version_token(low)
        return f"Gemini {version}" if version else "Gemini"

    if "gemma" in low:
        version = _extract_version_token(low)
        return f"Gemma {version}" if version else "Gemma"

    if "glm" in low:
        version = _extract_version_token(low)
        return f"GLM {version}" if version else "GLM"

    if "gpt" in low:
        version = _extract_version_token(low)
        return f"GPT {version}" if version else "GPT"

    if re.search(r"\bo[1-9]\b", low):
        o_match = re.search(r"\b(o[1-9])\b", low)
        if o_match:
            return o_match.group(1).upper()

    if "qwen" in low:
        version = _extract_version_token(low)
        return f"Qwen {version}" if version else "Qwen"

    if "kimi" in low:
        k = _extract_prefixed_version(low, ("k",))
        if k:
            return f"Kimi {k}"
        version = _extract_version_token(low)
        return f"Kimi {version}" if version else "Kimi"

    if "minimax" in low:
        version = _extract_version_token(low)
        return f"MiniMax {version}" if version else "MiniMax"

    if _has_brand(low, ("llama", "meta")):
        version = _extract_version_token(low)
        return f"Llama {version}" if version else "Llama"

    if "mistral" in low:
        version = _extract_version_token(low)
        return f"Mistral {version}" if version else "Mistral"

    if "grok" in low:
        version = _extract_version_token(low)
        return f"Grok {version}" if version else "Grok"

    if _has_brand(low, ("ernie", "baidu")):
        version = _extract_version_token(low)
        return f"ERNIE {version}" if version else "ERNIE"

    if _has_brand(low, ("doubao", "seed")):
        version = _extract_version_token(low)
        return f"Doubao {version}" if version else "Doubao"

    if _has_brand(low, ("nemotron", "nvidia")):
        version = _extract_version_token(low)
        return f"NVIDIA Nemotron {version}" if version else "NVIDIA Nemotron"

    if re.search(r"\btri\b", low):
        size = re.search(r"\b(\d+(?:\.\d+)?)b\b", low)
        think = " Think" if re.search(r"\bthink\b", low) else ""
        if size:
            return f"Tri {size.group(1)}B{think}"
        return f"Tri{think}".strip()

    return name


def trim_series_tail_noise(name: str) -> str:
    s = re.sub(r"\s+", " ", name).strip()

    while True:
        ns = re.sub(r"\s*[\(\[].*?[\)\]]\s*$", "", s).strip()
        if ns == s:
            break
        s = ns

    tail_words = (
        "max", "turbo", "fast", "standard", "ultra", "preview",
        "pro", "plus", "lite", "instruct", "flash", "director",
    )
    pattern = r"(?:\s+|-)(?:" + "|".join(tail_words) + r")$"
    while True:
        ns = re.sub(pattern, "", s, flags=re.IGNORECASE).strip()
        if ns == s:
            break
        s = ns

    return s


def _canonicalize_multimodal(name: str) -> str:
    low = name.lower()

    if "flux" in low:
        v = re.search(r"flux\s*\.?\s*([0-9]+(?:\.[0-9]+)?)", low)
        if v:
            major = int(float(v.group(1)))
            if major in (1, 2):
                return f"Flux {major}"

    if re.search(r"\bstep1x\s*edit\b", low):
        return "Step1X Edit"

    if "inworld tts" in low:
        m = re.search(r"inworld\s*tts\s*([0-9]+(?:\.[0-9]+)?)", low)
        if m:
            return f"Inworld TTS {m.group(1)}"
        return "Inworld TTS"

    if re.search(r"\bamazon\s+titan\s+g1\b", low):
        return "Amazon Titan G1"

    if re.search(r"\bhunyuanimage\s*3\.0\b", low):
        return "HunyuanImage 3.0"

    if re.search(r"\bsora\s*2\b", low):
        return "Sora 2"

    if re.search(r"\breve\s*v?1\b", low):
        return "Reve V1"

    if "hailuo" in low:
        if re.search(r"\b2\.3\b", low):
            return "Hailuo 2.3"
        if re.search(r"\b0?2\b", low):
            return "Hailuo 02"

    if "runway gen 3 alpha" in low:
        return "Runway Gen 3 Alpha"

    if re.search(r"\bveo\b", low):
        m = re.search(r"\bveo\s*([0-9]+(?:\.[0-9]+)?)", low)
        if m:
            return f"Veo {m.group(1)}"

    if re.search(r"\bvidu\s*q[0-9]+\b", low):
        m = re.search(r"\b(vidu\s*q[0-9]+)\b", low)
        if m:
            return _normalize_spaces(m.group(1).title())

    if re.search(r"\bimagen\s*4\b", low):
        return "Imagen 4"

    if re.search(r"\bideogram\s*v?2", low):
        return "Ideogram v2"

    if re.search(r"\blucid\s+origin\b", low):
        return "Lucid Origin"

    if re.search(r"\bluma\s+photon\b", low):
        return "Luma Photon"

    if re.search(r"\bstable\s+diffusion\b", low):
        m = re.search(r"\bstable\s+diffusion\s+([0-9]+(?:\.[0-9]+)?)\b", low)
        if m:
            return f"Stable Diffusion {m.group(1)}"

    return name


def extract_series_name(aa_name: str, modality: Optional[str] = None) -> str:
    """Strip suffixes and collapse variants into canonical series families."""
    name = aa_name

    name = re.sub(
        r"\s*\((Non-reasoning|Reasoning|Adaptive Reasoning|"
        r"high|low|medium|minimal|xhigh|ChatGPT|experimental|preview|"
        r"high effort|low effort)\)",
        "",
        name,
        flags=re.IGNORECASE,
    )
    name = re.sub(r"\s*\([A-Za-z]{3,9}\s*'?\s*\d{2}\)", "", name)
    name = re.sub(r"\s*\(\d{4}\)", "", name)
    name = re.sub(r"\s+\d+(\.\d+)?[Bb]\s+[Aa]\d+(\.\d+)?[Bb]", "", name)
    name = re.sub(r"\s+[Aa]\d+(\.\d+)?[Bb]", "", name)
    name = re.sub(r"\s+\d+(\.\d+)?[Bb]", "", name)
    name = re.sub(
        r"\s+(Instruct|Preview|Experimental|Thinking|Exp|Speciale)\s*$",
        "",
        name,
        flags=re.IGNORECASE,
    )
    name = re.sub(r"\s+\d{4}\s*$", "", name)
    name = re.sub(r"\s*-\s*", " ", name)
    name = _normalize_spaces(name)

    canonical = _canonicalize_by_family(name)
    if (modality or "llm") != "llm":
        canonical = _canonicalize_multimodal(canonical)
        canonical = trim_series_tail_noise(canonical)
    return canonical


def make_slug(name: str) -> str:
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9.]+", "-", slug)
    return slug.strip("-")


def normalize_for_match(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())


def infer_provider(series_name: str) -> Optional[str]:
    low = series_name.lower()
    for prefix, provider in PROVIDER_PREFIXES.items():
        if low.startswith(prefix):
            return provider
    return None

