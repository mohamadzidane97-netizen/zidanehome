

document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const carousel = wrapper.querySelector('.carousel');
    const leftBtn = wrapper.querySelector('.carousel-btn.left');
    const rightBtn = wrapper.querySelector('.carousel-btn.right');

    const cardWidth = carousel.querySelector('.product-card').offsetWidth + 20; // 20px gap

    let scrollPosition = 0;

    rightBtn.addEventListener('click', () => {
        scrollPosition += cardWidth; 
        if(scrollPosition > carousel.scrollWidth - wrapper.offsetWidth){
            scrollPosition = carousel.scrollWidth - wrapper.offsetWidth;
        }
        carousel.style.transform = `translateX(-${scrollPosition}px)`;
    });

    leftBtn.addEventListener('click', () => {
        scrollPosition -= cardWidth;
        if(scrollPosition < 0) scrollPosition = 0;
        carousel.style.transform = `translateX(-${scrollPosition}px)`;
    });
});
