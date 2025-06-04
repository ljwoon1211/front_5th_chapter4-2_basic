
const lazyImageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // data-src에 저장된 실제 이미지 URL을 src로 옮김
      img.classList.remove('lazy-image'); // 로드 후 클래스 제거 
      // img.removeAttribute('data-src'); // data-src 속성 제거 
      observer.unobserve(img); // 이미지가 로드되면 더 이상 관찰하지 않음
    }
  });
});

const productsContainer = document.querySelector('#all-products .container');

function showLoadingIndicator() {
  if (productsContainer) {
    productsContainer.innerHTML = '<p class="loading-message">로딩 중...</p>';
  }
}

function showErrorIndicator(message) {
  if (productsContainer) {
    productsContainer.innerHTML = `<p class="error-message">상품을 불러오는데 실패했습니다. (오류: ${message})</p>`;
  }
}


async function loadProducts() {
  const CACHE_KEY = 'products_cache';
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 캐시 유효 기간: 5분

  const cachedItem = localStorage.getItem(CACHE_KEY);
  if (cachedItem) {
    const { products, timestamp } = JSON.parse(cachedItem);
    if (Date.now() - timestamp < CACHE_DURATION_MS) {
      displayProducts(products);
      return; // 캐시된 데이터 사용하고 함수 종료
    } else {
      localStorage.removeItem(CACHE_KEY); // 유효 기간 지난 캐시 삭제
    }
  }

  showLoadingIndicator();

  // 2. 요청 타임아웃 설정
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.error('API 요청 시간 초과');
  }, 5000); // 5초 타임아웃

  try {
    const response = await fetch("https://fakestoreapi.com/products", { //
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      products: products,
      timestamp: Date.now()
    }));

    displayProducts(products);

  } catch (error) {
    const errorMessage = error.name === 'AbortError' ? '요청 시간 초과' : error.message;
    console.error('상품 로딩 실패:', errorMessage);
    showErrorIndicator(errorMessage);
  }
}

function displayProducts(products) {
  if (!productsContainer) return;
  // Find the container where products will be displayed
  productsContainer.innerHTML = '';

  // Iterate over each product and create the HTML structure safely
  products.forEach((product, index) => {
    // Create the main product div
    const productElement = document.createElement('div');
    productElement.classList.add('product');

    // Create the product picture div
    const pictureDiv = document.createElement('div');
    pictureDiv.classList.add('product-picture');
    const img = document.createElement('img');

    // --- 지연 로딩을 위한 수정 ---
    img.dataset.src = product.image;
    img.classList.add('lazy-image');

    img.alt = `product: ${product.title}`;
    img.width = 250;

    // 이미지 3개는 즉시 로드
    if (index < 3) {
      img.src = product.image;
      img.classList.remove('lazy-image');
    } else {
      lazyImageObserver.observe(img);
    }

    pictureDiv.appendChild(img);

    // Create the product info div
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('product-info');

    const category = document.createElement('h5');
    category.classList.add('categories');
    category.textContent = product.category;

    const title = document.createElement('h4');
    title.classList.add('title');
    title.textContent = product.title;

    const price = document.createElement('h3');
    price.classList.add('price');
    const priceSpan = document.createElement('span');
    priceSpan.textContent = `US$ ${product.price}`;
    price.appendChild(priceSpan);

    const button = document.createElement('button');
    button.textContent = 'Add to bag';

    // Append elements to the product info div
    infoDiv.appendChild(category);
    infoDiv.appendChild(title);
    infoDiv.appendChild(price);
    infoDiv.appendChild(button);

    // Append picture and info divs to the main product element
    productElement.appendChild(pictureDiv);
    productElement.appendChild(infoDiv);

    // Append the new product element to the container
    productsContainer.appendChild(productElement);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts(); // 이미 로드된 경우 바로 실행
}


