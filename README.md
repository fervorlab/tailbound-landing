# Tailbound landing

https://tailbound.xyz 에서 제공하는 한국어·영어·일본어·중국어 게임 소개 사이트입니다. 게임 본체 `app.tailbound.xyz`와 별도 저장소입니다.

## 개발

Node 24와 pnpm 10.28.2를 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## 검증

```sh
pnpm lint
pnpm type-check
pnpm test
pnpm cf:build
pnpm cf:verify
```

`cf:verify`는 임시 로컬 workerd를 띄워 4개 언어·언어 쿠키·스토어 전환 추적·광고 인증 파일·검색 메타데이터·정적 자산·404를 검사하고 종료합니다. 로컬 자산 서버는 CDN의 Range 처리를 구현하지 않으므로 영상 원본 바이트를 비교하고, 공개 HTTPS의 `pnpm cf:smoke`에서는 영상 부분 응답(206/Content-Range)을 별도로 강제합니다.

## Cloudflare 배포

production은 Cloudflare Workers Builds의 `main`만 연결합니다. Preview builds는 끕니다. GitHub Actions는 PR 검증만 실행하며 배포 자격증명을 저장하지 않습니다.

| 설정 | 값 |
| --- | --- |
| Worker | `tailbound-landing` |
| 저장소 | `fervorlab/tailbound-landing` |
| Node / pnpm | `NODE_VERSION=24`, `PNPM_VERSION=10.28.2` |
| Build command | `pnpm lint && pnpm type-check && pnpm test && pnpm cf:build && pnpm cf:verify` |
| Deploy command | `pnpm exec wrangler deploy --config wrangler.jsonc --tag "$WORKERS_CI_COMMIT_SHA"` |
| Root | 저장소 루트 |

`wrangler.jsonc`가 `tailbound.xyz/*` 운영 라우트를 관리합니다. 자동 배포는 전용 `tailbound-landing-builds` 토큰을 사용하며, 토큰 비밀값은 Cloudflare Builds에만 저장합니다. 토큰 교체 시 기존 계정·도메인 범위를 유지하고 Builds 연결의 토큰 선택을 갱신합니다.

배포 명령은 기존 `.open-next` 산출물을 사용하며 다시 빌드하지 않습니다. Next.js·OpenNext·Wrangler는 정확한 버전을 고정합니다. 이 사이트에는 DB·ISR·추가 R2 저장소가 없습니다.

최초 도메인 연결은 가비아 DNS 전체를 백업·대조한 뒤 Cloudflare DNS로 옮깁니다. `app`·`cdn`·`storybook`·`wiki` 및 AWS 인증 CNAME의 값과 DNS only 상태를 보존합니다. 홍보 사이트 apex와 `www`만 연결하며 `www`는 경로·쿼리를 유지해 apex로 영구 이동시킵니다. 네임서버 전파와 TLS 인증서 준비를 확인하기 전 Vercel을 중지하지 않습니다.

배포 뒤 `pnpm cf:smoke`와 브라우저 언어 전환·스토어 링크를 검사합니다. 공개 검사가 실패하면 성공으로 간주하지 않으며 Cloudflare Deployments에서 마지막 정상 버전으로 rollback하고 수정 PR을 반영합니다. 최초 전환 중에는 백업한 가비아 네임서버·DNS로 복구할 수 있습니다. Vercel 프로젝트 영구 삭제는 별도 최종 승인을 받은 뒤 진행합니다.
