function showTopBarWithAnimation() {
  const country = "France";
  const vat = 20;
  const countryBarElement = document.querySelector("section.country-bar");

  if (countryBarElement) {
    countryBarElement.innerHTML = `<p>Orders to <b>${country}</b> are subject to <b>${vat}%</b> VAT</p>`;
    if (countryBarElement.classList.contains('hidden')) {
      countryBarElement.classList.remove('hidden');
    }
    countryBarElement.classList.add('visible-with-css-delay');
  }
}

// DOM이 완전히 로드된 후 함수를 실행합니다.
document.addEventListener('DOMContentLoaded', showTopBarWithAnimation);



