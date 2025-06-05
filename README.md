# 바닐라 JS 프로젝트 성능 최적화 보고서

**프로젝트 URL**: https://front-5th-chapter4-2basic.web.app/




#### 초기 성능 측정 결과

Core Web Vital 성능 측정 결과

![스크린샷 2025-06-04 오후 4 36 58](https://github.com/user-attachments/assets/926ac997-0bf8-4b6f-b239-ca667b94e38b)

PageSpeed Insights 성능 측정 결과

![스크린샷 2025-06-06 오전 3 55 45](https://github.com/user-attachments/assets/90474046-31e6-46d8-bf00-dad7f70964e4)


---

# 웹사이트 성능 개선 보고서

## 📊 성능 개선 요약

| 개선 영역 | 기술 적용 | 예상 개선 효과 |
|-----------|-----------|----------------|
| **이미지 최적화** | WebP 변환, 반응형 이미지, Lazy Loading | 로딩 시간 40-60% 단축 |
| **폰트 최적화** | 로컬 폰트, font-display: swap | FOUT 제거, 렌더링 블로킹 해소 |
| **JavaScript 최적화** | 비동기 처리, API 캐싱, DOM 최적화 | 메인 스레드 블로킹 해소, 반복 요청 제거 |
| **SEO/접근성** | 메타태그, aria-label, 시맨틱 마크업 | 검색 노출 개선, 웹 접근성 향상 |
| **리소스 로딩** | defer, 스크립트 최적화 | 초기 렌더링 속도 개선 |

## 🎯 Core Web Vitals 개선사항

### **LCP (Largest Contentful Paint) 개선**

#### 적용 기술
- **WebP 이미지 형식 적용**
  ```html
  <!-- Before: JPG -->
  <img src="images/Hero_Desktop.jpg">
  
  <!-- After: WebP with responsive images -->
  <picture>
    <source media="(max-width: 575px)" srcset="images/Hero_Mobile.webp">
    <source media="(min-width: 576px) and (max-width: 960px)" srcset="images/Hero_Tablet.webp">
    <img src="images/Hero_Desktop.webp" alt="다양한 VR 헤드셋을 체험하는 모습">
  </picture>
  ```

- **로컬 폰트 사용으로 외부 요청 제거**
  ```css
  /* Before: Google Fonts 외부 요청 */
  @import url('https://fonts.googleapis.com/css?family=Heebo:300,400,600,700&display=swap');
  
  /* After: 로컬 폰트 */
  @font-face {
    font-family: "Heebo";
    src: url("fonts/Heebo-Regular.ttf") format("truetype");
    font-display: swap;
  }
  ```


### **INP (Interaction to Next Paint) 개선**

#### 적용 기술
- **무거운 연산 비동기화**
  ```javascript
  // Before: 메인 스레드 블로킹
  for (let i = 0; i < 10000000; i++) {
    const temp = Math.sqrt(i) * Math.sqrt(i);
  }
  
  // After: 청크 단위 비동기 처리
  function heavyCalculationAsync() {
    return new Promise((resolve) => {
      const chunkSize = 100000;
      function processChunk() {
        // 청크 단위로 처리
        setTimeout(processChunk, 0);
      }
      processChunk();
    });
  }
  ```

- **DOM 조작 최적화**
  ```javascript
  // Before: 직접 DOM 추가 (여러 번 리플로우)
  container.appendChild(productElement);
  
  // After: DocumentFragment 사용
  const fragment = document.createDocumentFragment();
  fragment.appendChild(productElement);
  container.appendChild(fragment); // 한 번만 리플로우
  ```


### **CLS (Cumulative Layout Shift) 개선**

#### 적용 기술
- **이미지 크기 명시**
  ```html
  <!-- Before: 크기 없음 -->
  <img src="image.jpg" alt="product">
  
  <!-- After: 크기 명시로 레이아웃 시프트 방지 -->
  <img width="1920" height="893" src="image.webp" alt="product">
  ```

- **지연 로딩 스타일링**
  ```css
  .lazy-image {
    background-color: #f0f0f0;
    min-height: 100px; /* 최소 높이로 레이아웃 보장 */
  }
  ```

- **애니메이션 최적화**
  ```css
  /* CSS 기반 부드러운 애니메이션 */
  @keyframes fadeInAfterDelay {
    0% { opacity: 0; visibility: hidden; }
    100% { opacity: 1; visibility: visible; }
  }
  ```


## 🚀 추가 성능 최적화 구현

### **1. 이미지 지연 로딩 (Lazy Loading)**
```javascript
const lazyImageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy-image');
      observer.unobserve(img);
    }
  });
});

// 첫 3개 이미지는 즉시 로드, 나머지는 지연 로드
if (index < 3) {
  img.src = product.image;
} else {
  lazyImageObserver.observe(img);
}
```

초기 페이지 로드 시 불필요한 이미지 요청 제거

### **2. API 응답 캐싱**
```javascript
const CACHE_KEY = 'products_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5분

// 캐시 확인 및 사용
const cachedItem = localStorage.getItem(CACHE_KEY);
if (cachedItem) {
  const { products, timestamp } = JSON.parse(cachedItem);
  if (Date.now() - timestamp < CACHE_DURATION_MS) {
    displayProducts(products);
    return; // 캐시된 데이터 사용
  }
}
```

반복 방문 시 API 요청 제거, 즉시 콘텐츠 표시

### **3. 요청 타임아웃 및 에러 처리**
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
}, 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
} catch (error) {
  showErrorIndicator(error.message);
}
```

네트워크 이슈 시 사용자 경험 개선

## 📈 SEO 및 접근성 개선

### **1. 검색 엔진 최적화**
```html
<!-- 메타 설명 추가 -->
<meta name="description" content="Tech Shop에서 다양한 VR 헤드셋과 액세서리를 만나보세요.">

