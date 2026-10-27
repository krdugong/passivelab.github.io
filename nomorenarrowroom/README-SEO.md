# NoMoreNarrowRoom 정적 페이지 생성

후쿠오카 호텔의 원본 데이터는 `data/hotels.js`입니다. 같은 데이터를 수정한 뒤 저장소 루트에서 아래 명령을 실행하면 HTML, 사이트맵, 하위 경로의 robots 파일이 다시 생성됩니다.

```sh
node nomorenarrowroom/scripts/build-seo.cjs
```

생성 경로는 `fukuoka/`, `fukuoka/hakata/`, `fukuoka/tenjin/`, `fukuoka/nakasu/`, `fukuoka/20sqm/`, `fukuoka/bath/`, `hotel/<slug>/`입니다. 기존 `fukuoka.html`은 새 주소로 이동합니다. 모든 페이지는 호텔 카드와 핵심 정보를 HTML에 포함하며, 필터와 지도만 JavaScript로 향상됩니다.

## 호텔을 추가할 때

1. `data/hotels.js`에 안정적인 `id`, 고유한 호텔명, 지역, 2인 기본 객실 면적, 객실 타입, 대욕장 여부, 확인일, 확인 근거, 위치 좌표를 기록합니다.
2. `reviewNote`에는 호텔별로 다른 실제 이용 판단 정보를 간결히 기록합니다. 역 도보 시간, 캐리어를 펼칠 수 있는지 같은 미확인 사실은 쓰지 않습니다.
3. 가능하면 `officialSourceUrl`, `bathSourceUrl`을 넣고 `verifiedAt`은 자료를 실제로 확인한 날짜로만 바꿉니다. 빌드 날짜로 자동 갱신하지 않습니다.
4. 생성 명령을 실행하고 생성된 HTML 및 `sitemap.xml`을 함께 커밋합니다.

기존 데이터에는 공식 링크가 없는 항목이 많습니다. HTML은 기존의 `verification` 기록과 후기 링크를 표시하지만, 공식 확인 링크가 없는데 새로 검증한 것처럼 주장하지 않습니다. `Hotel` 구조화 데이터에는 확인 가능한 호텔명, 위치 지역, 객실 최소 면적, 대욕장 유무만 포함하며 평점이나 가격을 생성하지 않습니다.

`robots.txt`는 도메인 루트에 두어 `https://psvl.kr/robots.txt`에서 제공하고, `nomorenarrowroom/sitemap.xml`을 가리킵니다. GitHub Pages의 실제 호스트가 `psvl.kr`로 이동하므로 canonical도 이 도메인을 사용합니다. 배포 후 네이버 서치어드바이저에서 사이트 소유 확인과 사이트맵 제출을 별도로 진행해야 합니다.
