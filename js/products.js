
const lazyImageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // data-src에 저장된 실제 이미지 URL을 src로 옮김
      img.classList.remove('lazy-image'); // 로드 후 클래스 제거 (선택적)
      // img.removeAttribute('data-src'); // data-src 속성 제거 (선택적)
      observer.unobserve(img); // 이미지가 로드되면 더 이상 관찰하지 않음
    }
  });
});

async function loadProducts() {
  const response = await fetch("https://fakestoreapi.com/products");
  const products = await response.json();
  displayProducts(products);
}

function displayProducts(products) {

  // Find the container where products will be displayed
  const container = document.querySelector('#all-products .container');


  // Iterate over each product and create the HTML structure safely
  products.forEach(product => {
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
    container.appendChild(productElement);
  });
}

loadProducts();

// Simulate heavy operation. It could be a complex price calculation.
// for (let i = 0; i < 10000000; i++) {
//   const temp = Math.sqrt(i) * Math.sqrt(i);
// }