<!-- 캐노니컬 URL 설정 -->
<link rel="canonical" href="https://front-5th-chapter4-2basic.web.app/">
```

### **2. 웹 접근성 강화**
```html
<!-- 스크린 리더 지원 -->
<input type="email" aria-label="뉴스레터 구독 이메일 주소">

<!-- 더 구체적인 alt 텍스트 -->
<img src="menu_icon.webp" alt="메뉴 열기">
```

### **3. 스크립트 로딩 최적화**
```html
<!-- 파싱 블로킹 방지 -->
<script defer src="/js/main.js"></script>
<script defer src="/js/products.js"></script>
```



## 📋 구현 완료 체크리스트

- ✅ **이미지 최적화**
  - ✅ WebP 형식 변환
  - ✅ 반응형 이미지 구현
  - ✅ Lazy Loading 구현
  - ✅ 이미지 크기 명시

- ✅ **JavaScript 최적화**
  - ✅ 무거운 연산 비동기화
  - ✅ DOM 조작 최적화
  - ✅ API 캐싱 구현
  - ✅ 에러 처리 강화

- ✅ **폰트 최적화**
  - ✅ 로컬 폰트 사용
  - ✅ font-display: swap 적용

- ✅ **SEO/접근성**
  - ✅ 메타 태그 최적화
  - ✅ aria-label 추가
  - ✅ 시맨틱 마크업 개선

- ✅ **리소스 로딩**
  - ✅ 스크립트 defer 속성 추가
  - ✅ DOMContentLoaded 활용


---
최종결과


![스크린샷 2025-06-06 오전 3 59 55](https://github.com/user-attachments/assets/58d139ff-e53c-4235-8540-69d8febdba9a)
![스크린샷 2025-06-06 오전 4 02 05](https://github.com/user-attachments/assets/c5703880-9558-4f9a-8b82-6f81fcc147a4)


---

## 📖 Lighthouse와 Core Web Vitals 개념

### Lighthouse란?
Lighthouse는 Google에서 개발한 웹사이트 품질 측정 도구입니다. 웹페이지의 성능, 접근성, 모범 사례 준수 등을 종합적으로 분석하여 개선점을 제시합니다.

### Core Web Vitals란?
Core Web Vitals는 Google이 정의한 사용자 경험의 핵심 지표입니다. 실제 사용자가 웹사이트를 사용할 때 느끼는 경험을 수치화한 것으로, 검색 랭킹에도 영향을 미칩니다.

### 🎯 Lighthouse 주요 카테고리

**Performance (성능)**  
웹페이지의 로딩 속도와 런타임 성능을 평가합니다. 사용자가 페이지를 얼마나 빠르게 볼 수 있고 상호작용할 수 있는지를 측정합니다.

**Accessibility (접근성)**  
장애인을 포함한 모든 사용자가 웹사이트를 사용할 수 있는지를 평가합니다. 스크린 리더 호환성, 키보드 탐색, 색상 대비 등을 검사합니다.

**Best Practices (모범 사례)**  
웹 개발의 일반적인 모범 사례를 얼마나 잘 따르고 있는지 평가합니다. 보안, 최신 표준 사용, 콘솔 에러 등을 확인합니다.

**SEO (검색 엔진 최적화)**  
검색 엔진이 페이지를 얼마나 잘 이해하고 인덱싱할 수 있는지를 평가합니다. 메타 태그, 구조화된 데이터 등을 검사합니다.

**PWA (Progressive Web App)**  
웹사이트가 앱과 같은 경험을 제공하는지 평가합니다. 오프라인 작동, 설치 가능성 등을 확인합니다.

### 📊 Core Web Vitals 핵심 메트릭

**LCP (Largest Contentful Paint)**  
*"페이지의 주요 콘텐츠가 얼마나 빨리 보이는가"*

사용자가 페이지에 접속했을 때 가장 중요한 콘텐츠(보통 큰 이미지나 텍스트 블록)가 화면에 나타나는 시간을 측정합니다. 사용자가 "페이지가 로드되었다"고 느끼는 시점을 나타냅니다.

**INP (Interaction to Next Paint)**  
*"사용자 상호작용에 얼마나 빨리 반응하는가"*

사용자가 버튼을 클릭하거나 입력을 할 때, 그 반응이 화면에 나타나기까지의 시간을 측정합니다. 페이지가 얼마나 반응적이고 부드럽게 동작하는지를 나타냅니다.

**CLS (Cumulative Layout Shift)**  
*"페이지 레이아웃이 얼마나 안정적인가"*

페이지가 로드되는 동안 요소들이 예상치 못하게 움직이는 정도를 측정합니다. 사용자가 읽고 있는 중에 텍스트가 갑자기 이동하거나, 클릭하려던 버튼이 다른 곳으로 이동하는 등의 불편함을 방지합니다.

### 🔍 기타 성능 지표

**FCP (First Contentful Paint)**  
페이지에서 첫 번째 콘텐츠(텍스트, 이미지 등)가 나타나는 시간입니다. 사용자가 "뭔가 일어나고 있다"고 느끼는 첫 순간을 나타냅니다.

**TTI (Time to Interactive)**  
페이지가 완전히 상호작용 가능한 상태가 되는 시간입니다. 모든 요소가 제대로 작동하고 사용자 입력에 빠르게 응답할 수 있는 시점을 의미합니다.

**TBT (Total Blocking Time)**  
페이지가 로드되는 동안 메인 스레드가 차단되어 사용자 입력에 응답할 수 없었던 총 시간입니다. 이 시간이 길수록 페이지가 느리게 느껴집니다.

---
