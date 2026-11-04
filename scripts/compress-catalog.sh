#!/usr/bin/env bash
# 도록 PDF 용량 줄이기 (Ghostscript 사용)
#   사용법: scripts/compress-catalog.sh 원본.pdf [결과.pdf]
#   결과 파일 이름을 생략하면 원본 옆에 "<원본이름>_압축.pdf"로 저장됩니다. 원본은 건드리지 않습니다.
#
# 2026 도록 기준: 737MB(171쪽) -> 약 53MB, 약 25초.
#   - /ebook 프리셋: 화면용 150dpi. 웹에서 보는 도록에 충분한 화질
#   - LeaveColorUnchanged: 색 변환을 끔. (끄지 않으면 투명 효과가 있는 인디자인 PDF에서
#     "Cannot use DeviceIndependentColor" 오류가 나며 빈 파일이 만들어질 수 있음)
set -euo pipefail

in="${1:-}"
[ -n "$in" ] && [ -f "$in" ] || { echo "사용법: $0 원본.pdf [결과.pdf]" >&2; exit 1; }
out="${2:-${in%.*}_압축.pdf}"

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
  -sOutputFile="$out" "$in" >"$log" 2>&1 || { tail -20 "$log" >&2; rm -f "$out"; echo "변환에 실패했습니다." >&2; exit 1; }

size() { du -h "$1" | cut -f1; }
echo "완료: $(size "$in") -> $(size "$out")  ($out)"
echo "※ 결과 PDF를 열어 글자·사진이 괜찮은지 꼭 확인한 뒤 업로드하세요."
