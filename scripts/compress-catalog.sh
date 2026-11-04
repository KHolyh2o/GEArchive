#!/usr/bin/env bash
# 도록 PDF 용량 줄이기 (Ghostscript 사용)
#   사용법: scripts/compress-catalog.sh 원본.pdf [결과.pdf]
#   결과 파일 이름을 생략하면 원본 옆에 "<원본이름>_압축.pdf"로 저장됩니다. 원본은 건드리지 않습니다.
#
# 2026 도록 기준: 773MB(171쪽) -> 약 141MB, 약 30초.
#   - 이미지 해상도 275dpi로 통일(IMG_DPI). 클수록 선명/용량 증가 (225 -> 약 103MB, 275 -> 약 141MB)
#   - LeaveColorUnchanged: 색 변환을 끔. (끄지 않으면 투명 효과가 있는 인디자인 PDF에서
#     "Cannot use DeviceIndependentColor" 오류가 나며 빈 파일이 만들어질 수 있음)
set -euo pipefail

in="${1:-}"
[ -n "$in" ] && [ -f "$in" ] || { echo "사용법: $0 원본.pdf [결과.pdf]" >&2; exit 1; }
out="${2:-${in%.*}_압축.pdf}"
IMG_DPI="${IMG_DPI:-275}"

GS="$(command -v gs || command -v gswin64c || true)"
[ -n "$GS" ] || { echo "Ghostscript가 필요합니다. 맥: brew install ghostscript" >&2; exit 1; }

log="$(mktemp)"
trap 'rm -f "$log"' EXIT

# 변환 중 나오는 진행 로그는 숨기고, 실패했을 때만 보여 줍니다.
"$GS" -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
  -dCompatibilityLevel=1.6 \
  -dPDFSETTINGS=/ebook \
  -dColorConversionStrategy=/LeaveColorUnchanged \
  -dDetectDuplicateImages=true \
  -dFastWebView=true \
  -dDownsampleColorImages=true -dColorImageDownsampleType=/Bicubic \
  -dColorImageDownsampleThreshold=1.0 -dColorImageResolution="$IMG_DPI" \
  -dDownsampleGrayImages=true -dGrayImageDownsampleThreshold=1.0 \
  -dGrayImageResolution="$IMG_DPI" \
  -sOutputFile="$out" "$in" >"$log" 2>&1 || { tail -20 "$log" >&2; rm -f "$out"; echo "변환에 실패했습니다." >&2; exit 1; }

size() { du -h "$1" | cut -f1; }
echo "완료: $(size "$in") -> $(size "$out")  ($out)"
echo "※ 결과 PDF를 열어 글자·사진이 괜찮은지 꼭 확인한 뒤 업로드하세요."
