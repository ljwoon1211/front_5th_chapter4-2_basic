# 바닐라 JS 프로젝트 성능 개선
- url: https://front-5th-chapter4-2basic.web.app/

## 성능 개선 보고서
성능 개선 보고서
초기 성능 측정 결과
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
